const { default: axios } = require("axios");
const { config } = require("dotenv");
const { REST, Routes } = require("discord.js");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const express = require("express");
const helmet = require("helmet");
const { messageCollector, messageStorage } = require("./msg");

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

app.get("/", (req, res) => {
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
		console.log(`Error occured when server opening!
>>> ${err.stack}`);
	});

//! Constants
const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordSecret = process.env.DISCORD_SECRET;
const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;
const discordToken = process.env.DISCORD_TOKEN;

const twitchUrlPrefix = "https://www.twitch.tv/";
const chzzkLivePrefix = "https://chzzk.naver.com/live/";
const chzzkLiveAPI = (channelId) => `https://api.chzzk.naver.com/service/v2/channels/${channelId}/live-detail`;

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

//! Configs

const rest = new REST({ version: "10" }).setToken(discordToken);

//! Variables
let access_token = "";

//! Initial Executes
getToken();
// getNaverCafeData("tabi");

//! Timers
const messageCollectorTimer = setInterval(() => {
	messageStorage.forEach((val, key) => {
		console.log(`[${new Date().toLocaleString()}]: ${key} (x${val})`);
	});
	messageStorage.clear();
}, 5000);

const token_timer = setInterval(() => {
	getToken();
}, 40000);

// 스트림 정보 가져오기
const twitchTimer = setInterval(() => {
	getStream("tabi");
	getStream("kanna");
}, 2000);

const chzzkTimer = setInterval(() => {
	getChzzkStream("tabi");
}, 2000);

//! Functions

function getToken() {
	try {
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
	} catch (err) {
		console.log(err);
		postErrorMessage(err);
	}
}

function getStream(streamer) {
	try {
		axios
			.get(`https://api.twitch.tv/helix/streams?user_login=${STREAMERS[streamer].name}`, {
				headers: { Authorization: `Bearer ${access_token}`, "Client-Id": twitchClientId },
			})
			.then((res) => {
				handleTwitchData(res.data.data[0], streamer);
			});
	} catch (err) {
		console.log(err);
		postErrorMessage(err);
	}
}

function getChzzkStream(streamer) {
	try {
		const api = chzzkLiveAPI(STREAMERS[streamer].chzzk.channelId);
		axios.get(api).then((res) => {
			handleChzzkData(res.data, streamer);
		});
	} catch (err) {
		console.log(err);
		postErrorMessage(err);
	}
}

async function handleChzzkData(data, streamer) {
	const { channel, status, liveTitle, openData, closeData } = data.content;
	const { channelName, channelImageUrl } = channel;
	if (STREAMERS[streamer].chzzk.status === undefined) {
		//? 서버 실행 후 최초 실행
		STREAMERS[streamer].chzzk.channelName = channelName;
		STREAMERS[streamer].chzzk.channelImageUrl = channelImageUrl;
		STREAMERS[streamer].chzzk.status = status;
		STREAMERS[streamer].chzzk.liveTitle = liveTitle;
		STREAMERS[streamer].chzzk.openData = openData;
		STREAMERS[streamer].chzzk.closeData = closeData;
	} else {
		//? 이후 라이브 집계
		if (status !== STREAMERS[streamer].chzzk.status) {
			//? 라이브 상태 변화 감지
			STREAMERS[streamer].chzzk.channelName = channelName;
			STREAMERS[streamer].chzzk.channelImageUrl = channelImageUrl;
			STREAMERS[streamer].chzzk.status = status;
			STREAMERS[streamer].chzzk.liveTitle = liveTitle;
			STREAMERS[streamer].chzzk.openData = openData;
			STREAMERS[streamer].chzzk.closeData = closeData;
			if (status === "OPEN") {
				//!: 방송 ON 알림
				postMessage(
					streamer,
					{
						embeds: [
							{
								type: "rich",
								author: {
									name: STREAMERS[streamer].chzzk.channelName,
									url: `${chzzkLivePrefix}${STREAMERS[streamer].chzzk.channelId}`,
									icon_url: STREAMERS[streamer].chzzk.channelImageUrl,
								},
								title: `${STREAMERS[streamer].chzzk.channelName} 방송 ON!`,
								url: `${chzzkLivePrefix}${STREAMERS[streamer].chzzk.channelId}`,
								description: liveTitle,
								footer: {
									text: "Chzzk",
									icon_url: "https://ssl.pstatic.net/static/nng/glive/icon/favicon.png",
								},
								thumbnail: { url: STREAMERS[streamer].chzzk.channelImageUrl },
								timestamp: openData,
								color: 0x6441a5,
							},
						],
					},
					`${STREAMERS[streamer].chzzk.channelName} 방송 ON 메시지 전송 성공!`
				);
			} else if (status === "CLOSE") {
				//! 방송 OFF 알림
				postMessage(
					streamer,
					{
						embeds: [
							{
								type: "rich",
								author: {
									name: STREAMERS[streamer].chzzk.channelName,
									url: `${chzzkLivePrefix}${STREAMERS[streamer].chzzk.channelId}`,
									icon_url: STREAMERS[streamer].chzzk.channelImageUrl,
								},
								title: `${STREAMERS[streamer].chzzk.channelName} 방송 OFF`,
								url: `${chzzkLivePrefix}${STREAMERS[streamer].chzzk.channelId}`,
								description: liveTitle,
								footer: {
									text: "Chzzk",
									icon_url: "https://ssl.pstatic.net/static/nng/glive/icon/favicon.png",
								},
								thumbnail: { url: STREAMERS[streamer].chzzk.channelImageUrl },
								timestamp: closeData,
								color: 0x6441a5,
							},
						],
					},
					`${STREAMERS[streamer].chzzk.channelName} 방송 OFF 메시지 전송 성공!`
				);
			}
		} else {
			//? 라이브 상태 변화 없을 시
			if (liveTitle !== STREAMERS[streamer].chzzk.liveTitle) {
				STREAMERS[streamer].chzzk.liveTitle = liveTitle;
				//! title 변경 알림
				postMessage(
					streamer,
					{
						embeds: [
							{
								type: "rich",
								author: {
									name: STREAMERS[streamer].chzzk.channelName,
									url: `${chzzkLivePrefix}${STREAMERS[streamer].chzzk.channelId}`,
									icon_url: STREAMERS[streamer].chzzk.channelImageUrl,
								},
								title: `${STREAMERS[streamer].chzzk.channelName} 방송 제목 변경`,
								url: `${chzzkLivePrefix}${STREAMERS[streamer].chzzk.channelId}`,
								description: liveTitle,
								footer: {
									text: "Chzzk",
									icon_url: "https://ssl.pstatic.net/static/nng/glive/icon/favicon.png",
								},
								thumbnail: { url: STREAMERS[streamer].chzzk.channelImageUrl },
								timestamp: new Date(),
								color: 0x6441a5,
							},
						],
					},
					`${STREAMERS[streamer].chzzk.channelName} 방송 ON 메시지 전송 성공!`
				);
			}
		}
	}
}

async function handleTwitchData(data, streamer) {
	if (!data) {
		STREAMERS[streamer].live = false;
		STREAMERS[streamer].type = undefined;
		STREAMERS[streamer].title = undefined;
	} else {
		const { user_id, type, title, started_at } = data;
		if (STREAMERS[streamer].live === false) {
			// 생방 on!
			const userInfo = await getUserInfo(user_id);
			const thumbnail_url = userInfo.data.data[0].profile_image_url;

			postMessage(
				streamer,
				{
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
				},
				`${STREAMERS[streamer].displayName} 방송 ON 메시지 전송 성공!`
			);
		}
		STREAMERS[streamer].live = true;
		STREAMERS[streamer].type = type;
		STREAMERS[streamer].title = title;
	}
}

function postMessage(streamer, body, msg) {
	rest.post(Routes.channelMessages(STREAMERS[streamer].discordChannelId), { body }).then((res) => {
		msg && messageCollector(msg);
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

async function getNaverCafeData(streamer) {
	const cafeNoticeUrl = `https://cafe.naver.com/ArticleList.nhn?search.clubid=${naverCafeClubId}&search.menuid=${STREAMERS[streamer].menuId}`;
	const res = await axios(cafeNoticeUrl, { responseType: "arraybuffer" });
	const decoded = iconv.decode(res.data, "EUC-KR").toString();
	const $ = cheerio.load(decoded);
	console.log($(".article-board:not(#upperArticleList) tbody").html());
}
