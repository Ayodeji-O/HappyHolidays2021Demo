// MathExtMatrix.js - Math routines - matrix object definition
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

var MathExt = {};

MathExt.Matrix = function(rows, columns) {
	if (Utility.validateVar(rows) && Utility.validateVar(columns) &&
		(typeof(rows) === "number" ) && (typeof(columns) === "number")) {
			
		this.useFullPrecision = true;
		this.initializeEmptyMatrix(rows, columns);
	}
}

/**
 *  Initializes the matrix object, using a specified number
 *   of rows and columns, if the object has not already
 *   been initialized
 *  
 *  @param rows {number} Number of rows to be contained
 *                       in the matrix
 *  @param columns {number} Number of columns to be
 *                          contained in the matrix
 */
MathExt.Matrix.prototype.initializeEmptyMatrix = function(rows, columns) {
	if (Utility.validateVar(rows) && Utility.validateVar(columns) &&
		(typeof(rows) === "number" ) && (typeof(columns) === "number")) {
			
		if ((rows > 0) && (columns > 0) && (typeof(this.matrixStore) === "undefined")) {
			
			this.matrixStore = [];
			
			for (var rowLoop = 0; rowLoop < rows; rowLoop++) {
			
				// New matrices will be initialized to have
				// elements which all have a value of zero.
				var newRow = this.createMatrixRow(columns);
				newRow.fill(0.0);
				this.matrixStore.push(newRow);
			}
		}
	}			
}

/**
 *  Sets the current matrix representation to be an identity
 *   matrix
 */
MathExt.Matrix.prototype.setToIdentity = function() {
	if (this.isValid()) {
		var maxRowsToIterate = Math.min(this.rowCount(), this.columnCount());

		// Ensure that all matrix values are initially zero...
		this.initializeEmptyMatrix(this.rowCount(), this.columnCount());
		
		for (var rowLoop = 0; rowLoop < maxRowsToIterate; rowLoop++) {
			// Identity matrix contains a diagonal array of unit values -
			// therefore, the row index is equal to the column index...
			this.matrixStore[rowLoop][rowLoop] = 1.0;
		}
	}
}

/**
 *  Determines if the matrix representation data
 *   corresponds to a valid set of matrix element
 *   data
 *  
 *  @param matrixRep {array} Two-dimensional array of values
 *                           representing matrix element
 *                           data (number or Float32)
 *  
 *  @return Return {boolean} True if the matrix
 *                           representation data is
 *                           valid
 */
MathExt.Matrix.prototype.isMatrixRepDataValid = function(matrixRep) {
	var isValid = false;
	
	if (Utility.validateVarAgainstType(matrixRep, Array) &&
		(matrixRep.length > 0)) {
		
		// Assumption - all rows within the matrix contain an
		// equivalent number of columns - validate only the first
		// row.
		isValid = (Utility.validateVarAgainstType(matrixRep[0], Array) ||
			(Utility.validateVarAgainstType(matrixRep[0], Float32Array)) &&
			(matrixRep[0].length > 0));
	}
	
	return isValid;
}

/**
 *  Determines if the matrix object is valid
 *   and initialized
 *  
 *  @return {boolean} True if the object is valid
 */
MathExt.Matrix.prototype.isValid = function() {
	var isValid = false;
	
	isValid = this.isMatrixRepDataValid(this.matrixStore);
	
	return isValid;
}

/**
 *  Generates a row of a matrix with the specified
 *   number of columns
 *  
 *  @param columnCount {number} Number of columns to be contained
 *                              in the row
 *  @return {Array} An array that represents a matrix row
 */
MathExt.Matrix.prototype.createMatrixRow = function(columnCount) {
	var matrixRow = null;
	
	if (Utility.validateVar(columnCount) && (columnCount > 0)) {
		if (this.useFullPrecision) {
			matrixRow = new Array(columnCount);
		}
		else {
			matrixRow = new Float32Array(columnCount);
		}
	}
	
	return matrixRow;
}

/**
 *  Applies the set of matrix data to the internal
 *   matrix representation
 *  
 *  @param elementValues {array} Two-dimensional array of
 *                               values representing matrix
 *                               element data (number or
 *                               Float32)
 */
MathExt.Matrix.prototype.setElementValues = function(elementValues) {
	if (this.isMatrixRepDataValid(elementValues)) {
		this.matrixStore = elementValues;
	}
}

/**
 *  Multiplies the matrix representation by another matrix,
 *   returning the result
 *  
 *  @param secondMatrix {Matrix} The matrix against which the
 *                               represented matrix is to be
 *                               multiplied
 *  
 *  @return Return {Matrix} A new matrix containing the
 *                          result of the multiplication
 *                          operation upon success,
 *                          null if one of the matrices
 *                          is not valid/initialized
 */
MathExt.Matrix.prototype.multiply = function(secondMatrix) {
	var multiplyResult = null;
	
	if (this.isValid() && Utility.validateVarAgainstType(secondMatrix, MathExt.Matrix) &&
		secondMatrix.isValid())
	{
		multiplyResult = new MathExt.Matrix(this.rowCount(), secondMatrix.columnCount())
		
		if (this.columnCount() == secondMatrix.rowCount()) {
			for (var outerRowLoop = 0; outerRowLoop < this.rowCount(); outerRowLoop++) {
				for (var outerColumnLoop = 0; outerColumnLoop < secondMatrix.columnCount(); outerColumnLoop++) {
					
					var currentSum = 0.0;
					for (innerRowColLoop = 0; innerRowColLoop < this.columnCount(); innerRowColLoop++) {
						currentSum += this.matrixStore[outerRowLoop][innerRowColLoop] *
							secondMatrix.matrixStore[innerRowColLoop][outerColumnLoop];
					}
					
					multiplyResult.matrixStore[outerRowLoop][outerColumnLoop] = currentSum;
				}
			}
		}
	}
			
	return multiplyResult;
}

/**
 *  Returns the number of columns within
 *   the represented matrix
 *  
 *  @return {number} The number of columns within
 *                   the represented matrix
 */
MathExt.Matrix.prototype.columnCount = function() {
	var columnCount = 0;
	
	if (this.isValid()) {
		columnCount = this.matrixStore[0].length;
	}
	
	return columnCount;
}

/**
 *  Returns the number of rows within the
 *   represented matrix
 *  
 *  @return {number} The number of rows within the
 *                   represented matrix
 */
MathExt.Matrix.prototype.rowCount = function() {
	var rowCount = 0;
	
	if (this.isValid()) {
		rowCount = this.matrixStore.length;
	}
	
	return rowCount;
}

/**
 *  Returns an array representation of the matrix
 *   data
 *  
 *  @return {Array} An array representation of the matrix
 *                  data
 */
MathExt.Matrix.prototype.getArrayRepresentation = function() {
	var matrixArrayRepresentation = Object.assign([], this.matrixStore);
	
	return matrixArrayRepresentation;
}