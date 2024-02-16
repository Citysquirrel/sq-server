const messageStorage = new Map(); // 메시지 저장소입니다. 본 저장소를 서버에서 직접 조작합니다.

/**
 * @param {string} msg
 * Map 객체에 동일한 메시지를 저장해 횟수를 기록합니다.
 */
function messageCollector(msg) {
	const findMsg = messageStorage.get(msg);

	if (findMsg) {
		messageStorage.set(msg, findMsg + 1);
	} else {
		messageStorage.set(msg, 1);
	}
}

module.exports = { messageCollector, messageStorage };
