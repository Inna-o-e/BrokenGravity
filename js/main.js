$(window).load(function(){


	var canvas = {
		stepSize: 40,
		gridSize: 10
	}

	canvas.width = canvas.stepSize*canvas.gridSize;
	canvas.height = canvas.stepSize*canvas.gridSize;

	var canvasId = document.getElementById("canvas"),
    	ctx = canvasId.getContext('2d'),
    	activeLevelCount = 1,
    	numberOfLives = 3;
    	activeLevel = JSON.parse(JSON.stringify(levels[activeLevelCount-1])),
    	turningStepCount = 0;


    // Level background
    var LEVEL = {
    	showTurningArrows: true,
        render: function(level) {
        	ctx.fillStyle = "rgb(250,250,250)";
    		ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#808080";
            for (var i = 0; i < level.boundaries.length; i++) {
                var box = level.boundaries[i];
                ctx.fillRect(box[0] * canvas.stepSize, (canvas.height - canvas.stepSize) - box[1] * canvas.stepSize, canvas.stepSize, canvas.stepSize);
            };

            if(LEVEL.showTurningArrows){
	            //draw turningSqueres
	            var turningArray = (level.turningSteps) ? level.turningSteps : [[canvas.gridSize-1,0],[canvas.gridSize-1,canvas.gridSize-1],[0,canvas.gridSize-1]];
	            ctx.globalAlpha = 0.3;
	            var turningStepImage = new Image();
	            turningStepImage.src = "img/turning_arrows.png";
	            turningStepImage.onload = function() {
	            	for (var i = 0, x = turningArray.length; i < x; i++) {
	            		ctx.drawImage(turningStepImage, (turningArray[i][0]+0.15)*canvas.stepSize , canvas.width - (turningArray[i][1]-0.15+1)*canvas.stepSize);
	            	};
	            	ctx.globalAlpha = 1;
	            }
            }

        }
    };

    var animationFrame;

    // Player icon
    var PLAYER = {
        xPos: 0,
        yPos: 0,
        xPosTemp: 0,
        yPosTemp: 0,
        wayStep: 0,
        canvasSide: "bottom",

        countLives: true,
        showLives: function(){
        	$('#lives span').addClass('hidden');
        	for (var i = 0; i < numberOfLives; i++) {
        		$('#lives span').eq(i).removeClass('hidden');
        	};
        },
        beforeDraw : function(){
        	$(document).keyup(function(event){
            	setTimeout(PLAYER.keyEvents(event), 10)
            });

            PLAYER.draw();
        },
        draw: function() {
            var playerImg = new Image();

            if(PLAYER.canvasSide == "bottom") playerImg.src = "img/player.png";
            else if(PLAYER.canvasSide == "right") playerImg.src = "img/player_rb.png";
			else if(PLAYER.canvasSide == "top") playerImg.src = "img/player_rt.png";
			else if(PLAYER.canvasSide == "left") playerImg.src = "img/player_lt.png";

			var x = this.xPos;
			var y = this.yPos;
            playerImg.onload = function() {
				ctx.drawImage(playerImg, x, (canvas.height - canvas.stepSize) - y);
            };

            if(PLAYER.countLives){
            	PLAYER.showLives()
            }

        },
        beforeMove: function(){
        	switch(PLAYER.canvasSide){
        		case "bottom":{
        			PLAYER.xPosTemp = PLAYER.xPos;
        			PLAYER.yPosTemp = PLAYER.yPos;
        			PLAYER.xOffset = 1;
        			PLAYER.yOffset = 1;
        		}
        		break;
        		case "right":{
        			PLAYER.xPosTemp = PLAYER.yPos;
        			PLAYER.yPosTemp = PLAYER.xPos;
        			PLAYER.xOffset = 1;
        			PLAYER.yOffset = -1;
        		}
        		break;
        		case "top":{
        			PLAYER.xPosTemp = PLAYER.xPos;
        			PLAYER.yPosTemp = PLAYER.yPos;
        			PLAYER.xOffset = -1;
        			PLAYER.yOffset = -1;
        		}
        		break;
        		case "left":{
        			PLAYER.xPosTemp = PLAYER.yPos;
        			PLAYER.yPosTemp = PLAYER.xPos;
        			PLAYER.xOffset = -1;
        			PLAYER.yOffset = 1;
        		}
        		break;
        	};
        },
        move: {
        	left: function(direction){
	        	PLAYER.xPosTemp -= PLAYER.xOffset*canvas.stepSize;
	        	PLAYER.afterMove();
	        },
        	top: function(direction){
	        	PLAYER.yPosTemp += PLAYER.yOffset*canvas.stepSize;
	        	PLAYER.afterMove();
	        },
        	right: function(direction){
	        	PLAYER.xPosTemp += PLAYER.xOffset*canvas.stepSize;
	        	PLAYER.afterMove();
	        },
	        bottom: function(direction){
	        	PLAYER.yPosTemp -= PLAYER.yOffset*canvas.stepSize;
	        	PLAYER.afterMove();
	        },
	        boundariesTest: function(newXTemp, newYTemp){

	        	var newX, newY;

	        	if(PLAYER.canvasSide == "top" || PLAYER.canvasSide == "bottom"){
		        	newX = newXTemp;
			        newY = newYTemp;
	        	}
	        	else if(PLAYER.canvasSide == "left" || PLAYER.canvasSide == "right"){
		        	newX = newYTemp;
			        newY = newXTemp;
	        	}

	        	if(canvas.width <= newX || newX < 0 || canvas.height <= newY || newY < 0){
	        		return false;
	        	}
	        	else{
	        		for (var i = 0; i < activeLevel.boundaries.length; i++) {
	        			if( parseInt((newX/canvas.stepSize).toFixed(0)) === parseInt(activeLevel.boundaries[i][0].toFixed(0)) && parseInt((newY/canvas.stepSize).toFixed(0)) === parseInt(activeLevel.boundaries[i][1].toFixed(0))){

	        				if(PLAYER.countLives){
	        					numberOfLives--;
	        					PLAYER.showLives();
	        					if(numberOfLives < 0){
	        						$(document).keyup(function(event){
						            	event.preventDefault();
						            });
						            setTimeout(function(){
							            alert('Game over! Try again');
							            PLAYER.clearLevel();
							        }, 100)
	        					}
	        					else alert('Oops');
	        				}
	        				return false;
	        			}
	        		};
	        		return true;
	        	}
	        }
        },
        afterMove: function(){

        	ctx.clearRect(0,0, canvas.width, canvas.height);
	  		LEVEL.render(activeLevel);

	        var globalTempX,
	        	globalTempY,
	        	error = true,
	        	direction = "forward";

	        if(PLAYER.canvasSide == "top" || PLAYER.canvasSide == "bottom"){
	        	globalTempX = PLAYER.xPosTemp;
        	    globalTempY = PLAYER.yPosTemp;
        	}
        	else if(PLAYER.canvasSide == "left" || PLAYER.canvasSide == "right"){
	        	globalTempX = PLAYER.yPosTemp;
        	    globalTempY = PLAYER.xPosTemp;
        	}


        	//Check if not a bomb


        	// if(PLAYER.wayStep !== 0 && activeLevel.way[PLAYER.wayStep-1][0] === parseInt((globalTempX/canvas.stepSize).toFixed(0)) && activeLevel.way[PLAYER.wayStep-1][1] === parseInt((globalTempY/canvas.stepSize).toFixed(0))){
        	// 	PLAYER.wayStep--;
        	// 	error = false;
        	// 	direction = "back";
        	// }

        	if(PLAYER.wayStep !== activeLevel.way.length-1 && activeLevel.way[PLAYER.wayStep+1][0] === parseInt((globalTempX/canvas.stepSize).toFixed(0)) && activeLevel.way[PLAYER.wayStep+1][1] === parseInt((globalTempY/canvas.stepSize).toFixed(0)) ){
        		PLAYER.wayStep++;
        		error = false;
        		direction = "forward";
        	}


        	if(!error){
        		PLAYER.xPos = globalTempX;
        		PLAYER.yPos = globalTempY;



        		var turningX = (levels[activeLevelCount-1] ),
        			turningY;


        		if(!levels[activeLevelCount-1].turningSteps){
        			if(PLAYER.xPos == canvas.width - canvas.stepSize && PLAYER.yPos == 0 ){
	        			PLAYER.canvasSide = "right";
	        		}
	        		if(PLAYER.xPos == canvas.width - canvas.stepSize && PLAYER.yPos == canvas.height - canvas.stepSize ){
	        			PLAYER.canvasSide = "top";
	        		}
	        		if(PLAYER.xPos == 0 && PLAYER.yPos == canvas.height - canvas.stepSize ){
						PLAYER.canvasSide = "left";
	        		}
        		}
        		else{
        			var turningSteps = levels[activeLevelCount-1].turningSteps;

        			if(turningStepCount != turningSteps.length){
	        			if(turningSteps[turningStepCount][0]*canvas.stepSize == PLAYER.xPos && turningSteps[turningStepCount][1]*canvas.stepSize == PLAYER.yPos){
	        				PLAYER.canvasSide = turningSteps[turningStepCount][2];

	        				turningStepCount++;
	        			}
        			}
        		}

        		if(PLAYER.xPos == 0 && PLAYER.yPos == 40 && PLAYER.wayStep == activeLevel.way.length-1){
        			alert('Well done! Your time: ' + time + '.');

        			console.log(activeLevelCount, levels.length)
        			if(activeLevelCount == levels.length){
        				alert('The End.')
        				return;
        			}

        			activeLevelCount++;
        			activeLevel = JSON.parse(JSON.stringify(levels[activeLevelCount-1]));

        			PLAYER.clearLevel();

        		}
        		PLAYER.draw();

        	}
	        else {

	        	$(document).keyup(function(event){
	            	event.preventDefault();
	            });

	        	var explosion = new Image();
		        explosion.src = "img/explosion.png";
		        explosion.onload = function() {
					ctx.drawImage(explosion, globalTempX + 0.1*canvas.stepSize , (canvas.height - canvas.stepSize) - globalTempY + 0.1*canvas.stepSize);
		        };

		        setTimeout(function(){
		            alert('Game over! Try again');
		            PLAYER.clearLevel();
		        }, 100)

	        }

        },
        clearLevel: function(){
	        time = 0;
			turningStepCount = 0;
			numberOfLives = 3;
			ctx.clearRect(0,0, canvas.width, canvas.height);
			LEVEL.render(activeLevel);
			PLAYER.xPos = 0;
			PLAYER.yPos = 0;
			PLAYER.wayStep = 0;
			PLAYER.canvasSide = "bottom";
			PLAYER.draw();
        },
        keyEvents: function(event) {

        	window.cancelAnimationFrame(animationFrame);
        	PLAYER.beforeMove();

        	switch(event.which){
        		case 37:
        			if(!PLAYER.move.boundariesTest(PLAYER.xPosTemp - PLAYER.xOffset*canvas.stepSize, PLAYER.yPosTemp))
        				return;
        			animationFrame = window.requestAnimationFrame(PLAYER.move.left);
        			break;
        		case 38:
        			if(!PLAYER.move.boundariesTest(PLAYER.xPosTemp, PLAYER.yPosTemp + PLAYER.yOffset*canvas.stepSize))
        				return;
        			animationFrame = window.requestAnimationFrame(PLAYER.move.top);
        			break;
        		case 39:
        			if(!PLAYER.move.boundariesTest(PLAYER.xPosTemp + PLAYER.xOffset*canvas.stepSize, PLAYER.yPosTemp))
        				return;
        			animationFrame = window.requestAnimationFrame(PLAYER.move.right);
        			break;
        		case 40:
        			if(!PLAYER.move.boundariesTest(PLAYER.xPosTemp, PLAYER.yPosTemp - PLAYER.yOffset*canvas.stepSize))
        				return;
        			animationFrame = window.requestAnimationFrame(PLAYER.move.bottom);
        			break;

        		case 78:{

        			if(activeLevelCount == levels.length)
        				return;
        			activeLevelCount++;
					activeLevel = JSON.parse(JSON.stringify(levels[activeLevelCount-1]));
					PLAYER.clearLevel();}
        			break;
        	}
        }
    }

	LEVEL.render(activeLevel);
	PLAYER.beforeDraw();

	var time = 0;
	timer();



	function stepInArray(step, array){
		var res = false;
		for (var i = 0; i < array.length; i++) {
			if(arraysComparison(array[i], step)){
				res = true;
			}
		};
		return (res) ? true : false;
	}

	function arraysComparison(a, b){
		var length = a.length,
			sum = 0;
		for(var i = 0; i < length; i++){
			if(a[i]==b[i])
				sum++;
		}

		return (sum == length) ? true : false;

	}

	function timer(){
		setTimeout(function(){
			time++;
			$('#time').html(time);
			timer();
		}, 1000)
	}


})