import * as helper from './helpers.js';

// Reveal register form
export function showRegisterForm() {
    document.getElementById("register").style.display = "block";
};

// Register submit button is clicked
export function submitRegisterForm() {
	const email = document.getElementById("registerEmail").value;
	const password = document.getElementById("registerPassword").value;
	const confirmPassword = document.getElementById("registerConfirmPassword").value;
	const name = document.getElementById("registerName").value;
	const body = {
		email: email,
		password: password,
		name: name,
	}

	if (password != confirmPassword) {
		document.getElementById("popupMsg").textContent = "Passwords don't match";
		document.getElementById("popup").style.display = "flex";
		return;
	}

	helper.myFetch('POST', 'auth/register', null, body)
	.then((data) => {
		document.getElementById("popupMsg").textContent = "New user created!";
		document.getElementById("popup").style.display = "flex";
	})
	.catch((data) => {
		document.getElementById("popupMsg").textContent = data;
		document.getElementById("popup").style.display = "flex";
	})
}
