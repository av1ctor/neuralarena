import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GameInfo } from '@declarations/neuralarena_be/neuralarena_be.did';
import { GameAssetsLoadingManager } from '@libs/loadingmanager';
import { LoadingBar } from './utils/LoadingBar';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

export class ThreeSceneRenderer {
    assetLoader: GLTFLoader;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera?: THREE.Camera;
    anim?: THREE.AnimationMixer;
    width: number;
    height: number;
    loading: boolean;
    loadingBar: LoadingBar;

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

        this.loading = true;
        const scenes_urls = new Map(game.urls.scenes);
        ThreeSceneRenderer.#loadScene(
            scenes_urls.get('intro')!, 
            this.assetLoader, 
            this.scene
        ).then(res => {
            this.camera = res[0];
            this.anim = res[1];
            this.loading = false;
        }).catch(err => {
            console.error(err)
        });
    }

    static #setupScene(
    ): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 100)

        return scene;
    }

    static #loadScene(
        scene_url: string,
        loader: GLTFLoader,
        scene: THREE.Scene
    ): Promise<[THREE.Camera, THREE.AnimationMixer]> {
        
        const res = new Promise<[THREE.Camera, THREE.AnimationMixer]>((resolve, reject) => {
            loader.load(scene_url, (gltf) => {
                const camera = gltf.cameras[0]
                
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
    
                resolve([camera, anim]);
            }, 
            () => null,
            (err) => reject(err)
        )});
        
        return res;
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

    render(
    ) {
        if(!this.loading) {
            this.anim?.update(1.0 / 60.0);
            this.renderer.render(this.scene, this.camera!);
        }
        else {
            this.loadingBar.render(this.renderer);
        }
    }
};