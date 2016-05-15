const WINDOW_DIM = getWindowDim();
const WIDTH = 2700;
//const HEIGHT = WINDOW_DIM.height;
const HEIGHT = 1500;
const SCALES = {};
const DRIVERS_X = 300;
const GPS_Y = 20;
const INSETS = {
	'top': 75,
	'right': 0,
	'bottom': 50,
	'left': 50
}

const CIRCLE_RADIUS = 15;
const GP_SHAPE_WIDTH = 100;
const GP_SHAPE_HEIGHT = 30;

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
	confScales();

	var viz = d3.select("#chart")
		.append("svg")
		.attr('width',WIDTH)
		.attr('height',HEIGHT);

	addTickLines(viz);
	addGPLabels(viz);
	addDriversElements(viz);
	addDriverResultsPolylines(viz);
	for (var i in drivers) {
		addPositionElements(viz,drivers[i].driverId,drivers[i].position,drivers[i].results);
	}

}

function addPositionElements(viz, driverId, driverFinalPosition, res) {
	viz.selectAll("g.position."+driverId)
		.data(res)
		.enter()
		.append("g")
		.attr('class','position '+driverId)
		.attr('transform',function(d) {
				return "translate("+SCALES.xGPs(parseInt(d.round))+","+SCALES.y(d.Results[0].position)+")";
			});

	viz.selectAll("g.position."+driverId)
		.append("circle")
		.filter(function(d) {
			return true; //todo: cerchio se posizione in classifica parziale invariata
		})
		.attr('class','position-circle')
		.attr('r', CIRCLE_RADIUS)
		.style("fill", function(d) {
			return SCALES.colors(parseInt(driverFinalPosition));
		});

	viz.selectAll("g.position."+driverId)
		.append("path")
		.filter(function(d) {
			return false; //todo: triangle-up se posizione in classifica parziale migliorata
		})
		.attr("d", d3.svg.symbol().type("triangle-up").size(function() {
				return Math.pow(CIRCLE_RADIUS*2,2);
			})
		)
		.attr('class','position-triangle-up')
		.style("fill", function(d) {
			return SCALES.colors(parseInt(driverFinalPosition));
		});

	viz.selectAll("g.position."+driverId)
		.append("path")
		.filter(function(d) {
			return false; //todo: triangle-down se posizione in classifica parziale peggiorata
		})
		.attr("d", d3.svg.symbol().type("triangle-down").size(function() {
				return Math.pow(CIRCLE_RADIUS*2,2);
			})
		)
		.attr('class','position-triangle-down')
		.style("fill", function(d) {
			return SCALES.colors(parseInt(driverFinalPosition));
		});

	viz.selectAll("g.position."+driverId)
		.append('text')
		.attr('class','position-text')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
		.text(function(d) {
			return d.Results[0].position;
		})

	viz.selectAll("g.position."+driverId+" > .position-circle","g.position."+driverId+" > .position-triangle-up","g.position."+driverId+" > .position-triangle-down")
		.attr("stroke", function(d) {
			//todo: da reimplementare con uno switch
			if (d.Results[0].status != "Finished") {
				return "red";
			} else {
				return SCALES.colors(parseInt(driverFinalPosition));
			};
		})
		.attr("stroke-width", function(d) {
			//todo: da reimplementare con uno switch
			if (d.Results[0].status != "Finished") {
				return 5;
			} else {
				return 0;
			};
		});
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
				pts[0] = DRIVERS_X-125 + ',' + SCALES.y(parseInt(d.position));
				pts[1] = DRIVERS_X-75 + ',' + SCALES.y(parseInt(d.position));
				for (var i=0; i< d.results.length; i++) {
					//console.log("round: "+ d.results[i].round + " - position: " + d.results[i].Results[0].position);
					pts[i+2] = SCALES.xGPs(d.results[i].round) + ',' + SCALES.y(d.results[i].Results[0].position);
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
	viz.selectAll("g.gp-element")
		.data(races)
		.enter()
		.append('g')
		.attr('class','gp-element')
		.attr('transform',function(d) {
			return "translate("+SCALES.xGPs(d.round)+","+GPS_Y+")";
		});

	viz.selectAll("g.gp-element")
		.data(races)
		.append('rect')
		.attr('class','gp-rect')
		.attr('transform',"translate("+(-GP_SHAPE_WIDTH/2)+","+(-GPS_Y)+")")
		.attr('height',GP_SHAPE_HEIGHT)
		.attr('width',GP_SHAPE_WIDTH)
		.text(function(d) {
			return d.Circuit.Location.country;
		})

	viz.selectAll("g.gp-element")
		.data(races)
		.append('text')
		.attr('class','gp-label')
		.attr('text-anchor', 'middle')
		.text(function(d) {
			return d.Circuit.Location.country;
		})
}

function addDriversElements(viz) {
	viz.selectAll("g.driver-element")
		.data(drivers)
		.enter()
		.append("g")
		.attr("transform",function(data) {
			return "translate("+INSETS.left+","+SCALES.y(parseInt(data.position))+")"
		})
		.attr('class','driver-element');

	viz.selectAll("g.driver-element")
		.data(drivers)
		.append('text')
		.attr('class','driver-label')
		.text(function(data) {
			return data.familyName;
		})
		.style('fill', function(d){
			return SCALES.colors(parseInt(d.position))
		});

	//viz.selectAll("g.driver-element")
	//	.data(drivers)
	//	.append('rect')
}

function confScales() {
	SCALES.xGPs = d3.scale.linear()
		.domain([1,19+1])//todo: da cambiare: il range del dominio deve essere [round minimo, round massimo]
		.range([DRIVERS_X,WIDTH - INSETS.right]);

	SCALES.y = d3.scale.linear()
		//todo: aggiungere limite superiore del dominio
		.domain([1, 21]) //il dominio parte da 1 e non da 0 cos� possiamo utilizzare direttamente le posizioni della classifica finale (che partono da 1 ovviamente)
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