// ResourceLoader.js - Implements an object employed for the
//                     asynchronous loading of multiple
//                     resources
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js


// Texture sources:
// http://pdtextures.blogspot.com/
// https://pngwing.com.png / https://www.pngegg.com/en/png-zoola ("black rock illustration game tile")
// https://opengameart.org/content/winter-platformer-game-tileset (Author: pzUH)


/**
 * Class serves as a container for loaded resource data,
 *  along with its associated type specifier
 */
function LoadedResourceData(resourceType, resourceData) {
	this.resourceType = resourceType;
	this.resourceDataStore = resourceData;
}


function ResourceLoader() {
	this.queuedResourceSpecifications = null;
	
	this.kLoadSuccessEventName = "load";
	this.kLoadErrorEventName = "error";
	this.kLoadAbortEventName = "abort";
	
	
	this.kResourcePropertyKeyName = "propertyKeyName";
	this.kResourcePropertyUriName = "propertyUriSpecName";
	this.kResourcePropertyBinaryDataState = "propertyResourceIsBinaryData";
	
	this.kResourceDataTypeArrayBuffer = "arrayBuffer";
	this.kResourceDataTypeBlob = "blob";
	this.kResourceDataTypeDocument = "document";
	this.kResourceDataTypeJson = "json";
	this.kResourceDataTypeText = "text";
	
	this.loadedResourceKeyValueStore = null;
	
	this.loadingInitiated = false;
	this.totalRequestInvocationCount = 0;
	this.totalRequestResponseCount = 0;
	
	this.progressFractionFunction = null;
	
	this.completionFunction = null;
}
 
 /**
  * Adds a URI that is associated with a resource to be loaded
  *  (stored internally until resource loading has been intiated)
  *
  * @param resourceKey {String} Key that is to be associated with the loaded
  *                             resource for key-value look-ups
  * @param resourceSourceUri {String} URI that specifies the location of the resource
  * @param resourceIsBinaryData {Boolean} When set to true, the resource will be loaded
  *                                       as binary data
  *
  * @see ResourceLoader.initiateResourceLoading
  */
ResourceLoader.prototype.addResourceSourceUri = function(resourceKey, resourceSourceUri, resourceIsBinaryData) {
	if (Utility.validateVar(resourceSourceUri)) {
		if (this.queuedResourceSpecifications === null) {
			this.queuedResourceSpecifications = [];	
		}
		
		var currentQueuedResourceSpec = new Object();
		
		currentQueuedResourceSpec[this.kResourcePropertyKeyName] = resourceKey;
		currentQueuedResourceSpec[this.kResourcePropertyUriName] = resourceSourceUri;
		currentQueuedResourceSpec[this.kResourcePropertyBinaryDataState] = resourceIsBinaryData;
		
		this.queuedResourceSpecifications.push(currentQueuedResourceSpec);
	}
}

/**
 * Initiates the resource loading process
 *
 * @param completionFunction {function} A function that is invoked after all
 *                                      resource loading attempts have been
 *                                      completed
 *
 */
ResourceLoader.prototype.initiateResourceLoading = function(completionFunction) {
	
	if (Utility.validateVarAgainstType(this.queuedResourceSpecifications, Array) &&
		!this.loadingInitiated) {
			
		if (Utility.validateVarAgainstType(completionFunction, Function)) {
			this.completionFunction = completionFunction;
		}
			
		this.loadingInitiated = true;
		while (this.queuedResourceSpecifications.length > 0) {
			var currentQueuedResourceSpec = this.queuedResourceSpecifications[0];
			this.queuedResourceSpecifications.splice(0, 1);
			this.loadResourceFileInternal(currentQueuedResourceSpec[this.kResourcePropertyKeyName],
				currentQueuedResourceSpec[this.kResourcePropertyUriName],
				currentQueuedResourceSpec[this.kResourcePropertyBinaryDataState]);
		}
	}
	else if (((this.queuedResourceSpecifications == null) ||
		(this.queuedResourceSpecifications.length === 0)) &&
		(typeof completionFunction === "function")) {
			
		completionFunction(this.loadedResourceKeyValueStore);
	}
}

/**
 * Callback function invoked after a resource file has been loaded
 *  successfully
 *
 * @param resourceKey {String} Value to be used as a key for key-value resource
 *                             data look-ups
 * @param httpRequest {XMLHttpRequest} The HTTP request associated with the resource
 *                                     load operation
 */
ResourceLoader.prototype.onResourceLoadSuccessInternal = function(resourceKey, httpRequest) {
	if (this.loadedResourceKeyValueStore === null) {
		this.loadedResourceKeyValueStore = new Object();
	}
		
	if (httpRequest.response !== null) {	
		var resourceDataContainer = new LoadedResourceData(httpRequest.responseType, httpRequest.response);
		this.loadedResourceKeyValueStore[resourceKey] = resourceDataContainer;
	}
	
	this.handleResourceLoadProgessStateChange();
}

/**
 * Callback function invoked after a resource file load operation has
 *  failed
 *
 * @param resourceKey {String} Value to be used as a key for key-value resource
 *                             data look-ups
 * @param httpRequest {XMLHttpRequest} The HTTP request associated with the resource
 *                                     load operation
 */
ResourceLoader.prototype.onResourceLoadFailureInternal = function(resourceKey, httpRequest) {
	this.handleResourceLoadProgessStateChange();
}

/**
 * Callback function invoked after a resource file load operation has been
 *  aborted
 *
 * @param resourceKey {String} Value to be used as a key for key-value resource
 *                             data look-ups
 * @param httpRequest {XMLHttpRequest} The HTTP request associated with the resource
 *                                     load operation
 */
ResourceLoader.prototype.onResourceLoadAbortionInternal = function (resourceKey, httpRequest) {
	this.handleResourceLoadProgessStateChange();
}

/**
 * Reports the load operation completion fraction to an assigned client
 *
 * @see ResourceLoader.setProgressFunction
 */
ResourceLoader.prototype.reportResourceLoadProgress = function() {
	if (Utility.validateVar(this.progressFractionFunction) && (this.totalRequestInvocationCount > 0)) {
		this.progressFractionFunction(
			Math.min((this.totalRequestResponseCount / this.totalRequestInvocationCount), 1.0));
	}
}

/**
 * Conditionally invokes logic when all resource load operations
 *  have been completed
 */
ResourceLoader.prototype.handleCompletionAsRequired = function() {
	if ((this.totalRequestResponseCount == this.totalRequestInvocationCount) &&
		Utility.validateVar(this.completionFunction)) {

		this.completionFunction(this.loadedResourceKeyValueStore);
	}
}

/**
 * Updates internally-maintained data - should be invoked after each
 *  individual resource load operation has completed
 */
ResourceLoader.prototype.handleResourceLoadProgessStateChange = function() {
	this.totalRequestResponseCount++;
	
	this.reportResourceLoadProgress();
	this.handleCompletionAsRequired();	
}

 /**
  * Initiates a resource load operation for a single resource
  *
  * @param resourceKey {String} Key that is to be associated with the loaded
  *                             resource for key-value look-ups
  * @param resourceSourceUri {String} URI that specifies the location of the resource
  * @param resourceIsBinaryData {Boolean} When set to true, the resource will be loaded
  *                                       as binary data
  */
ResourceLoader.prototype.loadResourceFileInternal = function(resourceKey, resourceUri, binaryDataState) {
	
	if (Utility.validateVar(resourceUri) && (typeof resourceUri === "string")) {
		var httpRequest = new XMLHttpRequest();
				
		var loaderInstance = this;
		
		httpRequest.onload = function() {
			loaderInstance.onResourceLoadSuccessInternal(resourceKey, httpRequest);
		}
		
		httpRequest.onerror = function() {
			loaderInstance.onResourceLoadFailureInternal(resourceKey, httpRequest);
		}
		
		httpRequest.onabort = function() {
			loaderInstance.onResourceLoadAbortionInternal(resourceKey, httpRequest);
		}
		
		httpRequest.open("GET", resourceUri);
		if (binaryDataState === true) {
			httpRequest.responseType = "arraybuffer";
		}
		httpRequest.send();
		
		this.totalRequestInvocationCount++;
	}
}

/**
 * Sets the function to be invoked after each resource load operation in order
 *  to report the fractional resource load progress value
 * 
 * @param progressFunction {function} Function that will be invoked in order
 *                                    to report the fractional resource
 *                                    load progress to a client (function
 *                                    receives a single parameter of type
 *                                    {number})
 */
ResourceLoader.prototype.setProgressFunction = function(progressFunction) {
	if (typeof(progressFunction) === "function") {
		this.progressFractionFunction = progressFunction;
	}
}