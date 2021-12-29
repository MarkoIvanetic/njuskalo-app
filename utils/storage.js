const fs = require('fs')

const setStorage = (new_ads) => {
	return new Promise((resolve) => {
		fs.writeFile('storage.json', JSON.stringify(new_ads), 'utf8', () => {
			resolve('Success')
		})
	})
}

const getStorage = () => {
	return new Promise((resolve) => {
		fs.readFile('./storage.json', 'utf8', (err, data) => {
			if (err) {
				throw new Error(err)
				resolve()
			}
			resolve(JSON.parse(data))
		})
	})
}

module.exports = { setStorage, getStorage }
