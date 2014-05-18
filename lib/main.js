var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var twitch = require("./twitch-helper");
var scripts = [self.data.url("jquery-2.1.1.min.js"), self.data.url("update-panel.js")];
var twitchKey = "twitch";
var onlineStreamers = {};
var refreshInterval = 20000;
onlineStreamers[twitchKey] = [];

if (!ss.storage.favorites) {
	ss.storage.favorites = [];
}

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: self.data.url("live-panel.html"),
  contentScriptFile: scripts,
  onHide: handleHide
});

panel.port.emit("storedFavorites", ss.storage.favorites);

panel.port.on("addFavorite", function(url) {
	if(!isFavorite(url)) {
		ss.storage.favorites.push(url);
	}
});

panel.port.on("removeFavorite", function(url) {
	if(isFavorite(url)) {
		ss.storage.favorites.splice(ss.storage.favorites.indexOf(url), 1);
	}
});

fetchStreams();
require("sdk/timers").setInterval(fetchStreams, refreshInterval);

function fetchStreams() {
	twitch.fetchTwitchStreams(function(response) {
		updateStreamers(twitchKey, response);
	});
}

function updateStreamers(key, streamers) {
	onlineStreamers[key] = streamers;

	var streams = [];
	for(var k in onlineStreamers) {
		streams = streams.concat(onlineStreamers[k]);
	}
	streams.sort(function(a, b) { return b.viewers - a.viewers });

	panel.port.emit("refreshStreams", streams);
}

function isFavorite(url) {
	return (ss.storage.favorites.indexOf(url) > -1);
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