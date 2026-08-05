import * as THREE from 'three/webgpu'
import { TSL as $ } from 'three/webgpu'
import { RectAreaLightTexturesLib } from 'three/addons/lights/RectAreaLightTexturesLib.js'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'

THREE.RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init())

const renderer = await new THREE.WebGPURenderer().init()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera()

camera.position.set(0, 0, 2)

const mat = new THREE.MeshPhysicalNodeMaterial({})
const floor_mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), mat)
scene.add(floor_mesh)

const light0_tall = 0.777
const light0 = new THREE.RectAreaLight('white', 0, light0_tall, 0)
scene.add(light0)
scene.add(new RectAreaLightHelper(light0))

const rp = new THREE.RenderPipeline(renderer)
const scene_pass = $.pass(scene, camera)
rp.outputNode = $.vec4(scene_pass.rgb, $.mx_rgbtohsv(scene_pass.rgb).z.oneMinus()
  .pow(16)  // brightness
  .mul(0.9) // darkness 0..1; 1 to fake wall
)
renderer.setAnimationLoop(() => rp.render())

document.body.prepend(renderer.domElement)

const light0_min_height = 0.3
const light0_max_height = 0.5
const light0_min_radius = 0.3
const light0_min_intensity = 1
const light0_max_intensity = 2
const raycaster = new THREE.Raycaster()
function handle_pointer_move(x, y) { // x y both in [-1,1]
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
  const intersections = raycaster.intersectObject(floor_mesh)
  for (const i of intersections) {
    if (i.object === floor_mesh) {
      const a = -Math.atan2(i.point.y, i.point.x) + Math.PI / 2
      const r = Math.max(light0_min_radius, Math.hypot(i.point.x, i.point.y)) + 0.2 // push far lil bit
      light0.position.set(r * Math.sin(a), r * Math.cos(a), light0.width / 2)
      light0.lookAt(0, 0, light0.width / 2)
      light0.height = Math.min(light0_max_height, Math.max(light0_min_height, Math.hypot(x, y)))
      light0.intensity = light0_min_intensity + Math.min(light0_max_intensity - light0_min_intensity, Math.hypot(x, y))
    }
  }
}
document.body.addEventListener('pointermove', (e) => {
  const s = getComputedStyle(renderer.domElement)
  const x = (e.clientX / parseInt(s.width)) * 2 - 1 // [-1,1] +ve is right
  const y = (1 - (e.clientY) / parseInt(s.height)) * 2 - 1 // [-1,1] +ve is up
  handle_pointer_move(x, y)
})

function update_light0_color() {
  const s = getComputedStyle(renderer.domElement)
  const y_ratio = Math.min(1.0, window.scrollY / (document.body.scrollHeight - parseFloat(s.height)))
  light0.color.setHSL(y_ratio, 0.5, 0.5)
}
addEventListener('scroll', () => update_light0_color())

setTimeout(() => {
  handle_pointer_move(0.2, -0.2)
  update_light0_color()
}, 150)

addEventListener('resize', () => {
  const { width, height } = renderer.domElement.getBoundingClientRect()
  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
})
dispatchEvent(new Event('resize'))