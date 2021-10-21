import * as helper from './helpers.js';

export function updateChannelShow(TOKEN) {
	helper.myFetch('GET', 'channel', TOKEN)
	.then((data) => {
		data['channels'].map(channels => {
			if (document.getElementsByName(channels['name']).length === 0) {
				addChannelButton(channels['name'], channels['private'], TOKEN, channels['id']);
			}
		})
	})
}

export function addChannelButton(value, isPrivate, TOKEN, channelId) {
	var newline = document.createElement("br");
    var element = document.createElement("input");
    element.type = "button";
	element.value = value;
	element.name = value;
	element.onclick = function() {
		updateChannelScreen(TOKEN, channelId);
	};

	if (isPrivate) {
		var priv = document.getElementById("privateChannelList");
		priv.appendChild(newline);
		priv.appendChild(element);
	} else {
		var publ = document.getElementById("publicChannelList");
		publ.appendChild(newline);
		publ.appendChild(element);
	}
	
}

export function createChannel(TOKEN) {
	var name = document.getElementById("newChannelName").value;
	var description = document.getElementById("newChannelDescription").value;
	const body = {
		name: name,
		private: document.getElementById("newChannelPrivate").checked,
		description: description
	}
	helper.myFetch('POST', 'channel', TOKEN, body)
	.then(data => {
		updateChannelShow(TOKEN);
	})
}

export function updateChannelScreen(TOKEN, channelId) {
	helper.myFetch('GET', `channel/${channelId}`, TOKEN)
	.then(data => {
		var date = new Date(data['createdAt']);
		let newString = `Channel Name: ${data['name']}\n
		Description: ${data['description']}\n
		Private: ${data['private']}\n
		Created at: ${date}\n`
		document.getElementById("infoText").textContent = newString
		return helper.myFetch("GET", `user/${data['creator']}`, TOKEN);
	})
	.then(data => {
		document.getElementById("infoText").textContent += `\nCreator: ${data['name']}`;
		return helper.myFetch('GET', `message/${channelId}?start=0`, TOKEN);
	})
	.then(data => {
		document.getElementById("messageText").textContent = '';
		for (let i=0; i < data['messages'].length; i++) {
			document.getElementById("messageText").textContent += `${data['messages'][i]['message']}\n`;
		}
	})
}