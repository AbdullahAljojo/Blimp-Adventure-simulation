import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import physic from './physic';

/**
 * Base
 */
// Debug
const pp = {
    luggageMass: 200,
    g: 9.2,
    p: 1.22,
    PressureOutside: 101300,
    vx: 0,
    vz: 0,
    S: 0,
    Sx: 1,
    Sz: 0,
    startSimulation: false,
    startBurner: false
}
const gui = new dat.GUI()
//Weight
gui.add(pp, "luggageMass").min(0)
gui.add(pp, "g").min(0)

//Gas
gui.add(pp, "p").min(0)
gui.add(pp, "PressureOutside").min(0)

//Wind
gui.add(pp, "vx")
gui.add(pp, "vz")

//Hole
gui.add(pp, "S").min(0).step(0.1)
gui.add(pp, "Sx")
gui.add(pp, "Sz")

//Control
gui.add(pp, "startSimulation")
gui.add(pp, "startBurner")

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
const gltfLoader = new GLTFLoader()

let clouds
gltfLoader.load("/models/clouds.gltf", function (gltf) {
    clouds = gltf
    clouds = clouds.scene
    clouds.scale.x = 3
    clouds.scale.y = 3
    clouds.scale.z = 3

    let positions = [
        [-100, 150, -100], [0, 200, -100], [+100, 250, -100],
        [-100, 200, 0], [0, 250, 0], [+100, 200, 0],
        [-100, 250, +100], [0, 300, +100], [+100, 350, +100],
    ]
    for (let i = 0; i < positions.length; i++) {
        let cloud = clouds.clone()
        let pos = {
            x: positions[i][0],
            y: positions[i][1],
            z: positions[i][2],
        }

        cloud.position.x = pos.x
        cloud.position.y = pos.y
        cloud.position.z = pos.z

        for (let j = 0; j < 100; j++) {
            let cld = cloud.clone()
            cld.position.x += Math.random() * 1000 * Math.pow(-1, Math.floor(Math.random() * 2))
            cld.position.y += Math.random() * 10000 + 100
            cld.position.z += Math.random() * 1000 * Math.pow(-1, Math.floor(Math.random() * 2))
            cld.rotation.y += Math.random()
            scene.add(cld)
        }
        scene.add(cloud)
    }
})

let baloon
gltfLoader.load("/models/baloon.gltf", function (gltf) {
    baloon = gltf
    baloon = baloon.scene
    baloon.scale.set(0.2, 0.2, 0.2)
    scene.add(baloon)
})

let tree
let treePos = [
    []
];
gltfLoader.load("/models/Tree_Red-spruce.glb", function (gltf) {
    tree = gltf
    tree = tree.scene
    for (let i = 0; i < 5; i++) {
        let treei = tree.clone();
        treei.position.x = Math.random() * 200 + 10
        treei.position.z = Math.random() * 200 + 10
        treei.rotateY(Math.random() * 2 * Math.PI)
        scene.add(treei)
    }

    for (let i = 0; i < 5; i++) {
        let treei = tree.clone();
        treei.position.x = Math.random() * -200 - 10
        treei.position.z = Math.random() * -200 - 10
        treei.rotateY(Math.random() * 2 * Math.PI)
        scene.add(treei)
    }

    for (let i = 0; i < 5; i++) {
        let treei = tree.clone();
        treei.position.x = Math.random() * 200 + 10
        treei.position.z = Math.random() * -200 - 10
        treei.rotateY(Math.random() * 2 * Math.PI)
        scene.add(treei)
    }

    for (let i = 0; i < 5; i++) {
        let treei = tree.clone();
        treei.position.x = Math.random() * -200 - 10
        treei.position.z = Math.random() * 200 + 10
        treei.rotateY(Math.random() * 2 * Math.PI)
        scene.add(treei)
    }

})


/**
 * skybox
 */
let skybox = [
    "/skybox/px.png",
    "/skybox/nx.png",
    "/skybox/py.png",
    "/skybox/ny.png",
    "/skybox/pz.png",
    "/skybox/nz.png",
]
let skyboxTex = new THREE.CubeTextureLoader().load(skybox)
scene.background = skyboxTex

/**
 * Floor
 */
let texture = new THREE.TextureLoader().load("/textures/color.jpg")
texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping
texture.repeat.x = 25
texture.repeat.y = 25
const earth = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500, 100, 100),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        roughness: 0.5,
        map: texture,
    })
)
earth.geometry.uv1 = earth.geometry.getAttribute("uv")
earth.material.side = THREE.DoubleSide
earth.rotation.x = - Math.PI * 0.5
scene.add(earth)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)
directionalLight.position.set(0, 10, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 2000)
camera.position.set(50, 50, 50)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 10, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

let phObj

let listener = new THREE.AudioListener()
camera.add(listener)
let sound = new THREE.Audio(listener)
new THREE.AudioLoader().load("/sounds/sound1.mp3",
    function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
    });

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = (elapsedTime - previousTime)
    previousTime = elapsedTime

    //physics
    if (baloon && pp.startSimulation) {
        if (!phObj) phObj = new physic(pp)

        if (pp.PressureOutside > phObj.PressureInside) phObj.PressureInside++;
        if (pp.PressureOutside < phObj.PressureInside) phObj.PressureInside--;

        if (pp.startBurner) {
            if (!sound.isPlaying) sound.play();

            if (phObj.V < 3 * (4 / 3 * Math.PI * 10 * 10 * 10)) {
                phObj.V = phObj.V * ((phObj.T + 1) / (phObj.T));
                phObj.T++;
            } else {
                phObj.PressureInside = phObj.PressureInside * ((phObj.T + 1) / (phObj.T));
                phObj.T++;
            }
        } else if (phObj.T > 273) {
            if (phObj.PressureInside > pp.PressureOutside) {
                phObj.PressureInside = phObj.PressureInside * ((phObj.T - 10) / (phObj.T));
                phObj.T -= 10;
            } else {
                phObj.V = phObj.V * ((phObj.T - 10) / (phObj.T));
                phObj.T -= 10;
                if (phObj.T < 273) {
                    phObj.V = 4 / 3 * Math.PI * 10 * 10 * 10;
                    phObj.T = 273;
                }
            }
        }

        if (!pp.startBurner) {
            if (sound.isPlaying) sound.pause();
        }
        
        phObj.update(baloon, camera, deltaTime)
        controls.target = baloon.position.clone();
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()