import * as THREE from 'three';

const POS_OFFSET = new THREE.Vector3(-0.5, 3.0, -4.0);
const LOOKAT_OFFSET = new THREE.Vector3(0.0, 0.0, 8.0);
const PLAYER_HEIGHT = new THREE.Vector3(0.0, 2.0, 0.0);

export class ThirdPersonCamera {
    #camera: THREE.PerspectiveCamera;
    #target: THREE.Object3D;
    #zoom: number;
    #pos: THREE.Vector3;
    #lookAt: THREE.Vector3;
    #autorot: boolean;
    #angle: number;

    constructor(
        camera: THREE.PerspectiveCamera, 
        target?: THREE.Object3D,
        zoom?: number
    ) {
        this.#camera = camera;
        this.#target = target ?? this.#defaultTarget();
        this.#zoom = zoom ?? 1.0;
        this.#pos = new THREE.Vector3();
        this.#lookAt = new THREE.Vector3();
        this.#autorot = false;
        this.#angle = 0.0;
    }

    getCamera(
    ): THREE.PerspectiveCamera {
        return this.#camera;
    }

    setTarget(
        target?: THREE.Object3D,
    ) {
        this.#target = target ?? this.#defaultTarget();
    }

    setZoom(
        zoom: number,
    ) {
        this.#zoom = zoom;
    }

    setAutoRot(
        to: boolean
    ) {
        this.#autorot = to;
        this.#angle = 0.0;
    }

    #defaultTarget() {
        const target = new THREE.Object3D()
        target.position.set(0.0, 200.0, 0.0);
        return target;
    }

    #calcPos(
        deltaTime: number
    ): THREE.Vector3 {
        if(this.#autorot) {
            this.#angle = (this.#angle + (deltaTime / 2000.0)) % (Math.PI * 2.0);

            return new THREE.Vector3()
                .setFromSphericalCoords(8.0, 1.0, this.#angle)
                .multiplyScalar(this.#zoom)
                .add(this.#target.position);
        }
        else {
            return POS_OFFSET.clone()
                .multiplyScalar(this.#zoom)
                .applyQuaternion(this.#target.quaternion)
                .add(this.#target.position);
        }
    }

    #calcLookAt(
    ): THREE.Vector3 {
        if(this.#autorot) {
            return this.#target.position.clone()
                .add(PLAYER_HEIGHT);
        }
        else {
            return LOOKAT_OFFSET.clone()
                .applyQuaternion(this.#target.quaternion)
                .add(this.#target.position)
                .add(PLAYER_HEIGHT);
        }
    }

    update(
        deltaTime: number
    ) {
        const offset = this.#calcPos(deltaTime);
        const lookAt = this.#calcLookAt();
        
        const t = 1.0 - Math.pow(0.001, deltaTime * 0.0005);
        this.#pos.lerp(offset, t);
        this.#lookAt.lerp(lookAt, t);

        this.#camera.position.copy(this.#pos);
        this.#camera.lookAt(this.#lookAt);
    }
}