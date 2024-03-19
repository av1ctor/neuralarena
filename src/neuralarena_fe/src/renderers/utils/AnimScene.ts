import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AnimScene {
    visible: boolean;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;

    constructor(
        width: number,
        height: number,
        url: string,
        loader: GLTFLoader
    ) {
        this.visible = false;
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75.0, width / height, 0.1, 100.0);
        this.camera.position.set(0.0, 0.0, 2.0);

        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0.0, 300.0, 100.0);
        this.scene.add(fillLight1);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 7.0);
        directionalLight.position.set(5.0, 3.0, 3.0);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 100.0;
        directionalLight.shadow.camera.right = 10.0;
        directionalLight.shadow.camera.left = -10.0;
        directionalLight.shadow.camera.top = 10.0;
        directionalLight.shadow.camera.bottom = -10.0;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = -0.00006;
        this.scene.add(directionalLight);

        loader.load(url, (gltf) => {
            const obj = gltf.scene;

            obj.traverse(child => {
                if((child as any).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                }
            });
            
            const anim = new THREE.AnimationMixer(obj);
            const action = anim.clipAction(
                THREE.AnimationClip.findByName(gltf.animations, 'Animation'));
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
            action.enabled = false;

            obj.userData.anim = anim;
            obj.userData.action = action;

            this.scene.add(obj);
            this.scene.userData.root = obj;
        });
    }

    show() {
        if(this.visible) {
            return;
        }

        const obj = this.scene.userData.root as THREE.Group<THREE.Object3DEventMap>;

        //
        const anim = obj.userData.anim as THREE.AnimationMixer;
        
        const hideWhenFinished = () => {
            this.visible = false;
            anim.removeEventListener('finished', hideWhenFinished);
        };

        anim.addEventListener('finished', hideWhenFinished);

        //
        const action = obj.userData.action as THREE.AnimationAction;
        action.reset();
        action.play();
        action.enabled = true;
        
        this.visible = true;
    }

    #update(
    ) {
        const obj = this.scene.userData.root as THREE.Group<THREE.Object3DEventMap>;

        const anim = obj.userData.anim as THREE.AnimationMixer;
        anim.update(1.0 / 60.0);
    }

    render(
        renderer: THREE.WebGLRenderer
    ) {
        if(!this.visible) {
            return;
        }

        this.#update();
        renderer.clearDepth();
        renderer.render(this.scene, this.camera);
    }
}