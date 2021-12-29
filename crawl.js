const { njuskaloParser, indexParser } = require('./utils/parsers')
const { njuskaloHeaders, indexHeaders } = require('./utils/data')

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
			url: '',
			parser: njuskaloParser,
			headers: njuskaloHeaders,
            name: 'njuskalo',
			label: 'Njuskalo'
		},
		{
			url: '',
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
