// VertexShaderStandardPositionShader.shader - Applies a transformation to vertices, using a
//                                             supplied transformation matrix; also applied
//       									   color, normal, lighting and texture coordinate data
// Author: Ayodeji Oshinnaiye

attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
uniform mediump vec3 uniform_ambientLightVector;
attribute vec2 aTextureCoord;

varying mediump vec2 vTextureCoord;
varying lowp vec4 vBaseFragmentColor;
varying mediump vec3 vNormalVector;
varying mediump vec3 vPosition;

uniform mat4 uniform_transformationMatrix;
uniform mat4 uniform_projectionMatrix;

void main() {
	vec4 finalPosition = vec4(aVertexPosition.xyz, 1.0) * uniform_transformationMatrix;
	mat4 finalTransformationMatrix = uniform_transformationMatrix * uniform_projectionMatrix;
	gl_Position = vec4(aVertexPosition.xyz, 1.0) * finalTransformationMatrix; 
	vTextureCoord = aTextureCoord;
	vBaseFragmentColor = aVertexColor;
	vNormalVector = aVertexNormal * mat3(uniform_transformationMatrix);
	vPosition = finalPosition.xyz;
}
