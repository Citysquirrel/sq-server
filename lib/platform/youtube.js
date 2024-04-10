const { google } = require("googleapis");
const { CONSTANTS, STREAMERS } = require("../data");
const { default: axios } = require("axios");
const { postMessage } = require("../functions");

const googleApiPrefix = "https://www.googleapis.com/youtube/v3/";
const { googleClientId, googleClientSecret, googleRedirectUrl } = CONSTANTS;

const oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret, googleRedirectUrl);

const scopes = ["https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/youtube.readonly"];

// Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
	// 'online' (default) or 'offline' (gets refresh_token)
	access_type: "offline",
	/** Pass in the scopes array defined above.
	 * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
	scope: scopes,
	// Enable incremental authorization. Recommended as a best practice.
	include_granted_scopes: true,
});

let userCredential = null;

// ?access_token=oauth2-token
// Authorization: Bearer oauth2-token

let tempCnt = 0;

function getYoutubeChannel(channelId, streamer) {
	try {
		// google.youtube("v3").videos.list({part:"statistics", id: videoId, key: process.env.YOUTUBE_API_KEY})
		google
			.youtube("v3")
			.channels.list({ part: "statistics", id: channelId, key: process.env.YOUTUBE_API_KEY })
			.then((res) => {
				const count = res.data.items[0].statistics.subscriberCount;
				if (count >= 100000 && tempCnt < 5) {
					postMessage(
						streamer,
						{
							embeds: [
								{
									type: "rich",
									author: {
										name: "따비",
									},
									title: `따비 유튜브 구독자 10만 달성!`,
									description: `따비 유튜브 구독자 10만 달성!`,
									timestamp: new Date(),
									color: 0xc4302b,
								},
							],
						},
						`따비 유튜브 구독자 달성 메시지 전송 성공!`
					);
					tempCnt++;
				}
			});
		// const oauthEndpoint =  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&response_type=code&redirect_uri=/&scope`
		// axios.get(oauthEndpoint).then()
		// const url = `${googleApiPrefix}channels?access_token=`
		// axios.get(authorizationUrl, { headers: { Authorization: "Bearer oauth2-token" } }).then((res) => {
		// 	console.log(res);
		// });
	} catch (err) {}
	//

	// axios.get(url, {})
}

module.exports = { getYoutubeChannel };
