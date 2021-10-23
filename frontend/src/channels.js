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

export function getTime(date) {
	var hour = String(date.getHours()).padStart(2,'0');
	var minutes = String(date.getMinutes()).padStart(2,'0');
	return `${hour}:${minutes}`;
}

export function getDate(date) {
	var day = date.getDate();
	var month = date.getMonth();
	return `${day}/${month}`;
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
		const messages = data['messages'];
		for (let i=0; i < messages.length; i++) {
			const textbox = document.createElement("div");
			textbox.classList.add("textarea");
			// Message sender
			const sender = document.createElement("div");
			getNameFromId(messages[i]["sender"], TOKEN, channelId)
			.then(data => {
				sender.textContent = data;
			})
			// Message sent time
			const time = document.createElement("div");
			time.textContent = getTime(new Date(messages[i]["sentAt"]));
			// Message sent date
			const date = document.createElement("div");
			date.textContent = getDate(new Date(messages[i]["sentAt"]));
			// Message content
			var spanWrapper = document.createElement("span");
			
			var content = document.createElement("input");
			spanWrapper.append(content);
			content.type = "textbox"
			content.value = messages[i]['message'];
			content.id = `text${messages[i]['id']}`;
			content.disabled = true;
			content.classList.add("messageOutputBox");
			content.addEventListener("blur", (event) => {
				document.getElementById(`text${messages[i]['id']}`).disabled = true;
				if(messages[i]['message'] !== document.getElementById(`text${messages[i]['id']}`).value) {
					editMessages(messages[i]['id'], TOKEN, channelId);
				};
				
			})
			// Delete message button
			var delButton = helper.addIcon("bi-trash-fill");
			delButton.classList.add("icon");
			delButton.addEventListener("click", (event) => {
				deleteMessages(messages[i]['id'], TOKEN, channelId);
			});
			// Edit message button
			if(messages[i]['edited'] === true) {
				var editButton =  helper.addIcon("bi-pencil-fill");
				textbox.prepend(`\nEdited at:${getUserDate(new Date(messages[i]['editedAt']))}`);
			}
			else var editButton =  helper.addIcon("bi-pencil");
			
			editButton.classList.add("icon");
			editButton.id = `edit${messages[i]['id']}`;
			editButton.addEventListener("click", (event) => {
				const msg = document.getElementById(`text${messages[i]['id']}`);
				msg.disabled = false;
				msg.focus();
			})

			// React message button
			var reactButton = helper.addIcon("bi-emoji-smile");
			reactButton.classList.add("icon");
			reactButton.addEventListener("click", (event) => {
				document.getElementById("messageBox").value += "react";
			});

			// Pin message button
			var pinButton = helper.addIcon("bi-pin-angle");
			pinButton.classList.add("icon");
			pinButton.addEventListener("click", (event) => {
				console.log("pin");
			});

			textbox.prepend(pinButton);
			textbox.prepend(reactButton);
			textbox.prepend(delButton);
			textbox.prepend(editButton);
			textbox.prepend(content);
			textbox.prepend(date);
			textbox.prepend(time);
			textbox.prepend(sender);
			
			document.getElementById("messageText").prepend(textbox);
		}
        
		document.getElementById("messageText").scrollTo(0,document.getElementById("messageText").scrollHeight);
		MESSAGECOUNT += 25;
    })

}

export function getMESSAGECOUNT() {
	return MESSAGECOUNT;
}

export function getNameFromId(userId, TOKEN, channelId) {
	return helper.myFetch('GET', `user/${userId}`, TOKEN)
	.then(data => {
		return(data['name']);
	})
}


export function updateMessages(TOKEN, channelId) {
	var messageText = document.getElementById("messageText");
	var oldHeight = messageText.scrollHeight;
    helper.myFetch('GET', `message/${channelId}?start=${MESSAGECOUNT}`, TOKEN)
    .then(data => {
        const messages = data['messages'];
        for (let i=0; i < messages.length; i++) {
            const textbox = document.createElement("div");
			textbox.classList.add("textbox");
			// Message info
			textbox.textContent = messages[i]["sender"];
			textbox.textContent += getUserDate(new Date(messages[i]["sentAt"]));
			// Message content
			var content = document.createElement("input");
			content.type = "text"
			content.value = messages[i]['message'];
			content.id = `text${messages[i]['id']}`;
			content.disabled = true;
			content.addEventListener("blur", (event) => {
				document.getElementById(`text${messages[i]['id']}`).disabled = true;
				if(messages[i]['message'] !== document.getElementById(`text${messages[i]['id']}`).value) {
					console.log('edited');
					editMessages(messages[i]['id'], TOKEN, channelId);
				};
				
			})
			// Delete message button
			var delButton = helper.addIcon("bi-trash-fill");
			delButton.classList.add("icon");
			delButton.addEventListener("click", (event) => {
				deleteMessages(messages[i]['id'], TOKEN, channelId);
			});
			// Edit message button
			if(messages[i]['edited'] === true) {
				var editButton =  helper.addIcon("bi-pencil-fill");
				textbox.append(`\nEdited at:${getUserDate(new Date(messages[i]['editedAt']))}`);
			}
			else var editButton =  helper.addIcon("bi-pencil");
			
			editButton.classList.add("icon");
			editButton.id = `edit${messages[i]['id']}`;
			editButton.addEventListener("click", (event) => {
				const msg = document.getElementById(`text${messages[i]['id']}`);
				msg.disabled = false;
				msg.focus();
			})

			// React message button
			var reactButton = helper.addIcon("bi-emoji-smile");
			reactButton.classList.add("icon");
			reactButton.addEventListener("click", (event) => {
				console.log("react");
			});

			// Pin message button
			var pinButton = helper.addIcon("bi-pin-angle");
			pinButton.classList.add("icon");
			pinButton.addEventListener("click", (event) => {
				console.log("pin");
			});

			textbox.append(content);
			textbox.append(editButton);
			textbox.append(delButton);
			textbox.append(reactButton);
			textbox.append(pinButton);

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
		message: document.getElementById(`text${messageId}`).value,
		image: "",
	}
	helper.myFetch('PUT', `message/${channelId}/${messageId}`, TOKEN, body)
	.then( data => {
		// Show it was edited and when
		loadMessages(TOKEN, channelId);
	})
	.catch((data) => {
		console.log(data);
	})
}
