// FragmentShaderBlackFader.shader - Fade to/from black shader
// shader.

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform mediump float fadeFraction;

void main() {
	mediump vec4 baseTexel = texture2D(uSampler, vTextureCoord);
	
	mediump float clampedFadeFraction = clamp(fadeFraction, 0.0, 1.0);
	
	gl_FragColor.w = baseTexel.w + ((1.0 - baseTexel.w) * clampedFadeFraction);
	gl_FragColor.xyz = baseTexel.xyz * (1.0 - clampedFadeFraction);
}