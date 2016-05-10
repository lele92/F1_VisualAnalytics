const WINDOW_DIM = getWindowDim();
const WIDTH = 2500;
//const HEIGHT = WINDOW_DIM.height;
const HEIGHT = 1500;
const SCALES = {};
const DRIVERS_X = 250;
const GPS_Y = 20;
const INSETS = {
	'top': 75,
	'right': 0,
	'bottom': 50,
	'left': 50
}
const CIRCLE_RADIUS = 15;

var races = [];
var drivers = [];

window.onload = function() {
	//todo: per adesso non vengono usate le API e quindi non ci sono chiamate ajax
	// carica i dati
	d3.json("./data/F1_MockData.json", function(data) {
		races = convertRoundToInt(data.races);
		drivers = data.drivers;
		buildViz();
	})
}

function buildViz() {
	confScales(drivers,races);

	var viz = d3.select("#chart")
		.append("svg")
		.attr('width',WIDTH)
		.attr('height',HEIGHT);

	addTickLines(viz);
	addGPLabels(viz);
	addDriversLabels(viz);
	addDriverResultsPolylines(viz);
	for (i in drivers) {
		addPositionCircles(viz,drivers[i].driverId,drivers[i].position,drivers[i].results);
	}

}

function addPositionCircles(viz,driverId,driverFinalPosition,res) {
	viz.selectAll("g.position."+driverId)
		.data(res)
		.enter()
		.append("g")
		.attr('class','position '+driverId);

	viz.selectAll("g.position."+driverId)
		.append("circle")
		.attr('class','position-circle')
		.attr('cx', function(d) {
			return SCALES.xGPs(parseInt(d.round))
		})
		.attr('cy', function(d) {
			return SCALES.y(d.Results[0].position)
		})
		.attr('r', CIRCLE_RADIUS)
		.style("fill", function(d) {
			return SCALES.colors(parseInt(driverFinalPosition));
		});

	viz.selectAll("g.position."+driverId)
		.append('text')
		.attr('class','position-text')
		.attr('x',function(d) {
			return SCALES.xGPs(parseInt(d.round))
		})
		.attr('y', function(d) {
			return SCALES.y(d.Results[0].position)
		})
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
		.text(function(d) {
			return d.Results[0].position;
		})
}

function addDriverResultsPolylines(viz) {
	viz.selectAll('polyline.results')
		.data(drivers)
		.enter()
		.append('polyline')
		.attr('class', 'results')
		.attr('points', function(d) {
			var pts = []

			if (d.results) {
				pts[0] = DRIVERS_X-75 + ',' + SCALES.y(parseInt(d.position));
				pts[1] = DRIVERS_X+50 + ',' + SCALES.y(parseInt(d.position));
				for (var i=0; i< d.results.length; i++) {
					//console.log("round: "+ d.results[i].round + " - position: " + d.results[i].Results[0].position);
					pts[i+1] = SCALES.xGPs(d.results[i].round) + ',' + SCALES.y(d.results[i].Results[0].position);
				}
			}
			return pts.join(' ');
		})
		.style('stroke', function(d,i) {
			return SCALES.colors(parseInt(d.position));
		})
}

function addTickLines(viz) {
	viz.selectAll('line.tickline')
		.data(races)
		.enter()
		.append('line')
		.attr('class','tickline')
		.attr('x1', function(d) {
			return SCALES.xGPs(d.round);
		})
		.attr('y1', function(d) {
			return 0;
		})
		.attr('x2', function(d) {
			return SCALES.xGPs(d.round);
		})
		.attr('y2', function(d) {
			return HEIGHT;
		})
}

function addGPLabels(viz) {
	viz.selectAll("text.gp")
		.data(races)
		.enter()
		.append('text')
		.attr('class','gp')
		.attr('x',function(d) {
			return SCALES.xGPs(d.round);
		})
		.attr('y', GPS_Y)
		.attr('text-anchor', 'start')
		.text(function(d) {
			return d.Circuit.Location.country;
		})
}

function addDriversLabels(viz) {
	viz.selectAll("text.driver")
		.data(drivers)
		.enter()
		.append('text')
		.attr('class','driver')
		.attr('x', INSETS.left)
		.attr('y', function(data) {
			return SCALES.y(parseInt(data.position));
		})
		.text(function(data) {
			return data.name;
		})
		.style('fill', function(d){
			return SCALES.colors(parseInt(d.position))
		})
}

function confScales() {
	SCALES.xGPs = d3.scale.linear()
		.domain([1,19+1])//todo: da cambiare: il range del dominio deve essere [round minimo, round massimo]
		.range([DRIVERS_X,WIDTH - INSETS.right]);

	SCALES.y = d3.scale.linear()
		//todo: aggiungere limite superiore del dominio
		.domain([1, 21]) //il dominio parte da 1 e non da 0 così possiamo utilizzare direttamente le posizioni della classifica finale (che partono da 1 ovviamente)
		.range([INSETS.top, HEIGHT - INSETS.bottom]); //todo: da migliorare

	SCALES.colors = d3.scale.category20();
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

function convertRoundToInt(races) {
	for (var i=0; i<races.length; i++) {
		races[i].round = parseInt(races[i].round);
	}
	return races;
}