var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var scripts = [self.data.url("twitch-helper.js"), self.data.url("update-panel.js")];

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