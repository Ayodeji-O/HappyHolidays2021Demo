// ObjFormatBufferCommonRoutines.js - Routines commonly employed at various stages of .OBJ
//                                    file parsing
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

var ObjBufferParserCommon = {};


ObjBufferParserCommon.constCharacterNewLine = "\n";
ObjBufferParserCommon.constCharacterContinuation = "\\";
ObjBufferParserCommon.constCharacterSpace = " ";

/** 
 * Parses a line containing a set of space-delimited numerical values/coordinates
 *
 * @param inputLine {String} Line containing a space-delimited coordinate/value
 *                           specification set
 */
ObjBufferParserCommon.parseGenericValueLine = function (inputLine) {
	var coordStrArray = inputLine.split(ObjBufferParserCommon.constCharacterSpace);
	var currentCoordSet = []
	
	for (var coordLoop = 0; coordLoop < coordStrArray.length; coordLoop++) {
		// Create an array of "generic" values...
		if (coordStrArray[coordLoop].length > 0) {
			currentCoordSet.push(new Number(coordStrArray[coordLoop]));
		}
		else {
			currentCoordSet.push(0.0);
		}
	}
	
	return currentCoordSet;
}

/** 
 * Separates a buffer into a collection of distinct lines, using newlines and
 *  continuation characters as delimiters
 *
 * @param sourceBuffer {String} Line containing a character buffer to be separated
 *                              into a collection of distinct lines (String objects)
 * @return {Array} Collection distinct String objects, each of which represents
 *                 an individual line within the source buffer
 */
ObjBufferParserCommon.buildNewlineDelineatedBuffer = function (sourceBuffer) {
	// Attempt to separate the buffer logical lines indicated by
	// the continuation character (this step is performed first,
	// as it is not a common case - therefore, iterating the
	// results in order apply the newline separation will be
	// done relatively quickly)
	var continuationDelineatedBuffer = sourceBuffer.split(ObjBufferParserCommon.constCharacterContinuation);
	
	var newlineDelineatedBuffer = null;
	
	for (var continuationBufferLoop = 0; continuationBufferLoop < continuationDelineatedBuffer.length;
		continuationBufferLoop++) {
			
		var currentNewLineDelineatedBuffer = continuationDelineatedBuffer[continuationBufferLoop].split(ObjBufferParserCommon.constCharacterNewLine);
		
		if (newlineDelineatedBuffer === null) {
			newlineDelineatedBuffer = currentNewLineDelineatedBuffer;
		}
		else {
			newlineDelineatedBuffer = newlineDelineatedBuffer.concat(currentNewLineDelineatedBuffer);
		}
	}
	
	return newlineDelineatedBuffer;
}