const WINDOW_DIM = getWindowDim();
const WIDTH_WINDOW = WINDOW_DIM.width;
const HEIGHT_WINDOW = WINDOW_DIM.height-60;
const WIDTH = 2300;
const HEIGHT = 1200;
const SCALES = {};
const GPS_Y = 0;
const INSETS = {
	'top': 75,
	'right': 0,
	'bottom': 50,
	'left': 20
}

const GP_SHAPE_WIDTH = 100;
const GP_SHAPE_HEIGHT = 30;

const POSITION_CIRCLES = {
	'radius': {
		'plain': 0,
		'highlighted':15,
		'dimmed': 0,
		'mouseover': 22
	},
	'stroke': {
		'plain': 0,
		'withStatus': 5
	}
};

const TRIANGLES = {
	'area': 600
}

const DRIVER_RECT = {
	'rectHeight': 30,
	'rectWidth': 130
}

const GP_PATH = {
	'rectHeight': 25,
	'rectWidth': 120,
	'delta':20
}

const PATH_STROKE = {
	'plain': 8,
	'highlighted': 12,
	'dimmed': 2
};

const HIGHLIGHT_STATUS_CLASSES = {
	'plain': 'plain-elem',
	'highlighted': 'highlighted-elem',
	'dimmed': 'dimmed-elem'
};

const DRIVERS_X = 250;

const STATUSES = {
	'accident': [
		'Accident',
		'Collision',
		'Spun off'
	],
	'failure': [
		'Engine',
		'Gearbox',
		'Transmission',
		'Electrical',
		'Spun off',
		'Suspension',
		'Brakes',
		'Tyre',
		'Retired',
		'Front wing',
		'Wheel',
		'Throttle',
		'Oil leak',
		'Withdrew',
		'Fuel system',
		'Power loss',
		'Excluded',
		'Turbo',
		'Collision damage',
		'Power Unit',
		'ERS',
		'Brake duct'
	]
}

var races = [];
var drivers = [];
var standings = [];

window.onload = function() {
	// carica i dati
	d3.json("./data/F1_data.json", function(data) {
		races = convertRoundToInt(data.races);
		drivers = data.drivers;
		standings = data.standings;
		buildViz();

        $(function () {
            $('[data-toggle="tooltip"]').tooltip({
                'container': 'body'
            })
        })
	})
}

function buildViz() {
	confScales();

	var viz = d3.select("#chart")
		.append("svg")
		.attr('width',WIDTH_WINDOW)
		.attr('height',HEIGHT_WINDOW)
		.attr('viewBox', '0 0 '+WIDTH+' '+HEIGHT)
		// .attr('preserveAspectRatio','none')

	// addTopLine(viz)
	addDriversStandingsRect(viz);
	addTickLines(viz);
	addLightTickLines(viz);
	//todo: aggiungere qui tick colorati (per +1, +2, etc..)
	addGPElements(viz);
	addDriverResultsPath(viz);
	addDriversElements(viz);
	for (var i in drivers) {
		addPositionElements(viz,drivers[i].driverId,drivers[i].position,drivers[i].Results, standings);
	}
	addDriversHeaderElements(viz);

}

function addDriversStandingsRect(viz) {
	viz.append('rect')
		.attr('id','driversStandingRect')
		.attr('height',HEIGHT-10)
		.attr('width',185)
		.attr('x','5')
		.attr('y','3')
		.attr('ry','10')
		.attr('rx','10');
}

function addTopLine(viz) {
	viz.append('line')
		.attr('id','topLine')
		.attr('x1',0)
		.attr('y1',0)
		.attr('x2',WIDTH)
		.attr('y2',0);
}

function addPositionElements(viz, driverId, driverFinalPosition, res, standings) {
	viz.selectAll("g.position."+driverId+"."+HIGHLIGHT_STATUS_CLASSES.plain)
		.data(res)
		.enter()
		.append("g")
        .attr('data-html', 'true')
        .attr('data-toggle', 'tooltip')
        .attr('data-placement', 'left')
        .attr('data-original-title', function(d) {
            var iconText = "<i class='fa fa-chevron-right'></i>"
            var driver = "<div class='center'>" + iconText + "<span class='labels'> Driver: </span><span>" + d.RoundResult.Driver.familyName + "</span></div>";
            var position = "<div class='center'>" + iconText + "<span class='labels'> Final Position: </span><span>" + d.RoundResult.position + "</span></div>";
            var status = "<div class='center'>" + iconText + "<span class='labels'> Status: </span><span>" + d.RoundResult.status + "</span></div>";
            var points = "<div class='center'>" + iconText + "<span class='labels'> Gain Point: </span><span>" + d.RoundResult.points + "</span></div>";
            var grid = "<div class='center'>" + iconText + "<span class='labels'> Start Grid Position: </span><span>" + d.RoundResult.grid + "</span></div>";
            var construct = "<div class='center'>" + iconText + "<span class='labels'> Construct: </span><span>" + d.RoundResult.Constructor.name + "</span></div>";
            //var selText = $("<div class='well' class='lbl-panel-span'>"+getSelectionText(note.target.id,note.target.start,note.target.end)+"</div>")
            //return "ciao bel"
            return driver + position + status + points + grid + construct;

            //$("#modal-pilot-header").attr("background-color", function(d) {
            //        return d3.rgb(SCALES.colors(parseInt(driverFinalPosition))).darker();
            //    }
            //);)
        })
        //.attr("title", "Hi")
        .on('click', function(d) {
            var $modal_body = $("#modal-pilot-body").empty();
            var iconText = "<i class='fa fa-chevron-right'></i>"
            var driver = $("<div class='center'>"+iconText+"<span class='labels'> Driver: </span><span>"+ d.RoundResult.Driver.familyName+"</span></div>");
            var position = $("<div class='center'>"+iconText+"<span class='labels'> Final Position: </span><span>"+ d.RoundResult.position+"</span></div>");
            var status = $("<div class='center'>"+iconText+"<span class='labels'> Status: </span><span>"+ d.RoundResult.status+"</span></div>");
            var points = $("<div class='center'>"+iconText+"<span class='labels'> Gain Point: </span><span>"+ d.RoundResult.points+"</span></div>");
            var grid = $("<div class='center'>"+iconText+"<span class='labels'> Start Grid Position: </span><span>"+d.RoundResult.grid+"</span></div>");
            var construct = $("<div class='center'>"+iconText+"<span class='labels'> Construct: </span><span>"+d.RoundResult.Constructor.name+"</span></div>");
            //var selText = $("<div class='well' class='lbl-panel-span'>"+getSelectionText(note.target.id,note.target.start,note.target.end)+"</div>")
            content = driver + position + status + points + grid + construct
            $modal_body.append(driver);
            $modal_body.append(position);
            $modal_body.append(status);
            $modal_body.append(points);
            $modal_body.append(grid);
            $modal_body.append(construct);
            d3.select("#modal-pilot-header")
                .style("background-color", function(d) {
                    return d3.rgb(SCALES.colorsHighlight(parseInt(driverFinalPosition)));
                });
            //$("#modal-pilot-header").attr("background-color", function(d) {
            //        return d3.rgb(SCALES.colors(parseInt(driverFinalPosition))).darker();
            //    }
            //);

            $("#myModal").modal('show');
        })
		.attr('class','hidden position '+driverId+" "+HIGHLIGHT_STATUS_CLASSES.plain)
		.attr('transform',function(d) {
				return "translate("+SCALES.xGPs(parseInt(d.round))+","+SCALES.y(parseInt(d.RoundResult.position))+")";
		})
		.on('mouseenter', function(d) {
			d3.select($(this).children('circle.position-circle').get(0)).attr('r', POSITION_CIRCLES.radius.mouseover)        //un bel magheggio, converto prima i noggetto jquery per prendermi i figli, poi in semplice oggetto dom da passare alla select... jquery magic
			d3.select($(this).children('text.position-text').get(0)).style('font-size','x-large')
			d3.select($(this).children('path.position-triangle-up').get(0)).attr("d", d3.svg.symbol().type("triangle-up").size(function() {
					return TRIANGLES.area*3;
				})
			)
			d3.select($(this).children('path.position-triangle-down').get(0)).attr("d", d3.svg.symbol().type("triangle-down").size(function() {
					return TRIANGLES.area*3;
				})
			)
		})
		.on('mouseleave', function(d) {
			d3.select($(this).children('circle.position-circle').get(0)).attr('r', POSITION_CIRCLES.radius.highlighted)
			d3.select($(this).children('text.position-text').get(0)).style('font-size','15px')
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
		.attr('r', POSITION_CIRCLES.radius.plain)
		.attr('stroke-width', POSITION_CIRCLES.stroke.plain)
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
			// console.log(d.RoundResult.status)
			return d.RoundResult.status != "Finished";
		})
		.attr("stroke", function(d) {
			if (STATUSES.accident.indexOf(d.RoundResult.status) != -1) return 'red'
			if (STATUSES.failure.indexOf(d.RoundResult.status) != -1) return 'yellow'
		})
		.attr("stroke-width", function(d) {
				return POSITION_CIRCLES.stroke.withStatus;
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
			var pts = [];
			if (d.Results) {
				pts[0] = "M"+(DRIVERS_X-82)+ ' ' +(SCALES.y(parseInt(d.position)));
				pts[1] = "L"+(DRIVERS_X-60) + ' ' + (SCALES.y(parseInt(d.position))); //todo: aggiungere curva bezier
				// pts[2] = "S"+ (DRIVERS_X-90) + ' ' + (SCALES.y(parseInt(d.position))) + ", " +(DRIVERS_X-60) + ' ' + (SCALES.y(parseInt(d.position))); //todo: aggiungere curva bezier
				for (var i=0; i< d.Results.length; i++) {
					// console.log("round: "+ d.Results[i].round + " - position: " + d.Results[i].RoundResult.position);
					pts[i+2] = "S"+ (SCALES.xGPs(parseInt(d.Results[i].round))-60) + ' ' + (SCALES.y(parseInt(d.Results[i].RoundResult.position))) + ", " +SCALES.xGPs(parseInt(d.Results[i].round)) + ' ' + SCALES.y(parseInt(d.Results[i].RoundResult.position));
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
		.style('stroke-width', POSITION_CIRCLES.radius.highlighted*2)
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

function addLightTickLines(viz) {
	viz.selectAll('line.tickline-light')
		.data(races)
		.enter()
		.append('line')
		.attr('class','tickline-light')
		.style('stroke-width', POSITION_CIRCLES.radius.highlighted*2)
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
			return SCALES.y(d.lastFinished+0.5);
		})
}

function addGPElements(viz) {
	viz.selectAll("g.gp-element")
		.data(races)
		.enter()
		.append('g')
		.attr('class','gp-element')
		.attr('transform',function(d) {
			return "translate("+SCALES.xGPs(d.round)+","+GPS_Y+")";
		})
		.on('mouseenter', function() {
			d3.select($(this).children('rect.gp-rect').get(0))
				.attr('fill', d3.rgb(d3.selectAll("rect.gp-rect").attr("fill")).darker());
		})
		.on('mouseleave', function() {
			d3.select($(this).children('rect.gp-rect').get(0))
				.attr('fill', '#D62316');
		})
        .on('click', function(d) {
            console.log(d)
            var $modal_body = $("#modal-gp-body").empty();
            var iconText = "<i class='fa fa-chevron-right'></i>";
            var spanClass = "class='labels'";
            var divClass = "class='gpmodal'";
            var raceName = $("<div "+divClass+">" + iconText + "<span "+spanClass+"'> Race Name: </span><span>" + d.raceName + "</span></div>");
            var circuitName = $("<div "+divClass+">" + iconText + "<span "+spanClass+"> Circuit Name: </span><span>" + d.Circuit.circuitName + "</span></div>");
            var country = $("<div "+divClass+">" + iconText + "<span "+spanClass+"> Status: </span><span>" + d.Circuit.Location.country + "</span></div>");
            var location = $("<div "+divClass+">" + iconText + "<span "+spanClass+"> Gain Point: </span><span>" + d.Circuit.Location.locality + "</span></div>");
            var europeanTime = $("<div "+divClass+">" + iconText + "<span "+spanClass+"> Date: </span><span>" + d.date + "</span></div>");
            var date = $("<div "+divClass+">" + iconText + "<span "+spanClass+"> Date: </span><span>" + d.date + "</span></div>");
            var linkWikipedia = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Link GP Wikipedia: </span><span><a target='_blank' href='"+ d.url+"' >"+d.raceName+"</a></span></div>");
            var circuit_image = $("<div><img class='center-block' src='img/gp/"+ d.Circuit.circuitId+".png'></div>");
            //var selText = $("<div class='well' class='lbl-panel-span'>"+getSelectionText(note.target.id,note.target.start,note.target.end)+"</div>")
            $modal_body.append(raceName);
            $modal_body.append(circuitName);
            $modal_body.append(country);
            $modal_body.append(location);
            $modal_body.append(europeanTime);
            $modal_body.append(date);
            $modal_body.append(linkWikipedia);
            $modal_body.append(circuit_image);
            //d3.select("#modal-gp-header")
            //    .style("background-color", function (d) {
            //        return d3.rgb(SCALES.colorsHighlight(parseInt(driverFinalPosition)));
            //    });
            //$("#modal-pilot-header").attr("background-color", function(d) {
            //        return d3.rgb(SCALES.colors(parseInt(driverFinalPosition))).darker();
            //    }
            //);
            $("#gpModalTitle").text(d.raceName);

            $("#gpModal").modal('show');
        });

	// viz.selectAll("g.gp-element")
	// 	.data(races)
	// 	.append('path')
	// 	.attr('d', 'M'+GP_PATH.delta+' 0 L'+GP_PATH.rectWidth+' 0 L'+(GP_PATH.rectWidth-GP_PATH.delta)+' '+GP_PATH.rectHeight+' L 0 '+GP_PATH.rectHeight+' Z')
	// 	.attr('fill','blue')
	// 	.attr('transform',function(d) {
	// 		return "translate(-"+((GP_PATH.rectWidth-GP_PATH.delta)-30)+",0)";
	// 	});


	// viz.selectAll("g.gp-element")
	// 	.data(races)
	// 	.append('circle')
	// 	.attr('r', '2')
	// 	.attr('fill','red')
	// 	// .attr('transform',function(d) {
	// 	// 	return "translate(-"+(GP_PATH.delta+(GP_PATH.rectWidth/2))+",0)";
	// 	// });

	viz.selectAll("g.gp-element")
		.data(races)
		.append('rect')
		.attr('class','gp-rect')
		.attr('transform',"translate("+(-GP_SHAPE_WIDTH/2)+","+(-GPS_Y)+")")
		.attr('height',GP_SHAPE_HEIGHT)
		.attr('width',GP_SHAPE_WIDTH)
		.attr('fill','#D62316')
		.attr('rx','3')
		.text(function(d) {
			return d.Circuit.Location.country;
		})

	viz.selectAll("g.gp-element")
		.data(races)
		.append('text')
		.attr('y',(GP_SHAPE_HEIGHT/2))
		.attr('class','gp-label')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
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
			return "translate("+INSETS.left+","+(SCALES.y(parseInt(data.position)) - (DRIVER_RECT.rectHeight/2) )+")"
		})
		.attr('class', function(d) {
			return 'driver-element '+HIGHLIGHT_STATUS_CLASSES.plain+' '+d.driverId;
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

	viz.selectAll("g.info-g")
		.data(drivers)
		.enter()
		.append('g')
		.attr('class','info-g')
		.attr("transform",function(data) {
			return "translate("+INSETS.left+","+SCALES.y(parseInt(data.position))+")"
		})
		.on('mouseenter', function() {
			console.log($(this).children('circle.info-circle').get(0))
			d3.select($(this).children('circle.info-circle').get(0))
				.attr('fill', 'white');
		})
		.on('mouseleave', function() {
			d3.select($(this).children('circle.info-circle').get(0))
				.attr('fill', '#656E75');
		})
        .on('click', function(d) {
            //console.log(d)
            var $modal_body = $("#modal-pilot-body").empty();
            var iconText = "<i class='fa fa-chevron-right'></i>";
            var spanClass = "class='labels'";
            var divClass = "class='pilotmodal'";
            var container = $("<div class=''></div>");
            var container_row = $("<div class='row'></div>");
            var div_images = $("<div id="+d.driverId+"_photo"+" class='col-md-6 div_pilot_image'></div>");
            var div_info = $("<div id="+d.driverId+"_info"+" class='col-md-6 div_pilot_info'></div>");

            var row_pilot_image = $("<div class='row'><div class='col-md-12 name centered'><img width='200' class='center-block' src='img/Pilot/"+ d.driverId+".png'></div></div>");
            var row_constructor_image = $("<div class='row'><div class='col-md-12 name centered'>" +
            "<img class='center-block' style='max-width:200px' src='img/Constructor/"+ d.Constructor.constructorId+".png'></div></div>");
            div_images.append(row_pilot_image);
            div_images.append(row_constructor_image);

            var name = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Name: </span><span>"+ d.givenName+"</span></div>");
            var familyName = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Family Name: </span><span>"+ d.familyName+"</span></div>");
            var nationality = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Nationality: </span><span>"+ d.nationality+"</span></div>");
            var birth = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Date of Birth: </span><span>"+ d.dateOfBirth+"</span></div>");
            var finalPosition = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Final Position: </span><span>"+d.position+"</span></div>");
            var finalPoints = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Points: </span><span>"+d.points+"</span></div>");
            var Constructor = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Constructor: </span><span>"+d.Constructor.name+"</span></div>");
            var permanentNumber = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Permanent Number: </span><span>"+d.permanentNumber+"</span></div>");
            var linkWikipedia = $("<div "+divClass+">"+iconText+"<span "+spanClass+" > Link Wikipedia: </span><span><a target='_blank' href='"+ d.url+"' >"+d.familyName+"</a></span></div>");
            //var selText = $("<div class='well' class='lbl-panel-span'>"+getSelectionText(note.target.id,note.target.start,note.target.end)+"</div>")
            //content = driver + position + status + points + grid + construct
            div_info.append(name);
            div_info.append(familyName);
            div_info.append(nationality);
            div_info.append(birth);
            div_info.append(finalPosition);
            div_info.append(finalPoints);
            div_info.append(Constructor);
            div_info.append(permanentNumber);
            div_info.append(linkWikipedia);

            container_row.append(div_images);
            container_row.append(div_info);
            container.append(container_row);
            $modal_body.append(container);

            d3.select("#modal-pilot-header")
                .style("background-color", function() {
                    return d3.rgb(SCALES.colorsHighlight(parseInt(d.position)));
                });

            $("#pilotModalTitle").text(d.givenName +" "+ d.familyName);

            $("#myModal").modal('show');
        });

	viz.selectAll("g.info-g")
		.data(drivers)
		.append('circle')
		.attr('class','info-circle')
		.attr('fill', '#656E75')
		.attr('r', '10');


	viz.selectAll("g.info-g")
		.data(drivers)
		.append('text')
		.attr('class','driver-final-position')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
		.text('i');

	viz.selectAll("g.driver-element")
		.data(drivers)
		.append("rect")
		.attr("class","driver-rect")
		.attr("rx","0")
		.attr("ry","15")
		// .attr("y","0")
		.attr("x","18")
		.attr("height", DRIVER_RECT.rectHeight)
		.attr("width", DRIVER_RECT.rectWidth)
		.style('fill', function(d){
			return SCALES.colors(parseInt(d.position));
		});

	viz.selectAll("g.driver-element")
		.data(drivers)
		.append('text')
		.attr('class','driver-label')
		.attr('y', DRIVER_RECT.rectHeight/2)
		.attr('x', '55')
		.text(function(data) {
			return data.familyName;
		})

	viz.selectAll("g.driver-element")
		.data(drivers)
		.append("g")                                //questi <g> servono per rendere possibile centrare le posizioni finali nei cerchi
		.attr('class','final-position-g')
		.attr("transform",function(data) {
			return "translate(35,"+DRIVER_RECT.rectHeight/2+")"
		});

	viz.selectAll("g.final-position-g")
		.data(drivers)
		.append('circle')
		.attr('class','final-position-circle')
		.attr('r', '12')
	
	viz.selectAll("g.final-position-g")
		.data(drivers)
		.append('text')
		.attr('class','driver-final-position')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
		.text(function(data) {
			return data.position;
		})
		.style('fill', function(d){
			return SCALES.colors(parseInt(d.position))
		});
}

function confScales() {
	SCALES.xGPs = d3.scale.linear()
		.domain([1,19.5])//todo: da cambiare: il range del dominio deve essere [round minimo, round massimo]
		.range([DRIVERS_X,WIDTH - INSETS.right]);

	SCALES.y = d3.scale.linear()
		.domain([1, drivers.length]) //il dominio parte da 1 e non da 0 così possiamo utilizzare direttamente le posizioni della classifica finale (che partono da 1 ovviamente)
		.range([INSETS.top, HEIGHT - INSETS.bottom]); //todo: da migliorare

	SCALES.colors = d3.scale.linear().domain([1,(drivers.length-1)/2,drivers.length-1]).range(['#009933','#FFFFFF', '#ff3333']).interpolate(d3.interpolateRgb);
	SCALES.colorsHighlight = d3.scale.category20();
}

//todo: sicuramente ci sono modi più efficienti di farlo, ma avendo a che fare con pochi elementi (circa 20 piloti, 20 gp, etc...) usare dei cicli e fare diversi selectAll non è un grosso problema e non si perde molto
function highlight(viz, dId, selectedElem) {
	//todo: da rivedere e migliorare


	//assegna le classi in base alla selezione
	viz.selectAll('path.results, g.position, g.driver-element, g.final-position-g, rect.driver-rect')
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

	//aumenta lo stroke dei piloti highlighted e cambia colore
	viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.highlighted)
		.attr('stroke-width', PATH_STROKE.highlighted)
		.style('stroke', function(d){
			console.log(d.position)
			return SCALES.colorsHighlight(parseInt(d.position))
		});

	// //diminuisce il raggio dei position dei piloti dimmed
	// viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.dimmed+' circle.position-circle')
	// 	.attr('r', POSITION_CIRCLES.radius.dimmed)

	//aumenta il raggio dei position dei piloti highlighted
	viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+' circle.position-circle')
		.attr('r', POSITION_CIRCLES.radius.highlighted);

	//cambia i colori
	for (var i in drivers) {
		//cambia colori position
		viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+'.'+drivers[i].driverId+' circle.position-circle, '+
					 'g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+'.'+drivers[i].driverId+' path.position-triangle-down, '+
					 'g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+'.'+drivers[i].driverId+' path.position-triangle-up')
			.style('fill', function(d){
				return d3.rgb(SCALES.colorsHighlight(parseInt(drivers[i].position))).darker();
			});

		//cambia colori driver elements
		viz.selectAll('g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted+'.'+drivers[i].driverId+' rect , '+
					'g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted+'.'+drivers[i].driverId+' g text')
			.style('fill', function(d){
				return d3.rgb(SCALES.colorsHighlight(parseInt(drivers[i].position))).darker();
			});
	}

	//mostra le posizioni
	viz.selectAll('g.position')
		.classed('hidden', function(d) {    // testo del position visibile se il driver è selezionato O è uno dei driver precedentemente selezionati
			return !d3.select(this).classed(HIGHLIGHT_STATUS_CLASSES.highlighted)   //hidden è da togliere se il pilota è selezionato
		});
}

function unhighlight(viz, dId, selectedElem) {
	var lastOneHighlighted = viz.selectAll('g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted)[0].length == 1 //se c'è almeno un altro pilota selezionato

	// se non è l'ultimo evidenziato
	if (!lastOneHighlighted) {
		//assegna le classi in base alla selezione
		viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.highlighted+
					', g.position.'+HIGHLIGHT_STATUS_CLASSES.highlighted+
					', g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.highlighted+
					', text.position-text.'+HIGHLIGHT_STATUS_CLASSES.highlighted+
					', rect.driver-rect.'+HIGHLIGHT_STATUS_CLASSES.highlighted+
					', g.final-position-g.'+HIGHLIGHT_STATUS_CLASSES.highlighted)
			.classed(HIGHLIGHT_STATUS_CLASSES.dimmed, function(d) {         // dimmed se è il driver selezionato
				return matchingDriverId(d,dId)
			})
			.classed(HIGHLIGHT_STATUS_CLASSES.highlighted, function(d) {    // highlighted se non è il driver selezionato
				return !matchingDriverId(d,dId)
			});

		//diminuisce lo stroke dei path dei piloti dimmed e cambia colore
		viz.selectAll('path.results.'+HIGHLIGHT_STATUS_CLASSES.dimmed)
			.attr('stroke-width', PATH_STROKE.dimmed)
			.style("stroke", function(d) {
				return SCALES.colors(parseInt(d.position));
			});

		//diminuisce il raggio dei position dei piloti dimmed e cambia colore
		viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.dimmed+' circle.position-circle')
			.attr('r', POSITION_CIRCLES.radius.dimmed)
			.style('fill', function(d) {
				SCALES.colors(parseInt(standings[standings.length -1][d.RoundResult.Driver.driverId].positionText));
			});

		//nasconde i position
		viz.selectAll('g.position.'+HIGHLIGHT_STATUS_CLASSES.dimmed)
			.classed('hidden', true);


		//cambia il colore a rect-driver e testo posizione finale
		viz.selectAll('g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.dimmed+' rect, '+
			'g.driver-element.'+HIGHLIGHT_STATUS_CLASSES.dimmed+' g text')
			.style('fill', function(d){
				return SCALES.colors(parseInt(d.position));
			})
	} else {
		unhighlightAll(viz)
	}
}

function unhighlightAll(viz) {
	viz.selectAll('path.results, g.position, g.driver-element, .position-text, g.final-position-g, rect.driver-rect')     //li prendo tutti per ripristinare lo stato iniziale
		.classed(HIGHLIGHT_STATUS_CLASSES.highlighted, false)
		.classed(HIGHLIGHT_STATUS_CLASSES.dimmed, false)
		.classed(HIGHLIGHT_STATUS_CLASSES.plain, true);


	//ripristina gli stroke di tutti i path e cambia colore
	viz.selectAll('path.results')
		.attr('stroke-width', PATH_STROKE.plain)
		.style("stroke", function(d) {
				return SCALES.colors(parseInt(d.position));
			});

	//diminuisce il raggio dei position dei piloti e cambia colore
	viz.selectAll('g.position circle.position-circle')
		.attr('r', POSITION_CIRCLES.radius.plain)
		.style('fill', function(d) {
			SCALES.colors(parseInt(standings[standings.length -1][d.RoundResult.Driver.driverId].positionText));
		});

	//nasconde i position
	viz.selectAll('g.position')
		.classed('hidden', true);

	//cambia il colore a rect-driver e testo posizione finale
	viz.selectAll('g.driver-element  rect, '+
				'g.driver-element g text')
		.style('fill', function(d){
			return SCALES.colors(parseInt(d.position));
		})
}

function addDriversHeaderElements(viz) {
	// viz.append('circle')
	// 	.attr('r',2)
	// 	.attr('fill','red')
	// 	.attr('x',0)
	// 	.attr('y',0)

	viz.append('g')
		.attr('id','driversHeader')
		.attr('transform',function(d) {
			return "translate(12,6)";
		})

	viz.select('#driversHeader')
		.append('image')
		.attr('id','helmetIcon')
		.attr('xlink:href','img/f1_helmet_icon_2.png')
		.attr('width','170')
		.attr('height','49');

	viz.select('#driversHeader')
		.append('text')
		.attr('id','driversHeader')
		.attr('x','10')
		.attr('y','10')

	viz.select('#driversHeader')
		.append('tspan')
		.text('test');

}