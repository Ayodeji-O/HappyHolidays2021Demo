// ObjFormatBufferParser.js - Implementation that generates collections of polygon data
//                            from the contained vertex information
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -ObjBufferParserCommonRoutines.js


/**
 * Class that represents parsed data for a single
 *  vertex
 */
function VertexDefinition() {
	this.coordX = 0.0;
	this.coordY = 0.0;
	this.coordZ = 0.0;
	
	this.colorComponentRed = 0.0;
	this.colorComponentGreen = 0.0;
	this.colorComponentBlue = 0.0;
	
	this.texCoordU = 0.0;
	this.texCoordV = 0.0;
	
	this.normalComponentX = 0.0;
	this.normalComponentY = 0.0;
	this.normalComponentZ = 0.0;
}

/**
 * Class that represents parsed data for a single polygon
 *  face
 */
function ModelFaceDefinition() {
	// Array of VertexDefinition objects.
	this.vertexCollection = [];
}

/**
 * Class that serves as an implementation to parse a buffer
 *  containing .OBJ-formatted vertex/face data. The accompanying
 *  material file data is ignored during the parsing process
 *  (only color, vertex, and normal data is parsed)
 */
function ObjFormatBufferParser(sourceBuffer) {

	this.kCharacterVertexAttrJoin = "/";
	
	this.kCommandCommentStr = "#"
	this.kCommandVertexStr = "v";
	this.kCommandVertexTexCoordStr = "vt";
	this.kCommandVertexNormalStr = "vn";
	this.kCommandVertexFaceStr = "f";
	this.kCommandGroupStr = "g";
	this.kCommandUseMaterialStr = "usemtl";
	
	this.kVertexSpecVertexCoordIndex = 0;
	this.kVertexSpecTextureCoordIndex = 1;
	this.kVertexSpecNormalCoordIndex = 2;
	
	
	this.sourceBuffer = sourceBuffer;
	
	// Array of vertex coordinate arrays
	this.vertexCoords = [];
	// Array of vertex normal component arrays
	this.vertexNormalCoords = [];
	// Array of vertex texture coordinate arrays
	this.vertexTextureCoords = [];
	
	
	this.constructedModelFaceCollection = [];
	
	this.vertexDefinitionProcessor = null;
}

/**
 * Initiates the parsing process, internally storing the
 *  parsed data in the appropriate structures (vertices,
 *  polygons, etc.)
 */
ObjFormatBufferParser.prototype.initiateParsing = function() {
	var parsingCompleted = false;
	
	if (Utility.validateVar(this.sourceBuffer)) {		
		var newlineDelineatedBuffer = ObjBufferParserCommon.buildNewlineDelineatedBuffer(this.sourceBuffer);
		
		for (var lineParseLoop = 0; lineParseLoop < newlineDelineatedBuffer.length; lineParseLoop++) {
			// Parse each line, first ensuring that there is no terminal whiteSpace
			// which may interfere with the parsing process.
			this.parseSingleLine(newlineDelineatedBuffer[lineParseLoop].trim());
		}
		
		this.postProcessParsedData();
	
		parsingCompleted = this.constructedModelFaceCollection.length > 0;
	}
	
	return parsingCompleted;
}

/**
 * Parses a single line from the .OBJ buffer
 * 
 * @param singleLineBuffer {String} The line from the .OBJ buffer to be parsed
 */
ObjFormatBufferParser.prototype.parseSingleLine = function(singleLineBuffer) {
	if (Utility.validateVar(singleLineBuffer)) {
		if (singleLineBuffer.startsWith(this.kCommandCommentStr)) {
			// Comment line
			this.parseCommentLine((singleLineBuffer.slice(this.kCommandCommentStr.length)).trim());			
		}
		else if (singleLineBuffer.startsWith(this.kCommandUseMaterialStr)) {
			// "Use material" command line
			this.parseMaterialLine((singleLineBuffer.slice(this.kCommandUseMaterialStr.length)).trim());			
		}
		else if (singleLineBuffer.startsWith(this.kCommandVertexNormalStr)) {
			// "Vertex normal" command line
			this.parseVertexNormalLine((singleLineBuffer.slice(this.kCommandVertexNormalStr.length)).trim());			
		}
		else if (singleLineBuffer.startsWith(this.kCommandVertexTexCoordStr)) {
			// "Vertex texture coordinate" command line
			this.parseTexCoordLine((singleLineBuffer.slice(this.kCommandVertexTexCoordStr.length)).trim());			
		}
		else if (singleLineBuffer.startsWith(this.kCommandVertexStr)) {
			// "Vertex coordinate" command line
			this.parseVertexLine((singleLineBuffer.slice(this.kCommandVertexStr.length)).trim());			
		}
		else if (singleLineBuffer.startsWith(this.kCommandGroupStr)) {
			// "Group" command line
			this.parseGroupLine((singleLineBuffer.slice(this.kCommandGroupStr.length)).trim());			
		}
		else if (singleLineBuffer.startsWith(this.kCommandVertexFaceStr)) {
			// "Face" (composition of vertices) command line
			this.parseVertexFaceLine((singleLineBuffer.slice(this.kCommandVertexFaceStr.length)).trim());
		}	
	}
}

/**
 * Parses a line containing a comment from the .OBJ buffer
 *
 * @param inputLine {String} Line containing a comment
 */
ObjFormatBufferParser.prototype.parseCommentLine = function (inputLine) {
	// No processing will be performed for comment lines.
}

/**
 * Parses a line containing a material specification from an .OBJ buffer
 *
 * @param inputLine {String} Line containing a material specification
 */
ObjFormatBufferParser.prototype.parseMaterialLine = function (inputLine) {
	
}

/**
 * Parses a line containing a normal specification from an .OBJ buffer
 *
 * @param inputLine {String} Line containing a normal specification
 */
ObjFormatBufferParser.prototype.parseVertexNormalLine = function (inputLine) {
	var singleVertexNormalCompArray = ObjBufferParserCommon.parseGenericValueLine(inputLine);
	this.vertexNormalCoords.push(singleVertexNormalCompArray);
}

/**
 * Parses a line containing a texture coordinate specification from an .OBJ buffer
 *
 * @param inputLine {String} Line containing a texture coordinate specification
 */
ObjFormatBufferParser.prototype.parseTexCoordLine = function (inputLine) {
	var singleVertexTexCoordArray = ObjBufferParserCommon.parseGenericValueLine(inputLine);
	this.vertexTextureCoords.push(singleVertexTexCoordArray);
}

/**
 * Parses a line containing a vertex coordinate specification from an .OBJ buffer
 *
 * @param inputLine {String} Line containing a vertex specification
 */
ObjFormatBufferParser.prototype.parseVertexLine = function (inputLine) {
	var singleVertexCoordArray = ObjBufferParserCommon.parseGenericValueLine(inputLine);
	this.vertexCoords.push(singleVertexCoordArray);
}

/**
 * Parses a line containing a group specification from an .OBJ buffer
 *
 * @param inputLine {String} Line containing polygon group specification
 */
ObjFormatBufferParser.prototype.parseGroupLine = function (inputLine) {
	
}

/**
 * Parses a line containing a polygon/face specification from an .OBJ buffer
 *
 * @param inputLine {String} Line containing polygon/face specification
 */
ObjFormatBufferParser.prototype.parseVertexFaceLine = function (inputLine) {
	var vertexSpecArray = inputLine.split(ObjBufferParserCommon.constCharacterSpace);
	
	var modelFace = new ModelFaceDefinition();
	for (var vertexSpecIndex = 0; vertexSpecIndex < vertexSpecArray.length; vertexSpecIndex++) {
		var vertexSpec = this.parseVertexSpecString(vertexSpecArray[vertexSpecIndex]);
		var preProcessedVertexSpec = this.preProcessVertexDefinition(vertexSpec);
		
		modelFace.vertexCollection.push(preProcessedVertexSpec);
	}
	
	this.constructedModelFaceCollection.push(modelFace);
}

/** 
 * Parses a line containing a full vertex specification (coordinates, color, texture coordinate,
 *  normal)
 *
 * @param inputLine {String} Line containing a full vertex composition specification
 */
ObjFormatBufferParser.prototype.parseVertexSpecString = function (inputString) {
	vertexDefinition = new VertexDefinition();	
	
	// Vertex coordinate specification array indices - the OBJ file format
	// may also have colors associated with a vertex. The RGB color components
	// follow the vertex coordinates if colors are specified.
	var kVertexCoordIndexX = 0;
	var kVertexCoordIndexY = 1;
	var kVertexCoordIndexZ = 2;
	var kVertexColorCompIndexRed = 3;
	var kVertexColorCompIndexGreen = 4;
	var kVertexColorCompIndexBlue = 5;
	
	var kTextureCoordIndexU = 0;
	var kTextureCoordIndexV = 0;
	
	var kNormalCoordIndexX = 0;
	var kNormalCoordIndexY = 1;
	var kNormalCoordIndexZ = 2;
	
	if (Utility.validateVar(inputString)) {
		// Face component - vertex index/texture index/normal index
		var vertexDataIndexArray = inputString.split(this.kCharacterVertexAttrJoin);
		for (var currentDataIndex = 0; currentDataIndex < vertexDataIndexArray.length; currentDataIndex++) {
			if (vertexDataIndexArray[currentDataIndex].length > 0) {
				var rawIndexValue = new Number(vertexDataIndexArray[currentDataIndex]);
				var indexValue = this.parsedIndexValueToWorkingIndexValue(rawIndexValue, currentDataIndex);
				switch (currentDataIndex) {
					case this.kVertexSpecVertexCoordIndex:
						vertexDefinition.coordX = this.vertexCoords[indexValue][kVertexCoordIndexX];
						vertexDefinition.coordY = this.vertexCoords[indexValue][kVertexCoordIndexY];
						vertexDefinition.coordZ = this.vertexCoords[indexValue][kVertexCoordIndexZ];
						if (this.vertexCoords[indexValue].length > kVertexColorCompIndexBlue) {
							vertexDefinition.colorComponentRed = this.vertexCoords[indexValue][kVertexColorCompIndexRed];
							vertexDefinition.colorComponentGreen = this.vertexCoords[indexValue][kVertexColorCompIndexGreen];
							vertexDefinition.colorComponentBlue = this.vertexCoords[indexValue][kVertexColorCompIndexBlue];
						}
						break;
					case this.kVertexSpecTextureCoordIndex:
						vertexDefinition.texCoordU = this.vertexTextureCoords[indexValue][kTextureCoordIndexU];
						vertexDefinition.texCoordV = this.vertexTextureCoords[indexValue][kTextureCoordIndexV];
						break;
					case this.kVertexSpecNormalCoordIndex:
						vertexDefinition.normalComponentX = this.vertexNormalCoords[indexValue][kNormalCoordIndexX];
						vertexDefinition.normalComponentY = this.vertexNormalCoords[indexValue][kNormalCoordIndexY];
						vertexDefinition.normalComponentZ = this.vertexNormalCoords[indexValue][kNormalCoordIndexZ];
						break;
					default:
						break;
				}
			}
		}
	}
	
	return vertexDefinition;
}

/**
 * Converts an index value used to reference an array of vertex, normal, or texture coordinate
 *  data to the appropriate working value (negative values will be converted to
 *  the appropriate absolute index value)
 *
 * @param indexValue {Number} The index specifier
 * @param dataSpecIndex {Number} A specifier that indicates whether vertex, texture, or normal
 *                               data is being referenced
 */
ObjFormatBufferParser.prototype.parsedIndexValueToWorkingIndexValue = function(indexValue, dataSpecIndex) {
	var workingIndexValue = indexValue - 1;
	
	if (Utility.validateVar(indexValue) && Utility.validateVar(dataSpecIndex)) {
		if (indexValue < 0) {
			// Negative indices indicate an index that is relative to the immediate end of
			// the list for a particular parsed data specification set (e.g. vertex,
			// vertex normal, etc.).
			switch (dataSpecIndex) {
				case this.kVertexSpecVertexCoordIndex:
					workingIndexValue = this.vertexCoords.length + indexValue;
					break;
				case this.kVertexSpecTextureCoordIndex:
					workingIndexValue = this.vertexTextureCoords.length + indexValue;
					break;
				case this.kVertexSpecNormalCoordIndex:
					workingIndexValue = this.vertexNormalCoords.length + indexValue;
					break;
				default:
					break;
			}
		}
	}
	
	return workingIndexValue;
}

/**
 * Applies a custom post-processor to the vertex data
 *
 * @return {VertexDefinition} A vertex definition containing the modified coordinates
 */
ObjFormatBufferParser.prototype.postProcessParsedData = function() {
	for (var modelFaceIndex = 0; modelFaceIndex < this.constructedModelFaceCollection.length; modelFaceIndex++) {
		for (var modelVertexIndex = 0; modelVertexIndex < this.constructedModelFaceCollection[modelFaceIndex].vertexCollection.length;
			modelVertexIndex++) {
		
			this.constructedModelFaceCollection[modelFaceIndex].vertexCollection[modelVertexIndex] =
				this.postProcessVertexDefinition(this.constructedModelFaceCollection[modelFaceIndex].vertexCollection[modelVertexIndex]);
		}
	}
}

/**
 * Applies a custom pre-processor to the vertex data
 *
 * @return {VertexDefinition} A vertex definition containing the modified coordinates
 */
ObjFormatBufferParser.prototype.preProcessVertexDefinition = function(vertexDefinition) {
	var preProcessedVertexDefinition = vertexDefinition;
	
	if ((this.vertexDefinitionProcessor !== null) && Utility.validateVarAgainstType(vertexDefinition, VertexDefinition)) {
		preProcessVertexDefinition = this.vertexDefinitionProcessor.preProcessVertexDefinition(vertexDefinition);
		
	}
	
	return preProcessedVertexDefinition;
}

/**
 * Applies a custom post-processor to a single vertex representation
 *
 * @param vertexDefinition {VertexDefinition} Data structure representing a single vertex
 *                                            definition
 *
 * @return {VertexDefinition} A vertex definition containing the modified coordinates
 */
ObjFormatBufferParser.prototype.postProcessVertexDefinition = function(vertexDefinition) {
	var postProcessedVertexDefinition = vertexDefinition;
	
	if ((this.vertexDefinitionProcessor !== null) && Utility.validateVarAgainstType(vertexDefinition, VertexDefinition)) {
		postProcessedVertexDefinition = this.vertexDefinitionProcessor.postProcessVertexDefinition(vertexDefinition);
	}
	
	return postProcessedVertexDefinition;
}
