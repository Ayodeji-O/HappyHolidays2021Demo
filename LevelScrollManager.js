
// Scroll coordinate space - bottom left coordinate is (0.0, 0.0)
function LevelScrollManager(dimensionX, dimensionY, viewPortSizeX, viewPortSizeY) {
	
	// Global space dimensions
	this.dimensionX = dimensionX;
	this.dimensionY = dimensionY;
		
	// View port dimensions
	this.viewPortSizeX = Utility.validateVar(viewPortSizeX) ? viewPortSizeX : 2.0;
	this.viewPortSizeY = Utility.validateVar(viewPortSizeY) ? viewPortSizeY : 2.0;;
	
	// Immediate view port center point coordinates,
	// in global space coordinates
	this.viewPortCenterPointX = 0.0;
	this.viewPortCenterPointY = 0.0;

	this.scrollInitiationMargin = 0.6;
}

LevelScrollManager.prototype.updateScrollPositionWithPoint = function(
	focusPointX, focusPointY) {
		
	var scrollAmountX = this.computeScrollAmountAlongAxis(this.viewPortCenterPointX,
		this.viewPortSizeX, focusPointX);
	var scrollAmountY = this.computeScrollAmountAlongAxis(this.viewPortCenterPointY,
		this.viewPortSizeY, focusPointY);
	
	//var minViewPortCenterX = -(this.dimensionX / 2.0) + (this.viewPortSizeX / 2.0);
	//var maxViewPortCenterX = (this.dimensionX / 2.0) - (this.viewPortSizeX / 2.0);
	
	var minViewPortCenterX = this.viewPortSizeX / 2.0;
	var maxViewPortCenterX = this.dimensionX - (this.viewPortSizeX / 2.0);	
	
	var minViewPortCenterY = this.viewPortSizeY / 2.0;
	var maxViewPortCenterY = this.dimensionY - (this.viewPortSizeY / 2.0);
	
	this.viewPortCenterPointX =
		Math.min(Math.max(this.viewPortCenterPointX + scrollAmountX, minViewPortCenterX), maxViewPortCenterX);
	this.viewPortCenterPointY =
		Math.min(Math.max(this.viewPortCenterPointY + scrollAmountY, minViewPortCenterY), maxViewPortCenterY);
}

LevelScrollManager.prototype.computeScrollAmountAlongAxis = function (viewPortAxisCenterCoord, viewPortAxisSize,
	axisFocusCoord) {
	var scrollAmount = 0.0;
		
	var positiveScrollBoundary = ((viewPortAxisSize / 2.0) - this.scrollInitiationMargin) +
		viewPortAxisCenterCoord;
	var negativeScrollBoundary = (-(viewPortAxisSize / 2.0) + this.scrollInitiationMargin) +
		viewPortAxisCenterCoord;
	if (axisFocusCoord > positiveScrollBoundary) {
		scrollAmount = axisFocusCoord - positiveScrollBoundary;
		
	}
	else if (axisFocusCoord < negativeScrollBoundary) {
		scrollAmount = axisFocusCoord - negativeScrollBoundary;		
	}
	
	return scrollAmount;
}

LevelScrollManager.prototype.scrollSpaceVisibleRect = function () {
	return new Rectangle(this.viewPortCenterPointX - (this.viewPortSizeX / 2.0),
		this.viewPortCenterPointY - (this.viewPortSizeY / 2.0),
		this.viewPortSizeX,
		this.viewPortSizeY);
}