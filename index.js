// index.js
require('dotenv').config();

const express = require('express');
const app = express();
const request = require('request');
const cheerio = require('cheerio');
var fs = require("fs");

const WEBHOOK = 'https://hooks.slack.com/services/' + process.env.WEBHOOK;
const TIMEOUT = 36000 / 6;

let home_resp = 'Running!';

let AD_STORAGE = [];

let baseURL = 'https://www.njuskalo.hr';
let searchURL = process.env.QUERY;

if (process.env.ENV === 'development') {
    baseURL = 'https://seneca.neocities.org';
    searchURL = '/njuskalo.html';
}

console.log("WEBHOOK:", process.env.WEBHOOK);

const wait = ms => new Promise((r, j)=>setTimeout(r, ms))

const getHeaderForPage = (page) => {
    return {
        'url': baseURL + searchURL + (page ? ('&page=' + page) : ''),
        'headers': {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
        }
    }
}

const removeDuplicates = arr => Array.from(new Set(arr));

const removeDuplicatesFromCollection = arr => Object.values(arr.reduce((acc, iter) => { return {...acc, [iter.id]: iter}}, {}));

const getAds = (options) => {
    return new Promise(resolve => {
        request(options, function(err, res, body) {
            if (err) {
                console.log(err);
            } else {

                const arr = [];

                if (body.includes(' You reached this page when trying to access')) {
                    home_resp = body;
                }

                let $ = cheerio.load(body);

                if (!$('.content-primary div.EntityList.EntityList--Standard ul.EntityList-items > li').length) {
                    home_resp = body;
                }

                $('.content-primary div.EntityList.EntityList--Standard ul.EntityList-items > li').each(function(index) {

                    const href = $(this).attr('data-href');
                    const options = $(this).attr('data-options');

                    const title = $(this).find('.entity-title').text();
                    const img = $(this).find('.entity-thumbnail').find('img').data('src');
                    let price = $(this).find('.entity-prices .price.price--eur').text();
                    price = price.replace(/\D/gm, "") + '€';

                    if (options) {
                        const id = JSON.parse(options).id;
                        if (id) {
                            arr.push({
                                id,
                                href,
                                img,
                                title,
                                price
                            });

                        }
                    }
                });

                resolve(arr);
            }
        });
    });
}

const sendSlackMessage = async (webhook = WEBHOOK, message) => {
    return request({
        url: webhook,
        method: 'POST',
        body: message,
        json: true
    });

}

const setStorage = new_ads => {
    return new Promise(resolve => {
        fs.writeFile("storage.json", JSON.stringify(new_ads), "utf8", () => {
            resolve('Success');
        });
    });
}

const getStorage = () => {
    return new Promise(resolve => {
       fs.readFile('./storage.json', 'utf8', (err, data) => {
            if (err) {
                throw new Error(err);
                resolve();
            }
            resolve(JSON.parse(data));
        });
    });
}


function generateMessageFromAds(ads = []) {
    let message = {
        blocks: []
    };

    message.blocks.push({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Found " + ads.length + " new results!"
        }
    });

    message.blocks.push({
        "type": "divider"
    });

    ads.forEach(ad => {
        message.blocks.push(convertAdToMessage(ad));
        message.blocks.push({
            "type": "divider"
        });
    });

    return message;
}


// INIT
let start_time = new Date();

(async () => {
    console.log("ENVIROMENT:", process.env.ENV);

    let storage = null;

    page_1 = await getAds(getHeaderForPage());
    await wait(1000);
    let page_2 = await getAds(getHeaderForPage(2));

    AD_STORAGE = removeDuplicatesFromCollection([...page_1, ...page_2]);

    if (!fs.existsSync('./storage.json')) {
        console.log("Storage not found; setting storage...");
        setStorage(AD_STORAGE.map(ad => ad.id));
    }
    // Send test notification
    sendSlackMessage(WEBHOOK, {"text":"Process has been restarted!",});
    console.log("Recieved " + AD_STORAGE.length + " ads.");
})();

setInterval(async () => {
    let new_ads = await getAds(getHeaderForPage());
    await wait(1000);
    let new_ads_2 = await getAds(getHeaderForPage(2));

    new_ads = removeDuplicatesFromCollection([...new_ads, ...new_ads_2]);

    let storage = await getStorage();

    console.log("UPDATE!");

    // Filter only new one
    let storage_set = new Set(storage);
    let diff = new_ads.filter(ad => !storage_set.has(ad.id));

    console.log("Fresh ads:", diff.length);

    if (diff.length) {
        console.log("Sending slack message!");
        sendSlackMessage(WEBHOOK, generateMessageFromAds(diff));

        let new_ids = diff.map(ad => ad.id);

        let new_storage = [...storage, ...new_ids];

        console.log("Old storage:" + storage.length + " | New storage:" + new_storage.length);

        setStorage(new_storage);

        AD_STORAGE = removeDuplicatesFromCollection([...AD_STORAGE, ...diff]);
    }

    start_time = new Date();

}, TIMEOUT);


app.get('/', async function(req, res) {
    res.set('Content-Type', 'text/html');
    let endTime = new Date();

    let _html = '<h3>' + home_resp + '</h3>';
    _html += '<p>' + (((TIMEOUT - (endTime - start_time)) / 1000) / 60).toFixed(1) + ' minutes till update</p>';
    _html += '<hr/>';
    _html += '<h4>Current ads:</h4>';

    AD_STORAGE.forEach(ad => {
        _html += '<p><a href="' + (baseURL + ad.href) + '">' + (ad.title || 'N/A') + '</a></p>';
        _html += '<p><span style="color:red">(' + ad.price + ')</span></p>';
        _html += '<p><img src="' + ad.img + '"/></p>';
        _html += '<hr/>';
    });

    res.send(_html);
});

app.listen(3000, () => {
    console.log('Server is up on 3000');
})


function convertAdToMessage(ad) {
    let text = `*<${baseURL + ad.href}|${ad.title}>*${ad.price.toString()}`;
    return {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": text
        }
    }
}