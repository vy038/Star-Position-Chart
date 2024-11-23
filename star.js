/**
 * This class creates a star (circle) which has variable size and position depending on  the input parameters
 * @class  
 */
class Star {
	
	/**
	 * This represents a star with a given position, magnitude (brightness) and size
	 *
	 * @constructor
	 *
	 * @param {Number} ra - initial ra value of the star
	 * @param {Number} dist - initial distance of the star
	 * @param {Number} mag - apparent magnitude (brightness) of the star
	 * @param {Number} size - initial size of the star
	 * @param {Number} width - width of the canvas
	 * @param {Number} height - height of the canvas
	 * @param {String} color - color value of the star
	 * @param {Number} zoom - gives a zoom value affecting the radius of polar coordinates
	 * @param {Number} scaleFactor - determines how big to scale the size of the star should be
	 * @param {Number} minMag - the minimum magnitude the star needs to show
	 * @param {Number} maxMag - the maximum magnitude the star needs to show
	 * @param {Number} unModMag - the unmodified magnitude of the star 
	 * @param {Boolean} colorCheck - whether or not the star should show color
	 * @param {Number} id - the id of the star
	 * @param {String} name - name of the star if it has one
	 * @param {Number} updateX - the delta value for when the mouse is dragged in the x direction, used to pan
	 * @param {Number} updateY - the delta value for when the mouse is dragged in the y direction, used to pan
	 */
	constructor(ra, dist, mag, magNorm, width, height, color, zoom, scaleFactor, minMag, maxMag, unModMag, colorCheck, id, name, updateX, updateY) {
		this.ra = ra; // ra value of star
		this.dist = dist; // distance of star from center
		this.mag = mag; // scaled magnitude for brightness calculations
		this.magNorm = magNorm; // absolute magnitude (scaled) to determine size of star
		this.width = width; // width of canvas
		this.height = height; // height of canvas
		this.color = color; // determine whether or not user wants color for this star
		this.zoom = zoom; // raw zoom value
		this.scaleFactor = scaleFactor; // a variable which is multiplied with the size to determine how big the star must be
		this.minMag = minMag; // the minimum apparent magnitude required for the star to display
		this.maxMag = maxMag; // the maximum apparent magnitude required for the star to display (constant)
		this.unModMag = unModMag; // the unmodified apparent magnitude of the star
		this.colorCheck = colorCheck; // boolean value for whether or not the star should show color
		this.id = id; // id of star
		this.name = name; // name of the star if it has one
		this.updateX = updateX; // update x values for panning
		this.updateY = updateY; // update y values for panning
		
		this.x = this.width/2 + this.dist * this.zoom * Math.cos(map(this.ra, 0, 24, 0, 360)) + this.updateX;	// x coordinate calculation using ra and distance 
		this.y = this.height/2 + this.dist * this.zoom * Math.sin(map(this.ra, 0, 24, 0, 360)) + this.updateY; // y coordinate calculation using ra and distance
		this.size = 1+Math.round(this.magNorm*log(zoom)*this.scaleFactor/100); // size of star calculation
	}
	
	/**     
	 * Shows the star with the given positions and sizes, and converting magnitudes to brightness
	 */
	show() {
		// if star is within boundries and within accepted magnitude range
		if (this.x >= 0 && this.x <= this.width && this.y >= 0 && this.y <= this.height && this.unModMag <= this.minMag && this.unModMag >= this.maxMag) {
			if (this.color == 0) { // if there is no spectra for star then give it B&W
				if (255 - this.mag < 0) {
					this.fillColor = 0;
				} else {
					this.fillColor = 255 - this.mag;
				}
				fill(this.fillColor, 255);
			} else { // if color extraction failed or colorCheck is false, give it B&W color
				if (colorExtraction(this.color) == -1 || this.colorCheck == false) {
					if (255 - this.mag < 0) {
						fill(0, 255);
					} else {
						fill(255 - this.mag, 255);
					}
					
				} else { // if there is a successful spectra extraction, give the star a fill color
					colorMode(HSB);
					fill(colorExtraction(this.color), saturationExtraction(this.color), 100-((this.mag/255)*100));
					colorMode(RGB);
				}
			}
			// create the star with constructor sizes and new color
			circle(this.x, this.y, this.size);
		}
	} 
	

	
	/**
	 * Rotates the star by a certain amount around the center
	 *
	 * @param {Number} rotationAmount - how much the ra changes by
	 */
	rotate(rotation) {
		// changes the ra of the star (angle) and remaps all the x and y coordinates
		this.ra = this.ra - rotation;
		this.x = this.width/2 + this.dist * this.zoom * Math.cos(map(this.ra, 0, 24, 0, 360));
		this.y = this.height/2 + this.dist * this.zoom * Math.sin(map(this.ra, 0, 24, 0, 360));
	}
	
	/*
	* update different values in the star
	*
	* @param {Number} zoom - updated zoom amount in the code to give to star plotting
	* @param {Number} scaleFactor - updated scale factor in the code to give to star plotting
	* @param {Number} minMag - updated minimum magnitude in the code to give to star plotting
	* @param {String} colorToggle - updates whether or not the stars should have color
	*/
	update(zoom, scaleFactor, minMag, colorCheck) {
		// updates all the values in the star needed for accurate placement
		this.zoom = zoom;
		this.minMag = minMag;
		this.colorCheck = colorCheck;
		
		// doing math to update coordinates and the size with the appropriate updated variables
		this.x = this.width/2 + this.dist * this.zoom * Math.cos(map(this.ra, 0, 24, 0, 360)) + this.updateX;
		this.y = this.height/2 + this.dist * this.zoom * Math.sin(map(this.ra, 0, 24, 0, 360)) + this.updateY;
		this.size = 1+Math.round(this.magNorm*log(this.zoom)*scaleFactor/100);
	}
	
	/*
	* checks to see if the mouse overlaps with a star
	*
	* @param {Number} mouseX - the x position of the mouse
	* @param {Number} mouseY - the y position of the mouse
	*/
	overlap(mouseX, mouseY) {
		// if mouse is in close proximity of a star, return the id of that star, else return nothing
		if (mouseX <= this.x + log(this.zoom) && mouseX >= this.x - log(this.zoom) && mouseY <= this.y + log(this.zoom) && mouseY >= this.y - log(this.zoom)) {
			return this.id;
		} else {
			return 0;
		}
	}
	
	/*
	* checks to see if the overlapping star has a name
	*
	* @param {Number} mouseX - the x position of the mouse
	* @param {Number} mouseY - the y position of the mouse
	*/
	extractName(mouseX, mouseY) {
		// if mouse is in close proximity of a star, return the id of that star, else return nothing
		if (mouseX <= this.x + log(this.zoom) && mouseX >= this.x - log(this.zoom) && mouseY <= this.y + log(this.zoom) && mouseY >= this.y - log(this.zoom) && this.name) {
			return this.name;
		} else {
			return "N/A";
		}
	}
	
	/*
	* updates the values of the coordinates of the stars to give a pan appearance
	*
	* @param {Number} updateX - delta x value of the mouse while it is down
	* @param {Number} updateY - delta y value of the mouse while it is down
	*/
	pan(updateX, updateY) {
		this.updateX = updateX;
		this.updateY = updateY;
		this.x += this.updateX;
		this.y += this.updateY;
	}
}

/*
* returns a numeric hue HSB value for a star after extracting a character in its spectra
*
* @param {String} colorStr - the complete string of the star spectra in which to convert the character from
* 
* @returns {Number} the numeric hue value for HSB
*/
function colorExtraction(colorStr) {
		// extracts a letter from the spectra and returns a value based on that for color extraction
		if (colorStr[0] == 'O' || colorStr[0] == 'W') { 
			return 240;
		} else if (colorStr[0] == 'B') {
			return 240;
		} else if (colorStr[0] == 'A') {
			return 240;
		} else if (colorStr[0] == 'F') {
			return 240;
		} else if (colorStr[0] == 'G') {
			return 50;
		} else if (colorStr[0] == 'K') {
			return 350;
		} else if (colorStr[0] == 'M' || colorStr[0] == 'C') {
			return 0;
		}	else {
			return -1;
		}
}

/*
* returns a numeric saturation HSB value for a star after extracting a character in its spectra
*
* @param {String} colorStr - the complete string of the star spectra in which to convert the character from
* 
* @returns {Number} the numeric saturation value for HSB
*/
function saturationExtraction(colorStr) {
		// extracts a letter from the spectra and returns a value based on that for saturation extraction
		if (colorStr[0] == 'O' || colorStr[0] == 'W') {
			return 80;
		} else if (colorStr[0] == 'B') {
			return 30;
		} else if (colorStr[0] == 'A') {
			return 20;
		} else if (colorStr[0] == 'F') {
			return 0;
		} else if (colorStr[0] == 'G') {
			return 60;
		} else if (colorStr[0] == 'K') {
			return 50;
		} else if (colorStr[0] == 'M' || colorStr[0] == 'C') {
			return 90;
		} else {
			return 0;
		}
}