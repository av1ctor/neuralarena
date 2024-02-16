import { LoadingManager } from "three/src/loaders/LoadingManager.js";

export class AssetLoadingManager extends LoadingManager {
    assets_url: string;
    
    constructor(assets_url: string) {
        super();
        this.assets_url = assets_url;

        this.resolveURL = (
            url: string
        ): string => {
            return url.indexOf('.gltf') >= 0?
                url: 
                this.assets_url.replace('{}', new URL(url).pathname.substring(1));
        };
    }
}