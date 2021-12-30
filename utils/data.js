const axios = require('axios')

async function fetchHtml(url, headers) {
	console.log('Crawling data...')
	// make http call to url
	let response = await axios({
		method: 'GET',
		url,
		headers
	}).catch((err) => console.log(err))

	if (response.status !== 200) {
		console.log('Error occurred while fetching data')
		return
	}

	return response.data
}

function generateHTML(ads, title) {
	let _html = '<h3>' + title + '</h3>'
	_html += '<hr/>'
	_html += '<h4>Current ads:</h4>'

	ads.forEach((ad) => {
		_html += '<p><a href="' + ad.href + '">' + (ad.title || 'N/A') + '</a></p>'
		_html += '<p><span style="color:red">(' + ad.price + ')</span></p>'
		_html += '<p><img src="' + ad.img + '"/></p>'
		_html += '<hr/>'
	})

	return _html
}

function validateEndpoints(parser) {
	return parser.url && parser.parser && parser.headers && parser.name && parser.label
}

const njuskaloHeaders = {
	accept:
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
	'accept-language': 'en-US,en;q=0.9',
	'cache-control': 'max-age=0',
	'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
	'sec-ch-ua-mobile': '?0',
	'sec-ch-ua-platform': '"Windows"',
	'sec-fetch-dest': 'document',
	'sec-fetch-mode': 'navigate',
	'sec-fetch-site': 'none',
	'sec-fetch-user': '?1',
	'upgrade-insecure-requests': '1',
	cookie:
		'__uzma=a1f48db6-2e89-40ef-bbe0-2e4b59a0b6cf; __uzmb=1640757961; njuskalo_privacy_policy=6; comm100_visitorguid_1000306=cdefe34f-e27c-424a-8a1c-d15e89b449ef; PHPSESSID=2a02f2c5fd82717982d96aad6e1f4a64; __uzmc=982774668023; uzdbm_a=b48c256b-851d-3141-3261-d24fd418b27f; __uzmd=1640764435'
}

const indexHeaders = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "ASP.NET_SessionId=gwzko1hkn1zuqnzwwhkwzlpa; ElementsNum=10; serveriOglasi=web5|Yc2Si; serverIndex=web4|Yc2Sj; didomi_token=eyJ1c2VyX2lkIjoiMTdlMGIwNDgtMzNhYi02ZTIxLWExNmEtZTRiNDIyNWI4NDkwIiwiY3JlYXRlZCI6IjIwMjEtMTItMzBUMTE6MDg6NDMuNTUyWiIsInVwZGF0ZWQiOiIyMDIxLTEyLTMwVDExOjA4OjQzLjU1MloiLCJ2ZW5kb3JzIjp7ImVuYWJsZWQiOlsiZ29vZ2xlIl19LCJwdXJwb3NlcyI6eyJlbmFibGVkIjpbImRldmljZV9jaGFyYWN0ZXJpc3RpY3MiLCJnZW9sb2NhdGlvbl9kYXRhIl19LCJ2ZW5kb3JzX2xpIjp7ImVuYWJsZWQiOlsiZ29vZ2xlIl19LCJ2ZXJzaW9uIjoyLCJhYyI6IkFGbUFDQUZrLkFBQUEifQ==; euconsent-v2=CPSB8BUPSB8BUAHABBENB5CsAP_AAH_AAAAAIbtf_X__b3_j-_5_f_t0eY1P9_7_v-0zjhfdt-8N2f_X_L8X42M7vF36pq4KuR4Eu3LBIQVlHOHcTUmw6okVrzPsbk2cr7NKJ7PEmnMbO2dYGH9_n93TuZKY7__9___z_v-v_v____f_7-3_3__5_X---_e_V399zLv9____39nP___9v-_9_3ghqASYal5AF2JY4Mm0aVQogRhWEh0AoAKKAYWiKwgZXBTsrgJ9QQsAEJqAjAiBBiCjBgEAAAEASERASAHggEQBEAgABACpAQgAI2AQWAFgYBAAKAaFiBFAEIEhBkcFRymBARItFBPZWAJQd7GmEIZZYAUCj-iowEShBAsDISFg5jgCQEuFkgWYIAAA.f_gAD_gAAAAA"
  }

const plaviHeaders = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "cross-site",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "osess=uhlrb9dl2ujg4002vq1c4dj83a"
  }

module.exports = { fetchHtml, generateHTML, validateEndpoints, njuskaloHeaders, indexHeaders, plaviHeaders }
