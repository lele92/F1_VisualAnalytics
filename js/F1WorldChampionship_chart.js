const WINDOW_DIM = getWindowDim();
const WIDTH = 2500;
//const HEIGHT = WINDOW_DIM.height;
const HEIGHT = 900;
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
		'plain': 0,
		'highlighted':12,
		'dimmed': 0,
		'mouseover': 16
	},
	'stroke': {
		'plain': 0,
		'withStatus': 4
	}
};

const TRIANGLES = {
	'area': 600
}

const PATH_STROKE = {
	'plain': 8,
	'highlighted': 12,
	'dimmed': 2
};

const HIGHLIGHT_STATUS_CLASSES = {
	'plain': 'plain-elem',
	'highlighted': 	'highlighted-elem',
	'dimmed': 'dimmed-elem'
};

var races = [];
var drivers = [];
var standings = [];

window.onload = function() {
	// carica i dati
	d3.json("./data/F1_MockData.json", function(data) {
		races = convertRoundToInt(data.races);
		drivers = data.drivers;
		standings = data.standings;
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
		addPositionElements(viz,drivers[i].driverId,drivers[i].position,drivers[i].Results, standings);
	}

}

function addPositionElements(viz, driverId, driverFinalPosition, res, standings) {
	viz.selectAll("g.position."+driverId+"."+HIGHLIGHT_STATUS_CLASSES.plain)
		.data(res)
		.enter()
		.append("g")
		.attr('class','hidden position '+driverId+" "+HIGHLIGHT_STATUS_CLASSES.plain)
		.attr('transform',function(d) {
				return "translate("+SCALES.xGPs(parseInt(d.round))+","+SCALES.y(parseInt(d.RoundResult.position))+")";
		})
		.on('mouseover', function(d) {
			d3.select($(this).children('circle.position-circle').get(0)).attr('r', CIRCLES.radius.mouseover)        //un bel magheggio, converto prima i noggetto jquery per prendermi i figli, poi in semplice oggetto dom da passare alla select... jquery magic
			d3.select($(this).children('path.position-triangle-up').get(0)).attr("d", d3.svg.symbol().type("triangle-up").size(function() {
					return TRIANGLES.area*2;
				})
			)
			d3.select($(this).children('path.position-triangle-down').get(0)).attr("d", d3.svg.symbol().type("triangle-down").size(function() {
					return TRIANGLES.area*2;
				})
			)
		})
		.on('mouseout', function(d) {
			d3.select($(this).children('circle.position-circle').get(0)).attr('r', CIRCLES.radius.highlighted)
			d3.select($(this).children('path.position-triangle-up').get(0)).attr("d", d3.svg.symbol().type("triangle-up").size(function() {
					return TRIANGLES.area;
				})
			)
			d3.select($(this).children('path.position-triangle-down').get(0)).attr("d", d3.svg.symbol().type("triangle-down").size(function() {
					return TRIANGLES.area;
				})
			)
		});

	viz.selectAll("g.position."+driverId)
		.append("circle")
		.filter(function(d) {
			if (parseInt(d.round)==1) return true;//se è la prima gara ovviamente non ci sono variazioni
			var curPos = parseInt(getStandingsPosition(parseInt(d.round)-1, standings, d.RoundResult.Driver.driverId))    //-1 perchè round parte da 1 e non da 0
			var prevPos = parseInt(getStandingsPosition(parseInt(d.round)-2, standings, d.RoundResult.Driver.driverId))
			// console.log("----------"+curPos+"   "+prevPos)
			if (curPos == -1 || prevPos == -1) return true;     // se una delle due posizioni non è definita, non c'è confronto

			if (curPos == prevPos) {
				return true;
			} else {
				return false;
			}
		})
		.attr('class','position-circle')
		.attr('r', CIRCLES.radius.plain)
		.attr('stroke-width', CIRCLES.stroke.plain)
		.style("fill", function(d) {
			return d3.rgb(SCALES.colors(parseInt(driverFinalPosition))).darker();
		})

	viz.selectAll("g.position."+driverId)
		.append("path")
		.filter(function(d) {
			if (parseInt(d.round)==1) return false;
			var curPos = parseInt(getStandingsPosition(parseInt(d.round)-1, standings, d.RoundResult.Driver.driverId))    //-1 perchè round parte da 1 e non da 0
			var prevPos = parseInt(getStandingsPosition(parseInt(d.round)-2, standings, d.RoundResult.Driver.driverId))

			if (curPos == -1 || prevPos == -1) return false;

			if (curPos < prevPos) {
				return true;
			} else {
				return false;
			}
		})
		.attr("d", d3.svg.symbol().type("triangle-up").size(function() {
				return TRIANGLES.area;
			})
		)
		.attr('class','position-triangle-up')
		.style("fill", function(d) {
			return d3.rgb(SCALES.colors(parseInt(driverFinalPosition))).darker();
		})
		.attr('transform',"translate(0,-5)");   //todo: fix provvisorio

	viz.selectAll("g.position."+driverId)
		.append("path")
		.filter(function(d) {
			if (parseInt(d.round)==1) return false;
			var curPos = parseInt(getStandingsPosition(parseInt(d.round)-1, standings, d.RoundResult.Driver.driverId))    //-1 perchè round parte da 1 e non da 0
			var prevPos = parseInt(getStandingsPosition(parseInt(d.round)-2, standings, d.RoundResult.Driver.driverId))

			if (curPos == -1 || prevPos == -1) return false;

			if (curPos > prevPos) {
				return true;
			} else {
				return false;
			}
		})
		.attr("d", d3.svg.symbol().type("triangle-down").size(function() {
				return TRIANGLES.area;
			})
		)
		.attr('class','position-triangle-down')
		.style("fill", function(d) {
			return d3.rgb(SCALES.colors(parseInt(driverFinalPosition))).darker();
		})
		.attr('transform',"translate(0,5)");   //todo: fix provvisorio

	viz.selectAll("g.position."+driverId)
		.append('text')
		.attr('class','position-text')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
		.text(function(d) {
			return d.RoundResult.position;
		});


	viz.selectAll("g.position."+driverId+" > .position-circle ,g.position."+driverId+" > .position-triangle-up ,g.position."+driverId+" > .position-triangle-down")
		.filter(function(d) {
			return d.RoundResult.status != "Finished";
		})
		.attr("stroke", function(d) {
				return "red";
		})
		.attr("stroke-width", function(d) {
				return CIRCLES.stroke.withStatus;
		})
		// .attr("stroke-dasharray","5,2");

}

function addDriverResultsPath(viz) {
	viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.plain)
		.data(drivers)
		.enter()
		.append('path')
		.attr('class', 'results '+HIGHLIGHT_STATUS_CLASSES.plain)
		.attr('fill','none')
		.attr('stroke-width', PATH_STROKE.plain)
		.attr('stroke-linecap', 'round')
		.attr('d', function(d) {
			var pts = []

			if (d.Results) {
				pts[0] = "M"+(DRIVERS_X-125)+ ' ' +(SCALES.y(parseInt(d.position)));
				pts[1] = "L"+(DRIVERS_X-75) + ' ' + (SCALES.y(parseInt(d.position))); //todo: aggiungere curva bezier
				for (var i=0; i< d.Results.length; i++) {
					// console.log("round: "+ d.Results[i].round + " - position: " + d.Results[i].RoundResult.position);
					pts[i+2] = "S"+ (SCALES.xGPs(parseInt(d.Results[i].round))-65) + ' ' + (SCALES.y(parseInt(d.Results[i].RoundResult.position))) + ", " +SCALES.xGPs(parseInt(d.Results[i].round)) + ' ' + SCALES.y(parseInt(d.Results[i].RoundResult.position));
				}
			}
			return pts.join(' ');
		})
		.on('click', function(d) {
			//todo: si può implementare meglio
			var selectedElem = d3.select(this);
			if(selectedElem.classed(HIGHLIGHT_STATUS_CLASSES.plain) || selectedElem.classed(HIGHLIGHT_STATUS_CLASSES.dimmed)) {
				highlight(viz, d.driverId, selectedElem);
			} else {
				unhighlight(viz, d.driverId, selectedElem);
			}
		})
		.style('stroke', function(d,i) {
			return SCALES.colors(parseInt(d.position));
		})
		// .on('mouseover', function(d) {
		// 	if (!fixedHighlight.indexOf(d.driverId) > -1) {
		// 		var selectedElem = d3.select(this);
		// 		highlight(viz, d.driverId, selectedElem);
		// 	}
		// })
		// .on('mouseout', function(d) {
		// 	if (!fixedHighlight.indexOf(d.driverId) > -1) {
		// 		var selectedElem = d3.select(this);
		// 		unhighlight(viz, d.driverId, selectedElem);
		// 	}
		//
		// })
		.append("title")
		.text(function(d) { 
			return d.familyName;
		})
}

function addTickLines(viz) {
	viz.selectAll('line.tickline')
		.data(races)
		.enter()
		.append('line')
		.attr('class','tickline')
		.style('stroke-width', CIRCLES.radius.highlighted*2)
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
				highlight(viz, d.driverId, selectedElem);
			} else {
				unhighlight(viz, d.driverId, selectedElem);
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
		.domain([1, 21]) //il dominio parte da 1 e non da 0 così possiamo utilizzare direttamente le posizioni della classifica finale (che partono da 1 ovviamente)
		.range([INSETS.top, HEIGHT - INSETS.bottom]); //todo: da migliorare

	SCALES.colors = d3.scale.linear().domain([1,(drivers.length-1)/2,drivers.length-1]).range(['#009933','#FFFFFF', '#ff3333']).interpolate(d3.interpolateRgb);
}

//todo: sicuramente ci sono modi più efficienti di farlo, ma avendo a che fare con pochi elementi (circa 20 piloti, 20 gp, etc...) usare dei cicli e fare diversi selectAll non è un grosso problema e non si perde molto
function highlight(viz, dId, selectedElem) {
	//todo: da rivedere e migliorare


	//assegna le classi in base alla selezione
	viz.selectAll('path.results, g.position, g.driver-element, .position-text')
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

	//mostra le posizioni
	viz.selectAll('g.position')
		.classed('hidden', function(d) {    // testo del position visibile se il driver è selezionato O è uno dei driver precedentemente selezionati
			return !d3.select(this).classed(HIGHLIGHT_STATUS_CLASSES.highlighted)   //hidden è da togliere se il pilota è selezionato
		});
}

function unhighlight(viz, dId, selectedElem) {
	var lastOneSelected = viz.selectAll('g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted)[0].length == 1 //se c'è almeno un altro pilota selezionato

	if (!lastOneSelected) {
		//assegna le classi in base alla selezione
		viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.highlighted+', g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+', g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted+', .position-text.'+HIGHLIGHT_STATUS_CLASSES.highlighted)
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

		//nasconde i position
		viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.dimmed)
			.classed('hidden', true);


	} else {
		unhighlightAll(viz)
	}
}

function unhighlightAll(viz) {
	viz.selectAll('path.results, g.position, g.driver-element, .position-text')     //li prendo tutti per ripristinare lo stato iniziale
		.classed(HIGHLIGHT_STATUS_CLASSES.highlighted, false)
		.classed(HIGHLIGHT_STATUS_CLASSES.dimmed, false)
		.classed(HIGHLIGHT_STATUS_CLASSES.plain, true);


	//ripristina gli stroke di tutti i path
	viz.selectAll('path.results')
		.attr('stroke-width', PATH_STROKE.plain);

	//diminuisce il raggio dei position dei piloti
	viz.selectAll('g.position circle.position-circle')
		.attr('r', CIRCLES.radius.plain);

	//nasconde i position
	viz.selectAll('g.position')
		.classed('hidden', true);
}