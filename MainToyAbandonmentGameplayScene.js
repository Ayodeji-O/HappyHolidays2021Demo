// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -RgbColor.js
//  -LevelRepresentation.js

/**
 * Stores dimensions for models
 *  (render-space coordinates)
 */
function ModelDimensions() {
	this.dimensionX = 0.0;
	this.dimensionY = 0.0;
	this.dimensionZ = 0.0;
}

/**
 * Stores information pertaining to dynamic
 *  object instances that are rendered within a
 *  scene
 */
function DynamicItemInstanceData() {
	// Key used to access source model data within
	// key/value store
	this.modelDataKey = "";
	// Immediate position of the model in world
	// space
	this.modelWorldSpacePosition = new Point3d();
	// Immediate object velocity vector (meters/second)
	this.velocityVector = new Vector3d(0.0, 0.0, 0.0);	
}


/**
 * Dynamic instance data that pertains specifically
 *  to enemy objects
 * @see DynamicItemInstanceData
 */
function EnemyInstanceData () {
	DynamicItemInstanceData.call(this);
	
	this.contactDamage = 0.0;
	this.movementPatternSpecifier = 0;
}

var RectIntersectionEdge = {
	constEdgeTop : 0,
	constEdgeLeft : 1,
	constEdgeBottom : 2,
	constEdgeRight : 3,
}

function DynamicRectIntersectionInfo(timeToIntersection, intersectionEdge, clampedCoordValue) {
	this.timeToIntersection = timeToIntersection;
	this.intersectionEdge = intersectionEdge;
	this.clampedCoordValue = clampedCoordValue;
}

/**
 * Gameplay scene object which contains data that is employed
 *  to maintain the game state, in addition to retaining data
 *  that is immediately required for rendering the game
 *  scene
 */
function MainToyAbandonmentGameplayScene() {	
	// Scaling factor used to appropriately adjust the world scale to the
	// WebGL coordinate system. Each world scale measurement unit is
	// roughly equivalent to 1 meter; the world scale does not change
	// the actual equivalent unit length - it only adjusts the scale
	// used for rendering.
	// 1 meter = x rendering coordinate space units
	this.constWorldScale = 0.086;
	
	// Base size for the teddy bear protagonist - elements are
	// scaled against the torso, which is normalized, upon
	// loading to a height of 1.0 in render space units.
	// Scale the model to be the appropriate size in relation
	// to the level scale (the torso will be treated as being
	// 1.5 meters tall).
	this.constTeddyProtagonistBaseScaleMultiplier = 1.2;
	this.constScaleFactorDefaultTeddyProtagonist = this.constTeddyProtagonistBaseScaleMultiplier * this.constWorldScale;
	
	this.constTeddyProtagonistRenderSpaceOffsetAxisZ = this.constTeddyProtagonistBaseScaleMultiplier * -0.633333333;
	
	var constSourceMeshTorsoSizeX = 34.0940;
	var constSourceMeshTorsoSizeZ = 36.7647;
	
	var constSourceMeshLeftArmSizeZ = 25.6927;
	var constSourceMeshRightArmSizeZ = 25.6927;
	var constSourceMeshLeftLegSizeZ = 20.5775;
	var constSourceMeshRightLegSizeZ = 20.5775;
	var constSourceMeshHeadSizeX = 38.8900;
	
	this.constModelInitializationScaleFactors = {};
	this.constModelInitializationScaleFactors[globalResources.keyModelTeddyProtagonistHead] =
		this.constScaleFactorDefaultTeddyProtagonist * (constSourceMeshHeadSizeX / constSourceMeshTorsoSizeX);		
	this.constModelInitializationScaleFactors[globalResources.keyModelTeddyProtagonistTorso] =
		this.constScaleFactorDefaultTeddyProtagonist;
	this.constModelInitializationScaleFactors[globalResources.keyModelTeddyProtagonistLeftArm] =
		this.constScaleFactorDefaultTeddyProtagonist * (constSourceMeshLeftArmSizeZ / constSourceMeshTorsoSizeZ);
	this.constModelInitializationScaleFactors[globalResources.keyModelTeddyProtagonistRightArm] =
		this.constScaleFactorDefaultTeddyProtagonist * (constSourceMeshRightArmSizeZ / constSourceMeshTorsoSizeZ);
	this.constModelInitializationScaleFactors[globalResources.keyModelTeddyProtagonistLeftLeg] =
		this.constScaleFactorDefaultTeddyProtagonist * (constSourceMeshLeftLegSizeZ / constSourceMeshTorsoSizeZ);
	this.constModelInitializationScaleFactors[globalResources.keyModelTeddyProtagonistRightLeg] =
		this.constScaleFactorDefaultTeddyProtagonist * (constSourceMeshRightLegSizeZ / constSourceMeshTorsoSizeZ);
		
	this.constModelInitializationScaleFactors[globalResources.keyModelEnemyCoronaVirusMonster] = 0.15;
	this.constModelInitializationScaleFactors[globalResources.keyModelEnemyGrinch] = 0.15;
	this.constModelInitializationScaleFactors[globalResources.keyModelEnemySnowman] = 0.22;
	this.constModelInitializationScaleFactors[globalResources.keyModelEnemyEvilChristmasTree] = 0.25;
	
	this.constModelInitializationScaleFactors[globalResources.keyModelStar] = 0.13;
	
	
	this.constModelRenderSpaceOffsetAxisZValues = {};
	this.constModelRenderSpaceOffsetAxisZValues[globalResources.keyModelEnemyCoronaVirusMonster] = -0.07;
	this.constModelRenderSpaceOffsetAxisZValues[globalResources.keyModelEnemyGrinch] = -0.05;
	this.constModelRenderSpaceOffsetAxisZValues[globalResources.keyModelEnemySnowman] = -0.08;
	this.constModelRenderSpaceOffsetAxisZValues[globalResources.keyModelEnemyEvilChristmasTree] = -0.13;
	
	this.constModelRenderSpaceOffsetAxisZValues[globalResources.keyModelStar] = -0.06;

	// Base rotation applied to the model in order to orient the
	// model in the "north" direction.
	this.constBaseTeddyProtagonistCompositeModelRotationAxisY = Math.PI;
}

/**
 * Initializes the scene - invoked before scene execution
 *  
 * @param completionFunction {Function} Function to be invoked upon completion
 *                                      of the initialization process
 *
 * @see sceneExecution()
 */
MainToyAbandonmentGameplayScene.prototype.initialize = function (completionFunction) {
	this.totalElapsedSceneTimeMs = 0.0;
	
	// Minimum framerate value used internally during
	// time-quantum based evaluations.
	this.constMinEvaluatedFrameRate = 15.0;
	
	// Maximum time quantum that will be used to evaluate
	// time-quantum based operations
	this.maxExpressibleTimeQuantum = (1.0 / this.constMinEvaluatedFrameRate) * Constants.millisecondsPerSecond;
	
	// Number of floating point values that comprise a vertex
	this.constVertexSize = 3;
	// Number of floating point values that comprise a vector
	this.constVectorSize = 3;
	// Number of floating point values that comprise a vertex
	// color
	this.constVertexColorSize = 4;
	// Number of floating point values that comprise a texture
	// coordinate
	this.constTextureCoordinateSize = 2;
		
	// 3D-transformation matrix size - 4 x 4
	this.constTransformationMatrixRowCount = 4;
	this.constTransformationMatrixColumnCount = 4;
		
	// Spirit gauge overlay position
	this.gaugeOverlayTopOffsetY = 0.05;
	this.gaugeOverlayHeight = 0.10;
	
	this.constFullScreenOverlayHeight = 2.0;

	this.progressOverlayWebGlData = null;	
	this.gaugeOverlayRenderWebGlData = null;
	this.fullScreenOverlayWebGlData = null;
	this.leftInputIndicatorOverlay = null;
	this.rightInputIndicatorOverlay = null;
	this.upInputIndicatorOverlay = null;
	this.downInputIndicatorOverlay = null;
	
	// Spirit Gauge colors
	this.constSpiritGaugeMaxValueColor = new RgbColor(0.0, 1.0, 0.0, 0.75);
	this.constSpiritGaugeMinValueColor = new RgbColor(0.8, 0.0, 0.0, 0.75);
	this.constSpiritGaugeLeadingEdgeColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	this.constSpiritGaugeLeadingEdgeFraction = 0.92
	this.constSpiritGaugeOutlineColor = new RgbColor(1.0, 1.0, 1.0, 0.9);	
	
	this.constSpiritGaugeWidth = 650;
	
	// Left margin of the gauge overlay text
	this.constOverlayTextLeftMargin = 15;
	
	// Interval, in milliseconds, at which overlay textures will
	// be updated (updates may involve updating textures, which
	// can be a relatively slow process).
	this.constOverlayUpdateIntervalMs = 400;
	
	// Ensure that an initial update is performed.
	this.currentOverlayUpdateElapsedInterval = this.constOverlayUpdateIntervalMs;

	this.renderSpaceGroundPlaneCoord = 0.00;
	
	// Tile dimensions, in world units
	this.constTileWidthWorldUnits = 1.00;
	this.constTileHeightWorldUnits = 1.00;

	this.leftIndicatorOverlayAlpha = 0.0;
	this.rightIndicatorOverlayAlpha = 0.0;
	this.upIndicatorOverlayAlpha = 0.0;
	this.downIndicatorOverlayAlpha = 0.0;
		
	// Abstractly manages input device binding.
	this.inputEventInterpreter = new InputEventInterpreter();	
	
	// Input event receiver - keyboard
	this.keyboardInputEventReceiver = new KeyboardInputEventReceiver(window);
	
	// Input event receiver - touch
	this.touchInputEventReceiver = new DeviceTouchInputEventReceiver(window);
	

	
	// Vector indicating the direction of the
	// ambient light source
	this.constAmbientLightVector = new Float32Array([
		-0.4, -0.3, -0.4
	]);	
	
	// Keys used to reference level data within the
	// resource key/value store
	this.levelKeyCollection =
	[
		globalResources.keyLevel1,
		globalResources.keyLevel2,
		globalResources.keyLevel3,
		globalResources.keyLevel4,
		globalResources.keyLevel5,
		globalResources.keyLevel6,
		globalResources.keyLevel7,
		globalResources.keyLevel8,
		globalResources.keyLevel9,
		globalResources.keyLevel10,
	];
	
	this.levelBuiltInModelSymbolToModelKeyDict = {};
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_EnemyGrinch"] = globalResources.keyModelEnemyGrinch;	
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_EnemyCoronaVirus"] = globalResources.keyModelEnemyCoronaVirusMonster;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_EnemyEvilChristmasTree"] = globalResources.keyModelEnemyEvilChristmasTree;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_EnemySnowman"] = globalResources.keyModelEnemySnowman;
	this.levelBuiltInModelSymbolToModelKeyDict["BuiltInModel_Star"] = globalResources.keyModelStar;
	
	// Dictionary that matches level specification
	// texture names to pre-loaded/texture
	// resource keys.
	this.levelBuiltInTextureToTextureKeyDict = {};
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_BrownCoarseStone"] = globalResources.keyTextureBrownCoarseStone;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_ChiseledIce"] = globalResources.keyTextureChiseledIceGenetica;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DarkGreyVolcanicRock"] = globalResources.keyTextureDarkGreyVolcanicRock;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_Grass"] = globalResources.keyTextureGrass;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_TextureLava"] = globalResources.keyTextureLava;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_SparseLeaves"] = globalResources.keyTextureSparseLeaves;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_SlateMarble"] = globalResources.keyTextureSlateMarble;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_BeigeCarvedStone"] = globalResources.keyTextureBeigeCarvedStone;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_TanSmoothSandStone"] = globalResources.keyTextureTanSmoothSandStone;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_VariegatedSlatePaver"] = globalResources.keyTextureVariegatedSlatePaver;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_CrackedDryDirt"] = globalResources.keyTextureCrackedDryDirt,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_GoldShinyBrushed"] = globalResources.keyTextureGoldShinyBrushed,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_IrregularConcrete"] = globalResources.keyTextureIrregularConcrete,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_MortaredBasaltCobbleStone"] = globalResources.keyTextureMortaredBasaltCobbleStone,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_RoughOutcropping"] = globalResources.keyTextureRoughOutcropping,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_StackedMetalPlate"] = globalResources.keyTextureStackedMetalPlate,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_GreyTiledStone"] = globalResources.keyTextureGreyTiledStone,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DarkWoodenCrate"] = globalResources.keyTextureDarkWoodenCrate;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_LightCardboardBox;"] = globalResources.keyTextureLightCardboardBox;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_LightWoodenCrate"] = globalResources.keyTextureLightWoodenCrate;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_MetalCrate"] = globalResources.keyTextureMetalCrate;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_MetalPanel"] = globalResources.keyTextureRustyMetalPanel;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_Snow"] = globalResources.keyTextureSnow;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_IgneousRock"] = globalResources.keyTextureIgneousRock;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DrawnPlank"] = globalResources.keyTextureDrawnPlank;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DrawnMudClump"] = globalResources.keyTextureDrawnMudClump;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_PseudoGrass"] = globalResources.keyTexturePseudoGrass;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_PebbleBed"] = globalResources.keyTexturePebbleBed;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_PseudoCarbonFiber"] = globalResources.keyTexturePseudoCarbonFiber;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DrawnTile"] = globalResources.keyTextureDrawnTile;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_StonyGrass"] = globalResources.keyTextureStonyGrass;
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DrawnLeaves"] = globalResources.keyTextureDrawnLeaves,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DrawnLeavesFlowers"] = globalResources.keyTextureDrawnLeavesFlowers,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_WoodGrain"] = globalResources.keyTextureWoodGrain,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_IvyHedge"] = globalResources.keyTextureIvyHedge,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_AutumnLeaves"] = globalResources.keyTextureAutumnLeaves,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_HotCoal"] = globalResources.keyTextureHotCoal,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_HotCharcoalBriquettes"] = globalResources.keyTextureHotCharcoalBriquettes,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_DecorativeGlass"] = globalResources.keyTextureDecorativeGlass,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_PearlizedGranite"] = globalResources.keyTexturePearlizedGranite,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_IrregularGreyStoneBlocks"] = globalResources.keyTextureIrregularGreyStoneBlocks,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_VariegatedMarble"] = globalResources.keyVariegatedMarbleTexture,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_GreyBeveledTiledStone"] = globalResources.keyGreyBeveledTiledStoneTexture,
	this.levelBuiltInTextureToTextureKeyDict["BuiltInTexture_StarTile"] = globalResources.keyTextureStarTile,

	this.constLevelSymbolContactDamageSpecifier = "contactDamage";
	this.constLevelSymbolTypeGoalSpecifier = "ElementType_Goal";
	this.constLevelSymbolTypeEnemySpecifier = "ElementType_Enemy";

	// Perspective matrix
	this.perspectiveMatrixStore = null;
	
	this.identityMatrixStore = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);
	this.identityMatrixStore.setToIdentity()

	// "Reference" model dimensions for loaded models - represents
	// the dimensions of models before they were loaded (before
	// any applied transformations) (ModelDimensions collection)
	this.modelRefDimensionKeyValStore = {};	
	
	// Key/value storage for general model
	// orientation/"pose" matrices, with the
	// model centered at the origin (or, the primary
	// model being centered at the origin, in instances
	// where multiple, discrete models comprise a larger
	// model; world/render-space translations are
	// computed elsewhere) (MathExt.Matrix collection)
	this.modelMatrixKeyValStore = {};
	
	// Collection of items that are employed as goal
	// markers (DynamicItemInstanceData type)
	this.goalMarkerInstanceDataCollection = [];
	
	// Collection of enemy objects which exist within the
	// active level (EnemyInstanceData type)
	this.enemyInstanceDataCollection = []
	
	// Model WebGL buffers (WebGL vertex buffer data) -
	// All models (including those for the teddy protagonist,
	// where each component will employ separate buffer)
	// have an associated buffer, which is required
	// for rendering.
	this.webGlBufferDataKeyValStore = {};	
	
	// Curves used to evaluate the immediate value of
	// model pose rotation/pivot angles, as applicable.
	// Clients can invoke curveWithTime(...) in order to
	// retrieve the appropriate value for a particular
	// model.
	this.modelPosePivotAngleEvaluatorKeyValStore = {};
	
	this.compositeTeddyLongitudinalTiltAngleEvaluator = LinearCurve(0.0, 0.0, 0.0);
	
	this.constModelPivotAxisX = 0,
	this.constModelPivotAxisY = 1,
	this.constModelPivotAxisZ = 2,
	
	// Represents the spatial data / element attribute specification
	// of the current level.
	this.currentLevelRepresentation = null;
	
	// Manages viewport coordinates required to display the
	// proper portion of the level.
	this.levelScrollManager = null;
	
	// World-space position in level
	this.currentWorldSpacePositionInLevel = new Point3d(0.0, 0.0, 0.0);
	
	// Teddy protagonist velocity, expressed in meters/millisecond
	this.currentTeddyProtagonistVelocity = new Vector3d(0.0, 0.0, 0.0);
	
	// Last recorded heading angle for the teddy protagonist (will be
	// used in instances where there is no active, input-based
	// acceleration being applied to the teddy protagonist.
	this.lastTeddyProtagonistHeadingAngle =
		this.constBaseTeddyProtagonistCompositeModelRotationAxisY;
	
	// Teddy protagonist ambulation acceleration, expressed in meters / millisecond²
	this.teddyProtagonistAmbulationAccelerationMetersPerMsSq = 30.0 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond);

	// Teddy protagonist ambulation deceleration, (used when stopping),
	// expressed in meters / millisecond²
	this.teddyProtagonistAmbulationDecelerationMetersPerMsSq =
		this.teddyProtagonistAmbulationAccelerationMetersPerMsSq;
		
	// Dimensionless acceleration along the X-axis that is being
	// explicitly applied to the Teddy protagonist (corresponds
	// directly to the associated input magnitude).
	this.currentTeddyProtagonistUnitAccelerationAxisX = 0.0;
	
	// Dimensionless acceleration along the Y-axis that is being
	// explicitly applied to the Teddy protagonist (corresponds
	// directly to the associated input magnitude).
	this.currentTeddyProtagonistUnitAccelerationAxisY = 0.0;
	
	// Exponent for power function applied to acquired unit input values for protagonist movement
	// (reduces sensitivity for low-magnitude inputs).
	this.constDeviceAccelResultExpoFactor = 3.5;	
	
	// Teddy protagonist maximum ambulation velocity (12 miles / hour)
	this.currentTeddyProtagonistMaxAmbulationVelocity = 5.36448 /
		Constants.millisecondsPerSecond;
		
	// Rotation rate of the goal item (animation) - degrees /
	// millisecond
	this.goalItemRotationRate = (Math.PI / 2.0) / Constants.millisecondsPerSecond;		
	
	// Index of the current level
	// @see MainToyAbandonmentGameplayScene.levelKeyCollection
	this.currentLevelIndex = 0;
	
	// Minimum / maximum absolute teddy protagonist "health" values
	this.constTeddyProtagonistMinHealth = 0;
	this.constTeddyProtagonistMaxHealth = 50;
	
	// Game environment operation state specifiers
	this.constOperationStateActive = 0;
	this.constOperationStateInterLevelPause = 1;
	this.constOperationStateInterLevelPauseCompletion = 2;
	this.constOperationStateInactive = 3;
	
	this.operationState = this.constOperationStateActive;
	
	// Will be true when the "Game Over" screen content has
	// been rendered
	this.gameEndOverlayContentHasBeenGenerated = false;
	
	this.gameCompletionOverlayContentHasBeenGenerated = false;
	
	this.fadeOverlayContentHasBeenGenerated = false;	
	
	// Rate at which the teddy protagonist health decreases per millisecond
	this.constTeddyProtagonistHealthDecreaseRatePerMs = 0.20 / Constants.millisecondsPerSecond;	
	
	this.teddyProtagonistCurrentHealth = this.constTeddyProtagonistMaxHealth;
	this.teddyProtagonistIsInvulnerable = false;
	
	// Animation types for the teddy protagonist
	this.constTeddyProtagonistAnimationTypeStationary = 0;
	this.constTeddyProtagonistAnimationTypeAmbulation = 1;
	this.constTeddyProtagonistAnimationTypeDamageReception = 2;
	this.constTeddyProtagonistAnimationGameEnd = 3;
	
	// Current animation type for the teddy bear protagonist
	this.currentTeddyProtagonistAnimationType = this.constTeddyProtagonistAnimationTypeStationary;	
	
	// Absolute starting time of the current animation sequence
	// (milliseconds)
	this.currentTeddyProtagonistAnimationStartTimeMs = 0;
	
	this.gameEndAnimationDurationMs = 1000.0;
	
	this.gameEndHeadTiltAngleRateRadMs = ( Math.PI / 6.0 ) / 1000.0;
	
	// Damage reception animation duration (milliseconds)
	this.constDamageReceptionAnimationDurationMs = 2000.0;
	
	this.constGeneralInvulnerabilityDurationMs = 3000.0;
	
	// Frame render interval for the invulnerability "blink"
	// effect.
	this.invulnerabilityFrameRenderInterval = 1;
	
	// Number of frames rendered since the last
	// invulnerability effect frame was rendered.
	this.framesRenderedSinceLastInvulnerabilityFrame = 0;
		
	// Time at which gameplay activity stopped (e.g. game over state -
	// milliseconds)
	this.gameActivityEndTimeMs = 0;
	
	this.constFadeTransitionDurationMs = 1500;
	
	this.constTimerIdDamageReceptionEvent = "TimerId_DamageReceptionEvent";
	
	this.constTimerIdGeneralInvulnerabilityEvent = "TimerId_GeneralInvulnerability";
	// Event that occurs at the start of the initiation of the next
	// level (occurs before the next level is activated)
	this.constTimerIdNextLevelTransitionEvent = "TimerId_NextLevelTransition";
	// Event that occurs at the completeion of the initiaiton of
	// the next level (occurs after the next level is activated)
	this.constTimerIdLevelTransitionContinuationEvent = "TimerId_LevelTransitionContinuation";
	
	// Collection of various, expirable timers of type ExternalSourceTimer -
	// timers are removed upon expiration.
	this.activeTimers = [];
	
	// Background color for the "game over" overlay
	this.gameEndOverlayBackgroundColor = new RgbColor(0.0, 0.0, 0.0, 0.8);	
	
	// Color used to clear the WebGL canvas
	this.constCanvasClearColor = new RgbColor(0.0, 0.0, 0.0, 0.0);
	
	this.guideLightColor = new RgbColor(0.1, 0.1, 0.1, 1.0);
	
	// Canvas used to render the spirit gauge / spirit label
	this.spiritLabelCanvasBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
		Constants.labelFont, Constants.labelFontStyle);
	this.spiritLabelCanvasBuffer.updateStaticTextString(Constants.stringVitalityLabel);	

	// Background color for the text section.
	this.defaultTextAreaBackgroundColor =  new RgbColor(
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,		
		Constants.defaultTextBackgroundUnitAlpha);

	this.shaderStandardObject =	null;
	this.shaderPointLightStandardObject = null;
	this.shaderStandardTexturedObject = null;
	this.shaderStandardOverlayTextureRender = null;	
	this.shaderTexturedGouraudObject = null;
	this.shaderBackdropRender = null;
	this.shaderBlackFader = null;
	
	// Caches uniform locations for shader uniform look-ups.
	// The cache is keyed by a caller-provided key (should be
	// unique for each used shader. The object associated
	// with each key returns a key/value store, keyed by the
	// uniform name.
	this.uniformLocationCache = {};

	var webGlCanvasContext = globalResources.getMainCanvasContext();
	webGlCanvasContext.clearColor(this.constCanvasClearColor.getRedValue(), this.constCanvasClearColor.getGreenValue(),
		this.constCanvasClearColor.getBlueValue(), this.constCanvasClearColor.getAlphaValue())	

	// Enable alpha blending.
	webGlCanvasContext.enable(webGlCanvasContext.BLEND);
	webGlCanvasContext.blendFunc(webGlCanvasContext.SRC_ALPHA, webGlCanvasContext.ONE_MINUS_SRC_ALPHA);
	
	webGlCanvasContext.enable(webGlCanvasContext.CULL_FACE);
	webGlCanvasContext.cullFace(webGlCanvasContext.BACK);
	
	var canvasContext = globalResources.getMainCanvasContext();
	this.buildShaderPrograms(canvasContext);
	
	this.webGlBufferDataLevelTileQuad = null;
	this.webGlBufferDataBaseWallCube = null;
	
	var constStartingLevelIndex = 0;
	var sceneInstance = this;	
	function finalizeInitialization() {
		// Prepare the gameplay level for use.
		sceneInstance.setupNewLevelState(constStartingLevelIndex);
		sceneInstance.setupInputEventHandler();
		
		if (Utility.validateVar(completionFunction)) {
			completionFunction();
		}
	}

	this.generateDynamicElementPredeterminedMatrices();
	this.prepareGeometricRenderData(finalizeInitialization);
}

/**
 * Compiles all WebGL shader programs required to render
 *  a scene
 *
 * @param canvasContext {WebGLRenderingContext2D} WebGL context that is required to
 *                                                compile shader programs
 *
 */
MainToyAbandonmentGameplayScene.prototype.buildShaderPrograms = function(canvasContext) {
	var vertexShaderStandardPositionTransformSource = globalResources.getLoadedResourceDataByKey(globalResources.keyVertexShaderStandardPosition)
	var fragmentShaderGouraud = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderGouraud);
	var fragmentShaderPointLightGouraud = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderPointLightGouraud);
	var fragmentShaderBackdrop = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderBackdrop);
	var fragmentShaderBlackFader = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderBlackFader);
	var fragmentShaderHorizBlurConverge = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderHorizontalBlurConverge);
	var fragmentShaderStandardTexture = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderStandardTexture);
	var fragmentShaderStandardTextureOpacity = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderStandardTextureOpacity);
	var fragmentShaderGouraudTexture = globalResources.getLoadedResourceDataByKey(globalResources.keyFragmentShaderGouraudTexture);	
	this.shaderStandardObject = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderGouraud.resourceDataStore);
	this.shaderPointLightStandardObject = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderPointLightGouraud.resourceDataStore);
	this.shaderStandardTexturedObject = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderStandardTexture.resourceDataStore);
	this.shaderStandardTexturedObjectOpacity = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore,
		fragmentShaderStandardTextureOpacity.resourceDataStore);
	this.shaderTexturedGouraudObject = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderGouraudTexture.resourceDataStore);
	this.shaderBackdropRender = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderBackdrop.resourceDataStore);
	this.shaderBlackFader = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderBlackFader.resourceDataStore);
	this.shaderHorizBlurConverge = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderHorizBlurConverge.resourceDataStore);
	this.shaderStandardOverlayTextureRender = WebGlUtility.createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderStandardTexture.resourceDataStore);
}

/**
 * Converts a value, represented in render-space units, to world-space units
 *  (meters)
 *
 * @param renderSpaceLength {Number} Render-space length specification
 *
 * @return {Number} World-space length specification (meters)
 */
MainToyAbandonmentGameplayScene.prototype.renderSpaceLengthToWorldSpaceLength = function (renderSpaceLength) {
	return Utility.returnValidNumOrZero(renderSpaceLength) / this.constWorldScale;
}

/**
 * Converts a value, represented in world-space units, to render-space units
 *  (meters)
 *
 * @param worldSpaceLength {Number} World-space length specification
 *
 * @return {Number} Render-space length specification
 */
MainToyAbandonmentGameplayScene.prototype.worldSpaceLengthToRenderSpaceLength = function (worldSpaceLength) {
	return Utility.returnValidNumOrZero(worldSpaceLength) * this.constWorldScale;	
}

/**
 * Converts a position in three-dimensional render space (meters) to world-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in world space
 */
MainToyAbandonmentGameplayScene.prototype.renderSpacePositionToWorldSpacePosition = function (coordX, coordY, coordZ) {
	var renderSpacePoint = new Point3d(
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordX)),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordY)),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(coordZ)));
	
	return renderSpacePoint;	
}

/**
 * Converts a point, represented in render-space units, to render-space
 *  units which are translated based on the current protagonist position within
 *  the level (the translation is required to properly render only on-screen
 *  portions of the level)
 *
 * @param coordX {Number} Render-space X-axis length specification, in meters
 * @param coordY {Number} Render-space Y-axis length specification, in meters
 * @param coordZ {Number} Render-space Z-axis length specification, in meters
 *
 * @return {Point3d} Render-space position specification
 */
MainToyAbandonmentGameplayScene.prototype.renderSpacePositionToTranslatedRenderSpacePosition = function (coordX, coordY, coordZ) {
	return this.worldSpacePositionToTranslatedRenderSpacePosition(this.renderSpaceLengthToWorldSpaceLength(coordX),
		this.renderSpaceLengthToWorldSpaceLength(coordY), this.renderSpaceLengthToWorldSpaceLength(coordZ));
}

/**
 * Converts a point, represented in world-space units (meters), to render-space
 *  units which are translated based on the current protagonist position within
 *  the level (the translation is required to properly render only on-screen
 *  portions of the level)
 *
 * @param coordX {Number} World-space X-axis length specification, in meters
 * @param coordY {Number} World-space Y-axis length specification, in meters
 * @param coordZ {Number} World-space Z-axis length specification, in meters
 *
 * @return {Point3d} Render-space position specification
 */
MainToyAbandonmentGameplayScene.prototype.worldSpacePositionToTranslatedRenderSpacePosition = function (coordX, coordY, coordZ) {	
	
	var renderSpacePosition = null;
	
	if (this.levelScrollManager !== null) {
		var renderSpaceVisibleRect = this.levelScrollManager.scrollSpaceVisibleRect();

		/*r offsetFromStartX = this.worldSpaceLengthToRenderSpaceLength(this.currentLevelRepresentation.startPosition.positionX) -
			this.levelScrollManager.viewPortCenterPointX;
		var offsetFromStartY = this.worldSpaceLengthToRenderSpaceLength(this.currentLevelRepresentation.startPosition.positionY) -
			this.levelScrollManager.viewPortCenterPointY;	
		
		var baseRenderSpacePositionInLevel = this.worldSpacePositionToRenderSpacePosition(this.currentWorldSpacePositionInLevel.xCoord,
			this.currentWorldSpacePositionInLevel.yCoord, this.currentWorldSpacePositionInLevel.zCoord)*/
		
		var renderSpacePositionX = this.worldSpaceLengthToRenderSpaceLength(coordX) - renderSpaceVisibleRect.left - this.levelScrollManager.viewPortSizeX / 2.0;
		var renderSpacePositionY = this.worldSpaceLengthToRenderSpaceLength(coordY) - renderSpaceVisibleRect.top - this.levelScrollManager.viewPortSizeY / 2.0;
		var renderSpacePositionZ = this.worldSpaceLengthToRenderSpaceLength(coordZ) - 0.0;
		
		renderSpacePosition = new Point3d(renderSpacePositionX, renderSpacePositionY, renderSpacePositionZ);
	}
	else {
		renderSpacePosition = this.worldSpacePositionToRenderSpacePosition(renderSpacePositionX, renderSpacePositionY, renderSpacePositionZ);
	}
	
	return renderSpacePosition;
}

/**
 * Converts a position in three-dimensional world space (meters) to render-space
 *  units
 *
 * @param coordX {Number} X-axis position
 * @param coordY {Number} Y-axis position
 * @param coordZ {Number} Z-axis position
 *
 * @return {Point3d} A position in render-space
 */
MainToyAbandonmentGameplayScene.prototype.worldSpacePositionToRenderSpacePosition = function (coordX, coordY, coordZ) {
	var renderSpacePoint = new Point3d(
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordX)),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordY)),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(coordZ)));
	
	return renderSpacePoint;
}

/**
 * Converts a rectangle from world-space coordinates to render-space coordinates
 *
 * @param worldSpaceRect {Rectangle} Rectangle in world-space coordinates
 *
 * @return {Rectangle} Rectangle in render-space coordinates
 */
MainToyAbandonmentGameplayScene.prototype.worldSpaceRectToRenderSpaceRect = function (worldSpaceRect) {
	return new Rectangle(
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(worldSpaceRect.left)),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(worldSpaceRect.top)),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(worldSpaceRect.width)),
		this.worldSpaceLengthToRenderSpaceLength(Utility.returnValidNumOrZero(worldSpaceRect.height)));
}

/**
 * Converts a rectangle from render-space coordinates to world-space coordinates
 *
 * @param renderSpaceRect {Rectangle} Rectangle in render-space coordinates
 *
 * @return {Rectangle} Rectangle in world-space coordinates
 */
MainToyAbandonmentGameplayScene.prototype.renderSpaceRectToWorldSpaceRect = function (renderSpaceRect) {
	return new Rectangle(
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(renderSpaceRect.left)),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(renderSpaceRect.top)),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(renderSpaceRect.width)),
		this.renderSpaceLengthToWorldSpaceLength(Utility.returnValidNumOrZero(renderSpaceRect.height)));	
}

/**
 * Creates geometry for a Z-plane aligned quad
 *
 * @param xAxisSpan {number} Length of the quad along the X-axis
 * @param yAxisSpan {number} Length of the quad along the Y-axis
 * @param centerX {number} Center of the quad along the X-axis
 * @param centerY {number} Center of the quad along the Y-axis
 * @param zCoord {number} Z-plane coordinate in which the quad lies
 *
 * @return {Array} Array of Triangle objects which comprise the Z-plane
 *                 aligned quad
 */
MainToyAbandonmentGameplayScene.prototype.zPlaneQuadTriangles = function (xAxisSpan, yAxisSpan, centerX, centerY, zCoord) {
	var normalVector = new Vector3d(0.0, 0.0, -1.0);
	
	var firstTriangleVertexA = new Vertex3d(-xAxisSpan / 2.0 + centerX,		yAxisSpan / 2.0 + centerY,		zCoord);
	var firstTriangleVertexB = new Vertex3d(-xAxisSpan / 2.0 + centerX, 	-yAxisSpan / 2.0 + centerY,		zCoord);
	var firstTriangleVertexC = new Vertex3d(xAxisSpan / 2.0 + centerX, 		-yAxisSpan / 2.0 + centerY,		zCoord);
	
	var secondTriangleVertexA = new Vertex3d(xAxisSpan / 2.0 + centerX, 	-yAxisSpan / 2.0 + centerY,		zCoord);
	var secondTriangleVertexB = new Vertex3d(xAxisSpan / 2.0 + centerX, 	yAxisSpan / 2.0 + centerY, 		zCoord);
	var secondTriangleVertexC = new Vertex3d(-xAxisSpan / 2.0 + centerX, 	yAxisSpan / 2.0 + centerY,		zCoord);

	firstTriangleVertexA.setSurfaceMappingCoords(0.0, 0.0);
	firstTriangleVertexB.setSurfaceMappingCoords(0.0, 1.0);
	firstTriangleVertexC.setSurfaceMappingCoords(1.0, 1.0);
	
	secondTriangleVertexA.setSurfaceMappingCoords(1.0, 1.0);
	secondTriangleVertexB.setSurfaceMappingCoords(1.0, 0.0);
	secondTriangleVertexC.setSurfaceMappingCoords(0.0, 0.0);
	
	var vertices = [
		firstTriangleVertexA,
		firstTriangleVertexB,
		firstTriangleVertexC,
		secondTriangleVertexA,
		secondTriangleVertexB,
		secondTriangleVertexC,
	];
	
	vertices.forEach(function(vertex) {
		vertex.setNormalVector(normalVector);
	});
	
	return [ new Triangle(firstTriangleVertexA, firstTriangleVertexB, firstTriangleVertexC),
		new Triangle(secondTriangleVertexA, secondTriangleVertexB, secondTriangleVertexC) ];
}

/**
 * Creates an array suitable for generation of a vertex buffer that
 *  represents a quad
 *
 * @param xAxisSpan {number} Length of the quad along the X-axis
 * @param yAxisSpan {number} Length of the quad along the Y-axis
 * @param centerX {number} Center of the quad along the X-axis
 * @param centerY {number} Center of the quad along the Y-axis
 * @param zCoord {number} Z-plane coordinate in which the quad lies
 *
 * @return {Float32Array} Array of Float-32 values which can be directly
 *                        used to generate a vertex buffer
 *
 * @see WebGlUtility.createWebGlBufferFromData
 */
MainToyAbandonmentGameplayScene.prototype.quadCoordArray = function (xAxisSpan, yAxisSpan, centerX, centerY, zCoord) {
	return new Float32Array([
		// Upper-left (triangle #1)
		-xAxisSpan / 2.0 + centerX, 		yAxisSpan / 2.0 + centerY,			zCoord,
		// Lower-left (triangle #1)
		-xAxisSpan / 2.0 + centerX, 		-yAxisSpan / 2.0 + centerY,			zCoord,
		// Lower-right (triangle #1)
		xAxisSpan / 2.0 + centerX, 			-yAxisSpan / 2.0 + centerY,			zCoord,
		
		// Lower-right (triangle #2)
		xAxisSpan / 2.0 + centerX, 			-yAxisSpan / 2.0 + centerY,			zCoord,
		// Upper-right (triangle #2)		
		xAxisSpan / 2.0 + centerX, 			yAxisSpan / 2.0 + centerY, 			zCoord,
		// Upper-left (triangle #2)
		-xAxisSpan / 2.0 + centerX, 		yAxisSpan / 2.0 + centerY, 			zCoord,
	]);
}

/**
 * Generates texture coordinates that are suitable for use with
 *  a vertex buffer that represents a quad
 *
 * @return {Float32Array} Array of Float-32 values which can be directly
 *                        used to represent texture coordintes
 *                        within a quad vertex buffer
 */
MainToyAbandonmentGameplayScene.prototype.zPlaneQuadTextureCoords = function () {
	return new Float32Array([
		// Upper-left (triangle #1)
		0.0, 0.0,
		// Lower-left (triangle #1)
		0.0, 1.0,
		// Lower-right (triangle #1)		
		1.0, 1.0,
		
		// Lower-right (triangle #2)	
		1.0, 1.0,
		// Upper-right (triangle #2)
		1.0, 0.0,
		// Upper-left (triangle #2)
		0.0, 0.0
	]);
}

/**
 * Returns the expected attribute location specifiers (as required for use with
 *  WebGLRenderingContext.getAttribLocation()) used with all employed shaders
 *
 * @param useTextures {Boolean} Indicates whether or not the associated shader
 *                              is expected to use textures
 *
 * @return {WebGlUtility.AttributeLocationData()} A collection of expected attribute
 *                                                location specifiers
 */
MainToyAbandonmentGameplayScene.prototype.getStandardShaderWebGlAttributeLocations = function(useTextures) {
	var attributeLocationData = new WebGlUtility.AttributeLocationData();
	attributeLocationData.vertexPositionAttributeLocation = "aVertexPosition";
	attributeLocationData.vertexColorAttributeLocation = "aVertexColor";
	attributeLocationData.vertexNormalAttributeLocation = "aVertexNormal";
	attributeLocationData.ambientLightVectorAttributeLocation = "uniform_ambientLightVector";
	
	if (Utility.validateVar(useTextures) && useTextures) {
		attributeLocationData.textureCoordinateAttributeLocation = "aTextureCoord";
	}
	else {
		attributeLocationData.textureCoordinateAttributeLocation = null;		
	}
	
	attributeLocationData.transformationMatrixAttributeLocation = "uniform_transformationMatrix";
	attributeLocationData.projectionMatrixAttributeLocation = "uniform_projectionMatrix";
	
	return attributeLocationData;
}

/**
 * Returns a collection of constants that represent default values
 *  (sizes, etc.) pertaining to the storage of WebGL data, or general
 *  operational values
 *
 * @return {WebGlUtility.AttributeData()} A collection of constants pertaining to the
 *                                        storage of WebGL data/rendering behavior
 */
MainToyAbandonmentGameplayScene.prototype.getDefaultWebGlAttributeData = function() {
	var attributeData = new WebGlUtility.AttributeData();
	
	attributeData.vertexDataSize = this.constVertexSize;
	attributeData.vertexColorSize = this.constVertexColorSize;
	attributeData.vectorSize = this.constVectorSize;
	attributeData.ambientLightVector = this.constAmbientLightVector;
	attributeData.textureCoordinateSize = this.constTextureCoordinateSize;
						
	return attributeData;
}

/**
 * Prepares all procedural and pre-generated geometry data for
 *  use
 *
 * completionFunction {function} Function invoked upon the completion of model data
 *                               preparation
 */
MainToyAbandonmentGameplayScene.prototype.prepareGeometricRenderData = function(completionFunction) {
	this.prepareRenderDataForGaugeOverlay();
	this.prepareRenderDataForFullScreenOverlay();
	this.prepareRenderDataForProgressOverlay();
	this.prepareGeneratedGeometryRenderData();
	this.prepareRenderDataForInputIndicatorOverlays();
	this.prepareModelRenderData(completionFunction);
}

/**
 * Creates WebGL buffers for the full-screen overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainToyAbandonmentGameplayScene.prototype.prepareRenderDataForProgressOverlay = function() {	
	this.progressOverlayWebGlData = this.prepareRenderDataForGeneralOverlay(1.0, 2.0, 0.0, 0.0);
}

/**
 * Generates data required to render representations of
 *  procedurally-generated geometry data (e.g. level
 *  tile quads)
 */
MainToyAbandonmentGameplayScene.prototype.prepareGeneratedGeometryRenderData = function() {
	this.webGlBufferDataLevelTileQuad = WebGlUtility.createWebGlBufferDataFromAggregateVertexData(
		globalResources.getMainCanvasContext(), this.levelTileAggregateVertexData(),
		this.constVertexSize);
		
	this.webGlBufferDataBaseWallCube = WebGlUtility.createWebGlBufferDataFromAggregateVertexData(
		globalResources.getMainCanvasContext(), this.generateWallSectionBaseVertexData(),
		this.constVectorSize);
}

/**
 * Generates data suitable for rendering a texture onto
 *  geometry that represents an overlay.
 * 
 * @param width {number} Length of the quad along the X-axis
 * @param height {number} Length of the quad along the Y-axis
 * @param centerX {number} Center coordinate of the quad along the X-axis
 * @param centerY {number} Center coordinate of the quad along the Y-axis 
 */
MainToyAbandonmentGameplayScene.prototype.prepareRenderDataForGeneralOverlay = function (width, height, centerX, centerY) {	
	var overlayQuadVertices = this.quadCoordArray(width, height, centerX, centerY, -1.0)
	
	var webGlBufferData = new WebGlUtility.WebGlBufferData();
	
	webGlBufferData.objectWebGlVertexBuffer = WebGlUtility.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		overlayQuadVertices);
	webGlBufferData.objectWebGlTexCoordBuffer = WebGlUtility.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.zPlaneQuadTextureCoords());

	webGlBufferData.vertexCount = overlayQuadVertices.length / this.constVertexSize;	
	
	return webGlBufferData;	
}

/**
 * Creates WebGL buffers for the gauge overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainToyAbandonmentGameplayScene.prototype.prepareRenderDataForGaugeOverlay = function() {
	var constGaugeOverlayTopOffsetY = 0.05;
	var constGaugeOverlayHeight = 0.10;
	var constAxisSpanX = 2.0;
	
	this.gaugeOverlayRenderWebGlData = this.prepareRenderDataForGeneralOverlay(constAxisSpanX,
		constGaugeOverlayHeight, 0.0, 1.0 - constGaugeOverlayHeight);
}

/**
 * Creates WebGL buffers for the full-screen overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainToyAbandonmentGameplayScene.prototype.prepareRenderDataForFullScreenOverlay = function() {	
	var constAxisSpanX = 2.0;

	this.fullScreenOverlayWebGlData = this.prepareRenderDataForGeneralOverlay(
		constAxisSpanX, this.constFullScreenOverlayHeight, 0.0, 0.0);
}

/**
 * Generates vertex buffer data employed to render movement direction
 *  indicator overlays
 */
MainToyAbandonmentGameplayScene.prototype.prepareRenderDataForInputIndicatorOverlays = function() {
	var constInputOverlayArrowAxisLength = 0.2;
	var constInputOverlayOppositeAxisWidth = 0.5;
	var constMinAxisValue = -1.0;
	var constMaxAxisValue = 1.0;
	
	this.leftInputIndicatorOverlay = this.prepareRenderDataForGeneralOverlay(constInputOverlayArrowAxisLength,
		constInputOverlayOppositeAxisWidth, constMinAxisValue + constInputOverlayArrowAxisLength / 2.0, 0.0);
	this.rightInputIndicatorOverlay = this.prepareRenderDataForGeneralOverlay(constInputOverlayArrowAxisLength,
		constInputOverlayOppositeAxisWidth, constMaxAxisValue - constInputOverlayArrowAxisLength / 2.0, 0.0 );
	this.upInputIndicatorOverlay = this.prepareRenderDataForGeneralOverlay(constInputOverlayOppositeAxisWidth,
		constInputOverlayArrowAxisLength, 0.0, constMaxAxisValue - constInputOverlayArrowAxisLength / 2.0);
	this.downInputIndicatorOverlay = this.prepareRenderDataForGeneralOverlay(constInputOverlayOppositeAxisWidth,
		constInputOverlayArrowAxisLength, 0.0, constMinAxisValue + constInputOverlayArrowAxisLength / 2.0);
}

/**
 * Generates vertex buffer data employed to render the geometry
 *  for a single level tile
 *
 * @return {AggregateWebGlVertexData} Object which contains WebGL vertex
 *                                    data that can be directly buffered by
 *                                    WebGL
 */
MainToyAbandonmentGameplayScene.prototype.levelTileAggregateVertexData = function() {
	var tileWidth = this.worldSpaceLengthToRenderSpaceLength(this.constTileWidthWorldUnits);
	var tileHeight = this.worldSpaceLengthToRenderSpaceLength(this.constTileHeightWorldUnits);

	var quadTriangles = this.zPlaneQuadTriangles(tileWidth, tileHeight, 0.0, 0.0, 0.0)
	var tileWebGlVertexData = new WebGlUtility.generateAggregateVertexDataFromTriangleList(
		quadTriangles);
	
	return tileWebGlVertexData;
}

/**
 * Generates a basic segment that is employed to generate wall geometry (cube)
 *
 * @return {AggregateWebGlVertexData} Object which contains WebGL vertex
 *                                    data that can be directly buffered by
 *                                    WebGL
 */
MainToyAbandonmentGameplayScene.prototype.generateWallSectionBaseVertexData = function () {
	var cubeGenerator =
		new TessellatedBoxGenerator(this.constWorldScale, this.constWorldScale, this.constWorldScale, new Point3d(0.0, 0.0, 0.0));
		
	cubeGenerator.generateGeometry();
	var wallCubeVertexData = WebGlUtility.generateAggregateVertexDataFromTriangleList(cubeGenerator.getTriangleList());
	
	return wallCubeVertexData;
}

/**
 * Decodes render model data, encoded in OBJ model format, and applies an
 *  required pre-processing in preparation for use
 *
 * @param modelKey {String} Key used to access the model data which exists
 *                          in the resource key-value store.
 *
 */
MainToyAbandonmentGameplayScene.prototype.prepareModelRenderDataFromKeyedObjBuffer = function (modelKey) {
	if (Utility.validateVar(modelKey)) {
		vertexDefProcessorBoundsNormalizer = new ObjFormatBufferParserUtility.ObjVertexDefProcessorObjectBoundsNormalizer()
		vertexDefProcessorBoundsNormalizer.unitScalingFactor = this.constModelInitializationScaleFactors[modelKey];
		var objBufferSource = globalResources.getLoadedResourceDataByKey(modelKey);
		var modelVertexData = ObjFormatBufferParserUtility.generateModelVertexDataFromObjBuffer(objBufferSource.resourceDataStore,
			vertexDefProcessorBoundsNormalizer, null, null);
		this.modelRefDimensionKeyValStore[modelKey] = this.modelDimensionsFromModelVertexData(modelVertexData);

		this.webGlBufferDataKeyValStore[modelKey] = 
			WebGlUtility.createWebGlBufferDataFromAggregateVertexData(globalResources.getMainCanvasContext(),
			modelVertexData.aggregateVertexData, this.constVertexSize);						
	}
}

/**
 * Renders a visual representation of a provided operation progress
 *  fraction value
 *
 * @param progressFraction {Number} Number representing an
 *                                  approximate progress fraction (0.0 - 1.0,
 *                                  inclusive)
 *
 * @see MainToyAbandonmentGameplayScene.prepareModelRenderData
 */
MainToyAbandonmentGameplayScene.prototype.renderModelPreparationProgressIndicatorImmediate = function (progressFraction) {
	if (Utility.validateVar(progressFraction)) {
		var overlayTexture = globalResources.textureKeyValueStore[globalResources.keyTextureHourglass];
		var textureSize = globalResources.textureSizeKeyValueStore[globalResources.keyTextureHourglass];
		
		// The "horizontal blur convergence" applies a blur, evaluated
		// horitonally for each texel, that decreases in span s the progress
		// fraction approaches one (at which point the source image/
		// texture will appear in its unaltered form).
		var colorSplitProgressRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(	
			this.progressOverlayWebGlData, this.shaderHorizBlurConverge);
		
		var canvasContext = globalResources.getMainCanvasContext();
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();	

		function horizontalBlurConvergeUniformSetup(shaderProgram) {			
			var textureOffsetUniformLocation = canvasContext.getUniformLocation(shaderProgram, "splitFraction");
			canvasContext.uniform1f(textureOffsetUniformLocation, progressFraction);

			var imageWidthUniformLocation = canvasContext.getUniformLocation(shaderProgram, "imageWidth");
			canvasContext.uniform1f(imageWidthUniformLocation, textureSize[0]);
		}
		
		canvasContext.clear(canvasContext.COLOR_BUFFER_BIT);
		WebGlUtility.renderGeometry(colorSplitProgressRenderWebGlData, transformationMatrix, this.identityMatrixStore,
			overlayTexture, canvasContext, webGlAttributeLocationData, webGlAttributeData, horizontalBlurConvergeUniformSetup);
		canvasContext.finish();
	}
}

/**
 * Decodes model data in preparation for rendering, applying any required
 *  post-processing, as necessary; reports progress visually during the
 *  preparation process. 
 *
 * completionFunction {function} Function invoked upon the completion of model data
 *                               preparation
 */
MainToyAbandonmentGameplayScene.prototype.prepareModelRenderData = function (completionFunction) {
	var modelKeys = this.getAllModelKeys();
	
	this.renderModelPreparationProgressIndicatorImmediate(0);
	
	if (modelKeys.length > 0) {
		var preparedModelCount = 0;
		
		
		for (var currentModelKey of modelKeys) {
				
			var sceneInstance = this;				
			function scheduleModelPreparation(targetModelKey) {
				
				function prepareModel () {
					sceneInstance.prepareModelRenderDataFromKeyedObjBuffer(targetModelKey);
					preparedModelCount++;
					sceneInstance.renderModelPreparationProgressIndicatorImmediate(preparedModelCount / modelKeys.length);
					
					if (preparedModelCount === modelKeys.length) {					
						setTimeout(completionFunction, 0);
					}
				}				
				setTimeout(prepareModel, 0);
			}
			
			scheduleModelPreparation(currentModelKey);
		}
		
	}
}

/**
 * Returns the specific collection of keys that are used
 *  to reference model geometry which represents the
 *  teddy bear protagonist within the model key-value store
 *
 * @return {Array} A collection of teddy bear protagonist keys
 */
MainToyAbandonmentGameplayScene.prototype.getAllTeddyProtagonistComponentKeys = function() {
	var teddyProtagonistComponentKeys =
		[
			globalResources.keyModelTeddyProtagonistHead,
			globalResources.keyModelTeddyProtagonistTorso,
			globalResources.keyModelTeddyProtagonistLeftArm,
			globalResources.keyModelTeddyProtagonistRightArm,
			globalResources.keyModelTeddyProtagonistLeftLeg,
			globalResources.keyModelTeddyProtagonistRightLeg,
		]
		
	return teddyProtagonistComponentKeys;
}

/**
 * Retrieves an array of unique keys that are used to reference enemy
 *  state/rendering data
 *
 * @return {Array} Array of unique string keys
 */
MainToyAbandonmentGameplayScene.prototype.getAllEnemyKeys = function () {
	return [
		globalResources.keyModelEnemyCoronaVirusMonster,
		globalResources.keyModelEnemyGrinch,
		globalResources.keyModelEnemySnowman,
		globalResources.keyModelEnemyEvilChristmasTree,
	];
}

/**
 * Retrieves an array of unique keys that are used to reference goal
 *  object state/rendering data
 *
 * @return {Array} Array of unique string keys
 */
MainToyAbandonmentGameplayScene.prototype.getAllGoalObjectKeys = function () {
	return [
		globalResources.keyModelStar,
	];
}

/**
 * Retrieves an array of unique keys that are used to reference dynamic
 *  object state/rendering data (goal objects and enemy objects)
 *
 * @return {Array} Array of unique string keys
 *
 * @see MainToyAbandonmentGameplayScene.getAllEnemyKeys
 * @see MainToyAbandonmentGameplayScene.getAllGoalObjectKeys 
 */
MainToyAbandonmentGameplayScene.prototype.getAllDynamicObjectKeys = function () {
	var enemyKeys = this.getAllEnemyKeys();	
	var inertObjectKeys = this.getAllGoalObjectKeys();
	
	return inertObjectKeys.concat(enemyKeys);
}

/**
 * Returns all keys that are used to access models within
 *  the key-value store
 *
 * @return {Array} A collection of teddy bear protagonist keys
 */
MainToyAbandonmentGameplayScene.prototype.getAllModelKeys = function () {
	var dynamicObjectKeys = this.getAllDynamicObjectKeys();
	var teddyProtagonistKeys = this.getAllTeddyProtagonistComponentKeys();
	
	var allModelKeys = teddyProtagonistKeys.concat(dynamicObjectKeys);
	
	return allModelKeys;
}

/**
 * Generates a matrix that is targerted to the application of
 *  limb transformation for the Teddy protagonist.
 *
 * @param pivotOriginDisplacementFractions {Vector3d} Displacement of the origin-centered model
 *                                                    to be applied before the transformation
 * @param pivotAxis {Number} Pivot axis designator for X/Y/Z axes
 * @param attachmentDisplacementFractions {Vector3d} Displacement applied to the limb after
 *                                                   transformation, in order to
 *                                                   reconstitute the full Teddy protagonist
 *                                                   body
 * @param modelKey {String} Key used to uniquely represent the limb
 *
 * @return {MathExt.Matrix} The generated rotation matrix upon success
 *
 * @see MainToyAbandonmentGameplayScene.modelPosePivotAngleEvaluatorKeyValStore
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisX
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisY
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisZ
 */
MainToyAbandonmentGameplayScene.prototype.generateLimbMatrix = function (pivotOriginDisplacementFractions,
	pivotAxis, attachmentDisplacementFractions, modelKey) {
		
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
		
	if (Utility.validateVarAgainstType(pivotOriginDisplacementFractions, Vector3d) && 
		Utility.validateVarAgainstType(attachmentDisplacementFractions, Vector3d)) {
					
		var translationMatrix = MathUtility.generateTranslationMatrix3d(
			this.modelRefDimensionKeyValStore[modelKey].dimensionX * pivotOriginDisplacementFractions.xComponent,
			this.modelRefDimensionKeyValStore[modelKey].dimensionY * pivotOriginDisplacementFractions.yComponent,
			this.modelRefDimensionKeyValStore[modelKey].dimensionZ * pivotOriginDisplacementFractions.zComponent);
		var rotationMatrix = this.rotationMatrixForPivotAxis(pivotAxis, modelKey);
		var attachmentTranslationMatrix = MathUtility.generateTranslationMatrix3d(
			this.modelRefDimensionKeyValStore[globalResources.keyModelTeddyProtagonistTorso].dimensionX * attachmentDisplacementFractions.xComponent,
			this.modelRefDimensionKeyValStore[globalResources.keyModelTeddyProtagonistTorso].dimensionY * attachmentDisplacementFractions.yComponent,
			this.modelRefDimensionKeyValStore[globalResources.keyModelTeddyProtagonistTorso].dimensionZ * attachmentDisplacementFractions.zComponent);
		transformationMatrix = attachmentTranslationMatrix.multiply(rotationMatrix.multiply(translationMatrix));			
	}
	
	return transformationMatrix;
}

/**
 * Generates a rotation matrix on a specified axis, using a rotation
 *  value generated by a time-based evaluator
 *
 * @param pivotAxis {Number} The axis about which the rotation will be performed
 * @param evaluator {LinearCurve/SineCurve} Time-based curve evaluator used to compute the
 *                  						rotation angle
 *
 * @return {MathExt.Matrix} The generated rotation matrix upon success
 *
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisX
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisY
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisZ
 */
MainToyAbandonmentGameplayScene.prototype.rotationMatrixForPivotAxisWithEvaluator = function (pivotAxis, evaluator) {
	var rotationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	rotationMatrix.setToIdentity();
	
	if (Utility.validateVar(pivotAxis) && Utility.validateVar(evaluator)) {
		var pivotRadAngle = evaluator.evaluateWithTime(this.currentAnimationRunningTime());
	
		switch (pivotAxis) {
			case this.constModelPivotAxisX:
				rotationMatrix = MathUtility.generateRotationMatrix3dAxisX(Utility.returnValidNumOrZero(pivotRadAngle));
				break;
			case this.constModelPivotAxisY:
				rotationMatrix = MathUtility.generateRotationMatrix3dAxisY(Utility.returnValidNumOrZero(pivotRadAngle));
				break;
			case this.constModelPivotAxisZ:
				rotationMatrix = MathUtility.generateRotationMatrix3dAxisZ(Utility.returnValidNumOrZero(pivotRadAngle));
				break;
			default:
				break;
		}
	}
	
	return rotationMatrix;
}

/**
 * Generates a rotation matrix on a specified axis for a particular
 *  model, using a pre-determined, internally-stored time-based
 *  evaluator to produce the rotation angle
 *
 * @param pivotAxis {number} Axis designator which indicates the axis on
 *                           which the pivot will occur
 * @param modelKey {String} Key that uniquely identifies the target
 *                          model
 *
 * @see MainToyAbandonmentGameplayScene.modelPosePivotAngleEvaluatorKeyValStore
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisX
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisY
 * @see MainToyAbandonmentGameplayScene.constModelPivotAxisZ
 */
MainToyAbandonmentGameplayScene.prototype.rotationMatrixForPivotAxis = function (pivotAxis, modelKey) {
	var rotationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	rotationMatrix.setToIdentity();
	
	if (Utility.validateVar(pivotAxis) && Utility.validateVar(modelKey)) {
		var pivotAngleEvaluator = this.modelPosePivotAngleEvaluatorKeyValStore[modelKey];
		
		if (Utility.validateVar(pivotAngleEvaluator)) {
			rotationMatrix = this.rotationMatrixForPivotAxisWithEvaluator(pivotAxis, pivotAngleEvaluator);
		}
	}
	
	return rotationMatrix;
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for the Teddy protagonist torso (excludes positional
 *  translation)
 *
 * @return {MathExt.Matrix} The Teddy protagonist torso matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistTorsoMatrix = function () {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();	

	return transformationMatrix
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for a Teddy protagonist arm (excludes positional
 *  translation)
 *
 * @param multiplierAxisX {Number} Multiplier used to alter the
 *                                 translation applied to the model
 *                                 (used to translate left/right arms
 *                                 appropriately)
 *
 * @param modelKey {String} Key that uniquely identifies the model
 *                          (left or right arm)
 *
 * @return {MathExt.Matrix} A Teddy protagonist arm matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistArmMatrix = function (multiplierAxisX, modelKey) {
	var transformationMatrix = this.generateLimbMatrix(new Vector3d(0.5 * multiplierAxisX, -0.26, 0.33),
		this.constModelPivotAxisX,
		new Vector3d(0.40 * multiplierAxisX, 0.04, -0.31),
		modelKey);
	
	return transformationMatrix;	
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for the Teddy protagonist left arm (excludes positional
 *  translation)
 *
 * @return {MathExt.Matrix} The Teddy protagonist left arm matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistLeftArmMatrix = function () {
	return this.generateTeddyProtagonistArmMatrix(1.0, globalResources.keyModelTeddyProtagonistLeftArm);
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for the Teddy protagonist right arm (excludes positional
 *  translation)
 *
 * @return {MathExt.Matrix} The Teddy protagonist right arm matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistRightArmMatrix = function () {
	return this.generateTeddyProtagonistArmMatrix(-1.0, globalResources.keyModelTeddyProtagonistRightArm);
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for a Teddy protagonist leg (excludes positional
 *  translation)
 *
 * @param multiplierAxisX {Number} Multiplier used to alter the
 *                                 translation applied to the model
 *                                 (used to translate left/right legs
 *                                 appropriately)
 *
 * @param modelKey {String} Key that uniquely identifies the model
 *                          (left or right leg)
 *
 * @return {MathExt.Matrix} A Teddy protagonist leg matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistLegMatrix = function (multiplierAxisX, modelKey) {
	var transformationMatrix = this.generateLimbMatrix(new Vector3d(0.10 * multiplierAxisX, -0.10, 0.22),
		this.constModelPivotAxisX,
		new Vector3d(0.27 * multiplierAxisX, 0.0, 0.36),
		modelKey);
			
	return transformationMatrix;
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for the Teddy protagonist left leg (excludes positional
 *  translation)
 *
 * @return {MathExt.Matrix} The Teddy protagonist left leg matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistLeftLegMatrix = function () {
	return this.generateTeddyProtagonistLegMatrix(1.0, globalResources.keyModelTeddyProtagonistLeftLeg);
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for the Teddy protagonist right leg (excludes positional
 *  translation)
 *
 * @return {MathExt.Matrix} The Teddy protagonist right leg matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistRightLegMatrix = function () {
	return this.generateTeddyProtagonistLegMatrix(-1.0, globalResources.keyModelTeddyProtagonistRightLeg);	
}

/**
 * Generates the immediate, animation-context sensitive transformation
 *  matrix for the Teddy protagonist head (excludes positional
 *  translation)
 *
 * @return {MathExt.Matrix} The Teddy protagonist head matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistHeadMatrix = function () {
	var transformationMatrix = this.generateLimbMatrix(new Vector3d(0.0, 0.0, -0.5),
		!this.isInGameOverState() ? this.constModelPivotAxisY : this.constModelPivotAxisX,
		new Vector3d(0.0, 0.0, -0.485),
		globalResources.keyModelTeddyProtagonistHead);
		
	return transformationMatrix;
}

/**
 * Builds pre-determined matrices that are required to properly orient
 *  models, as necessary
 */
MainToyAbandonmentGameplayScene.prototype.generateDynamicElementPredeterminedMatrices = function () {
	var dynamicElementKeys = this.getAllDynamicObjectKeys();

	for (currentDynamicElementKey of dynamicElementKeys) {
		var transformationMatrix = null;
		switch (currentDynamicElementKey) {
			case globalResources.keyModelEnemyGrinch:
				var rotationAngleAxisX = Math.PI / 2.0;
				this.modelMatrixKeyValStore[currentDynamicElementKey] = MathUtility.generateRotationMatrix3dAxisX(rotationAngleAxisX);
				break;
			case globalResources.keyModelEnemyCoronaVirusMonster:
				var rotationAngleAxisX = Math.PI / 2.0;
				this.modelMatrixKeyValStore[currentDynamicElementKey] = MathUtility.generateRotationMatrix3dAxisX(rotationAngleAxisX);
				break;
			case globalResources.keyModelEnemySnowman:
				var rotationAngleAxisX = Math.PI / 2.0;
				var rotationAngleAxisY = Math.PI / 2.0;
				
				var xAxisRotation = MathUtility.generateRotationMatrix3dAxisX(rotationAngleAxisX);
				var yAxisRotation = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);
				
				this.modelMatrixKeyValStore[currentDynamicElementKey] = xAxisRotation.multiply(yAxisRotation);
				break;
			case globalResources.keyModelEnemyEvilChristmasTree:
				var rotationAngleAxisZ = Math.PI;
				this.modelMatrixKeyValStore[currentDynamicElementKey] = MathUtility.generateRotationMatrix3dAxisZ(rotationAngleAxisZ);
				break;
			case globalResources.keyModelStar:
				var rotationAngleAxisY = Math.PI;
				this.modelMatrixKeyValStore[currentDynamicElementKey] = MathUtility.generateRotationMatrix3dAxisY(rotationAngleAxisY);
				break;
			default:
				break;
		}
		
		if (transformationMatrix !== null) {
			this.modelMatrixKeyValStore[currentDynamicElementKey] = transformationMatrix;
		}
	}
}

/**
 * Determines the approximate, pre-determined, render-space Z-plane bounding
 *  rectangle for a dynamic element.
 *
 * @param dynamicElement {DynamicItemInstanceData} Data which defines instance-specific
 *                                                 attributes of a dynamic element
 *                                                 (position, etc.)
 *
 * @return Rectangle Z-plane bounding rectangle for the dynamic
 *         element
 */
MainToyAbandonmentGameplayScene.prototype.determineDynamicElementBoundingRectangle = function (dynamicElement) {
	var boundingRect = null;
	var renderSpaceDimensionX = 0.0;
	var renderSpaceDimensionY = 0.0;

	switch (dynamicElement.modelDataKey) {
		case globalResources.keyModelEnemySnowman:
			var boxDimension = Math.min(
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX,
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionZ);
			renderSpaceDimensionX = boxDimension * 1.25;
			renderSpaceDimensionY = boxDimension * 1.25;
			break;
		case globalResources.keyModelEnemyEvilChristmasTree:
			var boxDimension = Math.min(
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX,
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY);
			renderSpaceDimensionX = boxDimension * 1.25;
			renderSpaceDimensionY = boxDimension * 1.25;
			break;
		default:
			var boxDimension = Math.max(
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionX,
				this.modelRefDimensionKeyValStore[dynamicElement.modelDataKey].dimensionY);
			renderSpaceDimensionX = boxDimension;
			renderSpaceDimensionY = boxDimension;
			break;
	}

	boundingRect = new Rectangle(
		this.worldSpaceLengthToRenderSpaceLength(dynamicElement.modelWorldSpacePosition.xCoord) - renderSpaceDimensionX / 2.0,
		this.worldSpaceLengthToRenderSpaceLength(dynamicElement.modelWorldSpacePosition.yCoord) + renderSpaceDimensionY / 2.0,
		renderSpaceDimensionX,
		renderSpaceDimensionY
	);

	return boundingRect;
}

/**
 * Updates computed, internally-stored matrices used to
 *  appropriately transform constituent parts of the
 *  Teddy protagonist.
 */
MainToyAbandonmentGameplayScene.prototype.updateTeddyProtagonistComponentMatrices = function () {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();

	this.modelMatrixKeyValStore[globalResources.keyModelTeddyProtagonistHead] = this.generateTeddyProtagonistHeadMatrix();
	this.modelMatrixKeyValStore[globalResources.keyModelTeddyProtagonistTorso] = this.generateTeddyProtagonistTorsoMatrix();
	this.modelMatrixKeyValStore[globalResources.keyModelTeddyProtagonistLeftArm] = this.generateTeddyProtagonistLeftArmMatrix();
	this.modelMatrixKeyValStore[globalResources.keyModelTeddyProtagonistRightArm] = this.generateTeddyProtagonistRightArmMatrix();
	this.modelMatrixKeyValStore[globalResources.keyModelTeddyProtagonistLeftLeg] = this.generateTeddyProtagonistLeftLegMatrix();
	this.modelMatrixKeyValStore[globalResources.keyModelTeddyProtagonistRightLeg] = this.generateTeddyProtagonistRightLegMatrix();
}

/**
 * Updates internally-stored attributes related to the immediate Teddy
 *  protagonist position (world-space position, velocity, acceleration)
 *
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.updateTeddyProtagonistPositionalAttributes = function (timeQuantum) {
	// Apply the appropriate alterations to the instantaneous position/velocity
	// regarding any determined, impending wall collisions.
	var wallCollisionInfoCollection = this.evaluateTeddyProtagonistWallCollisions(timeQuantum);

	var soonestWallCollisionAxisX = (wallCollisionInfoCollection !== null) ?
		this.findSoonestWallCollision(timeQuantum, this.xAxisWallCollisions(wallCollisionInfoCollection)) : null;
	var soonestWallCollisionAxisY = (wallCollisionInfoCollection !== null) ?
		this.findSoonestWallCollision(timeQuantum, this.yAxisWallCollisions(wallCollisionInfoCollection)) : null;

	if ((soonestWallCollisionAxisX !== null) || (soonestWallCollisionAxisY != null)) {
		this.alterTeddyProtagonistVelocityWithCollsionInfo(soonestWallCollisionAxisX, soonestWallCollisionAxisY);
	}

	this.updateTeddyProtagonistPosition(timeQuantum, soonestWallCollisionAxisX, soonestWallCollisionAxisY);
	this.updateTeddyProtagonistVelocity(timeQuantum, this.currentTeddyProtagonistMaxAmbulationVelocity, soonestWallCollisionAxisX, soonestWallCollisionAxisY);
}

/**
 * Generates the final matrix required to properly position the
 *  composite Teddy protagonist model on-screen
 *
 * @return {MathExt.Matrix} The Teddy protagonist final positioning matrix
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistCompositeFinalPositioningMatrix = function () {
	var finalPositioningMatrix = null;
	
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();	
	var rotationMatrix = transformationMatrix;
	
	var renderSpacePosition = this.worldSpacePositionToTranslatedRenderSpacePosition(
		this.currentWorldSpacePositionInLevel.xCoord,
		this.currentWorldSpacePositionInLevel.yCoord,
		this.currentWorldSpacePositionInLevel.zCoord);
		
	var renderSpaceTranslationMatrix = MathUtility.generateTranslationMatrix3d(
		renderSpacePosition.xCoord, renderSpacePosition.yCoord, renderSpacePosition.zCoord);
		
	var compositeTransformationMatrix = renderSpaceTranslationMatrix.multiply(rotationMatrix);
	
	finalPositioningMatrix = compositeTransformationMatrix;
	
	return finalPositioningMatrix;
}

/**
 * Determines if a goal item (level progression marker)
 *  is roughly coincident with the immediate Teddy protagonist
 *  position, and updates the game state accordingly
 */
MainToyAbandonmentGameplayScene.prototype.evaluateTeddyProtagonistGoalAreaCollisions = function() {
	var goalEncountered = false;
	
	var currentGoalIndex = 0;
	
	while ((currentGoalIndex < this.goalMarkerInstanceDataCollection.length) && !goalEncountered) {
		var goalBoundingRect = this.determineDynamicElementBoundingRectangle(
			this.goalMarkerInstanceDataCollection[currentGoalIndex]);
		
		var renderSpacePositionInLevel = this.worldSpacePositionToRenderSpacePosition(
			this.currentWorldSpacePositionInLevel.xCoord,
			this.currentWorldSpacePositionInLevel.yCoord,
			this.currentWorldSpacePositionInLevel.zCoord);
			
		goalEncountered = (goalBoundingRect.left <= renderSpacePositionInLevel.xCoord) &&
			((goalBoundingRect.left + goalBoundingRect.width) >= renderSpacePositionInLevel.xCoord) &&
			(goalBoundingRect.top >= renderSpacePositionInLevel.yCoord) &&
			((goalBoundingRect.top - goalBoundingRect.height) <= renderSpacePositionInLevel.yCoord);
		
		currentGoalIndex++;
	}
	
	if (goalEncountered) {
		this.setOperationState(this.constOperationStateInterLevelPause);
	}
}

/**
 * Attempts to evaluate any surface contact damage that may
 *  result from the teddy protagonist being in contact with
 *  damage-inducing surface tiles
 */
MainToyAbandonmentGameplayScene.prototype.evaluateTeddyProtagonistTileContactDamage = function () {
	
	var tileAttributes = this.tileAttributesAtWorldSpacePosition(this.currentWorldSpacePositionInLevel, 0, 0);
	if (Utility.validateVar(tileAttributes) && (typeof tileAttributes.contactDamage === "number")) {
		this.registerTeddyProtagonistDamage(tileAttributes.contactDamage);
	}
}

/**
 * Determines if the immediate Teddy protagonist approximate bounding region
 *  is coincident with that of an enemy, applying the appropriate damage
 *  values as necessary
 */
MainToyAbandonmentGameplayScene.prototype.evaluateTeddyProtagonistEnemyContactDamage = function () {
	var currentEnemyIndex = 0;
	var enemyDataWithIntersectingBounds = null;
	
	while ((currentEnemyIndex < this.enemyInstanceDataCollection.length) &&
		(enemyDataWithIntersectingBounds === null)){

		var teddyProtagonistBoundingRect = this.teddyProtagonistGroundPlaneBoundingRect();		
		var enemyBoundingRect = this.determineDynamicElementBoundingRectangle(
			this.enemyInstanceDataCollection[currentEnemyIndex]);

		if (teddyProtagonistBoundingRect.intersectsRect(enemyBoundingRect)) {
			enemyDataWithIntersectingBounds = this.enemyInstanceDataCollection[currentEnemyIndex];
		}

		currentEnemyIndex++;
	}
	
	if ((enemyDataWithIntersectingBounds !== null) && (enemyDataWithIntersectingBounds.contactDamage > 0.0)) {
		this.registerTeddyProtagonistDamage(enemyDataWithIntersectingBounds.contactDamage);		
	}
}

/**
 * Applies a periodic, pre-determined health decrease to the Teddy
 *  protagonist
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.applyTimeBasedTeddyProtagonistHealthDecrease = function (timeQuantum) {
	if (this.teddyProtagonistCurrentHealth > 0.0) {
		this.teddyProtagonistCurrentHealth -=
			(this.constTeddyProtagonistHealthDecreaseRatePerMs * timeQuantum / this.currentDurationMultiplier());
	}
	
	if (this.teddyProtagonistCurrentHealth <= 0.0) {
		this.teddyProtagonistCurrentHealth = 0.0;
	}
}

/**
 * Applies a specified scalar damage value to the teddy bear protagonist,
 *  as necessary
 */
MainToyAbandonmentGameplayScene.prototype.registerTeddyProtagonistDamage = function (damageValue) {
	if ((Utility.returnValidNumOrZero(damageValue) > 0.0) &&
		!this.teddyProtagonistIsInvulnerable) {
	
		if (!this.isDamageReceptionEventActive()) {
			this.teddyProtagonistCurrentHealth -= damageValue;
						
			this.setTeddyProtagonistAnimationType(this.constTeddyProtagonistAnimationTypeDamageReception);

			this.invokeTeddyProtagonistPostDamageInvulnerabilityPeriod();
		}
	}
}

/**
 * Invokes a period of invulnerability, of a pre-determined duration, to
 *  the Teddy Protagonist (specifically intended to be applied after
 *  a damage reception event)
 *
 * @see MainToyAbandonmentGameplayScene.constDamageReceptionAnimationDurationMs
 */
MainToyAbandonmentGameplayScene.prototype.invokeTeddyProtagonistPostDamageInvulnerabilityPeriod = function () {
	this.teddyProtagonistIsInvulnerable = true;
	
	var sceneInstance = this;
	this.activeTimers.push(new ExternalSourceTimer(
		this.constDamageReceptionAnimationDurationMs,
		function () {
			sceneInstance.teddyProtagonistIsInvulnerable = false;
		}, this.constTimerIdDamageReceptionEvent, null)				
	);	
}

/**
 * Invokes a period of invulnerability, of a pre-determined duration, to
 *  the Teddy Protagonist (general invulnerability)
 *
 * @see MainToyAbandonmentGameplayScene.constGeneralInvulnerabilityDurationMs
 */
MainToyAbandonmentGameplayScene.prototype.invokeTeddyProtagonistGeneralInvulnerabilityPeriod = function () {
	this.teddyProtagonistIsInvulnerable = true;
	
	var sceneInstance = this;
	this.activeTimers.push(new ExternalSourceTimer(
		this.constGeneralInvulnerabilityDurationMs,
		function () {
			sceneInstance.teddyProtagonistIsInvulnerable = false;
		}, this.constTimerIdGeneralInvulnerabilityEvent, null)				
	);	
}


/**
 * Provides a color value for the Teddy protagonist guide light
 *
 * @return {RgbColor} Teddy protagnoist guide light color
 */
MainToyAbandonmentGameplayScene.prototype.teddyProtagonistGuideLightColor = function() {
	return this.guideLightColor;
}

/**
 * Determines the opacity for the input direction indicator overlay
 *
 * @param unitInputMagnitude {Number} Unit input value directly
 *                                    associated with an input
 *                                    device abstraction
 */
MainToyAbandonmentGameplayScene.prototype.indicatorAlphaFromInputMagnitude = function(unitInputMagnitude) {
	return Utility.returnValidNumOrZero(unitInputMagnitude) / 3.5;
}

/**
 * Initializes game input bindings
 */
MainToyAbandonmentGameplayScene.prototype.setupInputEventHandler = function () {
	// Bind the keyboard input events...		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowUp,	
		this, this.handleInputForTeddyProtagonistMovementUp);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowDown,	
		this, this.handleInputForTeddyProtagonistMovementDown);

	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowLeft,	
		this, this.handleInputForTeddyProtagonistMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowRight,	
		this, this.handleInputForTeddyProtagonistMovementRight);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierSpace,	
		this, this.handleInputForLevelRetry);

	// Bind the touch movement input events...		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierUp,	
		this, this.handleTouchInputForTeddyProtagonistMovementUp);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierDown,	
		this, this.handleTouchInputForTeddyProtagonistMovementDown);

	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierLeft,	
		this, this.handleTouchInputForTeddyProtagonistMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputMoveSpecifierRight,	
		this, this.handleTouchInputForTeddyProtagonistMovementRight);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.touchInputEventReceiver,
		this.touchInputEventReceiver.constTouchInputSpecifier,
		this, this.handleInputForLevelRetry);
}

/**
 * Input handler for the input message(s) which represent the
 *  "move up" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleTouchInputForTeddyProtagonistMovementUp = function (scalarInputEvent) {
	this.upIndicatorOverlayAlpha = this.indicatorAlphaFromInputMagnitude(scalarInputEvent.inputUnitMagnitude);
	this.handleInputForTeddyProtagonistMovementUp(scalarInputEvent);
}

/**
 * Input handler for the input message(s) which represent the
 *  "move down" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleTouchInputForTeddyProtagonistMovementDown = function (scalarInputEvent) {
	this.downIndicatorOverlayAlpha = this.indicatorAlphaFromInputMagnitude(scalarInputEvent.inputUnitMagnitude);
	this.handleInputForTeddyProtagonistMovementDown(scalarInputEvent);	
}

/**
 * Input handler for the input message(s) which represent the
 *  "move left" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleTouchInputForTeddyProtagonistMovementLeft = function (scalarInputEvent) {
	this.leftIndicatorOverlayAlpha = this.indicatorAlphaFromInputMagnitude(scalarInputEvent.inputUnitMagnitude);
	this.handleInputForTeddyProtagonistMovementLeft(scalarInputEvent);
}

/**
 * Input handler for the input message(s) which represent the
 *  "move right" action (touch device)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleTouchInputForTeddyProtagonistMovementRight = function (scalarInputEvent) {
	this.rightIndicatorOverlayAlpha = this.indicatorAlphaFromInputMagnitude(scalarInputEvent.inputUnitMagnitude);
	this.handleInputForTeddyProtagonistMovementRight(scalarInputEvent);
}


/**
 * Input handler for the input message(s) which represent the
 *  "move up" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleInputForTeddyProtagonistMovementUp = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.isInActiveOperationState()) {	
		this.currentTeddyProtagonistUnitAccelerationAxisY = Math.pow(scalarInputEvent.inputUnitMagnitude,
		this.constDeviceAccelResultExpoFactor);
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move down" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleInputForTeddyProtagonistMovementDown = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.isInActiveOperationState()) {	
		this.currentTeddyProtagonistUnitAccelerationAxisY = -Math.pow(scalarInputEvent.inputUnitMagnitude,
		this.constDeviceAccelResultExpoFactor);
	}	
}

/**
 * Input handler for the input message(s) which represent the
 *  "move left" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleInputForTeddyProtagonistMovementLeft = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.isInActiveOperationState()) {	
		this.currentTeddyProtagonistUnitAccelerationAxisX = -Math.pow(scalarInputEvent.inputUnitMagnitude,
		this.constDeviceAccelResultExpoFactor);
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move right" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleInputForTeddyProtagonistMovementRight = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) && this.isInActiveOperationState()) {	
		this.currentTeddyProtagonistUnitAccelerationAxisX = Math.pow(scalarInputEvent.inputUnitMagnitude,
		this.constDeviceAccelResultExpoFactor);
	}	
}

/**
 * Input handler for input message(s) which are intended
 *  to invoke a level restart (after a level progression
 *  termination event)
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainToyAbandonmentGameplayScene.prototype.handleInputForLevelRetry = function (scalarInputEvent) {
	if (Utility.validateVarAgainstType(scalarInputEvent, ScalarInputEvent) &&
		(scalarInputEvent.inputUnitMagnitude > 0.0)) {
			
		if (this.isInGameOverState()) {
			this.setupNewLevelState(this.currentLevelIndex);	
		}
		else if (this.isInGameCompletionState()) {
			this.setupNewLevelState(0);
		}
	}
}

/**
 * Retrieves the multiplier, associated with the immediate level,
 *  which dictates the rate at which the Teddy protagonist health
 *  decreases
 *
 * @return {Number} Duration multiplier, which is inversely
 *                  proportional to the rate at which the
 *                  health of the Teddy protagonist health
 */
MainToyAbandonmentGameplayScene.prototype.currentDurationMultiplier = function () {
	var durationMultiplier = 1.0;
	
	var retrievedMultiplier = Utility.returnValidNumOrZero(this.currentLevelRepresentation.timeDurationMultiplier);
	if (retrievedMultiplier > 0.0) {
		durationMultiplier = retrievedMultiplier;		
	}
	
	return durationMultiplier
}

/**
 * Configures all gameplay factors that are associated with the
 *  initiation of properly-functioning initial-state level
 *  environment.
 *
 * @param levelIndex {Number} Index of the level that is to be initialized
 *                            to an initial-state status
 */
MainToyAbandonmentGameplayScene.prototype.setupNewLevelState = function (levelIndex) {
	this.currentWorldSpacePositionInLevel = new Point3d(0.0, 0.0, this.constTeddyProtagonistRenderSpaceOffsetAxisZ);
	this.currentLevelIndex = Utility.returnValidNumOrZero(levelIndex);	
	
	this.teddyProtagonistCurrentHealth = this.constTeddyProtagonistMaxHealth;

	// The Teddy protagonist is initially invulnerable upon starting
	// a level.
	this.invokeTeddyProtagonistGeneralInvulnerabilityPeriod();
	
	this.currentTeddyProtagonistVelocity = new Vector3d(0.0, 0.0, 0.0);
	this.currentTeddyProtagonistUnitAccelerationAxisX = 0.0;
	this.currentTeddyProtagonistUnitAccelerationAxisY = 0.0;
	this.lastTeddyProtagonistHeadingAngle =
		this.constBaseTeddyProtagonistCompositeModelRotationAxisY;
	
	this.setTeddyProtagonistAnimationType(this.constTeddyProtagonistAnimationTypeStationary);
	this.currentTeddyProtagonistAnimationStartTimeMs = this.totalElapsedSceneTimeMs;
	
	this.goalMarkerInstanceDataCollection.splice(0);
	this.enemyInstanceDataCollection.splice(0);
	
	this.gameEndOverlayContentHasBeenGenerated = false;		
	this.setOperationState(this.constOperationStateActive);	
	
	this.setupLevelEnvironment();
}

/**
 * Parses the encoded representation of the current level, building the level, and
 *  initializes factors specific to level arrangement.
 */
MainToyAbandonmentGameplayScene.prototype.setupLevelEnvironment = function () {
	if ((this.currentLevelIndex >= 0) && (this.currentLevelIndex < this.levelKeyCollection.length)) {
		
		// Parse the loaded level...
		var rawLevelData = globalResources.getLoadedResourceDataByKey(this.levelKeyCollection[this.currentLevelIndex]);
		var levelSpecificationParser = new SpatialLevelSpecificationParser();
		levelSpecificationParser.parseSpatialLevelSpecificationBuffer(rawLevelData.resourceDataStore);
		
		var levelRepresentation = new LevelRepresentation(levelSpecificationParser);
		// Set the scaling factors such that one tile is equivalent to one
		// world space unit
		levelRepresentation.setScaleFactors(this.constWorldScale, this.constWorldScale, this.constWorldScale);
		
		this.currentLevelRepresentation = levelRepresentation;
		
		if (Utility.validateVar(levelRepresentation.startPosition)) {
			this.currentWorldSpacePositionInLevel = new Point3d(levelRepresentation.startPosition.positionX,
				levelRepresentation.startPosition.positionY, this.constTeddyProtagonistRenderSpaceOffsetAxisZ);
				
			this.setupLevelScrollPosition(levelRepresentation);
		}
		
		this.setupDynamicLevelElements(levelRepresentation);
	}
}

/**
 * Instantiates dynamic level elements, as specified within the parsed
 *  level representation, within the active level instance data
 *
 * @param levelRepresentation {LevelRepresentation} Parsed level representation
 */
MainToyAbandonmentGameplayScene.prototype.setupDynamicLevelElements = function(levelRepresentation) {
	if (Utility.validateVarAgainstType(levelRepresentation, LevelRepresentation) &&
		(Utility.validateVar(levelRepresentation.dynamicInstanceInfoCollection))) {
			
		for (var currentInstanceInfo of levelRepresentation.dynamicInstanceInfoCollection) {			
			this.buildDynamicLevelElement(currentInstanceInfo);
		}
	}
}

/**
 * Constructs an instance of a dynamic level element, internally 
 *  storing the instance within the active level state data
 *  store
 *
 * @param instanceInfo {InstanceInfo} Parsed dynamic element
 *                                    instance data used to
 *                                    instantiate a game-state
 *                                    dynamic element
 *
 * @see SpatialLevelSpecificationParser
 */
MainToyAbandonmentGameplayScene.prototype.buildDynamicLevelElement = function(instanceInfo) {	
	if (Utility.validateVar(instanceInfo)) {
		if (instanceInfo.tileAttributeData.elementType === this.constLevelSymbolTypeEnemySpecifier) {
			this.storeEnemyInstanceData(instanceInfo);
		}
		else if (instanceInfo.tileAttributeData.elementType === this.constLevelSymbolTypeGoalSpecifier) {
			this.storeGoalInstanceData(instanceInfo);
		}			
	}
}

/**
 * Applies attributes to an active dynamic element instance
 *
 * @param dynamicElement {DynamicItemInstanceData/EnemyInstanceData} Dynamic element which
 *                                                                   will receive the applied
 *                                                                   instance data
 * @param instanceInfo {InstanceInfo} Parsed dynamic element
 *                                    instance data used to
 *                                    instantiate a game-state
 *                                    dynamic element
 */
MainToyAbandonmentGameplayScene.prototype.applyDynamicElementBaseAttributes = function (dynamicElement, instanceInfo) {
	dynamicElement.modelDataKey = this.levelBuiltInModelSymbolToModelKeyDict[instanceInfo.tileAttributeData.builtInModel];
	dynamicElement.modelWorldSpacePosition = new Point3d(instanceInfo.levelGridPosition.positionX,
		instanceInfo.levelGridPosition.positionY, 0.0);
}

/** 
 * Stores information retrieved from parsed level data
 *  as a usable object in the game state data store
 *  (enemy objects)
 * 
 * @param instanceInfo {InstanceInfo} Information, as sourced directly from a
 *                                    parsed level representation, which
 *                                    describes a dynamic object
 *
 * @see LevelRepresentation
 */
MainToyAbandonmentGameplayScene.prototype.storeEnemyInstanceData = function(instanceInfo) {
	var enemyInstanceData = new EnemyInstanceData();
	
	this.applyDynamicElementBaseAttributes(enemyInstanceData, instanceInfo);
		
	enemyInstanceData.velocityVector = new Vector3d(instanceInfo.tileAttributeData.initMovementVelocityHoriz,
		instanceInfo.tileAttributeData.initMovementVelocityVert, 0.0);
	enemyInstanceData.contactDamage = instanceInfo.tileAttributeData.contactDamage;
	
	this.enemyInstanceDataCollection.push(enemyInstanceData);
}

/** 
 * Stores information retrieved from parsed level data
 *  as a usable object in the game state data store
 *  (goal objects)
 * 
 * @param instanceInfo {InstanceInfo} Information, as sourced directly from a
 *                                    parsed level representation, which
 *                                    describes a dynamic object
 *
 * @see LevelRepresentation
 */
MainToyAbandonmentGameplayScene.prototype.storeGoalInstanceData = function(instanceInfo) {
	var goalInstanceData = new DynamicItemInstanceData();
	
	this.applyDynamicElementBaseAttributes(goalInstanceData, instanceInfo);
		
	this.goalMarkerInstanceDataCollection.push(goalInstanceData);
}

/**
 * Configures the initial scroll position, based upon the
 *  initial Teddy protagonist world-space position
 *
 * @param levelRepresentation {LevelRepresentation} Parsed level data representation
 */
MainToyAbandonmentGameplayScene.prototype.setupLevelScrollPosition = function (levelRepresentation) {
	// Retrieve the render-space tile grid dimensions...
	var tileGridDimensions = levelRepresentation.getTileGridDimensions();
	
	var mainCanvasContext = globalResources.getMainCanvasContext();
	
	var viewPortSizeX = mainCanvasContext.canvas.width
	var viewPortSizeY = mainCanvasContext.canvas.height
	
	this.levelScrollManager	= new LevelScrollManager(tileGridDimensions.xDelta, tileGridDimensions.yDelta);
	
	if (Utility.validateVar(levelRepresentation.startPosition)) {
		this.levelScrollManager.viewPortCenterPointX =
			this.worldSpaceLengthToRenderSpaceLength(levelRepresentation.startPosition.positionX);
		this.levelScrollManager.viewPortCenterPointY =
			this.worldSpaceLengthToRenderSpaceLength(levelRepresentation.startPosition.positionY);
	}
}	

/**
 * Computed the immediate Teddy protagonist acceleration vector, based
 *  upon the immediate data from an input device and the pre-determined,
 *  Teddy protagonist acceleration value
 * 
 * @return {Vector3d} Acceleration vector (meters/millisecond²)
 */
MainToyAbandonmentGameplayScene.prototype.currentTeddyProtagonistAccelerationVectorFromInput = function() {
	var accelerationVector = new Vector3d(0.0, 0.0, 0.0);
		
	accelerationVector = new Vector3d(this.currentTeddyProtagonistUnitAccelerationAxisX,
		this.currentTeddyProtagonistUnitAccelerationAxisY, 0.0);
	accelerationVector = accelerationVector.multiplyByScalar(this.teddyProtagonistAmbulationAccelerationMetersPerMsSq);
	
	// Normalize the acceleration vector such that the magnitude is always
	// constrained to a unit magnitude. Otherwise, the acceleration magnitude
	// would affected by the aggregate angle. Full input magnitudes along two
	// separate axes would yield a magnitude of ~1.414 (square root of two),
	// for instance.
	return this.unitCircleNormalizedVector(accelerationVector);
}

/**
 * Normalizes an input vector, which is comprised of discrete inputs along two
 *  axis (each of which is a maximum unit magnitude vector), to be contained
 *  within a unit circle 
 * 
 * @return {Vector3d} Input vector, normalized to a vector
 *                    contained within a unit circle
 */
MainToyAbandonmentGameplayScene.prototype.unitCircleNormalizedVector = function (vector) {
	// Using the angle of the input vector, map the vector to a unit circle.
	var vectorAngleAbs = Math.abs(this.vectorAngleFromNorthRefVector(vector));

	var xComponent = vector.xComponent * Math.abs(Math.cos(Math.PI / 2.0 - vectorAngleAbs));
	var yComponent = vector.yComponent * Math.abs(Math.cos(vectorAngleAbs));
	var zComponent = 0.0;

	return new Vector3d(xComponent, yComponent, zComponent);
}

MainToyAbandonmentGameplayScene.prototype.tileAttributesAtWorldSpacePosition = function (position, tileColumnOffset, tileRowOffset) {
	var tileAttributes = null;
	
	if (Utility.validateVarAgainstType(position, Point3d) && Utility.validateVar(tileColumnOffset) &&
		Utility.validateVar(tileRowOffset)) {

		var tileType = this.currentLevelRepresentation.getTileTypeAtPosition(
			Math.round(position.yCoord) + tileRowOffset,
			Math.round(position.xCoord) + tileColumnOffset);
		
		if (Utility.validateVar(tileType)) {
			tileAttributes = this.currentLevelRepresentation.getTileTypeAttributes(tileType);
		}
	}
	
	return tileAttributes;
}

/**
 * Provides the render-space rectangle for a tile located
 *  at the provided world-space position - a rectangle for
 *  a tile relative to this world-space position can be
 *  obtained by providing non-zero horizontal and vertical
 *  offsets
 *
 * @param position {Point3d} World space position (components in meters)
 * @param tileColumnOffset {Number} Horizontal offset from the tile associated with the
 *                                  referenced world-space point
 * @param tileRowOffset {Number} Vertical offset from the tile associated with the
 *                               referenced world-space point
 *
 * @return {Rectangle} Render-space tile position/region
 */
MainToyAbandonmentGameplayScene.prototype.renderSpaceTileRectAtWorldSpacePosition = function (position, tileColumnOffset, tileRowOffset) {
	var tileRect = null;
	
	if (Utility.validateVarAgainstType(position, Point3d) && Utility.validateVar(tileColumnOffset) &&
		Utility.validateVar(tileRowOffset)) {

		tileRect = this.currentLevelRepresentation.getTileRectInLevelSpace(
			Math.round(position.yCoord) + tileRowOffset,
			Math.round(position.xCoord) + tileColumnOffset, 0, 0);
	}

	return tileRect;
}

/**
 * Computes the immediate acceleration vector that will be applied to
 *  the Teddy protagonist velocity, incorporating the coefficient
 *  of friction associated with the tile on which the Teddy
 *  protagonist is positioned
 *
 * @return {Vector3d} Acceleration vector (meters/millisecond²)
 */
MainToyAbandonmentGameplayScene.prototype.currentTeddyProtagonistAccelerationVector = function() {
	var accelerationVector = this.currentTeddyProtagonistAccelerationVectorFromInput();
		
	var tileAttributes = this.tileAttributesAtWorldSpacePosition(this.currentWorldSpacePositionInLevel, 0, 0);
	
	if (Utility.validateVar(tileAttributes) && Utility.validateVar(tileAttributes.frictionCoefficient)) {
		accelerationVector = accelerationVector.multiplyByScalar(tileAttributes.frictionCoefficient);
	}

	return accelerationVector;
}

/**
 * Applies deceleration to the teddy protagonist in order to progressively
 *  decrease the velocity of the teddy bear protagonist - this deceleration
 *  rate is affected by the approximate coefficient of friction
 *  of the surface on which the teddy bear protagonist is situated
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.computeTeddyProtagonistAmbulationDecelerationVector = function (timeQuantum) {
	var decelerationVector = new Vector3d(0.0, 0.0, 0.0);
	
	if (this.currentTeddyProtagonistVelocity.magnitude() > 0.0) {			
		var tileAttributes = this.tileAttributesAtWorldSpacePosition(this.currentWorldSpacePositionInLevel, 0, 0);
		
		var frictionCoefficient = 1.0;
		if (Utility.validateVar(tileAttributes) && Utility.validateVar(tileAttributes.frictionCoefficient)) {
			frictionCoefficient = tileAttributes.frictionCoefficient;
		}

		// Compute the deceleration vector, based on immediate velocity	
		var decelerationMagnitude =
			this.teddyProtagonistAmbulationDecelerationMetersPerMsSq * frictionCoefficient;
		var decelerationVector = this.currentTeddyProtagonistVelocity.multiplyByScalar(
			-decelerationMagnitude / this.currentTeddyProtagonistVelocity.magnitude());
			
		var accelerationVectorFromInput = this.currentTeddyProtagonistAccelerationVectorFromInput();
		
		if (Math.abs(accelerationVectorFromInput.xComponent) > 0.0) {
			decelerationVector.xComponent = 0.0;
		}
		
		if (Math.abs(accelerationVectorFromInput.yComponent) > 0.0) {
			decelerationVector.yComponent = 0.0;
		}
	}
	
	return decelerationVector;
}

/**
 * Updates the instantaneous velocity of the Teddy protagnoist
 * 
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param maxVelocityFromAcceleration Maximum permissible velocity (meters/millisecond)
 * @param wallCollisionInfoAxisX {DynamicRectIntersectionInfo} Impending wall collision
 *															   along the X-axis (can be null)
 * @param wallCollisionInfoAxisY {DynamicRectIntersectionInfo} Impending wall collision
 *															   along the Y-axis (can be null)
 */
MainToyAbandonmentGameplayScene.prototype.updateTeddyProtagonistVelocity = function (timeQuantum,
	maxVelocityFromAcceleration, wallCollisionInfoAxisX, wallCollisionInfoAxisY) {
		
	var velocityChangeFromAccelVector = this.currentTeddyProtagonistAccelerationVector().multiplyByScalar(timeQuantum);
	
	var newVelocityVector = this.currentTeddyProtagonistVelocity.addVector(velocityChangeFromAccelVector);
	if (newVelocityVector.magnitude() > maxVelocityFromAcceleration) {

		this.currentTeddyProtagonistVelocity = newVelocityVector.multiplyByScalar(
			maxVelocityFromAcceleration / this.currentTeddyProtagonistVelocity.magnitude());
	}
	else {
		this.currentTeddyProtagonistVelocity = newVelocityVector;
	}
		
	var velocityChangeFromDecelVector =
		this.computeTeddyProtagonistAmbulationDecelerationVector(timeQuantum).multiplyByScalar(timeQuantum);
		
	// Clamp the velocity reduction to zero, preventing deceleration from
	// reversing the direction of the velocity vector along a particular axis.
	if ((velocityChangeFromDecelVector.xComponent > 0.0) &&
		(Math.abs(velocityChangeFromDecelVector.xComponent) >
		Math.abs(this.currentTeddyProtagonistVelocity.xComponent))) {
			
		velocityChangeFromDecelVector.xComponent = -this.currentTeddyProtagonistVelocity.xComponent;		
	}

	if ((velocityChangeFromDecelVector.yComponent > 0.0) &&
		(Math.abs(velocityChangeFromDecelVector.yComponent) >
		Math.abs(this.currentTeddyProtagonistVelocity.yComponent))) {
			
		velocityChangeFromDecelVector.yComponent = -this.currentTeddyProtagonistVelocity.yComponent;
	}
	
	this.currentTeddyProtagonistVelocity = this.currentTeddyProtagonistVelocity.addVector(velocityChangeFromDecelVector);
}

/**
 * Applies the appropriate alterations to the instantaneous velocity
 *  of the Teddy protagonist regarding any, impending wall collisions.
 */
MainToyAbandonmentGameplayScene.prototype.alterTeddyProtagonistVelocityWithCollsionInfo = function (
	wallCollisionInfoAxisX, wallCollisionInfoAxisY) {

	if (Utility.validateVarAgainstType(wallCollisionInfoAxisY, DynamicRectIntersectionInfo)) {
		if ((wallCollisionInfoAxisY.intersectionEdge === RectIntersectionEdge.constEdgeTop) || 
			(wallCollisionInfoAxisY.intersectionEdge === RectIntersectionEdge.constEdgeBottom)) {
			
			this.currentTeddyProtagonistVelocity.yComponent = 0.0;
		}
	}
		
	if (Utility.validateVarAgainstType(wallCollisionInfoAxisX, DynamicRectIntersectionInfo)) {		
		if ((wallCollisionInfoAxisX.intersectionEdge === RectIntersectionEdge.constEdgeLeft) || 
			(wallCollisionInfoAxisX.intersectionEdge === RectIntersectionEdge.constEdgeRight)) {
			
			this.currentTeddyProtagonistVelocity.xComponent = 0.0;			
		}
	}
}

/**
 * Determines the approximate, pre-determined, render-space Z-plane bounding
 *  rectangle for the Teddy protagonist
 *
 * @return {Rectangle} Rectangle Z-plane bounding rectangle for the Teddy
 *                     protagonist
 */
MainToyAbandonmentGameplayScene.prototype.teddyProtagonistGroundPlaneBoundingRect = function () {
	var boxDimension = Math.max(
		this.modelRefDimensionKeyValStore[globalResources.keyModelTeddyProtagonistTorso].dimensionX,
		this.modelRefDimensionKeyValStore[globalResources.keyModelTeddyProtagonistTorso].dimensionY);

	boundingRect = new Rectangle(
		this.worldSpaceLengthToRenderSpaceLength(this.currentWorldSpacePositionInLevel.xCoord) - boxDimension / 2.0,
		this.worldSpaceLengthToRenderSpaceLength(this.currentWorldSpacePositionInLevel.yCoord) + boxDimension / 2.0,
		boxDimension,
		boxDimension);

	return boundingRect;
}

/**
 * Evaluates all Teddy protagonist wall collisions, returning information
 *  regarding any determined, impending wall collisions
 *  
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 *
 * @return {Array} Array of DynamicRectIntersectionInfo objects,
 *         which describe impending wall collisions
 */
MainToyAbandonmentGameplayScene.prototype.evaluateTeddyProtagonistWallCollisions = function (timeQuantum) {
	return this.evaluateWallCollisionsWithBoundingRect(timeQuantum,
		this.currentWorldSpacePositionInLevel, this.currentTeddyProtagonistVelocity,
		this.teddyProtagonistGroundPlaneBoundingRect());
}

/**
 * Evaluates wall collisions, using a world-space position
 *  and render-space bounding region dimensions.
 *  
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param worldSpaceElementPosition {Point3d} Position of the element, in world-space
 *                                  (components in meters)
 * @param worldSpaceVelocityVector {Vector3d} World-space velocity vector (meters/millisecond)
 * @param elementRenderSpaceBoundingRect {Rectangle) Render-space bounding rectangle
 *
 * @return {Array} Array of DynamicRectIntersectionInfo objects,
 *				   which describe impending wall collisions
 */
MainToyAbandonmentGameplayScene.prototype.evaluateWallCollisionsWithBoundingRect = function (timeQuantum,
	worldSpaceElementPosition, worldSpaceVelocityVector, elementRenderSpaceBoundingRect) {
	// Tile span, away from the element location, in a single direction
	// along an axis, which describes the area in which a search will be
	// performed (the entire level does not need to be searched for
	// possible wall collisions).
	var tileSearchSpan = 3;
	
	var rectIntersections = [];
	
	for (var tileColumnOffset = -tileSearchSpan; tileColumnOffset <= tileSearchSpan; tileColumnOffset++) {
		for (var tileRowOffset = -tileSearchSpan; tileRowOffset <= tileSearchSpan; tileRowOffset++) {		
			var tileAttributes = this.tileAttributesAtWorldSpacePosition(worldSpaceElementPosition,
				tileColumnOffset, tileRowOffset);
				
			var intersectionTimeEpsilon = 1.0 * 10**-7;
				
			if (Utility.validateVar(tileAttributes) && Utility.validateVar(tileAttributes.height)) {
				
				var tileRect = this.renderSpaceTileRectAtWorldSpacePosition(worldSpaceElementPosition,
					tileColumnOffset, tileRowOffset);

				// Horizontal component moving towards left edge of wall
				// (positive X-axis direction / right)
				if ((worldSpaceVelocityVector.xComponent > 0) &&
					(this.coordinateLessThanOrEqual((elementRenderSpaceBoundingRect.left + elementRenderSpaceBoundingRect.width), (tileRect.left)))) {
						
					var xDistanceToWall = tileRect.left - (elementRenderSpaceBoundingRect.left + elementRenderSpaceBoundingRect.width);

					var edgeCoordCoincidenceTime = Math.abs(this.renderSpaceLengthToWorldSpaceLength(xDistanceToWall) /
						worldSpaceVelocityVector.xComponent);
					if (this.rectsIntersectAtExtrapolatedTime(tileRect, elementRenderSpaceBoundingRect,
						worldSpaceVelocityVector, edgeCoordCoincidenceTime + intersectionTimeEpsilon)) {
							
						var intersectionInfo = new DynamicRectIntersectionInfo(edgeCoordCoincidenceTime,
							RectIntersectionEdge.constEdgeLeft,
							tileRect.left - (elementRenderSpaceBoundingRect.width / 2.0));
						rectIntersections.push(intersectionInfo);								
					}
				}
				
				// Horizontal component moving towards right edge of wall
				// (negative X-axis direction / left)
				if ((worldSpaceVelocityVector.xComponent < 0) &&
					this.coordinateGreaterOrEqual(elementRenderSpaceBoundingRect.left, (tileRect.left + tileRect.width))) {
						
					var xDistanceToWall = elementRenderSpaceBoundingRect.left - (tileRect.left + tileRect.width);
					
					var edgeCoordCoincidenceTime = Math.abs(this.renderSpaceLengthToWorldSpaceLength(xDistanceToWall) /
						worldSpaceVelocityVector.xComponent);
					if (this.rectsIntersectAtExtrapolatedTime(tileRect, elementRenderSpaceBoundingRect,
						worldSpaceVelocityVector, edgeCoordCoincidenceTime + intersectionTimeEpsilon)) {

						var intersectionInfo = new DynamicRectIntersectionInfo(edgeCoordCoincidenceTime,
							RectIntersectionEdge.constEdgeRight,
							(tileRect.left + tileRect.width) + (elementRenderSpaceBoundingRect.width / 2.0));
						rectIntersections.push(intersectionInfo);								
					}
				}
				
				// Vertical component moving towards bottom edge of wall
				// (positive Y-axis direction / up)
				if ((worldSpaceVelocityVector.yComponent > 0) &&
					this.coordinateLessThanOrEqual(elementRenderSpaceBoundingRect.top, (tileRect.top - tileRect.height))) {
						
					var yDistanceToWall = (tileRect.top - tileRect.height) - elementRenderSpaceBoundingRect.top;

					var edgeCoordCoincidenceTime = Math.abs(this.renderSpaceLengthToWorldSpaceLength(yDistanceToWall) /
						worldSpaceVelocityVector.yComponent);
					if (this.rectsIntersectAtExtrapolatedTime(tileRect, elementRenderSpaceBoundingRect,
						worldSpaceVelocityVector, edgeCoordCoincidenceTime + intersectionTimeEpsilon)) {

						var intersectionInfo = new DynamicRectIntersectionInfo(edgeCoordCoincidenceTime,
							RectIntersectionEdge.constEdgeBottom,
							(tileRect.top - tileRect.height) - (elementRenderSpaceBoundingRect.height / 2.0));
						rectIntersections.push(intersectionInfo);
					}
				}
				
				// Vertical component moving towards top edge of wall
				// (negative Y-axis direction / down)
				if ((worldSpaceVelocityVector.yComponent < 0) &&
					this.coordinateGreaterOrEqual((elementRenderSpaceBoundingRect.top - elementRenderSpaceBoundingRect.height), tileRect.top)) {

					var yDistanceToWall = (elementRenderSpaceBoundingRect.top - elementRenderSpaceBoundingRect.height) - tileRect.top;
					
				
					
					var edgeCoordCoincidenceTime = Math.abs(this.renderSpaceLengthToWorldSpaceLength(yDistanceToWall) /
						worldSpaceVelocityVector.yComponent);
					if (this.rectsIntersectAtExtrapolatedTime(tileRect, elementRenderSpaceBoundingRect,
						worldSpaceVelocityVector, edgeCoordCoincidenceTime + intersectionTimeEpsilon)) {
							
						var intersectionInfo = new DynamicRectIntersectionInfo(edgeCoordCoincidenceTime,
							RectIntersectionEdge.constEdgeTop,
							tileRect.top + (elementRenderSpaceBoundingRect.height / 2.0));
						rectIntersections.push(intersectionInfo);
					}
				}
			}
		}
	}
	
	return rectIntersections;
}

/**
 * Determines if two floating point values are approximately equal
 * 
 * @param {coord1} First value to compare
 * @param {coord2} Second value to compare
 *
 *
 * @return {Boolean} True if the values are approximately equal
 */
MainToyAbandonmentGameplayScene.prototype.coordinatesAreApproxEqual = function (coord1, coord2) {
	var constCoordEpsilon = 10**-11;
	
	return Math.abs(coord1 - coord2) <= constCoordEpsilon;
}

/**
 * Determines if one floating point value is greater than or equal to
 *  another value
 * 
 * @param {coord1} First value to compare
 * @param {coord2} Second value to compare
 *
 *
 * @return {Boolean} True if the first value is greater than or equal
 *                   to the second value
 */
MainToyAbandonmentGameplayScene.prototype.coordinateGreaterOrEqual = function (coord1, coord2) {
	return (coord1 > coord2) || this.coordinatesAreApproxEqual(coord1, coord2);
}

/**
 * Determines if one floating point value is less than or equal to
 *  another value
 * 
 * @param {coord1} First value to compare
 * @param {coord2} Second value to compare
 *
 *
 * @return {Boolean} True if the first value is less than or equal
 *                   to the second value
 */
MainToyAbandonmentGameplayScene.prototype.coordinateLessThanOrEqual = function (coord1, coord2) {
	return (coord1 < coord2) || this.coordinatesAreApproxEqual(coord1, coord2);
}

/**
 * Find the wall collision which occurs the soonest within a
 *  collection of wall collisions - this wall collision must
 *  also occur within the specified elapsed time period
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param wallCollisionInfoCollection {Array} Collection of DynamicRectIntersectionInfo
 *                                            objects which describe the impending wall collisions
 *
 * @return {DynamicRectIntersectionInfo} Describes the impending wall collision (can be null)
 */
MainToyAbandonmentGameplayScene.prototype.findSoonestWallCollision = function (timeQuantum, wallCollisionInfoCollection) {
	var soonestWallCollision = null;
		
	for (var currentWallCollision of wallCollisionInfoCollection) {
		
		if (currentWallCollision.timeToIntersection <= timeQuantum) {
			if ((soonestWallCollision === null) ||
				(currentWallCollision.timeToIntersection < soonestWallCollision.timeToIntersection)) {
			
				soonestWallCollision = currentWallCollision;					
			}			
		}
	}
	
	return soonestWallCollision;
}

/**
 * Returns all collisions, within the provided collection of
 *  collisions, that occur along the X-Axis
 *
 * @return {Array} Collection of DynamicRectIntersectionInfo objects which describe
 *                 the impending wall collisions
 */
MainToyAbandonmentGameplayScene.prototype.xAxisWallCollisions = function (wallCollisionInfoCollection) {
	return wallCollisionInfoCollection.filter(function (wallCollisionInfo) {
		return ((wallCollisionInfo.intersectionEdge === RectIntersectionEdge.constEdgeLeft) ||
			(wallCollisionInfo.intersectionEdge === RectIntersectionEdge.constEdgeRight))
	});
}

/**
 * Returns all collisions, within the provided collection of
 *  collisions, that occur along the Y-Axis
 *
 * @return {Array} Collection of DynamicRectIntersectionInfo objects which describe
 *                 the impending wall collisions
 */
MainToyAbandonmentGameplayScene.prototype.yAxisWallCollisions = function (wallCollisionInfoCollection) {
	return wallCollisionInfoCollection.filter(function (wallCollisionInfo) {
		return ((wallCollisionInfo.intersectionEdge === RectIntersectionEdge.constEdgeTop) ||
			(wallCollisionInfo.intersectionEdge === RectIntersectionEdge.constEdgeBottom));
	});	
}

/**
 * Updates the instantaneous position of the Teddy protagnoist
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 *
 * @param wallCollisionInfoAxisX {DynamicRectIntersectionInfo} Impending wall collision
 *															   along the X-axis (can be null)
 * @param wallCollisionInfoAxisY {DynamicRectIntersectionInfo} Impending wall collision
 *															   along the Y-axis (can be null)
 */
MainToyAbandonmentGameplayScene.prototype.updateTeddyProtagonistPosition = function (timeQuantum, wallCollisionInfoAxisX, wallCollisionInfoAxisY) {			
	if (Utility.validateVar(wallCollisionInfoAxisX)) {
		this.currentWorldSpacePositionInLevel.xCoord = this.renderSpaceLengthToWorldSpaceLength(wallCollisionInfoAxisX.clampedCoordValue);
	}
	else {
		this.currentWorldSpacePositionInLevel.xCoord +=
			(this.currentTeddyProtagonistVelocity.xComponent * timeQuantum);		
	}

	if (Utility.validateVar(wallCollisionInfoAxisY)) {			
		this.currentWorldSpacePositionInLevel.yCoord = this.renderSpaceLengthToWorldSpaceLength(wallCollisionInfoAxisY.clampedCoordValue);		
	}
	else {
		this.currentWorldSpacePositionInLevel.yCoord +=
			(this.currentTeddyProtagonistVelocity.yComponent * timeQuantum);
	}

	this.currentWorldSpacePositionInLevel.zCoord +=
		(this.currentTeddyProtagonistVelocity.zComponent * timeQuantum);
}

/**
 * Determines if the extrapolated position of a rectangle, using
 *  a provided velocity vector and displacement time, intersects
 *  a stationary rectangle
 *
 * @param stationaryRenderSpaceRect Stationary render-space rectangle
 * @param movingRenderSpaceRect Render-space rectangle that will be translated
 * @param worldSpaceVelocityVector Velocity of the moving render-space rectangle
 *                                 (meters/millisecond)
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 *
 * @return {Boolean} True if the extrapolated position of the
 *                   rectangle intersects that of the provided
 *                   rectangle
 */
MainToyAbandonmentGameplayScene.prototype.rectsIntersectAtExtrapolatedTime = function (
	stationaryRenderSpaceRect, movingRenderSpaceRect, worldSpaceVelocityVector, timeQuantum) {
		
	var rectsIntersect = false;
		
	if (Utility.validateVarAgainstType(stationaryRenderSpaceRect, Rectangle) &&
		Utility.validateVarAgainstType(movingRenderSpaceRect, Rectangle) &&
		Utility.validateVarAgainstType(worldSpaceVelocityVector, Vector3d) &&
		Utility.validateVar(timeQuantum)) {
			
		var worldSpaceDisplacementVector = worldSpaceVelocityVector.multiplyByScalar(timeQuantum);
					
		var displacedRect = movingRenderSpaceRect.rectWithOffset(
			this.worldSpaceLengthToRenderSpaceLength(worldSpaceDisplacementVector.xComponent),
			this.worldSpaceLengthToRenderSpaceLength(worldSpaceDisplacementVector.yComponent));

		rectsIntersect = stationaryRenderSpaceRect.intersectsRect(displacedRect);	
	}
		
	return rectsIntersect;
}

/**
 * Determines if a damage reception event (invulnerability induced by
 *  contact damage) is presently active for the Teddy protagonist
 *
 * @return True if a damage reception event is in progress.
 */
MainToyAbandonmentGameplayScene.prototype.isDamageReceptionEventActive = function () {
	return this.timerWithIdExists(this.constTimerIdDamageReceptionEvent);
}

MainToyAbandonmentGameplayScene.prototype.clampedWorldPositionFromBoundingBoxesAndVelocity = function (dynamicBounds, staticBounds,
	dynamicRefWorldPosition, dynamicWorldVelocityVector) {
		
	var clampedPosition = dynamicRefWorldPosition;
	
	// Left direction
	if ((dynamicWorldVelocityVector.xComponent < 0) &&
		(dynamicBounds.left <= (staticBounds.left + staticBounds.width))) {
			
		dynamicRefWorldPosition.xCoord = 
			this.renderSpaceLengthToWorldSpaceLength(((staticBounds.left + staticBounds.width) +
				dynamicBounds.width / 2.0));
	}

	// Right direction
	if ((dynamicWorldVelocityVector.xComponent > 0) &&
		((dynamicBounds.left + dynamicBounds.width) >= staticBounds.left)) {
			
		dynamicRefWorldPosition.xCoord =
			this.renderSpaceLengthToWorldSpaceLength(staticBounds.left -
				dynamicBounds.width / 2.0);
	}	

	// Down direction
	if ((dynamicWorldVelocityVector.yComponent < 0) &&
		((dynamicBounds.top - dynamicBounds.height) <= staticBounds.top)) {
			
		dynamicRefWorldPosition.yCoord =
			this.renderSpaceLengthToWorldSpaceLength(staticBounds.top +
				dynamicBounds.height / 2.0);
	}

	// Up direction
	if ((dynamicWorldVelocityVector.yComponent > 0)	&&
		(dynamicBounds.top >= (staticBounds.top - staticBounds.height))) {
			
		dynamicRefWorldPosition.yCoord =
			this.renderSpaceLengthToWorldSpaceLength((staticBounds.top - staticBounds.height) +
				dynamicBounds.height / 2.0);			
	}
	
	
	return clampedPosition;		
}

/**
 * Determines the angle between the provided vector and a
 *  vector parallel with the Y-axis (positive direction)
 *
 * @param vector {Vector3d} Vector for which the angle between
 *                          the Y-axis is to be determined
 *
 * @return {Number} Angle between the provided vector and
 *                  the "north" reference vector
 *
 */
MainToyAbandonmentGameplayScene.prototype.vectorAngleFromNorthRefVector = function (vector) {
	var angle = 0.0;
	
	var northReferenceVector = new Vector3d(0.0, 1.0, 0.0);
	
	var dotProduct = vector.dotProduct(northReferenceVector);
	var crossProduct = vector.crossProduct(northReferenceVector);
	
	var magnitudeProduct = (northReferenceVector.magnitude() * vector.magnitude());
	
	if (magnitudeProduct > 0.0) {	
		var angleCosine = dotProduct / magnitudeProduct;
		
		angle = (Math.acos(angleCosine) * ((crossProduct.zComponent > 0.0) ? 1.0 : -1.0));
	}
	
	return angle;
}

/**
 * Determines the angle between the provided vector and a
 *  vector parallel with the Y-axis (positive direction),
 *  assuming a particular base rotation
 *
 * @param vector {Vector3d} Vector for which the angle between
 *                          the Y-axis is to be determined
 * @param baseRotation {Number} Base rotation value to add to the
 *                              heading angle
 *
 * @return {Number} Angle between the provided vector and
 *                  the "north" reference vector
 *
 */
MainToyAbandonmentGameplayScene.prototype.computeHeadingAngleFromVector = function (vector, baseRotation) {
	var headingAngle = 0.0;
	
	var northReferenceVector = new Vector3d(0.0, 1.0, 0.0);
	
	headingAngle = this.vectorAngleFromNorthRefVector(vector) + baseRotation;
	
	return headingAngle;
}

/**
 * Determines the direction in which the Teddy protagonist is facing
 *
 * @return {Number} An angle, as evaluated against a vector parallel with
 *                  the Y-axis (positive direction)
 */
MainToyAbandonmentGameplayScene.prototype.computeTeddyProtagonistHeadingAngle = function () {	
	return this.computeHeadingAngleFromVector(this.currentTeddyProtagonistAccelerationVector(),
		this.constBaseTeddyProtagonistCompositeModelRotationAxisY);
}

MainToyAbandonmentGameplayScene.prototype.resolveTeddyProtagonistHeadingAngle = function () {
	var headingAngle = this.computeTeddyProtagonistHeadingAngle();
	
	if (this.currentTeddyProtagonistAccelerationVector().magnitude() > 0.0) {
		headingAngle = this.computeTeddyProtagonistHeadingAngle();
		this.lastTeddyProtagonistHeadingAngle = headingAngle;
	}
	else {
		headingAngle = this.lastTeddyProtagonistHeadingAngle;
	}
	
	return headingAngle;
}

/**
 * Generates a matrix required to rotate the Teddy protagonist
 *  model such that it is oriented with the internally-
 *  determined heading direction
 *
 * @return {MathExt.Matrix} Matrix required to rotate the
 *                          Teddy protagonist model such that
 *                          it is in accord with the heading
 *                          direction
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistHeadingRotationMatrix = function () {
	return MathUtility.generateRotationMatrix3dAxisZ(this.resolveTeddyProtagonistHeadingAngle());
}

/**
 * Generates a matrix which produces a tilt of the composite
 *  Teddy protagonist model (along the X-axis, as applied to
 *  the untransformed model)
 *
 * @return {MathExt.Matrix} Tilt matrix to be applied to the
 *                          composite model
 *                           
 */
MainToyAbandonmentGameplayScene.prototype.generateTeddyProtagonistLongitudinalTiltMatrix = function () {
	return this.rotationMatrixForPivotAxisWithEvaluator(this.constModelPivotAxisX,
		this.compositeTeddyLongitudinalTiltAngleEvaluator)
}

/**
 * Determines the appropriate Teddy protagonist animation type,
 *  using immediate game state data pertaining to the Teddy
 *  protagonist in order to evaluate the type
 *
 * @return {Number} Animation type specifier
 *
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationTypeStationary
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationTypeAmbulation
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationTypeDamageReception
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationGameEnd
 */
MainToyAbandonmentGameplayScene.prototype.resolveTeddyProtagonistAnimationTypeByContext = function () {
	var animationType = this.constTeddyProtagonistAnimationTypeStationary;
	
	if (this.isDamageReceptionEventActive()) {
		animationType = this.constTeddyProtagonistAnimationTypeDamageReception;
	}
	else if ((this.currentTeddyProtagonistUnitAccelerationAxisX !== 0.0) ||
		(this.currentTeddyProtagonistUnitAccelerationAxisY !== 0.0) &&
		this.isInActiveOperationState()) {
			
		animationType = this.constTeddyProtagonistAnimationTypeAmbulation;		
	}
	else if (this.isInGameOverState()) {
		animationType = this.constTeddyProtagonistAnimationGameEnd;
	}
	
	return animationType;
}

/**
 * Sets the internally-stored Teddy protagonist animation type
 *
 * @param {Number} Animation type specifier
 *
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationTypeStationary
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationTypeAmbulation
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationTypeDamageReception
 * @see MainToyAbandonmentGameplayScene.constTeddyProtagonistAnimationGameEnd
 */
MainToyAbandonmentGameplayScene.prototype.setTeddyProtagonistAnimationType = function (animationType) {
	if (Utility.validateVar(animationType)) {		
		if (this.currentTeddyProtagonistAnimationType !== animationType) {
			this.currentTeddyProtagonistAnimationStartTimeMs = this.totalElapsedSceneTimeMs;
		}
		
		this.currentTeddyProtagonistAnimationType = animationType;
		this.setupTeddyProtagonistModelAnimationCurves(animationType);
	}
}

/**
 * The current, total execution time for the Teddy protagonist animation
 *  that is presently active
 *
 * @return {Number} Current, total execution time for the animation (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.currentAnimationRunningTime = function () {
	return this.totalElapsedSceneTimeMs - this.currentTeddyProtagonistAnimationStartTimeMs;
}

MainToyAbandonmentGameplayScene.prototype.setupTeddyProtagonistModelAnimationCurves = function (
	animationType) {
		
	if (Utility.validateVar(animationType)) {
		switch (animationType) {
			case this.constTeddyProtagonistAnimationTypeStationary:
				this.setupTeddyProtagonistModelStationaryAnimationCurves();
				break;
			case this.constTeddyProtagonistAnimationTypeAmbulation:
				this.setupTeddyProtagonistModelAmbulationAnimationCurves();
				break;
			case this.constTeddyProtagonistAnimationTypeDamageReception:
				this.setupTeddyProtagonistModelDamageReceptionAnimationCurves();
				break;
			case this.constTeddyProtagonistAnimationGameEnd:
				this.setupTeddyProtagonistModelGameEndAnimationCurves();
			default:
				break;
		}
	}
}

/**
 * Sets per-limb, time-based animation curves for the
 *  "stationary" animation
 */
MainToyAbandonmentGameplayScene.prototype.setupTeddyProtagonistModelStationaryAnimationCurves = function () {
	// Linear "curve" - no slope, as the model does not change for a stationary pose;
	// no rotation.
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistHead] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistTorso] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftArm] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightArm] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftLeg] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightLeg] = new LinearCurve(0.0, 0.0, 0.0);

	this.compositeTeddyLongitudinalTiltAngleEvaluator = new LinearCurve(0.0, 0.0, 0.0);
}

/**
 * Sets per-limb, time-based animation curves for the
 *  ambulation animation
 */
MainToyAbandonmentGameplayScene.prototype.setupTeddyProtagonistModelAmbulationAnimationCurves = function () {
	var ambulationPeriodMs = 1000.0;
	var armSwingAngleRad = Math.PI / 4.0;
	var legSwingAngleRad = Math.PI / 5.0;
	var headSwayAngleRad = Math.PI / 50.0;
	
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistHead] =
		new SineCurve(-headSwayAngleRad, ambulationPeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistTorso] =
		new SineCurve(0.0, ambulationPeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftArm] =
		new SineCurve(-armSwingAngleRad, ambulationPeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightArm] =
		new SineCurve(armSwingAngleRad, ambulationPeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftLeg] =
		new SineCurve(legSwingAngleRad, ambulationPeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightLeg] =
		new SineCurve(-legSwingAngleRad, ambulationPeriodMs, 0.0, 0.0);

	this.compositeTeddyLongitudinalTiltAngleEvaluator = new LinearCurve(0.0, 0.0, 0.0);
}

/**
 * Sets per-limb, time-based animation curves for the
 *  damage reception animation
 */
MainToyAbandonmentGameplayScene.prototype.setupTeddyProtagonistModelDamageReceptionAnimationCurves = function () {
	var damageResponsePeriodMs = 300.0;
	var armSwingAngleRad = Math.PI / 4.0;
	var legSwingAngleRad = Math.PI / 4.0;
	var headSwayAngleRad = Math.PI / 25.0;
	var armPhaseShiftAngleRad = Math.PI * 1.5;
	
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistHead] =
		new SineCurve(-headSwayAngleRad, damageResponsePeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistTorso] =
		new SineCurve(0.0, damageResponsePeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftArm] =
		new SineCurve(-armSwingAngleRad, damageResponsePeriodMs, 0.0, armPhaseShiftAngleRad);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightArm] =
		new SineCurve(armSwingAngleRad, damageResponsePeriodMs, 0.0, armPhaseShiftAngleRad);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftLeg] =
		new SineCurve(legSwingAngleRad, damageResponsePeriodMs, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightLeg] =
		new SineCurve(-legSwingAngleRad, damageResponsePeriodMs, 0.0, 0.0);
	
	this.compositeTeddyLongitudinalTiltAngleEvaluator = new SineCurve(-Math.PI / 4.0,
		this.constDamageReceptionAnimationDurationMs * 2.0, 0.0, 0.0, 0.0);
}

/**
 * Sets per-limb, time-based animation curves for the
 *  "game-over" pose animation
 */
MainToyAbandonmentGameplayScene.prototype.setupTeddyProtagonistModelGameEndAnimationCurves = function() {	
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistHead] = new LinearCurve(this.gameEndHeadTiltAngleRateRadMs, 0.0, this.gameEndAnimationDurationMs);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistTorso] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftArm] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightArm] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistLeftLeg] = new LinearCurve(0.0, 0.0, 0.0);
	this.modelPosePivotAngleEvaluatorKeyValStore[globalResources.keyModelTeddyProtagonistRightLeg] = new LinearCurve(0.0, 0.0, 0.0);

	this.compositeTeddyLongitudinalTiltAngleEvaluator = new LinearCurve(0.0, 0.0, 0.0);	
}

/**
 * Determines the immediate animation type, and applies the
 *  associated animation-type specifier to the internally-
 *  stored attribute
 */
MainToyAbandonmentGameplayScene.prototype.resolveTeddyProtagonistAnimationType = function () {
	var animationType = this.resolveTeddyProtagonistAnimationTypeByContext()
	this.setTeddyProtagonistAnimationType(animationType);
}

/**
 * Updates the current animation type, based on the immediate
 *  game state
 */
MainToyAbandonmentGameplayScene.prototype.updateTeddyProtagonistAnimationStates = function () {
	switch(this.currentTeddyProtagonistAnimationType) {
		case this.constTeddyProtagonistAnimationTypeStationary:
			break;
		case this.constTeddyProtagonistAnimationTypeAmbulation:
			break;
		case this.constTeddyProtagonistAnimationTypeDamageReception:
			break;
		default:
			break;
	}
	
	if (this.teddyProtagonistIsInvulnerable) {
		if (this.framesRenderedSinceLastInvulnerabilityFrame >= this.invulnerabilityFrameRenderInterval) {
			this.framesRenderedSinceLastInvulnerabilityFrame = 0;
		}
		else {
			this.framesRenderedSinceLastInvulnerabilityFrame++;
		}
	}	
}

/**
 * Performs all animation management activities.
 */
MainToyAbandonmentGameplayScene.prototype.processTeddyProtagonistAnimations = function () {
	this.resolveTeddyProtagonistAnimationType();
	this.updateTeddyProtagonistAnimationStates();
}

/**
 * Determines the dimensions of a render-space bounding cube that is
 *  derived from a provided set of vertices.
 *
 * @param modelVertexData {ObjFormatBufferParserUtility.ModelVertexDataContainer} Object which encapsulates a
 *                                                                                collection of vertices
 */
MainToyAbandonmentGameplayScene.prototype.modelDimensionsFromModelVertexData = function (modelVertexData) {
	var modelDimensions = new ModelDimensions();
		
	if (Utility.validateVarAgainstType(modelVertexData, ObjFormatBufferParserUtility.ModelVertexDataContainer)) {	
		modelDimensions.dimensionX = modelVertexData.modelDimensionX;
		modelDimensions.dimensionY = modelVertexData.modelDimensionY;
		modelDimensions.dimensionZ = modelVertexData.modelDimensionZ;
	}
	
	return modelDimensions;
}

/**
 * Attempts to locate a timer that has the provided identifier
 *
 * @param timerId {String} Identifier to be matched to an existing timer
 *
 * @return {ExternalSourceTimer} Timer with the specified identifier
 *                               upon success, null otherwise
 */
MainToyAbandonmentGameplayScene.prototype.timerWithId = function (timerId) {
	var timer = null;
	
	if (Utility.validateVar(timerId)) {
		var currentTimerIndex = 0;
		
		while ((currentTimerIndex < this.activeTimers.length) && (timer === null)) {
			if (this.activeTimers[currentTimerIndex].identifier ===
				timerId) {
					
				timer = this.activeTimers[currentTimerIndex];					
			}
			
			currentTimerIndex++;
		}
	}

	return timer;	
}

/**
 * Determines if a timer with the provided identifier exists
 *
 * @param timerId {String} Identifier to be matched to an existing timer
 *
 * @return {Boolean} True if a timer with the provided identifier
 *                   exists
 */
MainToyAbandonmentGameplayScene.prototype.timerWithIdExists = function (timerId) {
	var timerExists = false;
	
	if (Utility.validateVar(timerId)) {
		timerExists = this.timerWithId(timerId) != null;
	}

	return timerExists;
}

/**
 * Updates the collection of externally-driven timers
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.updateActiveTimers = function (timeQuantum) {
	var currentTimerIndex = 0;
	
	while (currentTimerIndex < this.activeTimers.length) {
		var currentItemExpired = false;
		if (Utility.validateVarAgainstType(this.activeTimers[currentTimerIndex], ExternalSourceTimer)) {
	
			this.activeTimers[currentTimerIndex].invokeTimerUpdate(timeQuantum);
			currentItemExpired = this.activeTimers[currentTimerIndex].isExpired()
			if (currentItemExpired) {
				this.activeTimers.splice(currentTimerIndex, 1);
			}
		}
		
		if (!currentItemExpired) {
			currentTimerIndex++;
		}
	}
}

/**
 * Updates various teddy protagonist state information attributes (position, render state, etc.)
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.updateStateInformationForTeddyProtagonist = function (timeQuantum) {
	this.processTeddyProtagonistAnimations();
	this.updateTeddyProtagonistComponentMatrices();
	if (this.isInActiveOperationState()) {
		this.updateTeddyProtagonistPositionalAttributes(timeQuantum);
		this.evaluateTeddyProtagonistGoalAreaCollisions();	
		this.evaluateTeddyProtagonistTileContactDamage();
		this.evaluateTeddyProtagonistEnemyContactDamage();
		this.applyTimeBasedTeddyProtagonistHealthDecrease(timeQuantum);
	}
}

/**
 * Updates the position/velocity of a dynamic object
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param dynamicObjectInstanceData {DynamicItemInstanceData/EnemyInstanceData} Dynamic object instance data
 */
MainToyAbandonmentGameplayScene.prototype.updateDynamicObjectPositionalAttributes = function (timeQuantum, dynamicObjectInstanceData) {	
	var elementRenderSpaceBoundingRect = this.determineDynamicElementBoundingRectangle(dynamicObjectInstanceData);
	
	// Dynamic object velocity is specified in meters/second - convert to meters / millisecond.
	var wallCollisionInfo = this.evaluateWallCollisionsWithBoundingRect(timeQuantum,
		dynamicObjectInstanceData.modelWorldSpacePosition,
		new Vector3d(dynamicObjectInstanceData.velocityVector.xComponent / Constants.millisecondsPerSecond,
			dynamicObjectInstanceData.velocityVector.yComponent / Constants.millisecondsPerSecond,
			dynamicObjectInstanceData.velocityVector.zComponent / Constants.millisecondsPerSecond),
		elementRenderSpaceBoundingRect);
			
	this.updateDynamicObjectPosition(timeQuantum, dynamicObjectInstanceData, wallCollisionInfo);
	this.updateDynamicObjectVelocity(timeQuantum, dynamicObjectInstanceData, wallCollisionInfo);	
}

/**
 * Updates the position of a single dynamic object
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param dynamicObjectInstanceData {DynamicItemInstanceData/EnemyInstanceData} Dynamic object instance data
 * @param wallCollisionInfo {Array} Collection of DynamicRectIntersectionInfo objects which describe
 *                                  impending wall collisions
 */
MainToyAbandonmentGameplayScene.prototype.updateDynamicObjectPosition = function (timeQuantum, dynamicObjectInstanceData, wallCollisionInfo) {
	var soonestWallCollisionAxisX = this.findSoonestWallCollision(timeQuantum, this.xAxisWallCollisions(wallCollisionInfo));
	var soonestWallCollisionAxisY = this.findSoonestWallCollision(timeQuantum, this.yAxisWallCollisions(wallCollisionInfo));
	var elementRenderSpaceBoundingRect = this.determineDynamicElementBoundingRectangle(dynamicObjectInstanceData);
	
	var xCoord = 0.0
	
	if ((soonestWallCollisionAxisX != null) && (soonestWallCollisionAxisX.timeToIntersection <= timeQuantum)) {
		xCoord = this.renderSpaceLengthToWorldSpaceLength(soonestWallCollisionAxisX.clampedCoordValue +
			(soonestWallCollisionAxisX.intersectionEdge === RectIntersectionEdge.constEdgeLeft ?
			-elementRenderSpaceBoundingRect.width / 2.0 :
			elementRenderSpaceBoundingRect.width / 2.0));
	}
	else {
		xCoord = dynamicObjectInstanceData.modelWorldSpacePosition.xCoord +
			(dynamicObjectInstanceData.velocityVector.xComponent * timeQuantum / Constants.millisecondsPerSecond);
	}
			
	var yCoord = 0.0
	if ((soonestWallCollisionAxisY != null) && (soonestWallCollisionAxisY.timeToIntersection <= timeQuantum)) {
		yCoord = this.renderSpaceLengthToWorldSpaceLength(soonestWallCollisionAxisY.clampedCoordValue +
			(soonestWallCollisionAxisY.intersectionEdge === RectIntersectionEdge.constEdgeTop ?
			elementRenderSpaceBoundingRect.height / 2.0 :
			-elementRenderSpaceBoundingRect.height / 2.0));
	}
	else {
		yCoord = dynamicObjectInstanceData.modelWorldSpacePosition.yCoord +=
			(dynamicObjectInstanceData.velocityVector.yComponent * timeQuantum / Constants.millisecondsPerSecond);
	}

	dynamicObjectInstanceData.modelWorldSpacePosition = new Point3d(
		xCoord,
		yCoord,
		dynamicObjectInstanceData.modelWorldSpacePosition.zCoord +
			(dynamicObjectInstanceData.velocityVector.zComponent * timeQuantum / Constants.millisecondsPerSecond));
}

/**
 * Updates the velocity of a single dynamic object
 * 
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param dynamicObjectInstanceData {DynamicItemInstanceData/EnemyInstanceData} Dynamic object instance data
 * @param wallCollisionInfo {Array} Collection of DynamicRectIntersectionInfo objects which describe
 *                                  impending wall collisions
 */
MainToyAbandonmentGameplayScene.prototype.updateDynamicObjectVelocity = function (timeQuantum, dynamicObjectInstanceData, wallCollisionInfo) {
	var soonestWallCollisionAxisX = this.findSoonestWallCollision(timeQuantum, this.xAxisWallCollisions(wallCollisionInfo));
	var soonestWallCollisionAxisY = this.findSoonestWallCollision(timeQuantum, this.yAxisWallCollisions(wallCollisionInfo));
	
	if ((soonestWallCollisionAxisX !== null) && (soonestWallCollisionAxisX.timeToIntersection <= timeQuantum)) {
		dynamicObjectInstanceData.velocityVector.xComponent *= -1.0;
	}
	
	if ((soonestWallCollisionAxisY !== null) && soonestWallCollisionAxisY.timeToIntersection <= timeQuantum) {
		dynamicObjectInstanceData.velocityVector.yComponent *= -1.0;		
	}
}


/**
 * Updates state information (position, etc.) for dynamic
 *  objects 
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.updateStateInformationForDynamicObjects = function (timeQuantum) {	
	for (currentEnemyInstance of this.enemyInstanceDataCollection) {
		this.updateDynamicObjectPositionalAttributes(timeQuantum, currentEnemyInstance);
	}
	
	for (currentGoalObjectInstance of this.goalMarkerInstanceDataCollection) {
		this.updateDynamicObjectPositionalAttributes(timeQuantum, currentGoalObjectInstance);
	}
}


/**
 * Updates state information for all world objects (enemy items/dynamic items,
 *  teddy bear protagonist)
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.updateStateInformationForWorldObjects = function (timeQuantum) {
	this.updateStateInformationForTeddyProtagonist(timeQuantum);
	this.updateStateInformationForDynamicObjects(timeQuantum);
}


MainToyAbandonmentGameplayScene.prototype.updateStateInformationForLevel = function (timeQuantum) {
	this.updateScrollOffset();
}

/**
 * The determine if the game is in a non-completion, non-paused,
 *  active state
 *
 * @return True if the game is immediately in an active state
 */
MainToyAbandonmentGameplayScene.prototype.isInActiveOperationState = function () {
	return this.operationState === this.constOperationStateActive;
}

MainToyAbandonmentGameplayScene.prototype.isInterLevelPauseState = function () {
	return (this.operationState === this.constOperationStateInterLevelPause);
}

/**
 * Determines if the game has recently concluded unsuccessfully
 *
 * @return {Boolean} True if a game over state is active
 */
MainToyAbandonmentGameplayScene.prototype.isInGameOverState = function () {
	return (!this.isInActiveOperationState() && (this.teddyProtagonistCurrentHealth <= 0.0));
}

/**
 * Determines if the game has been successfully completed
 *
 * @return {Boolean} True if the game has been successfully completed
 */
MainToyAbandonmentGameplayScene.prototype.isInGameCompletionState = function () {
	var finalLevelCompleted = (this.operationState === this.constOperationStateInterLevelPause) &&
		(this.currentLevelIndex >= (this.levelKeyCollection.length - 1));
	
	return (!this.isInActiveOperationState() && finalLevelCompleted &&
		(this.teddyProtagonistCurrentHealth > 0));
}

/**
 * Applies a game operational state specifier
 */
MainToyAbandonmentGameplayScene.prototype.setOperationState = function (newOperationState) {
	if (Utility.validateVar(newOperationState)) {
		this.operationState = newOperationState;
	}
}

/**
 * Resolves/updates the internal game operational state,
 *  based upon the current values of various internally-
 *  maintained factors
 */
MainToyAbandonmentGameplayScene.prototype.updateGameState = function (timeQuantum, targetCanvasContext) {
	if (this.operationState === this.constOperationStateActive) {
		if (this.teddyProtagonistCurrentHealth <= 0.0) {
			this.setOperationState(this.constOperationStateInactive);
		}
	}
	else if (this.operationState === this.constOperationStateInterLevelPause) {
		if (this.currentLevelIndex < (this.levelKeyCollection.length - 1)) {
			this.invokeNextLevelTransition();
		}		
	}
	else if (this.operationState === this.constOperationStateInterLevelPauseCompletion) {
		this.setupNewLevelState(this.currentLevelIndex + 1);
		this.invokeLevelTransitionContinuation();
	}
}

/**
 * Initiates a transition event between the current
 *  level and the next level
 */
MainToyAbandonmentGameplayScene.prototype.invokeNextLevelTransition = function () {
	if (!this.timerWithIdExists(this.constTimerIdNextLevelTransitionEvent)) {	
		var sceneInstance = this;
		this.activeTimers.push(new ExternalSourceTimer(
			this.constFadeTransitionDurationMs,
			function () {
				sceneInstance.setOperationState(sceneInstance.constOperationStateInterLevelPauseCompletion);
			},
			this.constTimerIdNextLevelTransitionEvent,
			function () {
			})
		);
	}
}

/**
 * Continuation of the transition event invoked from a
 *  previous level
 *
 * @see MainToyAbandonmentGameplayScene.invokeNextLevelTransition()
 */
MainToyAbandonmentGameplayScene.prototype.invokeLevelTransitionContinuation = function () {
	if (!this.timerWithIdExists(this.constTimerIdLevelTransitionContinuationEvent)) {
		this.teddyProtagonistIsInvulnerable = true;
		
		var sceneInstance = this;
		this.activeTimers.push(new ExternalSourceTimer(
			this.constFadeTransitionDurationMs,
			function () {				
			},
			this.constTimerIdLevelTransitionContinuationEvent,
			function () {
			})
		);
	}
}

/** 
 * Determines if a fade transition operation is in progress
 *
 * @return {Boolean} True if a fade transition operation is in
 *                   progress
 */
MainToyAbandonmentGameplayScene.prototype.isFadeTransitionInProgress = function () {
	return this.timerWithIdExists(this.constTimerIdNextLevelTransitionEvent) ||
		this.timerWithIdExists(this.constTimerIdLevelTransitionContinuationEvent) ||
		(this.operationState === this.constOperationStateInterLevelPauseCompletion);
}

/**
 * Updates the internal timer employed to maintain the overlay refresh interval
 *
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 */
MainToyAbandonmentGameplayScene.prototype.updateOverlayRefreshInterval = function(timeQuantum) {
	if (this.currentOverlayUpdateElapsedInterval < this.constOverlayUpdateIntervalMs) {
		this.currentOverlayUpdateElapsedInterval += timeQuantum;
	}
	else {
		this.currentOverlayUpdateElapsedInterval = 0;
	}
}

/**
 * Determines if overlay data should be updated, based upon internal factors
 *  (e.g. current overlay time counter)
 */
MainToyAbandonmentGameplayScene.prototype.shouldUpdateOverlay = function() {
	return this.currentOverlayUpdateElapsedInterval >= this.constOverlayUpdateIntervalMs;
}

/**
 * Renders the text buffer output to a specified canvas context
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param staticTextBuffer {StaticTextLineCanvasBuffer} Object that is used to store the rendered
 *                                                      text representation
 * @param coordX {Number} The starting location of the text along the X-axis within the
 *                        output texture
 * @param targetCanvasContext {CanvasRenderingContext2D} The output canvas context
 *                                                       to which the text buffer
 *                                                       will be rendered
 * @param targetTexture {WebGLTexture} The texture in which the buffer will be finally store
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context used for
 *                                                     writing the final output into a texture
 * @param drawBackground {Boolean} When set to true, a solid background will be drawn
 *                                 before the text is drawn.
 */
MainToyAbandonmentGameplayScene.prototype.renderStaticTextBufferToTexture = function(timeQuantum, staticTextBuffer, coordX,
																				   targetCanvasContext, targetTexture,
																				   webGlCanvasContext, drawBackground) {
				
	if (Utility.validateVar(timeQuantum) && Utility.validateVarAgainstType(staticTextBuffer, StaticTextLineCanvasBuffer) &&
		Utility.validateVar(targetCanvasContext) && Utility.validateVar(webGlCanvasContext) &&
		Utility.validateVar(targetTexture)) {
			
		// Clear the background of the area where the text will be rendered...
		targetCanvasContext.clearRect(coordX, 0, staticTextBuffer.requiredRenderingCanvasWidth(),
			staticTextBuffer.requiredRenderingCanvasHeight());
	
		// Draw a background strip in order to enhance readability.
		if (Utility.validateVar(drawBackground) && drawBackground) {
			targetCanvasContext.save();
			targetCanvasContext.fillStyle = this.defaultTextAreaBackgroundColor.getRgbaIntValueAsStandardString();
			
			targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, staticTextBuffer.getTextAreaHeight());
				
			targetCanvasContext.restore();
		}
		
		staticTextBuffer.renderText(targetCanvasContext, coordX, 0);
	
		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Renders a representation of the immediate spirit gauge level into
 *  the provided canvas context
 *
 * @param targetCanvasContext {CanvasRenderingContext2D}  Canvas into which the spirit gauge will
 *                                                        be rendered
 * @param spiritGaugeWidth {Number} The width of the spirit gauge
 * @param spiritGaugeHeight {Number} The height of the spirit gauge
 * @param spiritGaugeOffsetX {Number} The gauge offset from the left edge of the screen
 */
MainToyAbandonmentGameplayScene.prototype.updateSpiritGaugeMagnitudeRepresentation = function (targetCanvasContext,
																							  spiritGaugeWidth,
																							  spiritGaugeHeight,
																							  spiritGaugeOffsetX) {

	if (Utility.validateVar(targetCanvasContext) && Utility.validateVar(spiritGaugeWidth) &&
		Utility.validateVar(spiritGaugeHeight) && Utility.validateVar(spiritGaugeOffsetX)) {

		var spiritGaugeBorderSizeX = 5;
		var spiritGaugeBorderSizeY = 4;
		
		var gaugeSegmentSpacing = 3;
		var gaugeSegmentWidth = 7;

		// Erase the existing spirit gauge rendering.
		targetCanvasContext.fillStyle = this.constCanvasClearColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(spiritGaugeOffsetX + this.constOverlayTextLeftMargin, 0, spiritGaugeWidth,
			spiritGaugeHeight);
			
		targetCanvasContext.strokeStyle = this.constSpiritGaugeOutlineColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.strokeRect(spiritGaugeOffsetX + this.constOverlayTextLeftMargin, 0, spiritGaugeWidth,
			spiritGaugeHeight);

		spiritValueForGaugeDisplay = Math.max(Math.min(this.teddyProtagonistCurrentHealth, this.constTeddyProtagonistMaxHealth),
			this.constTeddyProtagonistMinHealth);
		var spiritValueFraction = (spiritValueForGaugeDisplay - this.constTeddyProtagonistMinHealth) /
			(this.constTeddyProtagonistMaxHealth - this.constTeddyProtagonistMinHealth);

		var innerGaugeLeftCoord = spiritGaugeOffsetX + this.constOverlayTextLeftMargin + spiritGaugeBorderSizeX +
			Math.floor(gaugeSegmentSpacing / 2.0);
		var innerGaugeMaxWidth = spiritGaugeWidth - (2 * spiritGaugeBorderSizeX);
		var innerGaugeWidth = Math.max(0.0, (Math.floor((spiritGaugeWidth - (2 * spiritGaugeBorderSizeX)) * spiritValueFraction)));
		
		var gaugeSegmentCount = Math.ceil(innerGaugeWidth / (gaugeSegmentSpacing + gaugeSegmentWidth));
		var maxGaugeSegmentCount = Math.ceil(innerGaugeMaxWidth / (gaugeSegmentSpacing + gaugeSegmentWidth));
		
		for (var currentSegmentIndex = 0; currentSegmentIndex < gaugeSegmentCount; currentSegmentIndex++) {
			var colorWeight = Math.pow(currentSegmentIndex / (maxGaugeSegmentCount - 1), 0.5);
			var gaugeColor = this.constSpiritGaugeMinValueColor.blendWithUnitWeight(this.constSpiritGaugeMaxValueColor,
				colorWeight);
			targetCanvasContext.fillStyle = gaugeColor.getRgbaIntValueAsStandardString();
			var segmentLeadingEdgeX = innerGaugeLeftCoord + ((gaugeSegmentSpacing + gaugeSegmentWidth) * currentSegmentIndex);
			targetCanvasContext.fillRect(segmentLeadingEdgeX, spiritGaugeBorderSizeY, gaugeSegmentWidth,
				spiritGaugeHeight - (2 * spiritGaugeBorderSizeY));
		}
	}
}

/**
 * Renders the Spirit meter overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderSpiritGaugeOverlay = function(timeQuantum, targetCanvasContext) {
	var spiritGaugeOverlayTexture = globalResources.getGaugeOverlayTexture();
	if (this.shouldUpdateOverlay()) {
		var gaugeOverlayCanvasContext = globalResources.getGaugeOverlayCanvasContext();
		var spiritGaugeHeightDifference = 5;
		var spiritGaugeHeight = gaugeOverlayCanvasContext.canvas.height - spiritGaugeHeightDifference;
		var spiritLabelTrailingMargin = 10.0;
		
		gaugeOverlayCanvasContext.clearRect(0, 0, gaugeOverlayCanvasContext.canvas.width,
			gaugeOverlayCanvasContext.canvas.height);
		this.updateSpiritGaugeMagnitudeRepresentation(gaugeOverlayCanvasContext, this.constSpiritGaugeWidth,
			spiritGaugeHeight, this.spiritLabelCanvasBuffer.requiredRenderingCanvasWidth() + spiritLabelTrailingMargin)		
		this.renderStaticTextBufferToTexture(timeQuantum, this.spiritLabelCanvasBuffer, this.constOverlayTextLeftMargin,
			gaugeOverlayCanvasContext, spiritGaugeOverlayTexture, targetCanvasContext, true);
	}
	
	var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(	
		this.gaugeOverlayRenderWebGlData, this.shaderStandardOverlayTextureRender);
	
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
	var webGlAttributeData = this.getDefaultWebGlAttributeData();
	WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, this.identityMatrixStore,
		spiritGaugeOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
}

MainToyAbandonmentGameplayScene.prototype.renderDynamicElements = function(timeQuantum, targetCanvasContext) {
	var goalBaseMatrix = this.modelMatrixKeyValStore[globalResources.keyModelStar];
	var goalRotationMatrix =
		MathUtility.generateRotationMatrix3dAxisZ(this.goalItemRotationRate * this.totalElapsedSceneTimeMs).multiply(
		goalBaseMatrix);
	this.renderDynamicElementCollection(timeQuantum, targetCanvasContext, this.goalMarkerInstanceDataCollection,
		goalRotationMatrix);
	this.renderDynamicElementCollection(timeQuantum, targetCanvasContext, this.enemyInstanceDataCollection);
}

/**
 * Determines the immediate completion fraction of an
 *  active "fade to black" transition
 *
 * @return {Number} Fade to black transition completion fraction
 *                  (0.0 if no transition is in progress)
 */
MainToyAbandonmentGameplayScene.prototype.getBlackFadeFraction = function () {
	var fadeFraction = 0.0;
	
	if (this.timerWithIdExists(this.constTimerIdNextLevelTransitionEvent)) {
		// Fade out
		var levelTransitionTimer = this.timerWithId(this.constTimerIdNextLevelTransitionEvent);
		
		fadeFraction = (levelTransitionTimer.elapsedTimeMs / levelTransitionTimer.targetDurationMs);
	}
	else if (this.timerWithIdExists(this.constTimerIdLevelTransitionContinuationEvent)) {
		// Fade in
		var levelTransitionTimer = this.timerWithId(this.constTimerIdLevelTransitionContinuationEvent);
		
		fadeFraction = 1.0 - (levelTransitionTimer.elapsedTimeMs / levelTransitionTimer.targetDurationMs);		
	}
	else if (this.operationState === this.constOperationStateInterLevelPauseCompletion) {
		fadeFraction = 1.0;
	}
	
	return fadeFraction;
}

/**
 * Clears the flags which indicate whether or not pre-generated overlay
 *  texture content has been generated
 */
MainToyAbandonmentGameplayScene.prototype.clearOverlayContentGenerationFlags = function () {
	this.gameEndOverlayContentHasBeenGenerated = false;
	this.fadeOverlayContentHasBeenGenerated = false;
	this.gameCompletionOverlayContentHasBeenGenerated = false;
}

/**
 * Generates contents of the texture that will be used within the
 *  fade to black overlay implementation
 */
MainToyAbandonmentGameplayScene.prototype.generateFadeOverlayContent = function(webGlCanvasContext,
																			   targetCanvasContext,
																			   targetTexture) {
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(targetTexture)) {
			
		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);

		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Generates the content to be rendered within the full-screen overlay at the end of the
 *  game (failure)
 *
 * @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                   to a WebGL display buffer
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context used to render the full-screen
 *                                                       overlay at the end of the game
 * @param targetTexture {WebGLTexture} Texture into which the data will finally be stored
 */
MainToyAbandonmentGameplayScene.prototype.generateGameEndOverlayContent = function(webGlCanvasContext,
																				   targetCanvasContext,
																				   targetTexture) {
																						
	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(targetTexture)) {

		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		targetCanvasContext.fillStyle = this.gameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		
		var gameOverTextBuffer = new StaticTextLineCanvasBuffer(Constants.gameOverFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		gameOverTextBuffer.updateStaticTextString(Constants.stringGameOver);
		
		var happyHolidaysTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		happyHolidaysTextBuffer.updateStaticTextString(Constants.messageText);
		
		var retryInstructionsTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		retryInstructionsTextBuffer.updateStaticTextString(Constants.stringSpaceTapToRetry);

		var topCoord = (targetCanvasContext.canvas.height - (gameOverTextBuffer.requiredRenderingCanvasHeight() + 
			happyHolidaysTextBuffer.requiredRenderingCanvasHeight())) / 2.0;
		var gameOverLeftCoord = (targetCanvasContext.canvas.width - gameOverTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var happyHolidaysLeftCoord = (targetCanvasContext.canvas.width - happyHolidaysTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var retryInstructionsLeftCoord = (targetCanvasContext.canvas.width - retryInstructionsTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var retryInstructionsBottomMargin = 20.0;

		gameOverTextBuffer.renderText(targetCanvasContext, gameOverLeftCoord, topCoord);
		happyHolidaysTextBuffer.renderText(targetCanvasContext, happyHolidaysLeftCoord,
			topCoord + gameOverTextBuffer.requiredRenderingCanvasHeight());		
		retryInstructionsTextBuffer.renderText(targetCanvasContext, retryInstructionsLeftCoord,
			targetCanvasContext.canvas.height - (retryInstructionsTextBuffer.requiredRenderingCanvasHeight() +
			retryInstructionsBottomMargin));

		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Generates the content to be rendered within the full-screen overlay at the successful
 *  completion of the game
 *
 * @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                   to a WebGL display buffer
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context used to render the full-screen
 *                                                       overlay at the successful completion of the
 *                                                       game
 * @param targetTexture {WebGLTexture} Texture into which the data will finally be stored
 */
MainToyAbandonmentGameplayScene.prototype.generateCompletionOverlayContent = function(webGlCanvasContext,
																			    	 targetCanvasContext,
																				     targetTexture) {

	if (Utility.validateVar(webGlCanvasContext) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(targetTexture)) {
			
		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		targetCanvasContext.fillStyle = this.gameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
				
		var gameCompletionTextBuffer = new StaticTextLineCanvasBuffer(Constants.gameCompletedFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		gameCompletionTextBuffer.updateStaticTextString(Constants.stringGameCompleted);
		
		var gameCompletionDetailTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		gameCompletionDetailTextBuffer.updateStaticTextString(Constants.stringGameCompletedDetail);
		
		var happyHolidaysTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		happyHolidaysTextBuffer.updateStaticTextString(Constants.messageText);		

		var totalRequiredTextHeight = gameCompletionTextBuffer.requiredRenderingCanvasHeight() +
			gameCompletionDetailTextBuffer.requiredRenderingCanvasHeight() + 
			happyHolidaysTextBuffer.requiredRenderingCanvasHeight();
		var topCoord = (targetCanvasContext.canvas.height - totalRequiredTextHeight) / 2.0;
		
		var gameCompletionLeftCoord = (targetCanvasContext.canvas.width - gameCompletionTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var gameCompletionDetailLeftCoord = (targetCanvasContext.canvas.width - gameCompletionDetailTextBuffer.requiredRenderingCanvasWidth()) / 2.0;			
		var happyHolidaysLeftCoord = (targetCanvasContext.canvas.width - happyHolidaysTextBuffer.requiredRenderingCanvasWidth()) / 2.0;

		gameCompletionTextBuffer.renderText(targetCanvasContext, gameCompletionLeftCoord, topCoord);
		gameCompletionDetailTextBuffer.renderText(targetCanvasContext, gameCompletionDetailLeftCoord,
			topCoord + gameCompletionTextBuffer.requiredRenderingCanvasHeight());
		happyHolidaysTextBuffer.renderText(targetCanvasContext, happyHolidaysLeftCoord,
			topCoord + gameCompletionTextBuffer.requiredRenderingCanvasHeight() +
			2.0 * gameCompletionDetailTextBuffer.requiredRenderingCanvasHeight());
			
		WebGlUtility.updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);			
	}
}

/**
 * Renders the overlays which are purposed for indicating the
 *  directional influence which the current set of inputs
 *  applies to the Teddy protagonist (touch inputs)
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderInputIndicatorOverlays = function(timeQuantum, targetCanvasContext) {
	if (this.isInActiveOperationState()) {
	
		var identityMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		identityMatrix.setToIdentity();
	
		var constTextureKeyIndex = 0;
		var constOverlayGeometryIndex = 1;
		var constOverlayAlphaIndex = 2;		
	
		var inputIndicatorOverlayData =
		[
			[ globalResources.keyTextureUpChevron, 		this.upInputIndicatorOverlay, 		this.upIndicatorOverlayAlpha],
			[ globalResources.keyTextureDownChevron,	this.downInputIndicatorOverlay, 	this.downIndicatorOverlayAlpha],
			[ globalResources.keyTextureLeftChevron,	this.leftInputIndicatorOverlay, 	this.leftIndicatorOverlayAlpha],
			[ globalResources.keyTextureRightChevron,	this.rightInputIndicatorOverlay, 	this.rightIndicatorOverlayAlpha],
		];

		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();
		
		for (var currentOverlay of inputIndicatorOverlayData) {
			var texture = globalResources.textureKeyValueStore[currentOverlay[constTextureKeyIndex]];
			var opacity = currentOverlay[constOverlayAlphaIndex];
			
			function opacityUniformSetup(shaderProgram) {
				var opacityUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "opacity");
				targetCanvasContext.uniform1f(opacityUniformLocation, opacity);
			}
		
			var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
				currentOverlay[constOverlayGeometryIndex], this.shaderStandardTexturedObjectOpacity);
			WebGlUtility.renderGeometry(overlayRenderWebGlData, identityMatrix, this.identityMatrixStore,
				texture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
				opacityUniformSetup);
		}
	}
}

/**
 * Renders the "Game Over" overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderGameEndOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.isInGameOverState()) {
		if (!this.gameEndOverlayContentHasBeenGenerated) {
			this.clearOverlayContentGenerationFlags();
			var gameEndOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
			var gameEndOverlayTexture = globalResources.getFullScreenOverlayTexture();
			this.generateGameEndOverlayContent(targetCanvasContext, gameEndOverlayCanvasContext,
				gameEndOverlayTexture);
			this.gameEndOverlayContentHasBeenGenerated = true;
		}
		
		var fullScreenOverlayTexture = globalResources.getFullScreenOverlayTexture();
		var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.fullScreenOverlayWebGlData, this.shaderStandardOverlayTextureRender);
		
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();		
		WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, this.identityMatrixStore,
			fullScreenOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
	}
}

/**
 * Renders the overlay that indicates successfully completion of the game
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderGameCompletionOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.isInGameCompletionState()) {
		if (!this.gameCompletionOverlayContentHasBeenGenerated) {
			this.clearOverlayContentGenerationFlags();
			var gameCompletionOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
			var gameCompletionOverlayTexture = globalResources.getFullScreenOverlayTexture();
			this.generateCompletionOverlayContent(targetCanvasContext, gameCompletionOverlayCanvasContext,
				gameCompletionOverlayTexture);
			this.gameCompletionOverlayContentHasBeenGenerated = true;		
			
		}

		var fullScreenOverlayTexture = globalResources.getFullScreenOverlayTexture();
		var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.fullScreenOverlayWebGlData, this.shaderStandardOverlayTextureRender);
			
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();		
		WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, this.identityMatrixStore,
			fullScreenOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData);
		}
}

/**
 * Renders the overlay used to employ a "fade" transition
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderFadeOverlay = function(timeQuantum, targetCanvasContext) {
	if (this.isFadeTransitionInProgress()) {
		var fadeOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
		
		if (!this.fadeOverlayContentHasBeenGenerated) {
			this.clearOverlayContentGenerationFlags();
			var fadeOverlayTexture = globalResources.getFullScreenOverlayTexture();
			this.generateFadeOverlayContent(targetCanvasContext, fadeOverlayCanvasContext,
				fadeOverlayTexture);
			this.fadeOverlayContentHasBeenGenerated = true;
		}
		
		var fullScreenOverlayTexture = globalResources.getFullScreenOverlayTexture();
		var overlayRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.fullScreenOverlayWebGlData, this.shaderBlackFader);
		
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();
		
		var fadeFraction = this.getBlackFadeFraction();
		function fadeUniformSetupFadeFraction(shaderProgram) {
			var fadeFractionUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "fadeFraction");
				targetCanvasContext.uniform1f(fadeFractionUniformLocation, fadeFraction);
		}
		
		WebGlUtility.renderGeometry(overlayRenderWebGlData, transformationMatrix, this.identityMatrixStore,
			fullScreenOverlayTexture, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
			fadeUniformSetupFadeFraction);
	}
}

/**
 * Renders collection of dynamic level elements
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param elementCollection {Array} Collection of DynamicItemInstanceData/EnemyInstanceData objects
 *                                  which represent dynamic elements to be rendered
 * @param alternateTransformationMatrix {MathExt.Matrix} Optional - an alternate matrix that will serve
 *                                                       as the base transformation matrix, as
 *                                                       opposed to the pre-determined base
 *                                                       transformation matrix within the internal
 *                                                       model base transformation matrix key-value
 *                                                       store (can be used to apply customized
 *                                                       element orientation)
 */
MainToyAbandonmentGameplayScene.prototype.renderDynamicElementCollection = function(timeQuantum, targetCanvasContext,
	elementCollection, alternateBaseTransformationMatrix) {
		
	if (Utility.validateVar(timeQuantum) && Utility.validateVar(targetCanvasContext) &&
		Utility.validateVar(elementCollection)) {
	
		for (var currentElement of elementCollection) {
			this.renderDynamicElement(currentElement, targetCanvasContext, alternateBaseTransformationMatrix);
		}			
	}	
}

/** 
 * Generates a matrix required to rotate the a dynamic object
 *  model such that it is oriented with the internally-
 *  determined heading direction
 * @param element {DynamicItemInstanceData/EnemyInstanceData} Dynamic object representation to be rendered
 *
 */
MainToyAbandonmentGameplayScene.prototype.generateDynamicElementHeadingRotationMatrix = function (dynamicElement) {
	var rotationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	rotationMatrix.setToIdentity();	
	
	if (Utility.validateVar(dynamicElement) && (dynamicElement.velocityVector.magnitude() > 0.0)) {		
		rotationMatrix = MathUtility.generateRotationMatrix3dAxisZ(
			this.computeHeadingAngleFromVector(dynamicElement.velocityVector, 0.0));
		
	}
	
	return rotationMatrix;
}

/**
 * Renders a single dynamic element/enemy
 *
 * @param element {DynamicItemInstanceData/EnemyInstanceData} Dynamic object representation to be rendered
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param alternateTransformationMatrix {MathExt.Matrix} Optional - an alternate matrix that will serve
 *                                                       as the base transformation matrix, as
 *                                                       opposed to the pre-determined base
 *                                                       transformation matrix within the internal
 *                                                       model base transformation matrix key-value
 *                                                       store (can be used to apply customized
 *                                                       element orientation)
 */
MainToyAbandonmentGameplayScene.prototype.renderDynamicElement = function (element, targetCanvasContext, alternateTransformationMatrix) {
	if (Utility.validateVar(element)) {
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(false);		
		var webGlAttributeData = this.getDefaultWebGlAttributeData();
		var webGlBufferData = this.webGlBufferDataKeyValStore[element.modelDataKey];
		var elementWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			webGlBufferData, this.shaderPointLightStandardObject);
			
		var componentTransformationMatrix = Utility.validateVar(alternateTransformationMatrix) ?
			alternateTransformationMatrix : this.modelMatrixKeyValStore[element.modelDataKey];
	
		var renderSpacePosition = this.worldSpacePositionToTranslatedRenderSpacePosition(
			element.modelWorldSpacePosition.xCoord,
			element.modelWorldSpacePosition.yCoord,
			element.modelWorldSpacePosition.zCoord);
			
		var rotationMatrix = this.generateDynamicElementHeadingRotationMatrix(element);
		
		var translationMatrix = MathUtility.generateTranslationMatrix3d(
			renderSpacePosition.xCoord, renderSpacePosition.yCoord, renderSpacePosition.zCoord +
				Utility.returnValidNumOrZero(this.constModelRenderSpaceOffsetAxisZValues[element.modelDataKey]));

		var finalTransformationMatrix = translationMatrix.multiply(rotationMatrix);
			
		if (Utility.validateVar(componentTransformationMatrix)) {
			finalTransformationMatrix = finalTransformationMatrix.multiply(componentTransformationMatrix);
		}
	
		WebGlUtility.renderGeometry(elementWebGlData, finalTransformationMatrix, this.perspectiveMatrix(),
			null, targetCanvasContext, webGlAttributeLocationData, webGlAttributeData,
			this.pointLightUniformSetupFunction(targetCanvasContext, "DynamicElement", this));
	}	
}
	
MainToyAbandonmentGameplayScene.prototype.shouldRenderTeddyProtagonist = function(timeQuantum, targetCanvasContext) {
	return !this.teddyProtagonistIsInvulnerable ||
		(this.framesRenderedSinceLastInvulnerabilityFrame <	this.invulnerabilityFrameRenderInterval);
}

/**
 * Renders the final representation of the Teddy protagonist (all limbs appropriately
 *  transformed, and the composite model appropriately positioned)
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderTeddyProtagonist = function(timeQuantum, targetCanvasContext) {
	if (this.shouldRenderTeddyProtagonist()) {
		var teddyProtagonistComponentKeys = this.getAllTeddyProtagonistComponentKeys();
		
		var webGlAttributeLocationData = this.getStandardShaderWebGlAttributeLocations(false);
		var webGlAttributeData = this.getDefaultWebGlAttributeData();
		for (var currentKey of teddyProtagonistComponentKeys) {
			var webGlBufferData = this.webGlBufferDataKeyValStore[currentKey];
			teddyComponentWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
				webGlBufferData, this.shaderStandardObject);
			var componentTransformationMatrix = this.modelMatrixKeyValStore[currentKey];
			
			var compositeRotationMatrix = 
				this.generateTeddyProtagonistHeadingRotationMatrix().multiply(this.generateTeddyProtagonistLongitudinalTiltMatrix());

			var renderSpaceTranslationMatrix = this.generateTeddyProtagonistCompositeFinalPositioningMatrix();
			var finalTransformationMatrix = renderSpaceTranslationMatrix.multiply(
				compositeRotationMatrix.multiply(componentTransformationMatrix));
			
			WebGlUtility.renderGeometry(teddyComponentWebGlData, finalTransformationMatrix,
				this.perspectiveMatrix(), null, targetCanvasContext, webGlAttributeLocationData,
				webGlAttributeData, this.pointLightUniformSetupFunction(targetCanvasContext, "Teddy", this));
		}
	}
}

/**
 * Generates the perspective transformation matrix used
 *  to apply a perspective transformation to all rendered
 *  geometry that is not purposed as an overlay
 *
 * @return {MathExt.Matrix} Perspective transformation matrix
 */
MainToyAbandonmentGameplayScene.prototype.perspectiveMatrix = function() {
	// n - Near coordinate (Z-axis) (-1.0)
	// f - Far coordinate (Z-axis) (1.0)
	// b - Bottom coordinate (Y-axis) (-1.0)
	// t - Top coordinate (Y-axis) (1.0)
	// l - Left coordinate (X-axis) (-1.0)
	// r - Right coordinate (X-axis (1.0)
	
	// Projection Matrix:
	//
	//   n/r                    0                    0                    0
	//    0                    n/t                   0                    0
	//    0                     0              -(f+n) / (f - n)      -2fn / (f -n)
	//    0                     0                   -1                    0
	//

	var nearZ = -1.0;
	var farZ = 1.0;
	var bottomY = -1.0;
	var topY = 1.0;
	var leftX = -1.0;
	var rightX = 1.0;

	// Perspective matrix requires review...
	if (this.perspectiveMatrixStore === null) {
		this.perspectiveMatrixStore = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);
		this.perspectiveMatrixStore.setElementValues(
			/*[
				new Float32Array([nearZ / rightX, 			0.0, 					0.0,										0.0 ]),
				new Float32Array([0.0,					nearZ/topY, 				0.0,										0.0 ]),
				new Float32Array([0.0,						0.0, 		-(farZ + nearZ) / (farZ - nearZ),		-2 * farZ * nearZ / (farZ - nearZ)]),
				new Float32Array([0.0, 						0.0, 					-1.0,										0.0])
			]*/
			[
				new Float32Array([1.0, 						0.0, 					0.0,										0.0 ]),
				new Float32Array([0.0,						1.0,	 				0.0,										0.0 ]),
				new Float32Array([0.0,						0.0, 					1.0,										0.0]),
				new Float32Array([0.0, 						0.0, 					1.0,										1.0])
			]
		);
	}
	
	return this.perspectiveMatrixStore;
}

/**
 * Returns the "Projection" matrix used for overlays
 *  (identity)
 *
 * @return {MathExt.Matrix} The projection matrix to be used
 *                          by overlays upon success
 */
MainToyAbandonmentGameplayScene.prototype.overlayProjectionMatrix = function() {
	var identityMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount, this.constTransformationMatrixColumnCount);	
	identityMatrix.setToIdentity();
	
	return identityMatrix;
}

/**
 * Updates the internally-managed scroll offset, based upon the
 *  current world-space Teddy protagnost position
 */
MainToyAbandonmentGameplayScene.prototype.updateScrollOffset = function() {
	var scrollAreaMargin = 0.2;
	
	if (this.levelScrollManager != null) {
		// Absolute render space position (may exceed the boundaries of the
		// actual rendering viewport - will be contained within the rendering
		// viewport after the scroll position has been adjusted).
		var renderSpacePosition =
			this.worldSpacePositionToRenderSpacePosition(this.currentWorldSpacePositionInLevel.xCoord,
				this.currentWorldSpacePositionInLevel.yCoord,
				this.currentWorldSpacePositionInLevel.zCoord);
		
		this.levelScrollManager.updateScrollPositionWithPoint(renderSpacePosition.xCoord,
			renderSpacePosition.yCoord);
	}
}

/**
 * Renders a single level tile at the specified render-space region
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param tileRenderWebGlData {ObjectRenderWebGlData} A set of buffers that contain the
 *                                                    WebGL representation of the level
 *                                                    tile to be rendered
 * @param renderSpaceTileRect {Rectangle} Render-space rectangle which specifies the
 *                                        region in which the tile will be rendered
 * @param tileTexture {WebGLTexture} Texture to be applied to the level
 *                                   tile
 * @param attributeLocationData {WebGlUtility.AttributeLocationData()} A collection
 *																		of expected attribute
 *                                                						location specifiers
 * @param attributeData {WebGlUtility.AttributeData} Object that contains the attribute values
 *                                                   be supplied to the shader 
 */
MainToyAbandonmentGameplayScene.prototype.renderLevelTile = function(timeQuantum, targetCanvasContext, tileRenderWebGlData,
	renderSpaceTileRect, tileTexture, attributeLocationData, attributeData) {
		
	var uniformLookupKey = "LevelTile";
		
	var transformationMatrix = MathUtility.generateTranslationMatrix3d(
		renderSpaceTileRect.getCenter().getX(),
		renderSpaceTileRect.getCenter().getY(),
		0.0);
		
	var sceneInstance = this;		
	WebGlUtility.renderGeometry(tileRenderWebGlData, transformationMatrix, this.perspectiveMatrix(),
		tileTexture, targetCanvasContext, attributeLocationData, attributeData,
		this.pointLightUniformSetupFunction(targetCanvasContext, uniformLookupKey, this),
		function(targetCanvasContext, shaderProgram, uniformName) {
			return sceneInstance.resolveCachedUniformLocation(targetCanvasContext, uniformLookupKey, shaderProgram, uniformName)
		});
}

/**
 * Renders a wall segment column at the specified render-space region
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param segmentHeight {number} The number of wall blocks, arranged vertically
 *                               which comprise the column
 * @param segmentTexture {WebGLTexture} Texture to be applied to each wall block
 * @param rectInGroundPlane {Rectangle} Render-space rectangle which specifies the
 *                                      Z-plane region in which the wall segment column
 *                                      will be rendered
 * @param attributeLocationData {WebGlUtility.AttributeLocationData()} A collection
 *																		of expected attribute
 *                                                						location specifiers
 * @param attributeData {WebGlUtility.AttributeData} Object that contains the attribute values
 *                                                   be supplied to the shader 
 */
MainToyAbandonmentGameplayScene.prototype.renderWallSegment = function(timeQuantum, targetCanvasContext, segmentHeight,
	segmentTexture, rectInGroundPlane, attributeLocationData, attributeData) {
		
	var uniformLookupKey = "LevelWall";		
	
	var wallCubeRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
		this.webGlBufferDataBaseWallCube, this.shaderTexturedGouraudObject);

	for (var segmentIndex = 0; segmentIndex < segmentHeight; segmentIndex++) {
		var transformationMatrix = MathUtility.generateTranslationMatrix3d(
			rectInGroundPlane.getCenter().getX(),
			rectInGroundPlane.getCenter().getY(),
			-segmentIndex * this.constWorldScale);
			
		var sceneInstance = this;
		WebGlUtility.renderGeometry(wallCubeRenderWebGlData, transformationMatrix, this.perspectiveMatrix(),
			segmentTexture, targetCanvasContext, attributeLocationData, attributeData,
			this.pointLightUniformSetupFunction(targetCanvasContext, uniformLookupKey, this),
			function(targetCanvasContext, shaderProgram, uniformName) {
				return sceneInstance.resolveCachedUniformLocation(targetCanvasContext, uniformLookupKey, shaderProgram, uniformName)
			});
	}
}

/**
 * Renders the static tiles which comprise the level
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderLevelTiles = function(timeQuantum, targetCanvasContext) {	
	if ((this.currentLevelRepresentation !== null) && (this.levelScrollManager !== null)) {		
		var tileRenderWebGlData = WebGlUtility.objectRenderWebGlDataFromWebGlBufferData(
			this.webGlBufferDataLevelTileQuad, this.shaderTexturedGouraudObject);

		var attributeLocationData = this.getStandardShaderWebGlAttributeLocations(true);						
		var attributeData = this.getDefaultWebGlAttributeData();

		var renderSpaceVisibleRect = this.levelScrollManager.scrollSpaceVisibleRect()
				
		var levelSpaceVisibleRect = this.currentLevelRepresentation.getVisibleTileRegionTileIndexGridRect(
			-this.levelScrollManager.viewPortCenterPointX,
			-this.levelScrollManager.viewPortCenterPointY);
			
		var startRowIndex = Math.floor(levelSpaceVisibleRect.top - levelSpaceVisibleRect.height) - 1;
		var startColumnIndex = Math.floor(levelSpaceVisibleRect.left) - 1;

		for (var rowIndex = startRowIndex; rowIndex < (startRowIndex + levelSpaceVisibleRect.getHeight() + 2); rowIndex++) {
			for (var columnIndex = startColumnIndex; columnIndex < (startColumnIndex + levelSpaceVisibleRect.getWidth() + 2); columnIndex++) {
				
				if ((rowIndex >= 0) && (columnIndex >= 0) &&
					(rowIndex < this.currentLevelRepresentation.getTileGridHeight()) &&
					(columnIndex < this.currentLevelRepresentation.getTileGridWidth())) {
					var tileAttributes = this.currentLevelRepresentation.getTileAttributesForTileAtPosition(rowIndex, columnIndex);
					
					// Level tiles are scaled such that each tile is scaled to
					// the appropriate render-space size.
					
					
					var offsetPoint = this.renderSpacePositionToTranslatedRenderSpacePosition(0.0, 0.0, 0.0)
					var offsetX = -this.levelScrollManager.viewPortCenterPointX;
					var offsetY = -this.levelScrollManager.viewPortCenterPointY;
					var renderSpaceTileRect = this.currentLevelRepresentation.getTileRectInLevelSpace(rowIndex, columnIndex,
						offsetPoint.xCoord, offsetPoint.yCoord);
					
					var tileTexture = null;
					if (Utility.validateVar(tileAttributes.builtInTexture)) {
						var tileTextureKey = this.levelBuiltInTextureToTextureKeyDict[tileAttributes.builtInTexture];
						tileTexture = globalResources.textureKeyValueStore[tileTextureKey];
					}

					if (!Utility.validateVar(tileAttributes.height)) {
						this.renderLevelTile(timeQuantum, targetCanvasContext, tileRenderWebGlData,
							renderSpaceTileRect, tileTexture, attributeLocationData, attributeData);
					}
					else {
						this.renderWallSegment(timeQuantum, targetCanvasContext,
							Utility.returnValidNumOrZero(tileAttributes.height),
							tileTexture, renderSpaceTileRect, attributeLocationData, attributeData);
					}
				}
			}
		}
	}
}

/**
 * Function used to set shader uniform values for point light evaluation
 *
 * @param sceneInstance {MainToyAbandonmentGameplayScene} Reference to the game
 *                                                        implementation instance
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 *
 * @see WebGlUtility.renderGeometry
 */
MainToyAbandonmentGameplayScene.prototype.pointLightUniformSetupFunction = function (targetCanvasContext, lookUpKey, sceneInstance) {
	var pointLightHeight = this.constScaleFactorDefaultTeddyProtagonist;
	var pointLightContribution = this.currentLevelRepresentation.guideLightIntensity;
	return function (shaderProgram) {
		
		//var pointLightContributionFractionUniform = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightContributionFraction");
		var pointLightContributionFractionUniform = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightContributionFraction");
		targetCanvasContext.uniform1f(pointLightContributionFractionUniform, pointLightContribution);
		
		var pointLightColor = sceneInstance.teddyProtagonistGuideLightColor();
		//var pointLightColorUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightColor");
		var pointLightColorUniformLocation = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightColor");
		targetCanvasContext.uniform4fv(pointLightColorUniformLocation, [pointLightColor.getRedValue(),
			pointLightColor.getGreenValue(), pointLightColor.getBlueValue(), pointLightColor.getAlphaValue()]);

		// Position the point light at the world-space location of the teddy protagonist,
		// using the base protagonist height (height of the torso section). Otherwise,
		// the point light will not be properly cast onto the ground plane.
		var pointLightRenderSpaceLocation = sceneInstance.worldSpacePositionToTranslatedRenderSpacePosition(
			sceneInstance.currentWorldSpacePositionInLevel.xCoord,
			sceneInstance.currentWorldSpacePositionInLevel.yCoord,
			pointLightHeight);
		//var pointLightLocationUniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, "uniform_pointLightPosition");
		var pointLightLocationUniformLocation = sceneInstance.resolveCachedUniformLocation(targetCanvasContext, lookUpKey, shaderProgram, "uniform_pointLightPosition");
		targetCanvasContext.uniform3fv(pointLightLocationUniformLocation, [ pointLightRenderSpaceLocation.xCoord,
			pointLightRenderSpaceLocation.yCoord, pointLightRenderSpaceLocation.zCoord ]);
	}	
}

/**
 * Performs a shader uniform location look-up, caching the result,
 *  and returning the result on subsequent invocations.
 *
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 * @param lookUpKey {String} A key that will be used to uniquely associate
 *                           the uniform with the shader
 * @param shaderProgram {WebGLShader} The shader program on which the look-up
 *                                    will be performed if it is not contained
 *                                    within the cache
 * @param uniformName {String} The name of the uniform to look-up
 *
 * @return {WebGLUniformLocation} A WebGL uniform location
 */
MainToyAbandonmentGameplayScene.prototype.resolveCachedUniformLocation = function(targetCanvasContext, lookUpKey, shaderProgram, uniformName) {
	var uniformLocation = null;
	
	if (!Utility.validateVar(this.uniformLocationCache[lookUpKey])) {
		this.uniformLocationCache[lookUpKey] = {};
	}
	
	uniformLocation = this.uniformLocationCache[lookUpKey][uniformName];
	
	if (!Utility.validateVar(uniformLocation)) {
		var uniformLocation = targetCanvasContext.getUniformLocation(shaderProgram, uniformName);
		this.uniformLocationCache[lookUpKey][uniformName] = uniformLocation;
	}
	
	return uniformLocation;
}

/**
 * Renders all game overlays
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderOverlayBitmaps = function(timeQuantum, targetCanvasContext) {
	this.renderInputIndicatorOverlays(timeQuantum, targetCanvasContext);
	this.renderSpiritGaugeOverlay(timeQuantum, targetCanvasContext);
	// Conditionally render the "Game Over" overlay.
	this.renderGameEndOverlay(timeQuantum, targetCanvasContext);
	// Conditionally render the game completion overlay.
	this.renderGameCompletionOverlay(timeQuantum, targetCanvasContext);
	this.renderFadeOverlay(timeQuantum, targetCanvasContext);
}

/**
 * Renders the primary, texture-based portion of the scene
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainToyAbandonmentGameplayScene.prototype.renderScene = function(timeQuantum, targetCanvasContext) {	
	var sceneInstance = this;
	
	function sceneRenderCallback(timeInterval) {
		sceneInstance.renderLevelTiles(timeQuantum, targetCanvasContext);
		sceneInstance.renderTeddyProtagonist(timeQuantum, targetCanvasContext);
		sceneInstance.renderDynamicElements(timeQuantum, targetCanvasContext);
		sceneInstance.renderOverlayBitmaps(timeQuantum, targetCanvasContext);
	}
	
	window.requestAnimationFrame(sceneRenderCallback);
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum {number} Time delta with respect to the previously-executed
 *                             animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 */
MainToyAbandonmentGameplayScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	// Game state changes are dependent upon successively
	// performing evaluations using time quanta. If a time quantum
	// is unusually large, anamolous game state behavior may
	// occur (e.g., collision evaluations failing, resulting in
	// dynamic objects passing through walls). Limit the
	// reported time quantum magnitude.
	var effectiveTimeQuantum = Math.min(this.maxExpressibleTimeQuantum, timeQuantum);
	
	this.renderScene(timeQuantum, targetCanvasContext);	
	this.updateStateInformationForWorldObjects(effectiveTimeQuantum);
	this.updateStateInformationForLevel(effectiveTimeQuantum);
	this.updateOverlayRefreshInterval(effectiveTimeQuantum);
	this.updateGameState(effectiveTimeQuantum, targetCanvasContext);
		
	this.totalElapsedSceneTimeMs += timeQuantum;
	this.updateActiveTimers(effectiveTimeQuantum);
}