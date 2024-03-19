import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

const BAR_WIDTH = 1.5;
const BAR_HEIGHT = 0.1;

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
        this.scene.background = new THREE.Color(0x88ccee);

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
        const bb = new THREE.Mesh(
            new THREE.BoxGeometry(BAR_WIDTH, BAR_HEIGHT, 0.1), 
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.5,
                transparent: true,
            })

        );

        const fb = new THREE.Mesh(
            new THREE.BoxGeometry(0.0, BAR_HEIGHT, 0.1), 
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
            })
        );
        fb.position.z = 0.1;

        bb.add(fb);

        return bb;
    }

    onProgress(
        _url: string,
        loaded: number,
        total: number
    ) {
        const progress = loaded / total;
        const w = BAR_WIDTH * progress;
        const geo = new THREE.BoxGeometry(w, BAR_HEIGHT, 0.1);
        const fb = (this.bar.children[0] as THREE.Mesh);
        fb.geometry = geo;
        fb.position.x = -(BAR_WIDTH / 2.0) + w / 2.0;
    }

    render(
        renderer: THREE.WebGLRenderer
    ) {
        renderer.render(this.scene, this.camera);
    }
}