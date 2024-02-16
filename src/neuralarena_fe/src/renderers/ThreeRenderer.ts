import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { Asset } from '../../../declarations/neuralarena_be/neuralarena_be.did';
import { gameAssetDataTextValue } from '../libs/games';
import { AssetLoadingManager } from '../libs/loadingmanager';

export class ThreeRenderer {
    loader: GLTFLoader;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    raycaster: THREE.Raycaster;
    controls?: OrbitControls;
    clock: THREE.Clock;
    width: number;
    height: number;
    assets: Map<number, THREE.Object3D>;
    entities: THREE.Object3D[];
    pov: {
        player_num?: number,
        rotate_cam: boolean
    };
    skipping: boolean;

    constructor(
        canvas: HTMLCanvasElement,
        assets_url: string
    ) {
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x88ccee);
        this.scene.fog = new THREE.Fog(0x88ccee, 0, 100)

        this.camera = new THREE.PerspectiveCamera(75.0, this.width / this.height, 0.1, 1000.0);
        this.camera.position.set(15.0, 10.0, 15.0);

        this.renderer = new THREE.WebGLRenderer(canvas? {canvas, antialias: true}: {antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.LinearToneMapping;    
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0, 300, 0);
        this.scene.add(fillLight1);

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
        this.scene.add(directionalLight);

        this.raycaster = new THREE.Raycaster();

        this.controls = this.renderer.domElement?
            new OrbitControls(this.camera, this.renderer.domElement):
            undefined;

        this.clock = new THREE.Clock();

        this.assets = new Map();
        this.entities = [];

        this.pov = {
            player_num: undefined,
            rotate_cam: false
        };

        this.skipping = false;

        this.loader = new GLTFLoader(new AssetLoadingManager(assets_url));
    }

    change_pov(
        player_num?: number,
        rotate_cam?: boolean
    ) {
        if(player_num !== undefined) {
            const players = this.entities.filter(o => o.userData.isPlayer);
            if(player_num >= 0 && player_num < players.length) {
                if(player_num !== this.pov.player_num || rotate_cam !== this.pov.rotate_cam) {
                    const player = players[player_num];
                    this.camera.position.set(
                        player.position.x + 0.0, 
                        player.position.y + 5.0, 
                        player.position.z + 5.0
                    );

                    this.pov = {
                        player_num,
                        rotate_cam: rotate_cam? true: false
                    };
                }
            }
        }
        else {
            this.pov = {
                player_num: this.pov.player_num,
                rotate_cam: false
            };
        }
    }

    set_skipping(
        skipping: boolean
    ) {
        this.skipping = skipping;
    }

    resize_canvas(
        dim: {w: number, h: number}
    ) {
        this.width = dim.w;
        this.height = dim.h;
        this.renderer.setSize(dim.w, dim.h);
        this.camera.aspect = dim.w / dim.h;
        this.camera.updateProjectionMatrix();
    }

    reset(
        reset_cam: boolean = true,
        reset_pov: boolean = true
    ) {
        for(const obj of this.entities) {
            obj.removeFromParent();
        }
        this.entities = [];

        if(reset_cam) {
            this.camera.position.set(15.0, 10.0, 15.0);
        }

        if(reset_pov) {
            this.pov = {
                player_num: undefined,
                rotate_cam: false
            };
        }
    }

    async load_asset(
        asset_ref: number,
        asset: Asset
    ): Promise<void> {
        if('Level' in asset.typ) {
            const gltf = await this.loader.loadAsync(
                gameAssetDataTextValue(asset, 'path')!);
            const mesh = gltf.scene;
            mesh.traverse(child => {
                if((child as any).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    const material = Array.isArray(mesh.material)? 
                        mesh.material[0].clone(): 
                        mesh.material.clone();
                    material.transparent = false;
                    material.opacity = 0.25;

                    if((material as any).map) {
                        (material as any).map.anisotropy = 4;
                    }
                    mesh.material = material;
                }
            });

            mesh.userData.isMap = true;

            this.assets.set(asset_ref, mesh);
        }
        else if('Player' in asset.typ) {
            const gltf = await this.loader.loadAsync(
                gameAssetDataTextValue(asset, 'path')!);
            const mesh = gltf.scene;
            mesh.traverse(child => {
                if((child as any).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            mesh.visible = false;

            mesh.userData.isPlayer = true;
            mesh.userData.animations = gltf.animations;
            const bb = new THREE.Box3().setFromObject(mesh);
            mesh.userData.height = (bb.max.y - bb.min.y) * 0.01;

            mesh.scale.multiplyScalar(0.01);

            this.assets.set(asset_ref, mesh);
        }
        else if('Npc' in asset.typ) {
            const gltf = await this.loader.loadAsync(
                gameAssetDataTextValue(asset, 'path')!);
            const mesh = gltf.scene;
            mesh.traverse(child => {
                if((child as any).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            mesh.visible = false;

            mesh.userData.isNpc = true;
            mesh.userData.animations = gltf.animations;
            const bb = new THREE.Box3().setFromObject(mesh);
            mesh.userData.height = (bb.max.y - bb.min.y) * 0.05;

            mesh.scale.multiplyScalar(0.011);

            this.assets.set(asset_ref, mesh);
        }
        else if('Object' in asset.typ) {
            const geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
            const material = new THREE.MeshBasicMaterial({
                color: 0x0000ff
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.visible = false;
            
            this.scene.add(mesh);
            this.assets.set(asset_ref, mesh);
        }
        else {
            console.error("Unknown asset:" + asset_ref);
            throw new Error("Unknown asset: " + asset_ref);
        }
    }

    add_model(
        asset_ref: number,
        model_ref: number
    ): number {
        const obj = this.assets.get(asset_ref);
        if(!obj) {
            throw new Error("Unknown asset: " + asset_ref);
        }
        
        const cloned = cloneSkeleton(obj);
        if(cloned.userData.isPlayer || cloned.userData.isNpc) {
            const anim = new THREE.AnimationMixer(cloned);
            cloned.userData.anim = anim;

            let actions = Object.assign({});
            for(const clip of obj.userData.animations) {
                const action = anim.clipAction(clip);
                actions[clip.name] = action;
            }

            cloned.userData.actions = actions;
            cloned.userData.action = 'Idle';
            (cloned.userData.actions as any)[cloned.userData.action]?.play();
        }

        this.entities[model_ref] = cloned;
        this.scene.add(cloned)
        return model_ref;
    }

    show_model(
        model_ref: number
    ) {
        this.entities[model_ref].visible = true;
    }

    hide_model(
        model_ref: number
    ) {
        this.entities[model_ref].visible = false;
    }

    change_model_state(
        model_ref: number,
        from: string,
        to: string
    ) {
        const obj = this.entities[model_ref];
        let repeat = false;        
        switch(to) {
            case 'idle':
            case 'walking':
            case 'celebrating':
                repeat = true;
                break;
            case 'dead':
                to = 'dying';
                break;
        }

        if(obj.userData.actions && to) {
            to = to[0].toUpperCase() + to.substring(1);

            const fromAction = (obj.userData.actions as Record<string, THREE.AnimationAction>)[obj.userData.action];
            const toAction = (obj.userData.actions as Record<string, THREE.AnimationAction>)[to];
            if(obj.userData.action !== to) {
                if(toAction) {
                    if(fromAction) {
                        fromAction.fadeOut(.1);
                    }
                    
                    toAction.loop = repeat? THREE.LoopRepeat: THREE.LoopOnce;
                    toAction.enabled = true;
                    toAction.clampWhenFinished = !repeat;
                    toAction.reset().fadeIn(0.1).play();
                    
                    obj.userData.action = to;
                }
            }
        }
    }

    set_model_position(
        model_ref: number,
        pos: Float32Array
    ) {
        const obj = this.entities[model_ref];
        if(obj.position.lengthSq() !== 0.0) {
            obj.position.lerp(
                new THREE.Vector3(
                    pos[0], 
                    pos[1] + (obj.userData.height||0.0) * 0.5, 
                    pos[2]
                ), 
                0.5
            );
        }
        else {
            obj.position.set(
                pos[0], 
                pos[1] + (obj.userData.height||0.0) * 0.5, 
                pos[2]
            );
        }
    }

    set_model_rotation(
        model_ref: number,
        q: Float32Array
    ) {
        const obj = this.entities[model_ref];
        obj.quaternion.slerp(
            new THREE.Quaternion(q[0], q[1], q[2], q[3]), 
            0.5
        );
    }

    set_model_scale(
        model_ref: number,
        scale: Float32Array
    ) {
        const obj = this.entities[model_ref];
        obj.scale.x = scale[0];
        obj.scale.y = scale[1];
        obj.scale.z = scale[2];
    }

    render(
    ) {
        if(this.skipping) {
            return;
        }

        let player: THREE.Object3D<THREE.Object3DEventMap>|undefined = undefined;
        if(this.pov.player_num !== undefined) {
            const players = this.entities.filter(o => o.userData.isPlayer);
            player = players[this.pov.player_num];

            if(!this.pov.rotate_cam) {
                this.camera.position.lerp(
                    new THREE.Vector3(
                        player.position.x + 5.0, 
                        player.position.y + 3.0, 
                        player.position.z + 5.0
                    ),
                    0.5
                );
            }
            
            this.controls?.target.lerp(
                new THREE.Vector3(
                    player.position.x, 
                    player.position.y, 
                    player.position.z
                ),
                0.5
            );
        }

        if(this.controls) {
            this.controls.autoRotate = this.pov.rotate_cam;
            this.controls.update();
        }

        let intersections: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]|undefined = undefined;

        if(player !== undefined) {
            const map = this.entities.find(o => o.userData.isMap);
            if(map) {
                const dir = player.position
                    .clone()
                    .sub(this.camera.position)
                    .normalize()

                this.raycaster.set(this.camera.position.clone(), dir);

                const maxDistance = this.camera.position.distanceTo(player.position);

                intersections = this.raycaster.intersectObject(map);
                for(const intersection of intersections) {
                    if(intersection.distance < maxDistance) {
                        const obj = intersection.object;
                        if(obj && (obj as any).isMesh) {
                            const mesh = obj as THREE.Mesh;
                            const material = Array.isArray(mesh.material)? mesh.material[0]: mesh.material;
                            if(!material.transparent) {
                                material.transparent = true;
                                material.needsUpdate = true;
                            }
                        }
                    }
                }
            }
        }

        for(const obj of this.entities) {
            if(obj.userData.anim){
                obj.userData.anim.update(1.0 / 60.0);
            }
        }

        this.renderer.render(this.scene, this.camera);

        if(intersections) {
            for(const intersection of intersections) {
                const obj = intersection.object;
                if(obj && (obj as any).isMesh) {
                    const mesh = obj as THREE.Mesh;
                    const material = Array.isArray(mesh.material)? mesh.material[0]: mesh.material;
                    if(material.transparent) {
                        material.transparent = false;
                        material.needsUpdate = true;
                    }
                }
            }
        }
    }
};