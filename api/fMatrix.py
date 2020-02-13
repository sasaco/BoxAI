
import numpy as np
from kMatrix   import kMatrix
from collections import OrderedDict
import copy


class fMatrix:

    def __init__(self, inp):

        self.fp = np.zeros(inp.n, dtype=np.float64) # External force vector

        lp = 0        
        for ID in inp.node:
            #temp = np.zeros([inp.nfree], dtype=np.float64)
            for text in inp.load_node:
                if ID == str(text['n']):
                    self.fp[6*lp+0] += float(text['tx']) if 'tx' in text else 0  # load in x-direction
                    self.fp[6*lp+1] += float(text['ty']) if 'ty' in text else 0  # load in y-direction
                    self.fp[6*lp+2] += float(text['tz']) if 'tz' in text else 0  # load in z-direction
                    self.fp[6*lp+3] += float(text['rx']) if 'rx' in text else 0  # moment around x-axis
                    self.fp[6*lp+4] += float(text['ry']) if 'ry' in text else 0  # moment around y-axis
                    self.fp[6*lp+5] += float(text['rz']) if 'rz' in text else 0  # moment around z-axis
            lp += 1

        self.org_fp = copy.deepcopy(self.fp)

        self.wfe_l = OrderedDict()
        self.wfe   = OrderedDict()
        self.tfe_l = OrderedDict()
        self.tfe   = OrderedDict()

    def set_fMatrix(self, k):
        tt    = k.tt

        wfe_l = self.WBUNPU_3DFRM(k)
        wfe   = np.dot(tt.T, wfe_l)    # Thermal load vector in global coordinate

        ### ピン結合を考慮した分布荷重を換算 #####
        # x軸回り曲げモーメント（ねじりモーメント）
        if k.k1x ==0: # i端ピン結合
            self.set_pin(wfe, k, 3)
        if k.k2x ==0: # j端ピン結合
            self.set_pin(wfe, k, 9)
        # y軸回り曲げモーメント
        if k.k1y ==0: # i端ピン結合
            self.set_pin(wfe, k, 4)
        if k.k2y ==0: # j端ピン結合
            self.set_pin(wfe, k, 10)
        # z軸回り曲げモーメント
        if k.k1z ==0: # i端ピン結合
            self.set_pin(wfe, k, 5)
        if k.k2z ==0: # j端ピン結合
            self.set_pin(wfe, k, 11)

        wfe_l = np.dot(tt, wfe) 

        tfe_l = self.TFVEC_3DFRM(k)
        tfe   = np.dot(tt.T, tfe_l)    # Thermal load vector in global coordinate

        for i in range(0,12):
            it = k.ir[i]
            self.fp[it] += wfe[i] + tfe[i]

        self.wfe_l[k.ID] = wfe_l
        self.wfe[k.ID]   = wfe

        self.tfe_l[k.ID] = tfe_l
        self.tfe[k.ID]   = tfe

        return 



    def WBUNPU_3DFRM(self, k):
        wfe_l = np.zeros(12,dtype=np.float64)
        el    = k.el 

        # 軸力（x軸方向力）
        if k.tx == 0:
            wfe_l[0]  =  el/6 * (2 * k.wxi + k.wxj)
            wfe_l[6]  =  el/6 * (k.wxi + 2 * k.wxj)
        else:
            wfe_l[0] ,wfe_l[6]  =  self.set_wx(k.tx, k.EA, el, k.wxi, k.wxj)

        # x軸回りモーメント（ねじりモーメント）
        if k.tr == 0:
            wfe_l[3]  =  el/6 * (2 * k.wti + k.wtj)
            wfe_l[9]  =  el/6 * (k.wti + 2 * k.wtj)
        else:
            wfe_l[3] ,wfe_l[9]  =  self.set_wx(k.tr, k.GJ, el, k.wti, k.wtj)

        if k.ty == 0:
            # y軸方向せん断力
            wfe_l[1]  =  el/20 * (7 * k.wyi + 3 * k.wyj)
            wfe_l[7]  =  el/20 * (3 * k.wyi + 7 * k.wyj)
            # z軸回り曲げモーメント
            wfe_l[5]  = (el**2)/60 * (3 * k.wyi + 2 * k.wyj)
            wfe_l[11] = -(el**2)/60 * (2 * k.wyi + 3 * k.wyj)
        else:
            wfe_l[1], wfe_l[7], wfe_l[5], wfe_l[11] =  self.set_wy(k.ty, k.EIz, el, k.wyi, k.wyj)
            wfe_l[11] = -wfe_l[11] 

        if k.tz == 0:
            # z軸方向せん断力
            wfe_l[2]  =  el/20 * (7 * k.wzi + 3 * k.wzj)
            wfe_l[8]  =  el/20 * (3 * k.wzi + 7 * k.wzj)
            # y軸回り曲げモーメント
            wfe_l[4]  = -(el**2)/60 * (3 * k.wzi + 2 * k.wzj)
            wfe_l[10] = (el**2)/60 * (2 * k.wzi + 3 * k.wzj)
        else:
            wfe_l[2], wfe_l[8], wfe_l[4], wfe_l[10] =  self.set_wy(k.tz, k.EIy, el, k.wzi, k.wzj)
            wfe_l[4] = -wfe_l[4]


        return wfe_l


    def TFVEC_3DFRM(self, k):
        # Thermal load vector  in local coordinate system
        tfe_l    = np.zeros(12,dtype=np.float64)
        i        = k.iNo  
        j        = k.jNo 
        E        = k.ee    # elastic modulus
        AA       = k.aa    # section area
        alpha    = k.alpha # thermal expansion coefficient
        tempe    = k.wte   # 0.5*(self.inp.deltaT[i]+self.inp.deltaT[j])
        tfe_l[0] =-E*AA*alpha*tempe
        tfe_l[6] = E*AA*alpha*tempe
        return tfe_l


    # 軸方向のバネが付いた部材の分布荷重
    def set_wx(self, K2, EA, L1, P8, P9):

        D2 = np.sqrt(K2 / EA)
        E0 = np.exp(L1 * D2)
        Q4 = (E0 + 1 / E0) / 2
        Q5 = (E0 - 1 / E0) / 2

        W6 = P8
        W7 = P9

        n = 19
        if L1 > 6:
            n = 19
        elif L1 > 4:
            n = 15
        elif L1 > 3:
            n = 9
        elif L1 > 2:
            n = 7
        elif L1 > 1.2:
            n = 5
        else:
            n = 3
        D = L1 / (n+1)

        for i in range(n):
            j = i + 1
            X =  j * D
            P7 = (P9 - P8) / L1 * X + P8
            E0 = np.exp((L1 - X) * D2)
            Q6 = (E0 + 1 / E0) / 2
            Q7 = (E0 - 1 / E0) / 2
            W1 = 1 / Q5 * Q7 * P7
            W2 = (Q6 - Q4 / Q5 * Q7) * P7

            if j % 2 == 0:
                W6 = W6 + 2 * W1
                W7 = W7 + 2 * W2
            else:
                W6 = W6 + 4 * W1
                W7 = W7 + 4 * W2

        W6 = W6 * D / 3
        W7 = W7 * D / 3

        return W6, W7


    # 軸直角方向のバネが付いた部材の分布荷重
    def set_wy(self, K1, EI, L1, P8, P9):

        D1 = (K1 / (4 * EI))**0.25
        W1 = L1 * D1
        E0 = np.exp(W1)
        C4 = (E0 + 1 / E0) / 2
        S4 = (E0 - 1 / E0) / 2
        C5 = np.cos(W1)
        S5 = np.sin(W1)
        Q = S4 * S4 - S5 * S5

        W6 = P8
        W7 = P9
        W8 = 0
        W9 = 0

        n = 19
        if L1 > 6:
            n = 19
        elif L1 > 4:
            n = 15
        elif L1 > 3:
            n = 9
        elif L1 > 2:
            n = 7
        elif L1 > 1.2:
            n = 5
        else:
            n = 3
        D = L1 / (n+1)

        for i in range(n):
            j = i + 1
            X =  j * D
            P7 = (P9 - P8) / L1 * X + P8
            W1 = (L1 - X) * D1
            E0 = np.exp(W1)
            C6 = (E0 + 1 / E0) / 2
            S6 = (E0 - 1 / E0) / 2
            C7 = np.cos(W1)
            S7 = np.sin(W1)
            W1 = X * D1
            E0 = np.exp(W1)
            C8 = (E0 + 1 / E0) / 2
            S8 = (E0 - 1 / E0) / 2
            C9 = np.cos(W1)
            S9 = np.sin(W1)
            W1 = (S4 * (C6 * S9 + S6 * C9) - S5 * (C7 * S8 + S7 * C8)) * P7 / Q
            W2 = (S4 * (C8 * S7 + S8 * C7) - S5 * (C9 * S6 + S9 * C6)) * P7 / Q
            W3 = (S4 * S6 * S9 - S5 * S7 * S8) * P7 / (Q * D1)
            W4 = (S4 * S8 * S7 - S5 * S9 * S6) * P7 / (Q * D1)

            if j % 2 == 0:
                W6 = W6 + 2 * W1
                W7 = W7 + 2 * W2
                W8 = W8 + 2 * W3
                W9 = W9 + 2 * W4
            else:
                W6 = W6 + 4 * W1
                W7 = W7 + 4 * W2
                W8 = W8 + 4 * W3
                W9 = W9 + 4 * W4

        W6 = W6 * D / 3
        W7 = W7 * D / 3
        W8 = W8 * D / 3
        W9 = W9 * D / 3

        return W6, W7, W8, W9

    # ピン結合を考慮した分布荷重の換算関数
    def set_pin(self, wfe_l, k, n):

        ARW = copy.copy(k.gk)
        ARB1 = ARW[n,:]
        B3 = ARB1[n]
        if B3 == 0:
            # 荷重がない
            return wfe_l

        ARB1[n] = 0

        ARF = copy.copy(wfe_l)
        ARF3 = ARF[n]
        ARF[n] = 0

        ART1 = np.zeros([n+1],dtype=np.float64)
        ART2 = np.zeros([n+1],dtype=np.float64)

        for i in range(n+1):
            ART1[i] = ARB1[i] / B3
            ART2[i] = ART1[i] * ARF3
            wfe_l[i] = ARF[i] - ART2[i]

        return wfe_l