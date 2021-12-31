// DeviceAttitudeInputEventReceiver.js - Input event reciever that registers for device attitude events
//                                     (accelerometer sensor), translating the events into ScalarInputEvents
//
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// -Utility.js
// -ScalarInputEvent.js


function DeviceAttitudeInputEventReceiver(eventTarget) {
	
	this.eventDispatcher = new CustomCompatibleEventTarget();
	
	this.rawDeviceOrientationAngle = 0;
	
	this.constDeviceOrientationTopUp = 0;
	this.constDeviceOrientationBottomUp = 1;
	this.constDeviceOrientationLeftUp = 2;
	this.constDeviceOrientationRightUp = 3;
	
	this.constAttitudeEffectiveTiltInputSpecifierUp = 0;
	this.constAttitudeEffectiveTiltInputSpecifierDown = 1;
	this.constAttitudeEffectiveTiltInputSpecifierLeft = 2;
	this.constAttitudeEffectiveTiltInputSpecifierRight = 3;
	
	this.scaleFactor = 1.0;
	
	if (eventTarget instanceof Window) {
		this.deviceOrientation = this.deviceOrientationFromWindowOrientationData(window.orientation);
	}
	else {
		this.deviceOrientation = this.constDeviceOrientationTopUp;
	}
	
	this.constDeviceOrientationEventName = "deviceorientation";
	this.constDeviceMotionEventName = "devicemotion";

	if (Utility.validateVar(eventTarget)) {	
		eventTarget.addEventListener(this.constDeviceOrientationEventName, this);
		eventTarget.addEventListener(this.constDeviceMotionEventName, this);
	}		
	
	
	var inputEventReceiverInstance = this;
	function orientationMediaChangeHandler () {
		if (inputEventReceiverInstance.mediaQueryOrientation.matches) {
			inputEventReceiverInstance.deviceOrientation = inputEventReceiverInstance.constDeviceOrientationLeftUp;
		}
		else {			
			inputEventReceiverInstance.deviceOrientation = inputEventReceiverInstance.constDeviceOrientationTopUp;
		}
	}
	
	this.mediaQueryOrientation = window.matchMedia("(orientation: landscape)");
	if (this.mediaQueryOrientation.matches) {
		this.deviceOrientation = inputEventReceiverInstance.constDeviceOrientationLeftUp;
	}
	else {
		this.deviceOrientation = this.constDeviceOrientationTopUp;		
	}
	this.mediaQueryOrientation.addListener(orientationMediaChangeHandler);
}

/**
 * Returns the event dispatcher object that can be employed to forward
 *  events
 *
 * @return {EventTarget} An event target object used to forward events
 */
DeviceAttitudeInputEventReceiver.prototype.getEventDispatcher = function() {
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
DeviceAttitudeInputEventReceiver.prototype.getDispatchedScalarInputEventDataType = function() {
	var constScalarEventTypeData = "_InputStandardDeviceAttitudeScalarEventData";
	
	return constScalarEventTypeData;
}



DeviceAttitudeInputEventReceiver.prototype.deviceOrientationFromWindowOrientationData = function(orientationData) {
	// TODO: Centralize with DeviceMotionInputEventReceiver implementation
	var deviceOrientation = this.constDeviceOrientationTopUp;
	
	
	var orientationHalfRange = 45.0;
	
	var constWindowOrientationPortrait = 0.0;
	var constWindowOrientationPortraitInverted = 180.0;
	var constWindowOrientationLandscape = 90.0; 			// Counterclockwise rotation
	var constWindowOrientationLandscapeInverted = -90.0; 	// Clockwise rotation
		
	if (Utility.validateVar(orientationData)) {
		
		if ((orientationData <= (constWindowOrientationPortrait + orientationHalfRange)) &&
			(orientationData >= (constWindowOrientationPortrait - orientationHalfRange)))
		{
			deviceOrientation = this.constDeviceOrientationTopUp;
		}
		/*else if ((orientationData > (constWindowOrientationPortraitInverted - orientationHalfRange)) &&
			(orientationData < (constWindowOrientationPortraitInverted + orientationHalfRange)))
		{
			deviceOrientation = this.constDeviceOrientationBottomUp;			
		}*/
		else if ((orientationData > (constWindowOrientationLandscape - orientationHalfRange)) &&
			(orientationData < (constWindowOrientationLandscape + orientationHalfRange)))
		{
			deviceOrientation = this.constDeviceOrientationLeftUp;
		}
		else if ((orientationData > (constWindowOrientationLandscapeInverted - orientationHalfRange)) &&
			(orientationData < (constWindowOrientationLandscapeInverted + orientationHalfRange)))
		{
			deviceOrientation = this.constDeviceOrientationRightUp;
		}
			
		
		switch (orientationData) {
			case constWindowOrientationPortrait:
				deviceOrientation = this.constDeviceOrientationTopUp;
				break;
			case constWindowOrientationPortraitInverted:
				deviceOrientation = this.constDeviceOrientationBottomUp;
				break;
			case constWindowOrientationLandscape:
				deviceOrientation = this.constDeviceOrientationLeftUp;
				break;
			case constWindowOrientationLandscapeInverted:
				deviceOrientation = this.constDeviceOrientationRightUp;
				break;
			default:
				break;
		}
	}
	
	return deviceOrientation;
}

DeviceAttitudeInputEventReceiver.prototype.getInterpretedDeviceOrientation = function() {
	var deviceOrientation = this.deviceOrientation;
	
	if ((deviceOrientation === this.constDeviceOrientationLeftUp) && (this.rawDeviceOrientationAngle <= 0)) {
		deviceOrientation = this.constDeviceOrientationRightUp;
	}
	
	return deviceOrientation;
}

DeviceAttitudeInputEventReceiver.prototype.handleEvent = function(event) {
	if (event.type === this.constDeviceOrientationEventName) {
		// Device orientation events will be used to in an attempt to
		// resolve the orientation of the device, in conjunction with
		// media query events.
		this.handleDeviceOrientationEvent(event);
	}
	else if (event.type === this.constDeviceMotionEventName) {
		this.handleDeviceMotionEvent(event);
	}
}

DeviceAttitudeInputEventReceiver.prototype.handleDeviceOrientationEvent = function(deviceOrientationEvent) {
	this.rawDeviceOrientationAngle = deviceOrientationEvent.gamma;
}

DeviceAttitudeInputEventReceiver.prototype.handleDeviceMotionEvent = function(deviceMotionEvent) {
	
	switch (this.deviceOrientation) {
		case this.constDeviceOrientationTopUp:
			break;
		case this.constDeviceOrientationBottomUp:
			break;		
		case this.constDeviceOrientationLeftUp:
			break;		
		case this.constDeviceOrientationRightUp:
			break;
		default:
			break;
		
	}
	
	var scalarInputEventType = this.getDispatchedScalarInputEventDataType();
	
	// Construct the scalar input event (clients can handle scalar input
	// events without consideration for binary states, etc.).
	var scalarInputEvent = new ScalarInputEvent();
	
	scalarInputEvent.inputEventType = scalarInputEventType;
	
	// Alpha - Z-axis; Beta - X-axis; Gamma - Y-axis

	var scalarValueAxisX = this.getUnitInputMagnitudeForAxisX(deviceMotionEvent);

	scalarInputEvent.inputEventCode = (scalarValueAxisX >= 0.0) ? this.constAttitudeEffectiveTiltInputSpecifierLeft :
		this.constAttitudeEffectiveTiltInputSpecifierRight;			
	scalarInputEvent.inputUnitMagnitude = Math.abs(scalarValueAxisX);
	var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
	this.eventDispatcher.dispatchEvent(customEvent);		
	
	
	var scalarValueAxisY = this.getUnitInputMagnitudeForAxisY(deviceMotionEvent);
		
	scalarInputEvent.inputEventCode = (scalarValueAxisY >= 0.0) ? this.constAttitudeEffectiveTiltInputSpecifierDown :
		this.constAttitudeEffectiveTiltInputSpecifierUp;
	scalarInputEvent.inputUnitMagnitude = Math.abs(scalarValueAxisY);
	var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
	this.eventDispatcher.dispatchEvent(customEvent);

	//var scalarValueAxisZ = this.getUnitInputMagnitudeForAxisZ(deviceMotionEvent);
	
}

DeviceAttitudeInputEventReceiver.prototype.getNormalizedAccelerationValue = function(deviceAcceleration) {
	const gravitationalAccelMetersPerSec = 9.81;
	
	var constMinAccelValue = 0.85;
	
	var scaledAccelerationValue = (constMinAccelValue <= Math.abs(deviceAcceleration)) ?
		deviceAcceleration * this.scaleFactor : 0.0;
	
	return Math.min(Math.abs(scaledAccelerationValue / gravitationalAccelMetersPerSec), 1.0) *
		(deviceAcceleration < 0.0 ? -1.0 : 1.0);
	
}

DeviceAttitudeInputEventReceiver.prototype.getUnitInputMagnitudeForAxisX = function(deviceMotionEvent) {
	
	var correspondingAcceleration = 0.0;
	
	var interpretedDeviceOrientation = this.getInterpretedDeviceOrientation();
	
	if (deviceMotionEvent.accelerationIncludingGravity.x != null) {
		switch (interpretedDeviceOrientation) {
			case this.constDeviceOrientationTopUp:
				correspondingAcceleration = deviceMotionEvent.accelerationIncludingGravity.x;
				break;
			case this.constDeviceOrientationBottomUp:
				correspondingAcceleration = -deviceMotionEvent.accelerationIncludingGravity.x;
				break;		
			case this.constDeviceOrientationLeftUp:
				correspondingAcceleration = deviceMotionEvent.accelerationIncludingGravity.y;
				break;		
			case this.constDeviceOrientationRightUp:
				correspondingAcceleration = -deviceMotionEvent.accelerationIncludingGravity.y;
				break;
			default:
				break;
			
		}
	}
	
	return this.getNormalizedAccelerationValue(correspondingAcceleration);
}


DeviceAttitudeInputEventReceiver.prototype.getUnitInputMagnitudeForAxisY = function(deviceMotionEvent) {
	
	var correspondingAcceleration = 0.0;
	
	var interpretedDeviceOrientation = this.getInterpretedDeviceOrientation();	
	
	if (deviceMotionEvent.accelerationIncludingGravity.y !== null) {	
		switch (interpretedDeviceOrientation) {
			case this.constDeviceOrientationTopUp:
				correspondingAcceleration = deviceMotionEvent.accelerationIncludingGravity.y;
				break;
			case this.constDeviceOrientationBottomUp:
				correspondingAcceleration = -deviceMotionEvent.accelerationIncludingGravity.y;
				break;		
			case this.constDeviceOrientationLeftUp:
				correspondingAcceleration = deviceMotionEvent.accelerationIncludingGravity.x;
				break;		
			case this.constDeviceOrientationRightUp:
				correspondingAcceleration = -deviceMotionEvent.accelerationIncludingGravity.x;
				break;
			default:
				break;
			
		}
	}
	
	return this.getNormalizedAccelerationValue(correspondingAcceleration);
}

DeviceAttitudeInputEventReceiver.prototype.setScaleFactor = function (scaleFactor) {
	this.scaleFactor = Utility.returnValidNumOrZero(scaleFactor);
	
}