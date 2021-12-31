// Dependent Upon:
//  - ObjFormatBufferParser.js
//  - ObjParserPrimitivesAdapter.js
//  - WebGLUtility.js


var ObjFormatBufferParserUtility = {};


/**
 * Class that serves as a container for the storage
 *  of vertex data that is to be directly converted
 *  to WebGL buffers for rendering.
 *
 */
ObjFormatBufferParserUtility.ModelVertexDataContainer = function() {
	this.aggregateVertexData = null;
	this.modelDimensionX = 0.0;
	this.modelDimensionY = 0.0;
	this.modelDimensionZ = 0.0;
}

/**
 * Vertex definition processor to be employed
 *  during OBJ file processing. Normalizes the
 *  final coordinates within an OBJ file, such that
 *  the coordinates are contained within a unit
 *  bounding box
 *
 * @see ObjFormatBufferParser
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer = function() {
	this.minValueX = null;
	this.maxValueX = null;
	this.minValueY = null;
	this.maxValueY = null;
	this.minValueZ = null;
	this.maxValueZ = null;
	
	// Scaling factor, based on a set of source coordinates
	// which have maximum extents of 1 model world coordinate
	// system unit.
	this.unitScalingFactor = 1.0;
	
	// Per-axis offsets, applied after final model
	// scaling.
	this.unitOffsetX = 0.0;
	this.unitOffsetY = 0.0;
	this.unitOffsetZ = 0.0;
}

/**
 * "Pre-processes" vertex definition data during parsing of an OBJ-formatted
 *  buffer (aggregates maximum/minimum bounds along all axes).
 *
 * @param {VertexDefinition} vertexDefinition Class instance that contains data which defines a
 *                                            single vertex, derived from parsing of a source
 *                                            OBJ-formatted buffer
 *
 * @return The original vertex definition object
 * @see ObjFormatBufferParser.vertexDefinitionProcessor
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.preProcessVertexDefinition = function(vertexDefinition) {
	// The preprocesor simply determines the boundaries of the object - the source
	// data remains unmodified.
	if (Utility.validateVarAgainstType(vertexDefinition, VertexDefinition)) {	
		this.updateMinMaxValuesCoordX(vertexDefinition.coordX);
		this.updateMinMaxValuesCoordY(vertexDefinition.coordY);
		this.updateMinMaxValuesCoordZ(vertexDefinition.coordZ);	
	}
	
	return vertexDefinition;	
}

/**
 * Updates the internally-stored minimum/maximum X coordinate
 *  values to be used during the final normalization
 *  process
 *
 * @param coordX {Number} The coordinate that will be
 *                        compared to the existing minimum/maximum
 *                        coordinate values for the X-axis
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.updateMinMaxValuesCoordX = function(coordX) {	
	if (this.minValueX === null) {
		this.minValueX = coordX;
	}
	else {
		this.minValueX = Math.min(this.minValueX, coordX);
	}	
	
	if (this.maxValueX === null) {
		this.maxValueX = coordX;
	}
	else {
		this.maxValueX = Math.max(this.maxValueX, coordX);
	}
}

/**
 * Updates the internally-stored minimum/maximum Y coordinate
 *  values to be used during the final normalization
 *  process
 *
 * @param coordY {Number} The coordinate that will be
 *                        compared to the existing minimum/maximum
 *                        coordinate values for the Y-axis
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.updateMinMaxValuesCoordY = function(coordY) {
	if (this.minValueY === null) {
		this.minValueY = coordY;
	}
	else {
		this.minValueY = Math.min(this.minValueY, coordY);
	}	
	
	if (this.maxValueY === null) {
		this.maxValueY = coordY;
	}
	else {
		this.maxValueY = Math.max(this.maxValueY, coordY);		
	}
	
}

/**
 * Updates the internally-stored minimum/maximum Z coordinate
 *  values to be used during the final normalization
 *  process
 *
 * @param coordZ {Number} The coordinate that will be
 *                        compared to the existing minimum/maximum
 *                        coordinate values for the Z-axis
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.updateMinMaxValuesCoordZ = function(coordZ) {
	if (this.minValueZ === null) {
		this.minValueZ = coordZ;
	}
	else {
		this.minValueZ = Math.min(this.minValueZ, coordZ);
	}	
	
	if (this.maxValueZ === null) {
		this.maxValueZ = coordZ;
	}
	else {
		this.maxValueZ = Math.max(this.maxValueZ, coordZ);		
	}
}

/**
 * "Post-processes" vertex definition data during parsing of an OBJ-formatted
 *  buffer (normalizes vertex values such that they fit into a unit cube).
 *
 * @param {VertexDefinition} vertexdefintion Class instance that contains data which defines a
 *                                           single vertex, derived from parsing of a source
 *                                           OBJ-formatted buffer
 *
 * @return The original vertex definition object
 * @see ObjFormatBufferParser.vertexDefinitionProcessor
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.postProcessVertexDefinition = function(vertexDefinition) {
	var postProcessedVertexDefinition = vertexDefinition;
	
	if (Utility.validateVarAgainstType(vertexDefinition, VertexDefinition)) {
		var objectDimensionX = (this.maxValueX - this.minValueX)
		var objectDimensionY = (this.maxValueY - this.minValueY)
		var objectDimensionZ = (this.maxValueZ - this.minValueZ);
		
		var scalingFactor = this.getCurrentDimAggregateScalingFactor();
			
		postProcessedVertexDefinition.coordX = ((postProcessedVertexDefinition.coordX - this.minValueX -
			(objectDimensionX / 2.0)) * scalingFactor) + this.unitOffsetX;
		postProcessedVertexDefinition.coordY = ((postProcessedVertexDefinition.coordY - this.minValueY -
			(objectDimensionY / 2.0)) * scalingFactor) + this.unitOffsetY;
		// The Z-axis for OBJ files is defined such that decreasing negative Z
		// values are closer to the viewer. Invert the Z-axis such that
		// increasing positive Z values are closer to the viewer (standard,
		// expected axis orientation).
		postProcessedVertexDefinition.coordZ = -(((postProcessedVertexDefinition.coordZ - this.minValueZ -
			(objectDimensionZ / 2.0)) * scalingFactor) + this.unitOffsetZ);
	}
	
	return postProcessedVertexDefinition;
}

/**
 * Applies post-processing computations to a single 3D point
 *
 * @param {Point3d) point3d Three-dimensional for which the post processing
 *                          computation will be applied
 *
 * @return {Point3d} The post-processed 3d point upon success, a point
 *                   containing the coordinates of the source point
 *                   otherwise
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.applyPostProcessingToPoint3d = function(point3d) {
	var postProcessedPoint3d = new Point3d(point3d.xCoord, point3d.yCoord, point3d.zCoord);
	
	if (Utility.validateVarAgainstType(point3d, Point3d)) {
		var objectDimensionX = (this.maxValueX - this.minValueX)
		var objectDimensionY = (this.maxValueY - this.minValueY)
		var objectDimensionZ = (this.maxValueZ - this.minValueZ);
		
		var scalingFactor = this.getCurrentDimAggregateScalingFactor();
			
		postProcessedPoint3d.xCoord = ((postProcessedPoint3d.xCoord - this.minValueX -
			(objectDimensionX / 2.0)) * scalingFactor) + this.unitOffsetX;
		postProcessedPoint3d.yCoord = ((postProcessedPoint3d.yCoord - this.minValueY -
			(objectDimensionY / 2.0)) * scalingFactor) + this.unitOffsetY;
		postProcessedPoint3d.zCoord = ((postProcessedPoint3d.zCoord - this.minValueZ -
			(objectDimensionZ / 2.0)) * scalingFactor) + this.unitOffsetZ;
	}
	
	return postProcessedPoint3d;
}

/**
 * Returns the currently-stored maximum object dimension (X, Y, or Z axis)
 *
 * @return {Number} The maximum object dimension
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentMaxDimension = function() {
	var objectDimensionX = (this.maxValueX - this.minValueX);
	var objectDimensionY = (this.maxValueY - this.minValueY);
	var objectDimensionZ = (this.maxValueZ - this.minValueZ);
	var maxDimension = Math.max(objectDimensionX, objectDimensionY, objectDimensionZ);	
		
	return maxDimension;
}

/**
 * Returns the scaling factor used internally during the coordinate normalization
 *  process
 *
 * @return {Number} Scaling factor used internally during the coordinate normalization
 *                  process
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentDimAggregateScalingFactor = function() {
	return this.unitScalingFactor / this.getCurrentMaxDimension();
}

/**
 * Returns the current scaled model dimension along the X axis, based
 *  upon the available data that has been parsed
 *
 * @return The model dimension along the X-axis
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentScaledModelDimensionX = function() {
	var dimensionX = 0.0;
	
	if ((this.minValueX !== null) && (this.maxValueX !== null)) {
		dimensionX = (this.maxValueX - this.minValueX) * this.getCurrentDimAggregateScalingFactor();
	}

	return dimensionX;
}

/**
 * Returns the current scaled model dimension along the Y axis, based
 *  upon the available data that has been parsed
 *
 * @return The model dimension along the Y-axis
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentScaledModelDimensionY = function() {
	var dimensionY = 0.0;

	if ((this.minValueY !== null) && (this.maxValueY !== null)) {
		dimensionY = (this.maxValueY - this.minValueY) * this.getCurrentDimAggregateScalingFactor();
	}
	
	return dimensionY;
}

/**
 * Returns the current scaled model dimension along the Z axis, based
 *  upon the available data that has been parsed
 *
 * @return The model dimension along the Z-axis
 */
ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentScaledModelDimensionZ = function() {
	var dimensionZ = 0.0;

	if ((this.minValueZ !== null) && (this.maxValueZ !== null)) {
		dimensionZ = (this.maxValueZ - this.minValueZ) * this.getCurrentDimAggregateScalingFactor();
	}
	
	return dimensionZ;
}

/**
 * Generates vertex data to be used as a data source for rendering setup, using a specified
 *  OBJ-formatted buffer
 *
 * @param modelDataKey {String} Key that is employed to reference the raw OBJ-formatted
 *                              buffer within the resource key-value store
 * @param vertexDefinitionProcessor 
 * @param additionaTargetPoints {Array} Optional array of Point3d objects to be processed
 *                                      (scaled/translated/etc., in accordance with other
 *                                      point transformation) 
 * @param targetPointsResultStore {Array} Optional array that will receive the processed
 *                                        set of points (additionaTargetPoints must be
 *                                        valid)
 * @param wEvaluatorFunc {function} Function that receives a z coordinate,
 *                                  and generates an appropriate/custom w
 *                                  coordinate
 *
 * @return {ObjFormatBufferParserUtility.ModelVertexDataContainer} Object that contains a collection of vertex data,
 *                                   							   derived from the OBJ-formatted buffer, that
 *                                                                 can be directly buffered by WebGL
 */
ObjFormatBufferParserUtility.generateModelVertexDataFromObjBuffer = function(objBufferData, vertexDefinitionProcessor,
                                                                             additionalTargetPoints, targetPointsResultStore,
																			 wEvaluatorFunc) {
	var vertexDataContainer = null;
	
	if (Utility.validateVar(objBufferData)) {
		// Parse the raw OBJ-formatted geometry description buffer...
		var objBufferParser = new ObjFormatBufferParser(objBufferData);
		// Use a vertex processor object in order to perform custom processing of
		// the vertices, as necessary.
		if (vertexDefinitionProcessor !== null) {
			objBufferParser.vertexDefinitionProcessor = vertexDefinitionProcessor//new ObjVertexDefProcessorObjectBoundsNormalizer();
		}

		objBufferParser.initiateParsing();
		
		if (Utility.validateVar(additionalTargetPoints) && Utility.validateVar(targetPointsResultStore)) {
			// Process any associated points that were not explicitly defined within the OBJ-formatted buffer.
			this.processAdditionalAssociatedModelPoints(objBufferParser.vertexDefinitionProcessor,
				additionalTargetPoints, targetPointsResultStore);
		}
		
		var objParserPrimitivesAdapter = new ObjParserPrimitivesAdapter(objBufferParser)
	
		// Create a collection of triangles from the parsed buffer
		// data...
		if (objParserPrimitivesAdapter.initiateGeometryExtraction()) {
			// Generate vertex data that can be used to create WebGl buffers.
			vertexDataContainer = new ObjFormatBufferParserUtility.ModelVertexDataContainer();
			vertexDataContainer.aggregateVertexData = WebGlUtility.generateAggregateVertexDataFromTriangleList(objParserPrimitivesAdapter.triangleData,
				wEvaluatorFunc);
			vertexDataContainer.modelDimensionX = objBufferParser.vertexDefinitionProcessor.getCurrentScaledModelDimensionX();
			vertexDataContainer.modelDimensionY = objBufferParser.vertexDefinitionProcessor.getCurrentScaledModelDimensionY();
			vertexDataContainer.modelDimensionZ = objBufferParser.vertexDefinitionProcessor.getCurrentScaledModelDimensionZ();
		}
	}
	
	return vertexDataContainer;
}
