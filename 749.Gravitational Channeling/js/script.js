c = document.querySelector('#c')
c.width = 1920
c.height = 1080
x = c.getContext('2d')
C = Math.cos
S = Math.sin
t = 0
T = Math.tan

rsz=window.onresize=()=>{
  setTimeout(()=>{
    if(document.body.clientWidth > document.body.clientHeight*1.77777778){
      c.style.height = '100vh'
      setTimeout(()=>c.style.width = c.clientHeight*1.77777778+'px',0)
    }else{
      c.style.width = '100vw'
      setTimeout(()=>c.style.height =     c.clientWidth/1.77777778 + 'px',0)
    }
  },0)
}
rsz()

async function Draw(){
  
  if(!t){
    R=(Rl,Pt,Yw,m)=>{
      M=Math
      A=M.atan2
      H=M.hypot
      X=S(p=A(X,Y)+Rl)*(d=H(X,Y))
      Y=C(p)*d
      X=S(p=A(X,Z)+Yw)*(d=H(X,Z))
      Z=C(p)*d
      Y=S(p=A(Y,Z)+Pt)*(d=H(Y,Z))
      Z=C(p)*d
      if(m){
        X+=oX
        Y+=oY
        Z+=oZ
      }
    }
    Q=()=>[c.width/2+X/Z*800,c.height/2+Y/Z*800]
    I=(A,B,M,D,E,F,G,H)=>(K=((G-E)*(B-F)-(H-F)*(A-E))/(J=(H-F)*(M-A)-(G-E)*(D-B)))>=0&&K<=1&&(L=((M-A)*(B-F)-(D-B)*(A-E))/J)>=0&&L<=1?[A+K*(M-A),B+K*(D-B)]:0
    
    cl=3
    iPc = 60
    Pheight = 70
    Pwidth = 40
    P = Array(iPc).fill().map((v,i)=>{
      ls = Pwidth*(1-i/iPc)
      X = S(p=Math.PI*2*cl/iPc*i-Math.PI/2) * ls
      Y = (i/iPc-.5) * Pheight
      Z = C(p) * ls
      if(!i){
        cx = X
        cy = Y
        cz = Z
      }
      return [X, Y, Z]
    })
    
    Rn = Math.random

    B = [], iBv = .2, iBvariance = 1
    spawnB = () =>{
      X = cx
      Y = cy
      Z = cz-16
      vx = 0 + (Rn()-.5) * iBvariance
      vy = 0 + (Rn()-.5) * iBvariance
      vz = iBv
      B = [...B, [X, Y, Z, vx, vy, vz, 1]]
    }
    bg = new Image()
    bg.src ='./img/bg.jpg';
  }

  oX=0, oY=10, oZ=90
  Rl=0, Pt=-S(t)/1.5, Yw=-S(t/2)*4+Math.PI/2
  
  x.globalAlpha = .1
  x.drawImage(bg,0,0,c.width,c.height)
  x.globalAlpha = 1
  x.fillStyle='#0004'
  x.fillRect(0,0,c.width,c.height)
  
  if(S(t*10)>.95) for(m=20;m--;) spawnB()
  
  P.map(v=>{
    X = v[0]
    Y = v[1]
    Z = v[2]
    R(Rl,Pt,Yw,1)
    if(Z>0){
      s = Math.min(1e3, 6000/Z)
      x.fillStyle = '#00ff6603'
      l = Q()
      x.fillRect(l[0]-s/2,l[1]-s/2,s,s)
      x.fillStyle = '#fff'
      s/=16
      x.fillRect(l[0]-s/2,l[1]-s/2,s,s)
    }
  })
  
  X = cx
  Y = cy
  Z = cz
  R(Rl,Pt,Yw,1)
  if(Z>0){
    s = Math.min(1e3, 5000/Z)
    x.fillStyle = '#0f81'
    l = Q()
    x.fillRect(l[0]-s/2,l[1]-s/2,s,s)
    x.fillStyle = '#0f8'
    s/=4
    x.fillRect(l[0]-s/2,l[1]-s/2,s,s)
  }

  B = B.filter(v=>v[6]>0)
  
  lim = .1
  B.map(v=>{
    X1 = v[0]
    Y1 = v[1]
    Z1 = v[2]
    vx=vy=vz=0
    P.map(q=>{
      X2 = q[0]
      Y2 = q[1]
      Z2 = q[2]
      d = (1+Math.hypot(a=X1-X2,b=Y1-Y2,e=Z1-Z2))**20/10000000000000
      vx -= a/d
      vy -= b/d
      vz -= e/d
    })
    d1 = Math.hypot(vx,vy,vz)
    vx /= d1
    vy /= d1
    vz /= d1
    /*
    vx *= Math.min(d1,lim)
    vy *= Math.min(d1,lim)
    vz *= Math.min(d1,lim)
    */
    vx *= iBv
    vy *= iBv
    vz *= iBv
    v[3]/=1.0025
    v[4]/=1.0025
    v[5]/=1.0025
    X = v[0] += v[3] += vx
    Y = v[1] += v[4] += vy
    Z = v[2] += v[5] += vz
    R(Rl,Pt,Yw,1)
    if(Z>0){
      s = Math.min(1e3, 4000/Z)
      x.fillStyle = `hsla(${d1**.1*140+t*20},99%,${50+d1*90}%,${Math.max(.005, Math.min(.02,d1*99))*v[6]**.2}`
      l = Q()
      x.fillRect(l[0]-s/2,l[1]-s/2,s,s)
      x.fillStyle = `hsla(${d1**.1*140+t*20},99%,${50+d1*90}%,${Math.max(1, Math.min(.05,d1*99))*v[6]**.2})`
      s/=10
      x.fillRect(l[0]-s/2,l[1]-s/2,s,s)
    }
    v[6]-=.003
  })
  t+=1/60
  requestAnimationFrame(Draw)
}
Draw()