# Meshing of rectangular domain
import numpy as np
import sys
import matplotlib.pyplot as plt
import matplotlib.patches as patches
#(Reference site) http://matthiaseisen.com/matplotlib/

param=sys.argv
aa=float(param[1]) # length in x-direction
bb=float(param[2]) # length in y-direction
nn=int(param[3])   # division number in x-direction
mm=int(param[4])   # division number in y-direction
x0=float(param[5]) # x-coordinate at left bottom of the domain
y0=float(param[6]) # y-coordinate at left bottom of the domain

npoin=(nn+1)*(mm+1)
nele=nn*mm
node=np.zeros([4,nele],dtype=np.int)
x=np.zeros([2,npoin],dtype=np.float64)

k=-1
for i in range(0,mm+1):
    for j in range(0,nn+1):
        k=k+1
        x[0,k]=aa/float(nn)*float(j)+x0
        x[1,k]=bb/float(mm)*float(i)+y0
ne=-1
for k in range(0,mm):
    i0=1+(nn+1)*k
    for j in range(0,nn):
        i=i0+j
        ne=ne+1
        node[0,ne]=i
        node[1,ne]=i+1
        node[2,ne]=node[1,ne]+nn+1
        node[3,ne]=node[2,ne]-1

print('{0:5d} {1:5d}'.format(npoin,nele))
for ne in range(0,nele):
    ss=''
    for i in range(0,4):
        ss=ss+'{0:5d}'.format(node[i,ne])
    ss=ss+'{0:5d}'.format(ne+1)
    print(ss)
for nd in range(0,npoin):
    ss=''
    for i in range(0,2):
        ss=ss+'{0:10.3f}'.format(x[i,nd])
    ss=ss+'{0:5d}'.format(nd+1)
    print(ss)

# Drawing
axmin=np.min(x[0,:])
axmax=np.max(x[0,:])
aymin=np.min(x[1,:])
aymax=np.max(x[1,:])
ra=np.min([axmax-axmin,aymax-aymin])
xmin=axmin-0.2*ra
xmax=axmax+0.2*ra
ymin=aymin-0.2*ra
ymax=aymax+0.2*ra

fnameF='fig_mesh.png'
fig = plt.figure()
ax1=plt.subplot(111)
ax1.set_xlim([xmin,xmax])
ax1.set_ylim([ymin,ymax])
ax1.set_xlabel('x-direction (m)')
ax1.set_ylabel('y-direction (m)')
ax1.spines['right'].set_visible(False)
ax1.spines['top'].set_visible(False)
ax1.yaxis.set_ticks_position('left')
ax1.xaxis.set_ticks_position('bottom')
aspect = (ymax-ymin)/(xmax-xmin)*(ax1.get_xlim()[1] - ax1.get_xlim()[0]) / (ax1.get_ylim()[1] - ax1.get_ylim()[0])
ax1.set_aspect(aspect)

# mesh
for ne in range(0,nele):
    n1=node[0,ne]-1; x1=x[0,n1]; y1=x[1,n1]
    n2=node[1,ne]-1; x2=x[0,n2]; y2=x[1,n2]
    n3=node[2,ne]-1; x3=x[0,n3]; y3=x[1,n3]
    n4=node[3,ne]-1; x4=x[0,n4]; y4=x[1,n4]
    ax1.fill([x1,x2,x3,x4],[y1,y2,y3,y4],facecolor='#ffffcc',edgecolor='#777777',lw=0.5)
# node number
for i in range(0,npoin):
    ax1.add_patch(patches.Circle((x[0,i],x[1,i]),0.05*ra,facecolor='#ffffcc',edgecolor='#777777',lw=0.5))
    ax1.text(x[0,i],x[1,i],str(i+1),ha='center',va='center',fontsize=12,color='#0000ff')
# element number
for ne in range(0,nele):
    n1=node[0,ne]-1; x1=x[0,n1]; y1=x[1,n1]
    n2=node[1,ne]-1; x2=x[0,n2]; y2=x[1,n2]
    n3=node[2,ne]-1; x3=x[0,n3]; y3=x[1,n3]
    n4=node[3,ne]-1; x4=x[0,n4]; y4=x[1,n4]
    x0=0.25*(x1+x2+x3+x4)
    y0=0.25*(y1+y2+y3+y4)
    ax1.text(x0,y0,str(ne+1),ha='center',va='center',fontsize=12,color='#ff0000')

ss='npoin='+str(npoin)+', nele='+str(nele)
ax1.set_title(ss)
plt.savefig(fnameF, bbox_inches="tight", pad_inches=0.2)
plt.show()
