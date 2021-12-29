require('dotenv').config()

const fs = require('fs')

const { removeDuplicates, removeDuplicatesFromCollection, wait } = require('./utils')
const { setStorage, getStorage } = require('./utils/storage')
const { sendSlackMessage, generateMessageFromAds } = require('./utils/comms')
const { njuskaloHeaders, indexHeaders, generateHTML, validateEndpoints, fetchHtml } = require('./utils/data')
const sendEmail = require('./mailer.js')

// ****************************************************************

async function crawl(config) {
	const { timeout, emailFrom, emailTo, crawlEndpoints: crawlEndpointsRaw } = config
	// initialise
	console.log('ENVIROMENT:', process.env.ENV)

	const crawlEndpoints = crawlEndpointsRaw.filter(cd => validateEndpoints(cd))

	const [njuskalo, index, plavi] = await Promise.all(
		crawlEndpoints.map(({ url, parser, headers }) => {
			return fetchHtml(url, headers)
				.then((html) => parser(html))
				.then((data) => removeDuplicatesFromCollection(data))
		})
	)

	const adData = {
		njuskalo,
		index,
		plavi
	}

	const AD_STORAGE = {}

	crawlEndpoints.forEach(({ name, label }) => {
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
		html: crawlEndpoints.reduce((acc, iter) => acc + generateHTML(adData[iter.name], iter.label), '')
	})

	// ****************************************************************

	setInterval(async () => {
		const [njuskalo, index, plavi] = await Promise.all(
			crawlEndpoints.map(({ url, parser, headers }) => {
				return fetchHtml(url, headers)
					.then((html) => parser(html))
					.then((data) => removeDuplicatesFromCollection(data))
			})
		)

		let registry = await getStorage()

		const adData = {
			njuskalo,
			index,
			plavi
		}

		const AD_STORAGE = {}

		let emailHtml = ''
		let isSendingEmail = false

		crawlEndpoints.forEach((cd) => {
			const archivedIds = registry[cd.name]
			const diff = adData[cd.name].filter((ad) => !archivedIds.hasOwnProperty(ad.id))

			console.log('Fresh ads:', diff.length)

			AD_STORAGE[cd.name] = adData[cd.name]

			if (diff.length) {
				emailHtml += generateHTML(diff, cd.label)
				isSendingEmail = true
			}
		})

		if (isSendingEmail) {
			sendEmail({
				to: emailTo,
				from: emailFrom,
				subject: 'New Ads Found!',
				html: emailHtml
			})
		}

		setStorage(AD_STORAGE)
	}, timeout)
}

// ****************************************************************

module.exports = { crawl }
