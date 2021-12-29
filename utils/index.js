const removeDuplicates = (arr) => Array.from(new Set(arr))

const removeDuplicatesFromCollection = (arr) =>
	Object.values(
		arr.reduce((acc, iter) => {
			return { ...acc, [iter.id]: iter }
		}, {})
	)

const wait = (ms) => new Promise((r, j) => setTimeout(r, ms))

module.exports = { wait, removeDuplicates, removeDuplicatesFromCollection }
