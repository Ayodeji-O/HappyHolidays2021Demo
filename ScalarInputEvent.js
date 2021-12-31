// ScalarInputEvent.js - Encapsulates an object that represents device input
//                       that can vary in magnitude
// Author: Ayodeji Oshinnaiye


function ScalarInputEvent() {
		
	// Event type identifier
	this.inputEventType = null;
	this.inputSource = 0;// ?
	
	// Input magnitude (between 0.0 - 1.0, inclusive)
	this.inputUnitMagnitude = 0.0;
	
	// Type-specific input event code
	this.inputEventCode;
}

