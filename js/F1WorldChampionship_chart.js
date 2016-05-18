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

const GP_SHAPE_WIDTH = 100;
const GP_SHAPE_HEIGHT = 30;

const CIRCLES = {
	'radius': {
		"plain": 15,
		'highlighted':20,
		'dimmed': 10
	}
};

const PATH_STROKE = {
	'plain': 10,
	'highlighted': 20,
	'dimmed': 3
};

const HIGHLIGHT_STATUS_CLASSES = {
	'plain': 'plain-elem',
	'highlighted': 	'highlighted-elem',
	'dimmed': 'dimmed-elem'
};

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
		.attr('height',HEIGHT)

	addTickLines(viz);
	addGPLabels(viz);
	addDriversElements(viz);
	addDriverResultsPath(viz);
	for (var i in drivers) {
		addPositionElements(viz,drivers[i].driverId,drivers[i].position,drivers[i].results);
	}

}

function addPositionElements(viz, driverId, driverFinalPosition, res) {
	viz.selectAll("g.position."+driverId+"."+HIGHLIGHT_STATUS_CLASSES.plain)
		.data(res)
		.enter()
		.append("g")
		.attr('class','position '+driverId+" "+HIGHLIGHT_STATUS_CLASSES.plain)
		.attr('transform',function(d) {
				return "translate("+SCALES.xGPs(parseInt(d.round))+","+SCALES.y(d.Results[0].position)+")";
		});

	viz.selectAll("g.position."+driverId)
		.append("circle")
		.filter(function(d) {
			return true; //todo: cerchio se posizione in classifica parziale invariata
		})
		.attr('class','position-circle')
		.attr('r', CIRCLES.radius.plain)
		.style("fill", function(d) {
			return SCALES.colors(parseInt(driverFinalPosition));
		});

	viz.selectAll("g.position."+driverId)
		.append("path")
		.filter(function(d) {
			return false; //todo: triangle-up se posizione in classifica parziale migliorata
		})
		.attr("d", d3.svg.symbol().type("triangle-up").size(function() {
				return Math.pow(CIRCLES.radius.plain*2,2);
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
				return Math.pow(CIRCLES.radius.plain*2,2);
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

	viz.selectAll("g.position."+driverId+" > .position-circle ,g.position."+driverId+" > .position-triangle-up ,g.position."+driverId+" > .position-triangle-down")
		.attr("stroke", function(d) {
			//todo: da reimplementare con uno switch
			if (d.Results[0].status != "Finished") {
				return "red";
			}
		});
}

function addDriverResultsPath(viz) {
	viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.plain)
		.data(drivers)
		.enter()
		.append('path')
		.attr('class', 'results '+HIGHLIGHT_STATUS_CLASSES.plain)
		.attr('fill','none')
		.attr('stroke-width', PATH_STROKE.plain)
		.attr('d', function(d) {
			var pts = []

			if (d.results) {
				pts[0] = "M"+(DRIVERS_X-125)+ ' ' +(SCALES.y(parseInt(d.position)));
				pts[1] = "L"+(DRIVERS_X-75) + ' ' + (SCALES.y(parseInt(d.position)));
				for (var i=0; i< d.results.length; i++) {
					//console.log("round: "+ d.results[i].round + " - position: " + d.results[i].Results[0].position);
					pts[i+2] = "S"+ (SCALES.xGPs(d.results[i].round)-65) + ' ' + (SCALES.y(d.results[i].Results[0].position)) + ", " +SCALES.xGPs(d.results[i].round) + ' ' + SCALES.y(d.results[i].Results[0].position);
				}
			}
			return pts.join(' ');
		})
		.style('stroke', function(d,i) {
			return SCALES.colors(parseInt(d.position));
		})
		.append("title")
		.text(function(d) { 
			return d.name; 
		})
}

function addTickLines(viz) {
	viz.selectAll('line.tickline')
		.data(races)
		.enter()
		.append('line')
		.attr('class','tickline')
		.style('stroke-width', CIRCLES.radius.plain*2)
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
	viz.selectAll("g.driver-element."+HIGHLIGHT_STATUS_CLASSES.plain)
		.data(drivers)
		.enter()
		.append("g")
		.attr("transform",function(data) {
			return "translate("+INSETS.left+","+SCALES.y(parseInt(data.position))+")"
		})
		.attr('class','driver-element '+HIGHLIGHT_STATUS_CLASSES.plain)
		.on('click', function(d) {
			//todo: si può implementare meglio
			var selectedElem = d3.select(this);
			if(selectedElem.classed(HIGHLIGHT_STATUS_CLASSES.plain) || selectedElem.classed(HIGHLIGHT_STATUS_CLASSES.dimmed)) {
				highlight(viz, d.driverId, selectedElem)
			} else {
				unhighlight(viz, d.driverId, selectedElem)
			}

		});

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

//todo: sicuramente ci sono modi più efficienti di farlo, ma avendo a che fare con pochi elementi (circa 20 piloti, 20 gp, etc...) usare dei cicli e fare diversi selectAll non è un grosso problema e non si perde molto
function highlight(viz, dId, selectedElem) {
	//todo: da rivedere e migliorare


	//assegna le classi in base alla selezione
	viz.selectAll('path.results, g.position, g.driver-element')
		.classed(HIGHLIGHT_STATUS_CLASSES.plain, false)                 // rimuove la classe plain a tutti
		.classed(HIGHLIGHT_STATUS_CLASSES.dimmed, function(d) {         // dimmed se non è il driver selezionato E non è uno dei driver precedentemente selezionati
			return !matchingDriverId(d,dId) && !d3.select(this).classed(HIGHLIGHT_STATUS_CLASSES.highlighted)
		})
		.classed(HIGHLIGHT_STATUS_CLASSES.highlighted, function(d) {    // highlighted se è il driver selezionato O è uno dei driver precedentemente selezionati
			return matchingDriverId(d,dId) || d3.select(this).classed(HIGHLIGHT_STATUS_CLASSES.highlighted)
		});

	//diminuisce lo stroke dei path dei piloti dimmed
	viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.dimmed)
		.attr('stroke-width', PATH_STROKE.dimmed);

	//aumenta lo stroke dei piloti highlighted
	viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.highlighted)
		.attr('stroke-width', PATH_STROKE.highlighted);

	//diminuisce il raggio dei position dei piloti dimmed
	viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.dimmed+' circle.position-circle')
		.attr('r', CIRCLES.radius.dimmed);

	//aumenta il raggio dei position dei piloti highlighted
	viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+' circle.position-circle')
		.attr('r', CIRCLES.radius.highlighted);
}

function unhighlight(viz, dId, selectedElem) {
	var lastOneSelected = viz.selectAll('g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted)[0].length == 1 //se c'è almeno un altro pilota selezionato

	if (!lastOneSelected) {
		//assegna le classi in base alla selezione
		viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.highlighted+', g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+', g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted)
			.classed(HIGHLIGHT_STATUS_CLASSES.dimmed, function(d) {         // dimmed se è il driver selezionato
				return matchingDriverId(d,dId)
			})
			.classed(HIGHLIGHT_STATUS_CLASSES.highlighted, function(d) {    // highlighted se non è il driver selezionato
				return !matchingDriverId(d,dId)
			});

		//diminuisce lo stroke dei path dei piloti dimmed
		viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.dimmed)
			.attr('stroke-width', PATH_STROKE.dimmed);

		//diminuisce il raggio dei position dei piloti dimmed
		viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.dimmed+' circle.position-circle')
			.attr('r', CIRCLES.radius.dimmed);
	} else {
		unhighlightAll(viz)
	}
}

function unhighlightAll(viz) {
	viz.selectAll('path.results, g.position, g.driver-element')     //li prendo tutti per ripristinare lo stato iniziale
		.classed(HIGHLIGHT_STATUS_CLASSES.highlighted, false)
		.classed(HIGHLIGHT_STATUS_CLASSES.dimmed, false)
		.classed(HIGHLIGHT_STATUS_CLASSES.plain, true);


	//ripristina gli stroke di tutti i path
	viz.selectAll('path.results')
		.attr('stroke-width', PATH_STROKE.plain);

	//diminuisce il raggio dei position dei piloti dimmed
	viz.selectAll('g.position circle.position-circle')
		.attr('r', CIRCLES.radius.plain);
}