// ObjParserPrimitivesAdapter.js - Implementation that transforms parsed OBJ model data into
//                                 standalone geometric primitve representations
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -ObjFormatBufferParser.js
//  -Primitives.js

function ObjParserPrimitivesAdapter(objFormatBufferParser) {
	this.objFormatBufferParser = objFormatBufferParser;

	this.triangleData = [];
}

/**
 * Initiates the process of converting the parsed .OBJ-formatted
 *  buffer into a collection of triangle data
 */
ObjParserPrimitivesAdapter.prototype.initiateGeometryExtraction = function() {
	var geometryExtracted = false;
	
	if (Utility.validateVarAgainstType(this.objFormatBufferParser, ObjFormatBufferParser)) {
		for (var currentModelFaceIndex = 0;
			currentModelFaceIndex < this.objFormatBufferParser.constructedModelFaceCollection.length;
			currentModelFaceIndex++) {
				
			var triangleCollection = this.convertObjModelFaceToTriangleData(
				this.objFormatBufferParser.constructedModelFaceCollection[currentModelFaceIndex]);
			this.triangleData.push.apply(this.triangleData, triangleCollection);
			
			
		}
		
		geometryExtracted = this.triangleData.length > 0;
	}
	
	return geometryExtracted;
}

/** 
 * Converts a parsed-face/polygon representation into a set of triangles
 *
 * @param objModelFaceRepresentation {ModelFaceDefinition} A representation of
 *                                                         a parsed polygon face
 * 
 * @return {Array} An array of {Triangle} objects
 */
ObjParserPrimitivesAdapter.prototype.convertObjModelFaceToTriangleData = function (objModelFaceRepresentation) {
	var triangleData = [];
	
	var extractedVertices = [];
	
	for (var currentVertexIndex = 0; currentVertexIndex < objModelFaceRepresentation.vertexCollection.length; currentVertexIndex++) {
		extractedVertices.push(this.createVertexFromObjVertexDefinition(objModelFaceRepresentation.vertexCollection[currentVertexIndex]));
	}
	
	triangleData.push.apply(triangleData, this.createTrianglesFromVertices(extractedVertices));
	
	return triangleData;
}

/**
 * Generates a single vertex object from data derived from a parsed .OBJ-formatted
 *  buffer
 *
 * @param vertexDefinition {VertexDefinition} A class containing a single vertex
 *                                            object
 */
ObjParserPrimitivesAdapter.prototype.createVertexFromObjVertexDefinition = function(vertexDefinition) {
	var vertex = new Vertex3d(vertexDefinition.coordX, vertexDefinition.coordY, vertexDefinition.coordZ);
	
	var vertexNormal = new Vector3d(vertexDefinition.normalComponentX, vertexDefinition.normalComponentY,
		vertexDefinition.normalComponentZ);
	vertexNormal.normalize();
	
	vertex.setNormalVector(vertexNormal);
	
	vertex.surfaceU = vertexDefinition.texCoordU;
	vertex.surfaceV = vertexDefinition.texCoordV;
	
	vertex.rgbColor = new RgbColor(vertexDefinition.colorComponentRed.valueOf(),
		vertexDefinition.colorComponentGreen.valueOf(), vertexDefinition.colorComponentBlue.valueOf(), 1.0);
		
	return vertex;
}

/**
 * Creates triangles from a collection of vertices that represent a polygon
 *
 * @param vertexCollction {Array} Array containing {Vertex3d} objects
 * 
 * @return {Array} Array of {Triangle} objects
 */ 
ObjParserPrimitivesAdapter.prototype.createTrianglesFromVertices = function(vertexCollection) {
	var triangleData = [];
	
	if (Utility.validateVar(vertexCollection)) {
		var firstTriangle = new Triangle(vertexCollection[0], vertexCollection[1], vertexCollection[2]);
		triangleData.push(firstTriangle);
		if (vertexCollection.length === 4) {
			var secondTriangle = new Triangle(vertexCollection[2], vertexCollection[3], vertexCollection[0]);
			triangleData.push(secondTriangle);
		}
	}	
	
	return triangleData;
}

