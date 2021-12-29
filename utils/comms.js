const request = require('request')

const sendSlackMessage = async (webhook = WEBHOOK, message) => {
	return request({
		url: webhook,
		method: 'POST',
		body: message,
		json: true
	})
}

function convertAdToMessage(ad) {
	let text = `*<${baseURL + ad.href}|${ad.title}>*${ad.price.toString()}`
	return {
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: text
		}
	}
}

function generateMessageFromAds(ads = []) {
	let message = {
		blocks: []
	}

	message.blocks.push({
		type: 'section',
		text: {
			type: 'mrkdwn',
			text: 'Found ' + ads.length + ' new results!'
		}
	})

	message.blocks.push({
		type: 'divider'
	})

	ads.forEach((ad) => {
		message.blocks.push(convertAdToMessage(ad))
		message.blocks.push({
			type: 'divider'
		})
	})

	return message
}

module.exports = { sendSlackMessage, generateMessageFromAds }
