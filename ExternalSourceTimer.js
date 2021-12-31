// ExternalSourceTimer.js - Implements a timer driven by an external clock source
//
// Dependent upon:
//  -Utility.js

function ExternalSourceTimer(targetDurationMs, completionCallback, identifier, periodicCallback,) {
	this.elapsedTimeMs = 0;
	this.completionCallback = completionCallback;
	this.identifier = identifier;
	this.targetDurationMs = Utility.returnValidNumOrZero(targetDurationMs);
	this.periodicCallback = periodicCallback;
}

ExternalSourceTimer.prototype.invokeTimerUpdate = function (timeQuantum) {
	var timeIncrementMs = Utility.returnValidNumOrZero(timeQuantum);
	if (!this.isExpired()) {
		this.elapsedTimeMs += timeQuantum;
		
		if (!this.isExpired()) {
			if (typeof this.periodicCallback === "function") {
				this.periodicCallback(this.elapsedTimeMs, this.identifier);
			}
		}
		else if (this.isExpired() &&
			(typeof this.completionCallback === "function")) {
				
			var resolvedIdentifier = Utility.validateVar(this.identifier) ? this.identifier : "";	
			
			this.completionCallback(resolvedIdentifier);
		}
	}
}

ExternalSourceTimer.prototype.isExpired = function () {
	return (this.elapsedTimeMs >= this.targetDurationMs);
}