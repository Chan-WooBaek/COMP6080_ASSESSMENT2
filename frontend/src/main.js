import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

document.getElementById("loginRegister").addEventListener("click", (event) => {
	document.getElementById("register").style.display = "block";
})

document.getElementById("loginSubmit").addEventListener("click", (event) => {
	const email = document.getElementById("loginEmail").value;
	const password = document.getElementById("loginPassword").value;

	const jsonString = JSON.stringify({
		email: email,
		password: password,
	});

	const requestOption = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: jsonString,
	};

	fetch('http://localhost:5005/auth/login', requestOption).then((response) => {
		if(response.status === 400) {
			document.getElementById("errorMsg").textContent = "Invalid email or password";
			document.getElementById("errorPopup").style.display = "flex";
		} else if(response.status === 200) {
			document.getElementById("notLoggedIn").style.display = "none";
			document.getElementById("loggedIn").style.display = "grid";
		}
	});

});

document.getElementById("registerSubmit").addEventListener("click", (event) => {
	const email = document.getElementById("registerEmail").value;
	const password = document.getElementById("registerPassword").value;
	const confirmPassword = document.getElementById("registerConfirmPassword").value;
	const name = document.getElementById("registerName").value;

	if (password != confirmPassword) {
		document.getElementById("errorMsg").textContent = "Passwords don't match";
		document.getElementById("errorPopup").style.display = "flex";
		return;
	}
	const jsonString = JSON.stringify({
		email: email,
		password: password,
		name: name,
	});

	const requestOption = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: jsonString,
	};

	fetch('http://localhost:5005/auth/register', requestOption)
		.then((response) => {
			if(response.status === 400) {
				document.getElementById("errorMsg").textContent = "Invalid email or password";
				document.getElementById("errorPopup").style.display = "flex";
			}
		});
});

document.getElementById("errorClose").addEventListener("click", (event) => {
	document.getElementById("errorPopup").style.display = "none";
});