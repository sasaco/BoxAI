
import numpy as np
import json
from collections import OrderedDict
import copy
from tMatrix import tMatrix
import time

class inpData:

    def readTestData(self):
        fnameR= 'inp_grid.json'
        f = open(fnameR)
        fstr = f.read()  # ファイル終端まで全て読んだデータを返す
        f.close()
        self.setJSON(fstr)

    def setJSON(self, fstr):

        js = json.loads(fstr, object_pairs_hook=OrderedDict) 

        self.username = js['username']
        self.password = js['password']

        # ケースによって変わらないパラメータを取得
        ## 節点
        self.node        = js['node']
        ### 少数3桁にラウンド
        for ID in self.node:
            n = self.node[ID]
            n['x'] = round(n['x'],3)
            n['y'] = round(n['y'],3)
            n['z'] = round(n['z'],3)
        self.org_node = copy.deepcopy(self.node)

        ## 部材
        if 'member' in js:
            self.member      = js['member']
            # 型をstring に 統一する, 部材長さを計算しておく
            for ID in self.member:
                m = self.member[ID]
                m['ni'] = str(m['ni'])
                m['nj'] = str(m['nj'])
                m['e'] = str(m['e'])
                m['L'] = self.GetLength(ID)
                m['xi'] = 1
                m['yi'] = 1
                m['zi'] = 1
                m['xj'] = 1
                m['yj'] = 1
                m['zj'] = 1
                m['cg'] = m['cg'] if 'cg' in m else 0
        self.org_member = copy.deepcopy(self.member)

        ## 着目点
        self.notice_points = [] 
        if 'notice_points' in js:
            self.notice_points = js['notice_points']
            ### 少数3桁にラウンド
            for nc in self.notice_points:
                nc['m'] = str(nc['m'])
                ps = nc['Points']
                for i in range( len(ps)):
                    ps[i] = round(float(ps[i]),3)
        self.org_notice_points = copy.deepcopy(self.notice_points)


        # ケースによって変わるパラメータを取得
        ## 材料
        self.org_element = []
        if 'element' in js:
            self.org_element = js['element']

        ## 支点
        self.org_fix_node = []
        if 'fix_node' in js: 
            self.org_fix_node = js['fix_node'] 
            ### 型をstring に 統一する
            for fix_node in self.org_fix_node.values():
                for fn in fix_node:
                    fn['n'] = str(fn['n'])

        ## バネ
        self.org_fix_member = []
        if 'fix_member' in js: 
            self.org_fix_member = js['fix_member']
            ### 型をstring に 統一する
            for fix_member in self.org_fix_member.values():
                for fm in fix_member:
                    fm['m'] = str(fm['m'])

        ## 結合
        self.org_joint = []
        if 'joint' in js: 
            self.org_joint = js['joint']
            ### 型をstring に 統一する
            for joint in self.org_joint.values():
                for jo in joint:
                    jo['m'] = str(jo['m'])

        ## 荷重
        n = 0
        self.org_load = []
        if 'load' in js: 
            self.org_load = js['load']
            ### 型を 統一する
            for load in self.org_load.values():
                load['fix_node']   = str(load['fix_node'])   if 'fix_node'   in load else '1' 
                load['fix_member'] = str(load['fix_member']) if 'fix_member' in load else '1' 
                load['element']    = str(load['element'])    if 'element'    in load else '1' 
                load['joint']      = str(load['joint'])      if 'joint'      in load else '1' 
                if 'load_node' in load: 
                   load_node =load['load_node']
                   for ln in load_node:
                        ln['n'] = str(ln['n'])
                if 'load_member' in load:
                   load_member = load['load_member']
                   for lm in load_member:
                        lm['m'] = str(lm['m'])
                        lm['L1'] = round(float(lm['L1']),3)
                        lm['L2'] = round(float(lm['L2']),3)
                        lm['P1'] = float(lm['P1'])
                        lm['P2'] = float(lm['P2'])               
                n += 1


        #解析用変数をセット
        self.caseCount = n
        self.nod  = 2   # Number of nodes per member
        self.nfree= 6   # Degree of freedom per node



    # 分布荷重など変換処理を行ない解析できる状態にする 
    def setPalam(self, icase):

        keys = list(self.org_load)
        self.caseName = keys[icase]

        target_load = self.org_load[self.caseName]

        self.node = copy.deepcopy(self.org_node)
        self.member = copy.deepcopy(self.org_member)

        self.element = []
        if 'element' in target_load: 
            element_no = target_load['element']
            if element_no in self.org_element:
                self.element = self.org_element[element_no]
            else:
                raise Exception('error - element no not found')


        self.fix_node = []
        if 'fix_node' in target_load: 
            fix_node_no = target_load['fix_node']
            if fix_node_no in self.org_fix_node:
                self.fix_node = self.org_fix_node[fix_node_no]


        self.fix_member = []
        if 'fix_member' in target_load: 
            fix_member_no = target_load['fix_member']
            if fix_member_no in self.org_fix_member:
                self.fix_member = self.org_fix_member[fix_member_no]


        if 'joint' in target_load: 
            joint_no = target_load['joint']
            if joint_no in self.org_joint:
                joint = self.org_joint[joint_no]
                for jo in joint:
                    no = jo['m']
                    if no in self.member:
                        m = self.member[no]
                        m['xi'] = jo['xi'] if 'xi' in jo else 1
                        m['yi'] = jo['yi'] if 'yi' in jo else 1
                        m['zi'] = jo['zi'] if 'zi' in jo else 1
                        m['xj'] = jo['xj'] if 'xj' in jo else 1
                        m['yj'] = jo['yj'] if 'yj' in jo else 1
                        m['zj'] = jo['zj'] if 'zj' in jo else 1
                    else:
                        raise Exception('error - member no not found in joint data')


        self.load_node = []
        if 'load_node' in target_load: 
            self.load_node = target_load['load_node']


        self.load_member = [] 
        if 'load_member' in target_load: 
            self.load_member = target_load['load_member']


        # 支点条件を整理し解析用変数にセットする
        self.mpfix = OrderedDict()
        self.set_node_fix()

        ### 着目点を追加し解析用変数にセットする
        self.notice_node_names = OrderedDict()  
        self.notice_points = copy.deepcopy(self.org_notice_points)
        self.set_member_notice_points()

        ## 着目点を追加した状態で保存 default
        self.def_node = copy.deepcopy(self.node)
        self.def_member = copy.deepcopy(self.member) 

        # 要素荷重を整理し解析用変数にセットする
        self.fe = OrderedDict()
        self.set_load_member()

        # 解析用変数をセット
        self.nnode   = len(self.node)     # Number of nodes
        self.nmember = len(self.member)   # Number of elements

        self.n = self.nfree*self.nnode



    def set_node_fix(self):
        # treatment of boundary conditions
        for ID in self.node:
            fix = np.zeros([self.nfree], dtype = np.float64)
            for text in self.fix_node:
                if ID == text['n']:
                    fix[0] += float(text['tx']) if 'tx' in text else 0  #fixed in x-direction
                    fix[1] += float(text['ty']) if 'ty' in text else 0  #fixed in y-direction
                    fix[2] += float(text['tz']) if 'tz' in text else 0  #fixed in z-direction
                    fix[3] += float(text['rx']) if 'rx' in text else 0  #fixed in rotation around x-axis
                    fix[4] += float(text['ry']) if 'ry' in text else 0  #fixed in rotation around y-axis
                    fix[5] += float(text['rz']) if 'rz' in text else 0  #fixed in rotation around z-axis
            self.mpfix[ID] = fix

    def GetLength(self, ID):
        target = self.member[ID]
        IDi   = target['ni']
        IDj   = target['nj']
        pi = self.node[IDi]
        pj = self.node[IDj]

        return self.GetDistance(pi, pj)

    def GetDistance(self, pi, pj):
        xx = pj['x']-pi['x']
        yy = pj['y']-pi['y']
        zz = pj['z']-pi['z']
        return np.sqrt(xx**2+yy**2+zz**2)

    def GetMidPoint(self, ID, L1):
        target = self.member[ID]
        IDi   = target['ni']
        IDj   = target['nj']
        pi = self.node[IDi]
        pj = self.node[IDj]

        x1 = pi['x']
        y1 = pi['y']
        z1 = pi['z']

        x2 = pj['x']
        y2 = pj['y']
        z2 = pj['z']

        xx = x2-x1
        yy = y2-y1
        zz = z2-z1
        L= np.sqrt(xx**2+yy**2+zz**2)

        result = OrderedDict()
        n = L1 / L

        result['x'] = x1 + (x2 - x1) * n
        result['y'] = y1 + (y2 - y1) * n
        result['z'] = z1 + (z2 - z1) * n

        return result

    def set_member_notice_points(self):

        if len(self.notice_points) < 1: 
            return

        edit_load_flg = True
        while edit_load_flg:
            edit_load_flg = False
            for notice_member in self.notice_points:
                for target_notice_point in notice_member['Points']:
                    notice_node = self.split_member(notice_member['m'], target_notice_point)

                    m = notice_member['m'].replace('+', '')
                    if m in self.notice_node_names:
                        target_notice = self.notice_node_names[m]
                        notice_names = target_notice['Points']
                        notice_names.append(notice_node)
                    else:
                        notice_names = []
                        notice_names.append(notice_node)
                        target_notice = OrderedDict()
                        target_notice['m']=m
                        target_notice['Points']=notice_names
                        self.notice_node_names[m] = target_notice

                    edit_load_flg = True
                    break
                if edit_load_flg == True:
                    break

        for notice_member in self.notice_points:
            if len(notice_member['Points']) > 0:
                raise Exception('error - There can not be any elements left here.')

        self.notice_points = []

    def set_load_member(self):

        if len(self.load_member) < 1: 
            return

        # 荷重 mark 9 は L1, L2 を削除する
        # 荷重 mark 1, 11 は L1とP1 だけにする(L2とP2 は削除する)
        new_load_members = []
        for target_load in self.load_member:

            if target_load['mark'] == 9:
                del target_load['L1']
                del target_load['L2']

            elif target_load['mark'] == 1 or target_load['mark'] == 11:
                if target_load['P2'] != 0:
                    new_load_member = copy.deepcopy(target_load)
                    new_load_member['L1'] = target_load['L2']
                    new_load_member['P1'] = target_load['P2']
                    del new_load_member['L2']
                    del new_load_member['P2']
                    new_load_members.append(new_load_member)
                del target_load['L2']
                del target_load['P2']

        for new_load_member in new_load_members:
            self.load_member.append(new_load_member)
 
        # L1がi端かj端の 荷重 mark 1, 11 を節点荷重に直す
        self.set_load_mk111()

        # 荷重 L1, L2 の位置で部材を分割する
        edit_load_flg = True
        while edit_load_flg:
            edit_load_flg = False
            for target_load in self.load_member:
                if 'L1' in target_load:
                    if target_load['L1'] > 0:
                        self.split_member(target_load['m'], target_load['L1'])
                        edit_load_flg = True
                        break
                if 'L2' in target_load:
                    if target_load['L2'] > 0:
                        L = self.member[target_load['m']]['L']
                        self.split_member(target_load['m'], L - target_load['L2'])
                        edit_load_flg = True
                        break

        # 荷重 mark 1, 11 を節点荷重に直す
        self.set_load_mk111()

        # 荷重 mark 2, 9 を 剛性マトリックスに沿うように変換する
        for target_load in self.load_member:
            if target_load['mark'] == 1 or target_load['mark'] == 11:
                ## この時点で mark 1, 11 は 全て節点荷重に直っているはずです。
                raise Exception('error - At this point mark 1, 11 is a haze that is corrected to the nodal load at all.')

            elif  target_load['mark'] == 2:

                ## この時点で L1やL2に値が残っているのはおかしい
                if target_load['L1'] != 0 or target_load['L2'] != 0:
                    raise Exception('error - It is strange that values remain in L1 and L2.')

                ID = target_load['m']
                load_direct = target_load['direction']
                Pi = target_load['P1']
                Pj = target_load['P2']
                target_member = self.member[ID]
                self.set_load_mk2(ID, load_direct, Pi, Pj, target_member)

            elif  target_load['mark'] == 9:
                self.set_load_mk9(target_load['m'], target_load['P1'])

            else:
                raise Exception('error - unknown load mark {0}'.format(target_load['mark']))

    def set_load_mk111(self):

        del_load_members = []
        for target_load in self.load_member:
            if target_load['mark'] == 1 or target_load['mark'] == 11:
                target_member = self.member[target_load['m']]
                # 荷重 mark 1, 11 で L1 = 0 の時はi端節点荷重に直す
                if target_load['L1'] == 0:
                    if target_load['P1'] != 0:
                        node_id_i = target_member['ni']
                        self.set_load_mk111_node(node_id_i, target_load['direction'], target_load['P1'], target_member, target_load['mark'] )
                    del_load_members.append(target_load)

                # 荷重 mark 1, 11 で L1 = 部材長さ の時はj端節点荷重に直す
                if target_load['L1'] == target_member['L']:
                    if target_load['P1'] != 0:
                        node_id_j = target_member['nj']
                        self.set_load_mk111_node(node_id_j, target_load['direction'], target_load['P1'], target_member, target_load['mark'] )
                    del_load_members.append(target_load)

        #節点荷重に換算し終えた部材荷重を削除する。
        for del_load_member in del_load_members:
            self.load_member.remove(del_load_member)

    def set_load_mk111_node(self, target_node_ID, load_direct, load_value, target_member, mk=1):

        if load_value == 0:
            return

        if load_direct == "gx":
            new_load_node = [] 
            new_load_node['n'] = target_node_ID
            new_load_node['tx'] = load_value if mk==1 else 0
            new_load_node['ty'] = 0
            new_load_node['tz'] = 0
            new_load_node['rx'] = load_value if mk==11 else 0
            new_load_node['ry'] = 0
            new_load_node['rz'] = 0
            self.load_node.append(new_load_node)

        elif load_direct == "gy":
            new_load_node = [] 
            new_load_node['n'] = target_node_ID
            new_load_node['tx'] = 0
            new_load_node['ty'] = load_value if mk==1 else 0
            new_load_node['tz'] = 0
            new_load_node['rx'] = 0
            new_load_node['ry'] = load_value if mk==11 else 0
            new_load_node['rz'] = 0
            self.load_node.append(new_load_node)

        elif load_direct == "gz":
            new_load_node = [] 
            new_load_node['n'] = target_node_ID
            new_load_node['tx'] = 0
            new_load_node['ty'] = 0
            new_load_node['tz'] = load_value if mk==1 else 0
            new_load_node['rx'] = 0
            new_load_node['ry'] = 0
            new_load_node['rz'] = load_value if mk==11 else 0
            self.load_node.append(new_load_node)

        else:
            # 部材の角度を計算する
            pi = self.node[str(target_member['ni'])]
            pj = self.node[str(target_member['nj'])]
            t = tMatrix([pi['x'],pi['y'],pi['z']],[pj['x'],pj['y'],pj['z']], target_member['cg'])

            # 荷重を絶対座標に換算する
            if load_direct == "x":
                re = t.get_world_vector([load_value,0,0])
            elif load_direct == "y":
                re = t.get_world_vector([0,load_value,0])
            elif load_direct == "z":
                re = t.get_world_vector([0,0,load_value])

            # 節点荷重を登録
            new_load_node = OrderedDict()
            new_load_node['n'] = target_node_ID
            new_load_node['tx'] = re[0] if mk==1 else 0
            new_load_node['ty'] = re[1] if mk==1 else 0
            new_load_node['tz'] = re[2] if mk==1 else 0
            new_load_node['rx'] = re[0] if mk==11 else 0
            new_load_node['ry'] = re[1] if mk==11 else 0
            new_load_node['rz'] = re[2] if mk==11 else 0
            self.load_node.append(new_load_node)

    def set_load_mk9(self, ID, P1):

        le =  self.fe[ID] if ID in self.fe else np.zeros([9], dtype=np.float64) 
        le[8] += P1 # Temperature change of element
        self.fe[ID] = le

    def set_load_mk2(self, ID, load_direct, Pi, Pj, target_member):

        le =  self.fe[ID] if ID in self.fe else np.zeros([9], dtype=np.float64) 

        if load_direct == "x" or str(load_direct) == "1":
            le[0] += Pi # wxi
            le[1] += Pj # wxj 
        elif load_direct == "y" or str(load_direct) == "2":
            le[2] += Pi # wyi
            le[3] += Pj # wyj 
        elif load_direct == "z" or str(load_direct) == "3":
            le[4] += Pi # wzi
            le[5] += Pj # wzj 
        elif load_direct == "r" or str(load_direct) == "4":
            le[6] += Pi # wri
            le[7] += Pj # wrj 
        else:
            IDi   = target_member['ni']
            IDj   = target_member['nj']
            pi = self.node[IDi]
            pj = self.node[IDj]
            t = tMatrix([pi['x'],pi['y'],pi['z']],[pj['x'],pj['y'],pj['z']], target_member['cg'])

            if load_direct == "gx" or str(load_direct) == "5":
                Pii = t.get_member_vector([Pi,0,0])
                Pjj = t.get_member_vector([Pj,0,0])
            elif load_direct == "gy" or str(load_direct) == "6":
                Pii = t.get_member_vector([0,Pi,0])
                Pjj = t.get_member_vector([0,Pj,0])
            elif load_direct == "gz" or str(load_direct) == "7":
                Pii = t.get_member_vector([0,0,Pi])
                Pjj = t.get_member_vector([0,0,Pj])

            le[0] += Pii[0] # wxi
            le[1] += Pjj[0] # wxj 
            le[2] += Pii[1] # wyi
            le[3] += Pjj[1] # wyj 
            le[4] += Pii[2] # wzi
            le[5] += Pjj[2] # wzj 

        self.fe[ID] = le

    def split_member(self, target_member_id, split_distance):

        target_member = self.member[target_member_id]

        # 分割点が0より小さければ何もしない
        if split_distance <= 0:
            raise Exception('error - There was a divide instruction smaller than 0 for element number {0}'.format(target_member_id))
            return

        # 分割点が部材長さより長ければ何もしない
        if target_member['L'] < split_distance:
            raise Exception('error - There was a divide instruction {0} larger than the element length {1} for element number {2}'.format(split_distance, target_member['L'], target_member_id))
            return

        # 既存の点
        node_id_i = target_member['ni']
        node_id_j = target_member['nj']

        # 新しい点を用意する
        split_point = self.GetMidPoint(target_member_id, split_distance)

        # 新しい部材番号を用意する
        new_member_id = target_member_id + '+'
        while new_member_id in self.member:
            new_member_id += '+'

        # 新しい点(分割点)番号を用意する
        split_point_id = new_member_id

        # 新しい点(分割点)を登録
        self.node[split_point_id] = split_point

        # 新しい 要素を作成
        new_member = copy.deepcopy(target_member)
        new_member['ni'] = split_point_id
        new_member['nj'] = node_id_j
        new_member['L'] = self.GetDistance(self.node[split_point_id], self.node[node_id_j])   # = target_member['L'] - split_distance
        ## 結合条件
        new_member['xi'] = 1
        new_member['yi'] = 1
        new_member['zi'] = 1

        # 新しい 要素を登録
        self.member[new_member_id] = new_member

        # 親部材のj端をつなぎかえる
        target_member['nj'] = split_point_id
        target_member['L'] = self.GetDistance(self.node[node_id_i],self.node[split_point_id]) # = split_distance
        ## 結合条件
        target_member['xj'] = 1
        target_member['yj'] = 1
        target_member['zj'] = 1


        # 要素バネの入力をコピー登録
        if target_member_id in self.fix_member:
            self.fix_member[new_member_id] = self.fix_member[target_member_id]


        # 分布荷重の入力を直す
        new_load_member = []
        for target_load in self.load_member:

            if target_member_id != target_load['m']:
                continue

            # 既存の部材荷重の入力を直す
            if target_load['mark'] == 2:
                if int(target_load['L1']*1000) >= int(split_distance*1000):
                    ## new_member にのみ載荷する荷重
                    ## 荷重を付け替える
                    target_load['m'] = new_member_id
                    target_load['L1'] = round(target_load['L1'] - split_distance, 3)

                elif int(target_load['L2']*1000) >= int(new_member['L']*1000):
                    ## target_member にのみ載荷する荷重
                    target_load['L2'] = round(target_load['L2'] - new_member['L'], 3)

                else:
                    ## target_memberとnew_member にまたがって載荷する荷重
                    new_load = copy.deepcopy(target_load)
                    # 既存の分布荷重の中間値を計算する
                    P1 = target_load['P1'] 
                    P2 = target_load['P2'] 
                    L1 = target_load['L1'] 
                    L2 = target_load['L2']
                    Li = target_member['L'] 
                    Lj = new_member['L'] 
                    LL = Li + Lj
                    split_point_P = P1 + ( P2 - P1 ) / ( LL - L1 - L2 ) * ( Li - L1 )

                    ## target_member の荷重を修正する
                    target_load['L2'] = 0
                    target_load['P2'] = split_point_P

                    ## new_member の荷重を追加する
                    new_load['m'] = new_member_id
                    new_load['L1'] = 0
                    new_load['P1'] = split_point_P

                    new_load_member.append(new_load)

            elif target_load['mark'] == 9:
                    new_load = copy.deepcopy(target_load)
                    new_load['m'] = new_member_id
                    new_load_member.append(new_load)

            else:
                if int(target_load['L1']*1000) >= int(split_distance*1000):
                    ## new_member にのみ載荷する荷重
                    ## 荷重を付け替える
                    target_load['m'] = new_member_id
                    target_load['L1'] = round(target_load['L1'] - split_distance, 3)
 

        for new_load in new_load_member:
            self.load_member.append(new_load)


        # 着目点の入力を直す
        new_notice_points = []
        del_notice_points = []
        for target_notice_points in self.notice_points:

            if target_member_id != target_notice_points['m']:
                continue
            
            for target_notice_point in target_notice_points['Points']:

                if split_distance == target_notice_point:
                    del_notice_points.append(target_notice_point)

                elif split_distance < target_notice_point:
                    new_notice_points.append(target_notice_point - split_distance)
                    del_notice_points.append(target_notice_point)

            for del_notice_point in del_notice_points:
                target_notice_points['Points'].remove(del_notice_point)

        if len(new_notice_points) > 0:
            tmp_notice_points = OrderedDict()
            tmp_notice_points['m'] = new_member_id
            tmp_notice_points['Points'] = new_notice_points
            self.notice_points.append(tmp_notice_points)

        return new_member_id
