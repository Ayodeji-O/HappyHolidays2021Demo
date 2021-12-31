// TessellatedGeometryGenerators.js - Provides implementations for a set of rudimentary
//                                    objects which generate tessellated geometric
//                                    representations
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Primitives.js
//  -MathExtMatrix.js
//  -PrimitivesUtility.js


///////////////////////////////////////
// TessellatedSphereGenerator object
///////////////////////////////////////

function TessellatedSphereGenerator(radius, centerPoint) {
	var constDefaultLongSegmentCount = 20.0;
	var constDefaultLatSegmentCount = 20.0;
	
	this.sphereRadius = radius;
	this.centerPoint = centerPoint;
	this.longitudinalSegmentCount = constDefaultLongSegmentCount;
	this.latitudinalSegmentCount = constDefaultLatSegmentCount;
	this.sphereColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	
	this.triangleStore = [];
}

/**
 *  Sets the number of vertical sphere segments
 *  
 *  @param segmentCount {number} The number of vertical sphere segments
 *                               to be generated (should be invoked before
 *                               invoking TessellatedSphereGenerator.generateGeometry())
 *  @see TessellatedSphereGenerator.generateGeometry()
 */
TessellatedSphereGenerator.prototype.setLongitudinalSegmentCount = function(segmentCount) {
	if (Utility.returnValidNumOrZero(segmentCount) > 0.0) {		
		this.longitudinalSegmentCount = segmentCount;
	}
}

/**
 *  Sets the number of horizontal sphere segments
 *  
 *  @param segmentCount {number} The number of horizontal sphere segments
 *                               to be generated (should be invoked before
 *                               invoking TessellatedSphereGenerator.generateGeometry())
 *  @see TessellatedSphereGenerator.generateGeometry()
 */
TessellatedSphereGenerator.prototype.setLatitudinalSegmentCount = function(segmentCount) {
	if (Utility.returnValidNumOrZero(segmentCount) > 0.0) {
		this.latitudinalSegmentCount = segmentCount;
	}
}

/**
 *  Sets the color to be associated with all vertices
 *   (should be invoked before invoking 
 *   TessellatedSphereGenerator.generateGeometry())
 *  
 *  @param rgbColor {RgbColor} Color to be associated with all vertices
 *  @see TessellatedSphereGenerator.generateGeometry()
 */
TessellatedSphereGenerator.prototype.setColor = function(rgbColor) {
	if (Utility.validateVarAgainstType(rgbColor, RgbColor)) {
		this.sphereColor = rgbColor;
	}
}

/**
 *  Validates the internal set of parameters used to generate the geometric
 *   representation
 *  
 *  @return True if the internal set of parameters is valid
 */
TessellatedSphereGenerator.prototype.areInternalParametersValid = function() {
	return (Utility.returnValidNumOrZero(this.sphereRadius) > 0) &&
		Utility.validateVarAgainstType(this.centerPoint, Point3d) &&
		(Utility.returnValidNumOrZero(this.longitudinalSegmentCount) > 0) &&
		(Utility.returnValidNumOrZero(this.latitudinalSegmentCount) > 0);
}

/**
 *  Clears the triangle store used to provide the internal sphere
 *   representation
 */
TessellatedSphereGenerator.prototype.clearTriangleStore = function() {
	this.triangleStore.length = 0;
}

/**
 *  Returns a reference to the internal list of triangles that represent
 *   the geometry
 *  
 *  @return {Array} A list of triangles that represent the collection
 *          (Triangle objects)
 */
TessellatedSphereGenerator.prototype.getTriangleList = function() {
	return this.triangleStore;
}

/**
 *  Generates the geometric representation, and stores the geometry
 *   internally
 *  
 *  @return {Boolean} True if the geometric representation has been
 *          successfully generated
 */
TessellatedSphereGenerator.prototype.generateGeometry = function() {
	var generatedSuccessfully = false;
	
	if (this.areInternalParametersValid()) {
		this.clearTriangleStore();
		
		var radiusVector = new Vector3d(0.0, this.sphereRadius, 0.0);
		var topPoint = radiusVector.getPoint3dRep();
		
		var constMaxLongitude = 2 * Math.PI;
		var constMaxLatitude = Math.PI;
		
		var longitudinalDegreesPerSegment = constMaxLongitude / this.longitudinalSegmentCount;
		var latitudinalDegreesPerSegment = constMaxLatitude / this.latitudinalSegmentCount;
		
		var currentLatitude = 0;
		
		// Generate the sphere geometry, starting from the top
		// of the sphere.
		while (currentLatitude < constMaxLatitude) {
			
			var upperPoint = MathUtility.rotatePointAroundAxisZ(topPoint, currentLatitude);
			var lowerPoint = MathUtility.rotatePointAroundAxisZ(topPoint, currentLatitude + latitudinalDegreesPerSegment);
			
			var currentLongitude = 0;
			while (currentLongitude < constMaxLongitude) {				
				// ToDo: Correct leading/trailing terminology here...
				// Isolate a quad on the surface of the sphere using four points (two pairs of points
				// share a common latitude, while two pairs of points share a common longitude).
				var upperPointLeading = MathUtility.rotatePointAroundAxisY(upperPoint, currentLongitude);
				var lowerPointLeading = MathUtility.rotatePointAroundAxisY(lowerPoint, currentLongitude);
				var upperPointTrailing = MathUtility.rotatePointAroundAxisY(upperPoint,
					(currentLongitude + longitudinalDegreesPerSegment));
				var lowerPointTrailing = MathUtility.rotatePointAroundAxisY(lowerPoint,
					(currentLongitude + longitudinalDegreesPerSegment));

				// Generate surface normals, using a vector extending from the center of the
				// sphere to the point on the sphere surface.
				var upperNormalLeading = PrimitivesUtil.GenerateVector3dFromPoint3d(upperPointLeading);
				upperNormalLeading.normalize();
				var lowerNormalLeading = PrimitivesUtil.GenerateVector3dFromPoint3d(lowerPointLeading);
				lowerNormalLeading.normalize();
				var upperNormalTrailing = PrimitivesUtil.GenerateVector3dFromPoint3d(upperPointTrailing);
				upperNormalTrailing.normalize();
				var lowerNormalTrailing = PrimitivesUtil.GenerateVector3dFromPoint3d(lowerPointTrailing);
				lowerNormalTrailing.normalize();

				// Situate the points in a manner that enables the created sphere center point to
				// be coincident with the specified center point.
				upperPointLeading.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
				var upperVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(upperPointLeading);
				upperVertexLeading.setNormalVector(upperNormalLeading);
				lowerPointLeading.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
				var lowerVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(lowerPointLeading);
				lowerVertexLeading.setNormalVector(lowerNormalLeading);
				upperPointTrailing.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
				var upperVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(upperPointTrailing);
				upperVertexTrailing.setNormalVector(upperNormalTrailing);
				lowerPointTrailing.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
				var lowerVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(lowerPointTrailing);
				lowerVertexTrailing.setNormalVector(lowerNormalTrailing);
				
				// Create the surface/texture mapping coordinates for each vertex.
				upperVertexLeading.setSurfaceMappingCoords(currentLatitude / constMaxLatitude,
					currentLongitude / constMaxLongitude);
				lowerVertexLeading.setSurfaceMappingCoords(currentLatitude / constMaxLatitude,
					((currentLongitude / constMaxLongitude) + longitudinalDegreesPerSegment));
				upperVertexTrailing.setSurfaceMappingCoords(((currentLatitude / constMaxLatitude) + latitudinalDegreesPerSegment),
					currentLongitude / constMaxLongitude);
				lowerVertexTrailing.setSurfaceMappingCoords(((currentLatitude / constMaxLatitude) + latitudinalDegreesPerSegment),
					((currentLongitude / constMaxLongitude) + longitudinalDegreesPerSegment));
					
				upperVertexLeading.setColor(this.sphereColor);
				lowerVertexLeading.setColor(this.sphereColor);
				upperVertexTrailing.setColor(this.sphereColor);
				lowerVertexTrailing.setColor(this.sphereColor);
				
				// Front-facing polygons will have counter-clockwise vertex winding
				var firstTriangle = new Triangle(upperVertexLeading, lowerVertexLeading, lowerVertexTrailing);
				var secondTriangle = new Triangle(upperVertexLeading, lowerVertexTrailing, upperVertexTrailing);
				this.triangleStore.push(firstTriangle);
				this.triangleStore.push(secondTriangle);
				
				currentLongitude += longitudinalDegreesPerSegment;
			}

			currentLatitude += latitudinalDegreesPerSegment;
		}
		
		generatedSuccessfully = true;
	}
	
	return generatedSuccessfully;
}


///////////////////////////////////////
// TessellatedConeGenerator object
///////////////////////////////////////

function TessellatedConeGenerator(height, baseRadius, basePoint) {
	var constDefaultSegmentCount = 20;
	
	this.basePoint = basePoint;
	this.coneHeight = height;
	this.baseRadius = baseRadius;
	this.segmentCount = constDefaultSegmentCount;
	this.coneColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	
	this.triangleStore = [];
}

/**
 *  Sets the number of vertical cone segments
 *  
 *  @param segmentCount {number} The number of vertical cone segments
 *                               to be generated (should be invoked before
 *                               invoking TessellatedConeGenerator.generateGeometry())
 *  @see TessellatedConeGenerator.generateGeometry()
 */
TessellatedConeGenerator.prototype.setSegmentCount = function(segmentCount) {
	if (Utility.returnValidNumOrZero(segmentCount) > 0.0) {	
		this.segmentCount = segmentCount;
	}
}

/**
 *  Sets the color to be associated with all vertices
 *   (should be invoked before invoking 
 *   TessellatedConeGenerator.generateGeometry())
 *  
 *  @param rgbColor {RgbColor} Color to be associated with all vertices
 *  @see TessellatedConeGenerator.generateGeometry()
 */
TessellatedConeGenerator.prototype.setColor = function(rgbColor) {
	if (Utility.validateVarAgainstType(rgbColor, RgbColor)) {
		this.coneColor = rgbColor;
	}
}

/**
 *  Validates the internal set of parameters used to generate the geometric
 *   representation
 *  
 *  @return True if the internal set of parameters is valid
 */
TessellatedConeGenerator.prototype.areInternalParametersValid = function() {
	return (Utility.returnValidNumOrZero(this.coneHeight) > 0) &&
		Utility.validateVarAgainstType(this.basePoint, Point3d) &&
		(Utility.returnValidNumOrZero(this.baseRadius) > 0) &&
		(Utility.returnValidNumOrZero(this.segmentCount) > 0);
}

/**
 *  Clears the triangle store used to provide the internal cone
 *   representation
 */
TessellatedConeGenerator.prototype.clearTriangleStore = function() {
	this.triangleStore.length = 0;
}

/**
 *  Returns a reference to the internal list of triangles that represent
 *   the geometry
 *  
 *  @return {Array} A list of triangles that represent the collection
 *          (Triangle objects)
 */
TessellatedConeGenerator.prototype.getTriangleList = function() {
	return this.triangleStore;
}

/**
 *  Generates the geometric representation, and stores the geometry
 *   internally
 *  
 *  @return {Boolean} True if the geometric representation has been
 *          successfully generated
 */
TessellatedConeGenerator.prototype.generateGeometry = function() {
	var generatedSuccessfully = false;
	
	if (this.areInternalParametersValid()) {
		var constMaxDegreesRad = 2 * Math.PI;
		
		var degreesPerSegment = constMaxDegreesRad / this.segmentCount;

		var radiusVector = new Vector3d(0.0, 0.0, this.baseRadius);
		var edgePoint = radiusVector.getPoint3dRep();
		var topCenterPoint = new Point3d(0.0, this.coneHeight / 2.0, 0.0);
		topCenterPoint.offset(this.basePoint.getX(), this.basePoint.getY(), this.basePoint.getZ());
		var bottomCenterPoint = new Point3d(0.0, 0.0, 0.0);
		bottomCenterPoint.offset(this.basePoint.getX(), this.basePoint.getY(), this.basePoint.getZ());
		
		var bottomNormalVector = new Vector3d(0.0, -1.0, 0.0);
		
		var currentDegreesRad = 0.0;
		
		while (currentDegreesRad < constMaxDegreesRad) {
			// Isolate a triangle on the surface of the cone using three points (a triangle
			// will also be isolated on the bottom of the cone.
			var rotatedBaseEdgePointTrailing = MathUtility.rotatePointAroundAxisY(edgePoint, currentDegreesRad);
			var rotatedBaseEdgePointLeading = MathUtility.rotatePointAroundAxisY(
				edgePoint, (currentDegreesRad + degreesPerSegment));

			var normalLeading = PrimitivesUtil.GenerateVector3dFromPoint3d(rotatedBaseEdgePointLeading);
			normalLeading.normalize();
			var normalTrailing = PrimitivesUtil.GenerateVector3dFromPoint3d(rotatedBaseEdgePointTrailing);
			normalTrailing.normalize();

			var topCenterVertex = PrimitivesUtil.GenerateVertex3dFromPoint3d(topCenterPoint);
			
			var bottomCenterVertex = PrimitivesUtil.GenerateVertex3dFromPoint3d(bottomCenterPoint);

			var leadingEdgeAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(topCenterPoint);
			var trailingEdgeAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(topCenterPoint);
			var bottomLeadingPointAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(rotatedBaseEdgePointLeading);
			var bottomTrailingPointAsVector = PrimitivesUtil.GenerateVector3dFromPoint3d(rotatedBaseEdgePointTrailing);
			
			leadingEdgeAsVector.subtractVector(bottomLeadingPointAsVector);
			trailingEdgeAsVector.subtractVector(bottomTrailingPointAsVector);
			
			var topNormalVector = trailingEdgeAsVector.crossProduct(leadingEdgeAsVector);
			topNormalVector.normalize();
			
			rotatedBaseEdgePointLeading.offset(this.basePoint.getX(), this.basePoint.getY(), this.basePoint.getZ());
			rotatedBaseEdgePointTrailing.offset(this.basePoint.getX(), this.basePoint.getY(), this.basePoint.getZ());
			var edgeVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(rotatedBaseEdgePointLeading);
			var edgeVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(rotatedBaseEdgePointTrailing);
			var bottomVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(rotatedBaseEdgePointLeading);
			var bottomVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(rotatedBaseEdgePointTrailing);
			
			// Set the normal vectors for each point.
			topCenterVertex.setNormalVector(topNormalVector);
			edgeVertexLeading.setNormalVector(normalLeading);
			edgeVertexTrailing.setNormalVector(normalTrailing);
			bottomVertexLeading.setNormalVector(bottomNormalVector);
			bottomVertexTrailing.setNormalVector(bottomNormalVector);
			bottomCenterVertex.setNormalVector(bottomNormalVector)
			
			topCenterVertex.setColor(this.coneColor);
			edgeVertexLeading.setColor(this.coneColor);
			edgeVertexTrailing.setColor(this.coneColor);
			bottomVertexLeading.setColor(this.coneColor);
			bottomVertexTrailing.setColor(this.coneColor);
			bottomCenterVertex.setColor(this.coneColor)
			
			// Front-facing polygons will have counter-clockwise vertex winding
			var sideTriangle = new Triangle(edgeVertexTrailing, edgeVertexLeading, topCenterVertex);
			var bottomTriangle = new Triangle(bottomVertexTrailing, bottomCenterVertex, bottomVertexLeading);
			
			this.triangleStore.push(sideTriangle);
			this.triangleStore.push(bottomTriangle);
			
			currentDegreesRad += degreesPerSegment;
		}		
		
		generatedSuccessfully = true;
	}
	
	return generatedSuccessfully;
}


///////////////////////////////////////
// TessellatedCylinderGenerator object
///////////////////////////////////////

function TessellatedCylinderGenerator(height, radius, centerPoint) {
	var constDefaultSegmentCount = 20;
	
	this.centerPoint = centerPoint;
	this.cylinderHeight = height;
	this.cylinderRadius = radius;
	this.segmentCount = constDefaultSegmentCount;
	this.cylinderColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	
	this.triangleStore = [];
}

/**
 *  Sets the number of vertical cylinder segments
 *  
 *  @param segmentCount {number} The number of vertical cylinder segments
 *                               to be generated (should be invoked before
 *                               invoking TessellatedCylinderGenerator.generateGeometry())
 *  @see TessellatedCylinderGenerator.generateGeometry()
 */
TessellatedCylinderGenerator.prototype.setSegmentCount = function(segmentCount) {
	if (Utility.returnValidNumOrZero(segmentCount) > 0) {
		this.segmentCount = segmentCount;
	}
}

/**
 *  Sets the color to be associated with all vertices
 *   (should be invoked before invoking 
 *   TessellatedCylinderGenerator.generateGeometry())
 *  
 *  @param rgbColor {RgbColor} Color to be associated with all vertices
 *  @see TessellatedCylinderGenerator.generateGeometry()
 */
TessellatedCylinderGenerator.prototype.setColor = function(rgbColor) {
	if (Utility.validateVarAgainstType(rgbColor, RgbColor)) {
		this.cylinderColor = rgbColor;
	}
}

/**
 *  Validates the internal set of parameters used to generate the geometric
 *   representation
 *  
 *  @return True if the internal set of parameters is valid
 */
TessellatedCylinderGenerator.prototype.areInternalParametersValid = function() {
	return (Utility.returnValidNumOrZero(this.cylinderRadius) > 0) &&
		(Utility.returnValidNumOrZero(this.cylinderHeight) > 0) &&
		Utility.validateVarAgainstType(this.centerPoint, Point3d) &&
		(Utility.returnValidNumOrZero(this.segmentCount) > 0);
}

/**
 *  Clears the triangle store used to provide the internal cylinder
 *   representation
 */
TessellatedCylinderGenerator.prototype.clearTriangleStore = function() {
	this.triangleStore.length = 0;
}

/**
 *  Returns a reference to the internal list of triangles that represent
 *   the geometry
 *  
 *  @return {Array} A list of triangles that represent the collection
 *          (Triangle objects)
 */
TessellatedCylinderGenerator.prototype.getTriangleList = function() {
	return this.triangleStore;
}

/**
 *  Generates the geometric representation, and stores the geometry
 *   internally
 *  
 *  @return {Boolean} True if the geometric representation has been
 *          successfully generated
 */
TessellatedCylinderGenerator.prototype.generateGeometry = function() {
	var generatedSuccessfully = false;
	
	if (this.areInternalParametersValid()) {
		var constMaxDegreesRad = 2 * Math.PI;
		
		var degreesPerSegment = constMaxDegreesRad / this.segmentCount;

		var radiusVector = new Vector3d(0.0, 0.0, this.cylinderRadius);
		var centerEdgePoint = radiusVector.getPoint3dRep();
		var topCenterPoint = new Point3d(0.0, this.cylinderHeight / 2.0, 0.0);
		topCenterPoint.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
		var bottomCenterPoint = new Point3d(0.0, -this.cylinderHeight / 2.0, 0.0);		
		bottomCenterPoint.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
		
		// Top normal vectors extend from the top of the cylinder...
		var topNormalVector = new Vector3d(0.0, 1.0, 0.0);
		// Bottom normal vectors extend from the bottom of the cylinder...
		var bottomNormalVector = new Vector3d(0.0, -1.0, 0.0);
		
		var currentDegreesRad = 0.0;
		
		while (currentDegreesRad < constMaxDegreesRad) {
			// Isolate a quad on the surface of the cylinder using four points (two pairs of points
			// share a common latitude, while two pairs of points share a top/bottom edge along the
			// cylinder).
			var rotatedCenterEdgePointTrailing = MathUtility.rotatePointAroundAxisY(centerEdgePoint, currentDegreesRad);
			var rotatedCenterEdgePointLeading = MathUtility.rotatePointAroundAxisY(
				centerEdgePoint, (currentDegreesRad + degreesPerSegment));
			
			// Side normal vectors will be generated by describing a vector starting from the center of the
			// cylinder to the edge of the cylinder (this vector is wholly contained in the top or bottom plane
			// of the cylinder).
			var normalLeading = PrimitivesUtil.GenerateVector3dFromPoint3d(rotatedCenterEdgePointLeading);
			normalLeading.normalize();
			var normalTrailing = PrimitivesUtil.GenerateVector3dFromPoint3d(rotatedCenterEdgePointTrailing);
			normalTrailing.normalize();
			
			var topPointTrailing = new Point3d(rotatedCenterEdgePointTrailing.getX(), (this.cylinderHeight / 2.0),
				rotatedCenterEdgePointTrailing.getZ());
			var bottomPointTrailing = new Point3d(rotatedCenterEdgePointTrailing.getX(), (-this.cylinderHeight / 2.0),
				rotatedCenterEdgePointTrailing.getZ());				
			
			var topPointLeading = new Point3d(rotatedCenterEdgePointLeading.getX(), (this.cylinderHeight / 2.0),
				rotatedCenterEdgePointLeading.getZ());
			var bottomPointLeading = new Point3d(rotatedCenterEdgePointLeading.getX(), (-this.cylinderHeight / 2.0),
				rotatedCenterEdgePointLeading.getZ());		
			
			
			var topCenterVertex = PrimitivesUtil.GenerateVertex3dFromPoint3d(topCenterPoint);
			
			var bottomCenterVertex = PrimitivesUtil.GenerateVertex3dFromPoint3d(bottomCenterPoint);
			
			// Create top vertices...
			topPointTrailing.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
			var topVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(topPointTrailing);
			topPointLeading.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
			var topVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(topPointLeading);
			
			bottomPointTrailing.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
			var bottomVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(bottomPointTrailing)
			bottomPointLeading.offset(this.centerPoint.getX(), this.centerPoint.getY(), this.centerPoint.getZ());
			var bottomVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(bottomPointLeading);
			
			// Create side vertices (some vertices are shared with the top;
			// however, normal vector for side vertices will be different).
			var sideTopVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(topPointTrailing);
			var sideTopVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(topPointLeading);
			
			var sideBottomVertexTrailing = PrimitivesUtil.GenerateVertex3dFromPoint3d(bottomPointTrailing)
			var sideBottomVertexLeading = PrimitivesUtil.GenerateVertex3dFromPoint3d(bottomPointLeading);
			
			topCenterVertex.setNormalVector(topNormalVector);
			bottomCenterVertex.setNormalVector(bottomNormalVector);
			
			sideTopVertexLeading.setNormalVector(normalLeading);
			sideBottomVertexLeading.setNormalVector(normalLeading);
			
			sideTopVertexTrailing.setNormalVector(normalTrailing);
			sideBottomVertexTrailing.setNormalVector(normalTrailing);
			
			
			topCenterVertex.setColor(this.cylinderColor);
			bottomCenterVertex.setColor(this.cylinderColor);
			
			topVertexLeading.setColor(this.cylinderColor);
			topVertexTrailing.setColor(this.cylinderColor);
			
			bottomVertexLeading.setColor(this.cylinderColor);
			bottomVertexTrailing.setColor(this.cylinderColor);
			
			sideTopVertexLeading.setColor(this.cylinderColor);
			sideTopVertexTrailing.setColor(this.cylinderColor);
			
			sideBottomVertexLeading.setColor(this.cylinderColor);
			sideBottomVertexTrailing.setColor(this.cylinderColor);
	
			// Set the surface/texture mapping coordinates.
			topCenterVertex.setSurfaceMappingCoords(0.5, 0.5);
			bottomCenterVertex.setSurfaceMappingCoords(0.5, 0.5);
			
			topVertexLeading.setSurfaceMappingCoords(Math.cos(currentDegreesRad + degreesPerSegment) / 2.0 + 0.5,
				Math.sin(currentDegreesRad + degreesPerSegment) / 2.0 + 0.5);
			topVertexTrailing.setSurfaceMappingCoords(Math.cos(currentDegreesRad) / 2.0 + 0.5,
				Math.sin(currentDegreesRad) / 2.0 + 0.5);
			
			bottomVertexLeading.setSurfaceMappingCoords(Math.cos(currentDegreesRad + degreesPerSegment)  / 2.0 + 0.5,
				Math.sin(currentDegreesRad + degreesPerSegment)  / 2.0 + 0.5);
			bottomVertexTrailing.setSurfaceMappingCoords(Math.cos(currentDegreesRad)  / 2.0 + 0.5,
				Math.sin(currentDegreesRad) / 2.0 + 0.5);
			
			sideTopVertexLeading.setSurfaceMappingCoords((currentDegreesRad + degreesPerSegment) / constMaxDegreesRad, 0.0);
			sideTopVertexTrailing.setSurfaceMappingCoords(currentDegreesRad / constMaxDegreesRad, 0.0);
			
			sideBottomVertexLeading.setSurfaceMappingCoords((currentDegreesRad + degreesPerSegment) / constMaxDegreesRad, 1.0);
			sideBottomVertexTrailing.setSurfaceMappingCoords(currentDegreesRad / constMaxDegreesRad, 1.0);	
			
			// Front-facing polygons will have counter-clockwise vertex winding
			var topTriangle = new Triangle(topCenterVertex, topVertexTrailing, topVertexLeading);
			
			var firstSideTriangle = new Triangle(sideTopVertexTrailing, sideBottomVertexTrailing, sideBottomVertexLeading);
			var secondSideTriangle = new Triangle(sideTopVertexTrailing, sideBottomVertexLeading, sideTopVertexLeading);
			
			var bottomTriangle = new Triangle(bottomCenterVertex, bottomVertexLeading, bottomVertexTrailing);
			
			this.triangleStore.push(topTriangle);
			this.triangleStore.push(firstSideTriangle);
			this.triangleStore.push(secondSideTriangle);
			this.triangleStore.push(bottomTriangle);

			currentDegreesRad += degreesPerSegment;
		}
	
		generatedSuccessfully = true;
	}
	
	return generatedSuccessfully;
}

///////////////////////////////////////
// TessellatedBoxGenerator object
///////////////////////////////////////

function TessellatedBoxGenerator(width, height, depth, centerPoint) {
	this.boxWidth = width;
	this.boxHeight = height;
	this.boxDepth = depth;
	this.centerPoint = centerPoint;
	
	this.triangleStore = [];
}

/**
 *  Sets the color to be associated with all vertices
 *   (should be invoked before invoking 
 *   TessellatedBoxGenerator.generateGeometry())
 *  
 *  @param rgbColor {RgbColor} Color to be associated with all vertices
 *  @see TessellatedBoxGenerator.generateGeometry()
 */
TessellatedBoxGenerator.prototype.setColor = function(rgbColor) {
	if (Utility.validateVarAgainstType(rgbColor, RgbColor)) {
		this.sphereColor = rgbColor;
	}
}

/**
 *  Validates the internal set of parameters used to generate the geometric
 *   representation
 *  
 *  @return True if the internal set of parameters is valid
 */
TessellatedBoxGenerator.prototype.areInternalParametersValid = function() {
	return Utility.validateVarAgainstType(this.centerPoint, Point3d) &&
		(Utility.returnValidNumOrZero(this.boxWidth) > 0) &&
		(Utility.returnValidNumOrZero(this.boxHeight) > 0) &&
		(Utility.returnValidNumOrZero(this.boxDepth) > 0);
}

/**
 *  Clears the triangle store used to provide the internal cone
 *   representation
 */
TessellatedBoxGenerator.prototype.clearTriangleStore = function() {
	this.triangleStore.length = 0;
}

/**
 *  Returns a reference to the internal list of triangles that represent
 *   the geometry
 *  
 *  @return {Array} A list of triangles that represent the collection
 *          (Triangle objects)
 */
TessellatedBoxGenerator.prototype.getTriangleList = function() {
	return this.triangleStore;
}

TessellatedBoxGenerator.prototype.generateGeometry = function() {
	var generatedSuccessfully = false;
	
	if (this.areInternalParametersValid()) {

		// Height normal vectors
		var topNormalVector = new Vector3d(0.0, 1.0, 0.0);	
		var bottomNormalVector = new Vector3d(0.0, -1.0, 0.0);
		// Width normal vectors
		var leftNormalVector = new Vector3d(-1.0, 0.0, 0.0);
		var rightNormalVector = new Vector3d(1.0, 0.0, 0.0);
		// Depth normal vectors
		var frontNormalVector = new Vector3d(0.0, 0.0, 1.0);
		var backNormalVector = new Vector3d(0.0, 0.0, -1.0);
		
		this.clearTriangleStore();
		
		
		var leftCoordX = this.centerPoint.getX() - this.boxWidth / 2.0;
		var rightCoordX = this.centerPoint.getX() + this.boxWidth / 2.0;
		var topCoordY = this.centerPoint.getY() + this.boxHeight / 2.0;
		var bottomCoordY = this.centerPoint.getY() - this.boxHeight / 2.0
		var frontCoordZ = this.centerPoint.getZ() + this.boxDepth / 2.0;
		var backCoordZ = this.centerPoint.getZ() - this.boxDepth / 2.0;		
		
		// Vertices for box faces - boxes will use two triangles/face.
		// Front-facing polygons will have counter-clockwise vertex winding.
		var topVertexArray =
		[
			rightCoordX, topCoordY, frontCoordZ,
			rightCoordX, topCoordY, backCoordZ,
			leftCoordX, topCoordY, backCoordZ,
			
			leftCoordX, topCoordY, backCoordZ,
			leftCoordX, topCoordY, frontCoordZ,
			rightCoordX, topCoordY, frontCoordZ
		];
		
		var bottomVertexArray =
		[
			leftCoordX, bottomCoordY, backCoordZ,
			rightCoordX, bottomCoordY, backCoordZ,			
			rightCoordX, bottomCoordY, frontCoordZ,
	
			rightCoordX, bottomCoordY, frontCoordZ,
			leftCoordX, bottomCoordY, frontCoordZ,
			leftCoordX, bottomCoordY, backCoordZ
			
		];
		
		var frontVertexArray =
		[
			leftCoordX, topCoordY, frontCoordZ,
			leftCoordX, bottomCoordY, frontCoordZ,
			rightCoordX, bottomCoordY, frontCoordZ,
			
			rightCoordX, bottomCoordY, frontCoordZ,
			rightCoordX, topCoordY, frontCoordZ,
			leftCoordX, topCoordY, frontCoordZ
		];
		
		var backVertexArray =
		[
			leftCoordX, topCoordY, backCoordZ,
			rightCoordX, topCoordY, backCoordZ,
			rightCoordX, bottomCoordY, backCoordZ,
			
			rightCoordX, bottomCoordY, backCoordZ,
			leftCoordX, bottomCoordY, backCoordZ,
			leftCoordX, topCoordY, backCoordZ			
		];

		var leftVertexArray =
		[
			leftCoordX, topCoordY, frontCoordZ,
			leftCoordX, topCoordY, backCoordZ,
			leftCoordX, bottomCoordY, backCoordZ,
			
			leftCoordX, bottomCoordY, backCoordZ,
			leftCoordX, bottomCoordY, frontCoordZ,
			leftCoordX, topCoordY, frontCoordZ
		];
		
		var rightVertexArray =
		[
			rightCoordX, topCoordY, frontCoordZ,
			rightCoordX, bottomCoordY, frontCoordZ,
			rightCoordX, bottomCoordY, backCoordZ,

			rightCoordX, bottomCoordY, backCoordZ,
			rightCoordX, topCoordY, backCoordZ,
			rightCoordX, topCoordY, frontCoordZ
		];
		
		// Surface mapping coordinates for each vertex
		// within the two triangles contained on
		// each face
		var topSurfaceMappingCoordsArray =
		[
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0
		];
		
		var bottomSurfaceMappingCoordsArray =
		[
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			
			1.0, 0.0,
			0.0, 0.0,
			0.0, 1.0
		];
		
		var frontSurfaceMappingCoordsArray =
		[
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,

			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0
		];
		
		var backSurfaceMappingCoordsArray =
		[
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0
		];
		
		var leftSurfaceMappingCoordsArray =
		[
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0
		];
		
		var rightSurfaceMappingCoordsArray =
		[
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0
		];
								
		var vertexSets = [ topVertexArray, bottomVertexArray, frontVertexArray,
			backVertexArray, leftVertexArray, rightVertexArray ];
			
		var surfaceMappingCoordSets = [ topSurfaceMappingCoordsArray, bottomSurfaceMappingCoordsArray, frontSurfaceMappingCoordsArray,
			backSurfaceMappingCoordsArray, leftSurfaceMappingCoordsArray, rightSurfaceMappingCoordsArray ];
		
		var vertexNormalSet = [ topNormalVector, bottomNormalVector, frontNormalVector,
			backNormalVector, leftNormalVector, rightNormalVector ]
		

		// Compose the triangle sets required to express the
		// box geometry.
		var constCoordsPerVertex = 3;
		var constTexCoordsPerVertex = 2;
		var offsetCoordX = 0;
		var offsetCoordY = 1;
		var offsetCoordZ = 2;		
		
		for (var vertexSetIndex = 0; vertexSetIndex < vertexSets.length; vertexSetIndex++) {
			var vertexArray = [];
			var texCoordIndex = 0;
			for (var vertexIndex = 0; vertexIndex < vertexSets[vertexSetIndex].length; vertexIndex += constCoordsPerVertex) {				
				var currentVertex = new Vertex3d(vertexSets[vertexSetIndex][vertexIndex + offsetCoordX],
					vertexSets[vertexSetIndex][vertexIndex + offsetCoordY],
					vertexSets[vertexSetIndex][vertexIndex + offsetCoordZ]);
				currentVertex.setSurfaceMappingCoords(surfaceMappingCoordSets[vertexSetIndex][texCoordIndex],
					surfaceMappingCoordSets[vertexSetIndex][texCoordIndex + 1]);
				currentVertex.setNormalVector(vertexNormalSet[vertexSetIndex]);
				vertexArray.push(currentVertex);					
				texCoordIndex += constTexCoordsPerVertex;
			}

			var triangleVertexIndex = 0;
			while (triangleVertexIndex < vertexArray.length) {
				var currentTriangle = new Triangle(vertexArray[triangleVertexIndex++],
					vertexArray[triangleVertexIndex++],
					vertexArray[triangleVertexIndex++]);
				// Correct triangle vertex winding...
				this.triangleStore.push(new Triangle(currentTriangle.secondVertex3d,
					currentTriangle.firstVertex3d, currentTriangle.thirdVertex3d));
			}
		}	
		
		generatedSuccessfully = true;
	}
	
	return generatedSuccessfully;
}