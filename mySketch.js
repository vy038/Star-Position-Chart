/* 
	Star Position Chart
	Victor Yu
	Created: 2024-10-01
	Modified: 2024-11-10
	Purpose: To display the location and other information of various stars 
*/

// declare variables

let wiki = "https://en.wikipedia.org/wiki/";

let plotted = []; // array for data
let starArr = []; // array for actual objects
let minMag = 6; // data from -1.44 - 22
let maxMag = -2;
let scaleFactor = 0.2; // 500 is ideal with -1.44 - 9, make scaleFactor adjustable with slider

let colorShow = false; // toggle with check box
let rotation = false;
let rotationSpeed = 0.0025;

let starID;
let name = "N/A";
let zoom = 1;

let mousePositions = [0, 0];

let counter = 0;

/*
* function to pre-load the data
*/
function preload() {
	loadTable('./sortedMag_hyglike_from_athyg_v24.csv', handleData);
}

function setup() {
	// basic setup
	createCanvas(windowWidth/1.5, windowHeight/1.5);
	background(0);
	noStroke();
	
	// plot all the stars
	replotStars(1);
}

function draw() {
	
	// update star position and zoom size
	replotStars(0, rotationSpeed, rotation);
	
	// create text to show zoom, min mag, etc
	fill(128);
	textSize(10);
	text(`Minimum Mag: ${minMag}`, windowWidth/1.5 - 100, windowHeight/1.5 - 5);
	text(`Zoom: ${zoom}`, windowWidth/1.5 - 100, windowHeight/1.5 - 15);
	text(`Scale Factor: ${scaleFactor}`, windowWidth/1.5 - 100, windowHeight/1.5 - 25);
	text(`ID: ${starID}`, 3, windowHeight/1.5 - 5);
	text(`Name: ${name}`, 3, windowHeight/1.5 - 15);
	if (name != "N/A") { // show wikipedia link if info of star is availible
		text(wiki + name, 3, windowHeight/1.5 - 25);
	}
}

/*
* function to extract data and put it into an object
*/
function handleData(data) {
	for (let i = 0; i < data.getRowCount(); i++) { // goes through every row
		if (data.get(i, 13) && data.get(i, 7) && data.get(i, 8) && isNaN(data.get(i, 13)) == false && isNaN(data.get(i, 8)) == false && isNaN(data.get(i, 7)) == false) { // ensures real data
				plotted.push({"name": data.get(i, 6), // gets name of stars as string
											"id": data.get(i, 0), // gets id of stars as integer
											"x": map(data.get(i, 7), 0, 24, windowWidth/1.5, 0), // maps RA to canvas positions
											"y" : map(data.get(i, 8),-90, 90, windowHeight/1.5, 0), // maps dec to canvas positions
											"ra" : data.get(i, 8), // raw ra for circular projection
											"mag" : map(pow(10, data.get(i, 13)), pow(10, maxMag), pow(10, minMag), 0, 400), // maps apparent magnitude from 0 - 400 taking into account the power
											"magNorm" : map(data.get(i, 13), maxMag, minMag, 0, windowWidth/1.5), // takes apparent mag with power accounted for
											"unModMag" : data.get(i, 13), // takes raw unmodified apparent magnitude
											"absMag" : map(data.get(i, 14), 19.539, -9.614, 0, windowHeight/1.5), // absolute magnitude of star mapped
											"modAbsMag" : map(pow(10, data.get(i, 13)), pow(10, 19.539), pow(10, -9.614), 0, 400), // absolute magnitude of star with power accounted for mapped
											"distance" : map(data.get(i, 9), 0, 82083.9594, 0, windowHeight), // mapped distance of star from earth 
											"spectra" : data.get(i, 15) // spectra (color) of star https://en.wikipedia.org/wiki/Stellar_classification#Spectral_types
										 });
		}
	}
}

/*
* function to detect when the mouse scroll is used to zoom in or out
*
*/
function mouseWheel(event) {
	if (event.delta > 0) { // zoom out and change zoom value variable
		zoom += Math.round(1 + zoom/10);
	} else { // zoom in and change zoom value variable
		if (zoom > 1) {
			zoom -= Math.round(1 + zoom/10);
		}
	}
	// update stars
	replotStars(0);
}

/*
* function to detect when mouse is being dragged to pan the view
*
*/
function mouseDragged() {
	if (mouseX >= 0 && mouseX <= windowWidth/1.5 && mouseY >= 0 && mouseY <= windowHeight/1.5) { // if mouse is withing canvas bounds
		for (let star of starArr) { // pan every star
			star.pan(Math.round(mouseX - mousePositions[0]), Math.round(mouseY - mousePositions[1]));
			star.show();
		}
	}
}

/*
* function to reset the delta mouse x and mouse y values
*
*/
function mousePressed() {
	mousePositions = [mouseX, mouseY];
	if (mouseButton == RIGHT && name != "N/A") {
    window.open(wiki + name, "_blank");
  }
}

/**
* replots all the stars in the array
*
* @param {Number} mode - the mode in which to plot the stars, either 1 for setup, or 0 for update
* @param {Number} rotationSpeed - speed of star rotation
* @param {Boolean} rotationToggle - whether or not rotation is toggled
*
**/
function replotStars(mode, rotationSpeed, rotationToggle) { 
	// removes all old stars
	background(0);
	
	if (mode == 1) { // if in initial setup mode
		for (let i of plotted) {
			if (i.unModMag <= minMag && i.unModMag >= maxMag && i.distance) {  // if star brightness is within range
				if (i.spectra) { // create a star with color if there is data for that
					starPoint = new Star(i.ra, i.distance, i.mag, i.magNorm, windowWidth/1.5, windowHeight/1.5, i.spectra, zoom, scaleFactor, minMag, maxMag, i.unModMag, colorShow, i.id, i.name, 0, 0);
				} else { // create a plain white star
					starPoint = new Star(i.ra, i.distance, i.mag, i.magNorm, windowWidth/1.5, windowHeight/1.5, 0, zoom, scaleFactor, minMag, maxMag, i.unModMag, colorShow, i.id, i.name, 0, 0);
				}		
				// add this new star to an array of all stars and show it
				starArr.push(starPoint);
				starPoint.show();
			}
		}
	} else { // if values need to be updated
		background(0);
		for (let star of starArr) { // for every star made, update the current zoom, scale factor and minimum magnitude, and show it
			star.update(zoom, scaleFactor, minMag, colorShow);
			if (rotationToggle) { // if rotation is on rotate the star
				star.rotate(rotationSpeed/10); 
			}
			if (star.overlap(mouseX, mouseY) != 0) {
				starID = star.overlap(mouseX, mouseY);
				name = star.extractName(mouseX, mouseY);
			}
			star.show();
		}
	}
	
}

/*
* function that toggles a boolean that tells the stars whether or not to rotate, runs on checkmark press
*
*/
function rotationCheckFunction() {
	var check = document.getElementById("rotationCheck");
	
	if (check.checked == true){
    rotation = true;
  } else {
    rotation = false;
  }
}

/*
* function that toggles a boolean that determines whether or not the stars will have color, runs on checkmark press
*
*/
function colorCheckFunction() {
	var check = document.getElementById("colorCheck");
	
	if (check.checked == true){
    colorShow = true;
  } else {
    colorShow = false;
  }
}

/*
* function that assigns the minimum magnitude slider value to a usable variable
*
*/
function magSliderFunction() {
	var slider = document.getElementById("magSlider");
	minMag = slider.value;
}

/**
* function that assigns the minimum magnitude slider value to a usable variable
*
**/
function scaleSliderFunction() {
	var slider = document.getElementById("scaleSlider");
	scaleFactor = slider.value/10;
}

/*
* function that assigns the minimum magnitude slider value to a usable variable
*
*/
function rotationSliderFunction() {
	var slider = document.getElementById("rotationSlider");
	rotationSpeed = slider.value/1000;
}