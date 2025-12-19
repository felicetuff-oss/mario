export default class Loader {
    constructor() {
        this.images = {};
        this.json = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    async loadImage(name, src) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                this.loadedAssets++;
                console.log(`Loaded image: ${src} (${this.loadedAssets}/${this.totalAssets})`);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                const placeholder = document.createElement('canvas');
                placeholder.width = 16;
                placeholder.height = 16;
                this.images[name] = placeholder;
                this.loadedAssets++;
                resolve(placeholder);
            };
            img.src = src;
        });
    }

    async loadJSON(name, url) {
        this.totalAssets++;
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.json[name] = data;
            this.loadedAssets++;
            console.log(`Loaded JSON: ${url} (${this.loadedAssets}/${this.totalAssets})`);
            return data;
        } catch (error) {
            throw new Error(`Failed to load JSON: ${url}`);
        }
    }

    getImage(name) {
        return this.images[name];
    }

    getJSON(name) {
        return this.json[name];
    }

    get progress() {
        return this.totalAssets === 0 ? 1 : this.loadedAssets / this.totalAssets;
    }
}
