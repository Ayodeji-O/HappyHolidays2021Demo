// DeviceMotionInputEventReceiver.js - Input event reciever that registers for device motion events
//                                     (gyro/rotation sensor), translating the events into ScalarInputEvents
//
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// -Utility.js
// -ScalarInputEvent.js


function DeviceMotionInputEventReceiver(eventTarget) {
	
	this.eventDispatcher = new CustomCompatibleEventTarget();
	
	this.constDeviceOrientationTopUp = 0;
	this.constDeviceOrientationBottomUp = 1;
	this.constDeviceOrientationLeftUp = 2;
	this.constDeviceOrientationRightUp = 3;
	
	this.constRotationInputSpecifierUp = 0;
	this.constRotationInputSpecifierDown = 1;
	this.constRotationInputSpecifierLeft = 2;
	this.constRotationInputSpecifierRight = 3;
	
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
}

/**
 * Returns the event dispatcher object that can be employed to forward
 *  events
 *
 * @return {EventTarget} An event target object used to forward events
 */
DeviceMotionInputEventReceiver.prototype.getEventDispatcher = function() {
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
DeviceMotionInputEventReceiver.prototype.getDispatchedScalarInputEventDataType = function() {
	var constScalarEventTypeData = "_InputStandardDeviceMotionScalarEventData";
	
	return constScalarEventTypeData;
}

DeviceMotionInputEventReceiver.prototype.deviceOrientationFromWindowOrientationData = function(orientationData) {
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
		else if ((orientationData > (constWindowOrientationLandscapeInverted + orientationHalfRange)) &&
			(orientationData < (constWindowOrientationLandscapeInverted - orientationHalfRange)))
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

DeviceMotionInputEventReceiver.prototype.handleEvent = function(event) {
	if (event.type === this.constDeviceOrientationEventName) {
		this.handleDeviceOrientationEvent(event);
	}
	else if (event.type === this.constDeviceMotionEventName) {
		this.handleDeviceMotionEvent(event);
	}
}

DeviceMotionInputEventReceiver.prototype.handleDeviceOrientationEvent = function(deviceOrientationEvent) {
	this.deviceOrientation = this.deviceOrientationFromWindowOrientationData(deviceOrientationEvent.gamma);
}

DeviceMotionInputEventReceiver.prototype.handleDeviceMotionEvent = function(deviceMotionEvent) {


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

	scalarInputEvent.inputEventCode = (scalarValueAxisX >= 0.0) ? this.constRotationInputSpecifierRight :
		this.constRotationInputSpecifierLeft;			
	scalarInputEvent.inputUnitMagnitude = Math.abs(scalarValueAxisX);
	var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
	this.eventDispatcher.dispatchEvent(customEvent);		
	
	
	var scalarValueAxisY = this.getUnitInputMagnitudeForAxisY(deviceMotionEvent);
		
	scalarInputEvent.inputEventCode = (scalarValueAxisY >= 0.0) ? this.constRotationInputSpecifierUp :
	this.constRotationInputSpecifierDown;
	scalarInputEvent.inputUnitMagnitude = Math.abs(scalarValueAxisY);
	var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
	this.eventDispatcher.dispatchEvent(customEvent);		
	
	
	// Prevent default event handling...
	//event.preventDefault();
}

DeviceMotionInputEventReceiver.prototype.getNormalizeRotationRateValue = function(deviceRotationRate) {
	var maxScalableRotationRateDegAbs = 20.0;
	var minRotationRateFilterDegAbs = 5.0;
	
	var normalizedValue = 0.0;
	
	if (Utility.validateVar(deviceRotationRate) && (Math.abs(deviceRotationRate) > minRotationRateFilterDegAbs)) {
		var absNormalizedValue = Math.min(Math.abs(deviceRotationRate) / maxScalableRotationRateDegAbs, 1.0);
		var normalizedValue = absNormalizedValue * ((deviceRotationRate > 0.0) ? 1.0 : -1.0);		
	}
	
	return normalizedValue;
	
}

DeviceMotionInputEventReceiver.prototype.getUnitInputMagnitudeForAxisX = function(deviceMotionEvent) {
	
	var correspondingRotationRate = 0.0;
	
	
	if ( deviceMotionEvent.rotationRate.beta != null) {
	//deviceMotionEvent.rotationRate.beta
		switch (this.deviceOrientation) {
			case this.constDeviceOrientationTopUp:
				correspondingRotationRate = deviceMotionEvent.rotationRate.beta;
				break;
			case this.constDeviceOrientationBottomUp:
				correspondingRotationRate = -deviceMotionEvent.rotationRate.beta;
				break;		
			case this.constDeviceOrientationLeftUp:
				correspondingRotationRate = deviceMotionEvent.rotationRate.alpha;
				break;		
			case this.constDeviceOrientationRightUp:
				correspondingRotationRate = -deviceMotionEvent.rotationRate.alpha;
				break;
			default:
				break;
			
		}
	}
	
	return this.getNormalizeRotationRateValue(correspondingRotationRate);
}


DeviceMotionInputEventReceiver.prototype.getUnitInputMagnitudeForAxisY = function(deviceMotionEvent) {
	
	var correspondingRotationRate = 0.0;
	
	if (deviceMotionEvent.rotationRate.alpha !== null) {
	//deviceMotionEvent.rotationRate.gamma
	
		switch (this.deviceOrientation) {
			case this.constDeviceOrientationTopUp:
				correspondingRotationRate = deviceMotionEvent.rotationRate.alpha;
				break;
			case this.constDeviceOrientationBottomUp:
				correspondingRotationRate = -deviceMotionEvent.rotationRate.alpha;
				break;		
			case this.constDeviceOrientationLeftUp:
				correspondingRotationRate = deviceMotionEvent.rotationRate.beta;
				break;		
			case this.constDeviceOrientationRightUp:
				correspondingRotationRate = -deviceMotionEvent.rotationRate.beta;			
				break;
			default:
				break;
			
		}
	}
	
	return this.getNormalizeRotationRateValue(correspondingRotationRate);
}
