import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { principalToString } from '@libs/icp';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { Principal } from '@dfinity/principal';

export class EntityStatusBar {
    bar: THREE.Object3D<THREE.Object3DEventMap>;
    width: number;
    height: number;

    constructor(
        width: number,
        height: number,
        font: Font,
        obj: THREE.Object3D,
        playerId: Principal|undefined
    ) {
        const bar = new THREE.Group();
        
        // health bar
        const healthBar = EntityStatusBar.#buildHealthBar(width, height, obj);
        bar.add(healthBar);

        // player id
        if(playerId !== undefined) {
            const playerName = EntityStatusBar.#buildPlayerName(playerId, font);
            console.log(playerName)
            healthBar.add(playerName);
        }

        this.bar = bar;
        this.width = width;
        this.height = height;
    }

    static #buildHealthBar(
        width: number,
        height: number,
        obj: THREE.Object3D
    ): THREE.Object3D {
        const geo = new THREE.BoxGeometry(width, height, 1.0);
        
        const bg = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.5,
                transparent: true,
            })
        );
        bg.position.copy(obj.position);
        bg.position.y = 200.0;

        const bar = new THREE.Mesh(
            geo, 
            new THREE.MeshBasicMaterial({
                color: 0x00ff00,
            })
        );
        bar.position.z = 1.0;

        bg.add(bar);

        return bg;
    }

    static #buildPlayerName(
        playerId: Principal,
        font: Font
    ): THREE.Object3D {
        
        const name = principalToString(playerId);
        const geo = new TextGeometry(
            name, 
            {
                font,
                size: 14.0,
                height: 1.0,
                curveSegments: 4,
                bevelThickness: 2,
                bevelSize: 1.5,
                bevelEnabled: false

            }
        );
        
        geo.computeBoundingBox();

        const centerOffset = -0.5 * (geo.boundingBox!.max.x - geo.boundingBox!.min.x);
        const mesh = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
            })
        );
        mesh.position.x = centerOffset;
        mesh.position.y = 20.0;

        return mesh;
    }

    update(
        health: number
    ) {
        if(!this.bar) {
            return;
        }
        
        const healthBar = this.bar.children[0].children[0] as THREE.Mesh;
        if(health > 0.0) {
            const geo = new THREE.BoxGeometry(this.width * health, this.height, 1.0);
            healthBar.geometry = geo;
            healthBar.position.x = -(this.width/2.0) * (1.0 - health);
        }
        else {
            healthBar.visible = false;
        }
    }


}