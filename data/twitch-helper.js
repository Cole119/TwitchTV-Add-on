var twitchLoaded = false;

function parseTwitchStreams(streams) {
	live_streams = live_streams.filter(function(a) { return a.site != twitchSiteName; });
	//live_streams.length = 0;

	streams.forEach(function(stream, index, array) {
		var streamer = {name: stream.channel.display_name, 
						url: stream.channel.url, 
						viewers: stream.viewers, 
						logo: stream.channel.logo,
						site: twitchSiteName};
		live_streams.push(streamer);
	});
}

function fetchTwitchStreams() {
	Twitch.api({method: 'streams', params: {game:'League of Legends', limit:25} }, function(error, list) {
		if(error) {
			console.log(error);
		}

	  	parseTwitchStreams(list.streams);
	  	updateStreamList();
	});
}

Twitch.init({clientId: '183b5hpp1svo7bs2xua9pu5oo7ws9ow'}, function(error, status) {
	if (error) {
		// error encountered while loading
		console.log(error);
	}
	// the sdk is now loaded
	twitchLoaded = true;
});