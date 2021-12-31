// Utility.js - Classes and utility routines used within the "Happy Holidays 2019" demo
// Author: Ayodeji Oshinnaiye

var Utility = {};

/**
 * Validates a variable, ensuring that it
 *  is defined and non-null
 * @param [any] variable Variable to be validated
 * @return True if the variable is defined and
 *         non-null, false otherwise
 */
Utility.validateVar = function(variable) {
    // Ensure that the variable is usable.
    return ((typeof(variable) !== 'undefined') &&
        (variable !== null));
}

/**
 *  Validates a variable, ensuring that the variable
 *   is of the provided type
 *  
 *  @param variable {any} Variable to be validated
 *  @param type {} Type against which the variable should
 *                 be validate
 *  @return True if the variable is defined and has a
 *          type equivalent to the specified type
 */
Utility.validateVarAgainstType = function(variable, type) {
	return ((type !== "undefined") && (type !== null) &&
		Utility.validateVar(variable) && (variable instanceof type));
}

/**
 * Validates and returns a number, returning the
 *  provided number if the number is valid, zero otherwise
 * @param sourceNumber The number to be validated and returned
 * @return The provided number if the number is valid, zero otherwise
 */
Utility.returnValidNumOrZero = function(sourceNumber) {
	return (typeof(sourceNumber) === "number" ? sourceNumber : 0.0);
}

/** 
 * Clears a context, using the specified fill style
 * @param targetContext The context that is to be cleared
 * @param fillStyleStr A string that specifies the type
 *                     of fill pattern/color that will be
 *                     used to clear the context
 */
Utility.clearContext = function(targetContext, fillStyleStr) {
    if (Utility.validateVar(targetContext)) {
        targetContext.fillStyle = fillStyleStr;
        targetContext.fillRect(0, 0,
            targetContext.canvas.width,
            targetContext.canvas.height);
    }
}

/**
 * Retrieves a random value between the closed interval
 *  specified by two provided values
 * @param minRandomValue Minimum random value that will be returned
 * @param maxRandomValue Maximum random value that will be returned
 * @return A value within the specified close interval upon success,
 *         zero otherwise
 */
Utility.getRangedRandomValue = function(minRandomValue, maxRandomValue) {
	rangedRandomValue = 0.0;

	if (Utility.validateVar(minRandomValue) && Utility.validateVar(maxRandomValue) &&
		(minRandomValue <= maxRandomValue)) {
		rangedRandomValue = (maxRandomValue - minRandomValue) * Math.random() + minRandomValue;
	}
	
	return rangedRandomValue;
}


/**
 * Returns the sum of two numbers, retaining the
 *  sign bias while clamping the resultant
 *  magnitude
 *
 * @param firstScalar First value of the sum
 * @param secondScalar Second value of the sum
 * @param maxMagnitude Maximum permissible sum magnitude
 *
 * @return {Number} A sum with a proper sign bias and clamped magnitude
 */
Utility.getSumWithMagnitudeClamp = function (firstScalar, secondScalar, maxMagnitude) {
	var clampedResult = 0.0;
	
	if (Utility.validateVar(firstScalar) && Utility.validateVar(secondScalar) && Utility.validateVar(maxMagnitude)) {
		
		clampedResult = firstScalar + secondScalar;
		var signBias = (clampedResult > 0) ? 1.0 : -1.0;
		
		if (clampedResult > Math.abs(maxMagnitude)) {
			clampedResult = Math.abs(maxMagnitude) * signBias;	
		}			
	}
	
	return clampedResult;
}
