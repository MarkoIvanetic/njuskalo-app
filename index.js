const { njuskaloParser, indexParser } = require('./utils/parsers')
const { njuskaloHeaders, indexHeaders } = require('./utils/data')

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
	emailTo: 'manna.grad@gmail.com',
	// emailTo: 'alex.drumia@gmail.com',
	crawlDestinations: [
		{
			url: 'https://www.njuskalo.hr/iznajmljivanje-stanova?geo%5BlocationIds%5D=1153%2C1170&livingArea%5Bmax%5D=800',
			parser: njuskaloParser,
			headers: njuskaloHeaders,
            name: 'njuskalo',
			label: 'Njuskalo'
		},
		{
			url: 'https://www.index.hr/oglasi/prodaja-stanova/gid/3278?pojamZup=-2&tipoglasa=1&sortby=1&elementsNum=10&grad=0&naselje=0&cijenaod=0&cijenado=4200000&num=4',
			parser: indexParser,
			headers: indexHeaders,
            name: 'index',
			label: 'Index Oglasi'
		},
		{
			url: '',
			parser: '',
            name: '',
			headers: 'plavi',
			label: 'Plavi Oglasnik'
		}
	]
})
