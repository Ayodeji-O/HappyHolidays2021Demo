function LinearCurve(slope, offset, durationMs) {

	// Slope (value/millisecond)
	this.slope = Utility.returnValidNumOrZero(slope);	
	this.offset = Utility.returnValidNumOrZero(offset);

	this.durationMs = Utility.returnValidNumOrZero(durationMs);
}

LinearCurve.prototype.evaluate = function (parameterization) {
	return this.evaluateWithTime(Utility.returnValidNumOrZero(parameterization) * this.durationMs);
}

LinearCurve.prototype.evaluateWithTime = function (timeMs) {
	return (Utility.returnValidNumOrZero(Math.min(timeMs, this.durationMs)) * this.slope) + this.offset;
}