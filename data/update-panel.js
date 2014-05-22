var live_streams = [];
var favorites = [];
var refreshInterval = 20000;
var twitchSiteName = "twitch";
var favoriteIcon = "favorite-on.png";
var nonFavoriteIcon = "favorite-off.png";
var twitchLoaded = false;

self.port.on("storedFavorites", function loadFavorites(storedFavorites) {
	favorites = storedFavorites;
	for(var fav in favorites) {
		console.log("Loaded favorite " + favorites[fav] + " from storage.");
	}
});

self.port.on("refreshStreams", function(streams) {
	updateStreamList(streams);
});

function updateStreamList(streams) {
	$(".streamer").remove();

	streams.forEach(function(stream, index, array) {
		var clazz = "streamer " + ((index % 2 == 0) ? "even" : "odd");
		var row = $("<tr>", {class: clazz});
		var favIcon = isFavorite(stream.url) ? favoriteIcon : nonFavoriteIcon;
		var favorite = $("<img>", {src: favIcon, class: "icon favorite", stream: stream.url});
		favorite.on({
		    'click': addOrRemoveFavorite
		});
		var icon = $("<img>", {src: stream.logo, class: "icon"});
		var name = $("<a>", {href: "#", class: "streamer-name"}).html(stream.name);
		name.click(function(e) {
			e.preventDefault();
			openStream(stream.url);
		});
		var viewers = $("<td>", {class: "viewers"}).html(stream.viewers);
		row.append($("<td>").append(favorite, icon, name), viewers);
		$('#stream-table').append(row);
	});
}

function openStream(url) {
	self.port.emit("openStream", url);
}

function addOrRemoveFavorite() {
	var streamUrl = $(this).attr('stream');
	if(isFavorite(streamUrl)) {
		$(this).attr('src', nonFavoriteIcon);
		favorites.splice(favorites.indexOf(streamUrl), 1);
		self.port.emit("removeFavorite", streamUrl);
	} else {
		$(this).attr('src', favoriteIcon);
		favorites.push(streamUrl);
		self.port.emit("addFavorite", streamUrl);
	}
}

function isFavorite(url) {
	return (favorites.indexOf(url) > -1);
}

function fetchStreams() {
	if(twitchLoaded) {
		fetchTwitchStreams();
	}
}
