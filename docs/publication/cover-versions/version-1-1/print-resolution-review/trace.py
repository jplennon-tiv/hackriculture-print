"""REJECTED approach, retained as historical evidence only. Use clean_type.py."""
import numpy as np


def contours(field, threshold=.5):
    f = np.pad(field.astype(float), 1)
    a,b,c,d = f[:-1,:-1],f[:-1,1:],f[1:,1:],f[1:,:-1]
    cases=(a>=threshold).astype(int)+2*(b>=threshold)+4*(c>=threshold)+8*(d>=threshold)
    table={1:[(3,0)],2:[(0,1)],3:[(3,1)],4:[(1,2)],5:[(3,0),(1,2)],6:[(0,2)],7:[(3,2)],8:[(2,3)],9:[(2,0)],10:[(0,1),(2,3)],11:[(2,1)],12:[(1,3)],13:[(1,0)],14:[(0,3)]}
    neighbours={};coords={}
    for y,x in zip(*np.where((cases>0)&(cases<15))):
        v=[a[y,x],b[y,x],c[y,x],d[y,x]]
        edgekeys=[('h',int(x),int(y)),('v',int(x+1),int(y)),('h',int(x),int(y+1)),('v',int(x),int(y))]
        starts=[(x,y),(x+1,y),(x,y+1),(x,y)]
        values=[(v[0],v[1]),(v[1],v[2]),(v[3],v[2]),(v[0],v[3])]
        for e1,e2 in table[int(cases[y,x])]:
            k1,k2=edgekeys[e1],edgekeys[e2]
            for e,k in [(e1,k1),(e2,k2)]:
                if k not in coords:
                    lo,hi=values[e];t=(threshold-lo)/(hi-lo)
                    sx,sy=starts[e];coords[k]=[sx-.5+(t if e%2==0 else 0),sy-.5+(t if e%2 else 0)]
            neighbours.setdefault(k1,[]).append(k2);neighbours.setdefault(k2,[]).append(k1)
    result=[]
    while neighbours:
        start=next(iter(neighbours));last=None;cur=start;pts=[]
        while cur in neighbours:
            pts.append(coords[cur]);ns=neighbours.pop(cur)
            nxt=next((p for p in ns if p!=last),start)
            last,cur=cur,nxt
            if cur==start:break
        if len(pts)>=4:result.append(np.array(pts))
    return result


def rdp(p,tol=.22):
    if len(p)<3:return p
    v=p[-1]-p[0];l=np.dot(v,v)
    if l<1e-9:dist=np.linalg.norm(p-p[0],axis=1)
    else:
        t=np.clip((p-p[0])@v/l,0,1)
        dist=np.linalg.norm(p-p[0]-t[:,None]*v,axis=1)
    i=int(np.argmax(dist))
    if dist[i]<=tol:return p[[0,-1]]
    return np.concatenate([rdp(p[:i+1],tol)[:-1],rdp(p[i:],tol)])


def trace(field, min_area=.4, tolerance=.22):
    parts=[];count=0
    for p in contours(field):
        area=abs(np.sum(p[:,0]*np.roll(p[:,1],-1)-p[:,1]*np.roll(p[:,0],-1)))/2
        if area<min_area:continue
        # Split a closed curve at the farthest point, then simplify each half.
        j=int(np.argmax(np.linalg.norm(p-p[0],axis=1)))
        q=np.concatenate([rdp(p[:j+1],tolerance)[:-1],rdp(np.concatenate([p[j:],p[:1]]),tolerance)[:-1]])
        if len(q)<3:continue
        def pt(v):return f'{v[0]:.3f},{v[1]:.3f}'
        parts.append('M'+pt(q[0]));n=len(q)
        for i in range(n):
            p0,p1,p2,p3=q[(i-1)%n],q[i],q[(i+1)%n],q[(i+2)%n]
            # Smooth tangent direction, bounded by the shorter adjacent segment.
            # Preserve true corners; long curved segments must never become facets.
            def tangent(a,b,c):
                u=b-a;v=c-b;lu=np.linalg.norm(u);lv=np.linalg.norm(v)
                if min(lu,lv)<1e-7:return np.zeros(2)
                u/=lu;v/=lv
                if np.dot(u,v)<.35:return np.zeros(2)
                t=u+v;t/=np.linalg.norm(t)
                return t*min(lu,lv)/3
            c1=p1+tangent(p0,p1,p2);c2=p2-tangent(p1,p2,p3)
            parts.append('C'+pt(c1)+' '+pt(c2)+' '+pt(p2))
        parts.append('Z');count+=1
    return ' '.join(parts),count
