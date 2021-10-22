import * as helper from './helpers.js';
import * as message from './messages.js';

var currentChannelId = false;

export function updateChannelListShow(TOKEN, USERID) {
	document.getElementById("publicChannelList").textContent = "";
	helper.myFetch('GET', 'channel', TOKEN)
	.then((data) => {
		data['channels'].map(channels => {
			if (document.getElementsByName(channels['name']).length === 0) {
				if(channels['private'] && channels['members'].includes(USERID)) {
					addChannelButton(channels['name'], channels['private'], TOKEN, channels['id']);
				} else if (!channels['private']){
					addChannelButton(channels['name'], channels['private'], TOKEN, channels['id']);
				}
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
		helper.myFetch('GET', `channel/${channelId}`, TOKEN)
		// If a member
		.then(data => {
			document.getElementById("editChannelButton").style.display = "flex";
			document.getElementById("leaveChannelButton").style.display = "flex";
			currentChannelId = channelId;
			updateChannelInfoScreen(TOKEN, channelId);
			loadMessages(TOKEN, channelId);
		})
		.then(data => {
			
		})
		// If not a member
		.catch(data => {
			currentChannelId = channelId;
			console.log("not a member");
			document.getElementById("joinPopup").style.display = "flex";
		})
		
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
	const body = {
		name: document.getElementById("newChannelName").value,
		private: document.getElementById("newChannelPrivate").checked,
		description: document.getElementById("newChannelDescription").value
	}
	helper.myFetch('POST', 'channel', TOKEN, body)
	.then(data => {
		updateChannelShow(TOKEN);
	})
}

export function editChannel(TOKEN) {
	const body = {
		name: document.getElementById("editChannelName").value,
		description: document.getElementById("editChannelDescription").value,
	}
	helper.myFetch('PUT', `channel/${currentChannelId}`, TOKEN, body)
	.then(data => {
		
	})
}

export function updateChannelInfoScreen(TOKEN, channelId) {

	helper.myFetch('GET', `channel/${channelId}`, TOKEN)
	.then(data => {
		var date = getUserDate(new Date(data['createdAt']));
		let newString = `Channel Name: ${data['name']}\n
		Description: ${data['description']}\n
		Private: ${data['private']}\n
		Created at: ${date}\n`
		document.getElementById("infoText").textContent = newString
		return helper.myFetch("GET", `user/${data['creator']}`, TOKEN);
	})
	.then(data => {
		document.getElementById("infoText").textContent += `\nCreator: ${data['name']}`;
	})
}

export function getCurrentChannelId() {
	return currentChannelId;
}

export function getUserDate(date) {
	var day = date.getDate();
	var month = date.getMonth();
	var year = date.getFullYear();
	var hour = String(date.getHours()).padStart(2,'0');
	var minutes = String(date.getMinutes()).padStart(2,'0');
	return `Time ${hour}:${minutes} | Date ${day}/${month}/${year}`;
}

export function joinChannel(TOKEN) {
	helper.myFetch('POST', `channel/${getCurrentChannelId()}/join`, TOKEN)
	.then(data => {
		console.log("Joined Channel");
		updateChannelInfoScreen(TOKEN, getCurrentChannelId());
		document.getElementById("editChannelButton").style.display = "flex";
		document.getElementById("leaveChannelButton").style.display = "flex";
	})
}

export function leaveChannel(TOKEN) {
	helper.myFetch('GET', `channel/${getCurrentChannelId()}`, TOKEN)
	.then(data => {
		document.getElementById("leftText").textContent = `Left Channel ${data['name']}`;
		document.getElementById("leftPopup").style.display = "flex";
		return helper.myFetch('POST', `channel/${getCurrentChannelId()}/leave`, TOKEN)
	})
	.then(data => {
		console.log("left channel");
	})
}

export function defaultChannelPage() {
	document.getElementById("infoText").textContent = "Choose a channel to view channel info";
	document.getElementById("messageText").textContent = "Choose a channel to view channel message";
	document.getElementById("editChannelButton").style.display = "none";
	document.getElementById("leaveChannelButton").style.display = "none";
}

export function loadMessages(TOKEN, channelId) {
    helper.myFetch('GET', `message/${channelId}?start=0`, TOKEN)
    .then(data => {
        document.getElementById("messageText").textContent = '';
		
        for (let i=0; i < data['messages'].length; i++) {
            const textbox = document.createElement("div");
			textbox.textContent = data['messages'][i]["sender"];
			textbox.textContent += getUserDate(new Date(data['messages'][i]["sentAt"]));
            textbox.textContent += `\n${data['messages'][i]['message']}`;
            document.getElementById("messageText").appendChild(textbox);
        }
		
    })
}