import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { GameAssetType, ObjectState } from "brains-engine";
import { Asset } from '../../../declarations/main/main.did';
import { gameAssetDataU32Value } from '../libs/games';

const loader = new GLTFLoader();

export class ThreeRenderer {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    clock: THREE.Clock;
    width: number;
    height: number;
    assets: Array<THREE.Object3D>;
    objects: THREE.Object3D[];
    pov?: THREE.Vector3;

    constructor(
        canvas: HTMLCanvasElement
    ) {
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x88ccee);
        this.scene.fog = new THREE.Fog(0x88ccee, 0, 100)

        this.camera = new THREE.PerspectiveCamera(75.0, this.width / this.height, 0.1, 1000.0);
        this.camera.position.x = 30.0;
        this.camera.position.y = 10.0;
        this.camera.position.z = 30.0;

        this.renderer = new THREE.WebGLRenderer(canvas? {canvas, antialias: true}: {antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.LinearToneMapping;    
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 6.0);
        fillLight1.position.set(0, 300, 0);
        this.scene.add(fillLight1);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
        directionalLight.position.set(15, 30, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500.0;
        directionalLight.shadow.camera.right = 60.0;
        directionalLight.shadow.camera.left = -60.0;
        directionalLight.shadow.camera.top = 60.0;
        directionalLight.shadow.camera.bottom = -60.0;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = -0.00006;
        this.scene.add(directionalLight);

        this.controls = this.renderer.domElement?
            new OrbitControls(this.camera, this.renderer.domElement):
            undefined;

        this.clock = new THREE.Clock();

        this.assets = [];
        this.objects = [];

        this.pov = undefined;
    }

    change_pov(
        pov: number
    ) {
        const players = this.objects.filter(o => o.userData.isPlayer);
        if(pov >= 0 && pov < players.length) {
            const player = players[pov];
            this.pov = player.position;
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
        for(const obj of this.objects) {
            obj.removeFromParent();
        }
        this.objects = [];
    }

    async load_asset(
        asset_ref: number,
        asset: Asset
    ): Promise<void> {
        switch (Number(asset.typ)) {
            case GameAssetType.Level: {
                const gltf = await loader.loadAsync("/maps/level-0/map.gltf");
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

                this.assets[asset_ref] = obj;
                break;
            }
            case GameAssetType.Player: {
                const zombies = ['man', 'girl', 'woman', 'boy'];
                const gltf = await loader.loadAsync(
                    `/models/zombie-${zombies[gameAssetDataU32Value(asset, 'num') || 0]}/default.gltf`
                );
                const obj = gltf.scene;
                obj.traverse(child => {
                    if((child as any).isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                obj.visible = false;
                obj.scale.multiplyScalar(0.01);

                obj.userData.animations = gltf.animations;
                obj.userData.isPlayer = true;
                const bb = new THREE.Box3().setFromObject(obj);
                obj.userData.height = (bb.max.y - bb.min.y) * 100.0;

                this.assets[asset_ref] = obj;
                break;
            }
            case GameAssetType.Key: {
                const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xff0000
                });
                const obj = new THREE.Mesh(geometry, material);
                obj.visible = false;
                
                this.scene.add(obj);
                this.assets[asset_ref] = obj;
                break;
            }
            case GameAssetType.Exit: {
                const geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x0000ff
                });
                const obj = new THREE.Mesh(geometry, material);
                obj.visible = false;
                
                this.scene.add(obj);
                this.assets[asset_ref] = obj;
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
        const obj = this.assets[asset_ref];
        if(!obj) {
            throw new Error("Unknown asset: " + asset_ref);
        }
        
        const cloned = cloneSkeleton(obj);
        if(cloned.userData.isPlayer) {
            const anim = new THREE.AnimationMixer(cloned);
            cloned.userData.anim = anim;

            let actions = Object.assign({});
            for(const clip of obj.userData.animations) {
                const action = anim.clipAction(clip);
                actions[clip.name] = action;
            }

            cloned.userData.actions = actions;
            cloned.userData.activeAction = 'Idle';
            (cloned.userData.actions as any)[cloned.userData.activeAction]?.play();
        }

        this.objects[model_ref] = cloned;
        this.scene.add(cloned)
        return model_ref;
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

    change_state(
        model_ref: number,
        _from: ObjectState,
        to: ObjectState
    ) {
        const obj = this.objects[model_ref];
        let toAction = undefined;
        switch(to) {
            case ObjectState.MOVING:
                toAction = 'Walking';
                break;
            case ObjectState.EATING:
                toAction = 'Eating';
                break;
            case ObjectState.CELEBRATING:
                toAction = 'Celebrating';
                break;
        }

        if(obj.userData.actions && toAction) {
            const from = (obj.userData.actions as any)[obj.userData.activeAction];
            const to = (obj.userData.actions as any)[toAction];
            if(from) {
                to?.crossFadeFrom(from, 0.5, false);
            }
            if(to) {
                to.play();
                to.enabled = true;
            }
            obj.userData.activeAction = toAction;
        }
    }

    set_position(
        model_ref: number,
        pos: Float32Array
    ) {
        const obj = this.objects[model_ref];
        obj.position.x = pos[0];
        if(obj.userData.isPlayer) {
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
        const obj = this.objects[model_ref];
        obj.setRotationFromQuaternion(
            new THREE.Quaternion(q[0], q[1], q[2], q[3])
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
        if(this.pov) {
            this.controls?.target.set(this.pov.x, this.pov.y, this.pov.z);
        }
        this.controls?.update();

        for(const obj of this.objects) {
            if(obj.userData.anim){
                obj.userData.anim.update(1.0 / 60.0);
            }
        }
        this.renderer.render(this.scene, this.camera);
    }
};