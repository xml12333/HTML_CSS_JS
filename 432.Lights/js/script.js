// Note: lightballをInstancedMeshにすると光量が反映されず影が変になるため保留中
/*!
Lights.js
Copyright (c) 2022 Wakana Y.K.
URL:https://codepen.io/wakana-k/pen/rNKLdEb
*/
!(function () {
  "use strict";
  function e() {
    (n.aspect = window.innerWidth / window.innerHeight),
      n.updateProjectionMatrix(),
      a.setSize(window.innerWidth, window.innerHeight);
  }
  function t() {
    requestAnimationFrame(t),
      i.update(),
      (M.rotation.x += 0.003),
      (M.rotation.y -= 0.005),
      (M.rotation.z -= 0.002),
      (f.rotation.x -= 0.002),
      (f.rotation.y -= 0.005),
      (f.rotation.z += 0.001),
      a.render(o, n);
  }
  let n,
    o,
    a,
    i,
    r,
    E,
    s,
    d,
    l,
    w,
    c,
    h,
    m,
    R = 5,
    u = 1,
    H = 1.3,
    p = "",
    T = [],
    g = new THREE.Vector3(0, 0, 0),
    M = new THREE.Group(),
    f = new THREE.Group();
  const y = new THREE.Matrix4(),
    S = new THREE.Vector3(),
    x = new THREE.Euler();
  let b = new THREE.Quaternion();
  const P = new THREE.Vector3(1, 1, 1);
  new THREE.Vector3(0, 0, 0), new THREE.Matrix4(), new THREE.Vector3(0, 1, 0);
  !(function () {
    const A = document.createElement("div");
    document.body.appendChild(A),
      ((o = new THREE.Scene()).background = 0),
      (a = new THREE.WebGLRenderer({
        antialias: !0,
      })).setPixelRatio(window.devicePixelRatio),
      a.setSize(window.innerWidth, window.innerHeight),
      (a.outputEncoding = THREE.sRGBEncoding),
      (a.shadowMap.enabled = !0),
      A.appendChild(a.domElement),
      new THREE.TextureLoader().load(
        "../../432.Lights/img/leadenhall_market_1k.jpg",
        function (e) {
          (e.mapping = THREE.EquirectangularReflectionMapping),
            (o.environment = e);
        }
      ),
      (n = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        0.01,
        500
      )).position.set(0, 0, 13),
      n.lookAt(0, 0, 0),
      ((i = new THREE.OrbitControls(n, a.domElement)).autoRotate = !0),
      (i.autoRotateSpeed = 2),
      (i.enableDamping = !0),
      (i.enablePan = !1),
      (i.minDistance = 3),
      (i.maxDistance = 30),
      (i.minPolarAngle = 0),
      (i.maxPolarAngle = Math.PI / 2),
      i.target.set(0, 0, 0),
      i.update(),
      o.add(M),
      o.add(f),
      t();
    const C = new THREE.AmbientLight(16777215, 0.2);
    o.add(C),
      (E = new THREE.MeshStandardMaterial({
        metalness: 0.9,
        roughness: 0,
      })),
      (h = 0.3),
      (r = new THREE.SphereGeometry(h, 20, 20)),
      (w = new THREE.Mesh(r, new THREE.MeshStandardMaterial())),
      (h = 0.15),
      (r = new THREE.IcosahedronGeometry(h, 0)),
      (l = new THREE.Mesh(r, E)),
      ((c = new THREE.PointLight(16777215, H, 20)).castShadow = !0),
      (c.shadow.bias = -0.005),
      (function (e, t, n = "") {
        r = new THREE.IcosahedronGeometry(e, t);
        let o = [];
        for (let e = 0; e < r.attributes.position.count; e++)
          g.fromBufferAttribute(r.getAttribute("position"), e),
            o.push([g.x, g.y, g.z]);
        let a = (o = [...new Set(o.map(JSON.stringify))].map(JSON.parse))
          .length;
        ((m = new THREE.InstancedMesh(
          l.geometry,
          l.material,
          a - Math.floor(a / 24)
        )).castShadow = !0),
          (m.receiveShadow = !0);
        let i = 0;
        for (let e = 0; e < a; e++)
          if ((g.set(o[e][0], o[e][1], o[e][2]), e % 24 == 0)) {
            let e;
            (s = w.clone()).position.set(g.x, g.y, g.z),
              "random" == n
                ? (e = new THREE.Color(16777215 * Math.random()))
                : n && (e = new THREE.Color(n)),
              (s.material = w.material.clone()),
              s.material.color.set(e),
              s.material.color.multiplyScalar(H),
              (s.castShadow = !0),
              (e = s.material.color);
            let t = c.clone();
            t.color.set(e), t.position.set(g.x, g.y, g.z), s.add(t), f.add(s);
          } else
            S.set(g.x, g.y, g.z),
              x.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
              ),
              b.setFromEuler(x),
              y.compose(S, b, P),
              m.setMatrixAt(i, y),
              "random" == n
                ? m.setColorAt(i, new THREE.Color(16777215 * Math.random()))
                : n && m.setColorAt(i, new THREE.Color(n)),
              i++;
        f.add(m);
      })((R = 5), (u = 4), (p = "random")),
      (function (e, t, n = "") {
        r = new THREE.IcosahedronGeometry(e, t);
        let o = [];
        for (let e = 0; e < r.attributes.position.count; e++)
          g.fromBufferAttribute(r.getAttribute("position"), e),
            o.push([g.x, g.y, g.z]);
        (o = [...new Set(o.map(JSON.stringify))].map(JSON.parse)),
          (h = 0.6),
          (T = []);
        let a = new THREE.CylinderGeometry(h, 0, 5, 6);
        a.rotateX(Math.PI / 2), a.translate(0, 0, 1.5 * -e);
        for (let e = 0; e < o.length; e++)
          g.set(o[e][0], o[e][1], o[e][2]),
            (r = a.clone()).lookAt(g),
            T.push(r);
        (r = THREE.BufferGeometryUtils.mergeBufferGeometries(T)),
          (E = E.clone()).color.set(new THREE.Color(n)),
          ((d = new THREE.Mesh(r, E)).castShadow = !0),
          (d.receiveShadow = !0),
          M.add(d);
      })((R = 1), (u = 0), (p = "#aaaaaa")),
      (r = new THREE.BoxGeometry(50, 50, 50)),
      (E = new THREE.MeshPhongMaterial({
        color: 5592405,
        shininess: 10,
        specular: 1118481,
        side: THREE.BackSide,
      })),
      ((s = new THREE.Mesh(r, E)).position.y = 19.2),
      (s.receiveShadow = !0),
      o.add(s),
      window.addEventListener("resize", e);
  })();
})();
