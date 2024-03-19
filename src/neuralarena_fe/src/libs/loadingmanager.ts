import { LoadingManager } from "three/src/loaders/LoadingManager.js";

export class GameAssetsLoadingManager extends LoadingManager {
    game_assets_url: string;
    
    constructor(
        game_assets_url: string,
        onProgress?: (url: string, loaded: number, total: number) => void,
    ) {
        super(undefined, onProgress, undefined);
        this.game_assets_url = game_assets_url;

        this.resolveURL = (
            url: string
        ): string => {
            return url.indexOf('.gltf') >= 0?
                url: 
                this.game_assets_url.replace('{}', new URL(url).pathname.substring(1));
        };
    }
}

export class NftAssetsLoadingManager extends LoadingManager {
    nft_assets_url?: URL;
    
    constructor(
        onProgress?: (url: string, loaded: number, total: number) => void
    ) {
        super(undefined, onProgress, undefined);

        this.resolveURL = (
            url: string
        ): string => {
            if(url.indexOf('.gltf') >= 0) {
                this.nft_assets_url = new URL(url);
                return url;
            }
            else {
                return url + this.nft_assets_url!.search;
            }
        };
    }
}