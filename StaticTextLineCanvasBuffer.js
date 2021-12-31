// StaticTextLineCanvasBuffer.js - Encapsulates an area where text is generated to
//                                 a canvas object
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

function StaticTextLineCanvasBuffer(fontSizePx, fontName, fontStyle) {
	// Font name and style
	this.fontName = fontName;
	this.fontStyle = fontStyle;
	
	// Multiplier allotted in order to provide region for
	// the font descent.
	this.constFontDescentCompensationFactor = 1.5
	
	// Size of the font used for the text
	this.renderedTextFontSizePx = fontSizePx;
	
	// Color of the text to be rendered.
	this.renderedTextColorString = "RGBA(255, 255, 255, 255)";
	
	this.currentTextString = "";

	// Canvas object to which the represented string will be rendered
	this.textOutputCanvas = document.createElement("canvas");
	
	this.textOutputCanvas.width = 0;
	this.textOutputCanvas.height = 0;
	
	this.setRenderingFont(this.getTextOutputCanvasContext());
}


StaticTextLineCanvasBuffer.prototype.getTextOutputCanvasContext = function() {
	var textOutputCanvasContext = null;
	
	if (Utility.validateVar(this.textOutputCanvas)) {
		textOutputCanvasContext = this.textOutputCanvas.getContext("2d");
	}
	
	return textOutputCanvasContext;
}


/**
 * Applies the rendering font to the specified target canvas
 * @param targetCanvasContext {CanvasRenderingContext2D} The context of the canvas that is to have
 *                                                       the rendering font applied
 */
StaticTextLineCanvasBuffer.prototype.setRenderingFont = function(targetCanvasContext) {
	if (Utility.validateVar(targetCanvasContext)) {
		targetCanvasContext.font = this.fontStyle + " " + this.renderedTextFontSizePx + "px " + this.fontName;
	}
}

/**
 * Retrieves the total approximate height of the area which
 *  is required to render the text
 * @return {number} The height of the text area, in pixels
 */
StaticTextLineCanvasBuffer.prototype.getTextAreaHeight = function() {
	return this.constFontDescentCompensationFactor * this.renderedTextFontSizePx
}

StaticTextLineCanvasBuffer.prototype.updateStaticTextString = function(newString) {
	if (Utility.validateVar(newString)) {
		this.currentTextString = newString;
		this.updateCanvasDimensionsAsNecessary(newString);
		this.renderTextToInternalCanvas();
	}
}


StaticTextLineCanvasBuffer.prototype.updateCanvasDimensionsAsNecessary = function(targetString) {
	if (Utility.validateVar(targetString)) {
		this.setRenderingFont(this.getTextOutputCanvasContext());
		var requiredCanvasWidth = Math.ceil(this.getTextOutputCanvasContext().measureText(targetString).width);
		var requiredCanvasHeight = this.getTextAreaHeight();
		
		if (requiredCanvasWidth > this.textOutputCanvas.width) {
			this.textOutputCanvas.width = requiredCanvasWidth;
		}
		
		if (requiredCanvasHeight > this.textOutputCanvas.height) {
			this.textOutputCanvas.height = requiredCanvasHeight;
		}
	}
}

/**
 * Renders the text to an internally-maintained canvas
 */
StaticTextLineCanvasBuffer.prototype.renderTextToInternalCanvas = function() {
	// Write the text to the canvas.
	var targetCanvasContext = this.getTextOutputCanvasContext();
	targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
	this.setRenderingFont(targetCanvasContext);
	targetCanvasContext.fillStyle = this.renderedTextColorString;
	targetCanvasContext.fillText(this.currentTextString, 0, this.renderedTextFontSizePx);
}

/**
 * Retrieves the width of the internally-maintained canvas
 *
 * @return {Number} The width of the internally-maintained canvas
 */ 
StaticTextLineCanvasBuffer.prototype.requiredRenderingCanvasWidth = function() {
	return this.textOutputCanvas.width;
}

/**
 * Retrieves the height of the internally-maintained canvas
 *
 * @return {Number} The height of the internally-maintained canvas
 */ 
StaticTextLineCanvasBuffer.prototype.requiredRenderingCanvasHeight = function() {
	return this.textOutputCanvas.height;
}

/**
 * Renders the text image buffer to a target canvas
 * @param targetCanvasContext The rendering context of the canvas in which the buffer
 *                            should be rendered
 * @param targetCoordX X-coordinate of the upper-left corner of the text position
 * @param targetCoordY Y-coordinate of the upper-left corner of the text position
 */
StaticTextLineCanvasBuffer.prototype.renderText = function(targetCanvasContext, targetCoordX, targetCoordY) {
	if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(targetCoordX) && Utility.validateVar(targetCoordY)) {
		targetCanvasContext.drawImage(this.textOutputCanvas, targetCoordX, targetCoordY);
	}
}