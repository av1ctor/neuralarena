import * as THREE from 'three';

export type FixAudioRef = number;

export class FixedAudioManager {
    #listener: THREE.AudioListener;
    #audios: THREE.Audio[];
    
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
    ): FixAudioRef {
        const audio = new THREE.Audio(this.#listener);
        audio.setBuffer(buffer);
        audio.setLoop(repeat);
        audio.setVolume(volume);
        const ref = this.#audios.length;
        this.#audios.push(audio);

        return ref;
    }
    
    get(
        ref: FixAudioRef
    ): THREE.Audio|undefined {
        return this.#audios[ref];
    }

    play(
        ref: FixAudioRef
    ) {
        const audio = this.#audios[ref];
        if(audio) {
            if(!audio.isPlaying) {
                audio.play();
            }
        }
    }

    stop(
        ref: FixAudioRef
    ) {
        const audio = this.#audios[ref];
        if(audio) {
            if(audio.isPlaying) {
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