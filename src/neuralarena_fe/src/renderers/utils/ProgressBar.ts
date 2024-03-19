import * as THREE from 'three';

export class ProgressBar {
    scene: THREE.Scene;
    camera: THREE.Camera;
    progress: number;
    indicator: THREE.Object3D;

    constructor(
    ) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera();
        this.progress = 0.0;
        this.indicator = ProgressBar.#buildIndicator();
    }

    static #buildIndicator(
    ): THREE.Object3D {
        const geo = new THREE.BoxGeometry(2.0, 0.1, 0.1);
        const bar = new THREE.Mesh(
            geo, 
            new THREE.MeshBasicMaterial({
                color: 0x0000ff,
            })
        );
        
        bar.position.x = -1.0
        bar.scale.multiply(new THREE.Vector3(0.0, 1.0, 1.0));
        return bar;
    }

    onProgress(
        value: number
    ) {
        this.progress = value;
        this.indicator.scale.multiply(new THREE.Vector3(this.progress, 1.0, 1.0));
    }

    render(
        renderer: THREE.WebGLRenderer
    ) {
        renderer.render(this.scene, this.camera);
    }
}