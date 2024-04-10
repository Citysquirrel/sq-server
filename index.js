const { default: axios } = require("axios");
const { config } = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const { messageCollector, messageStorage } = require("./lib/tools/messageStorage");
const { STREAMERS } = require("./lib/data");
const { getChzzkStream } = require("./lib/platform/naver");
const { getYoutubeChannel } = require("./lib/platform/youtube");

//?Suggestion:
//TODO: 느낌표 주석으로 나누어진 요소들 각 파일 및 디렉터리로 구분해 분리
//TODO: 치지직 라이브 알람
//TODO: 방송 종료시에도 알림?
//TODO: 트위터 글작성 알림
//TODO: 네이버 공지 작성 알림
//TODO: 유튜브 알림

//! App
const app = express();
app.use(helmet());
config();

// app.get('/', (req,res) => {
// 	res.writeHead(301, {"location": })
// })

app.get("/health", (req, res) => {
	messageCollector("Health Checked");
	return res.send("Hello! I'm Healthy!");
});

app.get("/*", (req, res) => {
	return res.status(404).send(`Cannot GET ${req.originalUrl} :(`);
});

app
	.listen(3000, () => {
		console.log(`Server is running in 3000 port.`);
	})
	.on("error", (err) => {
		console.log(`An error occurred during server opening!
>>> ${err.stack}`);
	});

//! Constants
const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
const twitchUrlPrefix = "https://www.twitch.tv/";

//! Configs

//! Variables
let access_token = "";

//! Initial Executes
// getToken();
// getNaverCafeData("tabi");

//! Timers
const messageCollectorTimer = setInterval(() => {
	messageStorage.forEach((val, key) => {
		console.log(`[${new Date().toLocaleString()}]: ${key} (x${val})`);
	});
	messageStorage.clear();
}, 5000);

// const youtubeTemp = setInterval(() => {
// 	getYoutubeChannel("UCAHVQ44O81aehLWfy9O6Elw", "tabi");
// }, 5000);

// const token_timer = setInterval(() => {
// 	getToken();
// }, 40000);

// 스트림 정보 가져오기
// const twitchTimer = setInterval(() => {
// 	getStream("tabi");
// 	getStream("kanna");
// }, 2000);

// const chzzkTimer = setInterval(() => {
// getChzzkStream("tabi");
// }, 2000);

// const youtubeTimer = setInterval(() => {
// 	getYoutubeChannel("arahashitabi");
// }, 10000);

//! Functions

//! 아래는 3월부터 폐기

// function getToken() {
// 	try {
// 		axios
// 			.post(
// 				"https://id.twitch.tv/oauth2/token",
// 				{
// 					client_id: twitchClientId,
// 					client_secret: twitchClientSecret,
// 					grant_type: "client_credentials",
// 				},
// 				{ headers: { "Content-Type": "application/x-www-form-urlencoded" } }
// 			)
// 			.then((res) => {
// 				access_token = res.data.access_token;
// 			});
// 	} catch (err) {
// 		console.log(err);
// 		postErrorMessage(err);
// 	}
// }

// function getStream(streamer) {
// 	try {
// 		axios
// 			.get(`https://api.twitch.tv/helix/streams?user_login=${STREAMERS[streamer].name}`, {
// 				headers: { Authorization: `Bearer ${access_token}`, "Client-Id": twitchClientId },
// 			})
// 			.then((res) => {
// 				handleTwitchData(res.data.data[0], streamer);
// 			});
// 	} catch (err) {
// 		console.log(err);
// 		postErrorMessage(err);
// 	}
// }

// async function handleTwitchData(data, streamer) {
// 	if (!data) {
// 		STREAMERS[streamer].live = false;
// 		STREAMERS[streamer].type = undefined;
// 		STREAMERS[streamer].title = undefined;
// 	} else {
// 		const { user_id, type, title, started_at } = data;
// 		if (STREAMERS[streamer].live === false) {
// 			// 생방 on!
// 			const userInfo = await getUserInfo(user_id);
// 			const thumbnail_url = userInfo.data.data[0].profile_image_url;

// 			postMessage(
// 				streamer,
// 				{
// 					embeds: [
// 						{
// 							type: "rich",
// 							author: {
// 								name: STREAMERS[streamer].displayName,
// 								url: `${twitchUrlPrefix}${STREAMERS[streamer].name}`,
// 								icon_url: thumbnail_url,
// 							},
// 							title: `${STREAMERS[streamer].displayName} 방송 ON!`,
// 							url: `${twitchUrlPrefix}${STREAMERS[streamer].name}`,
// 							description: title,
// 							footer: {
// 								text: "Twitch",
// 								icon_url: "https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png",
// 							},
// 							thumbnail: { url: thumbnail_url },
// 							timestamp: started_at,
// 							color: 0x6441a5,
// 						},
// 					],
// 				},
// 				`${STREAMERS[streamer].displayName} 방송 ON 메시지 전송 성공!`
// 			);
// 		}
// 		STREAMERS[streamer].live = true;
// 		STREAMERS[streamer].type = type;
// 		STREAMERS[streamer].title = title;
// 	}
// }

// async function getUserInfo(user_id) {
// 	return await axios.get(`https://api.twitch.tv/helix/users?id=${user_id}`, {
// 		headers: { Authorization: `Bearer ${access_token}`, "Client-Id": twitchClientId },
// 	});
// }

// function modImageUrl(url) {
// 	return url.replace(/{width}|{height}/g, 300);
// }
