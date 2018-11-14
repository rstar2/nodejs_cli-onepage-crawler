
const { URL } = require('url');

const { partial, isFunction } = require('lodash');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * @param {URL} url
 * @param {Boolean} [crawlImages]
 * @param {(name, data)} callback
 */
module.exports = async function (url, crawlImages, callback) {
    // Note!!! - in order to use function's 'arguments' this function SHOULD NOT be arrow-function,
    // otherwise 'arguments' will be simply a reference to the 'arguments' of the enclosing scope
    if (arguments.length === 2) {
        const temp = crawlImages;
        crawlImages = false;
        callback = temp;
    }
    if (!isFunction(callback)) return Promise.reject('No callback provided');

    const html = await fetch(url)
        .then(res => res.text());

    callback('index.html', html);

    const $ = cheerio.load(html);

    const checkUrl = partial(crawl, url.origin);

    $('link[rel="stylesheet"]').each((_index, el) => {
        const href = $(el).attr('href');
        checkUrl(href, callback);
    });

    $('script').each((_index, el) => {
        const src = $(el).attr('src');
        checkUrl(src, callback);
    });
     
    if (crawlImages) {
        $('img').each((_index, el) => {
            const src = $(el).attr('src');
            checkUrl(src, callback, true);
        });
    }
}

/**
 * 
 * @param {String} base 
 * @param {String} href 
 * @param {(name, data)} callback 
 * @param {Boolean} isBinary 
 */
const crawl = (base, href, callback, isBinary = false) => {
    if (!href) return;

    const url = new URL(href, base);
    // only interested in resources form the same origin - not from the net
    if (url.origin === base) {
        console.log('Fetching', url.href);
        
        fetch(url)
            .then(res => isBinary ? res.buffer() : res.text())
            .then(data => callback(href, data));
    }
}