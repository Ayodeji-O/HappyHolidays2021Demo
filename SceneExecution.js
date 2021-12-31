// SceneExecution.js - Responsible for continuously executing a single scene animation
// Author: Ayodeji Oshinnaiye


function sceneExecution(targetScene) {
    if (Utility.validateVar(targetScene)) {
        // "Single-step" time quantum, in milliseconds
        // (the reciprocal of this value yields the
        // target frame rate).
        var singleStepQuantum = 16;
		
		// Time, in milliseconds, since the execution of the last scene
		// animation single-step (permits animation to accommodate for
		// slower machines).
		var timeSinceLastSceneStep = singleStepQuantum;	
           
		// Last absolute date/time (milliseconds) at which a scene
		// step execution was invoked.
		var lastSceneStepTimeAbs = 0;
		   
		// Total execution time of the scene (milliseconds).            
		var currentDuration = 0;

		function initializeScene(targetScene) {
			if (Utility.validateVar(targetScene)) {
				// Initialize the scene, invoking
				// the stepwise execution process
				// immediately after initialization.
				targetScene.initialize(runSegmentStep);
			}			
		}
		
		/**
		 * Executes a single scene step
		 * @return True if the segment should continue execution,
		 *         false otherwise
		 */
		function runSegmentStep() {
			
			// Use the system clock to keep track of the
			// execution period.
			if (lastSceneStepTimeAbs > 0)
			{
				var currentSceneStepTimeAbs = new Date();
				timeSinceLastSceneStep =
					currentSceneStepTimeAbs.getTime() -
					lastSceneStepTimeAbs.getTime();
				lastSceneStepTimeAbs = currentSceneStepTimeAbs;
			}
			
			lastSceneStepTimeAbs = new Date();
			var startClock = new Date();
			
			// Execute a scene step, using the actual time interval
			// between scene executions as a time quantum.
			var targetCanvasContext = globalResources.getMainCanvasContext();
			if (targetCanvasContext !== null) {
				targetScene.executeStep(timeSinceLastSceneStep, targetCanvasContext);
			}
					
			// Update the segment duration, and repeat
			// the scene step execution.
			var endClock = new Date();
			
			if (Utility.validateVar(startClock) && Utility.validateVar(endClock)) {
				// Current duration = immediate duration +
				// single-step (frame) execution time +
				// single-step (frame) interval
				currentDuration += (endClock.getTime() -
					startClock.getTime()) + singleStepQuantum;
			}
			else {
				currentDuration += singleStepQuantum;
			}

		
			window.setTimeout(runSegmentStep, singleStepQuantum);
		}
		
		// Begin the segment execution loop.
		initializeScene(targetScene);
	}
}
