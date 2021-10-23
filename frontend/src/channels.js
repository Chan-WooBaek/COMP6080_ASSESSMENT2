import * as helper from './helpers.js';

var currentChannelId = false;
let MESSAGECOUNT = 0;

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
	element.style="border: none; background: none; padding: 0;"
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
	MESSAGECOUNT = 0;
	helper.removeAllChildNodes(document.getElementById("messageText"));
    helper.myFetch('GET', `message/${channelId}?start=0`, TOKEN)
    .then(data => {

		const messages = data['messages'].reverse();
		for (let i=0; i < messages.length; i++) {
			const textbox = document.createElement("div");
			// Message info
			textbox.textContent = messages[i]["sender"];
			textbox.textContent += getUserDate(new Date(messages[i]["sentAt"]));
			// Message content
			var content = document.createElement("input");
			content.type = "text"
			content.value = messages[i]['message'];
			content.id = messages[i]['id'];
			content.disabled = true;
			content.addEventListener("blur", (event) => {
				console.log('blur');
				document.getElementById(messages[i]["id"]).disabled = true;
				editMessages(messages[i]['id'], TOKEN, channelId)
			})
			// Delete message button
			var delButton = helper.addIcon("bi-trash-fill");
			delButton.classList.add("icon");
			delButton.addEventListener("click", (event) => {
				deleteMessages(messages[i]['id'], TOKEN, channelId);
			});
			// Edit channel button
			var editButton =  helper.addIcon("bi-pencil-fill");
			editButton.classList.add("icon");
			editButton.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				const msg = document.getElementById(messages[i]["id"]);
				msg.disabled = false;
				msg.focus();
				
			})

			textbox.append(editButton);
			textbox.append(delButton);
			textbox.append(content);
			
			document.getElementById("messageText").appendChild(textbox);
		}
        
		document.getElementById("messageText").scrollTo(0,document.getElementById("messageText").scrollHeight);
		MESSAGECOUNT += 25;
    })

}

export function getMESSAGECOUNT() {
	return MESSAGECOUNT;
}


export function updateMessages(TOKEN, channelId) {
	var messageText = document.getElementById("messageText");
	var oldHeight = messageText.scrollHeight;
    helper.myFetch('GET', `message/${channelId}?start=${MESSAGECOUNT}`, TOKEN)
    .then(data => {
        const messages = data['messages'];
        for (let i=0; i < messages.length; i++) {
            const textbox = document.createElement("div");
			// Message Info
			textbox.textContent = messages[i]["sender"];
			textbox.textContent += getUserDate(new Date(messages[i]["sentAt"]));
            textbox.textContent += `\n${messages[i]['message']}`;
			// Delete message button
			var delButton = document.createElement("input");
			delButton = helper.addIcon(delButton,"bi-trash-fill");
			delButton.type = "button";
			delButton.name = "delButton";
			delButton.addEventListener("click", (event) => {
				deleteMessages(messages[i]['id'], TOKEN, channelId);
			});
			textbox.prepend(delButton);
            document.getElementById("messageText").prepend(textbox);
        }
		MESSAGECOUNT += 25;
		var newHeight = messageText.scrollHeight;
		messageText.scrollTop = newHeight - oldHeight;
    })
	
}

export function sendMessages(TOKEN, channelId) {
	if (document.getElementById("messageBox").value.length === 0 || document.getElementById("messageBox").value.indexOf(' ') === 0) {
		return;
	}
	const body = {
		message: document.getElementById("messageBox").value,
		image: ""
	}
	helper.myFetch('POST', `message/${channelId}`, TOKEN, body)
	.then(data => {
		loadMessages(TOKEN, getCurrentChannelId());
	})
}

export function deleteMessages(messageId, TOKEN, channelId) {
	helper.myFetch('DELETE', `message/${channelId}/${messageId}`, TOKEN)
	.then( data => {
		loadMessages(TOKEN, getCurrentChannelId());
	})
}

export function editMessages(messageId, TOKEN, channelId) {
	const body = {
		message: document.getElementById(messageId).value,
		image: "",
	}
	helper.myFetch('PUT', `message/${channelId}/${messageId}`, TOKEN, body)
	.then( data => {
		// Show it was edited and when
	})
	.catch((data) => {
		console.log(data);
	})
}
