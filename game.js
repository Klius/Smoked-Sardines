
/* RESOURCES
 * 1. http://gamedev.tutsplus.com/tutorials/implementation/object-pools-help-you-reduce-lag-in-resource-intensive-games/
 * 2. http://gameprogrammingpatterns.com/object-pool.html
 * 3. http://www.slideshare.net/ernesto.jimenez/5-tips-for-your-html5-games
 * 4. http://www.kontain.com/fi/entries/94636/ (quote on performace)
 * 5. http://code.bytespider.eu/post/21438674255/dirty-rectangles
 * 6. http://www.html5rocks.com/en/tutorials/canvas/performance/
 * 7. rotation --> http://stackoverflow.com/questions/17125632/html5-canvas-rotate-object-without-moving-coordinates
 */

	
/**
 * Initialize the Game and start it.
 */
var game = new Game();

function init() {
	if(game.init())
		game.start();
}
/*
*Mouse position Variable
*/
var mousePos;
/**
 * Define an object to hold all our images for the game so images
 * are only ever created once. This type of object is known as a 
 * singleton.
 */
var imageRepository = new function() {
	// Define images
	this.background = new Image();
	this.sardina = new Image();
	this.bullet = new Image();
	this.forn = new Image();
	this.corner = new Image();
    	
	// Ensure all images have loaded before starting the game
	var numImages = 5;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.sardina.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	this.forn.onload = function(){
		imageLoaded();
	}
	this.corner.onload = function(){
		imageLoaded();
	}
	
	// Set images src
	this.corner.src = "imgs/corner.png";
	this.background.src = "imgs/bg.png";
	this.sardina.src = "imgs/sardina.svg";
	this.bullet.src = "imgs/fire.png";
	this.forn.src = "imgs/forn.svg";
}


/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up defualt variables
 * that all child objects will inherit, as well as the defualt
 * functions. 
 */
function Drawable() {
	this.init = function(x, y, width, height,angle=0) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.angle = angle;
	}
	
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
	this.move = function() {
	};
}


/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */
function Background() {
	this.speed = 1; // Redefine speed of the background for panning
	
	// Implement abstract function
	this.draw = function() {
		// Pan background
		this.y += this.speed;
		this.context.drawImage(imageRepository.background, this.x, this.y);
		
		// Draw another image at the top edge of the first image
		this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);

		// If the image scrolled off the screen, reset
		if (this.y >= this.canvasHeight)
			this.y = 0;
	};
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();


/**
 * Creates the Bullet object which the sardina fires. The bullets are
 * drawn on the "main" canvas.
 */
function Fire() {	
	this.alive = false; // Is true if the bullet is currently in use
	var counter = 0;
	var frame = 0;
	/*
	 * Sets the bullet values
	 */
	this.spawn = function(x, y, speed,fireLvl,fireType) {
		this.x = x;
		this.y = y;
		this.width = 100;
		this.speed = speed;
		this.alive = true;
		this.direction = 0;
		this.goback = false;
		this.fireLvl = fireLvl;
		this.oldFireLvl = 0;
		this.fireType = fireType;
		counter = 0;
		frame = 0;
	};

	/*
	 * Uses a "dirty rectangle" to erase the bullet and moves it.
	 * Returns true if the bullet moved off the screen, indicating that
	 * the bullet is ready to be cleared by the pool, otherwise draws
	 * the bullet.
	 *
	 * TODO: Fix dirty bug that reduces the nest to another fire
	 */
	this.draw = function() {
		this.context.clearRect(this.x, this.y, this.width, this.height);
		if (this.goback){
			//pull the fire back
			this.deanimateFire();
			//if the older lvl is lower show
			if (this.oldFireLvl < this.fireLvl ){
				this.goback = false;
			}
			
		}
		else{
			//if the older lvl is bigger hide
			if (this.oldFireLvl > this.fireLvl ){
				this.goback = true;
			}
			//put the fire on
			this.animateFire();
				
		}
		if(this.alive){
			console.log("x:"+this.x+" y:"+this.y+" counter:"+counter);
			this.context.save();
			this.context.translate(this.x + this.width/2 , this.y +this.height/2 );
			this.context.rotate(this.angle * Math.PI / 180);
			//context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
			this.context.drawImage(imageRepository.bullet, 
									fireSprite[frame].sx/*sx*/, fireSprite[frame].sy/*sy*/, this.width, this.height,
									-this.width/2, -this.height/2,this.width, this.height
									);
			this.context.restore();
			counter += 1;
			if(counter%10 == 0)
			{
				frame += 1;
				if(frame>=fireSprite.length){frame=0;}
			}
		}
	};
	
	/*
	*  Animations for hiding the fire
	*/
	this.deanimateFire = function(){
		//top to bottom animation
		if (this.fireType == 0){
			if ( this.y > -this.height-imageRepository.forn.height){
				this.y -= this.speed;
			}
			//clear the fire if it's offscreen
			if (this.y <= -this.height){
				this.clear();
			}
		}
		//bottom to top animation
		else if(this.fireType == 1){
			if (this.y < this.context.canvas.height){
				this.y += this.speed;
			}
			if(this.y >=this.context.canvas.height){
				this.clear();
			}
		}
		else if(this.fireType == 2){}
		else if(this.fireType == 3){}
	};
	
	/*
	*	Animations for showing the fire
	*/
	this.animateFire = function(){
		//top to bottom animation
		if (this.fireType == 0){
			if (this.y < imageRepository.forn.height){
				this.y += this.speed;
			}
		}
		//bottom to top animation
		else if(this.fireType == 1){
			if (this.y >this.context.canvas.height-imageRepository.forn.height-this.height){
				this.y -= this.speed;
			}
		}
		else if(this.fireType == 2){
			this.x -= this.speed;
		}
		else if(this.fireType == 3){}
		else{
			this.clear();
		}
	};
	
	/*
	 * Resets the bullet values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.fireLvl = 0;
		this.oldFireLvl = 0;
	};
}
Fire.prototype = new Drawable();


/**
 * Custom Pool object. Holds Bullet objects to be managed to prevent
 * garbage collection. 
 * The pool works as follows:
 * - When the pool is initialized, it populates an array with 
 *   Bullet objects.
 * - When the pool needs to create a new object for use, it looks at
 *   the last item in the array and checks to see if it is currently
 *   in use or not. If it is in use, the pool is full. If it is 
 *   not in use, the pool "spawns" the last item in the array and 
 *   then pops it from the end and pushed it back onto the front of
 *   the array. This makes the pool have free objects on the back 
 *   and used objects in the front.
 * - When the pool animates its objects, it checks to see if the 
 *   object is in use (no need to draw unused objects) and if it is, 
 *   draws it. If the draw() function returns true, the object is 
 *   ready to be cleaned so it "clears" the object and uses the 
 *   array function splice() to remove the item from the array and 
 *   pushes it to the back.
 * Doing this makes creating/destroying objects in the pool 
 * constant.
 */
function Pool(maxSize) {
	var size = maxSize; // Max bullets allowed in the pool
	var pool = [];
	/*
	 * Populates the pool array with Bullet objects
	 */
	this.init = function(fireType) {
		for (var i = 0; i < size; i++) {
			// Initalize the bullet object
			var fire = new Fire();
			fire.init(0,0, imageRepository.bullet.width,
			            imageRepository.bullet.height,fireAngle[fireType]);
			pool[i] = fire;
		}
	};
	
	/*
	 * Grabs the last item in the list and initializes it and
	 * pushes it to the front of the array.
	 */
	this.get = function(x, y, speed, fireLvl, fireType) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed, fireLvl, fireType);
			pool.unshift(pool.pop());
		}
		else{
			pool[size-1].oldFireLvl = pool[size-1].fireLvl;
			pool[size-1].fireLvl = fireLvl;
		}
	};
	this.cancel = function(){
		if(pool[size - 1].alive){
			pool[size-1].fireLvl = 0;
		}
	};
	/*
	 * Used for the sardina to be able to get two bullets at once. If
	 * only the get() function is used twice, the sardina is able to
	 * fire and only have 1 bullet spawn instead of 2.
	 */
	this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
		if(!pool[size - 1].alive && 
		   !pool[size - 2].alive) {
				this.get(x1, y1, speed1);
				this.get(x2, y2, speed2);
			 }
	};
	
	/*
	 * Draws any in use Bullets. If a bullet goes off the screen,
	 * clears it and pushes it to the front of the array.
	 */
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// Only draw until we find a bullet that is not alive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}

/**
 * Create the Sardina object that the player controls. The sardina is
 * drawn on the "sardina" canvas and uses dirty rectangles to move
 * around the screen.
 */
function Sardina() {
	this.speed = 5;
	this.bulletPool = new Pool(30);
	this.bulletPool.init();

	//var fireRate = 15;
	//var counter = 0;
	
	this.draw = function() {
		this.context.drawImage(imageRepository.sardina, this.x, this.y);
	};
	this.move = function() {	
		//counter++;
		
			//clear the sardina
			this.context.clearRect(this.x, this.y, this.width, this.height);
			//update position
			this.x = mousePos.x;
			this.y = mousePos.y;
			if (this.y >= this.canvasHeight - 60 - this.height){
					this.y = this.canvasHeight - 60 - this.height;
			}
			if(this.y <= 60){
					this.y = 60;
			}
			if (this.x >= this.canvasWidth - 60 - this.width){
					this.x = this.canvasWidth - 60 - this.width;
			}
			if (this.x <= 60){ // Keep player within the screen
					this.x = 60;
			}
			// Finish by redrawing the Sardina
			this.draw();
		//}
		
	};
	
	/* 
	 * Fires two bullets
	 */
	this.fire = function() {
		this.bulletPool.getTwo(this.x+6, this.y, 3,
		                       this.x+33, this.y, 3);
	};
}
Sardina.prototype = new Drawable();

/**
*
*Corner Object
*
**/
function Corner() {
	this.draw = this.draw = function() {
		this.context.save();
		this.context.translate(this.x + 100/2 , this.y +this.height/2 );
		this.context.rotate(this.angle * Math.PI / 180);
		this.context.drawImage(imageRepository.corner,0,0, 100,this.height, -100 /2, -this.height/2,100,this.height);//context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
		this.context.restore();
	};
}
Corner.prototype = new Drawable();

/**
*
*Forn_Controller
*
**/
function FornController() {
	this.forns = [];
	this.fornCap = 4;
	this.toggle = false ;
	var counter = 0;
	this.init = function() {
		//Set the forn to start
		for(var i=0;i<fornCoords.length;i++){
			var forn = new Forn();
			forn.init(fornCoords[i].x,fornCoords[i].y,
					imageRepository.forn.width,imageRepository.forn.height,fornCoords[i].angle);
			forn.fireType = fornCoords[i].fireType;
			forn.initPool();
			this.forns.push(forn);
		}
	};
	this.deactivateForns = function(){
		if (this.toogle){
			this.forns[0].inUse = false;
			this.forns[1].inUse = false;
			this.forns[2].inUse = false;
			this.forns[9].inUse = false;
			this.forns[10].inUse = false;
			this.forns[11].inUse = false;
		}
		else{
			this.forns[3].inUse = false;
			this.forns[4].inUse = false;
			this.forns[5].inUse = false;
			this.forns[6].inUse = false;
			this.forns[7].inUse = false;
			this.forns[8].inUse = false;
		}
	};
	
	this.update = function(){
		counter--;
		if (KEY_STATUS.toogle){
			if (counter <=0){
				this.toogle = this.toogle ? false : true;
				//console.log(this.toogle);
				counter = 15;
			}
		}
		if(this.toogle){
			//LEFT ROW
			if (KEY_STATUS.topLeft){
				this.forns[3].inUse = true;
			}
			else{
				this.forns[3].inUse = false;
			}
			if (KEY_STATUS.topMiddle){
				this.forns[4].inUse = true;
			}
			else{
				this.forns[4].inUse = false;
			}
			if (KEY_STATUS.topRight){
				this.forns[5].inUse = true;
			}
			else{
				this.forns[5].inUse = false;
			}
			//RIGHT ROW
			if (KEY_STATUS.bottomLeft){
				this.forns[6].inUse = true;
			}
			else{
				this.forns[6].inUse = false;
			}
			if (KEY_STATUS.bottomMiddle){
				this.forns[7].inUse = true;
			}
			else{
				this.forns[7].inUse = false;
			}
			if (KEY_STATUS.bottomRight){
				this.forns[8].inUse = true;
			}
			else{
				this.forns[8].inUse = false;
			}
		}else{
			//TOP ROW
			if (KEY_STATUS.topLeft){
				this.forns[0].inUse = true;
			}
			else{
				this.forns[0].inUse = false;
			}
			if (KEY_STATUS.topMiddle){
				this.forns[1].inUse = true;
			}
			else{
				this.forns[1].inUse = false;
			}
			if (KEY_STATUS.topRight){
				this.forns[2].inUse = true;
			}
			else{
				this.forns[2].inUse = false;
			}
			//BOTTOM ROW
			if (KEY_STATUS.bottomLeft){
				this.forns[9].inUse = true;
			}
			else{
				this.forns[9].inUse = false;
			}
			if (KEY_STATUS.bottomMiddle){
				this.forns[10].inUse = true;
			}
			else{
				this.forns[10].inUse = false;
			}
			if (KEY_STATUS.bottomRight){
				this.forns[11].inUse = true;
			}
			else{
				this.forns[11].inUse = false;
			}
		}
		this.deactivateForns();
		
		//update forns and draw
		for (var i = 0; i< this.forns.length; i++){
			this.forns[i].move();
			this.forns[i].firePool.animate();
		}
		//console.log("inUse:"+this.forns[0].inUse+" firelvl:"+this.forns[0].firelvl+" state:"+this.forns[0].state);
	};
}
/**
*Creates the forn object that will shoot back to the sardina
*
*/
function Forn() {
	this.speed = 2;
	this.firePool = new Pool(1);
	this.inUse = false;
	this.fireType = 0;
	this.fireDelay = 60;
	this.firelvl = 0;
	this.state = 0;
	var stateRate = this.fireDelay/3;
	var counter = 0;
	
	this.initPool = function(){
		this.firePool.init(this.fireType);
	};
	
	this.draw = function() {
		this.context.save();
		this.context.translate(this.x + 100/2 , this.y +this.height/2 );
		this.context.rotate(this.angle * Math.PI / 180);
		//context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
		this.context.drawImage(imageRepository.forn, fornSprite[this.firelvl][this.state].sx,
								fornSprite[this.firelvl][this.state].sy,
								100,this.height, -100 /2, -this.height/2,100,this.height);
		this.context.restore();
	};
	this.move = function() {
		if (this.inUse){
			counter++;
			if(counter%stateRate === 0){
				if (this.state+1 == 3 ){
					this.state = 0;
					if (this.firelvl+1 != 3){
						this.firelvl +=1;
					}
				}else{
					this.state += 1;
				}
				counter = 0;
			}
		}
		else{
			counter--;
			if( (this.state == 0) && (this.firelvl == 0)){
				counter = 0;
			}
			else if(counter <= 0){
				if (this.state == 0){
					if (this.firelvl-1 >= 0){
						this.firelvl -= 1;
						this.state = 2;
					}
				}
				else{
						this.state -=1;
				}
				counter = stateRate;
			}
		}
		
		if (this.firelvl >= 1 ){
			this.fire();
		}
		else{
			this.firePool.cancel();
		}
		// Determine if the action is move action
		this.draw();
		
	};
	
	/*
	 * Fires the fire
	 */
	this.fire = function() {
		if (this.fireType == 0){
			this.firePool.get(this.x, this.height-imageRepository.bullet.height, 3,this.firelvl,this.fireType);//add firetype and lvl
		}
		else if (this.fireType == 1){
			this.firePool.get(this.x, this.y+this.height/*100,100*/, 3,this.firelvl,this.fireType);//add firetype and lvl
		}
		else if (this.fireType == 2){
			this.firePool.get(this.x+imageRepository.bullet.height, this.y/*100,100*/, 3,this.firelvl,this.fireType);//add firetype and lvl
		}
		console.log(this.x+" Y: "+this.y);
	};
}
Forn.prototype = new Drawable();
 /**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() {
	/*
	 * Gets canvas information and context and sets up all game
	 * objects. 
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on browsers that do not support the canvas.
	 */
	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.shipCanvas = document.getElementById('sardina');
		this.mainCanvas = document.getElementById('main');
		
		this.shipCanvas.addEventListener('mousemove', 
										function(evt) 
										{
											mousePos = getMousePos(document.getElementById('sardina'), evt);
										},
										false);
		// Test to see if canvas is supported. Only need to
		// check one canvas
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');
		
			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			
			Sardina.prototype.context = this.shipContext;
			Sardina.prototype.canvasWidth = this.shipCanvas.width;
			Sardina.prototype.canvasHeight = this.shipCanvas.height;
			
			Fire.prototype.context = this.mainContext;
			Fire.prototype.canvasWidth = this.mainCanvas.width;
			Fire.prototype.canvasHeight = this.mainCanvas.height;
			
			Forn.prototype.context = this.shipContext;
			Forn.prototype.canvasWidth = this.shipCanvas.width;
			Forn.prototype.canvasHeight = this.shipCanvas.height;
			
			Corner.prototype.context = this.shipContext;
			Corner.prototype.canvasWidth = this.shipCanvas.width;
			Corner.prototype.canvasHeight = this.shipCanvas.height;
			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0
			
			//Initialize the fornController
			this.forncontroller = new FornController();
			this.forncontroller.init();
			// Initialize the sardina object
			this.sardina = new Sardina();
			// Set the sardina to start in the middle of the canvas
			var shipStartX = this.shipCanvas.width/2 - imageRepository.sardina.width;
			var shipStartY = this.shipCanvas.height/2;
			this.sardina.init(shipStartX, shipStartY, imageRepository.sardina.width,
			               imageRepository.sardina.height);
			
			for (var i=0; i <cornCoords.length; i++){
				var corner = new Corner();
				corner.init(cornCoords[i].x,cornCoords[i].y,
							imageRepository.corner.width,imageRepository.corner.height,cornCoords[i].angle);
				corner.draw();
			}
			return true;
		} else {
			return false;
		}
	};
	
	// Start the animation loop
	this.start = function() {
		this.sardina.draw();
		this.forncontroller.update();
		animate();
	};
}


/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	requestAnimFrame( animate );
	game.background.draw();
	game.sardina.move();
	game.sardina.bulletPool.animate();
	game.forncontroller.update();
	//game.forn.bulletPool.animate();
}


// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  74: 'bottomLeft',
  75: 'bottomMiddle',
  76: 'bottomRight',
  65: 'topLeft',
  83: 'topMiddle',
  68: 'topRight',
  84: 'toogle'
  
};

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
	e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}
/**
*
*Reads mouse coordinates and returns them
*
**/
function getMousePos(canvas,evt) {
        var rect = canvas.getBoundingClientRect();
        return {
			x: Math.round((evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width),
			y: Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height)
        };
}
/**	
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop, 
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();
