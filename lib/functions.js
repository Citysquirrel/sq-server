const { REST, Routes } = require("discord.js");
const { STREAMERS, CONSTANTS } = require("./data");
const { messageCollector } = require("./tools/messageStorage");

const rest = new REST({ version: "10" }).setToken(CONSTANTS.discordToken);

function postMessage(streamer, body, msg) {
	rest.post(Routes.channelMessages(STREAMERS[streamer].discordChannelId), { body }).then((res) => {
		msg && messageCollector(msg);
	});
}

function postErrorMessage(err) {
	postMessage("notice", {
		embeds: [
			{
				type: "rich",
				author: {
					name: "CloudType Server",
				},
				title: `에러 발생 알림`,
				// url: `${twitchUrlPrefix}${STREAMERS[streamer].name}`,
				description: err.stack,
				timestamp: new Date(),
				color: 0xd1180b,
			},
		],
	});
}

module.exports = { postMessage, postErrorMessage };
