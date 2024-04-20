import { InstanceNpcEntity, InstancePlayerEntity } from "@game-engine/game-engine";
import { EntityStatusBar } from "./EntityStatusBar";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { MatchPlayerResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

export class EntityStatusBarManager {
    width: number;
    height: number;
    font: Font;
    bars: {
        players: EntityStatusBar[],
        npcs: EntityStatusBar[],
    };
    counters: {
        npcs: number,
    };

    constructor(
        width: number,
        height: number,
        font: Font
    ) {
        this.width = width;
        this.height = height;
        this.font = font;
        this.bars = {
            players: [],
            npcs: []
        };
        this.counters = {
            npcs: 0
        };
    }

    reset() {
        this.bars = {
            players: [],
            npcs: []
        };
        this.counters = {
            npcs: 0
        };
    }

    add(
        obj: THREE.Object3D,
        players: MatchPlayerResponse[],
    ): THREE.Object3D {
        const bar = new EntityStatusBar(
            this.width, 
            this.height, 
            this.font, 
            obj, 
            obj.userData.isPlayer? 
                players[obj.userData.num].id: 
                undefined
        );

        if(obj.userData.isPlayer) {
            this.bars.players[obj.userData.num] = bar;
        }
        else {
            this.bars.npcs[this.counters.npcs] = bar;
            this.counters.npcs += 1;
        }

        return bar.bar;
    }

    update(
        pov: number,        
        players: InstancePlayerEntity[],
        npcs: InstanceNpcEntity[],
    ) {
        for(let i = 0; i < players.length; i++) {
            const player = players[i];
            const bar = this.bars.players[i];
            bar.update(player.health / 100.0, player.health > 0.0 && i !== pov);
        }

        for(let i = 0; i < npcs.length; i++) {
            const npc = npcs[i];
            const bar = this.bars.npcs[i];
            bar.update(npc.health / 100.0, npc.health > 0.0);
        }
    }
}