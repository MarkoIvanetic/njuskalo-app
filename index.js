require('dotenv').config()

const fs = require('fs')
const express = require('express')

const app = express()
const request = require('request')
const axios = require('axios')
const cheerio = require('cheerio')

const { removeDuplicates, removeDuplicatesFromCollection, wait, defaultHeaders } = require('./utils')
const { setStorage, getStorage } = require('./utils/storage')
const { sendSlackMessage, generateMessageFromAds } = require('./utils/comms')

const WEBHOOK = 'https://hooks.slack.com/services/' + process.env.WEBHOOK
const TIMEOUT = 3600
// const TIMEOUT = 1000 * 60 * 10

let home_resp = 'Running!'

let AD_STORAGE = []

let baseURL = 'https://www.njuskalo.hr'
let searchURL = process.env.QUERY.replace(baseURL, '')

async function fetchHtml(page = 1) {
	console.log('Crawling data...')
	// make http call to url
	let response = await axios({
		method: 'GET',
		url: baseURL + searchURL + (page ? '&page=' + page : ''),
		headers: defaultHeaders,
	}).catch((err) => console.log(err))

	if (response.status !== 200) {
		console.log('Error occurred while fetching data')
		return
	}

	return response.data
}

function extractHtmlKeyData(html) {
	const arr = []

	if (html.includes(' You reached this page when trying to access')) {
		home_resp = html
	}

	let $ = cheerio.load(html)

	if (!$('.content-primary div.EntityList.EntityList--Standard ul.EntityList-items > li').length) {
		home_resp = html
	}

	$('.content-primary div.EntityList.EntityList--Standard ul.EntityList-items > li').each(function (index) {
		const href = $(this).attr('data-href')
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
					href,
					img,
					title,
					price,
				})
			}
		}
	})

	return arr
}

const getAds = async (page) => {
	const htmlPage = await fetchHtml()
    const adsData = extractHtmlKeyData(htmlPage)

    return adsData
}

// INIT
let start_time = new Date()

;(async () => {
	console.log('ENVIROMENT:', process.env.ENV)

	let storage = null

	ads = await getAds()

	AD_STORAGE = removeDuplicatesFromCollection(ads)

	if (!fs.existsSync('./storage.json')) {
		console.log('Storage not found; setting storage...')
		setStorage(AD_STORAGE.map((ad) => ad.id))
	}
	// Send test notification
	sendSlackMessage(WEBHOOK, { text: 'Process has been restarted!' })
	console.log('Recieved ' + AD_STORAGE.length + ' ads.')
})()

setInterval(async () => {
	let adsData = await getAds(1)

	new_ads = removeDuplicatesFromCollection(adsData)

	let storage = await getStorage()

	console.log('UPDATE!')

	// Filter only new one
	let storage_set = new Set(storage)
	let diff = new_ads.filter((ad) => !storage_set.has(ad.id))

	console.log('Fresh ads:', diff.length)

	if (diff.length) {
		console.log('Sending slack message!')
		sendSlackMessage(WEBHOOK, generateMessageFromAds(diff))

		let new_ids = diff.map((ad) => ad.id)

		let new_storage = [...storage, ...new_ids]

		console.log('Old storage:' + storage.length + ' | New storage:' + new_storage.length)

		setStorage(new_storage)

		AD_STORAGE = removeDuplicatesFromCollection([...AD_STORAGE, ...diff])
	}

	start_time = new Date()
}, TIMEOUT)

app.get('/', async function (req, res) {
	res.set('Content-Type', 'text/html')
	let endTime = new Date()

	let _html = '<h3>' + home_resp + '</h3>'
	_html += '<p>' + ((TIMEOUT - (endTime - start_time)) / 1000 / 60).toFixed(1) + ' minutes till update</p>'
	_html += '<hr/>'
	_html += '<h4>Current ads:</h4>'

	AD_STORAGE.forEach((ad) => {
		_html += '<p><a href="' + (baseURL + ad.href) + '">' + (ad.title || 'N/A') + '</a></p>'
		_html += '<p><span style="color:red">(' + ad.price + ')</span></p>'
		_html += '<p><img src="' + ad.img + '"/></p>'
		_html += '<hr/>'
	})

	res.send(_html)
})

app.listen(3000, () => {
	console.log('Server is up on 3000')
})
