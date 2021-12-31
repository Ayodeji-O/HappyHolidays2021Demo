// WebGlUtility.js - General utility routines that facilitate the
//                   use of WebGL.
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  Utility.js
//  RgbColor.js
//  Primitives.js
//  MathExtMatrix.js

var WebGlUtility = {};

/**
 *  Class that serves as a container for data that is to be
 *   directly converted into buffers purposed for WebGL
 *   rendering
 */
WebGlUtility.AggregateWebGlVertexData = function() {
	this.vertices = new Float32Array();
	this.vertexColors = new Float32Array();
	this.vertexTextureCoords = new Float32Array();
	this.vertexNormals = new Float32Array();
}

/**
 * Class that is purposed for aggregating WebGL buffers required to
 *  render a specific object (should be converted to
 *  ObjectRenderWebGlData instance for rendering
 *
 * @see ObjectRenderWebGlData
 * @see WebGlUtility.objectRenderWebGlDataFromWebGlBufferData
 */
WebGlUtility.WebGlBufferData = function() {	
	this.objectWebGlVertexBuffer = null;
	this.objectWebGlColorBuffer = null;
	this.objectWebGlTexCoordBuffer = null;
	this.objectWebGlNormalBuffer = null;
	this.vertexCount = 0;
}

/**
 *  Class that is used to encapsulate data to be rendered using
 *   WebGL
 *  
 *  @param shaderProgram {WebGLProgram} Shader program to be used during rendering
 *  @param vertexBuffer {WebGLBuffer} Vertex buffer that describes the object geometry
 *  @param colorBuffer {WebGLBuffer} Color buffer which indicates the color of each vertex
 *  @param texCoordBuffer {WebGLBuffer} Buffer which indicates the texture coordinates for
 *                                      each vertex
 *  @param normalBuffer {WebGLBuffer} Buffer that contains the normals for each vertex
 *  @param vertexCount {Number} Number of vertices to be rendered
 */
WebGlUtility.ObjectRenderWebGlData = function(shaderProgram, vertexBuffer, colorBuffer, texCoordBuffer, normalBuffer, vertexCount) {
	this.webGlShaderProgram = shaderProgram
	this.webGlVertexBuffer = vertexBuffer;
	this.webGlVertexColorBuffer = colorBuffer;
	this.webGlTexCoordBuffer = texCoordBuffer,
	this.webGlVertexNormalBuffer = normalBuffer;
	this.vertexCount = vertexCount;
}

/**
 *
 *
 *
 * @see WebGlUtility.renderGeometry
 * @see WebGlUtility.AttributeData
 */
WebGlUtility.AttributeLocationData = function() {
	this.vertexPositionAttributeLocation = "";
	this.vertexColorAttributeLocation = "";
	this.vertexNormalAttributeLocation = "";
	this.ambientLightVectorAttributeLocation = "";
	this.textureCoordinateAttributeLocation = "";
	this.transformationMatrixAttributeLocation = "";
	this.projectionMatrixAttributeLocation = "";
}

/**
 *
 *
 * @see WebGlUtility.renderGeometry
 */
WebGlUtility.AttributeData = function () {
	this.vertexPosition = null;
	this.vertexColor = null;
	this.vertexNormal = null;
	this.ambientLightVector = null;
	this.textureCoordinate = null;
	this.transformationMatrix = null;
	
	// Number of elements elements required to
	// define a vertex position
	this.vertexDataSize = null;
	this.vertexColorSize = null;
	// Number of elements required to define
	// a vector
	// (WebGlUtility.AttributeData.vertexNormal)
	this.vectorSize = null;
	
	this.textureCoordinateSize = null;
}

/**
 * Retrieves a WebGL context from a canvas object, if
 *  a context has not already been associated with
 *  the canvas
 * @param sourceCanvas {HTMLCanvasElement} The canvas element for which a
 *                                         WebGL context should be retrieved
 * @param forceLegacy {boolean} When set to true, the legacy WebGL context
 *                              implementation will be retrieved
 * @return {WebGLRenderingContext2D} A WebGL context upon success, null otherwise
 */
WebGlUtility.getWebGlContextFromCanvas = function(sourceCanvas, forceLegacy) {
	
	var webGlContext = null;
	if (Utility.validateVar(sourceCanvas) && (sourceCanvas instanceof HTMLCanvasElement)) {
		
		// WebGL rendering contexts are identified using various identifiers,
		// depending upon the specific host browser type/version.
		var constLegacyWebGlContextIdentifiers = [ "webgl", "experimental-webgl"];
		var constWebGlContextIdentifiers = ["webgl2"];
		
		var workingWebGlContextIdentifierSet = [];
		
		if (Utility.validateVar(forceLegacy) && forceLegacy) {
			workingWebGlContextIdentifierSet = constLegacyWebGlContextIdentifiers;			
		}
		else {
			workingWebGlContextIdentifierSet = constWebGlContextIdentifiers.concat(constLegacyWebGlContextIdentifiers);
		}
		
		var currentWebGlIdIndex = 0;
		while ((webGlContext == null) && (currentWebGlIdIndex < workingWebGlContextIdentifierSet.length)) {
			webGlContext = sourceCanvas.getContext(workingWebGlContextIdentifierSet[currentWebGlIdIndex]);
			currentWebGlIdIndex++;
		}
	}
	
	return webGlContext;
}

/**
 * Prepares a WebGL context for initial use
 * @param webGlCanvasContext {WebGLRenderingContext2D} The WebGL context object that
 *                                                     is to be prepared
 */
WebGlUtility.initializeWebGl = function(webGlCanvasContext) {
	if (Utility.validateVar(webGlCanvasContext)) {

		webGlCanvasContext.viewport(0, 0, webGlCanvasContext.canvas.width, webGlCanvasContext.canvas.height)
		
		webGlCanvasContext.clearColor(0.0, 0.0, 0.0, 1.0);
		webGlCanvasContext.enable(webGlCanvasContext.DEPTH_TEST);
		webGlCanvasContext.depthFunc(webGlCanvasContext.LEQUAL);
		webGlCanvasContext.clear(webGlCanvasContext.COLOR_BUFFER_BIT | webGlCanvasContext.DEPTH_BUFFER_BIT);
	}
}

/**
 * Creates a WebGL shader program, using a vertex shader
 *  and a fragment shader source program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *													   that will be used to facilitate
 *                           						   shader program compilation
 * @param vertexShaderSource {DOMString} Source code employed to implement the vertex
 *                                       shader
 * @param fragmentShaderSource {DOMString} Source code employed to implement the fragment
 *                                         shader
 * @return {WebGLProgram} A WebGL shader program upon success, null otherwise (diagnostic
 *                        data from compilation will be logged to the console upon failure)
 */
WebGlUtility.createShaderProgram = function(webGlCanvasContext, vertexShaderSource, fragmentShaderSource) {
	var shaderProgram = null;
	
	if (Utility.validateVar(webGlCanvasContext) && ((webGlCanvasContext instanceof WebGLRenderingContext) ||
		(webGlCanvasContext instanceof WebGL2RenderingContext)) &&
		Utility.validateVar(vertexShaderSource) && Utility.validateVar(fragmentShaderSource)) {
		
		// Compile the vertex shader and fragment shader. Then, create a shader program
		// using the compiled vertex shader and fragment shader.
		shaderProgram = webGlCanvasContext.createProgram();
		webGlCanvasContext.attachShader(shaderProgram, WebGlUtility.compileVertexShaderFromSource(webGlCanvasContext, vertexShaderSource));
		webGlCanvasContext.attachShader(shaderProgram, WebGlUtility.compileFragmentShaderFromSource(webGlCanvasContext, fragmentShaderSource));
		webGlCanvasContext.linkProgram(shaderProgram);
		if (!webGlCanvasContext.getProgramParameter(shaderProgram, webGlCanvasContext.LINK_STATUS)) {
			// Program creation failed - log a detailed error message.
			console.log(webGlCanvasContext.getProgramInfoLog(shaderProgram));
			webGlCanvasContext.deleteProgram(shaderProgram);
			shaderProgram = null;
		}
	}
	
	return shaderProgram;
}

/**
 * Compiles a vertex shader, using a vertex shader source
 *  program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader program compilation
 * @param vertexShaderSource {DOMString} Source code employed to implement the vertex
 *                                       shader
 * @return {WebGLShader} A WebGL shader object representing the vertex shader upon
 *                       success, null otherwise
 */
WebGlUtility.compileVertexShaderFromSource = function(webGlCanvasContext, vertexShaderSource) {
	var vertexShader = null;
	
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(vertexShaderSource)) {
		vertexShader = WebGlUtility.compileShaderFromSource(webGlCanvasContext, vertexShaderSource,
			webGlCanvasContext.VERTEX_SHADER);
	}
	
	return vertexShader;
}

/**
 * Compiles a fragment shader, using a fragment shader source
 *  program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader program compilation
 * @param fragmentShaderSource {DOMString} Source code employed to implement the fragment
 *                                         shader
 * @return {WebGLShader} A WebGL shader object representing the fragment shader upon
 *                       success, null otherwise
 */
WebGlUtility.compileFragmentShaderFromSource = function(webGlCanvasContext, fragmentShaderSource) {
	var fragmentShader = null;
	
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(fragmentShaderSource)) {
		fragmentShader = WebGlUtility.compileShaderFromSource(webGlCanvasContext, fragmentShaderSource,
			webGlCanvasContext.FRAGMENT_SHADER);
	}
	
	return fragmentShader;
}

/**
 * Compiles a vertex or fragment shader, using a shader source
 *  program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader source compilation
 * @param fragmentShaderSource {DOMString} Source code employed to implement the
 *                                         shader
 * @param shaderType {number} Indicates the type of shader to be compiled - 
 *                            can be either WebGLRenderingContext2D.VERTEX_SHADER or
 *							  WebGLRenderingContext2D.FRAGMENT_SHADER
 * @return {WebGLShader} A WebGL shader object representing the compiled shader upon
 *                       success, null otherwise
 */
WebGlUtility.compileShaderFromSource = function(webGlCanvasContext, shaderSource, shaderType) {
	var webGlShader = null;
	
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(shaderSource) &&
		Utility.validateVar(shaderType)) {
			
		webGlShader = webGlCanvasContext.createShader(shaderType);
		webGlCanvasContext.shaderSource(webGlShader, shaderSource);
		if (!WebGlUtility.compileShaderObject(webGlCanvasContext, webGlShader)) {
			webGlCanvasContext.deleteShader(webGlShader);
			webGlShader = null;
		}
	}
	
	return webGlShader;	
}

/**
 * Compiles a WebGL shader object that is associated with a single
 *  vertex or fragment shader
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader object compilation
 * @param WebGlShader {WebGLShader} A WebGL shader object associated with vertex or
 *                                  fragment shader source code
 * @return {boolean} True upon successful compilation of the shader (diagnostic
 *                   data from compilation will be logged to the console upon failure)
 */
WebGlUtility.compileShaderObject = function(webGlCanvasContext, webGlShader) {
	var compiledSuccessfully = false;
	
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(webGlShader)) {
		// Attempt to compile the shader...
		webGlCanvasContext.compileShader(webGlShader);
		
		if (webGlCanvasContext.getShaderParameter(webGlShader, webGlCanvasContext.COMPILE_STATUS)) {
			compiledSuccessfully = true;
		}
		else {
			// Shader creation failed - log a detailed error message.
			console.log(webGlCanvasContext.getShaderInfoLog(webGlShader));
		}
			
	}
	
	return compiledSuccessfully;
}

/**
 * Creates a WebGL texture from raw image data
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that
 *                                                     will facilitate the
 *                                                     creation of the texture
 * @param imageData {ImageData} An object containing bitmap image data that
 *                              will be used to generate a texture
 * @return {WebGLTexture} A WebGL texture object upon success, null otherwise
 */
WebGlUtility.createTextureFromImageData = function(webGlCanvasContext, imageData) {
	var webGlTexture = null;
	
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(imageData)) {
		// Create the texture, and define the texture format (since ImageData
		// objects are RGBA formatted, the texture must be an RGBA texture).
		webGlTexture = webGlCanvasContext.createTexture();
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, imageData);
			
		// The texture will be magnified using bilinear filtering...
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, null);
	}
	
	return webGlTexture;
}

/**
 * Creates a WebGL texture from an image object
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that
 *                                                     will facilitate the
 *                                                     creation of the texture
 * @param image {Image} An image object
 * @param wrapTexture {boolean} When set to true, the texture will wrap
 * @return {WebGLTexture} A WebGL texture object upon success, null otherwise
 */
WebGlUtility.createTextureFromImage = function(webGlCanvasContext, image, wrapTexture) {
	var webGlTexture = null;
	
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(image)) {
		// Create the texture, and define the texture format (since image
		// objects are RGBA formatted, the texture must be an RGBA texture).
		webGlTexture = webGlCanvasContext.createTexture();
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, image);
			
		// The texture will be magnified using bilinear filtering...
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.LINEAR);
			
		// Wrap the texture, if specified.
		var repeatTexture = (Utility.validateVar(wrapTexture) && wrapTexture);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_S,
			repeatTexture ? webGlCanvasContext.REPEAT : webGlCanvasContext.CLAMP_TO_EDGE);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_T,
			repeatTexture ? webGlCanvasContext.REPEAT : webGlCanvasContext.CLAMP_TO_EDGE);		
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, null);
	}
	
	return webGlTexture;
}


/**
 * Creates a WebGL texture from a canvas object
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that will facilitate the
 *                                                     creation of the texture
 * @param sourceCanvas {HTMLCanvasElement} A canvas object containing
 *                                        bitmap image data that  will be
 *                                        used to generate a texture
 * @param wrapTexture {Boolean} If set to true, texture coordinates will repeat
 *                              (both the width and the height of the source
 *                              canvas must be powers of two)
 * @return {WebGLTexture} A WebGL texture object upon success, null otherwise
 */
WebGlUtility.createTextureFromCanvas = function(webGlCanvasContext, sourceCanvas, wrapTexture) {
	var webGlTexture = null;
	
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(sourceCanvas)) {
		// Create the texture, and define the texture format.
		webGlTexture = webGlCanvasContext.createTexture();
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, sourceCanvas);
						
		var textureWrapMode = wrapTexture ? webGlCanvasContext.REPEAT :
			webGlCanvasContext.CLAMP_TO_EDGE;
			
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_S, textureWrapMode);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_T, textureWrapMode);	

						
		// The texture will be magnified using bilinear filtering...
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, null);
	}	
	
	return webGlTexture;
}

/**
 * Updates the contents of a texture associated with a canvas,
 *  using the immediate contents of the canvas.
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that will facilitate the
 *                                                     creation of the texture
 * @param webGlTexture {WebGLTexture} The WebGL texture object that is to be updated
 * @param sourceCanvas {HTMLCanvasElement} An associated canvas object containing
 *                                         bitmap image data that  will be
 *                                         used to update the texture
 */
WebGlUtility.updateDynamicTextureWithCanvas = function(webGlCanvasContext, webGlTexture, sourceCanvas) {
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(sourceCanvas) &&
		Utility.validateVar(sourceCanvas)) {
			
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, sourceCanvas);		
	}		
}

/**
 *  Generates vertex data that can be used to construct geometry
 *   suitable for the application of texturing and lighting operations
 *   from a provided triangle objects
 *  
 *  @param triangleArray {Array} Array of Triangle objects
 *  @return {AggregateWebGlVertexData} Object which contains a collection
 *          of vertex data that can be directly buffered by WebGl
 */
WebGlUtility.generateAggregateVertexDataFromTriangleList = function(triangleArray) {
	var webGlVertexData = new WebGlUtility.AggregateWebGlVertexData();

	if (Utility.validateVarAgainstType(triangleArray, Array)) {

		var vertexCoordArray = new Array();
		var vertexColorsArray = new Array();
		var vertexTextureCoordsArray = new Array();
		var vertexNormalsArray = new Array();
		
		// Build individual, parallel arrays of vertex attributes, as required
		// by WebGL (Float32 value type)
		for (var currentIndex = 0; currentIndex < triangleArray.length; currentIndex++) {
			if (Utility.validateVarAgainstType(triangleArray[currentIndex], Triangle)) {
				vertexCoordArray.push.apply(vertexCoordArray,
					WebGlUtility.extractVertexCoordsFromTriangle(triangleArray[currentIndex]));
				vertexColorsArray.push.apply(vertexColorsArray,
					WebGlUtility.extractVertexColorsFromTriangle(triangleArray[currentIndex]));
				vertexTextureCoordsArray.push.apply(vertexTextureCoordsArray,
					WebGlUtility.extractVertexTextureCoordsFromTriangle(triangleArray[currentIndex]));
				vertexNormalsArray.push.apply(vertexNormalsArray,
					WebGlUtility.extractVertexNormalsFromTriangle(triangleArray[currentIndex]));
			}
		}
		
		webGlVertexData.vertices = new Float32Array(vertexCoordArray);
		webGlVertexData.vertexColors = new Float32Array(vertexColorsArray);
		webGlVertexData.vertexTextureCoords = new Float32Array(vertexTextureCoordsArray);
		webGlVertexData.vertexNormals = new Float32Array(vertexNormalsArray);
	}
	
	return webGlVertexData;
}

/**
 *  Extracts an array of vertex coordinates from a triangle
 *   object
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             vertex coordinates are to be extracted
 *  @return {Array} An array of coordinates, ordered by vertex (X, Y
 *          and Z coordinates are listed for each vertex)
 */
WebGlUtility.extractVertexCoordsFromTriangle = function(triangle) {
	var vertexCoordArray = new Array();
	
	if (Utility.validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];
		
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			vertexCoordArray.push(triangleVertices[vertexIndex].getX());
			vertexCoordArray.push(triangleVertices[vertexIndex].getY());
			vertexCoordArray.push(triangleVertices[vertexIndex].getZ());
		}
	}
	
	return vertexCoordArray;
}

/**
 *  Extracts color values from each triangle vertex
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             color data is to be extracted
 *  @return {Array} An array of color data, ordered by vertex (red,
 *  		green, blue and alpha component values are listed for
 *          each vertex)
 */
WebGlUtility.extractVertexColorsFromTriangle = function(triangle) {
	var vertexColorsArray = new Array();

	if (Utility.validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];		
		
		// Each vertex is associated with an RGBA color.
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			var vertexColor = triangleVertices[vertexIndex].getColor()
			
			vertexColorsArray.push(vertexColor.getRedValue(), vertexColor.getGreenValue(), vertexColor.getBlueValue(),
				vertexColor.getAlphaValue());
		}		
	}
	
	return vertexColorsArray;
}

/**
 *  Extracts texture coordinate values from each triangle vertex
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             texture coordinate data is to be
 *                             extracted
 *  @return {Array} An array of texture coordinates, ordered by
 *          vertex (U and V coordinate values are listed for each
 *          vertex)
 */
WebGlUtility.extractVertexTextureCoordsFromTriangle = function(triangle) {
	var vertexTextureCoordsArray = new Array();
	
	if (Utility.validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];
		
		// Each vertex is associated with a pair of texture coordinates.
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			var surfaceMappingCoords = triangleVertices[vertexIndex].getSurfaceMappingCoords()
			
			vertexTextureCoordsArray.push(surfaceMappingCoords.getXComponent(), surfaceMappingCoords.getYComponent());
		}
	}
	
	return vertexTextureCoordsArray;
}

/**
 *  Extracts vertex normal data from each triangle vertex
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             vertex normal data is to be extracted
 *  @return {Array} An array of vertex normal components, ordered by
 *          vertex (x, y and z components are listed for each vertex)
 */
WebGlUtility.extractVertexNormalsFromTriangle = function(triangle) {
	var vertexNormalsArray = new Array();
	
	if (Utility.validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];
		
		// Each vertex is associated with a single, three-component normal
		// vector - extract the normal vector components.
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			var normalVector = triangleVertices[vertexIndex].getNormalVector();
			
			if (Utility.validateVarAgainstType(normalVector, Vector3d)) {
				vertexNormalsArray.push(normalVector.getXComponent());
				vertexNormalsArray.push(normalVector.getYComponent());
				vertexNormalsArray.push(normalVector.getZComponent());
			}
		}
	}
	
	return vertexNormalsArray;
}

/**
 *  Converts a matrix object into a linear array suitable for use
 *   within a WebGL buffer
 *  
 *  @param matrix {MathExt.Matrix} Matrix representation object
 *  @return {Array} A single linear array object containing all
 *          data from all rows within the matrix representation
 */
WebGlUtility.convertMatrixToMatrixLinearArrayRep = function(matrix) {
	var matrixArray = new Float32Array();
	
	if (Utility.validateVarAgainstType(matrix, MathExt.Matrix) &&
		Utility.validateVar(matrix.matrixStore)) {

		var intermediateMatrixArray = new Array();
		for (var currentIndex = 0; currentIndex < matrix.matrixStore.length; currentIndex++) {
			intermediateMatrixArray.push.apply(intermediateMatrixArray, matrix.matrixStore[currentIndex]);
		}
		
		matrixArray = new Float32Array(intermediateMatrixArray);
	}
	
	return matrixArray;
}

/**
 * Creates a data container purposed for facilitating rendering
 *
 * @param webGlBufferData {WebGLBufferData} A collection of WebGL-allocated
 *                                          buffers
 * @param webGlShader {WebGLShader} A WebGL shader program
 *
 * @return {ObjectRenderWebGlData} A set of buffers that are allocated by WebGL, to
 *                                be used for rendering
 * @see WebGlUtility.WebGlBufferData
 * @see WebGlUtility.ObjectRenderWebGlData
 */
WebGlUtility.objectRenderWebGlDataFromWebGlBufferData = function(webGlBufferData, webGlShader) {
	var objRenderWeblGlData = null;
	
	if (Utility.validateVarAgainstType(webGlBufferData, WebGlUtility.WebGlBufferData)) {
		objRenderWeblGlData = new WebGlUtility.ObjectRenderWebGlData(
			webGlShader,
			webGlBufferData.objectWebGlVertexBuffer,
			webGlBufferData.objectWebGlColorBuffer,
			webGlBufferData.objectWebGlTexCoordBuffer,
			webGlBufferData.objectWebGlNormalBuffer,
			webGlBufferData.vertexCount);
	}
			
	return objRenderWeblGlData;
}


/**
 * Allocates a WebGL buffer, and stores the specified coordinate data
 *  within the buffer
 *  
 * @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                   to a WebGL display buffer
 * @param sourceData {Float32Array} Array of coordinate data to be buffered for use by
 *                                  WebGL
 * @return {WebGLBuffer} A WebGL buffer containing the provided data
 */
WebGlUtility.createWebGlBufferFromData = function(webGlCanvasContext, sourceData) {
	var targetBuffer = webGlCanvasContext.createBuffer();
	
	webGlCanvasContext.bindBuffer(webGlCanvasContext.ARRAY_BUFFER, targetBuffer);
	
	if (webGlCanvasContext instanceof WebGLRenderingContext) {	
		webGlCanvasContext.bufferData(webGlCanvasContext.ARRAY_BUFFER, sourceData, webGlCanvasContext.STATIC_DRAW);
	}
	else if (webGlCanvasContext instanceof WebGL2RenderingContext) {
		webGlCanvasContext.bufferData(webGlCanvasContext.ARRAY_BUFFER, sourceData, webGlCanvasContext.STATIC_DRAW, 0, sourceData.length);		
	}
	
	webGlCanvasContext.bindBuffer(webGlCanvasContext.ARRAY_BUFFER, null);
	
	return targetBuffer;
}

/**
 * Creates a collection of buffers allocated and filled by WebGL (vertex buffers,
 *  color buffers, etc.), using parallel collection of scalar values as the data
 *  to fill the buffers
 *
 * @param modelVertexData {ModelVertexDataContainer} Object which contains a collection
 *                                                   of vertex data (and associated data
 *                                                   that is applicable usage context of the
 *                                                   vertex data) that can be directly
 *                                                   buffered by WebGL
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *													   that will be used to facilitate
 *                           						   WebGL buffer creation
 * @param vertexSize Length of vertex data within the array required for a single vertex
 * @return {WebGlBufferData} Object which contains a collection of WebGL buffers
 */
WebGlUtility.createWebGlBufferDataFromAggregateVertexData = function(webGlCanvasContext, aggregateVertexData,
	vertexSize) {
	
	var webGlBufferData = null;
	
	// Convert the model vertex data into buffers that can be directly used for
	// WebGL rendering.
	if (Utility.validateVarAgainstType(aggregateVertexData, WebGlUtility.AggregateWebGlVertexData)) {
		webGlBufferData = new WebGlUtility.WebGlBufferData();
		webGlBufferData.objectWebGlVertexBuffer = WebGlUtility.createWebGlBufferFromData(webGlCanvasContext,
			aggregateVertexData.vertices);
		webGlBufferData.objectWebGlColorBuffer = WebGlUtility.createWebGlBufferFromData(webGlCanvasContext,
			aggregateVertexData.vertexColors);
		webGlBufferData.objectWebGlTexCoordBuffer = WebGlUtility.createWebGlBufferFromData(webGlCanvasContext,
			aggregateVertexData.vertexTextureCoords);
		webGlBufferData.objectWebGlNormalBuffer = WebGlUtility.createWebGlBufferFromData(webGlCanvasContext,
			aggregateVertexData.vertexNormals);
		webGlBufferData.vertexCount = aggregateVertexData.vertices.length / vertexSize;
	}
	
	return webGlBufferData;
}


/**
 * Renders geometry that is properly represented by data structures
 *  that encapsulate a description of an object to be rendered
 *
 * @param objectRenderWebGlData {ObjectRenderWebGlData} Object that contains the geometry to be
 *                                                      rendered, represented as WebGL buffers
 * @param transformationMatrix {MathExt.Matrix} Transformation matrix to be applied during rendering
 * @param projectionMatrix {MathExt.Matrix} Projection matrix to be applied during rendering 
 * @param webGlTexture {WebGLTexture} Texture to be used during rendering (if set to null, no
 *                                    texture will be used)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param attributeLocationData {WebGlUtility.AttributeLocationData} Object that contains strings
 *                                                                   indicating the location of
 *                                                                   WebGL attribute variables
 * @param attributeData {WebGlUtility.AttributeData} Object that contains the attribute values
 *                                                   be supplied to the shader
 * @param additionalSetupFunc {Function} Function that will be invoked to perform additional
 *                                       attribute/uniform setup (optional)
 * @param cachedUniformResolver {Function} A function that facilitates look-up/caching of uniform
 *                                         locations - the signature of this function is:
 *                                         ({WebGLRenderingContext2D}, {WebGLShader}, UniformName - {String})
 */
WebGlUtility.renderGeometry = function (objectRenderWebGlData, transformationMatrix, projectionMatrix,
	webGlTexture, targetCanvasContext, attributeLocationData, attributeData, additionalSetupFunc,
	cachedUniformResolver) {
		
	if (Utility.validateVarAgainstType(objectRenderWebGlData, WebGlUtility.ObjectRenderWebGlData)) {
		targetCanvasContext.useProgram(objectRenderWebGlData.webGlShaderProgram);
		
		// Disable any attributes that were enabled during a prior rendering invocation.
		var numProgramAttributes = targetCanvasContext.getProgramParameter(objectRenderWebGlData.webGlShaderProgram, targetCanvasContext.ACTIVE_ATTRIBUTES);
		for (var attributeIndex = 0; attributeIndex < numProgramAttributes; attributeIndex++) {
			targetCanvasContext.disableVertexAttribArray(attributeIndex);
		}		
		
		if (Utility.validateVar(additionalSetupFunc)) {
			additionalSetupFunc(objectRenderWebGlData.webGlShaderProgram);
		}
		
		// Bind the vertex buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexBuffer);
		var vertexPositionAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram,
			attributeLocationData.vertexPositionAttributeLocation);
		targetCanvasContext.vertexAttribPointer(vertexPositionAttribute, attributeData.vertexDataSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexPositionAttribute);
		
		if (objectRenderWebGlData.webGlVertexColorBuffer != null) {
			// Bind the vertex color buffer...
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexColorBuffer);	
			var vertexColorAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram,
				attributeLocationData.vertexColorAttributeLocation);
			targetCanvasContext.vertexAttribPointer(vertexColorAttribute, attributeData.vertexColorSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(vertexColorAttribute);
		}
		else {
			
		}
		
		if (objectRenderWebGlData.webGlVertexNormalBuffer != null) {
			// Bind the vertex normal buffer...
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexNormalBuffer);
			var vertexNormalAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram,
				attributeLocationData.vertexNormalAttributeLocation);
			targetCanvasContext.vertexAttribPointer(vertexNormalAttribute, attributeData.vectorSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(vertexNormalAttribute);
		}
		
		// Ensure that ambient lighting data is accessible by the shader
		// program (affects all rendered objects).
		var ambientLightUniform = WebGlUtility.getUniformLocation(targetCanvasContext,
			objectRenderWebGlData.webGlShaderProgram, attributeLocationData.ambientLightVectorAttributeLocation,
			cachedUniformResolver);
		if (Utility.validateVar(ambientLightUniform)) {
			targetCanvasContext.uniform3fv(ambientLightUniform, attributeData.ambientLightVector);
		}
		
		if (webGlTexture != null) {
			targetCanvasContext.bindTexture(targetCanvasContext.TEXTURE_2D, webGlTexture);
		}

		// Set the active texture coordinate buffer, if applicable...
		if ((objectRenderWebGlData.webGlTexCoordBuffer !== null) &&
			(attributeLocationData.textureCoordinateAttributeLocation !== null)) { 
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
				objectRenderWebGlData.webGlTexCoordBuffer);
			var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(
				objectRenderWebGlData.webGlShaderProgram, attributeLocationData.textureCoordinateAttributeLocation);
			targetCanvasContext.vertexAttribPointer(textureCoordinateAttribute, attributeData.textureCoordinateSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(textureCoordinateAttribute);
		}

		if (Utility.validateVarAgainstType(transformationMatrix, MathExt.Matrix)) {
			var transformationMatrixAsLinearArray = WebGlUtility.convertMatrixToMatrixLinearArrayRep(transformationMatrix);
			// Apply the transformation matrix (transformation will be performed by
			// vertex shader).
			targetCanvasContext.uniformMatrix4fv(WebGlUtility.getUniformLocation(targetCanvasContext,
				objectRenderWebGlData.webGlShaderProgram, attributeLocationData.transformationMatrixAttributeLocation,
				cachedUniformResolver), false, transformationMatrixAsLinearArray);
		}
		
		if (Utility.validateVarAgainstType(projectionMatrix, MathExt.Matrix)) {
			var projectionMatrixAsLinearArray = WebGlUtility.convertMatrixToMatrixLinearArrayRep(projectionMatrix);
			// Apply the transformation matrix (transformation will be performed by
			// vertex shader).
			targetCanvasContext.uniformMatrix4fv(WebGlUtility.getUniformLocation(targetCanvasContext,
				objectRenderWebGlData.webGlShaderProgram, attributeLocationData.projectionMatrixAttributeLocation,
				cachedUniformResolver), false, projectionMatrixAsLinearArray);
		}
	
		// ...Render the provided geometry.
		targetCanvasContext.drawArrays(targetCanvasContext.TRIANGLES, 0, objectRenderWebGlData.vertexCount);
		
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, null);
	}
}

/**
 * Utility routine - performs a shader uniform location look-up,
 *  caching the result if a uniform caching parameter is specified,
 *  and returns the result on subsequent invocations.
 *
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param shaderProgram {WebGLShader} The shader program on which the look-up
 *                                    will be performed if it is not contained
 *                                    within the cache
 * @param uniformName {String} The name of the uniform to look-up
 * @param cachedUniformLocationResolver {Function} A function that facilitates look-up/caching of uniform
 *                                         		   locations - the signature of this function is:
 *                                         		   ({WebGLRenderingContext2D}, {WebGLShader}, UniformName - {String})
 */
WebGlUtility.getUniformLocation = function (targetCanvasContext, shaderProgram, uniformName, cachedUniformLocationResolver) {
	var uniformLocation = null;
	
	if (Utility.validateVar(cachedUniformLocationResolver)) {
		uniformLocation = cachedUniformLocationResolver(targetCanvasContext, shaderProgram, uniformName);
	}
	else {
		uniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, uniformName);		
	}
	
	return uniformLocation;
}
