import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { Asset, GameInfo, MatchPlayerResponse } from '@declarations/neuralarena_be/neuralarena_be.did';
import { gameAssetDataTextValue, gameAssetDataU32Value } from '@libs/games';
import { GameAssetsLoadingManager, NftAssetsLoadingManager } from '@libs/loadingmanager';
import { principalToString } from '@libs/icp';
import { InstanceNpcEntity, InstancePlayerEntity } from '@game-engine/game-engine';

const HEALTH_BAR_WIDTH = 100.0;
const HEALTH_BAR_HEIGHT = 10.0;

export class ThreeGameRenderer {
    gameAssetLoader: GLTFLoader;
    nftAssetLoader: GLTFLoader;
    staticLoader: GLTFLoader;
    renderer: THREE.WebGLRenderer;
    main: {
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
    };
    start: {
        visible: boolean;
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
    };
    raycaster: THREE.Raycaster;
    controls?: OrbitControls;
    clock: THREE.Clock;
    width: number;
    height: number;
    assets: Map<number, THREE.Object3D>;
    models: THREE.Object3D[];
    pov: {
        player_num?: number,
        follow: boolean,
        auto_rotate: boolean,
    };
    skipping: boolean;
    fonts: Map<string, Font>;
    players: MatchPlayerResponse[];
    entities: {
        players: InstancePlayerEntity[],
        npcs: InstanceNpcEntity[],
        counters: {
            players: number,
            npcs: number,
        },
    };
    statusBars: {
        players: THREE.Object3D[],
        npcs: THREE.Object3D[],
    };

    constructor(
        canvas: HTMLCanvasElement,
        game: GameInfo,
        players: MatchPlayerResponse[]
    ) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.players = players;
        this.entities = {
            players: [],
            npcs: [],
            counters: {
                npcs: 0,
                players: 0,
            },
        };

        this.staticLoader = new GLTFLoader();

        const main = ThreeGameRenderer.#setupMain(this.width, this.height);
        this.main = {
            scene: main[0],
            camera: main[1]
        };

        const scenes_urls = new Map(game.urls.scenes)
        const start = ThreeGameRenderer.#setupStart(
            this.width, 
            this.height, 
            scenes_urls.get("start"),
            this.staticLoader
        );
        this.start = {
            visible: false,
            scene: start[0],
            camera: start[1]
        };
        
        this.renderer = new THREE.WebGLRenderer(
            {canvas, antialias: true});
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.LinearToneMapping;    
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        this.controls = this.renderer.domElement?
            new OrbitControls(this.main.camera, this.renderer.domElement):
            undefined;
        this.raycaster = new THREE.Raycaster();

        this.clock = new THREE.Clock();

        this.assets = new Map();
        this.models = [];

        this.pov = {
            player_num: undefined,
            follow: false,
            auto_rotate: false,
        };

        this.skipping = false;

        this.gameAssetLoader = new GLTFLoader(
            new GameAssetsLoadingManager(game.urls.assets)
        );
        this.nftAssetLoader = new GLTFLoader(
            new NftAssetsLoadingManager()
        );

        this.fonts = ThreeGameRenderer.#loadFonts();
        this.statusBars = {
            players: [],
            npcs: []
        };
    }

    static #setupMain(
        width: number,
        height: number
    ): [THREE.Scene, THREE.PerspectiveCamera] {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 100)

        const camera = new THREE.PerspectiveCamera(75.0, width / height, 0.1, 1000.0);
        camera.position.set(15.0, 10.0, 15.0);

        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0.0, 300.0, 0.0);
        scene.add(fillLight1);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 7.0);
        directionalLight.position.set(15.0, 30.0, 10.0);
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
        scene.add(directionalLight);

        return [scene, camera];
    }

    static #setupStart(
        width: number,
        height: number,
        start_url: string|undefined,
        loader: GLTFLoader
    ): [THREE.Scene, THREE.PerspectiveCamera] {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75.0, width / height, 0.1, 100.0);
        camera.position.set(0.0, 0.0, 2.0);

        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0.0, 300.0, 100.0);
        scene.add(fillLight1);

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

        loader.load(start_url ?? "/scenes/start.glb", (gltf) => {
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

            scene.add(obj);
            scene.userData.root = obj;
        });
    
        return [scene, camera];
    }

    static #loadFonts(
    ): Map<string, Font> {
        const fonts = new Map<string, any>();
        const loader = new FontLoader();
        loader.load("/fonts/gentilis.typeface.json", (font) => {
            fonts.set('gentilis', font);
        });
        
        return fonts;
    }

    showStart(
    ) {
        if(this.start.visible) {
            return;
        }

        const obj = this.start.scene.userData.root as THREE.Group<THREE.Object3DEventMap>;

        //
        const anim = obj.userData.anim as THREE.AnimationMixer;
        
        const self = this;
        const hideWhenFinished = () => {
            self.start.visible = false;
            anim.removeEventListener('finished', hideWhenFinished);
        };

        anim.addEventListener('finished', hideWhenFinished);

        //
        const action = obj.userData.action as THREE.AnimationAction;
        action.reset();
        action.play();
        action.enabled = true;
        
        this.start.visible = true;
    }

    #animStart(
    ) {
        const obj = this.start.scene.userData.root as THREE.Group<THREE.Object3DEventMap>;

        const anim = obj.userData.anim as THREE.AnimationMixer;
        anim.update(1.0 / 60.0);
    }

    changePOV(
        player_num?: number,
        rotate_cam?: boolean
    ) {
        if(player_num !== undefined) {
            const players = this.models.filter(o => o.userData.isPlayer);
            if(player_num >= 0 && player_num < players.length) {
                if(player_num !== this.pov.player_num || rotate_cam !== this.pov.auto_rotate) {
                    const player = players[player_num];
                    this.main.camera.position.set(
                        player.position.x + 0.0, 
                        player.position.y + 5.0, 
                        player.position.z + 5.0
                    );

                    this.pov = {
                        player_num,
                        follow: true,
                        auto_rotate: rotate_cam? true: false
                    };
                }
            }
        }
        else {
            this.pov = {
                player_num: this.pov.player_num,
                follow: this.pov.follow,
                auto_rotate: false
            };
        }
    }

    setSkipping(
        skipping: boolean
    ) {
        this.skipping = skipping;
    }

    resizeCanvas(
        dim: {w: number, h: number}
    ) {
        this.width = dim.w;
        this.height = dim.h;
        this.renderer.setSize(dim.w, dim.h);
        this.main.camera.aspect = dim.w / dim.h;
        this.main.camera.updateProjectionMatrix();
    }

    reset(
        reset_cam: boolean = true,
        reset_pov: boolean = true
    ) {
        for(const obj of this.models) {
            obj.removeFromParent();
        }
        this.models = [];

        this.entities.counters = {
            npcs: 0,
            players: 0,
        };

        if(reset_cam) {
            this.main.camera.position.set(15.0, 10.0, 15.0);
        }

        if(reset_pov) {
            this.pov = {
                player_num: undefined,
                follow: false,
                auto_rotate: false
            };
        }
    }

    async load_asset(
        asset_ref: number,
        asset: Asset
    ): Promise<void> {
        if('Map' in asset.typ) {
            const gltf = await this.gameAssetLoader.loadAsync(
                gameAssetDataTextValue(asset, 'path')!);
            const obj = gltf.scene;
            obj.traverse(child => {
                if((child as any).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const isContainer = mesh.name.toLowerCase().startsWith('container');
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    const material = Array.isArray(mesh.material)? 
                        mesh.material[0].clone(): 
                        mesh.material.clone();
                    if(isContainer){
                        material.transparent = false;
                        material.opacity = 0.25;
                    }
                    if((material as any).map) {
                        (material as any).map.anisotropy = 4;
                    }
                    mesh.material = material;
                    mesh.userData.isContainer = isContainer;
                }
            });

            obj.userData.isMap = true;

            this.assets.set(asset_ref, obj);
        }
        else if('Player' in asset.typ) {
            const gltf = await this.nftAssetLoader.loadAsync(
                gameAssetDataTextValue(asset, 'path')!);
            const obj = gltf.scene;
            obj.traverse(child => {
                if((child as any).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            obj.visible = false;

            obj.userData.isPlayer = true;
            obj.userData.num = gameAssetDataU32Value(asset, 'num')!;
            obj.userData.animations = gltf.animations;

            obj.scale.multiplyScalar(0.01);

            this.assets.set(asset_ref, obj);
        }
        else if('Npc' in asset.typ) {
            const gltf = await this.gameAssetLoader.loadAsync(
                gameAssetDataTextValue(asset, 'path')!);
            const obj = gltf.scene;
            obj.traverse(child => {
                if((child as any).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            obj.visible = false;

            obj.userData.isNpc = true;
            obj.userData.num = gameAssetDataU32Value(asset, 'num')!;
            obj.userData.animations = gltf.animations;

            obj.scale.multiplyScalar(0.011);

            this.assets.set(asset_ref, obj);
        }
        else if('Object' in asset.typ) {
            const geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
            const material = new THREE.MeshBasicMaterial({
                color: 0x0000ff
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.visible = false;
            
            this.main.scene.add(mesh);
            this.assets.set(asset_ref, mesh);
        }
        else {
            console.error("Unknown asset:" + asset_ref);
            throw new Error("Unknown asset: " + asset_ref);
        }
    }

    #buildStatusBar(
        obj: THREE.Object3D
    ): THREE.Object3D {
        const bar = new THREE.Group();
        
        // health bar
        const healthGeo = new THREE.BoxGeometry(HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, 1.0);
        const healthBar = new THREE.Mesh(
            healthGeo, 
            new THREE.MeshBasicMaterial({
                color: 0x00ff00,
            })
        );
        healthBar.position.copy(obj.position);
        healthBar.position.y = 200.0;
        bar.add(healthBar);

        const healthBarBorder = new THREE.Mesh(
            healthGeo,
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.5,
                transparent: true,
            })
        );
        healthBarBorder.position.copy(obj.position);
        healthBarBorder.position.y = 200.0;
        healthBarBorder.position.z = -1.0;
        bar.add(healthBarBorder);

        // player id
        if(obj.userData.isPlayer) {
            const name = principalToString(this.players[obj.userData.num].id);
            const textGeo = new TextGeometry(name, {
                font: this.fonts.get('gentilis')!,
                size: 14.0,
                height: 1.0,
                curveSegments: 4,
                bevelThickness: 2,
                bevelSize: 1.5,
                bevelEnabled: false

            });
            textGeo.computeBoundingBox();

            const textMat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
            })

            const centerOffset = -0.5 * (textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x);
            const playerName = new THREE.Mesh(textGeo, textMat);
            playerName.position.x = centerOffset;
            playerName.position.y = healthBar.position.y + 20.0;

            bar.add(playerName);
        }

        return bar;
    }

    add_model(
        asset_ref: number,
        model_ref: number
    ): number {
        const obj = this.assets.get(asset_ref);
        if(!obj) {
            console.error("Unknown asset:" + asset_ref);
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

            const statusBar = this.#buildStatusBar(cloned);
            if(cloned.userData.isPlayer) {
                this.statusBars.players[obj.userData.num] = statusBar;
            }
            else {
                this.statusBars.npcs[this.entities.counters.npcs] = statusBar;
                this.entities.counters.npcs += 1;
            }
            cloned.add(statusBar);
        }

        this.models[model_ref] = cloned;
        this.main.scene.add(cloned)
        return model_ref;
    }

    show_model(
        model_ref: number
    ) {
        this.models[model_ref].visible = true;
    }

    hide_model(
        model_ref: number
    ) {
        this.models[model_ref].visible = false;
    }

    change_model_state(
        model_ref: number,
        from: string,
        to: string
    ) {
        const obj = this.models[model_ref];
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
        const obj = this.models[model_ref];
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
        const obj = this.models[model_ref];
        obj.quaternion.slerp(
            new THREE.Quaternion(q[0], q[1], q[2], q[3]), 
            0.5
        );
    }

    set_model_scale(
        model_ref: number,
        scale: Float32Array
    ) {
        const obj = this.models[model_ref];
        obj.scale.x = scale[0];
        obj.scale.y = scale[1];
        obj.scale.z = scale[2];
    }

    set_players(
        players: InstancePlayerEntity[]
    ) {
        this.entities.players = players;
    }

    set_npcs(
        npcs: InstanceNpcEntity[]
    ) {
        this.entities.npcs = npcs;
    }

    #updateStatusBar(
        bar: THREE.Object3D<THREE.Object3DEventMap>| undefined,
        health: number
    ) {
        if(!bar) {
            return;
        }
        
        const healthBar = bar.children[0] as THREE.Mesh;
        if(health > 0.0) {
            const geo = new THREE.BoxGeometry(HEALTH_BAR_WIDTH * health, HEALTH_BAR_HEIGHT, 1.0);
            healthBar.geometry = geo;
            healthBar.position.x = -(HEALTH_BAR_WIDTH/2.0) * (1.0 - health);
        }
        else {
            healthBar.visible = false;
        }
    }

    #updateStatusBars(
    ) {
        for(let i = 0; i < this.entities.players.length; i++) {
            const player = this.entities.players[i];
            const bar = this.statusBars.players[i];
            this.#updateStatusBar(bar, player.health);
        }

        for(let i = 0; i < this.entities.npcs.length; i++) {
            const npc = this.entities.npcs[i];
            const bar = this.statusBars.npcs[i];
            this.#updateStatusBar(bar, npc.health);
        }
    }

    render(
    ) {
        if(this.skipping) {
            return;
        }

        this.#updateStatusBars();

        let player: THREE.Object3D<THREE.Object3DEventMap>|undefined = undefined;
        if(this.pov.player_num !== undefined) {
            const players = this.models.filter(o => o.userData.isPlayer);
            player = players[this.pov.player_num];

            if(!this.pov.auto_rotate && this.pov.follow) {
                this.main.camera.position.lerp(
                    new THREE.Vector3(
                        player.position.x + 0.0, 
                        player.position.y + 3.0, 
                        player.position.z - 2.5
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
            this.controls.autoRotate = this.pov.auto_rotate;
            this.controls.update();
        }

        let intersections: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]|undefined = undefined;

        if(player !== undefined) {
            const map = this.models.find(o => o.userData.isMap);
            if(map) {
                const dir = player.position
                    .clone()
                    .sub(this.main.camera.position)
                    .normalize()

                this.raycaster.set(this.main.camera.position.clone(), dir);

                const maxDistance = this.main.camera.position.distanceTo(player.position);

                intersections = this.raycaster.intersectObject(map);
                for(const intersection of intersections) {
                    if(intersection.distance < maxDistance) {
                        const obj = intersection.object;
                        if(obj && (obj as any).isMesh) {
                            const mesh = obj as THREE.Mesh;
                            if(mesh.userData.isContainer) {
                                const material = Array.isArray(mesh.material)? 
                                    mesh.material[0]: 
                                    mesh.material;
                                if(!material.transparent) {
                                    material.transparent = true;
                                    material.needsUpdate = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        for(const obj of this.models) {
            if(obj.userData.anim){
                obj.userData.anim.update(1.0 / 60.0);
            }
        }

        this.renderer.clear();
        this.renderer.render(this.main.scene, this.main.camera);
        if(this.start.visible) {
            this.#animStart();
            this.renderer.clearDepth();
            this.renderer.render(this.start.scene, this.start.camera);
        }

        if(intersections) {
            for(const intersection of intersections) {
                const obj = intersection.object;
                if(obj && (obj as any).isMesh) {
                    const mesh = obj as THREE.Mesh;
                    if(mesh.userData.isContainer) {
                        const material = Array.isArray(mesh.material)? 
                            mesh.material[0]: 
                            mesh.material;
                        if(material.transparent) {
                            material.transparent = false;
                            material.needsUpdate = true;
                        }
                    }
                }
            }
        }
    }
};