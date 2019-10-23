// index.js
require('dotenv').config();

const express = require('express');
const app = express();

const request = require('request');
const cheerio = require('cheerio');

var fs = require("fs");

// const baseURL = 'https://seneca.neocities.org';
const baseURL = 'https://www.njuskalo.hr';
const searchURL = process.env.QUERY;

const WEBHOOK = 'https://hooks.slack.com/services/' + process.env.WEBHOOK;

let AD_STORAGE = [];
let SPOTTED = false;
const TIMEOUT = 3600000 / 2;

let home_resp = 'Running!';

const REQ_OPTIONS = {
    'url': baseURL + searchURL,
    'headers': {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
    }
}

console.log("WEBHOOK:", process.env.WEBHOOK);

const getAds = () => {

    return new Promise(resolve => {
        request(REQ_OPTIONS, function(err, res, body) {
            if (err) {
                console.log(err);
            } else {

                const arr = [];

                if (body.includes(' You reached this page when trying to access')) {
                  SPOTTED = true;
                  home_resp = body;
                  console.log("********* SPOTTED ***************");
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

const setStorage = async new_ads => {

    if (process.env.ENV === 'development') {
        Promise.resolve("Success");
    }

    return new Promise(resolve => {
        fs.writeFile( "storage.json", JSON.stringify(new_ads), "utf8", () => {
            resolve('Success');
        });
    });
}

const getStorage = () => {
    if (process.env.ENV === 'development') {
        return AD_STORAGE;
    }
    return require("./storage.json");
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
  // Get adds
  let _ads = AD_STORAGE = await getAds();
  setStorage(_ads);
  // Send test notification
  sendSlackMessage(WEBHOOK, generateMessageFromAds(AD_STORAGE.slice(0, 2)));
  console.log("Recieved " + AD_STORAGE.length + " ads.");
})();

setInterval(async () => {
    let new_ads = await getAds();

    console.log("UPDATE!");

    let old_ids = new Set(AD_STORAGE.map(ad => ad.id));

    let diff = new_ads.filter(ad => !old_ids.has(ad.id));

    console.log("Fresh ads:", diff.length);

    if (diff.length) {
        console.log("Sending slack message");
        sendSlackMessage(WEBHOOK, generateMessageFromAds(diff));

        let merged_ads = new_ads.reduce((acc, iter) => { return {...acc, [iter.id]: iter}}, {});
        AD_STORAGE = merged_ads.values();
    }

    start_time = new Date();

}, TIMEOUT);


app.get('/', async function(req, res) {
   res.set('Content-Type', 'text/html');
   let endTime = new Date();

   let _html = '<h3>' + home_resp + '</h3>';
   _html += '<p>' + (((TIMEOUT - (endTime - start_time)) / 1000) / 60).toFixed(0) + ' minutes till update</p>';
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
