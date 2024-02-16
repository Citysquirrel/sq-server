const { REST, Routes } = require("discord.js");
const { STREAMERS, discordToken } = require("./data");

const rest = new REST({ version: "10" }).setToken(discordToken);

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
				description: err,
				timestamp: new Date(),
				color: 0xd1180b,
			},
		],
	});
}

module.exports = { postMessage, postErrorMessage };
