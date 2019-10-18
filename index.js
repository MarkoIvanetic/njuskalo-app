// index.js

const express = require('express');
const app = express();
const fs = require('fs');

const request = require('request');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const baseURL = 'https://seneca.neocities.org';
// const baseURL = 'https://www.njuskalo.hr';

const searchURL = '/njuskalo.html';
// const searchURL = '/iznajmljivanje-stanova?locationIds=1263%2C1254%2C1255%2C1253%2C1250%2C1248&price%5Bmax%5D=560&livingArea%5Bmin%5D=40&livingArea%5Bmax%5D=60&adsWithImages=1&buildingFloorPosition%5Bmin%5D=high-ground#form_browse_detailed_search-filter-block';
const pageParam = '&page=';

const screenshot = require("node-server-screenshot");

const getAds = () => {

  return new Promise(resolve => {
    request(baseURL + searchURL, function(err, res, body) {
        if (err) {
            console.log(err);
        } else {

            const arr = [];

            let $ = cheerio.load(body);
            $('.content-primary div.EntityList.EntityList--Standard ul.EntityList-items > li').each(function(index) {

                const href = $(this).attr('data-href');
                const options = $(this).attr('data-options');

                const title = $(this).find('.entity-title').text();
                let price = $(this).find('.entity-prices .price.price--eur').text();
                price = price.replace(/\D/gm,"") + '€';

                if (options) {
                  const id = JSON.parse(options).id;

                  arr.push({
                    id, href, title, price
                  });

                  screenshot.fromHTML($(this), "test.png", function(){
                      //an image of the HTML has been saved at ./test.png
                  });

                }
            });

            console.log(arr.length);
            resolve(arr);
        }
    });
  });



}

const sendEmail = async (data) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'gmail',
        // port: 587,
        // secure: false,
        auth: {
            user: 'xxx@gmail.com', // generated ethereal user
            pass: 'xxxxxx' // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: 'lemuel99@ethereal.email', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: data.reduce((a,b) => a += b + '\n', ''), // plain text body
        html: '<b>Hello world?</b>' // html body
    });

    console.log('Message sent: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

setInterval(async () => {
  getAds().then(response => {
    sendEmail(response);
  }, error => {

  });
}, 20000);


app.get( '/', async function( req, res ) {
  // await getAds();
  // getAds().then(async response => {
  //   await sendEmail(response);
    res.send("Test server");
  // }, error => {

  // });
});

app.listen(3000, () => {
    console.log('Server is up on 3000');
})