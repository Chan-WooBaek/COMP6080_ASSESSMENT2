import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import * as auth from './auth.js';

console.log('Let\'s go!');

// LoginForm register button is pressed
document.getElementById("loginRegister").addEventListener("click", (event) => {
	auth.showRegisterForm();
});

// LoginForm submit button is pressed
document.getElementById("loginSubmit").addEventListener("click", (event) => {
	auth.submitLoginForm();
});

// RegisterForm submit button is pressed
document.getElementById("registerSubmit").addEventListener("click", (event) => {
	auth.submitRegisterForm();
});

// Close error popup
document.getElementById("errorClose").addEventListener("click", (event) => {
	auth.closeErrorPopup();
});