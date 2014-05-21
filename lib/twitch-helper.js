//https://api.twitch.tv/kraken/streams?game=League+of+Legends&limit=25

exports.fetchTwitchStreams = fetchTwitchStreams;

var Request = require("sdk/request").Request;

var twitchLoaded = false;
var baseUrl = "https://api.twitch.tv/kraken/";
var query = "game=League+of+Legends&limit=25";
var MIMETypeHeader = "application/vnd.twitchtv.v2+json";
var clientId = "183b5hpp1svo7bs2xua9pu5oo7ws9ow";

function parseTwitchStreams(streams, callback) {
	var liveStreams = [];

	streams.forEach(function(stream, index, array) {
		var streamer = {name: stream.channel.display_name, 
						url: stream.channel.url, 
						viewers: stream.viewers, 
						status: stream.channel.status,
						logo: stream.channel.logo,
						site: "twitch"};
		console.log(streamer.name + "'s logo is " + streamer.logo);
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
			if(response.status == 200 && response.json) {
				parseTwitchStreams(response.json.streams, callback);
			} else {
				console.error("Twitch responded with an error!", 
							  "Response text is " + response.text,
							  "Response code was " + response.status,
							  "Response status text is " + response.statusText,
							  "Response headers: " + response.headers);
			}
		}
	}).get();
}