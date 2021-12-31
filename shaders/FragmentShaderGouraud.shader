// FragmentShaderGourad.shader - Generic gouraud shading
//                               fragment shader

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform mediump vec3 uniform_ambientLightVector;
varying mediump vec3 vNormalVector;

varying lowp vec4 vBaseFragmentColor;

void main() {
	const mediump float ambientContributionFraction = 0.7;
	mediump float ambientDotProduct = dot(normalize(vNormalVector), -normalize(uniform_ambientLightVector));
	mediump float ambientContibution = pow(abs(ambientDotProduct), 1.0) * ambientContributionFraction;
	mediump float baseContribution = 1.0 - ambientContributionFraction;
	gl_FragColor = vec4(clamp((vBaseFragmentColor * (baseContribution + ambientContibution)).xyz, 0.0, 1.0), 1.0);
}