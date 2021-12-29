require('dotenv').config()

const fs = require('fs')
const express = require('express')

const app = express()
const axios = require('axios')
const cheerio = require('cheerio')

const { removeDuplicates, removeDuplicatesFromCollection, wait } = require('./utils')
const { setStorage, getStorage } = require('./utils/storage')
const { sendSlackMessage, generateMessageFromAds } = require('./utils/comms')
const { njuskaloHeaders, indexHeaders, fetchHtml } = require('./utils/data')
const sendEmail = require('./mailer.js')

const TIMEOUT = 1000 * 60 * 10

let AD_STORAGE = []

let baseURL = 'https://www.njuskalo.hr'
let searchURL = process.env.QUERY.replace(baseURL, '')

// ****************************************************************

const getAds = async (page) => {
	const htmlPage = await fetchHtml()
	const adsData = extractHtmlKeyData(htmlPage)
	return adsData
}

function generateHTML(ads, title) {
	let endTime = new Date()

	let _html = '<h3>' + title + '</h3>'
	_html += '<p>' + ((TIMEOUT - (endTime - start_time)) / 1000 / 60).toFixed(1) + ' minutes till update</p>'
	_html += '<hr/>'
	_html += '<h4>Current ads:</h4>'

	ads.forEach((ad) => {
		_html += '<p><a href="' + (baseURL + ad.href) + '">' + (ad.title || 'N/A') + '</a></p>'
		_html += '<p><span style="color:red">(' + ad.price + ')</span></p>'
		_html += '<p><img src="' + ad.img + '"/></p>'
		_html += '<hr/>'
	})

	return _html
}

// ****************************************************************
// INIT
let start_time = new Date()

// ****************************************************************

async function crawl(config) {
	const { timeout, emailFrom, emailTo, crawlDestinations } = config
	// initialise
	console.log('ENVIROMENT:', process.env.ENV)

	const [njuskalo, index, plavi] = await Promise.all(
		crawlDestinations.map(({ url, parser, headers }) => {
			return fetchHtml(url, headers)
				.then((html) => parser(html))
				.then((data) => removeDuplicatesFromCollection(data))
		})
	)

	const adData = {
		njuskalo, index, plavi
	}

	crawlDestinations.forEach(({ name, label }) => {
		AD_STORAGE[name] = adData[name]
		console.log('Recieved ' + adData[name].length + ' ads from ' + label + '!')
	})

	if (!fs.existsSync('./storage.json')) {
		console.log('Storage not found; setting storage...')
		setStorage(AD_STORAGE)
	}
	// Send test notification
	sendEmail({
		to: emailTo,
		from: emailFrom,
		subject: 'Crawler started with current ads!',
		html: crawlDestinations.reduce((acc, iter) => acc + generateHTML(adData[iter.name], iter.label), '')
	})

	// ****************************************************************

	setInterval(async () => {
		const [njuskaloAds, indexAds, plaviAds] = await Promise.all(
			crawlDestinations.map(({ url, parser, headers }) => {
				return fetchHtml(url, headers)
					.then((html) => parser(html))
					.then((data) => removeDuplicatesFromCollection(data))
			})
		)

		newAds = removeDuplicatesFromCollection(adsData)

		let registry = await getStorage()

		crawlDestinations.forEach((cd) => {
			registry[0]
		})

		// Filter only new one
		let archivedIds = new Set(registry)
		let diff = newAds.filter((ad) => !archivedIds.has(ad.id))

		console.log('Fresh ads:', diff.length)

		if (diff.length) {
			sendEmail({
				to: emailTo,
				from: emailFrom,
				subject: 'New Ads on Njuskalo',
				html: generateHTML(diff)
			})

			let new_ids = diff.map((ad) => ad.id)

			let new_registry = [...registry, ...new_ids]

			console.log('Old registry:' + registry.length + ' | New registry:' + new_registry.length)

			setStorage(new_registry)

			AD_STORAGE = removeDuplicatesFromCollection([...AD_STORAGE, ...diff])
		}

		start_time = new Date()
	}, timeout)
}

// ****************************************************************

module.exports = { crawl }
