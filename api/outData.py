
import numpy as np
import json
from collections import OrderedDict
import copy

class outData:

    def __init__(self, inp, result, gmat, fmat):

        self.inp = inp
        self.disg = result
        self.reac = np.zeros([self.inp.n], dtype=np.float64)  # Section force vector
        self.fsec = np.zeros([12, self.inp.nmember], dtype=np.float64)  # Section force vector
        self.fseg = np.zeros([12, self.inp.nmember], dtype=np.float64)  # Section force vector world

        # recovery of restricted displacements
        keys = list(inp.node)
        for ID in inp.mpfix:
            fix = inp.mpfix[ID]
            i = keys.index(ID)
            for j in range(0,self.inp.nfree):
                value = fix[j]
                iz=i*self.inp.nfree+j
                if value==1:
                    self.disg[iz] =0
                    a = self.reac[iz]
                    b = fmat.org_fp[iz]
                    self.reac[iz] = fmat.org_fp[iz]
                elif value != 0:
                    # バネ値がある場合
                    self.reac[iz] = self.disg[iz]*value

        # calculation of section force
        work =np.zeros(12, dtype=np.float64)         # work vector for section force calculation
        for ne in range(0,self.inp.nmember):

            k = gmat.kmat[ne]

            i     = k.iNo
            j     = k.jNo 
            ek    = k.ek    # Stiffness matrix in local coordinate
            ck    = k.ck    # Stiffness matrix in world coordinate
            tt    = k.tt    # Transformation matrix
            E     = k.ee    # elastic modulus
            AA    = k.aa    # section area
            alpha = k.alpha # thermal expansion coefficient
            tempe = k.wte   #0.5*(self.inp.deltaT[i]+self.inp.deltaT[j])

            work[0]=self.disg[6*i]  ; work[1] =self.disg[6*i+1]; work[2]= self.disg[6*i+2]
            work[3]=self.disg[6*i+3]; work[4] =self.disg[6*i+4]; work[5]= self.disg[6*i+5]
            work[6]=self.disg[6*j]  ; work[7] =self.disg[6*j+1]; work[8]= self.disg[6*j+2]
            work[9]=self.disg[6*j+3]; work[10]=self.disg[6*j+4]; work[11]=self.disg[6*j+5]


            #全体座標系の断面力 --------------------------------------------
            self.fseg[:,ne]=np.dot(ck,work)

            # 分布荷重を換算した分を減じる
            wfe = fmat.wfe[k.ID]
            tfe = fmat.tfe[k.ID]
            for index in range(0, 12):
                self.fseg[index,ne] -= wfe[index]
                # 温度荷重を換算した分を減じる
                self.fseg[index,ne] -= tfe[index]

            # i端の反力
            if k.IDi in inp.mpfix:
                fix = inp.mpfix[k.IDi]
                for a in range(0,self.inp.nfree):
                    value = fix[a]
                    iz=i*self.inp.nfree+a
                    if value==1:
                        self.reac[iz] -= self.fseg[a ,ne]
            # j端の反力
            if k.IDj in inp.mpfix:
                fix = inp.mpfix[k.IDj]
                for a in range(0,self.inp.nfree):
                    value = fix[a]
                    iz=j*self.inp.nfree+a
                    if value==1:
                        self.reac[iz] -= self.fseg[self.inp.nfree+a ,ne]


            #要素座標系の断面力 ---------------------------------------------
            self.fsec[:,ne]=np.dot(tt,self.fseg[:,ne])
            #self.fsec[:,ne]=np.dot(ek,np.dot(tt,work))

            ## 分布荷重を換算した分を減じる
            #wfe = fmat.wfe_l[k.ID]
            #tfe = fmat.tfe_l[k.ID]
            #for index in range(0, 12):
            #    self.fsec[index,ne] -= wfe[index]
            #    # 温度荷重を換算した分を減じる
            #    self.fsec[index,ne] -= tfe[index]

            # j端だけ マイナスを乗じる・・・??? Frame-G と答えを合せてる
            for index in range(0, 3):
                self.fsec[index, ne] *= -1
            for index in range(9, 12):
                self.fsec[index, ne] *= -1


    def getDictionary(self):

        dict_Json = {}

        keys = list(self.inp.node)

        # 変位
        dict_disg = OrderedDict()
        # オリジナルの入力データにある節点のみ返す
        for id in self.inp.org_node:
            if id in keys:
                i = keys.index(id)
                iz=i*self.inp.nfree
                dict = {
                        "dx":self.disg[iz+0], \
                        "dy":self.disg[iz+1], \
                        "dz":self.disg[iz+2], \
                        "rx":self.disg[iz+3], \
                        "ry":self.disg[iz+4], \
                        "rz":self.disg[iz+5]
                        }
                dict_disg[id] = dict 

        #反力
        dict_reac = OrderedDict()
        # オリジナルの入力データにある節点のみ返す
        for fn in self.inp.fix_node:
            id = fn['n']
            if id in keys:
                i = keys.index(id)
                iz=i*self.inp.nfree
                dict = {
                        "tx":self.reac[iz+0], \
                        "ty":self.reac[iz+1], \
                        "tz":self.reac[iz+2], \
                        "mx":self.reac[iz+3], \
                        "my":self.reac[iz+4], \
                        "mz":self.reac[iz+5]
                        }
                dict_reac[keys[i]] = dict 


        #断面力
        dict_fsec = OrderedDict() # 親：断面力
        keys = list(self.inp.member)

        ## 着目点をまとめた配列(self.inp.notice_node_names)を用意
        for def_id in self.inp.def_member:
            if not def_id in self.inp.notice_node_names:
                notice_member = OrderedDict()
                notice_member['m'] = def_id
                notice_member['Points'] = []
                self.inp.notice_node_names[def_id] = notice_member

        # オリジナルの入力データにある要素のみ返す
        temp_inp_members = copy.deepcopy(self.inp.member)

        for org_id in self.inp.org_member:

            def_member = self.inp.org_member[org_id]
            def_i = def_member['ni'] # スタート
            def_j = def_member['nj'] # エンド
            pi = self.inp.node[def_i] # 基準点(i端)
            
            notice_points = self.inp.notice_node_names[org_id]

            inp_i=def_i
            inp_j=''
            dict1 = OrderedDict()
            dict2 = OrderedDict()
            i = 1
            while def_j != inp_j:
                for inp_id in temp_inp_members:

                    inp_member = temp_inp_members[inp_id]

                    if org_id == inp_id.replace('+','') \
                        and inp_i == inp_member['ni']:

                        ne = keys.index(inp_id)

                        if len(dict2) == 0:
                            dict2['fxi'] = self.fsec[ 0,ne]
                            dict2['fyi'] = self.fsec[ 1,ne]
                            dict2['fzi'] = self.fsec[ 2,ne]
                            dict2['mxi'] = self.fsec[ 3,ne]
                            dict2['myi'] = self.fsec[ 4,ne]
                            dict2['mzi'] = self.fsec[ 5,ne]

                        inp_j = inp_member['nj']
                        Px = 'P' + str(i)

                        if inp_j in notice_points['Points'] \
                            or inp_j == def_j:

                            dict2['fxj'] = self.fsec[ 6,ne]
                            dict2['fyj'] = self.fsec[ 7,ne]
                            dict2['fzj'] = self.fsec[ 8,ne]
                            dict2['mxj'] = self.fsec[ 9,ne]
                            dict2['myj'] = self.fsec[10,ne]
                            dict2['mzj'] = self.fsec[11,ne]

                            pj = self.inp.node[inp_j]
                            dict2['L'] = self.inp.GetDistance(pi,pj)
                            dict1[Px] = dict2

                            dict2 = OrderedDict()
                            i += 1

                        inp_i = inp_member['nj']
                        del temp_inp_members[inp_id]
                        break

                    # end if
                # next for
            # loop             
            dict_fsec[org_id] = dict1
        # next for

        dict_Json['disg'] = dict_disg
        dict_Json['reac'] = dict_reac
        dict_Json['fsec'] = dict_fsec
        return dict_Json
 
