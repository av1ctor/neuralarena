import * as THREE from 'three';

export type AudioRef = number;

export class SoundManager {
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
        repeat: boolean
    ): AudioRef {
        const audio = new THREE.PositionalAudio(this.#listener);
        audio.setBuffer(buffer);
        audio.setLoop(repeat);
        const ref = this.#audios.length;
        this.#audios.push(audio);

        return ref;
    }

    get(
        ref: AudioRef
    ): THREE.PositionalAudio|undefined {
        return this.#audios[ref];
    }

    play(
        ref: AudioRef
    ) {
        const audio = this.#audios[ref];
        if(audio) {
            if(!audio.isPlaying) {
                audio.play();
            }
        }
    }

    stop(
        ref: AudioRef
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