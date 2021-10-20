export function channelCreate() {
    fetch('http://localhost:5005/channel').then((response) => {
		if(response.status === 400) {
			document.getElementById("errorMsg").textContent = "Invalid input";
			document.getElementById("errorPopup").style.display = "flex";
		} else if(response.status === 200) {
			response.value
		}
	});
}