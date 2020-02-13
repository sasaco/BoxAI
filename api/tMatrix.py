
from numpy import *

class tMatrix:

    def __init__(self, i_xyz, j_xyz, theta):
        x1= i_xyz[0]
        y1= i_xyz[1]
        z1= i_xyz[2]

        x2= j_xyz[0]
        y2= j_xyz[1]
        z2= j_xyz[2]

        xx = x2-x1
        yy = y2-y1
        zz = z2-z1
        el = sqrt(xx**2+yy**2+zz**2)
        ll=xx/el
        mm=yy/el
        nn=zz/el

        t1      = zeros([3,3],dtype=float64)
        t2      = zeros([3,3],dtype=float64)
        theta   = radians(theta)               # chord angle
        t1[0,0] = 1
        t1[1,1] = cos(theta)
        t1[1,2] = sin(theta)
        t1[2,1] =-sin(theta)
        t1[2,2] = cos(theta)
        if x2-x1==0.0 and y2-y1==0.0:
            t2[0,2]=nn
            t2[1,0]=nn
            t2[2,1]=1.0
        else:
            qq=sqrt(ll**2+mm**2)
            t2[0,0]=ll
            t2[0,1]=mm
            t2[0,2]=nn
            t2[1,0]=-mm/qq
            t2[1,1]= ll/qq
            t2[2,0]=-ll*nn/qq
            t2[2,1]=-mm*nn/qq
            t2[2,2]=qq
        self.t3=dot(t1,t2)

    def get_world_vector(self, vector):

        result =  dot(self.t3.T,vector)

        return result


    def get_member_vector(self, vector):

        result =  dot(self.t3,vector)

        return result

