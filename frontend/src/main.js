import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import * as auth from './auth.js';
import * as channel from './channels.js';
import * as helper from './helpers.js';

console.log('Let\'s go!');

let TOKEN = null;
const storeToken = (token) => {
	TOKEN = token;
}
let USERID = null;
const storeCurrentUserId = (userId) => {
	USERID = userId;
}

// LoginForm register button is pressed
document.getElementById("loginRegister").addEventListener("click", (event) => {
	auth.showRegisterForm();
});

// LoginForm submit button is pressed
document.getElementById("loginSubmit").addEventListener("click", (event) => {
	const email = document.getElementById("loginEmail").value;
	const password = document.getElementById("loginPassword").value;
	const body = {
		email: email,
		password: password,
	}
	helper.myFetch('POST','auth/login', null, body)
	.then((data) => {
		storeToken(data['token']);
		storeCurrentUserId(data['userId']);
		document.getElementById("notLoggedIn").style.display = "none";
		document.getElementById("loggedIn").style.display = "grid";
		channel.updateChannelListShow(TOKEN, USERID);
	})
	.catch((errorMsg) => {
		document.getElementById("popupMsg").textContent = errorMsg;
		document.getElementById("popup").style.display = "flex";
	});
});

// RegisterForm submit button is pressed
document.getElementById("registerSubmit").addEventListener("click", (event) => {
	auth.submitRegisterForm();
});

// Close error popup
document.getElementById("errorClose").addEventListener("click", (event) => {
	document.getElementById("popup").style.display = "none";
});

// Show popup form for create channel
document.getElementById("channelCreate").addEventListener("click", (event) => {
	document.getElementById("formCreateTitle").textContent = "Create new channel";
	document.getElementById("channelCreateForm").style.display = "flex";
});

// Submit button pressed for new channel form
document.getElementById("newChannelSubmit").addEventListener("click", (event) => {
	channel.createChannel(TOKEN);
	document.getElementById("channelCreateForm").style.display = "none";
	channel.updateChannelListShow(TOKEN, USERID);
});

// Close button pressed for new channel form
document.getElementById("newChannelClose").addEventListener("click", (event) => {
	document.getElementById("channelCreateForm").style.display = "none";
});

// Show popup form for edit channel
document.getElementById("editChannelButton").addEventListener("click", (event) => {
	if(channel.getCurrentChannelId()) {
		document.getElementById("formEditTitle").textContent = "Edit new channel";
		document.getElementById("channelEditForm").style.display = "flex";
	}
})

// Submit button pressed for edit channel form
document.getElementById("editChannelSubmit").addEventListener("click", (event) => {
	channel.editChannel(TOKEN);
	channel.updateChannelListShow(TOKEN, USERID);
	channel.updateChannelInfoScreen(TOKEN, channel.getCurrentChannelId());
	document.getElementById("channelEditForm").style.display = "none";
});

// Close button pressed for edit channel form
document.getElementById("editChannelClose").addEventListener("click", (event) => {
	document.getElementById("channelEditForm").style.display = "none";
});

// Join button pressed from join popup
document.getElementById("joinJoinButton").addEventListener("click", (event) => {
	channel.joinChannel(TOKEN, channel.getCurrentChannelId());
	document.getElementById("joinPopup").style.display = "none";
});

// Close button pressed from join popup
document.getElementById("joinCloseButton").addEventListener("click", (event) => {
	document.getElementById("joinPopup").style.display = "none";
});

// Leave Channel button pressed
document.getElementById("leaveChannelButton").addEventListener("click", (event) => {
	channel.leaveChannel(TOKEN);
	channel.defaultChannelPage();
});

// Close Leave Channel Popup
document.getElementById("leftChannelClose").addEventListener("click", (event) => {
	document.getElementById("leftPopup").style.display = "none";
});

// While scrolling, if you reach the top
document.getElementById("messageText").addEventListener("scroll", (event) => {
	event.stopPropagation();
    if (document.getElementById("messageText").scrollTop === 0 && channel.getMESSAGECOUNT() !== 0) {
		// Add new batch of messages
		console.log("hitting top");
		channel.updateMessages(TOKEN, channel.getCurrentChannelId());
	}
});

// Send message from textbox
document.getElementById("messageSend").addEventListener("click", (event) => {
	event.stopPropagation();
	channel.sendMessages(TOKEN, channel.getCurrentChannelId());
	document.getElementById("messageBox").value = '';
})

// Reactions are given the call to store in backend
document.querySelectorAll('.EMJ').forEach((btn) => {
	btn.oncontextmenu = function(event) {
		event.preventDefault();
	}
	
	btn.addEventListener("click", (event) => {
		channel.addReact(btn.value, TOKEN);
		channel.loadMessages(TOKEN, channel.getCurrentChannelId());
	})
	btn.addEventListener("auxclick", (event) => {
		event.preventDefault();
		channel.unReact(btn.value, TOKEN);
		channel.loadMessages(TOKEN, channel.getCurrentChannelId());
	})
})

// Open pin messages
document.getElementById("give").addEventListener("click", (event) => {
	event.preventDefault();
	console.log("open pin msgs");
})
