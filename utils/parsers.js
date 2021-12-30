const cheerio = require('cheerio')

function njuskaloParser(html) {
	const arr = []
    const baseURL = 'https://www.njuskalo.hr'

	let $ = cheerio.load(html)

	$('.content-primary div.EntityList.EntityList--Standard ul.EntityList-items > li').each(function (index) {
		const href = baseURL + $(this).attr('data-href')
		const options = $(this).attr('data-options')

		const title = $(this).find('.entity-title').text()
		const img = $(this).find('.entity-thumbnail').find('img').data('src')
		let price = $(this).find('.entity-prices .price.price--eur').text()
		price = price.replace(/\D/gm, '') + '€'

		if (options) {
			const id = JSON.parse(options).id
			if (id) {
				arr.push({
					id,
                    src: 'njuskalo',
					href,
					img,
					title,
					price
				})
			}
		}
	})

	return arr
}

function indexParser(html) {
	const arr = []

	let $ = cheerio.load(html)

	$('.results > .OglasiRezHolder').each(function (index) {
        const mainContainer = $(this).children('a')
		if (!mainContainer.length) {
			return
		}
		const href = mainContainer.attr('href')
        const id = href.split('/').pop()
		const title = mainContainer.find('.title').text()
		const img = mainContainer.find('.result_photo').find('img').data('src')
        const price = mainContainer.find('.price').text().split('~')[0]

        arr.push({
            id,
            src: 'index',
            href,
            img,
            title,
            price
        })
	})

	return arr
}

function plaviParser(html) {
	const arr = []

	let $ = cheerio.load(html)

	$('div.oglasnik-box.content-box > a').each(function (index) {
		const href = $(this).attr('href')
        const id = href.split('-').pop()
		const title = $(this).find('.classified-title').text()
        const price = $(this).find('.price-kn').text()

        arr.push({
            id,
            src: 'plavi',
            href,
            title,
            price
        })
	})

	return arr
}

module.exports = { njuskaloParser, indexParser, plaviParser }
