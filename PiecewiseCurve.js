function PiecewiseCurve(baseValue) {

	this.pairCurvePos = 0;
	this.pairDurationPos = 1;
	
	this.baseValue = Utility.returnValidNumOrZero(baseValue);
	
	this.curvesWithDurations = [];
}

PiecewiseCurve.prototype.totalDurationMs = function() {
	var durationMs = 0;
	
	for (var currentDuration of this.curvesWithDurations) {
		durationMs += currentDuration[this.pairDurationPos];
	}

	return durationMs;
}

PiecewiseCurve.prototype.addCurve = function (curve, duration) {
	curvesWithDurations.push([curve, duration]);
}

PiecewiseCurve.prototype.evaluate = function (parameterization) {
	var time = Utility.returnValidNumOrZero(parameterization) * this.totalDurationMs();
	
	return this.evaluateWithTime(time);
}

PiecewiseCurve.prototype.evaluateWithTime = function (timeMs) {
	var targetCurveDurationPair = this.curveWithDurationForTime(timeMs);
	
	var timeForCurve = timeMs - targetCurveDurationPair[pairDurationPos];
	return (targetCurveDurationPair !== null) ?
		targetCurveDurationPair[pairCurvePos].evaluateWithTime(timeForCurve) : 0;
}

PiecewiseCurve.prototype.curveWithDurationForTime = function (timeMs) {
	var curveWithDuration = null;
	
	var currentIndex = 0;
	while ((currentIndex < this.curvesWithDurations.length) &&
		(curveWithDuration === null)) {
		
		if (timeMs >= this.curvesWithDurations[currentIndex][pairDurationPos]) {
			curveWithDuration = this.curveWithDuration[currentIndex];
		}
		
		currentIndex++;
	}

	return curveWithDuration;
}