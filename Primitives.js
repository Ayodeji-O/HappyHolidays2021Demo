// Primitives.js - Defines basic coordinate/geometric primitives (coordinates are in screen
//                 coordinates, where the origin is located at the upper-left hand corner of
//                 the screen, with increasing Y coordinates progressing downwards)
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -RgbColor.js

///////////////////////////////////////
// Size2d object
///////////////////////////////////////

function Size2d(xDelta, yDelta) {
	this.xDelta = xDelta;
	this.yDelta = yDelta;
}

///////////////////////////////////////
// Point2d object
///////////////////////////////////////

function Point2d(xCoord, yCoord) {
	this.xCoord = xCoord;
	this.yCoord = yCoord;
}

/**
 * Retrieves the X coordinate of the point
 * @return The X coordinate of the point
 */
Point2d.prototype.getX = function() {
	return this.xCoord;
}

/**
 * Retrieves the Y coordinate of the point
 * @return The Y coordinate of the point
 */
Point2d.prototype.getY = function() {
	return this.yCoord;
}

/**
 *  Displaces the represented 2D point
 *   representation by the specified amounts
 *  
 *  @param offsetX {number} Description for offsetX
 *  @param offsetY {number} Description for offsetY
 */
Point2d.prototype.offset = function(offsetX, offsetY) {
	if ((typeof(offsetX) === "number") && (typeof(offsetY) === "number")) {
		this.xCoord += offsetX;
		this.yCoord += offsetY;
	}
}

/**
 * Computes the position of the point if it were to be rotated around
 *  another point, and returns the result as a copy of the
 *  represented point
 * @param rotationCenterPoint {point} Reference point that will be
 *                            used as the rotation center
 * @param degrees Degress of rotation, in radians
 * @return {point} The newly rotated point
 */
Point2d.prototype.rotatePointCopy = function(rotationCenterPoint, degrees) {
	// Rotate the point around the center point, using
	// the two-dimensional rotation formula:
	// x' = (x - x.pivot) · cos(a) - (y - y.pivot) · sin(a) + x.pivot
	// y' = (y - y.pivot) · cos(a) + (x - x.pivot) · sin(a) + y.pivot
	var cosTheta = Math.cos(degrees);
	var sinTheta = Math.sin(degrees);
	
	var newX = 
		((this.xCoord - rotationCenterPoint.getX()) * cosTheta) -
		((this.yCoord - rotationCenterPoint.getY()) * sinTheta) + rotationCenterPoint.getX();
	var newY = 
		((this.yCoord - rotationCenterPoint.getY()) * cosTheta) +        
		((this.xCoord - rotationCenterPoint.getX()) * sinTheta) + rotationCenterPoint.getY();

	// Return the rotated point as a new point object, rather than modifying the
	// existing point object.
	return new Point2d(newX, newY);
}


///////////////////////////////////////
// Point3d object
///////////////////////////////////////

function Point3d(xCoord, yCoord, zCoord) {
	this.xCoord = xCoord;
	this.yCoord = yCoord;
	this.zCoord = zCoord;
}

/**
 * Retrieves the X coordinate of the point
 * @return The X coordinate of the point
 */
Point3d.prototype.getX = function() {
	return this.xCoord;
}

/**
 * Retrieves the Y coordinate of the point
 * @return The Y coordinate of the point
 */
Point3d.prototype.getY = function() {
	return this.yCoord;
}

/**
 * Retrieves the Z coordinate of the point
 * @return The Z coordinate of the point
 */
Point3d.prototype.getZ = function() {
	return this.zCoord;
}

/**
 *  Displaces the represented 3D point
 *   representation by the specified amounts
 *  
 *  @param offsetX {number} Description for offsetX
 *  @param offsetY {number} Description for offsetY
 *  @param offsetZ {number} Description for offsetZ
 */
Point3d.prototype.offset = function(offsetX, offsetY, offsetZ) {
	if ((typeof(offsetX) === "number") && (typeof(offsetY) === "number") && (typeof(offsetZ) === "number")) {
		this.xCoord += offsetX;
		this.yCoord += offsetY;
		this.zCoord += offsetZ;
	}
}

/**
 *  Determines the distance between the represented
 *   point and a second point
 *  
 *  @param secondPoint {Point3d} The point for which the distance is
 *                               to be determined in relation to the
 *                               represented point
 *  @return {number} Distance between the two points upon success, zero
 *                   otherwise
 */
Point3d.prototype.distanceFrom = function(secondPoint) {
	var distance = 0.0;

	if (Utility.validateVarAgainstType(secondPoint, Point3d)) {
		var deltaX = this.xCoord - secondPoint.getX();
		var deltaY = this.yCoord - secondPoint.getY();
		var deltaZ = this.zCoord - secondPoint.getZ();
		distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
	}

	return distance;
}

///////////////////////////////////////
// Vector object
///////////////////////////////////////

function Vector(xComponent, yComponent) {
	this.xComponent = xComponent;
	this.yComponent = yComponent;
}

Vector.prototype.getXComponent = function() {
	return this.xComponent;
}

Vector.prototype.getYComponent = function() {
	return this.yComponent;
}

Vector.prototype.magnitude = function() {
	return Math.sqrt((this.xComponent * this.xComponent) +
		(this.yComponent * this.yComponent));
}

Vector.prototype.dotProduct = function(secondVector) {
	// Vector dot product is computed using the following
	// equation (given two vectors, a and b):
	// a·b = a_x  x  b_x + a_y  x  b_y
	// Where a_x and b_x are the x-components for the first
	// and second vectors, respectively, and a_y and b_y are
	// the y-components for the first and second vectors, respectively.
	// Source: Math is Fun website, vectors section
	// http://www.mathsisfun.com/algebra/vectors.html
	return ((this.getXComponent() * secondVector.getXComponent()) +
		(this.getYComponent() * secondVector.getYComponent()));
}


///////////////////////////////////////
// 3D vector object
///////////////////////////////////////

function Vector3d(xComponent, yComponent, zComponent) {
	this.xComponent = xComponent;
	this.yComponent = yComponent;
	this.zComponent = zComponent;
}

/**
 *  Determines if the 3D Vector representation is valid
 *  
 *  @return {boolean} True if the representation is valid
 */
Vector3d.prototype.isValid = function() {
	return ((typeof(this.xComponent) == "number") &&
		(typeof(this.yComponent) == "number") &&
		(typeof(this.zComponent) == "number"));
}

Vector3d.prototype.getXComponent = function() {
	return this.xComponent;
}

Vector3d.prototype.getYComponent = function() {
	return this.yComponent;
}

Vector3d.prototype.getZComponent = function() {
	return this.zComponent;
}

/**
 *  Add a vector to the vector representation, and returns
 *   the result (the original, represented vector remains
 *   unchanged)
 *  
 *  @param secondVector3d {Vector3d} Vector to be added
 *  @return {Vector3d} The result of adding the vector to
 *          the receiving representation
 */
Vector3d.prototype.addVector = function(secondVector3d) {
	var newVector3d = new Vector3d(this.xComponent, this.yComponent, this.zComponent);
	
	if (Utility.validateVarAgainstType(secondVector3d, Vector3d)) {
		newVector3d.xComponent += secondVector3d.xComponent;
		newVector3d.yComponent += secondVector3d.yComponent;		
		newVector3d.zComponent += secondVector3d.zComponent;		
	}
	
	return newVector3d;
}

/**
 *  Subtracts a vector to the vector representation, and returns
 *   the result (the original, represented vector remains
 *   unchanged)
 *  
 *  @param secondVector3d {Vector3d} Vector to be subtracted
 *  @return {Vector3d} The vector result of subtracting the
 *          vector to the receiving representation
 */
Vector3d.prototype.subtractVector = function(secondVector3d) {
	var newVector3d = new Vector3d(this.xComponent, this.yComponent, this.zComponent);
	
	if (Utility.validateVarAgainstType(secondVector3d, Vector3d)) {
		newVector3d.xComponent -= secondVector3d.xComponent;
		newVector3d.yComponent -= secondVector3d.yComponent;		
		newVector3d.zComponent -= secondVector3d.zComponent;		
	}
	
	return newVector3d;
}

/**
 *  Multiplies the vector representation by a scalar, and
 *   returns the result (the original, represented vector
 *   remains unchanged)
 *  
 *  @param scalarValue {number} Scalar value by which the vector
 *                              will be multiplied
 *  @return {Vector3d} The vector result of multiplying the vector by a
 *          scalar
 */
Vector3d.prototype.multiplyByScalar = function(scalarValue) {
	var newVector3d = new Vector3d(this.xComponent, this.yComponent, this.zComponent);
	
	if (typeof(scalarValue) === "number") {
		newVector3d.xComponent = this.xComponent * scalarValue;
		newVector3d.yComponent = this.yComponent * scalarValue;
		newVector3d.zComponent = this.zComponent * scalarValue;
	}
	
	return newVector3d
}

Vector3d.prototype.getPoint3dRep = function() {
	return new Point3d(this.xComponent, this.yComponent, this.zComponent);
}

Vector3d.prototype.magnitude = function() {
	return Math.sqrt((this.xComponent * this.xComponent) +
		(this.yComponent * this.yComponent) +
		(this.zComponent * this.zComponent));
}

/**
 *  Normalizes the represented vector
 */
Vector3d.prototype.normalize = function() {
	var originalMagnitude = this.magnitude();
	
	if (originalMagnitude > 0.0) {
		this.xComponent /= originalMagnitude;
		this.yComponent /= originalMagnitude;
		this.zComponent /= originalMagnitude;
	}
}

Vector3d.prototype.dotProduct = function (secondVector3d) {
	var dotProduct = 0.0;
	
	if (Utility.validateVarAgainstType(secondVector3d, Vector3d)) {
		dotProduct = (this.xComponent * secondVector3d.xComponent) +
			(this.yComponent * secondVector3d.yComponent) +
			(this.zComponent * secondVector3d.zComponent)
	}
	
	return dotProduct;
}

Vector3d.prototype.crossProduct = function (secondVector3d) {
	var crossProduct = new Vector3d(0.0, 0.0, 0.0);
	
	if (Utility.validateVarAgainstType(secondVector3d, Vector3d)) {
		// Vector cross product, computed from the following equation:
		// u x v = x(u_y x v_z - u_z * v_y) + y(u_z x v_x - u_x * v_z) + 
		//         z(u_x x v_y - u_y * v_x)
		// Where u and x are the vectors for which the cross product is
		// to be determined, u_x, u_y, and u_z are the components for
		// vector u; v_x, v_y, and v_z are the components for
		// vector v; x, y and z are the orthonormal basis vectors
		// (unit vectors parallel with the x, y and z axes, respectively
		// Source: Wolfram Mathworld - Cross Product
		// http://mathworld.wolfram.com/CrossProduct.html
		var xComponent = this.getYComponent() * secondVector3d.getZComponent() -
			this.getZComponent() * secondVector3d.getYComponent()
		var yComponent = this.getZComponent() * secondVector3d.getXComponent() -
			this.getXComponent() * secondVector3d.getZComponent();
		var zComponent = this.getXComponent() * secondVector3d.getYComponent() -
			this.getYComponent() * secondVector3d.getXComponent();
			
		crossProduct = new Vector3d(xComponent, yComponent, zComponent);
	}
	
	return crossProduct;
}

///////////////////////////////////////
// Rectangle object
///////////////////////////////////////

function Rectangle(left, top, width, height) {
	this.left = Utility.returnValidNumOrZero(left);
	this.top = Utility.returnValidNumOrZero(top);
	this.width = Math.abs(Utility.returnValidNumOrZero(width));
	this.height = Math.abs(Utility.returnValidNumOrZero(height));
}

/**
 * Returns the width of the rectangle
 * @return The width of the rectangle
 */
Rectangle.prototype.getWidth = function() {
	return this.width;
}

/**
 * Returns the height of the rectangle
 * @return The height of the rectangle
 */
Rectangle.prototype.getHeight = function() {
	return this.height;
}

/**
 * Returns the top-left point of the rectangle
 * @return {point} The top-left point of the rectangle
 */
Rectangle.prototype.getTopLeft = function() {
	return new Point2d(this.left, this.top);
}

/**
 * Returns the center point of the rectangle - assumes a
 *  coordinate system with increasing Y coordinate values
 *  as the Y-position progress upwards (opposite of
 *  traditional raster rendering convention)
 * @return {point} The center point of the rectangle
 */
Rectangle.prototype.getCenter = function() {
	return new Point2d(this.left + (this.width / 2.0), this.top - (this.height / 2.0));
}

/**
 * Sets the top-left point of the rectangle
 * @param topLeftPoint {point} The point that will become
 *                      the top-left point of the rectangle
 */
Rectangle.prototype.setTopLeft = function(topLeftPoint) {
	if (Utility.validateVar(topLeftPoint)) {
		this.left = topLeftPoint.getX();
		this.top = topLeftPoint.getY();
	}
}

/**
 * Displaces the rectangle by the specified amount
 * @param deltaX The amount along the X-coordinate by which
 *               the rectangle should be displaced
 * @param deltaY The amount along the Y-coordinate by which
 *               the rectangle should be displaced 
 */
Rectangle.prototype.move = function(deltaX, deltaY) {
	this.left += Utility.returnValidNumOrZero(deltaX);
	this.top += Utility.returnValidNumOrZero(deltaY);
}

/**
 * Duplicates the rectangle, applying an offset to the
 *  duplicated rectangle
 *
 * @param deltaX {number} The amount along the X-coordinate by which
 *                        the rectangle should be displaced
 * @param deltaY {number} The amount along the Y-coordinate by which
 *                        the rectangle should be displaced 
 *
 * @return {Rectangle} A duplicate of the represented rectangle
 *                     that has the applied offset
 */
Rectangle.prototype.rectWithOffset = function(deltaX, deltaY) {
	return new Rectangle(this.left + deltaX, this.top + deltaY, this.width, this.height);
}

/**
 * Determines if the represented rectangle intersects
 *  another rectangle
 *
 * @param rectangle {Rectangle} The rectangle that is to be tested
 *                              for intersection
 *	
 * @return {boolean} True if the rectangles intersect 
 */
Rectangle.prototype.intersectsRect = function(rectangle) {
	var rectsIntersect = false;
	
	if (Utility.validateVarAgainstType(rectangle, Rectangle)) {	
		var rightEdge = this.left + this.getWidth();
		var bottomEdge = this.top - this.getHeight();
		
		var secondRectRightEdge = rectangle.left + rectangle.getWidth();
		var secondRectBottomEdge = rectangle.top - rectangle.getHeight();
		
		var containsLeftEdge = (this.left <= rectangle.left) &&
			(rightEdge >= rectangle.left);
		var containsRightEdge = (this.left <= secondRectRightEdge) &&
			(rightEdge >= secondRectRightEdge);
			
		var containsTopEdge = (this.top >= rectangle.top) &&
			(bottomEdge <= rectangle.top);
		var containsBottomEdge = (this.top >= secondRectBottomEdge) &&
			(bottomEdge <= secondRectBottomEdge);


		var leftEdgeIsContained = (rectangle.left <= this.left) &&
			(secondRectRightEdge >= this.left);
		var rightEdgeIsContained = (rectangle.left <= this.right) &&
			(secondRectRightEdge >= rightEdge);
		
		var topEdgeIsContained = (rectangle.top >= this.top) &&
			(secondRectBottomEdge <= this.top);
		var bottomEdgeIsContained = (rectangle.top >= bottomEdge) &&
			(secondRectBottomEdge <= bottomEdge);
		
		rectsIntersect =
			((containsLeftEdge && containsTopEdge) || (containsLeftEdge && containsBottomEdge)) ||
			((containsRightEdge && containsTopEdge) || (containsRightEdge && containsBottomEdge)) ||
			
			((leftEdgeIsContained && topEdgeIsContained) || (leftEdgeIsContained && bottomEdgeIsContained)) ||
			((rightEdgeIsContained && topEdgeIsContained) || (rightEdgeIsContained && bottomEdgeIsContained));
	}
	
	return rectsIntersect;
}


///////////////////////////////////////
// Vertex3d object
///////////////////////////////////////

function Vertex3d(xCoord, yCoord, zCoord) {
	Point3d.call(this, xCoord, yCoord, zCoord);
	
	this.normalVector = new Vector3d(0.0, 0.0, 0.0);
	this.surfaceU = 0.0;
	this.surfaceV = 0.0;
	this.rgbColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
}

Vertex3d.prototype = new Point3d();

Vertex3d.prototype.setCoordFromPoint = function(point3d) {
	if (Utility.validateVarAgainstType(point3d, Point3d)) {
		this.xCoord = point3d.getX();
		this.yCoord = point3d.getY();
		this.zCoord = point3d.getZ();		
	}
}

Vertex3d.prototype.getNormalVector = function(normalVector3d) {
	return this.normalVector;
}

Vertex3d.prototype.setNormalVector = function(normalVector3d) {
	if (Utility.validateVarAgainstType(normalVector3d, Vector3d)) {
		this.normalVector = normalVector3d;
	}
}

Vertex3d.prototype.getColor = function () {
	return this.rgbColor;
}

Vertex3d.prototype.setColor = function(rgbColor) {
	if (Utility.validateVarAgainstType(rgbColor, RgbColor)) {
		this.rgbColor = rgbColor;
	}
}

Vertex3d.prototype.getSurfaceMappingCoords = function () {
	var surfaceMappingCoords = new Vector(this.surfaceU, this.surfaceV);
	
	return surfaceMappingCoords;
}

Vertex3d.prototype.setSurfaceMappingCoords = function(surfaceU, surfaceV) {
	if ((typeof(surfaceU) === "number") && (typeof(surfaceV) === "number")) {		
		this.surfaceU = surfaceU;
		this.surfaceV = surfaceV;
	}
}


///////////////////////////////////////
// Triangle object
///////////////////////////////////////

function Triangle(firstVertex3d, secondVertex3d, thirdVertex3d) {
	
	if (Utility.validateVarAgainstType(firstVertex3d, Vertex3d) &&
		Utility.validateVarAgainstType(secondVertex3d, Vertex3d) &&
		Utility.validateVarAgainstType(thirdVertex3d, Vertex3d)) {
			
		this.firstVertex3d = firstVertex3d;
		this.secondVertex3d = secondVertex3d;
		this.thirdVertex3d = thirdVertex3d;
	}
}

Triangle.prototype.isValid = function() {
	return (Utility.validateVarAgainstType(this.firstVertex3d, Vertex3d) &&
		Utility.validateVarAgainstType(this.secondVertex3d, Vertex3d) &&
		Utility.validateVarAgainstType(this.thirdPoint3d, Vertex3d));
}

Triangle.prototype.getFirstVertex = function() {
	return this.firstVertex3d;
}

Triangle.prototype.getSecondVertex = function () {
	return this.secondVertex3d;
}

Triangle.prototype.getThirdVertex = function () {
	return this.thirdVertex3d;
}





