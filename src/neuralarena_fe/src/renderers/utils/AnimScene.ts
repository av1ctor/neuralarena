import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FixAudioRef, FixedAudioManager } from './FixAudioMng';

export class AnimScene {
    visible: boolean;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    fixAudioMng: FixedAudioManager;
    musicRef?: FixAudioRef;

    constructor(
        width: number,
        height: number
    ) {
        this.visible = false;
        
        const [scene, camera, listener] = AnimScene.#setupScene(width, height);
        this.scene = scene;
        this.camera = camera; 

        this.fixAudioMng = new FixedAudioManager(listener);
    }

    static #setupScene(
        width: number,
        height: number
    ): [
        THREE.Scene, 
        THREE.PerspectiveCamera, 
        THREE.AudioListener
    ] {
        const scene = new THREE.Scene();

        //FIXME: this should be defined at the GLTF
        const camera = new THREE.PerspectiveCamera(75.0, width / height, 0.1, 100.0);
        camera.position.set(0.0, 0.0, 2.0);

        const listener = new THREE.AudioListener();
        camera.add(listener);

        //FIXME: this should be defined at the GLTF
        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0.0, 300.0, 100.0);
        scene.add(fillLight1);

        //FIXME: this should be defined at the GLTF
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
        scene.add(directionalLight);

        return [scene, camera, listener];
    }

    async loadAssets(
        modelUrl: string,
        musicUrl: string|undefined,
        modelLoader: GLTFLoader,
        audioLoader: THREE.AudioLoader
    ) {
        const obj = await AnimScene.#loadScene(modelUrl, modelLoader);
        this.scene.add(obj);
        this.scene.userData.root = obj;

        if(musicUrl) {
            const buff = await AnimScene.#loadAudio(musicUrl, audioLoader);
            this.musicRef = this.fixAudioMng?.create(buff, false, 0.2);
        }
    }

    static async #loadScene(
        url: string,
        loader: GLTFLoader
    ): Promise<THREE.Object3D> {
        const gltf = await loader.loadAsync(url);
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

        return obj;
    }

    static async #loadAudio(
        url: string,
        loader: THREE.AudioLoader,        
    ): Promise<any> {
        const buff = await loader.loadAsync(url);
        return buff;
    }

    resizeCanvas(
        dim: {w: number, h: number}
    ) {
        this.camera.aspect = dim.w / dim.h;
        this.camera.updateProjectionMatrix();
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

        if(this.musicRef !== undefined) {
            this.fixAudioMng.play(this.musicRef);
        }

        this.visible = true;
    }

    update(
        deltaTime: number
    ) {
        if(!this.visible) {
            return;
        }

        const obj = this.scene.userData.root as THREE.Group<THREE.Object3DEventMap>;

        const anim = obj.userData.anim as THREE.AnimationMixer;
        anim.update(deltaTime / 1000.0);
    }

    render(
        renderer: THREE.WebGLRenderer
    ) {
        if(!this.visible) {
            return;
        }

        renderer.clearDepth();
        renderer.render(this.scene, this.camera);
    }
}