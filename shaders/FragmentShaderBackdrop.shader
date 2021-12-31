// FragmentShaderBackdrop.shader - Renders a slightly blurred, darkened
// texture

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform mediump vec2 vTextureCoordOffset;
uniform highp ivec2 vTextureDimensions;

mediump vec2 getUnitNormalizedTexCoord(in mediump vec2 textureCoord) {
	mediump vec2 unitNormalizedTextureCoord = vec2(mod(textureCoord.x, 1.0), mod(textureCoord.y, 1.0));
	return unitNormalizedTextureCoord;
}

void main() {

	const mediump float kWidthToBlurBoxFactor = 0.00875;	
	const mediump float kDarkeningCoefficient = 0.5;
	
	const int blurBoxSize = 6;
	
	mediump vec2 texelIncrement = vec2(1.0 / float(vTextureDimensions.x), 1.0 / float(vTextureDimensions.y));
	
	mediump vec2 vTextureCoordWithOffset = vTextureCoordOffset + vTextureCoord;
	
	mediump vec4 colorSum = vec4(0.0, 0.0, 0.0, 0.0);
	for (int loopY = -blurBoxSize / 2; loopY <= blurBoxSize / 2; loopY++) {
		for (int loopX = -blurBoxSize / 2; loopX <= blurBoxSize / 2; loopX++) {
			mediump vec2 currentOffset = vec2(float(loopX) * texelIncrement.x, float(loopY) * texelIncrement.y);
			colorSum += texture2D(uSampler,getUnitNormalizedTexCoord(currentOffset + vTextureCoordWithOffset));
		}
	}
	
	mediump vec4 blurredTexel = colorSum / float(blurBoxSize * blurBoxSize);
	mediump vec3 darkenedTexelNoAlpha = blurredTexel.xyz * kDarkeningCoefficient;
	
	mediump vec4 finalColor = vec4(darkenedTexelNoAlpha, blurredTexel.w);
	
	gl_FragColor = finalColor;
}
