const { google } = require("googleapis");
const { CONSTANTS } = require("../data");
const { default: axios } = require("axios");

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

function getYoutubeChannel(channelId) {
	try {
		// const oauthEndpoint =  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&response_type=code&redirect_uri=/&scope`
		// axios.get(oauthEndpoint).then()
		// const url = `${googleApiPrefix}channels?access_token=`
		// axios.get(url, {headers: {Authorization: "Bearer oauth2-token"}})
	} catch (err) {}
	//

	// axios.get(url, {})
}

module.exports = { getYoutubeChannel };
