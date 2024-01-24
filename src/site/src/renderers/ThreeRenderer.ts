import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const loader = new GLTFLoader();

export class ThreeRenderer {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    controls: OrbitControls | undefined;
    clock: THREE.Clock;
    width: number;
    height: number;
    objects: THREE.Object3D[];

    constructor(
        canvas: HTMLCanvasElement
    ) {
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x88ccee);
        this.scene.fog = new THREE.Fog(0x88ccee, 0, 100)

        this.camera = new THREE.PerspectiveCamera(75.0, this.width / this.height, 0.1, 1000.0);
        this.camera.position.x = 28.0;
        this.camera.position.y = 28.0;
        this.camera.position.z = 28.0;

        this.renderer = new THREE.WebGLRenderer(canvas? {canvas, antialias: true}: {antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;    
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
        fillLight1.position.set(2, 1, 1);
        this.scene.add(fillLight1);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(-5, 25,-1);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.top= 30;
        directionalLight.shadow.camera.bottom = -30;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = - 0.00006;
        this.scene.add(directionalLight);

        this.controls = this.renderer.domElement?
            new OrbitControls(this.camera, this.renderer.domElement):
            undefined;

        this.clock = new THREE.Clock();

        this.objects = [];
    }

    resize_canvas(
        dim: {w: number, h: number}
    ) {
        this.width = dim.w;
        this.height = dim.h;
    }

    reset(
    ) {
        for(const obj of this.objects) {
            obj.removeFromParent();
        }
        this.objects = [];
    }

    async add_model(
        id: string,
        rf: number
    ): Promise<number> {

        if (id.startsWith("/maps")) {
            const gltf = await loader.loadAsync(id);
            const obj = gltf.scene;
            obj.traverse(child => {
                if((child as any).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    if((child as any).material.map) {
                        (child as any).material.map.anisotropy = 4;
                    }
                }
            });

            this.objects[rf] = obj;
            this.scene.add(obj);
        }
        else if (id.startsWith("player-")) {
            const gltf = await loader.loadAsync("/models/zombie/default.gltf");
            const obj = gltf.scene;
            obj.traverse(child => {
                if((child as any).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            obj.visible = false;

            obj.scale.multiplyScalar(0.01);
            
            const anim = new THREE.AnimationMixer(obj);
            obj.userData.anim = anim;

            let actions = Object.assign({});
            for(let clip of gltf.animations) {
                const action = anim.clipAction(clip);
                actions[clip.name] = action;
            }

            obj.userData.actions = actions;
            obj.userData.activeAction = undefined;

            this.objects[rf] = obj;
            this.scene.add(obj);
        }
        else if (id.startsWith("key-")) {
            const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff0000
            });
            const obj = new THREE.Mesh(geometry, material);
            
            this.scene.add(obj);
            this.objects[rf] = obj;
        }
        else if (id.startsWith("exit-")) {
            const geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
            const material = new THREE.MeshBasicMaterial({
                color: 0x0000ff
            });
            const obj = new THREE.Mesh(geometry, material);
            
            this.scene.add(obj);
            this.objects[rf] = obj;
        }
        else {
            console.error("Unknown model:" + id);
            throw new Error("Unknown model");
        }

        return rf;
    }

    show_model(
        model_ref: number
    ) {
        this.objects[model_ref].visible = true;
    }

    hide_model(
        model_ref: number
    ) {
        this.objects[model_ref].visible = false;
    }

    set_position(
        model_ref: number,
        pos: Float32Array
    ) {
        const obj = this.objects[model_ref];
        obj.position.x = pos[0];
        obj.position.y = pos[1];
        obj.position.z = pos[2];
    }

    set_rotation(
        model_ref: number,
        q: Float32Array
    ) {
        const obj = this.objects[model_ref];
        obj.setRotationFromQuaternion(
            new THREE.Quaternion(q[0], q[1], q[2], q[3])
        );
    }

    set_rotation_from_euler(
        model_ref: number,
        vector: Float32Array,
        order: number
    ) {
        const obj = this.objects[model_ref];
        obj.setRotationFromEuler(
            new THREE.Euler(vector[0], vector[1], vector[2], 'XYZ')
        );
    }

    set_scale(
        model_ref: number,
        scale: Float32Array
    ) {
        const obj = this.objects[model_ref];
        obj.scale.x = scale[0];
        obj.scale.y = scale[1];
        obj.scale.z = scale[2];
    }

    render(
    ) {
        this.controls?.update();
        this.renderer.render(this.scene, this.camera);
    }
};