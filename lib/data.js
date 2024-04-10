const { config } = require("dotenv");

config();

const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordSecret = process.env.DISCORD_SECRET;
const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;
const discordToken = process.env.DISCORD_TOKEN;
const youtubeAPIKey = process.env.YOUTUBE_API_KEY;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUrl = process.env.REDIRECT_URL;

const CONSTANTS = {
	twitchClientId,
	twitchClientSecret,
	discordClientId,
	discordSecret,
	discordPublicKey,
	discordToken,
	youtubeAPIKey,
	googleClientId,
	googleClientSecret,
	googleRedirectUrl,
};

const naverCafeClubId = "29424353";

const STREAMERS = {
	notice: {
		discordChannelId: "1179630290596012096",
	},
	tabi: {
		name: "arahashitabi_stellive",
		live: undefined,
		title: undefined,
		type: undefined,
		displayName: "아라하시_타비",
		discordChannelId: "1179630895997669436",
		color: 0x9adaff,
		menuId: "152",
		chzzk: {
			channelId: "a6c4ddb09cdb160478996007bff35296",
			channelName: undefined,
			channelImageUrl: undefined,
			status: undefined,
			liveTitle: undefined,
			openData: undefined,
			closeData: undefined,
		},
	},
	kanna: {
		name: "airikanna_stellive",
		live: undefined,
		title: undefined,
		type: undefined,
		displayName: "아이리_칸나",
		discordChannelId: "1179630864217407489",
		color: 0x373584,
		menuId: "131",
		chzzk: {
			channelId: "f722959d1b8e651bd56209b343932c01",
			channelName: undefined,
			channelImageUrl: undefined,
			status: undefined,
			liveTitle: undefined,
			openData: undefined,
			closeData: undefined,
		},
	},
};

module.exports = {
	CONSTANTS,
	naverCafeClubId,
	STREAMERS,
};
