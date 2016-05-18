function convertRoundToInt(races) {
	for (var i=0; i<races.length; i++) {
		races[i].round = parseInt(races[i].round);
	}
	return races;
}

function getWindowDim() {
	var w = 630;
	var h = 460;
	if (document.body && document.body.offsetWidth) {

		w = document.body.offsetWidth;
		h = document.body.offsetHeight;
	}

	if (document.compatMode == 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {

		w = document.documentElement.offsetWidth;
		h = document.documentElement.offsetHeight;
	}

	if (window.innerWidth && window.innerHeight) {

		w = window.innerWidth;
		h = window.innerHeight;
	}

	return {'width': w, 'height': h};
}

function matchingDriverId(d, dId) {
	//per driver labels e paths
	if (d.driverId) {
		return d.driverId == dId
	}

	// per position circles
	if (d.Results[0].Driver.driverId) {
		return d.Results[0].Driver.driverId == dId
	}
}