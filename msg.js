const messageStorage = new Map();

function messageCollector(msg) {
	const findMsg = messageStorage.get(msg);

	if (findMsg) {
		messageStorage.set(msg, findMsg + 1);
	} else {
		messageStorage.set(msg, 1);
	}
}

module.exports = { messageCollector, messageStorage };
