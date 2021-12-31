// CustomCompatibleEventTarget.js - Emulates the behavior of EventTarget, which is not
//                                  supported by all platforms
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

function CustomCompatibleEventTarget() {

	this.eventNameListenersKeyValueStore = {};

}


CustomCompatibleEventTarget.prototype.addEventListener = function(eventName, listener) {
	if (Utility.validateVar(eventName) && Utility.validateVar(listener)) {
		
		if (!Utility.validateVar(this.eventNameListenersKeyValueStore[eventName])) {
			this.eventNameListenersKeyValueStore[eventName] = [];
		}
		
		if (!this.eventNameListenersKeyValueStore[eventName].includes(listener)) {
			this.eventNameListenersKeyValueStore[eventName].push(listener);
		}
	}
}


CustomCompatibleEventTarget.prototype.removeEventListener = function(eventName, listener) {
	if (Utility.validateVar(eventName) && Utility.validateVar(listener)) {
		if (Utility.validateVar(this.eventNameListenersKeyValueStore[eventName])) {
			var listenerIndex = this.eventNameListenersKeyValueStore[eventName].indexOf(listener);
			if (listenerIndex >= 0) {
				this.eventNameListenersKeyValueStore[eventName].splice(listenerIndex, 1);	
			}
		}			
	}
}


CustomCompatibleEventTarget.prototype.dispatchEvent = function(event) {
	if (Utility.validateVarAgainstType(event, CustomCompatibleEvent)) {
		if (Utility.validateVar(this.eventNameListenersKeyValueStore[event.type])) {
			for (var currentListenerIndex = 0; currentListenerIndex < this.eventNameListenersKeyValueStore[event.type].length;
				currentListenerIndex++) {
					
				this.eventNameListenersKeyValueStore[event.type][currentListenerIndex].handleEvent(event);
			}
		}
	}
}