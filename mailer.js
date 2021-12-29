require('dotenv').config()
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function sendEmail(msg) {
	return sgMail
		.send(msg)
		.then(() => {
			console.log('Email sent!')
		})
		.catch((error) => {
			console.error(error)
		})
}

module.exports = sendEmail
