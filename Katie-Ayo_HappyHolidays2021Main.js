// Katie-Ayo_HappyHolidays2021Main.js - Happy Holidays 2021 demo entry point
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -WebGlUtility.js
//  -InternalConstants.js
//  -SceneExecution.js

/**
 * Initializes any required DOM resources
 *  (creates objects, etc.)
 * @param completionFunction {function} Function to be invoked after the
 *                                      DOM resource initialization has
 *                                      been completed.
 */
function initDomResources(completionFunction) {
	// Remove any previous elements from the DOM.
	document.body = document.createElement("body");	
	
	// Create the main canvas on which output
	// will be displayed..
	mainDiv = document.createElement("div");
	
	// Center the div within the window (the height centering will
	// not be retained if the window size has been altered).
	mainDiv.setAttribute("style", "text-align:center; margin-top: " +
		Math.round((window.innerHeight - Constants.defaultCanvasHeight) / 2.0) + "px");
		
	// Add the DIV to the DOM.
	document.body.appendChild(mainDiv);
	// Prevent double-tap gestures from invoking a zoom.
	document.body.style["touch-action"] = "manipulation";
	// Disable pull-to-refresh for touch screen devices
	document.body.style["overscroll-behavior"] = "contain";
	var mainCanvas = document.createElement("canvas");
	var gaugeOverlayCanvas = document.createElement("canvas");
	var goalStatusOverlayCanvas = document.createElement("canvas");	
	var fullScreenOverlayCanvas = document.createElement("canvas");
	
	if (Utility.validateVar(mainCanvas) &&
		(typeof mainCanvas.getContext === 'function')) {
			
		mainCanvas.width = Constants.defaultCanvasWidth;
		mainCanvas.height = Constants.defaultCanvasHeight;
		
		gaugeOverlayCanvas.width = Constants.overlayTextureWidth;
		gaugeOverlayCanvas.height = Constants.overlayTextureHeight;
		
		goalStatusOverlayCanvas.width = Constants.overlayTextureWidth;
		goalStatusOverlayCanvas.height = Constants.overlayTextureHeight;

		fullScreenOverlayCanvas.width = Constants.fullScreenOverlayTextureWidth;
		fullScreenOverlayCanvas.height = Constants.fullScreenOverlayTextureHeight;

		// Store the WeblGL context that will be used
        // to write data to the canvas.
        var mainCanvasContext = WebGlUtility.getWebGlContextFromCanvas(mainCanvas, true);
		var gaugeOverlayCanvasContext = gaugeOverlayCanvas.getContext("2d");
		var fullScreenOverlayCanvasContext = fullScreenOverlayCanvas.getContext("2d");			

		if (Utility.validateVar(mainCanvasContext) && Utility.validateVar(gaugeOverlayCanvasContext)) {
			// Prepare the WebGL context for use.
			WebGlUtility.initializeWebGl(mainCanvasContext);			

			// Add the canvas object DOM (within the DIV).
			mainDiv.appendChild(mainCanvas);		
		
			// Create overlay textures - these texture will be used primarily
			// to display text over presented content.
			var fullScreenOverlayTexture = WebGlUtility.createTextureFromCanvas(
				mainCanvasContext, fullScreenOverlayCanvas, false);
			var gaugeOverlayTexture = WebGlUtility.createTextureFromCanvas(mainCanvasContext, gaugeOverlayCanvas, false);		
			if (Utility.validateVar(gaugeOverlayTexture)) {
				globalResources.setGaugeOverlayTexture(gaugeOverlayTexture);
				globalResources.setFullScreenOverlayTexture(fullScreenOverlayTexture);
			}			
			
			globalResources.setMainCanvasContext(mainCanvasContext);
			globalResources.setGaugeOverlayCanvasContext(gaugeOverlayCanvasContext);
			globalResources.setFullScreenOverlayCanvasContext(fullScreenOverlayCanvasContext);			
		}	
	}
	
	// Hide the main canvas in order to permit the introductory screen to be displayed.
	mainCanvas.hidden = true;
	
	var introSectionDiv = document.createElement("div")
	var progressSectionDiv = document.createElement("div")
	mainDiv.appendChild(introSectionDiv);
	
	mainDiv.appendChild(progressSectionDiv);
	buildIntroductoryScreen(introSectionDiv);	
	
	var progressElementWidth = 500;
	var progressController = new progressElementController();
	progressController.createProgressElement(progressSectionDiv, progressElementWidth);
	progressController.updateProgressElement(0.0);
	
	var loadProgressFunction = function(progressFraction) {
		progressController.updateProgressElement(progressFraction);
	}
	
	globalResources.setLoadProgressFunction(loadProgressFunction);

	function loadCompletionFunction() {		
		progressSectionDiv.remove();
		
		var clickToContinueButton = createClickToContinueButton();
		mainDiv.appendChild(clickToContinueButton);
		
		
		function permissionsRequestCompletionHandler() {
			introSectionDiv.remove();
			clickToContinueButton.remove();
		
			completionFunction();
			mainCanvas.hidden = false;			
		}
		
		function buttonClickHandler() {
			// Initiate background audio playback - audio playback should
			// generally be commenced as a direct result of a click
			// event, as some browsers will not permit playback
			// otherwise.
			globalResources.playBackgroundAudio();
			conditionallyRequestInitialPermissions(permissionsRequestCompletionHandler);
		}
		
		clickToContinueButton.onclick = buttonClickHandler;
		
		//
		// Development only code begin (proceed without button click handling)
		//buttonClickHandler();
		// Development only code end (proceed without button click handling)
		//
	}

	globalResources.initialize(loadCompletionFunction);			
}

buildIntroductoryScreen = function(parentDiv) {
	
	if (Utility.validateVar(parentDiv)) {
		
		var imageBorderX = 30;
		var imageBorderY = 30;
		var canvasBackgroundColor = new RgbColor(0.0, 0.0, 0.0, 1.0);
		
		var introductoryScreenCanvas = document.createElement("canvas");
		introductoryScreenCanvas.width = Constants.defaultCanvasWidth;
		introductoryScreenCanvas.height = Constants.defaultCanvasHeight;
		introductoryScreenCanvasContext = introductoryScreenCanvas.getContext("2d");
		
		introductoryScreenCanvasContext.fillStyle = canvasBackgroundColor.getRgbaIntValueAsStandardString();
		introductoryScreenCanvasContext.fillRect(0, 0, introductoryScreenCanvas.width,
			introductoryScreenCanvas.height);
		
		parentDiv.appendChild(introductoryScreenCanvas);
		
		var introductoryScreenImage = new Image();		

		function onIntroductoryImageLoad() {
			introductoryScreenCanvasContext.drawImage(introductoryScreenImage,
				imageBorderX, imageBorderY,
				introductoryScreenCanvas.width - (2.0 * imageBorderX),
				introductoryScreenCanvas.height - (2.0 * imageBorderY));
			renderTextIntoIntroductoryScreenCanvas(introductoryScreenCanvasContext);
		}

		introductoryScreenImage.onload = onIntroductoryImageLoad;
		introductoryScreenImage.src = globalResources.getIntroImageUri();		
	}	
}

createClickToContinueButton = function(parentDiv) {
	
	var buttonBackgroundColor = new RgbColor(0.1, 0.1, 0.7, 0.9);
	var buttonForegroundColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	var borderRadius = 10;
	
	var clickToContinueButton = document.createElement("button");
	clickToContinueButton.innerHTML = Constants.stringIntroClickToContinue;
	clickToContinueButton.type = "button";
	clickToContinueButton.style.border = "none";
	clickToContinueButton.style.fontSize = Constants.prominentButtonFontSize + "px";
	clickToContinueButton.style.backgroundColor = buttonBackgroundColor.getRgbaIntValueAsStandardString();
	clickToContinueButton.style.color = buttonForegroundColor.getRgbaIntValueAsStandardString();
	clickToContinueButton.style.borderRadius = 10 + "px";

	return clickToContinueButton;
}

/**
 * Executes unit tests, as required/specified
 *  within the global configuration
 */
function conditionallyRunUnitTests() {
	if (Constants.runTestsAtProgramCommencement) {
		unitTests = new UnitTestInterface();
		unitTests.executeTests();		
	}	
}
	
renderTextIntoIntroductoryScreenCanvas = function(targetContext) {
	var titleTextCoordX = 150;
	var titleTextCoordY = 70;
	
	var movementInstructionTextCoordX = 220;
	var movementInstructionTextCoordY = 180;
	
	var introTextCollection =
	[	
		[ 280, 80, Constants.stringIntroGeneral1],
		[ 50, 340, Constants.stringIntroGeneral2],
		[ 490, 340, Constants.stringIntroMoveInstruction],
		[ 50, 600, Constants.stringIntroGoalDesc],
		[ 490, 600, Constants.stringIntroVitalityGaugeDesc],
	];
	
	var constIndexCoordX = 0;
	var constIndexCoordY = 1;
	var constIndexString = 2;
	for (var currentStringSpecification of introTextCollection) {
		var textBuffer = new StaticTextLineCanvasBuffer(Constants.smallLabelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);	
		textBuffer.updateStaticTextString(currentStringSpecification[constIndexString]);
		textBuffer.renderText(targetContext, currentStringSpecification[constIndexCoordX],
			currentStringSpecification[constIndexCoordY]);
	}
}

conditionallyRequestInitialPermissions = function(completionFunction) {
	function accelerometerRequestCompletionFunction() {
		globalResources.conditionallyRequestAccelerometerPermission(completionFunction)
	}
	
	globalResources.conditionallyRequestAccelerometerPermission(accelerometerRequestCompletionFunction);
}

/**
 * Completion function to be used with globalResources.initialize() -
 *  performs any final activities related to loading, and executes
 *  the main scene immediately after all image data has been loaded
 * @see globalResources.initialize
 */
finalizeLoading = function() {
	executeMainScene();
}

/**
 * Performs execution of the main demo scene
 */
function executeMainScene () {		
	// Create the main gameplay scene, and ultimately
	// invoke the start of the demo.
	var toyAbandonmentGameplayScsene = new MainToyAbandonmentGameplayScene();
	sceneExecution(toyAbandonmentGameplayScsene);
}

function commenceLoading() {
	// Initialize the DOM resources, immediately
	// executing the demo after completion of
	// initialization.
	initDomResources(finalizeLoading);	
}

/**
 * Main routine - function that is
 *  executed when page loading has
 *  completed
 */
function onLoadHandler() {
	conditionallyRunUnitTests();	
	commenceLoading();
}
	
	
	
	
	
	
	
	
	
	
	
	