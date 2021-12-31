// KeyboardInputEventReceiver.js - Input event reciever that registers for keyboard events,
//                                 translating the events into ScalarInputEvents
//
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// -ScalarInputEvent.js

function KeyboardInputEventReceiver(eventTarget) {
	
	this.eventDispatcher = new CustomCompatibleEventTarget();
	
	this.constKeyDownEventName = "keydown";
	this.constKeyUpEventName = "keyup";
	
	this.constKeySpecifierArrowUp = 0;
	this.constKeySpecifierArrowDown = 1;
	this.constKeySpecifierArrowLeft = 2;
	this.constKeySpecifierArrowRight = 3;
	this.constKeySpecifierSpace = 4;
	
	
	if (Utility.validateVar(eventTarget)) {	
		eventTarget.addEventListener(this.constKeyDownEventName, this);
		eventTarget.addEventListener(this.constKeyUpEventName, this);
	}
}

/**
 * Returns the event dispatcher object that can be employed to forward
 *  events
 *
 * @return {EventTarget} An event target object used to forward events
 */
KeyboardInputEventReceiver.prototype.getEventDispatcher = function() {
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
KeyboardInputEventReceiver.prototype.getDispatchedScalarInputEventDataType = function() {
	var constScalarEventTypeData = "_InputStandardKeyboardScalarEventData";
	
	return constScalarEventTypeData;
}

KeyboardInputEventReceiver.prototype.convertKeyIdentifierToInternalSpec = function(eventKeyId) {
	var keySpecifier = null;

	var keyCodeMappingKeyValueStore = {};
	
	keyCodeMappingKeyValueStore[38] = this.constKeySpecifierArrowUp;
	keyCodeMappingKeyValueStore[40] = this.constKeySpecifierArrowDown;
	keyCodeMappingKeyValueStore[37] = this.constKeySpecifierArrowLeft;
	keyCodeMappingKeyValueStore[39] = this.constKeySpecifierArrowRight;
	keyCodeMappingKeyValueStore[32] = this.constKeySpecifierSpace;
	
	keySpecifier = keyCodeMappingKeyValueStore[eventKeyId];
	
	return keySpecifier;
}

KeyboardInputEventReceiver.prototype.handleEvent = function(event) {

	// KeyEvent.keyCode is deprecated; however, it is compatible with more
	// browser versions than KeyEvent.key
	var keySpecifier = this.convertKeyIdentifierToInternalSpec(event.keyCode);
	
	var scalarInputEventType = this.getDispatchedScalarInputEventDataType();
	
	// Construct the scalar input event (clients can handle scalar input
	// events without consideration for binary states, etc.).
	var scalarInputEvent = new ScalarInputEvent();
	
	scalarInputEvent.inputEventType = scalarInputEventType;
	scalarInputEvent.inputEventCode = keySpecifier;
	if (event.type === this.constKeyDownEventName) {
		scalarInputEvent.inputUnitMagnitude = Constants.maxScalarInputEventMagnitude;
	}
	else {
		scalarInputEvent.inputUnitMagnitude = 0.0;
	}
		
	// Prevent default event handling...
	event.preventDefault();
	
	var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
	this.eventDispatcher.dispatchEvent(customEvent);
}



