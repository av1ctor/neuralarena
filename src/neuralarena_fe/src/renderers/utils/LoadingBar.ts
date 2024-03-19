import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

export class LoadingBar {
    scene: THREE.Scene;
    camera: THREE.Camera;
    bar: THREE.Mesh;
    font: Font;
    lastUrl: string|undefined;

    constructor(
        font: Font
    ) {
        this.font = font;

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -1.0, 1.0, 1.0, -1.0, 0.1, 1.0
        );
        this.camera.position.set(0.0, 0.0, 1.0);

        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0.0, 2.0, -2.0);
        this.scene.add(fillLight1);

        this.bar = LoadingBar.#buildIndicator();
        this.scene.add(this.bar);
    }

    static #buildIndicator(
    ): THREE.Mesh {
        const geo = new THREE.BoxGeometry(0.0, 0.25, 0.1);
        const bar = new THREE.Mesh(
            geo, 
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
            })
        );
        return bar;
    }

    onProgress(
        _url: string,
        loaded: number,
        total: number
    ) {
        const progress = loaded / total;
        const w = 2.0 * progress;
        const geo = new THREE.BoxGeometry(w, 0.25, 0.1);
        this.bar.geometry = geo;
        this.bar.position.x = -1.0 + w / 2.0;
    }

    render(
        renderer: THREE.WebGLRenderer
    ) {
        renderer.render(this.scene, this.camera);
    }
}