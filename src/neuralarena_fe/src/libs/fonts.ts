import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export const loadFonts = (
    fonts: Map<string, Font>
) => {
    const loader = new FontLoader();
    loader.load("/fonts/gentilis.typeface.json", (font) => {
        fonts.set('gentilis', font);
    });
};