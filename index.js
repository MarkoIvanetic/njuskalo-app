const { njuskaloParser, indexParser, plaviParser } = require('./utils/parsers')
const { njuskaloHeaders, indexHeaders, plaviHeaders } = require('./utils/data')

const { crawl } = require('./crawl')

const express = require('express')

const app = express()

app.get('/', async function (req, res) {
	res.set('Content-Type', 'text/html')
	res.send(generateHTML(AD_STORAGE))
})

app.listen(9000, () => {
	console.log('Server is up on 9000')
})


crawl({
	timeout: 1000 * 60 * 10,
	emailFrom: 'alex.drumia@gmail.com', // must be a registered sender
	emailTo: 'alex.drumia@gmail.com',
	crawlDestinations: [
		{
			url: 'https://www.njuskalo.hr/iznajmljivanje-stanova?geo%5BlocationIds%5D=1153%2C1170&livingArea%5Bmax%5D=800',
			parser: njuskaloParser,
			headers: njuskaloHeaders,
            name: 'njuskalo',
			label: 'Njuskalo'
		},
		{
			url: 'https://www.index.hr/oglasi/najam-stanova/gid/3279?pojam=&sortby=1&elementsNum=50&cijenaod=0&cijenado=501&tipoglasa=1&pojamZup=1153&grad=0&naselje=&attr_Int_988=&attr_Int_887=60&oglaslika=1&attr_bit_stan=&attr_bit_brojEtaza=&attr_gr_93_1=&attr_gr_93_2=569&attr_Int_978=&attr_Int_1334=&attr_bit_eneregetskiCertifikat=&vezani_na=988-887_562-563_978-1334',
			parser: indexParser,
			headers: indexHeaders,
            name: 'index',
			label: 'Index Oglasi'
		},
		{
			url: 'https://www.oglasnik.hr/stanovi-najam?ad_params_uploadable=1&ad_params_44_to=60&ad_price_to=3760&ad_location_2%5B%5D=7442&ad_location_3%5B%5D=7470&ad_location_3%5B%5D=7526&ad_location_3%5B%5D=7669&ad_location_3%5B%5D=7679&ad_location_3%5B%5D=7683',
			parser: plaviParser,
			headers: plaviHeaders,
            name: 'plavi',
			label: 'Plavi Oglasnik'
		}
	]
})
