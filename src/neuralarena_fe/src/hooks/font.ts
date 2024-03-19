import { useContext } from "react";
import * as THREE from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontsContext } from "@stores/fonts";

export const useFont = (
    name: string
): Font => {
    const [ctx] = useContext(FontsContext);

    return ctx.fonts.get(name)!;
};

export const fontBuildText = (
    text: string,
    font: Font,
    size: number = 14.0,
    color: number = 0xffffff
): THREE.Mesh => {
    const geo = new TextGeometry(
        text, 
        {
            font,
            size,
            height: 1.0,
            curveSegments: 4,
            bevelThickness: 2,
            bevelSize: 1.5,
            bevelEnabled: false
        }
    );
    
    geo.computeBoundingBox();

    const centerOffset = -0.5 * (geo.boundingBox!.max.x - geo.boundingBox!.min.x);
    const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
            color,
        })
    );
    mesh.position.x = centerOffset;

    return mesh;
}