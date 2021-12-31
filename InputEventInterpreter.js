// InputEventInterpreter.js - Serves as a mechanism for binding scalar input events to designated
//                            function handlers (class methods)
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// -Utility.js

function InputEventInterpreterCodeHandlerInfo() {
	this.functionOwner = null;
	this.targetFunction = null;
}

function InputEventInterpreter() {

	this.eventReceiverHandlerSetKeyValueStore = {};
	
}

/**
 * Binds an event to a specific client
 *
 * @param eventSource Input receiver that receives input from a specific device
 *                    (must implement getDispatchedScalarInputEventDataType(), 
 *                    getEventDispatcher())
 * @param eventCode {String} Code that uniquely identifies the input event amongst
 *                           other input events for the represented device
 * @param functionOwner {Object} Object instance that contains the method to be
 *                               invoked when the event is received
 * @param targetFunction {function} Function to be invoked when the event is received
 */
InputEventInterpreter.prototype.bindInputEventToFunction = function(eventSource, eventCode, functionOwner, targetFunction) {
	if (Utility.validateVar(eventSource) && Utility.validateVar(eventCode) && Utility.validateVar(functionOwner) &&
		Utility.validateVar(targetFunction)) {
			
		var eventDataTypeString = eventSource.getDispatchedScalarInputEventDataType();
			
		var eventDispatcher = eventSource.getEventDispatcher();
		if (Utility.validateVar(eventDispatcher)) {
			
			if (!Utility.validateVar(this.eventReceiverHandlerSetKeyValueStore[eventDataTypeString])) {
				eventDispatcher.addEventListener(Constants.eventTypeScalarInput, this);
				
				this.eventReceiverHandlerSetKeyValueStore[eventDataTypeString] = {};
			}
			
			this.eventReceiverHandlerSetKeyValueStore[eventDataTypeString][eventCode] = new InputEventInterpreterCodeHandlerInfo();
			this.eventReceiverHandlerSetKeyValueStore[eventDataTypeString][eventCode].functionOwner = functionOwner;
			this.eventReceiverHandlerSetKeyValueStore[eventDataTypeString][eventCode].targetFunction = targetFunction;
		}
	}
}

/**
 * Receives an event, and dispatches the attached scalar input event to the
 *  associated client
 */
InputEventInterpreter.prototype.handleEvent = function(event) {
	if (Utility.validateVar(event) && (event.type === Constants.eventTypeScalarInput)) {
		var inputEventDataType = event.detail.inputEventType;
		if (Utility.validateVar(this.eventReceiverHandlerSetKeyValueStore[inputEventDataType]) &&
			Utility.validateVar(this.eventReceiverHandlerSetKeyValueStore[inputEventDataType][event.detail.inputEventCode])) {
				
			var functionOwner =
				this.eventReceiverHandlerSetKeyValueStore[inputEventDataType][event.detail.inputEventCode].functionOwner;
			var targetFunction =
				this.eventReceiverHandlerSetKeyValueStore[inputEventDataType][event.detail.inputEventCode].targetFunction;

			// Call the input handler on the object that contains the input handler
			// method, passing the ScalarInputEvent object as a parameter.
			targetFunction.call(functionOwner, event.detail);
			
		}
	}
}
