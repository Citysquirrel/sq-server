const { default: axios } = require("axios");
const { STREAMERS } = require("../data");
const { postMessage, postErrorMessage } = require("../functions");

const chzzkColorCode = 0x00ffa3;
const chzzkLivePrefix = "https://chzzk.naver.com/live/";
const chzzkLiveAPI = (channelId) => `https://api.chzzk.naver.com/service/v2/channels/${channelId}/live-detail`;

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
									text: "치지직",
									icon_url: "https://ssl.pstatic.net/static/nng/glive/icon/favicon.png",
								},
								thumbnail: { url: STREAMERS[streamer].chzzk.channelImageUrl },
								timestamp: openData,
								color: chzzkColorCode,
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
									text: "치지직",
									icon_url: "https://ssl.pstatic.net/static/nng/glive/icon/favicon.png",
								},
								thumbnail: { url: STREAMERS[streamer].chzzk.channelImageUrl },
								timestamp: closeData,
								color: chzzkColorCode,
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
									text: "치지직",
									icon_url: "https://ssl.pstatic.net/static/nng/glive/icon/favicon.png",
								},
								thumbnail: { url: STREAMERS[streamer].chzzk.channelImageUrl },
								timestamp: new Date(),
								color: chzzkColorCode,
							},
						],
					},
					`${STREAMERS[streamer].chzzk.channelName} 방송 ON 메시지 전송 성공!`
				);
			}
		}
	}
}

async function getNaverCafeData(streamer) {
	const cafeNoticeUrl = `https://cafe.naver.com/ArticleList.nhn?search.clubid=${naverCafeClubId}&search.menuid=${STREAMERS[streamer].menuId}`;
	const res = await axios(cafeNoticeUrl, { responseType: "arraybuffer" });
	const decoded = iconv.decode(res.data, "EUC-KR").toString();
	const $ = cheerio.load(decoded);
	console.log($(".article-board:not(#upperArticleList) tbody").html());
}

module.exports = { getChzzkStream, getNaverCafeData };
