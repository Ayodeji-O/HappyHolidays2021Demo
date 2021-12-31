// FragmentShaderVerticalColorMonoSplitFractionShader.shader - Split
//  screen into color/black-and-white vertically

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform mediump float imageWidth;
const mediump int maxBlendSamples = 128;
uniform mediump float splitFraction;

void main() {
	mediump vec4 baseTexel = texture2D(uSampler, vTextureCoord);
	
	mediump vec4 blendedTexel = vec4(0.0, 0.0, 0.0, 0.0);
		
	mediump float clampedSplitFraction = clamp(splitFraction, 0.0, 1.0);
	mediump float texelStep = 1.0 / imageWidth;
	
	mediump int workingMaxBlendSamples = int(max(floor((1.0 - clampedSplitFraction) * float(maxBlendSamples)), 1.0));
	
	for (int blendLoop = 0; blendLoop < maxBlendSamples; blendLoop++) {
	
		mediump vec2 vCurrentTextureCoord = vTextureCoord - vec2(((-float(workingMaxBlendSamples) / 2.0) + float(blendLoop)) * texelStep, 0.0);
		blendedTexel += texture2D(uSampler, vCurrentTextureCoord) / float(workingMaxBlendSamples);
		
		if (blendLoop >= workingMaxBlendSamples)
			break;
	}
	
	const mediump float kRedMonoPortion = 0.30;
	const mediump float kGreenMonoPortion = 0.59;
	const mediump float kBlueMonoPortion = (1.0 - (kRedMonoPortion + kGreenMonoPortion));
	
	mediump float monoIntensity = (kRedMonoPortion * baseTexel.x) + (kGreenMonoPortion * baseTexel.y) +
		(kBlueMonoPortion * baseTexel.z);
	mediump vec4 monoTexel = vec4(vec3(monoIntensity), baseTexel.w);

	//gl_FragColor.w = baseTexel.w;
	//gl_FragColor.w = 1.0;
	//gl_FragColor.xyz = blendedTexel;//(colorMultiplier * baseTexel.xyz) + ((1.0 - colorMultiplier) * monoTexel.xyz);
	gl_FragColor = blendedTexel;
}