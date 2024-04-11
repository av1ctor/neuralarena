import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { 
    Asset, AssetValue, GameInfo, MatchPlayerResponse 
} from '@declarations/neuralarena_be/neuralarena_be.did';
import { 
    gameAssetDataMapValue, gameAssetDataTextValue, 
    gameAssetDataU32Value, gameAssetMapBoolValue, gameAssetMapTextValue 
} from '@libs/games';
import { GameAssetsLoadingManager, NftAssetsLoadingManager } from '@libs/loadingmanager';
import { InstanceNpcEntity, InstancePlayerEntity } from '@game-engine/game-engine';
import { AnimScene } from './utils/AnimScene';
import { EntityStatusBarManager } from './utils/EntityStatusBarMng';
import { LoadingBar } from './utils/LoadingBar';
import { PosAudioRef, PositionalAudioManager } from './utils/PosAudioMng';
import { FixAudioRef, FixedAudioManager } from './utils/FixAudioMng';

const HEALTH_BAR_WIDTH = 100.0;
const HEALTH_BAR_HEIGHT = 10.0;

const DEFAULT_CAM_ZOOM = 8.0;
const CAM_MIN_ZOOM = 4.0;
const CAM_MAX_ZOOM = 30.0;

interface AudioBuffer {
    buffer: any;
    repeat: boolean;
}

export class ThreeGameRenderer {
    game: GameInfo;
    gameModelLoader: GLTFLoader;
    nftModelLoader: GLTFLoader;
    audioLoader: THREE.AudioLoader;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    posAudioMng: PositionalAudioManager;
    fixAudioMng: FixedAudioManager;
    start?: AnimScene;
    raycaster: THREE.Raycaster;
    clock: THREE.Clock;
    width: number;
    height: number;
    assets: Map<number, THREE.Object3D>;
    models: THREE.Object3D[];
    pov: {
        player_num?: number,
        follow: boolean,
        auto_rotate: boolean,
        camera_angle: number;
        camera_zoom: number;
    };
    skipping: boolean;
    font: Font;
    players: MatchPlayerResponse[];
    entities: {
        players: InstancePlayerEntity[],
        npcs: InstanceNpcEntity[],
    };
    statusMng: EntityStatusBarManager;
    loading: boolean;
    loadingBar: LoadingBar;
    songRefs: Map<string, FixAudioRef>;
    curSong?: FixAudioRef;

    constructor(
        canvas: HTMLCanvasElement,
        game: GameInfo,
        players: MatchPlayerResponse[],
        pov: number|undefined,
        font: Font
    ) {
        this.game = game;
        
        this.width = canvas.width;
        this.height = canvas.height;
        this.players = players;
        this.entities = {
            players: [],
            npcs: [],
        };

        this.loading = true;
        this.loadingBar = new LoadingBar(font);

        this.gameModelLoader = new GLTFLoader(
            new GameAssetsLoadingManager(
                game.urls.assets,
                (url, loaded, total) => this.loadingBar.onProgress(url, loaded, total)
            )
        );

        this.audioLoader = new THREE.AudioLoader();

        const res = ThreeGameRenderer.#setup(this.width, this.height);
        this.scene = res[0];
        this.camera = res[1];
        this.posAudioMng = new PositionalAudioManager(res[2]);
        this.fixAudioMng = new FixedAudioManager(res[2]);

        this.renderer = new THREE.WebGLRenderer(
            {canvas, antialias: true});
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.LinearToneMapping;    
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        this.raycaster = new THREE.Raycaster();

        this.clock = new THREE.Clock();

        this.assets = new Map();
        this.models = [];

        this.pov = {
            player_num: pov,
            follow: pov !== undefined,
            auto_rotate: false,
            camera_angle: 0.0,
            camera_zoom: DEFAULT_CAM_ZOOM,
        };

        this.skipping = false;

        this.nftModelLoader = new GLTFLoader(
            new NftAssetsLoadingManager(
                (url, loaded, total) => this.loadingBar.onProgress(url, loaded, total)
            )
        );

        this.font = font;
        this.statusMng = new EntityStatusBarManager(
            HEALTH_BAR_WIDTH, 
            HEALTH_BAR_HEIGHT, 
            this.font
        );

        this.songRefs = new Map();
    }

    async loadStartScene(
    ) {
        const scenes_urls = new Map(this.game.urls.scenes)
        const startScene = scenes_urls.get("start");
        this.start = new AnimScene(this.width, this.height);

        await this.start.loadAssets(
            startScene?
                startScene.model:
                "/scenes/start/start.gltf",
            startScene? 
                startScene.music.length > 0? 
                    startScene.music[0]: 
                    undefined: 
                "/scenes/start/countdown.ogg",
            startScene? 
                this.gameModelLoader: 
                new GLTFLoader(),
            this.audioLoader
        );
    }

    static #setup(
        width: number,
        height: number
    ): [
        THREE.Scene, 
        THREE.PerspectiveCamera, 
        THREE.AudioListener
    ] {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 100)

        //FIXME: this should be defined at the GLTF
        const camera = new THREE.PerspectiveCamera(75.0, width / height, 0.1, 1000.0);
        camera.position.set(15.0, 10.0, 15.0);

        const listener = new THREE.AudioListener();
        camera.add(listener);

        //FIXME: this should be defined at the GLTF
        const fillLight1 = new THREE.HemisphereLight(0x88ccee, 0xffffff, 2.0);
        fillLight1.position.set(0.0, 300.0, 0.0);
        scene.add(fillLight1);

        //FIXME: this should be defined at the GLTF
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

        return [scene, camera, listener];
    }

    toggleLoading(
        to: boolean
    ) {
        this.loading = to;
    }

    showStart(
    ) {
        this.start?.show();
    }

    changePOV(
        player_num?: number,
        rotate_cam?: boolean
    ) {
        if(player_num !== undefined) {
            if(player_num !== this.pov.player_num || rotate_cam !== this.pov.auto_rotate) {
                this.pov = {
                    ...this.pov,
                    player_num,
                    follow: true,
                    auto_rotate: rotate_cam? true: false,
                    camera_angle: 0.0,
                };
            }
        }
        else {
            this.pov = {
                ...this.pov,
                auto_rotate: false,
                camera_angle: 0.0,
            };
        }
    }

    decZoom(
    ) {
        this.pov.camera_zoom = Math.max(
            this.pov.camera_zoom - 1.0, 
            CAM_MIN_ZOOM
        );
    }

    incZoom(
    ) {
        this.pov.camera_zoom = Math.min(
            this.pov.camera_zoom + 1.0, 
            CAM_MAX_ZOOM
        );
    }

    setSkipping(
        skipping: boolean
    ) {
        this.skipping = skipping;
    }

    stopPositionalAudio(
    ) {
        this.posAudioMng.reset();
    }

    stopFixedAudio(
    ) {
        this.fixAudioMng.reset();
    }
    
    playMusic(
        song: string
    ) {
        const newSong = this.songRefs.get(song);
        if(newSong !== this.curSong) {
            if(this.curSong !== undefined) {
                this.fixAudioMng.stop(this.curSong);
            }
            if(newSong !== undefined) {
                this.fixAudioMng.play(newSong);
            }
            this.curSong = newSong;
        }
    }

    resizeCanvas(
        dim: {w: number, h: number}
    ) {
        this.width = dim.w;
        this.height = dim.h;
        this.renderer.setSize(dim.w, dim.h);
        this.camera.aspect = dim.w / dim.h;
        this.camera.updateProjectionMatrix();

        this.start?.resizeCanvas(dim);
    }

    reset(
        reset_cam: boolean,
        reset_pov: boolean,
        pov: number|undefined
    ) {
        for(const obj of this.models) {
            obj.removeFromParent();
        }
        this.models = [];

        this.statusMng.reset();

        this.posAudioMng.reset();

        if(reset_cam) {
            this.camera.position.set(15.0, 10.0, 15.0);
        }

        if(reset_pov) {
            this.pov = {
                player_num: pov,
                follow: pov !== undefined,
                auto_rotate: false,
                camera_angle: 0.0,
                camera_zoom: DEFAULT_CAM_ZOOM,
            };
        }
    }

    async #setupSfxsBufferSet(
        asset: Asset
    ): Promise<Map<string, AudioBuffer>> {
        const map = gameAssetDataMapValue(asset, 'sfx_set');
        const res = new Map<string, AudioBuffer>();
        for(const e of map) {
            const sfx = 'Map' in e[1]? 
                e[1].Map as [string, AssetValue][]: 
                [];
            
            const buffer = await this.audioLoader.loadAsync(
                gameAssetMapTextValue(sfx, 'url')!
            );

            res.set(
                e[0], 
                {
                    buffer,
                    repeat: gameAssetMapBoolValue(sfx, 'repeat')
                }
            );
        }

        return res;
    }

    async #setupSongsBufferSet(
        asset: Asset
    ): Promise<Map<string, any>> {
        const map = new Map(gameAssetDataMapValue(asset, 'music_urls'));
        const songs = await Promise.all([
            this.audioLoader.loadAsync((map.get("main") as any)['Text']),
            this.audioLoader.loadAsync((map.get("over") as any)['Text']),
            this.audioLoader.loadAsync((map.get("victory") as any)['Text']),
        ]);
        
        const res = new Map([
            ["main"     , songs[0]],
            ["over"     , songs[1]],
            ["victory"  , songs[2]],
        ]);
        
        return res;
    }

    #shadowish(
        obj: THREE.Group<THREE.Object3DEventMap>
    ) {
        if((obj as any).isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }

        obj.traverse(child => {
            if((child as any).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    async load_asset(
        asset_ref: number,
        asset: Asset
    ): Promise<void> {
        if('Map' in asset.typ) {
            const gltf = await this.gameModelLoader.loadAsync(
                gameAssetDataTextValue(asset, 'model_url')!);
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
                    mesh.userData = {
                        isContainer,
                    };
                }
            });

            const songs = await this.#setupSongsBufferSet(asset);

            this.songRefs = new Map([
                ["main", this.fixAudioMng.create(songs.get("main")!, true, 0.1)],
                ["over", this.fixAudioMng.create(songs.get("over")!, true, 0.1)],
                ["victory", this.fixAudioMng.create(songs.get("victory")!, true, 0.1)],
            ]);

            obj.userData = {
                isMap: true,
            };

            this.assets.set(asset_ref, obj);
        }
        else if('Player' in asset.typ) {
            const gltf = await this.nftModelLoader.loadAsync(
                gameAssetDataTextValue(asset, 'model_url')!);
            const obj = gltf.scene;
            this.#shadowish(obj);
            obj.visible = false;

            obj.userData = {
                isPlayer: true,
                num: gameAssetDataU32Value(asset, 'num')!,
                animations: gltf.animations,
                audioBufferSet: await this.#setupSfxsBufferSet(asset),
            };

            obj.scale.multiplyScalar(0.01);

            this.assets.set(asset_ref, obj);
        }
        else if('Npc' in asset.typ) {
            const gltf = await this.gameModelLoader.loadAsync(
                gameAssetDataTextValue(asset, 'model_url')!);
            const obj = gltf.scene;
            this.#shadowish(obj);
            obj.visible = false;

            obj.userData = {
                isNpc: true,
                num: gameAssetDataU32Value(asset, 'num')!,
                animations: gltf.animations,
                audioBufferSet: await this.#setupSfxsBufferSet(asset),
            };

            obj.scale.multiplyScalar(0.011);

            this.assets.set(asset_ref, obj);
        }
        else if('Object' in asset.typ) {
            const gltf = await this.gameModelLoader.loadAsync(
                gameAssetDataTextValue(asset, 'model_url')!);
            const obj = gltf.scene;
            this.#shadowish(obj);
            obj.visible = false;
            
            this.scene.add(obj);
            this.assets.set(asset_ref, obj);
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
        const asset = this.assets.get(asset_ref);
        if(!asset) {
            console.error("Unknown asset:" + asset_ref);
            throw new Error("Unknown asset: " + asset_ref);
        }
        
        const model = cloneSkeleton(asset);
        if(model.userData.isPlayer || model.userData.isNpc) {
            const anim = new THREE.AnimationMixer(model);
            model.userData.anim = anim;

            let actions = Object.assign({});
            for(const clip of asset.userData.animations) {
                const action = anim.clipAction(clip);
                actions[clip.name] = action;
            }

            model.userData.actions = actions;
            model.userData.action = 'Idle';
            (model.userData.actions as any)[model.userData.action]?.play();

            const statusBar = this.statusMng.add(model, this.players);
            model.add(statusBar);

            // sfx?
            if(asset.userData.audioBufferSet) {
                const audioSet = new Map<string, PosAudioRef>();
                for(const e of asset.userData.audioBufferSet as Map<string, AudioBuffer>) {
                    const audioRef = this.posAudioMng.create(e[1].buffer, e[1].repeat, 1.0);
                    audioSet.set(e[0], audioRef);
                    model.add(this.posAudioMng.get(audioRef)!);
                }
                model.userData.audioSet = audioSet;
            }
        }

        this.models[model_ref] = model;
        this.scene.add(model)
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

            const actions = (obj.userData.actions as Record<string, THREE.AnimationAction>);
            const fromAction = actions[obj.userData.action];
            const toAction = actions[to];
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

                    // play sound
                    if(!this.skipping && obj.userData.audioSet) {
                        const audioSet = obj.userData.audioSet as Map<string, PosAudioRef>;
                        const audioRef = audioSet.get(to.toLowerCase());
                        if(audioRef) {
                            if(obj.userData.audioRef) {
                                this.posAudioMng.stop(obj.userData.audioRef);
                            }
                            obj.userData.audioRef = audioRef;

                            this.posAudioMng.play(audioRef);
                        }
                    }
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
                new THREE.Vector3(pos[0], pos[1], pos[2]), 
                0.5
            );
        }
        else {
            obj.position.set(pos[0], pos[1], pos[2]);
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

    update(
        deltaTime: number
    ) {
        this.statusMng.update(this.entities.players, this.entities.npcs);

        for(const obj of this.models) {
            if(obj.userData.anim){
                obj.userData.anim.update(deltaTime / 1000.0);
            }
        }

        this.start?.update(deltaTime);
    }

    render(
    ) {
        if(this.skipping) {
            return;
        }
                
        if(this.loading) {
            this.loadingBar.render(this.renderer);
            return;
        }

        let player: THREE.Object3D<THREE.Object3DEventMap>|undefined = undefined;
        if(this.pov.player_num !== undefined) {
            const players = this.models.filter(o => o.userData.isPlayer);
            player = players[this.pov.player_num];

            if(this.pov.auto_rotate) {
                this.pov.camera_angle = (this.pov.camera_angle + 0.02) % (Math.PI * 2.0);
            }
            else if(this.pov.follow) {
                this.pov.camera_angle = THREE.MathUtils.lerp(this.pov.camera_angle, player.rotation.y, 0.05);
            }

            if(this.pov.auto_rotate || this.pov.follow) {
                this.camera.position.setFromSphericalCoords(this.pov.camera_zoom, 1.0, this.pov.camera_angle);
                this.camera.position.add(player.position);
                this.camera.lookAt(player.position);
            }
        }

        let intersections: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]|undefined = undefined;

        if(player !== undefined) {
            const map = this.models.find(o => o.userData.isMap);
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

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        this.start?.render(this.renderer);

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