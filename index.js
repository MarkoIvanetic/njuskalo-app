// index.js

const express = require('express');
const app = express();

const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');

const baseURL = 'https://www.njuskalo.hr';
const searchURL = '/iznajmljivanje-stanova?locationIds=1263%2C1254%2C1255%2C1253%2C1250%2C1248&price%5Bmax%5D=560&livingArea%5Bmin%5D=40&livingArea%5Bmax%5D=60&adsWithImages=1&buildingFloorPosition%5Bmin%5D=high-ground#form_browse_detailed_search-filter-block';
const pageParam = '&page='

const getAds = async () => {

  const page1 = await rp(baseURL + searchURL);
  // const page2 = await rp(baseURL + searchURL + pageParam + 2);
  // const page3 = await rp(baseURL + searchURL + pageParam + 3);

  console.log(page1);
  console.log('++++++++++++++++++++++++++++++++++++++++++++++++++');

  let links = [];

  const businessMap = cheerio('div.EntityList.EntityList--Standard ul.EntityList-items li', page1).map(async (i, e) => {

    links.push(e.attribs['data-href']);
    // const innerHtml = await rp(link);
    // const emailAddress = cheerio('a.email-business', innerHtml).prop('href');
    // const name = e.children[0].data;
    // const phone = cheerio('p.phone', innerHtml).text();

  //   return {
  //     emailAddress,
  //     link,
  //     name,
  //     phone,
  //   }
  // }).get();
  // return Promise.all(businessMap);
});
}

app.get('/', async (req, res) => {
	let links = await getAds();
    res.send(links)
})

app.listen(3000, () => {
    console.log('Server is up on 3000')
})