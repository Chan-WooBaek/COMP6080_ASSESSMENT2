import * as helper from './helpers.js';

var currentChannelId = false;
let MESSAGECOUNT = 0;
let PINMESSAGECOUNT = 0;
var currentMessageId;
let INVITEDMEMBERS = [];

// Update channel lists
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

// Add channel buttons to the lists
export function addChannelButton(value, isPrivate, TOKEN, channelId) {
	var newline = document.createElement("br");
    var element = document.createElement("input");
    element.type = "button";
	element.value = value;
	element.name = value;
	element.style="border: none; background: none; padding: 0; color: inherit;"
	element.onclick = function() {
		helper.myFetch('GET', `channel/${channelId}`, TOKEN)
		// If a member
		.then(data => {
			document.getElementById("editChannelButton").style.display = "flex";
			document.getElementById("leaveChannelButton").style.display = "flex";
			document.getElementById("inviteChannelButton").style.display = "flex";
			document.getElementById("pinnedMessageButton").style.display = "block";
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

// Create channel
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

// Edit channel
export function editChannel(TOKEN) {
	const body = {
		name: document.getElementById("editChannelName").value,
		description: document.getElementById("editChannelDescription").value,
	}
	helper.myFetch('PUT', `channel/${currentChannelId}`, TOKEN, body)
	.then(data => {
		
	})
}

// Update info screen
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

export function getCurrentMessageId() {
	return currentMessageId;
}

// Channel Info time format
export function getUserDate(date) {
	var day = date.getDate();
	var month = date.getMonth();
	var year = date.getFullYear();
	var hour = String(date.getHours()).padStart(2,'0');
	var minutes = String(date.getMinutes()).padStart(2,'0');
	return `Time ${hour}:${minutes} | Date ${day}/${month}/${year}`;
}

// Edit message time format
export function getEditDate(date) {
	var day = date.getDate();
	var month = date.getMonth();
	var year = date.getFullYear();
	var hour = String(date.getHours()).padStart(2,'0');
	var minutes = String(date.getMinutes()).padStart(2,'0');
	return `${hour}:${minutes} | ${day}/${month}/${year}`;
}

// Get hour and minutes
export function getTime(date) {
	var hour = String(date.getHours()).padStart(2,'0');
	var minutes = String(date.getMinutes()).padStart(2,'0');
	return `${hour}:${minutes}`;
}

// Get day and month
export function getDate(date) {
	var day = date.getDate();
	var month = date.getMonth();
	return `${day}/${month}`;
}

// Join current channel
export function joinChannel(TOKEN) {
	helper.myFetch('POST', `channel/${getCurrentChannelId()}/join`, TOKEN)
	.then(data => {
		console.log("Joined Channel");
		updateChannelInfoScreen(TOKEN, getCurrentChannelId());
		document.getElementById("editChannelButton").style.display = "flex";
		document.getElementById("leaveChannelButton").style.display = "flex";
	})
}

// Leave current channel
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

// Default page layout when no channel is shown
export function defaultChannelPage() {
	document.getElementById("infoText").textContent = "Choose a channel to view channel info";
	document.getElementById("messageText").textContent = "Choose a channel to view channel message";
	document.getElementById("editChannelButton").style.display = "none";
	document.getElementById("leaveChannelButton").style.display = "none";
	document.getElementById("inviteChannelButton").style.display = "none";
	document.getElementById("pinnedMessageButton").style.display = "none";
}

// Initial loading of messages in channel
export function loadMessages(TOKEN, channelId) {
	MESSAGECOUNT = 0;
	helper.removeAllChildNodes(document.getElementById("messageText"));
	document.getElementById("messageBox").style = "display: inline-flex";
	document.getElementById("messageSend").style = "display: inline-flex";
    helper.myFetch('GET', `message/${channelId}?start=0`, TOKEN)
    .then(data => {
		const messages = data['messages'];
		for (let i=0; i < messages.length; i++) {
			const textbox = document.createElement("div");
			textbox.classList.add("textarea");
			// Message sender
			const sender = document.createElement("div");
			const senderButton = document.createElement("input");
			senderButton.type = "button"
			senderButton.id = messages[i]['sender'];
			senderButton.classList.add("senderButton");
			senderButton.addEventListener("click", (event) => {
				appendUserInfo(TOKEN, senderButton.id);
				$('#ModalUserProfile').modal('show');
			})
			getNameFromId(messages[i]["sender"], TOKEN, channelId)
			.then(data => {
				senderButton.value = data;
				sender.append(senderImg(TOKEN, senderButton.id));
				sender.appendChild(senderButton);
			})
			// Message sent time
			const time = document.createElement("div");
			const date = document.createElement("div");
			const hourMin = document.createElement("div");
			date.style = "float: right"
			date.textContent = getDate(new Date(messages[i]["sentAt"]));
			time.classList.add("timeFormat");
			hourMin.textContent = getTime(new Date(messages[i]["sentAt"]));
			time.appendChild(date);
			time.appendChild(hourMin);
			// Message content
			var content = document.createElement("div");
			content.append(messages[i]['message']);
			content.id = `text${messages[i]['id']}`;
			content.classList.add("messageOutputBox");
			content.style = "color: black"
			content.addEventListener("blur", (event) => {
				console.log(document.getElementById(`text${messages[i]['id']}`));
				document.getElementById(`text${messages[i]['id']}`).contentEditable = false;
				if(messages[i]['message'] !== document.getElementById(`text${messages[i]['id']}`).textContent) {
					editMessages(messages[i]['id'], TOKEN, channelId);
				};
				
			})
			// Div to collect all buttons
			var buttonBox = document.createElement("div");
			buttonBox.classList.add("buttonBox");
			// Delete message button
			var delButton = helper.addIcon("bi-trash");
			delButton.classList.add("icon");
			delButton.addEventListener("click", (event) => {
				deleteMessages(messages[i]['id'], TOKEN, channelId);
			});
			// Edit message button
			if(messages[i]['edited'] === true) {
				var editButton =  helper.addIcon("bi-pencil-fill");
				var editedAt = document.createElement("div");
				editedAt.style = "float: right";
				editedAt.textContent =  `\nEdited at: ${getEditDate(new Date(messages[i]['editedAt']))}`;
				buttonBox.append(editedAt);
			}
			else var editButton =  helper.addIcon("bi-pencil");
			
			editButton.classList.add("icon");
			editButton.id = `edit${messages[i]['id']}`;
			editButton.addEventListener("click", (event) => {
				currentMessageId = messages[i]["id"];
				const msg = document.getElementById(`text${messages[i]['id']}`);
				msg.contentEditable = true;
				msg.focus();
			})

			// React message button
			var reactButton = helper.addIcon("bi-emoji-smile");
			reactButton.classList.add("icon");
			reactButton.addEventListener("click", (event) => {
				currentMessageId = messages[i]["id"];
				$('#ModalReact').modal('show');
			});

			// Pin message button
			if (messages[i]['pinned']) {
				var pinButton = helper.addIcon("bi-pin-angle-fill");
			} else var pinButton = helper.addIcon("bi-pin-angle");

			pinButton.classList.add("icon");
			
			pinButton.addEventListener("click", (event) => {
				currentMessageId = messages[i]["id"];
				pinCurrentMessage(TOKEN);
				loadMessages(TOKEN, channelId);
			});

			// Show react div
			var reactDiv = document.createElement("div");
			reactDiv.classList.add("reactDiv");
			reactDiv.id = `react${messages[i]['id']}`;
			
			messages[i]['reacts'].map(react => {
				reactDiv.append(react['react']);
			})

			buttonBox.appendChild(editButton);
			buttonBox.appendChild(reactButton);
			buttonBox.appendChild(delButton);
			buttonBox.appendChild(pinButton);
			textbox.append(time);
			textbox.append(sender);
			textbox.append(content);
			textbox.append(reactDiv);
			textbox.append(buttonBox);
			
			document.getElementById("messageText").prepend(textbox);
		}

		// Scroll to bottom
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

// Subsequent messages loaded after first 25 message
export function updateMessages(TOKEN, channelId) {
	var messageText = document.getElementById("messageText");
	var oldHeight = messageText.scrollHeight;
    helper.myFetch('GET', `message/${channelId}?start=${MESSAGECOUNT}`, TOKEN)
    .then(data => {
        const messages = data['messages'];
        for (let i=0; i < messages.length; i++) {
            const textbox = document.createElement("div");
			textbox.classList.add("textarea");
			// Message sender
			const sender = document.createElement("div");
			const senderButton = document.createElement("input");
			senderButton.type = "button"
			senderButton.id = messages[i]['sender'];
			senderButton.classList.add("senderButton");
			senderButton.addEventListener("click", (event) => {
				appendUserInfo(TOKEN, senderButton.id);
				$('#ModalUserProfile').modal('show');
			})
			getNameFromId(messages[i]["sender"], TOKEN, channelId)
			.then(data => {
				senderButton.value = data;
				sender.append(senderImg(TOKEN, senderButton.id));
				sender.appendChild(senderButton);
			})
			// Message sent time
			const time = document.createElement("div");
			const date = document.createElement("div");
			const hourMin = document.createElement("div");
			date.style = "float: right"
			date.textContent = getDate(new Date(messages[i]["sentAt"]));
			time.classList.add("timeFormat");
			hourMin.textContent = getTime(new Date(messages[i]["sentAt"]));
			time.appendChild(date);
			time.appendChild(hourMin);
			// Message content
			var content = document.createElement("div");
			content.append(messages[i]['message']);
			content.id = `text${messages[i]['id']}`;
			content.classList.add("messageOutputBox");
			content.addEventListener("blur", (event) => {
				console.log(document.getElementById(`text${messages[i]['id']}`));
				document.getElementById(`text${messages[i]['id']}`).contentEditable = false;
				if(messages[i]['message'] !== document.getElementById(`text${messages[i]['id']}`).textContent) {
					editMessages(messages[i]['id'], TOKEN, channelId);
				};
				
			})
			// Div to collect all buttons
			var buttonBox = document.createElement("div");
			buttonBox.classList.add("buttonBox");
			// Delete message button
			var delButton = helper.addIcon("bi-trash");
			delButton.classList.add("icon");
			delButton.addEventListener("click", (event) => {
				deleteMessages(messages[i]['id'], TOKEN, channelId);
			});
			// Edit message button
			if(messages[i]['edited'] === true) {
				var editButton =  helper.addIcon("bi-pencil-fill");
				var editedAt = document.createElement("div");
				editedAt.style = "float: right";
				editedAt.textContent =  `\nEdited at: ${getEditDate(new Date(messages[i]['editedAt']))}`;
				buttonBox.append(editedAt);
			}
			else var editButton =  helper.addIcon("bi-pencil");
			
			editButton.classList.add("icon");
			editButton.id = `edit${messages[i]['id']}`;
			editButton.addEventListener("click", (event) => {
				currentMessageId = messages[i]["id"];
				const msg = document.getElementById(`text${messages[i]['id']}`);
				msg.contentEditable = true;
				msg.focus();
			})

			// React message button
			var reactButton = helper.addIcon("bi-emoji-smile");
			reactButton.classList.add("icon");
			reactButton.addEventListener("click", (event) => {
				currentMessageId = messages[i]["id"];
				$('#ModalReact').modal('show');
			});

			// Pin message button
			if (messages[i]['pinned']) {
				var pinButton = helper.addIcon("bi-pin-angle-fill");
			} else var pinButton = helper.addIcon("bi-pin-angle");

			pinButton.classList.add("icon");
			
			pinButton.addEventListener("click", (event) => {
				currentMessageId = messages[i]["id"];
				pinCurrentMessage(TOKEN);
				loadMessages(TOKEN, channelId);
			});

			// Show react div
			var reactDiv = document.createElement("div");
			reactDiv.classList.add("reactDiv");
			reactDiv.id = `react${messages[i]['id']}`;
			
			messages[i]['reacts'].map(react => {
				reactDiv.append(react['react']);
			})

			buttonBox.appendChild(editButton);
			buttonBox.appendChild(reactButton);
			buttonBox.appendChild(delButton);
			buttonBox.appendChild(pinButton);
			textbox.append(time);
			textbox.append(sender);
			textbox.append(content);
			textbox.append(reactDiv);
			textbox.append(buttonBox);
			
			document.getElementById("messageText").prepend(textbox);
        }
		MESSAGECOUNT += 25;
		var newHeight = messageText.scrollHeight;
		messageText.scrollTop = newHeight - oldHeight;
    })
	
}

// Send messages
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

//Delete messages
export function deleteMessages(messageId, TOKEN, channelId) {
	helper.myFetch('DELETE', `message/${channelId}/${messageId}`, TOKEN)
	.then( data => {
		loadMessages(TOKEN, getCurrentChannelId());
	})
}

// Edit messages
export function editMessages(messageId, TOKEN, channelId) {
	console.log(document.getElementById(`text${messageId}`).textContent);
	const body = {
		message: document.getElementById(`text${messageId}`).textContent,
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

// Add react
export function addReact(reactValue, TOKEN) {
	const body = {
		react: reactValue
	}
	helper.myFetch("POST", `message/react/${getCurrentChannelId()}/${getCurrentMessageId()}`, TOKEN, body)
	.then(data => {
		
	})
}

// Unreact
export function unReact(reactValue, TOKEN) {
	const body = {
		react: reactValue
	}
	helper.myFetch("POST", `message/unreact/${getCurrentChannelId()}/${getCurrentMessageId()}`, TOKEN, body)
	.then(data => {
		
	})
}

// Pin current message
export function pinCurrentMessage(TOKEN) {
	helper.myFetch("POST", `message/pin/${getCurrentChannelId()}/${getCurrentMessageId()}`, TOKEN)
	.then(data => {

	})
}

// Unpin current message
export function unpinCurrentMessage(TOKEN, messageId) {
	helper.myFetch("POST", `message/unpin/${getCurrentChannelId()}/${messageId}`, TOKEN)
	.then(data => {

	})
}

// Refresh pinned messages list
export function updatePinnedMessages(TOKEN, channelId) {
	// Map through all msgs in channel
	helper.myFetch("GET", `message/${channelId}?start=${PINMESSAGECOUNT}`, TOKEN)
	.then(data => {
		const messages = data['messages'];
		for (let i=0; i < messages.length; i++) {
			// Look for pinned messages
			if (messages[i]["pinned"]) {
				var pinMessage = document.createElement("div");
				var unpinButton = helper.addIcon("bi-pin")
				unpinButton.classList.add("icon");
				unpinButton.addEventListener("click", (event) => {
					unpinCurrentMessage(TOKEN, messages[i]['id']);
					loadMessages(TOKEN, channelId);
				})
				pinMessage.appendChild(unpinButton);
				pinMessage.append(messages[i]['message']);
				document.getElementById("pin-modal-body").appendChild(pinMessage);
			}
		}
		if (messages.length === 25) {
			// Go to next batch of messages
			PINMESSAGECOUNT += 25;
			return updatePinnedMessages(TOKEN, channelId);
		} else {
			// Last batch of messages
			PINMESSAGECOUNT = 0;
			return;
		}
	})
}

// Append user info into the user profile
function appendUserInfo(TOKEN, userId) {
	helper.removeAllChildNodes(document.getElementById("user-modal-body"));
	helper.myFetch("GET", `user/${userId}`, TOKEN)
	.then(data => {
		// Add profile pic
		var img = document.createElement("div");
		img.append("Profile Photo: ")
		img.appendChild(senderImg(TOKEN, userId))
		document.getElementById("user-modal-body").appendChild(img);
		// Add name
		var name = document.createElement("div");
		name.append("Name: ")
		name.append(data['name'])
		document.getElementById("user-modal-body").appendChild(name);
		// Add bio
		var bio = document.createElement("div");
		bio.append("Bio: ")
		if (data['bio'] !== null) bio.append(data['bio']);
		document.getElementById("user-modal-body").appendChild(bio);
		// Add email
		var email = document.createElement("div");
		email.append("Email: ")
		email.append(data['email'])
		document.getElementById("user-modal-body").appendChild(email);
	})
}


// Get image from id
function senderImg(TOKEN, senderId) {
	var img = document.createElement("img");
	helper.myFetch("GET", `user/${senderId}`, TOKEN)
	.then(data => {
		if (data['image'] === null) {
			img.src = "src/images/default.png";
			img.style.width = "30px";
			img.style.height = "30px";
			img.style.borderRadius = "50%";
		} else {
			img.src = data['image'];
			img.style.width = "30px";
			img.style.height = "30px";
			img.style.borderRadius = "50%";
		}
	})
	return img;
}

// Update the potential users to invite
export function updateUserInviteList(TOKEN, channelId) {
	var userIdList;
	var userButtonDiv = document.createElement("div");
	helper.myFetch("GET", `channel/${channelId}`, TOKEN)
	.then(data => {
		// Get existing members
		userIdList = data['members'];
		return helper.myFetch('GET', `user`, TOKEN)
	})
	.then(data => {
		var allUsers = [];
		for (let i=0; i < data['users'].length; i++) {
			allUsers.push(data['users'][i]['id']);
		}
		return allUsers
	})
	.then(data => {
		// Compare to full list of users and get unique id's
		let difference = data.filter(x => !userIdList.includes(x));
		userButtonDiv.append("Invite List:");
		for(let i = 0; i < difference.length; i++) {
			getNameFromId(difference[i], TOKEN, channelId)
			.then(name => {
				var userButton = document.createElement("input");
				userButton.type = "button";
				userButton.value = name;
				userButton.addEventListener("click", (event) => {
					INVITEDMEMBERS.push({
						id: difference[i],
						name: name
					});
					updateUserInvitedList(name, TOKEN, channelId);
				})
				userButtonDiv.appendChild(userButton);
			})
		}
		document.getElementById("invite-modal-body").appendChild(userButtonDiv);
	})
}

// Update list of users to be invited
export function updateUserInvitedList(name, TOKEN, channelId) {
	helper.removeAllChildNodes(document.getElementById("invite-modal-body"));
	var InvitedDiv = document.createElement("div");
	InvitedDiv.append("Invited: ");
	for (let i = 0; i < INVITEDMEMBERS.length; i++) {
		InvitedDiv.append(` ${INVITEDMEMBERS[i]['name']}`);
	}
	
	updateUserInviteList(TOKEN, channelId);
	document.getElementById("invite-modal-body").appendChild(InvitedDiv);
}

export function resetInvitedList() {
	INVITEDMEMBERS = [];
}

export function addMembers(TOKEN, channelId) {
	for (let i = 0; i < INVITEDMEMBERS.length; i++) {
		const body = {
			userId: INVITEDMEMBERS[i]['id']
		}
		helper.myFetch('POST', `channel/${channelId}/invite`, TOKEN, body)
		.then(data => {
		})
	}
}

// Create edit user form
export function editUserForm(password) {
	// Password display
	var userPasswordToggle = document.createElement("div");
	userPasswordToggle.append("Password");
	var passwordField = document.createElement("input");
	passwordField.type = "password";
	passwordField.value = password;
	passwordField.id = "passwordField"
	passwordField.disabled = true;
	userPasswordToggle.appendChild(passwordField);
	var togglePassword = document.createElement("input");
	togglePassword.type = "checkbox";
	togglePassword.addEventListener("click", (event) => {
		var state = document.getElementById("passwordField");
		if (state.type === "password") state.type = "text";
		else state.type = "password";
	})
	userPasswordToggle.appendChild(togglePassword);
	// Input for edit user name
	var userName = document.createElement("div");
	userName.append("Name: ");
	var nameEdit = document.createElement("input");
	nameEdit.type = "textarea";
	nameEdit.id = "newName";
	userName.appendChild(nameEdit);

	// Input for edit user bio
	var userBio = document.createElement("div");
	userBio.append("Bio: ");
	var bioEdit = document.createElement("input");
	bioEdit.type = "textarea";
	bioEdit.id = "newBio";
	userBio.appendChild(bioEdit);

	// Input for edit user email
	var userEmail = document.createElement("div");
	userEmail.append("Email: ");
	var emailEdit = document.createElement("input");
	emailEdit.type = "textarea";
	emailEdit.id = "newEmail";
	userEmail.appendChild(emailEdit);

	// Input for edit user password
	var userPassword = document.createElement("div");
	userPassword.append("Password: ");
	var passwordEdit = document.createElement("input");
	passwordEdit.type = "textarea";
	passwordEdit.id = "newPassword";
	userPassword.appendChild(passwordEdit);

	// Upload file button
	var userPic = document.createElement("div");
	userPic.append("Image Path: ");
	var picEdit = document.createElement("input");
	picEdit.type = "text";
	picEdit.id = "newPic";
	picEdit.placeholder = "e.g. src/images/default.png"
	userPic.appendChild(picEdit);

	document.getElementById("edit-modal-body").appendChild(userPasswordToggle);
	document.getElementById("edit-modal-body").append("Edit user");
	document.getElementById("edit-modal-body").appendChild(userName);
	document.getElementById("edit-modal-body").appendChild(userBio);
	document.getElementById("edit-modal-body").appendChild(userEmail);
	document.getElementById("edit-modal-body").appendChild(userPassword);
	document.getElementById("edit-modal-body").appendChild(userPic);
}

// Update user with info from edit user form
export function updateUser(TOKEN) {
	const body = {
		email: document.getElementById("newEmail").value,
		password: document.getElementById("newPassword").value,
		name: document.getElementById("newName").value,
		bio: document.getElementById("newBio").value,
		image: document.getElementById("newPic").value
	}
	helper.myFetch("PUT", `user`, TOKEN, body)
	.then(data => {
		console.log("success");
	})
	.catch(data => {
		console.log(data);
	})
}