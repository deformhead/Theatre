import {Canvas} from 'core/canvas.js';
import {Loop} from 'core/loop.js';
import {preload} from 'core/preload.js';

import {assets} from 'assets/index.js';

import * as scenes from 'scenes/index.js';

function Theatre(config) {

    const {container, loading, opening, size} = config;

    const expose = config.expose || false;
    const framerate = config.framerate || 60;
    const sharp = config.sharp || false;

    let next = null;

    function initialize() {

        const canvas = new Canvas('2d', 'theatre', size.width, size.height);

        if (sharp === true) {

            canvas.sharp();
        }

        container.appendChild(canvas.element);

        this.container = container;
        this.context = canvas.context;
        this.element = canvas.element;

        this.assets = {};
        this.delta = {};
        this.delta.render = 0;
        this.delta.update = 0;

        this.scene = this.scenes[loading];
        this.scene.setup.call(this);
        this.scene.start.call(this);

        const loop = new Loop(framerate);

        loop.update((timeframe) => {

            this.delta.update = timeframe;
            this.scene.update.call(this);

            if (next !== null) {

                this.scene.destroy.call(this);
                this.scene = this.scenes[next];
                this.scene.setup.call(this);
                this.scene.start.call(this);

                next = null;
            }
        });

        loop.render((timeframe) => {

            this.delta.render = timeframe;
            this.scene.render.call(this);
        });

        preload(assets, (assets) => {

            assets.forEach((asset) => {

                if (typeof this.assets[asset.type + 's'] === 'undefined') {

                    this.assets[asset.type + 's'] = {};
                }

                if (typeof this.assets[asset.type + 's'][asset.scope] === 'undefined') {

                    this.assets[asset.type + 's'][asset.scope] = {};
                }

                this.assets[asset.type + 's'][asset.scope][asset.name] = asset.content;
            });

            this.scene.destroy.call(this);

            this.preloaded = true;

            this.scene = this.scenes[opening];
            this.scene.setup.call(this);
            this.scene.start.call(this);
        });
    }

    function load(scene) {

        next = scene;
    }

    function restart() {

        this.scene.start.call(this);
    }

    this.preloaded = false;
    this.scenes = scenes;
    this.size = size;
    this.version = '0.7.0';

    this.load = load;
    this.restart = restart;

    initialize.call(this, config);

    if (expose === true) {

        window.theatre = this;
    }
}

// exports current module as an object
export {Theatre};
