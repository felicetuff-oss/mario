export const ASSETS = {
    mario0: './mario role picture/mario0.png',
    mario1: './mario role picture/mario1.png',
    mario2: './mario role picture/mario2.png',
    goomba: './mario role picture/mogu0.png',
    koopa: './mario role picture/wugui0.png',
    map: './mario role picture/map.png',
    mushroom: './mario role picture/mushroom.png'
};

const images = {};

export function loadImage(name, url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => {
            images[name] = img;
            resolve(img);
        });
        img.addEventListener('error', (err) => {
            console.error(`Failed to load image ${name} from ${url}`, err);
            reject(err);
        });
        img.src = url;
    });
}

export function loadAssets() {
    const promises = Object.entries(ASSETS).map(([name, url]) => {
        return loadImage(name, url);
    });
    return Promise.all(promises);
}

export function getImage(name) {
    return images[name];
}
