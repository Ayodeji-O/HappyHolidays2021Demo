// MathEUtility.js - Math utility routines
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Primitives.js
//  -MathExtMatrix.js

var MathUtility = {};
	
/**
 *  Generates a rotation matrix that expresses
 *   a rotation within a two-dimensional coordiante
 *   system
 *  
 *  @param radAngle {number} Magnitude of rotation (radians)
 *  @return A rotation matrix that expresses a rotation
 *          specified by the provided number of degrees
 */
MathUtility.generateRotationMatrix2d = function(radAngle) {
	var kMatrix2dDimension = 2;
	
	// Equation sourced from Wolfram MathWorld - Rotation Matrix:
	// http://mathworld.wolfram.com/RotationMatrix.html
	//
	//  | cos(Θ)  -sin(Θ) |
	//  | sin(Θ)   cos(Θ) |
	//

	var rotationMatrix2d = new MathExt.Matrix(kMatrix2dDimension, kMatrix2dDimension);
	rotationMatrix2d.setElementValues(
		[
			new Float32Array([Math.cos(radAngle), 	-Math.sin(radAngle)		]),
			new Float32Array([Math.sin(radAngle), 	Math.cos(radAngle)		])
		]
	);
	
	return rotationMatrix2d;
}

/**
 *  Generates a matrix that expresses a rotation
 *   around the X-axis within a three-dimensional
 *   coordinate system
 *  
 *  @param radAngleX {number} Degrees of rotation around the X-axis,
 *                            in radians
 *  @return {Matrix} A matrix representation that expresses the
 *                   specified rotation amount around the X-axis
 */
MathUtility.generateRotationMatrix3dAxisX = function(radAngleX) {
	// Equation sourced from Wolfram MathWorld - Rotation Matrix:
	// http://mathworld.wolfram.com/RotationMatrix.html
	
	var constMatrix3dDimension = 4;
	
	var rotationMatrix3d = new MathExt.Matrix(constMatrix3dDimension, constMatrix3dDimension);
	rotationMatrix3d.setElementValues(
		[
			new Float32Array([1.0, 					0.0, 					0.0,						0.0]),
			new Float32Array([0.0,					Math.cos(radAngleX), 	Math.sin(radAngleX),		0.0]),
			new Float32Array([0.0,					-Math.sin(radAngleX), 	Math.cos(radAngleX),		0.0]),
			new Float32Array([0.0, 					0.0, 					0.0,						1.0])
		]
	);
	
	return rotationMatrix3d;
}

/**
 *  Generates a matrix that expresses a rotation
 *   around the Y-axis within a three-dimensional
 *   coordinate system
 *  
 *  @param radAngleY {number} Degrees of rotation around the Y-axis,
 *                            in radians
 *  @return {Matrix} A matrix representation that expresses the
 *                   specified rotation amount around the Y-axis
 */
MathUtility.generateRotationMatrix3dAxisY = function(radAngleY, wValue) {
	// Equation sourced from Wolfram MathWorld - Rotation Matrix:
	// http://mathworld.wolfram.com/RotationMatrix.html	
	
	var constMatrix3dDimension = 4;
	var workingValueW = Utility.validateVar(wValue) ? wValue : 1.0;	
	
	var rotationMatrix3d = new MathExt.Matrix(constMatrix3dDimension, constMatrix3dDimension);
	rotationMatrix3d.setElementValues(
		[
			new Float32Array([Math.cos(radAngleY),	0.0, 					-Math.sin(radAngleY),		0.0]),
			new Float32Array([0.0,					1.0, 					0.0,						0.0]),				
			new Float32Array([Math.sin(radAngleY),	0.0, 					Math.cos(radAngleY),		0.0]),
			new Float32Array([0.0,					0.0,					0.0,						1.0])
		]
	);

	return rotationMatrix3d;
}

/**
 *  Generates a matrix that expresses a rotation
 *   around the Z-axis within a three-dimensional
 *   coordinate system
 *  
 *  @param radAngleZ {number} Degrees of rotation around the Z-axis,
 *                            in radians
 *  @return {Matrix} A matrix representation that expresses the
 *                   specified rotation amount around the Z-axis
 */
MathUtility.generateRotationMatrix3dAxisZ = function(radAngleZ, wValue) {
	// Equation sourced from Wolfram MathWorld - Rotation Matrix:
	// http://mathworld.wolfram.com/RotationMatrix.html	
	
	var constMatrix3dDimension = 4;
	var workingValueW = Utility.validateVar(wValue) ? wValue : 1.0;
	
	var rotationMatrix3d = new MathExt.Matrix(constMatrix3dDimension, constMatrix3dDimension);

	rotationMatrix3d.setElementValues(
		[
			new Float32Array([Math.cos(radAngleZ),	Math.sin(radAngleZ), 	0.0,						0.0]),
			new Float32Array([-Math.sin(radAngleZ),	Math.cos(radAngleZ), 	0.0,						0.0]),				
			new Float32Array([0.0,					0.0, 					1.0,						0.0]),
			new Float32Array([0.0,					0.0,					0.0,						workingValueW])
		]
	);		

	return rotationMatrix3d;
}

/**
 *  Generates a matrix that expresses a translation
 *   within a three-dimensional coordinate system
 *  
 *  @param offsetX {number} Translation magnitude along the X-axis
 *  @param offsetY {number} Translation magnitude along the Y-axis
 *  @param offsetZ {number} Translation magnitude along the Z-axis
 *  @return {Matrix} A matrix representation that expresses the
 *                   specified translation in three-dimensional
 *                   space
 */
MathUtility.generateTranslationMatrix3d = function(offsetX, offsetY, offsetZ, wValue) {
	
	var constMatrix3dDimension = 4;
	var workingValueW = Utility.validateVar(wValue) ? wValue : 1.0;
	
	var translationMatrix3d = new MathExt.Matrix(constMatrix3dDimension, constMatrix3dDimension);
	
	translationMatrix3d.setElementValues(
		[
			new Float32Array([1.0,					0.0, 					0.0,						offsetX]),
			new Float32Array([0.0,					1.0, 					0.0,						offsetY]),				
			new Float32Array([0.0,					0.0, 					1.0,						offsetZ]),
			new Float32Array([0.0,					0.0,					0.0,						workingValueW])		
		
		]
	);
	
	
	return translationMatrix3d;
}

/**
 *  Expresses a vector as a column matrix
 *  
 *  @param vector3d {Vector3d} Object representing a three-dimensional
 *                             vector
 *  @return {Matrix} A column matrix representation of the provided
 *                   vector
 */
MathUtility.vector3dToColumnMatrix = function(vector3d) {
	var constColumnMatrixRows = 4;
	
	var columnMatrix = null;
	
	if (Utility.validateVarAgainstType(vector3d, Vector3d)) {

		columnMatrix = new MathExt.Matrix(constColumnMatrixRows, 1);
		
		columnMatrix.setElementValues(
			[
				[ vector3d.getXComponent() ],
				[ vector3d.getYComponent() ],
				[ vector3d.getZComponent() ],
				[ 1.0					   ]
			]
		);
	}
	
	return columnMatrix;
}

/**
 *  Expresses a column matrix as a three-dimensional vector
 *  
 *  @param columnMatrix {Matrix} Column matrix to be expressed as
 *                               a vector
 *  @return {Vector3d} A three-dimensional vector representation
 */
MathUtility.columnMatrixToVector3d = function(columnMatrix) {
	var vector3d = null;
	
	if (Utility.validateVarAgainstType(columnMatrix, MathExt.Matrix)) {
		if (columnMatrix.isValid()) {
			vector3d = new Vector3d(
				columnMatrix.matrixStore[0][0],
				columnMatrix.matrixStore[1][0],
				columnMatrix.matrixStore[2][0]
			);
		}
	}
	
	return vector3d;
}

/**
 *  Rotates a point around the X-axis
 *  
 *  @param point3d {Point3d} The point to be rotated around the X-axis
 *  @param radAngleX {number} Degrees to rotate the point, in radians
 *  @return {Point3d} The resultant rotated point representation
 */
MathUtility.rotatePointAroundAxisX = function(point3d, radAngleX) {
	var rotatedPoint = null;
	
	if (Utility.validateVarAgainstType(point3d, Point3d) &&
		(typeof(radAngleX) === "number")) {
			
		var pointAsVector = new Vector3d(
			point3d.getX(),
			point3d.getY(),
			point3d.getZ());
			
		var pointAsColumnMatrix = MathUtility.vector3dToColumnMatrix(pointAsVector);
		var rotationMatrix = MathUtility.generateRotationMatrix3dAxisX(radAngleX);
		
		var rotatedPointAsMatrix = rotationMatrix.multiply(pointAsColumnMatrix);
		
		if ((rotatedPointAsMatrix !== null) && rotatedPointAsMatrix.isValid()) {
			rotatedPoint = new Point3d(
				rotatedPointAsMatrix.matrixStore[0][0],
				rotatedPointAsMatrix.matrixStore[1][0],
				rotatedPointAsMatrix.matrixStore[2][0]
			);
		}
	}
	
	return rotatedPoint;
}

/**
 *  Rotates a point around the Y-axis
 *  
 *  @param point3d {Point3d} The point to be rotated around the Y-axis
 *  @param radAngleY {number} Degrees to rotate the point, in radians
 *  @return {Point3d} The resultant rotated point representation
 */
MathUtility.rotatePointAroundAxisY = function(point3d, radAngleY) {
	var rotatedPoint = null;		
	
	if (Utility.validateVarAgainstType(point3d, Point3d) &&
		(typeof(radAngleY) === "number")) {
			
		var pointAsVector = new Vector3d(
			point3d.getX(),
			point3d.getY(),
			point3d.getZ());
			
		var pointAsColumnMatrix = MathUtility.vector3dToColumnMatrix(pointAsVector);
		var rotationMatrix = MathUtility.generateRotationMatrix3dAxisY(radAngleY);
		
		var rotatedPointAsMatrix = rotationMatrix.multiply(pointAsColumnMatrix);
		
		if ((rotatedPointAsMatrix !== null) && rotatedPointAsMatrix.isValid()) {
			rotatedPoint = new Point3d(
				rotatedPointAsMatrix.matrixStore[0][0],
				rotatedPointAsMatrix.matrixStore[1][0],
				rotatedPointAsMatrix.matrixStore[2][0]
			);
		}
	}

	return rotatedPoint;		
}

/**
 *  Rotates a point around the Z-axis
 *  
 *  @param point3d {Point3d} The point to be rotated around the Z-axis
 *  @param radAngleZ {number} Degrees to rotate the point, in radians
 *  @return {Point3d} The resultant rotated point representation
 */
MathUtility.rotatePointAroundAxisZ = function(point3d, radAngleZ) {
	var rotatedPoint;
	
	if (Utility.validateVarAgainstType(point3d, Point3d) &&
		(typeof(radAngleZ) === "number")) {
			
		var pointAsVector = new Vector3d(
			point3d.getX(),
			point3d.getY(),
			point3d.getZ());
			
		var pointAsColumnMatrix = MathUtility.vector3dToColumnMatrix(pointAsVector);
		var rotationMatrix = MathUtility.generateRotationMatrix3dAxisZ(radAngleZ);
		
		var rotatedPointAsMatrix = rotationMatrix.multiply(pointAsColumnMatrix);
		
		if ((rotatedPointAsMatrix !== null) && rotatedPointAsMatrix.isValid()) {
			rotatedPoint = new Point3d(
				rotatedPointAsMatrix.matrixStore[0][0],
				rotatedPointAsMatrix.matrixStore[1][0],
				rotatedPointAsMatrix.matrixStore[2][0]
			);
		}				
	}
	
	return rotatedPoint;
}

/**
 *  Computes the sum of a geometric series
 *  
 *  @param numberOfTerms {number} Number of terms for which the sum should
 *                                be executed (sum will start with the
 *                                number specified to be the first term
 *                                in the series)
 *  @param firstTerm {number} First term in the series
 *  @param commonRatio {number} Ratio between successive series elements
 *  @return {number} Sum of the specified geometric series
 */
MathUtility.computeGeometricSeriesSum = function(numberOfTerms, firstTerm, commonRatio) {
	var geometricSeriesSum = 0.0;
	
	// Sum of geometric series, performed using the following equation:
	//
	//  a (1 - rⁿ)
	//  ----------
	//    1  - r
	//
	//   Where a is the first term, r the common ratio, and n is the
	//   number of terms
	//
	// Source: Purple Math - Geometric Series
	// (https://www.purplemath.com/modules/series5.htm)
	
	if ((typeof(numberOfTerms) === "number") &&
		(typeof(firstTerm) === "number") &&
		(typeof(commonRatio) === "number")) {
	
		var numerator = firstTerm * (1.0 - Math.pow(commonRatio, numberOfTerms));
		var denominator = (1.0 - commonRatio);
			
		geometricSeriesSum = numerator / denominator;
	}
	
	return geometricSeriesSum;
}
