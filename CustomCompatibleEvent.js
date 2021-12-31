// CustomCompatibleEvent.js - Emulates the behavior of CustomEvent, which is not
//                            supported by all platforms
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

function CustomCompatibleEvent(eventType, initDictionary) {
	
	this.eventType = null;
	
	if (Utility.validateVar(eventType)) {
		this.type = eventType;
	}
	
	if (Utility.validateVar(initDictionary)) {
		for (var property in initDictionary) {
			// Do not overwrite existing properties...
			if (!Utility.validateVar(this[property])) {
				this[property] = initDictionary[property];
			}
		}
	}
}


