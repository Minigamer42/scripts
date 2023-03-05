'use strict';

function checkIE() {
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE ");

	if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
	{
		return true;
	}
	else
	{
		return false;
	}
}

function checkEdge() {
	if (/Edge\/\d./i.test(navigator.userAgent)) {
		// This is Microsoft Edge
		return true;
	} else {
		return false;
	}
}

$(document).ready(() => {
	if (checkIE()) {
		swal({
			title:"Unsupported Browser Detected",
			text: "Due to features in Anime Music Quiz it doesn't support Internet Explore. Using Internet Explore will cause part of the game to not function as intended, and it is suggested that you use another browser. We recommend Firefox or Chrome"
		});
	} else if (checkEdge()) {
		swal({
			title: "Unsupported Browser Detected",
			text: "Due to features in Anime Music Quiz it doesn't support Microsoft Edge. Using Microsoft Edge will cause part of the game to not function as intended, and it is suggested that you use another browser. We recommend Mozilla Firefox or Google Chrome"
		});
	}
});