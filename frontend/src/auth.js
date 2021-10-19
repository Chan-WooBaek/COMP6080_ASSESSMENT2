// Reveal register form
export function showRegisterForm() {
    document.getElementById("register").style.display = "block";
};
	


// Login form submit button is clicked
export function submitLoginForm() {
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
}


// Register submit button is clicked
export function submitRegisterForm() {
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
}

// Error popup close button is clicked
export function closeErrorPopup() {
	document.getElementById("errorPopup").style.display = "none";
}


