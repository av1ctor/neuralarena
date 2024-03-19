import * as THREE from 'three';

export class LoadingBar {
    scene: THREE.Scene;
    camera: THREE.Camera;
    indicator: THREE.Mesh;

    constructor(
    ) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -1.0, 1.0, 1.0, -1.0, 0.1, 1.0
        );
        this.camera.position.set(0.0, 0.0, 1.0);

        const fillLight1 = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        fillLight1.position.set(0.0, 2.0, -2.0);
        this.scene.add(fillLight1);

        this.indicator = LoadingBar.#buildIndicator();
        this.scene.add(this.indicator);
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
        url: string,
        loaded: number,
        total: number
    ) {
        const progress = loaded / total;
        const geo = new THREE.BoxGeometry(2.0 * progress, 0.25, 0.1);
        this.indicator.geometry = geo;
    }

    render(
        renderer: THREE.WebGLRenderer
    ) {
        renderer.render(this.scene, this.camera);
    }
}