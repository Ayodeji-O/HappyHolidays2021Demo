// LevelRepresentation.js - Encapsulates a single level representation, encoding details regarding the
//                          arrangement of level items and item attributes
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -SpatialLevelRepresentationParser.js
//  -Utility.js

function LevelRepresentation(levelParser) {
	this.tileSymbolAttributeCollection = null;
	this.levelTileRowCollection = null;
	
	// Unit coordinate system - axis extents range from
	// -1.0 - 1.0.
	this.constVisibleAreaWidth = 2.0;
	this.constVisibleAreaHeight = 2.0;
	
	// The scale factor is used to compute the size of a
	// single tile within a unit coordinate space
	// viewing area (unit coordinate space area includes
	// negative values, resulting in a width/height of
	// the viewing area of 2.0 times the specified scale
	// factor).
	this.levelScaleFactorX = 1.0;
	this.levelScaleFactorY = 1.0;
	this.levelScaleFactorZ = 1.0;
	
	// Starting position within the level (will ultimately
	// contain a non-null value of LevelGridPosition
	// type, if the parsed input contains a starting
	// position
	// @see LevelGridPosition
	this.startPosition = null;
	
	this.guideLightIntensity = null;
	
	this.timeDurationMultiplier = 1.0;
	
	this.dynamicInstanceInfoCollection = null;
	
	if (Utility.validateVar(levelParser)) {
		this.tileSymbolAttributeCollection = levelParser.tileSymbolAttributeCollection;
		this.levelTileRowCollection = levelParser.levelTileRowCollection;		

		if (typeof levelParser.levelBackdropSpecifier !== "undefined") {
			this.levelBackdropSpecifier = levelParser.levelBackdropSpecifier;
		}

		if (typeof levelParser.startPosition !== "undefined") {
			this.startPosition = levelParser.startPosition;
		}

		if (typeof levelParser.guideLightIntensity !== "undefined") {
			this.guideLightIntensity = levelParser.guideLightIntensity;
		}
		
		if (typeof levelParser.timeDurationMultiplier !== "undefined") {
			this.timeDurationMultiplier = levelParser.timeDurationMultiplier;
		}
		
		this.dynamicInstanceInfoCollection = levelParser.dynamicInstanceInfoCollection;
	}	
}

/**
 * Determine the offset required in order to situate the
 *  lower left-hand corner of the first level tile
 *  of the first level row at the location (-1.0, -1.0) in the
 *  X-Y plane
 *
 * @return {Point3d} An offset required to situate the lower left-
 *                   hand corner of the first level tile of the
 *                   first level row at the location (-1.0, -1.0) in the
 *                   X-Y plane
 */
LevelRepresentation.prototype.computeInitialTileOffset = function() {
	var tileOffset = new Point3d(0.0, 0.0, 0.0);
	
	if (this.levelTileRowCollection !== null) {
		// The visible area is treated as a unit coordinate system,
		// where the (X,Y) coordinate (0.0, 0.0) is the center of
		// the visible area. Using the scale factor, compute an offset
		// such that the first tile of the last row has its lower-left
		// corner situated at (-1.0, -1.0).
		
		var offsetX = this.getEdgeAlignedLevelOffsetMinX();
		var offsetY = this.getEdgeAlignedLevelOffsetMinY();
		
		tileOffset = new Point3d(offsetX, offsetY, 0.0);		
	}
	
	return tileOffset;
}

/**
 * Returns the offset along the X-axis required to align the left edge of
 *  the first level column at the coordinate -1.0 along the X-axis
 *
 * @return {Number} The offset required to align the left edge of the
 *                  first level column at the coordinate -1.0 along the
 *                  X-axis
 */
LevelRepresentation.prototype.getEdgeAlignedLevelOffsetMinX = function() {
	return -1.0 + (this.levelScaleFactorX / 2.0);
}
 
 /**
 * Returns the offset along the X-axis required to align the right edge of
 *  the last level column at the coordinate 1.0 along the X-axis
 *
 * @return {Number} The offset required to align the right edge of the
 *                  last level column at the coordinate 1.0 along the
 *                  X-axis
 */
LevelRepresentation.prototype.getEdgeAlignedLevelOffsetMaxX = function() {
	return -((this.getTileGridWidth() * this.levelScaleFactorX) - 1.0) - (this.levelScaleFactorX / 2.0);
}

/**
 * Returns the offset along the Y-axis required to align the bottom edge of
 *  the bottom level row at the coordinate -1.0 along the Y-axis
 *
 * @return {Number} The offset required to align the left edge of the
 *                  first level column at the coordinate -1.0 along the
 *                  X-axis
 */
LevelRepresentation.prototype.getEdgeAlignedLevelOffsetMinY = function() {
	return -1.0 + (this.levelScaleFactorY / 2.0);	
}

/**
 * Returns the offset along the Y-axis required to align the top edge of
 *  the top level row at the coordinate 1.0 along the Y-axis
 *
 * @return {Number} The offset required to align the top edge of the
 *                  top level column at the coordinate -1.0 along the
 *                  Y-axis
 */
LevelRepresentation.prototype.getEdgeAlignedLevelOffsetMaxY = function() {
	return -((this.getTileGridHeight() * this.levelScaleFactorY) - 1.0) - (this.levelScaleFactorY / 2.0)
}


/**
 * Sets the level scale factors - these values effectively determine
 *  the dimensions of each level tile (dimensionless units)
 *
 * @param scaleFactorX {Number} Scalefactor along the X-axis
 * @param scaleFactorY {Number} Scalefactor along the Y-axis 
 * @param scaleFactorZ {Nubmer} Scalefactor along the Z-axis
 */
LevelRepresentation.prototype.setScaleFactors = function (scaleFactorX, scaleFactorY, scaleFactorZ) {	
	if (Utility.validateVar(scaleFactorX)) {
		this.levelScaleFactorX = scaleFactorX;
	}

	if (Utility.validateVar(scaleFactorY))  {
		this.levelScaleFactorY = scaleFactorY;
	}
	
	if (Utility.validateVar(scaleFactorZ))  {
		this.levelScaleFactorZ = scaleFactorZ;
	}	
}

/**
 * Returns rectangle which indicates the range of row/column indices expressed within
 *  the constrained coordinate range of within the range of (-1.0 - 1.0) along the X-axis,
 *  and (-1.0 - 1.0) along the Y-axis. Indices of rows within the grid increase upwards,
 *  with the bottom row being designated as index 0.
 * 
 * @param offsetX {Number} Offset applied to the level representation along the X-axis
 * @param offsetY {Number} Offset applied to the level representation along the Y-axis
 *
 * @return {Rectangle} A rectangle indicating the range of indices
 */
LevelRepresentation.prototype.getVisibleTileRegionTileIndexGridRect = function (offsetX, offsetY) {
	var visibleRegionGridRect = new Rectangle(0, 0, 0, 0);

	if (Utility.validateVar(offsetX) && Utility.validateVar(offsetY)) {
		var centerColumnIndexFromOffset = Math.round(-offsetX / this.levelScaleFactorX);
		var centerRowIndexFromOffset = Math.round(-offsetY / this.levelScaleFactorY);
		
		var visibleAreaTileColumnCount = this.constVisibleAreaWidth / this.levelScaleFactorX;
		var visibleAreaTileRowCount = this.constVisibleAreaHeight / this.levelScaleFactorY;

		// Row/column indices are assessed from the center of the tile.
		// The standard grid is located using the first tile of the
		// bottom row as a reference - the center of this tile
		// is situated at the origin.
		var leftEdge = Math.floor(Math.max(0.0, centerColumnIndexFromOffset - (visibleAreaTileColumnCount / 2.0)));
		var rightEdge = Math.round(Math.min(this.getTileGridWidth() - 1, centerColumnIndexFromOffset + (visibleAreaTileColumnCount / 2.0)));
		var topEdge = Math.round(Math.min(this.getTileGridHeight() - 1, centerRowIndexFromOffset + (visibleAreaTileRowCount / 2.0)));
		var bottomEdge = Math.floor(Math.max(0.0, centerRowIndexFromOffset - (visibleAreaTileRowCount / 2.0)));

		visibleRegionGridRect = new Rectangle(leftEdge, topEdge, (rightEdge - leftEdge), (topEdge - bottomEdge));		
	}

	return visibleRegionGridRect;
}

/**
 * Returns the bounding rectangle in the X-Y plane, given a specific
 *  level offset
 *
 * @param tileRowIndex {Number} Index of the tile row within the level tile grid
 * @param tileColumnIndex {Number} Index of the tile column within the level tile grid
 * @param offsetX {Number} Offset applied to the level representation along the X-axis
 *                         (view space)
 * @param offsetY {Number} Offset applied to the level representation along the Y-axis
 *                         (view space)
 *
 * @return {Rectangle} Bounding rectangle within the X-Y plane
 */
LevelRepresentation.prototype.getTileRectInLevelSpace = function(tileRowIndex, tileColumnIndex, offsetX, offsetY) {
	var tileRect = new Rectangle(0, 0, 0, 0);
	
	if (Utility.validateVar(tileRowIndex) && Utility.validateVar(tileColumnIndex)) {
		var tileCenterAtStdOriginX = tileColumnIndex * this.levelScaleFactorX;
		var tileCenterAtStdOriginY = tileRowIndex * this.levelScaleFactorY;
		
		var tileCenterWithOffsetX = tileCenterAtStdOriginX + offsetX;
		var tileCenterWithOffsetY = tileCenterAtStdOriginY + offsetY;
		
		tileRect = new Rectangle(tileCenterWithOffsetX - this.levelScaleFactorX / 2.0,
			tileCenterWithOffsetY + this.levelScaleFactorY / 2.0,
			this.levelScaleFactorX,
			this.levelScaleFactorY);
	}
	
	return tileRect;
}

/**
 * Returns the tile type associated with the tile at the provided
 *  level tile grid location (a tile type is associated with
 *  a specific set of tile attributes)
 *
 * @param tileRowIndex {Number} Index of the tile row within the level tile grid
 * @param tileColumnIndex {Number} Index of the tile column within the level tile grid
 *
 * @param {Number} Tile type identifier 
 */
LevelRepresentation.prototype.getTileTypeAtPosition = function (tileRowIndex, tileColumnIndex) {
	var tileType = null;
	
	if (Utility.validateVar(tileRowIndex) && Utility.validateVar(tileColumnIndex)) {
		if ((tileRowIndex >= 0) && (tileRowIndex < this.levelTileRowCollection.length)) {
			if ((tileColumnIndex >= 0) && (tileColumnIndex < this.levelTileRowCollection[tileRowIndex].length)) {
				tileType = this.levelTileRowCollection[tileRowIndex][tileColumnIndex];
			}	
		}
	}
	
	return tileType;
}

LevelRepresentation.prototype.getTileColumnIndexForLevelSpaceCoordX = function (coordX, offsetX) {
	var columnIndex = 0;
	
	if (Utility.validateVar(coordX) && Utility.validateVar(offsetX)) {
		// Tile column/row indices are based on the location of the center point of
		// the tile - shift the tile column computation by 0.5 tiles in order to
		// properly reflect this reference point.
		var normalizedColumnRefCoordX = (coordX + (this.levelScaleFactorX / 2.0)) - offsetX;
		columnIndex = Math.floor(normalizedColumnRefCoordX / this.levelScaleFactorX);
	}
	
	return columnIndex;
}

LevelRepresentation.prototype.getTileRowIndexForLevelSpaceCoordY = function (coordY, offsetY) {
	var rowIndex = 0;
	
	if (Utility.validateVar(coordY) && Utility.validateVar(offsetY)) {
		// Tile column/row indices are based on the location of the center point of
		// the tile - shift the tile column computation by 0.5 tiles in order to
		// properly reflect this reference point.		
		var normalizedColumnRefCoordY = (coordY + (this.levelScaleFactorY / 2.0)) - offsetY;
		rowIndex = Math.floor(normalizedColumnRefCoordY / this.levelScaleFactorY);
	}		
	
	return rowIndex;
}

/**
 * Returns the attributes associated with the specified tile type
 * 
 * @param tileType {Number} Tile type identifier
 *
 * @return {Object} Object containing attributes associated with the level tile type
 */
LevelRepresentation.prototype.getTileTypeAttributes = function (tileType) {
	var tileTypeAttributes = null;
	
	if (Utility.validateVar(tileType) && (tileType < this.tileSymbolAttributeCollection.length) &&
		(typeof tileType === "number")) {
		
		tileTypeAttributes = this.tileSymbolAttributeCollection[tileType];
	}
	
	return tileTypeAttributes;
}

/**
 * Returns the attributes associated with the specified tile type
*   at the provided level tile grid location 
 *
 * @param tileRowIndex {Number} Index of the tile row within the level tile grid
 * @param tileColumnIndex {Number} Index of the tile column within the level tile grid
 *
 * @return {Object} Object containing attributes associated with the level tile type
 */
LevelRepresentation.prototype.getTileAttributesForTileAtPosition = function(tileRowIndex, tileColumnIndex) {
	var tileAttributes = null;
	
	if (Utility.validateVar(tileRowIndex) && Utility.validateVar(tileColumnIndex)) {
		var tileType = this.getTileTypeAtPosition(tileRowIndex, tileColumnIndex);
		if (tileType != null) {
			tileAttributes = this.getTileTypeAttributes(tileType);			
		}		
	}
	
	return tileAttributes;
}

/**
 * Returns the maximum level tile row width
 *
 * @return {Number} Width of the longest level tile row
 */
LevelRepresentation.prototype.getTileGridWidth = function () {
	var tileGridWidth = 0;

	if (this.levelTileRowCollection !== null) {
		for (var currentRow = 0; currentRow < this.levelTileRowCollection.length; currentRow++) {
			tileGridWidth = Math.max(tileGridWidth, this.levelTileRowCollection[currentRow].length);
		}
	}

	return tileGridWidth;
}

/**
 * Returns the maximum level tile column height
 *
 * @return {Number} Height of the longest level tile
 *                  column
 */
LevelRepresentation.prototype.getTileGridHeight = function() {
	var tileGridHeight = 0;
	
	if (this.levelTileRowCollection !== null) {
		tileGridHeight = this.levelTileRowCollection.length;		
	}
	
	return tileGridHeight;	
}

/**
 * Creates a level tile, storing the tile representation at the
 *  provided row/column index within the level store that
 *  represents empty space within a level
 *
 * @return True upon success (row/column indices must be
 *         valid)
 */
LevelRepresentation.prototype.makeTileEmptySpaceTile = function (tileRowIndex, tileColumnIndex) {
	var stateAppliedSuccessfully = false;
	
	if ((tileRowIndex < this.levelTileRowCollection.length ) &&
		(tileColumnIndex < this.levelTileRowCollection[tileRowIndex].length)) {
			
		// The first tile type represents empty space.
		this.levelTileRowCollection[tileRowIndex][tileColumnIndex] = this.tileSymbolAttributeCollection[0];
	}
	
	return stateAppliedSuccessfully;
}

/**
 * Returns the unitless grid tile size, encompassing the
 *  entire, represented coordinate space
 *
 * @return {Size2d} Unitless grid dimensions
 */
LevelRepresentation.prototype.getTileGridDimensions = function () {
	var widthwiseTileCount = this.getTileGridWidth() * this.levelScaleFactorX;
	var heightwiseTileCount = this.getTileGridHeight() * this.levelScaleFactorY;
	
	return new Size2d(widthwiseTileCount, heightwiseTileCount);
}