
const { URL } = require('url');

const { partial } = require('lodash');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * @param {URL} url
 * @param {(name, data)} callback
 */
module.exports = async (url, callback) => {
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
}

/**
 * 
 * @param {String} base 
 * @param {String} href 
 * @param {(name, data)} callback 
 */
const crawl = (base, href, callback) => {
    if (!href) return;

    const url = new URL(href, base);
    // only interested in resources form the same origin - not from the net
    if (url.origin === base) {
        fetch(url)
            .then(res => res.text())
            .then(data => callback(href, data));
    }
}