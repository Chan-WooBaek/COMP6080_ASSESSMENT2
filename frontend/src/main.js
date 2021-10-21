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
		document.getElementById("notLoggedIn").style.display = "none";
		document.getElementById("loggedIn").style.display = "grid";
		channel.updateChannelShow(TOKEN);
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
	auth.closeErrorPopup();
});

// Show popup form for channel
document.getElementById("channelCreate").addEventListener("click", (event) => {
	document.getElementById("channelCreateForm").style.display = "flex";
});

// Submit button pressed for new channel form
document.getElementById("newChannelSubmit").addEventListener("click", (event) => {
	channel.createChannel(TOKEN);
});

// Close button pressed for new channel form
document.getElementById("newChannelClose").addEventListener("click", (event) => {
	document.getElementById("channelCreateForm").style.display = "none";
});

