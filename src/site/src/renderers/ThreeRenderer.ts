import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { GameAssetType, EntityState } from "brains-engine";
import { Asset } from '../../../declarations/main/main.did';
import { gameAssetDataU32Value } from '../libs/games';

const loader = new GLTFLoader();

export class ThreeRenderer {
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

    constructor(
        canvas: HTMLCanvasElement
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
    }

    change_pov(
        player_num: number,
        rotate_cam?: boolean
    ) {
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
    ) {
        for(const obj of this.entities) {
            obj.removeFromParent();
        }
        this.entities = [];
        this.camera.position.set(15.0, 10.0, 15.0);
        this.pov = {
            player_num: undefined,
            rotate_cam: false
        };
    }

    async load_asset(
        asset_ref: number,
        asset: Asset
    ): Promise<void> {
        switch (Number(asset.typ)) {
            case GameAssetType.Level: {
                const gltf = await loader.loadAsync("/maps/level-0/map.gltf");
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
                break;
            }
            case GameAssetType.Player: {
                const zombies = ['man', 'girl', 'woman', 'boy'];
                const gltf = await loader.loadAsync(
                    `/models/zombies/${zombies[gameAssetDataU32Value(asset, 'num') || 0]}/default.gltf`
                );
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
                break;
            }
            case GameAssetType.Npc: {
                const npcs = ['man'];
                const gltf = await loader.loadAsync(
                    `/models/npcs/${npcs[0]}/default.gltf`
                );
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
                break;
            }
            case GameAssetType.Exit: {
                const geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x0000ff
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.visible = false;
                
                this.scene.add(mesh);
                this.assets.set(asset_ref, mesh);
                break;
            }
            default: {
                console.error("Unknown asset:" + asset_ref);
                throw new Error("Unknown asset: " + asset_ref);
            }
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

    change_state(
        model_ref: number,
        from: EntityState,
        to: EntityState
    ) {
        const obj = this.entities[model_ref];
        let action = undefined;
        let repeat = false;
        switch(to) {
            case EntityState.IDLE:
                action = 'Idle';
                repeat = true;
                break;
            case EntityState.WALKING:
                action = 'Walking';
                repeat = true;
                break;
            case EntityState.CELEBRATING:
                action = 'Celebrating';
                repeat = true;
                break;
            case EntityState.BITING:
                action = 'Biting';
                break;
            case EntityState.PUNCHING:
                action = 'Punching';
                break;
            case EntityState.HIT:
                action = 'Hit';
                break;
            case EntityState.DYING:
            case EntityState.DEAD:
                action = 'Dying';
                break;
            default:
                console.log(`Unknown: ${to}`);
                break;
        }

        if(obj.userData.actions && action) {
            const fromAction = (obj.userData.actions as Record<string, THREE.AnimationAction>)[obj.userData.action];
            const toAction = (obj.userData.actions as Record<string, THREE.AnimationAction>)[action];
            if(obj.userData.action !== action) {
                if(toAction) {
                    if(fromAction) {
                        fromAction.fadeOut(.1);
                    }
                    
                    toAction.loop = repeat? THREE.LoopRepeat: THREE.LoopOnce;
                    toAction.enabled = true;
                    toAction.clampWhenFinished = !repeat;
                    toAction.reset().fadeIn(0.1).play();
                    
                    obj.userData.action = action;
                }
            }
        }
    }

    set_position(
        model_ref: number,
        pos: Float32Array
    ) {
        const obj = this.entities[model_ref];
        obj.position.x = pos[0];
        if(obj.userData.height) {
            obj.position.y = pos[1] + obj.userData.height * 0.5; 
        }
        else {
            obj.position.y = pos[1];
        }
        obj.position.z = pos[2];
    }

    set_rotation(
        model_ref: number,
        q: Float32Array
    ) {
        const obj = this.entities[model_ref];
        obj.setRotationFromQuaternion(
            new THREE.Quaternion(q[0], q[1], q[2], q[3])
        );
    }

    set_scale(
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
        let player: THREE.Object3D<THREE.Object3DEventMap>|undefined = undefined;
        if(this.pov.player_num !== undefined) {
            const players = this.entities.filter(o => o.userData.isPlayer);
            player = players[this.pov.player_num];

            if(!this.pov.rotate_cam) {
                this.camera.position.set(
                    player.position.x + 5.0, 
                    player.position.y + 3.0, 
                    player.position.z + 5.0
                );
            }
            
            this.controls?.target.set(
                player.position.x, player.position.y, player.position.z
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