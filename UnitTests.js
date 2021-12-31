function UnitTestInterface() {
	this.testCollection = [
		[ "Rect intersection #1",														TestRectIntersection1						    ],
	];

	this.constTestDescriptionIndex = 0;
	this.constTestFunctionIndex = 1;
}


UnitTestInterface.prototype.executeTests = function () {
	var failedTestCollection = [];

	for (var testLoop = 0; testLoop < this.testCollection.length; testLoop++) {
		
		var currentTestFunction = this.testCollection[testLoop][this.constTestFunctionIndex];
		if (!currentTestFunction()) {
			failedTestCollection.push(this.testCollection[testLoop][this.constTestDescriptionIndex]);
		}
	}
	
	if (failedTestCollection.length > 0) {
		var failedTestsString = "Test Failures Occurred:\n\n";
		
		for (var failedTestLoop = 0; failedTestLoop < failedTestCollection.length; failedTestLoop++) {
			failedTestsString += failedTestCollection[failedTestLoop] + "\n";			
		}
		
		alert(failedTestsString);
	}
}

function TestRectIntersectionParsing () {
	var testSucceeded = false;
	
	left, top, width, height
	
	var firstRectangle = Rectangle(
		0.5589999999999999,
		0.559,
		0.086,
		0.086		
	);
	var secondRectangle = Rectangle(
	);
	
	testSucceeded = firstRectangle.intersectsRect(secondRectangle);
	
	return testSucceeded;
}