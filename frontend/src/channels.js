import * as helper from './helpers.js';

export function updateChannelShow(TOKEN) {
	helper.myFetch('GET', 'channel', TOKEN)
	.then((data) => {
		data['channels'].map(channels => {
			if (document.getElementsByName(channels['name']).length === 0) {
				addChannelButton(channels['name'], channels['private']);
			}
		})
	})
}

export function addChannelButton(value, isPrivate) {
	var newline = document.createElement("br");
    var element = document.createElement("input");
    element.type = "button";
	element.value = value;
	element.name = value;

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