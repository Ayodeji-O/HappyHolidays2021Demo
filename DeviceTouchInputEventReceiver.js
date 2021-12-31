// DeviceTouchInputEventReceiver.js - Input event reciever that registers for touch events,
//                                    translating the events into ScalarInputEvents
//
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// -Utility.js
// -ScalarInputEvent.js



function DeviceTouchInputEventReceiver(eventTarget, maxMagnitudeDisplacementX, maxMagnitudeDisplacementY) {
	this.eventDispatcher = new CustomCompatibleEventTarget();

	this.constDeviceTouchStartEventName = "touchstart";
	this.constDeviceTouchEndEventName = "touchend";
	this.constDeviceTouchMoveEventName = "touchmove";

	this.constTouchInputSpecifier = 0;
	this.constTouchInputMoveSpecifierUp = 1;
	this.constTouchInputMoveSpecifierDown = 2;
	this.constTouchInputMoveSpecifierLeft = 3;
	this.constTouchInputMoveSpecifierRight = 4;
	
	this.touchStartCoordX = null;
	this.touchStartCoordY = null;
	
	this.maxMagnitudeDisplacementX = Utility.validateVar(maxMagnitudeDisplacementX) ?
		maxMagnitudeDisplacementX : 100.0;
	this.maxMagnitudeDisplacementY = Utility.validateVar(maxMagnitudeDisplacementY) ?
		maxMagnitudeDisplacementY : 100.0;

	if (Utility.validateVar(eventTarget)) {	
		eventTarget.addEventListener(this.constDeviceTouchStartEventName, this);
		eventTarget.addEventListener(this.constDeviceTouchEndEventName, this);
		eventTarget.addEventListener(this.constDeviceTouchMoveEventName, this);
	}	
}

/**
 * Returns the event dispatcher object that can be employed to forward
 *  events
 *
 * @return {EventTarget} An event target object used to forward events
 */
DeviceTouchInputEventReceiver.prototype.getEventDispatcher = function() {
	return this.eventDispatcher;
}

/**
 * Method required by all scalar input event dispatching
 *  implementations - returns the identifier of the data type associated with
 *  scalar input events
 *
 * @return {String} Data type identifier for the data included in the Event.detail
 *                  field for scalar input events
 */
DeviceTouchInputEventReceiver.prototype.getDispatchedScalarInputEventDataType = function() {
	var constScalarEventTypeData = "_InputStandardDeviceTouchScalarEventData";
	
	return constScalarEventTypeData;
}

DeviceTouchInputEventReceiver.prototype.handleEvent = function(event) {	
	var scalarInputEventType = this.getDispatchedScalarInputEventDataType();
	
	// Construct the scalar input event (clients can handle scalar input
	// events without consideration for binary states, etc.).
	var scalarInputEvent = new ScalarInputEvent();
	
	scalarInputEvent.inputEventType = scalarInputEventType;	
	scalarInputEvent.inputEventCode = this.constTouchInputSpecifier;

	if (event.type === this.constDeviceTouchStartEventName) {
		this.touchStartCoordX = event.touches[0].clientX;
		this.touchStartCoordY = event.touches[0].clientY;
		scalarInputEvent.inputEventCode = this.constTouchInputSpecifier;
		scalarInputEvent.inputUnitMagnitude = Constants.maxScalarInputEventMagnitude;
		
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);
	}
	else if (event.type === this.constDeviceTouchEndEventName) {
		this.touchStartCoordX = null;
		this.touchStartCoordY = null;
		scalarInputEvent.inputEventCode = this.constTouchInputSpecifier;
		scalarInputEvent.inputUnitMagnitude = 0.0;
		
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);
		
		scalarInputEvent.inputEventCode = this.constTouchInputMoveSpecifierLeft;
		scalarInputEvent.inputUnitMagnitude = 0.0;
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);
		
		scalarInputEvent.inputEventCode = this.constTouchInputMoveSpecifierRight;
		scalarInputEvent.inputUnitMagnitude = 0.0;
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);		
		
		scalarInputEvent.inputEventCode = this.constTouchInputMoveSpecifierUp;
		scalarInputEvent.inputUnitMagnitude = 0.0;
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);
		
		scalarInputEvent.inputEventCode = this.constTouchInputMoveSpecifierDown;
		scalarInputEvent.inputUnitMagnitude = 0.0;
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);		
	}
	else if (event.type === this.constDeviceTouchMoveEventName) {
		// Negate the Y coordinate in order to express displacement
		// in terms of a standard Cartesian coordinate system, where
		// values along the Y-axis increase traveling upward.
		var movementDeltaX = event.touches[0].clientX - this.touchStartCoordX;
		var movementDeltaY = event.touches[0].clientY - this.touchStartCoordY;
		
		var unitMagnitudeX = Math.min(Math.abs(movementDeltaX) / Math.abs(this.maxMagnitudeDisplacementX), 1.0);
		var unitMagnitudeY = Math.min(Math.abs(movementDeltaY) / Math.abs(this.maxMagnitudeDisplacementY), 1.0);

		scalarInputEvent.inputEventCode = (movementDeltaX >= 0) ? this.constTouchInputMoveSpecifierRight : this.constTouchInputMoveSpecifierLeft;
		scalarInputEvent.inputUnitMagnitude = unitMagnitudeX;
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);
		
		scalarInputEvent.inputEventCode = (movementDeltaY <= 0) ? this.constTouchInputMoveSpecifierUp : this.constTouchInputMoveSpecifierDown;
		scalarInputEvent.inputUnitMagnitude = unitMagnitudeY;
		var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
		this.eventDispatcher.dispatchEvent(customEvent);
	}
	else {
		scalarInputEvent.inputUnitMagnitude = 0.0;
	}


}
