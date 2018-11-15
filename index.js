#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { noop } = require('lodash');

// Usage:
// $ onepage-crawler theme-url [--name=theme] [-i]

const main = async () => {

    let [, , ...argv] = process.argv;
    argv = require('minimist')(argv);

    const [url] = argv._;
    const name = argv['out-dir'] || argv['o'];
    const opts = {
        js: !argv['j'], // -j means no JS
        css: !argv['c'], // -c means no CSS
        images: !argv['i'], // -i means no images
    };

    const simulate = !!argv['s'];

    if (!url) {
        console.error('No url to crawl');
        process.exit(1);
    }

    let basedir = process.cwd();
    if (name) {
        basedir = path.resolve(basedir, name);
        await fs.promises.mkdir(basedir, { recursive: true });
        process.chdir(basedir);
    }

    const crawler = require('./lib/crawler');

    // NOTE!!! - as the callback passed is 'async' function this means that it's actually a Promise (resolved promise),
    // so this actually makes this callback as a microtask (actually multiple microtasks) for the crawler,
    // this means first all the sync code in crawler function will be executed and then the microtasks
    await crawler(new URL(url), opts, async (name, data) => {
        const file = path.resolve(name);

        await fs.promises.mkdir(path.dirname(file), { recursive: true });
        // await 1;

        if (!simulate) {
            fs.writeFile(file, data, noop);
        }
        console.log('Saved', file);
    });

    // TODO: Return a resolved promise when all is really written in the files

};

main()
    .then(() => console.log('Success'))
    .catch((err) => console.error('Failed', err || ''));