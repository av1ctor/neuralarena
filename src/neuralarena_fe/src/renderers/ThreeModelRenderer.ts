import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { NftAssetsLoadingManager } from '@libs/loadingmanager';
import { LoadingBar } from './utils/LoadingBar';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { FixAudioRef, FixedAudioManager } from './utils/FixAudioMng';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeModelRenderer {
    assetLoader: GLTFLoader;
    audioLoader: THREE.AudioLoader;
    fixAudioMng?: FixedAudioManager;
    renderer: THREE.WebGLRenderer;
    controls?: OrbitControls;
    scene: THREE.Scene;
    camera?: THREE.Camera;
    anim?: THREE.AnimationMixer;
    width: number;
    height: number;
    loading: boolean;
    loadingBar: LoadingBar;
    musicRef?: FixAudioRef;

    constructor(
        canvas: HTMLCanvasElement,
        font: Font
    ) {
        this.width = canvas.width;
        this.height = canvas.height;

        this.renderer = new THREE.WebGLRenderer(
            {canvas, antialias: true});
        this.renderer.autoClear = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.LinearToneMapping;    
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        this.loadingBar = new LoadingBar(font);

        this.assetLoader = new GLTFLoader(new NftAssetsLoadingManager(
            (url, loaded, total) => this.loadingBar.onProgress(url, loaded, total)
        ));

        this.scene = ThreeModelRenderer.#setupScene();

        this.audioLoader = new THREE.AudioLoader();

        this.loading = true;
    }

    async loadAssets(
        url: string,
        aspectRatio: number
    ) {
        const [camera, anim, listener] = await this.#loadScene(
            url, 
            this.assetLoader, 
            this.scene,
            aspectRatio
        );
        this.camera = camera;
        this.anim = anim;
        this.fixAudioMng = new FixedAudioManager(listener);

        this.loading = false;
    }

    static #setupScene(
    ): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x88ccee);

        return scene;
    }

    static #createDefaultCamera(
        aspectRatio: number
    ): THREE.Camera {
        const camera = new THREE.PerspectiveCamera(75.0, aspectRatio, 0.1, 1000);
        camera.position.set(0.0, 100.0, 250.0);
        return camera;
    }

    static #createDefaultLights(
    ): THREE.Light[] {
        const lights = [];
        
        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0, 300, 0);
        lights.push(fillLight1);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 7.0);
        directionalLight.position.set(15, 30, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500.0;
        directionalLight.shadow.camera.right = 60.0;
        directionalLight.shadow.camera.left = -60.0;
        directionalLight.shadow.camera.top = 60.0;
        directionalLight.shadow.camera.bottom = -60.0;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = -0.00006;
        lights.push(directionalLight);

        return lights;
    }

    async #loadScene(
        url: string,
        loader: GLTFLoader,
        scene: THREE.Scene,
        aspectRatio: number
    ): Promise<[
        THREE.Camera, 
        THREE.AnimationMixer, 
        THREE.AudioListener
    ]> {
        const gltf = await loader.loadAsync(url);
        const camera = gltf.cameras.length > 0? 
            gltf.cameras[0]:
            ThreeModelRenderer.#createDefaultCamera(aspectRatio);

        const listener = new THREE.AudioListener();
        camera.add(listener);

        this.controls = this.renderer.domElement?
            new OrbitControls(camera, this.renderer.domElement):
            undefined;

        let hasLights = false;
        
        const obj = gltf.scene;
        obj.traverse(child => {
            if((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
            else if((child as any).isGroup) {
                child.traverse(child => {
                    if((child as any).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                    }
                    else if((child as any).isPointLight) {
                        hasLights = true;
                        const light = child as THREE.PointLight;
                        light.castShadow = true;
                        light.shadow.mapSize.width = 2048;
                        light.shadow.mapSize.height = 2048;
                        light.shadow.radius = 4;
                        light.shadow.bias = -0.00006;
                    }
                });
            }
        });

        if(!hasLights) {
            const lights = ThreeModelRenderer.#createDefaultLights();
            obj.add(...lights);
        }

        this.controls!.target = obj.position.clone().add(new THREE.Vector3(0.0, 100.0, 0.0));

        const anim = new THREE.AnimationMixer(obj);
        if(gltf.animations.length > 0) {
            const action = anim.clipAction(gltf.animations[0]);
            action.loop = THREE.LoopRepeat;
            action.enabled = true;
            action.play();
        }

        scene.add(obj);

        return [camera, anim, listener];
    }

    static async #loadAudio(
        url: string,
        loader: THREE.AudioLoader,        
    ): Promise<any> {
        return loader.loadAsync(url);
    }

    resizeCanvas(
        dim: {w: number, h: number}
    ) {
        this.width = dim.w;
        this.height = dim.h;
        this.renderer.setSize(dim.w, dim.h);
        if(this.camera?.type === 'PerspectiveCamera') {
            const cam = this.camera as THREE.PerspectiveCamera;
            cam.aspect = dim.w / dim.h;
            cam.updateProjectionMatrix();
        }
    }

    stopAudio(
    ) {
        this.fixAudioMng?.reset();
    }

    update(
        deltaTime: number
    ) {
        this.anim?.update(deltaTime / 1000.0);
        this.loadingBar.update(deltaTime);
        this.controls?.update(deltaTime / 1000.0);
    }

    render(
    ) {
        if(!this.loading) {
            this.renderer.render(this.scene, this.camera!);
        }
        else {
            this.loadingBar.render(this.renderer);
        }
    }
};