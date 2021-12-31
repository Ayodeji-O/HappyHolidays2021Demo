// RgbColor.js - Encapsulates an RGB color and related operations
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

function RgbColor(unitRedValue, unitGreenValue, unitBlueValue, unitAlphaValue) {
	// Multiplier employed to convert unit RGB component values to
	// standard integral RGB component values.
	this.constUnitRgbComponentToIntMultiplier = 255;
	this.constMaxUnitComponentValue = 1.0;
	this.constMinUnitComponentValue = 0.0;
	
	this.unitRedValue = Utility.returnValidNumOrZero(unitRedValue);
	this.unitGreenValue = Utility.returnValidNumOrZero(unitGreenValue);
	this.unitBlueValue = Utility.returnValidNumOrZero(unitBlueValue);
	this.unitAlphaValue = Utility.returnValidNumOrZero(unitAlphaValue);
}

/**
 * Returns the RGB representation as a standard RGB string
 *  with integral color components
 * @return {string} A standard RGB color component string
 */
RgbColor.prototype.getRgbIntValueAsStandardString = function() {
	return "RGB(" + Math.round(this.getRedIntValue()) + "," +
		Math.round(this.getGreenIntValue()) + "," +
		Math.round(this.getBlueIntValue()) + 
		")";
}

/**
 * Returns the RGB representation as a standard RGB string
 *  with integral color components and an alpha value
 * @return {string} A standard RGBA color component string
 */
RgbColor.prototype.getRgbaIntValueAsStandardString = function() {
	return "RGBA(" + Math.round(this.getRedIntValue()) + "," +
		Math.round(this.getGreenIntValue()) + "," +
		Math.round(this.getBlueIntValue()) + "," +
		this.getAlphaValue() +
		")";
}

/**
 * Multiplies all RGB components (with the exception of alpha) by
 *  a specific factor
 * @param scaleFactor {number} The coefficient by which all internal
 *                             RGB components will be multiplied
 */
RgbColor.prototype.scaleComponentsByFactor = function(scaleFactor) {
	if (Utility.validateVar(scaleFactor) && (typeof(scaleFactor) === "number")) {
		this.unitRedValue *= scaleFactor;
		this.unitGreenValue *= scaleFactor;
		this.unitBlueValue *= scaleFactor;
	}
}

/**
 * Returns the red component value as a unit maximum magnitude
 *  scalar
 * @return The scalar red component value (0.0 - 1.0, inclusive)
 */
RgbColor.prototype.getRedValue = function() {
	return this.unitRedValue;
}

/**
 * Returns the green component value as a unit maximum magnitude
 *  scalar
 * @return The scalar green component value (0.0 - 1.0, inclusive)
 */
RgbColor.prototype.getGreenValue = function() {
	return this.unitGreenValue;
}

/**
 * Returns the blue component value as a unit maximum magnitude
 *  scalar
 * @return The scalar blue component value (0.0 - 1.0, inclusive)
 */
RgbColor.prototype.getBlueValue = function() {
	return this.unitBlueValue;
}

/**
 * Returns the alpha component value as a unit maximum magnitude
 *  scalar
 * @return The scalar alpha component value (0.0 - 1.0, inclusive)
 */
RgbColor.prototype.getAlphaValue = function() {
	return this.unitAlphaValue;
}

/**
 * Returns the red component value as a standard integral
 *  color component value
 * @return The integral red component value (0 - 255, inclusive)
 */
RgbColor.prototype.getRedIntValue = function() {
	return this.unitRedValue * this.constUnitRgbComponentToIntMultiplier;
}

/**
 * Returns the green component value as a standard integral
 *  color component value
 * @return The integral green component value (0 - 255, inclusive)
 */
RgbColor.prototype.getGreenIntValue = function() {
	return this.unitGreenValue * this.constUnitRgbComponentToIntMultiplier;
}

/**
 * Returns the blue component value as a standard integral
 *  color component value
 * @return The integral blue component value (0 - 255, inclusive)
 */
RgbColor.prototype.getBlueIntValue = function() {
	return this.unitBlueValue * this.constUnitRgbComponentToIntMultiplier;
}

/**
 * Returns the alpha value as a standard integral
 *  color component value
 * @return The integral alpha value (0 - 255, inclusive)
 */
RgbColor.prototype.getAlphaIntValue = function() {
	return this.unitAlphaValue * this.constUnitRgbComponentToIntMultiplier;
}

/**
 * Stores an alpha value to be associated with the color
 * @param unitAlphaValue {number} Unit maximum magnitude alpha value
 */
RgbColor.prototype.setAlphaValue = function(unitAlphaValue) {
	if (Utility.validateVar(unitAlphaValue) && (typeof(unitAlphaValue) === "number")) {
		this.unitAlphaValue = unitAlphaValue;
	}
}

/**
 * Stores an RGB color representation, using standard integral
 *  component specification
 * @param intRedValue {number} Integral red value (0 - 255, inclusive)
 * @param intGreenValue {number} Integral green value (0 - 255, inclusive)
 * @param intBlueValue {number} Integral blue value (0 - 255, inclusive)
 * @param intAlphaValue {number} Integral alpha value (0 - 255, inclusive)
 */
RgbColor.prototype.setRgbaValuesFromIntValues = function(intRedValue, intGreenValue, intBlueValue, intAlphaValue) {
	if ((Utility.returnValidNumOrZero(intRedValue) >= 0) && (Utility.returnValidNumOrZero(intGreenValue) >= 0) &&
		(Utility.returnValidNumOrZero(intBlueValue) >= 0) && (Utility.returnValidNumOrZero(intAlphaValue) >= 0)) {
	
		this.unitRedValue = intRedValue / this.constUnitRgbComponentToIntMultiplier;
		this.unitGreenValue = intGreenValue / this.constUnitRgbComponentToIntMultiplier;
		this.unitBlueValue = intBlueValue / this.constUnitRgbComponentToIntMultiplier;
		this.unitAlphaValue = intAlphaValue / this.constUnitRgbComponentToIntMultiplier;
	}
}

/**
 * Duplicates the RGB color representation
 *  
 * @return A duplicated RGB color representation
 */
RgbColor.prototype.clone = function() {
	return new RgbColor(this.unitRedValue, this.unitGreenValue, this.unitBlueValue, this.unitAlphaValue);
}

RgbColor.prototype.blendWithUnitWeight = function(rgbColor, unitWeightValue) {
	var blendedColor = this.clone();
	
	if (Utility.validateVarAgainstType(rgbColor, RgbColor) && Utility.returnValidNumOrZero(unitWeightValue)) {
		var clampedUnitWeight = Math.min(Math.max(unitWeightValue, 0.0), 1.0);
		
		var blendComplementColor = rgbColor.clone();
		blendComplementColor.scaleComponentsByFactor(clampedUnitWeight)
		
		blendedColor.unitRedValue = blendedColor.unitRedValue * (1.0 - unitWeightValue) +
			blendComplementColor.unitRedValue;
		blendedColor.unitGreenValue = blendedColor.unitGreenValue * (1.0 - unitWeightValue) +
			blendComplementColor.unitGreenValue;
		blendedColor.unitBlueValue = blendedColor.unitBlueValue * (1.0 - unitWeightValue) +
			blendComplementColor.unitBlueValue;
	}
	
	return blendedColor;
}
