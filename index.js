const { default: axios } = require("axios");
const { config } = require("dotenv");
const { REST, Routes, ChannelManager, Embed } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");

config();

//! Constants
const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordSecret = process.env.DISCORD_SECRET;
const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;
const discordToken = process.env.DISCORD_TOKEN;

const twitchUrlPrefix = "https://www.twitch.tv/";

const STREAMERS = {
	tabi: {
		name: "arahashitabi_stellive",
		live: undefined,
		title: undefined,
		type: undefined,
		displayName: "아라하시_타비",
		discordChannelId: "1179630895997669436",
		color: 0x9adaff,
	},
	kanna: {
		name: "airikanna_stellive",
		live: undefined,
		title: undefined,
		type: undefined,
		displayName: "아이리_칸나",
		discordChannelId: "1179630864217407489",
		color: 0x373584,
	},
};

const DISCORD = {
	tabi: { channelId: "1179630895997669436" },
	kanna: { channelId: "1179630864217407489" },
};

//! Configs

const rest = new REST({ version: "10" }).setToken(discordToken);

//! Variables
let access_token = "";

//! Initial Executes
getToken();

//! Timers
const token_timer = setInterval(() => {
	getToken();
}, 40000);

const tabiTwitchTimer = setInterval(() => {
	getStream("tabi");
	getStream("kanna");
}, 2000);

//! Functions
const embed = new EmbedBuilder({
	type: "rich",
	author: { name: STREAMERS.tabi.displayName, url: `${twitchUrlPrefix}${STREAMERS.tabi.name}` },
	title: { text: `${STREAMERS.tabi.displayName} 방송 ON!`, url: `${twitchUrlPrefix}${STREAMERS.tabi.name}` },
	description: "방송제목",
	// footer:""
});
function getToken() {
	axios
		.post(
			"https://id.twitch.tv/oauth2/token",
			{
				client_id: twitchClientId,
				client_secret: twitchClientSecret,
				grant_type: "client_credentials",
			},
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } }
		)
		.then((res) => {
			access_token = res.data.access_token;
		});
}

function getStream(streamer) {
	axios
		.get(`https://api.twitch.tv/helix/streams?user_login=${STREAMERS[streamer].name}`, {
			headers: { Authorization: `Bearer ${access_token}`, "Client-Id": twitchClientId },
		})
		.then((res) => {
			handleTwitchData(res.data.data[0], streamer);
		});
}

async function handleTwitchData(data, streamer) {
	if (!data) {
		STREAMERS[streamer].live = false;
		STREAMERS[streamer].type = undefined;
		STREAMERS[streamer].title = undefined;
	} else {
		const { user_id, type, title, started_at } = data;
		if (!STREAMERS[streamer].live) {
			// 생방 on!
			const userInfo = await getUserInfo(user_id);
			const thumbnail_url = userInfo.data.data[0].profile_image_url;

			postMessage(streamer, {
				embeds: [
					{
						type: "rich",
						author: {
							name: STREAMERS[streamer].displayName,
							url: `${twitchUrlPrefix}${STREAMERS[streamer].name}`,
							icon_url: thumbnail_url,
						},
						title: `${STREAMERS[streamer].displayName} 방송 ON!`,
						url: `${twitchUrlPrefix}${STREAMERS[streamer].name}`,
						description: title,
						footer: {
							text: "Twitch",
							icon_url: "https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png",
						},
						thumbnail: { url: thumbnail_url },
						timestamp: started_at,
						color: 0x6441a5,
					},
				],
			});
		}
		// console.log(data);
		STREAMERS[streamer].live = true;
		STREAMERS[streamer].type = type;
		STREAMERS[streamer].title = title;
	}
}

function postMessage(streamer, body) {
	rest.post(Routes.channelMessages(STREAMERS[streamer].discordChannelId), { body }).then((res) => {
		console.log(`${STREAMERS[streamer].displayName} 방송 ON 메시지 전송 성공!`);
	});
}

async function getUserInfo(user_id) {
	return await axios.get(`https://api.twitch.tv/helix/users?id=${user_id}`, {
		headers: { Authorization: `Bearer ${access_token}`, "Client-Id": twitchClientId },
	});
}

function modImageUrl(url) {
	return url.replace(/{width}|{height}/g, 300);
}
