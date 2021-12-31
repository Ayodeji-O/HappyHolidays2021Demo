// FragmentShaderStandardTexture.shader - Generic texture mapping
// shader.

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform mediump float opacity;

void main() {
	gl_FragColor = texture2D(uSampler, vTextureCoord) * opacity;
}