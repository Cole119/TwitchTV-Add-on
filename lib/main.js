var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var notifications = require("sdk/notifications");
var tabs = require("sdk/tabs");
var twitch = require("./twitch-helper");
var scripts = [self.data.url("jquery-2.1.1.min.js"), self.data.url("update-panel.js")];
var twitchKey = "twitch";
var onlineStreamers = {};
var refreshInterval = 30000;
var panelWidth = 375, panelHeight = 600;
// Counts the number of times we have refreshed the stream list
var refreshCounter = 0;
onlineStreamers[twitchKey] = [];

if (!ss.storage.favorites) {
	ss.storage.favorites = [];
}

// Used to map a favorited stream to its online status.
var favorites = {};
for(var fav in ss.storage.favorites) {
	var url = ss.storage.favorites[fav];
	favorites[url] = {lastOnline: -1};
}

var button = ToggleButton({
	id: "lol-button",
	label: "League of Legends Stream Browser",
	icon: {
		"16": "./icon-16.png",
		"32": "./icon-32.png",
		"64": "./icon-64.png"
	},
	onChange: handleChange
});

var panel = panels.Panel({
	width: panelWidth,
	height: panelHeight,
	contentURL: self.data.url("live-panel.html"),
	contentScriptFile: scripts,
	onHide: handleHide
});

panel.port.emit("storedFavorites", ss.storage.favorites);

panel.port.on("addFavorite", function(url) {
	if(!isFavorite(url)) {
		ss.storage.favorites.push(url);
		favorites[url] = {lastOnline: refreshCounter};
		updateStreamers();
	}
});

panel.port.on("removeFavorite", function(url) {
	if(isFavorite(url)) {
		ss.storage.favorites.splice(ss.storage.favorites.indexOf(url), 1);
		delete favorites[url];
		updateStreamers();
	}
});

fetchStreams();
require("sdk/timers").setInterval(fetchStreams, refreshInterval);

function fetchStreams() {
	refreshCounter++;

	twitch.fetchTwitchStreams(function(response) {
		updateStreamers(twitchKey, response);
	});
}

function updateStreamers(key, streamers) {
	if(streamers) {
		checkForFavorites(streamers);
		onlineStreamers[key] = streamers;
	}

	var streams = [];
	for(var k in onlineStreamers) {
		streams = streams.concat(onlineStreamers[k]);
	}
	streams.sort(function(a, b) {
		if(isFavorite(a.url) && !isFavorite(b.url)) {
			return -1;
		} else if(!isFavorite(a.url) && isFavorite(b.url)) {
			return 1;
		}
		return b.viewers - a.viewers 
	});

	panel.port.emit("refreshStreams", streams);
}

function checkForFavorites(streamers) {
	var notifs = [];
	for(var i in streamers) {
		var url = streamers[i].url;

		//console.log("checking if " + url + " is a favorite");
		if(isFavorite(url)) {
			//console.log("it is");
			if(refreshCounter - favorites[url].lastOnline > 1) {
				notifs.push(streamers[i]);
			}
			favorites[url].lastOnline = refreshCounter;
		}
	}
	sendNotification(notifs);
}

function sendNotification(streamers) {
	if(streamers.length < 1) return;

	if(streamers.length > 1) {
		var streamerNames = "";
		for(s in streamers) {
			streamerNames += streamers[s].name;
			if(s < streamers.length-1) {
				streamerNames += ", ";
			}
		}
		notifications.notify({
			title: "The following " + streamers.length + " streamers are online:",
			text:  streamerNames,
			iconURL: self.data.url("icon-32.png")
		});
	} else {
		notifications.notify({
			title: streamers[0].name + " is now online",
			text: streamers[0].status,
			iconURL: streamers[0].logo,
			data: streamers[0].url,
			onClick: function (data) {
		  		tabs.open(streamers[0].url);
			}
		});
	}
}

function isFavorite(url) {
	//return (ss.storage.favorites.indexOf(url) > -1);
	return !!favorites[url];
}

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}