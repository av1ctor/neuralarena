import * as THREE from 'three';

export type PosAudioRef = number;

export class PositionalAudioManager {
    #listener: THREE.AudioListener;
    #audios: THREE.PositionalAudio[];
    
    constructor (
        listener: THREE.AudioListener
    ) {
        this.#listener = listener;
        this.#audios = [];
    }

    create(
        buffer: any,
        repeat: boolean,
        volume: number
    ): PosAudioRef {
        const audio = new THREE.PositionalAudio(this.#listener);
        audio.setBuffer(buffer);
        audio.setLoop(repeat);
        audio.setVolume(volume);
        const ref = this.#audios.length;
        this.#audios.push(audio);

        return ref;
    }
    
    get(
        ref: PosAudioRef
    ): THREE.PositionalAudio|undefined {
        return this.#audios[ref];
    }

    play(
        ref: PosAudioRef
    ) {
        const audio = this.#audios[ref];
        if(audio) {
            if(!audio.isPlaying) {
                audio.play();
            }
        }
    }

    stop(
        ref: PosAudioRef
    ) {
        const audio = this.#audios[ref];
        if(audio) {
            if(!audio.isPlaying) {
                audio.stop();
            }
        }
    }

    reset(
    ) {
        for(const audio of this.#audios) {
            if(audio && audio.isPlaying) {
                audio.stop();
            }
        }
    }
}