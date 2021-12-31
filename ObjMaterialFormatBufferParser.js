// ObjMaterialFormatBufferParser.js
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -ObjBufferParserCommon.js


function ObjMaterialDefinition(materialName) {
	this.materialName = materialName;
	this.materialAmbientTextureSource = "";
	this.materialDiffuseTextureSource = "";
	this.materialSpecularHighlightTextureSource = "";
	this.materialSpecularColorTextureSource = "";
	
	this.ambientColorComponentArray = [];
	this.diffuseColorComponentArray = [];
	this.specularColorComponentArray = [];
}



function ObjMaterialTextureDefinition {
	this.textureSource = "";
	this.clampCoords = false;
	this.blendU = true;
	this.blendV = true;
}

function ObjMaterialFormatBufferParser(sourceBuffer) {
	this.constCharacterNewLine = '\n';
	this.constCharacterContinuation = "\\";
	this.constCharacterSpace = " ";
	
	this.constCommandCommentStr = "#";
	this.constCommandDefineMaterialStr = "newmtl";
	this.constCommandAmbientColorStr = "Ka";
	this.constCommandDiffuseColorStr = "Kd";
	this.constCommandSpecularColorStr = "Ks";
	this.constCommandSpecularExponentStr = "Ns";
	this.constCommandOpacityStr = "d";
	this.constCommandTransparencyStr = "Tr";
	this.constCommandAmbientTextureMapStr = "map_Ka";
	this.constCommandDiffuseTextureMapStr = "map_Kd";
	this.constCommandSpecularHighlightTextureMapStr = "map_Ks";
	this.constCommandSpecularColorTextureMapStr = "map_Ns";
	this.constCommandAlphaTextureMapStr = "map_d";
	
	this.sourceBuffer = sourceBuffer;	
	
	this.currentMaterialDefinition = null;
	
	this.materialDefinitionCollection = [];
}


ObjMaterialFormatBufferParser.prototype.initiateParsing = function() {
	if (validateVar(this.sourceBuffer)) {
		var newlineDelineatedBuffer = ObjBufferParserCommon.buildNewlineDelineatedBuffer(this.sourceBuffer));
				
		for (var parseLineLoop = 0; parseLineLoop < newlineDelineatedBuffer.length; parseLineLoop++) {
			// Parse each line, first ensuring that there is no terminal whiteSpace
			// which may interfere with the parsing process.			
			this.parseSingleLine(newlineDelineatedBuffer[parseLineLoop].trim();
		}
	}
}



/**
 * Parses a single line from the .MTL buffer
 * 
 * @param singleLineBuffer {String} The line from the .MTL buffer to be parsed
 */
ObjMaterialFormatBufferParser.prototype.parseSingleLine = function(singleLineBuffer) {
	if (validateVar(singleLineBuffer)) {
		if (singleLineBuffer.startsWith(this.constCommandCommentStr)) {
			// Comment line
			this.parseCommentLine((singleLineBuffer.slice(this.constCommandCommentStr.length)).trim());
		}		
		else if (singleLineBuffer.startsWith(this.constCommmandDefineMaterialStr)) {
			// "Define material" command line
			this.parseMaterialDefinitionLine((singleLineBuffer.slice(this.constCommmandDefineMaterialStr.length)).trim());
		}
		else if (singleLineBuffer.startsWith(this.constCommandAmbientColorStr)) {
			// "Ambient color" command line
			this.parseAmbientColorLine((singleLineBuffer.slice(this.constCommandAmbientColorStr.length)).trim());
		}
		else if (singleLineBuffer.startsWith(this.constCommandDiffuseColorStr)) {
			// "Diffuse color" command line
			this.parseDiffuseColorLine((singleLineBuffer.slice(this.constCommandDiffuseColorStr.length)).trim());			
		}
		else if (singleLineBuffer.startsWith(this.constCommandSpecularColorStr)) {
		}
		else if (singleLineBuffer.startsWith(this.constCommandOpacityStr)) {
		}
		else if (singleLineBuffer.startsWith(this.constCommandTransparencyStr)) {
		}
		else if (singleLineBuffer.startsWith(this.constCommandAmbientTextureMapStr)) {
			// "Ambient texture" command line
			this.parseAmbientTextureMapLine(singleLineBuffer);
		}
		else if (singleLineBuffer.startsWith(this.constCommandDiffuseTextureMapStr)) {
			// "Diffuse texture" command line
			this.parseDiffuseTextureMapLine(singleLineBuffer);
		}
		else if (singleLineBuffer.startsWith(this.constCommandSpecularHighlightTextureMapStr)) {
		}
		else if (singleLineBuffer.startsWith(this.constCommandSpecularColorTextureMapStr)) {
		}
		else if (singleLineBuffer.startsWith(this.constCommandAlphaTextureMapStr)) {
		}
	}
}



/**
 * Parses a line containing a comment from the .MTL buffer
 *
 * @param inputLine {String} Line containing a comment
 */
ObjMaterialFormatBufferParser.prototype.parseCommentLine = function (inputLine) {
	// No processing will be performed for comment lines.
}

/*
 * Parses a line containing a material definition initiation command from an
 *  .MTL buffer
 *
 * @param inputLine {String} Line containing a comment
 */
ObjMaterialFormatBufferParser.prototype.parseMaterialDefinitionLine = function (inputLine) {
	this.commenceMaterialDefinition(inputLine);
}

/*
 * Parses a line containing an ambient color specification definition from an .MTL buffer
 *
 * @param inputLine {String} Line containing an ambient color specification
 *                           definition
 */
ObjMaterialFormatBufferParser.prototype.parseAmbientColorLine = function (inputLine) {
	var ambientColorComponentArray = ObjBufferParserCommon.parseGenericValueLine(inputLine);
	this.currentMaterialDefinition.ambientColorComponentArray = ambientColorComponentArray;
}

/*
 * Parses a line containing a diffuse color specification definition from an .MTL buffer
 *
 * @param inputLine {String} Line containing a diffuse color specification
 *                           definition
 */
ObjMaterialFormatBufferParser.prototype.parseDiffuseColorLine = function (inputLine) {
	var diffuseColorComponentArray = ObjBufferParserCommon.parseGenericValueLine(inputLine);
	this.currentMaterialDefinition.diffuseColorComponentArray = diffuseColorComponentArray;
}

/*
 * Parses a line containing a specular color specification definition from an .MTL buffer
 *
 * @param inputLine {String} Line containing a specular color specification
 *                           definition
 */
ObjMaterialFormatBufferParser.prototype.parseSpecularColorLine = function (inputLine) {
	var specularColorComponentArray = ObjBufferParserCommon.parseGenericValueLine(inputLine);	
	this.currentMaterialDefinition.specularColorComponentArray = specularColorComponentArray;
}

/*
 * Parses a line containing an ambient texture map specification definition from an .MTL
 *  buffer
 *
 * @param inputLine {String} Line containing a texture specification
 *                           definition
 */
ObjMaterialFormatBufferParser.prototype.parseAmbientTextureMapLine = function (inputLine) {
	var textureDefinition = this.parseTextureLine(inputLine);
	currentMaterialDefinition.constCommandAmbientColorStr = textureDefinition.textureSource;	
}

/*
 * Parses a line containing a diffuse texture map specification definition from an .MTL
 *  buffer
 *
 * @param inputLine {String} Line containing a texture specification
 *                           definition
 */
ObjMaterialFormatBufferParser.prototype.parseDiffuseTextureMapLine = function (inputLine) {
	var textureDefinition = this.parseTextureLine(inputLine);
	currentMaterialDefinition.materialDiffuseTextureSource = textureDefinition.textureSource;
}

/*
 * Parses a line containing a texture specification definition from an .MTL buffer
 *
 * @param inputLine {String} Line containing a texture specification
 *                           definition
 *
 * @return {ObjMaterialTextureDefinition} Information derived from the parsed
 *                                        texture specification definition
 */
ObjMaterialFormatBufferParser.prototype.parseTextureLine = function (inputLine) {
	var textureDefinition = new ObjMaterialTextureDefinition();

	// The texture parser implementation presently does not support texture
	// map material options. A texture source (input file) is the sole
	// expected specification within the line.
	textureDefinition.textureSource = inputLine;
	
	return textureDefinition;
}

ObjMaterialFormatBufferParser.prototype.commenceMaterialDefinition = function (materialName) {
	if (Utility.validateVarAgainstType(materialName, String)) {
		this.concludeCurrentMaterialDefinition();
		
		this.currentMaterialDefinition = new ObjMaterialDefinition(materialName);
	}
}

ObjMaterialFormatBufferParser.prototype.concludeCurrentMaterialDefinition = function () {
	if (this.currentMaterialDefinition !== null) {
		this.materialDefinitionCollection.push(this.currentMaterialDefinition);
		this.currentMaterialDefinition = null;
	}
}


