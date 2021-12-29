const removeDuplicates = (arr) => Array.from(new Set(arr))

const removeDuplicatesFromCollection = (arr) =>
	Object.values(
		arr.reduce((acc, iter) => {
			return { ...acc, [iter.id]: iter }
		}, {})
	)

const wait = (ms) => new Promise((r, j) => setTimeout(r, ms))

// const defaultHeaders = {
// 	'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
// }

const defaultHeaders = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "max-age=0",
  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "cookie": "__uzma=a1f48db6-2e89-40ef-bbe0-2e4b59a0b6cf; __uzmb=1640757961; njuskalo_privacy_policy=6; comm100_visitorguid_1000306=cdefe34f-e27c-424a-8a1c-d15e89b449ef; PHPSESSID=2a02f2c5fd82717982d96aad6e1f4a64; __uzmc=982774668023; uzdbm_a=b48c256b-851d-3141-3261-d24fd418b27f; __uzmd=1640764435"
}

module.exports = { wait, removeDuplicates, removeDuplicatesFromCollection, defaultHeaders }
