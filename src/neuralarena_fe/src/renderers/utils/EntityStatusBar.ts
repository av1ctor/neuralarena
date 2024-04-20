import * as THREE from 'three';
import { principalToString } from '@libs/icp';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { Principal } from '@dfinity/principal';
import { fontBuildText } from '@hooks/font';

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
        
        const mesh = fontBuildText(principalToString(playerId), font);
        mesh.position.y = 20.0;
        return mesh;
    }

    update(
        health: number,
        visible: boolean
    ) {
        if(!this.bar) {
            return;
        }

        this.bar.visible = visible;
        
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