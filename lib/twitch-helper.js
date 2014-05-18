//https://api.twitch.tv/kraken/streams?game=League+of+Legends&limit=25

exports.fetchTwitchStreams = fetchTwitchStreams;

var Request = require("sdk/request").Request;

var twitchLoaded = false;
var baseUrl = "https://api.twitch.tv/kraken/";
var query = "game=League+of+Legends&limit=25";
var MIMETypeHeader = "application/vnd.twitchtv.v2+json";
var clientId = "183b5hpp1svo7bs2xua9pu5oo7ws9ow";

function parseTwitchStreams(streams, callback) {
	//live_streams = live_streams.filter(function(a) { return a.site != twitchSiteName; });
	//live_streams.length = 0;
	var liveStreams = [];

	streams.forEach(function(stream, index, array) {
		var streamer = {name: stream.channel.display_name, 
						url: stream.channel.url, 
						viewers: stream.viewers, 
						logo: stream.channel.logo,
						site: "twitch"};
		liveStreams.push(streamer);
	});

	callback(liveStreams);
}

function fetchTwitchStreams(callback) {
	Request({
		url: baseUrl+"streams",
		headers: {"Client-ID": clientId, "Accept": MIMETypeHeader},
		content: query,
		onComplete: function (response) {
			var responseObject = JSON.parse(response.text);
			parseTwitchStreams(responseObject.streams, callback);
		}
	}).get();
	// Twitch.api({method: 'streams', params: {game:'League of Legends', limit:25} }, function(error, list) {
	// 	if(error) {
	// 		console.log(error);
	// 		return;
	// 	}

	//   	parseTwitchStreams(list.streams);
	//   	updateStreamList();
	// });
}