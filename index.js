const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { noop } = require('lodash');

const main = async () => {
    const [, , url, name] = process.argv;

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
    await crawler(new URL(url), async (name, data) => {
        console.log('Crawled', name);
        const file = path.resolve(name);

        await fs.promises.mkdir(path.dirname(file), { recursive: true })

        fs.writeFile(file, data, noop);
    });
};

main();