

function SineCurve(amplitude, periodMs, phaseShift, resultOffset, baseTime) {
	this.amplitude = Utility.returnValidNumOrZero(amplitude);
	this.periodMs = Utility.returnValidNumOrZero(periodMs);
	this.phaseShift = Utility.returnValidNumOrZero(phaseShift);	
	this.resultOffset = Utility.returnValidNumOrZero(resultOffset);
	this.baseTime = Utility.returnValidNumOrZero(baseTime);
}

SineCurve.prototype.evaluate = function (parameterization) {
	return this.amplitude * Math.sin(this.phaseShift + (Utility.returnValidNumOrZero(parameterization) *
		2.0 * Math.PI));
}

SineCurve.prototype.evaluateWithTime = function (timeMs) {
	return this.evaluate((timeMs - this.baseTime) / ((this.periodMs > 0) ? this.periodMs : 1.0)) +
		this.resultOffset;
}