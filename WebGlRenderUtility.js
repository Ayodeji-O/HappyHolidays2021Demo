// WebGlRenderUtility - Implements an object that provides rudimentary
//                      WebGL rendering capability and associated utility
//                      routines
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -WebGlUtility.js
//  -MathExtMatrix.js

function WebGlRenderUtility() {
}


/**
 * Renders geometry that is properly represented by data structures
 *  that encapsulate a description of an object to be rendered
 *
 * @param objectRenderWebGlData {ObjectRenderWebGlData} Object that contains the geometry to be
 *                                                      rendered, represented as WebGL buffers
 * @param transformationMatrix {MathExt.Matrix} Transformation matrix to be applied during rendering
 * @param webGlTexture {WebGLTexture} Texture to be used during rendering (if set to null, no
 *                                    texture will be used)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
WebGlRenderUtility.prototype.renderGeometry = function (objectRenderWebGlData, transformationMatrix,
	webGlTexture, targetCanvasContext) {
		
	if (validateVarAgainstType(objectRenderWebGlData, ObjectRenderWebGlData)) {
		targetCanvasContext.useProgram(objectRenderWebGlData.webGlShaderProgram);
		// Bind the vertex buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexBuffer);
		var vertexPositionAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram,
			"aVertexPosition");
		targetCanvasContext.vertexAttribPointer(vertexPositionAttribute, this.constVertexSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexPositionAttribute);
		
		if (objectRenderWebGlData.webGlVertexColorBuffer != null) {
			// Bind the vertex color buffer...
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexColorBuffer);
			var vertexColorAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram, "aVertexColor");
			targetCanvasContext.vertexAttribPointer(vertexColorAttribute, this.constVertexColorSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(vertexColorAttribute);
		}
		
		if (objectRenderWebGlData.webGlVertexNormalBuffer != null) {
			// Bind the vertex normal buffer...
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexNormalBuffer);
			var vertexNormalAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram, "aVertexNormal");
			targetCanvasContext.vertexAttribPointer(vertexNormalAttribute, this.constVectorSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(vertexNormalAttribute);
		}
		
		// Ensure that ambient lighting data is accessible by the shader
		// program (affects all rendered objects).
		var ambientLightUniform = targetCanvasContext.getUniformLocation(objectRenderWebGlData.webGlShaderProgram, "uniform_ambientLightVector");
		if (validateVar(ambientLightUniform)) {
			targetCanvasContext.uniform3fv(ambientLightUniform, this.constAmbientLightVector);
		}
		
		if (webGlTexture != null) {
			targetCanvasContext.bindTexture(targetCanvasContext.TEXTURE_2D, webGlTexture);
		}

		// Set the active texture coordinate buffer, if applicable...
		if (objectRenderWebGlData.webGlTexCoordBuffer !== null) {
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
				objectRenderWebGlData.webGlTexCoordBuffer);
			var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(
				objectRenderWebGlData.webGlShaderProgram, "aTextureCoord");
			targetCanvasContext.vertexAttribPointer(textureCoordinateAttribute, this.constTextureCoordinateSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(textureCoordinateAttribute);
		}

		if (validateVarAgainstType(transformationMatrix, MathExt.Matrix)) {
			var transformationMatrixAsLinearArray = convertMatrixToMatrixLinearArrayRep(transformationMatrix);
			// Apply the transformation matrix (transformation will be performed by
			// vertex shader).
			targetCanvasContext.uniformMatrix4fv(targetCanvasContext.getUniformLocation(objectRenderWebGlData.webGlShaderProgram,
				"uniform_transformationMatrix"), false, transformationMatrixAsLinearArray);
		}
	
		// ...Render the provided geometry.
		targetCanvasContext.drawArrays(targetCanvasContext.TRIANGLES, 0, objectRenderWebGlData.vertexCount);
	}
}