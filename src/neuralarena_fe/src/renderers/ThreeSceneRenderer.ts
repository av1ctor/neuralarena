import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GameInfo } from '@declarations/neuralarena_be/neuralarena_be.did';
import { GameAssetsLoadingManager } from '@libs/loadingmanager';
import { LoadingBar } from './utils/LoadingBar';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { FixAudioRef, FixedAudioManager } from './utils/FixAudioMng';

export class ThreeSceneRenderer {
    assetLoader: GLTFLoader;
    audioLoader: THREE.AudioLoader;
    fixAudioMng?: FixedAudioManager;
    renderer: THREE.WebGLRenderer;
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
        game: GameInfo,
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

        this.assetLoader = new GLTFLoader(new GameAssetsLoadingManager(
            game.urls.assets,
            (url, loaded, total) => this.loadingBar.onProgress(url, loaded, total)
        ));

        this.scene = ThreeSceneRenderer.#setupScene();

        this.audioLoader = new THREE.AudioLoader();

        this.loading = true;
    }

    async loadAssets(
        game: GameInfo
    ) {
        const scenes = new Map(game.urls.scenes);
        const introScene = scenes.get('intro');
        if(introScene) {
            const [camera, anim, listener] = await ThreeSceneRenderer.#loadScene(
                introScene.model, 
                this.assetLoader, 
                this.scene
            );
            this.camera = camera;
            this.anim = anim;
            this.fixAudioMng = new FixedAudioManager(listener);

            if(introScene.music.length > 0) {
                const buff = await ThreeSceneRenderer.#loadAudio(
                    introScene.music[0] as any,
                    this.audioLoader
                );
                this.musicRef = this.fixAudioMng?.create(buff, true, 0.1);
                if(this.musicRef !== undefined) {
                    this.fixAudioMng?.play(this.musicRef);
                }
            }
        }
            
        this.loading = false;
    }

    static #setupScene(
    ): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 100)

        return scene;
    }

    static async #loadScene(
        url: string,
        loader: GLTFLoader,
        scene: THREE.Scene
    ): Promise<[
        THREE.Camera, 
        THREE.AnimationMixer, 
        THREE.AudioListener
    ]> {
        const gltf = await loader.loadAsync(url);
        const camera = gltf.cameras[0]

        const listener = new THREE.AudioListener();
        camera.add(listener);
        
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