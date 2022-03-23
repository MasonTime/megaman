import kaboom from "kaboom"

kaboom({
	width:640,
	height:640,
	scale:1,
})

loadSprite("susan", "sprites/susan.png")

//the levels
const levels = [
	[
		"================",
		"=               ",
		"=               ",
		"=         2     ",
		"=               ",
		"=               ",
		"=               ",
		"=               ",
		"=   ==          ",
		"=   =         ==",
		"=        ==     ",
		"=        ==     ",
		"=               ",
		"=    =          ",
		"=   ==    1     ",
		"================",
	],
	[
		"================",
		"      =         ",
		"      =         ",
		"      =         ",
		"      =         ",
		"      =         ",
		"                ",
		"                ",
		"                ",
		"              ==",
		"                ",
		"         =      ",
		"                ",
		"     =          ",
		"  1 ==   1      ",
		"================",
	],
	[
		"================",
		"               =",
		"               =",
		"               =",
		"               =",
		"               =",
		"               =",
		"               =",
		"               =",
		"              ==",
		"        ==     =",
		" ===    ==     =",
		"               =",
		"               =",
		"  1      1     =",
		"================",
	]
] 

//puts the length of the levels array into a variable (variable scope is stupid)
const levelLeng = levels.length

var levelWidth = levelLeng * width()

//common game objects to add
function createBullet(X,Y,dir) {
	//function that creates a bullet
	let x;
	let DX;
	let DY;
	let y;
	let spd = 1000;
	
	switch(dir) {
		case "r":
			x = X+40;
			y = Y;
			DX = spd;
			DY = 0;
			break;
		case "l":
			x = X-40;
			y = Y;
			DX = -spd;
			DY = 0;
			break;
		case "u":
			x = X;
			y = Y-40;
			DY = -spd;
			DX = 0;
			break;
		case "d":
			x = X;
			y = Y+60;
			DY = spd;
			DX = 0;
	}

	add([
		rect(20,20),
		scale(.5),
		color(0,255,0),
		area(),
		pos(x,y),

		"bullet",
		{
			dx: DX,
			dy: DY,
		}
	])
}


//game scene
scene("game", () => {

	for (i = 0; i < levelLeng; i++) {
		addLevel(levels[i],{
			width:40,
			height:40,
			pos:vec2((i)*width(),0),
			
			"=": () => [
				//wall
				rect(40,40),
				color(0,0,255),
				area(),
				solid(),
				"desBul",
			],
		
			"1": () => [
				//crawler
				sprite("susan"),
				area(),
				body(),
				"follower",
				"killable",
				"desBul",
				{
					spd:125,
					dis:150,
				}
			],
		
			"2": () => [
				//flyer
				rect(40,40),
				color(0,255,255),
				area(),
				solid(),
				"follower",
				"flyer",
				"killable",
				"desBul",
				{
					spd:200,
					dis:500,
					timer:0,
					maxTimer:100,
				}
			],
	})
	}

	gravity(1500)

	//player object
	const player = add([
		rect(40,40),
		sprite("susan"),
		pos(200,200),
		area(),
		body({jumpForce:650,}),
		"killable",
		
		{
			spd:500,
			dir:"r",
			
		}
	])


	//player controls
	onKeyPress("z",() => {
		//player jump
		if (player.isGrounded()) {
			player.jump()
		}
	})
	
	onKeyDown("left",() => {
		//player go left
		player.move(-player.spd,0)
		player.dir = "l"
	})
	
	onKeyDown("right",() => {
		//player go right
		player.move(player.spd,0)
		player.dir = "r"
	})

	onKeyPress("x",() => {
		//player shoots bullet
		createBullet(player.pos.x,player.pos.y+15,player.dir)
	})

	//bullet stuff
	onUpdate("bullet", (bullet) => {
		//moves the bullet
    bullet.move(bullet.dx,bullet.dy)
	})

	onCollide("bullet", "desBul",(bullet) => {
		//destroys the bullet if it comes in collision with an object that can destroy it
		destroy(bullet);
	})

	onCollide("bullet","killable", (bullet,killable) => {
		//if a bullet comes in contact with a killable enemy it kills it
		destroy(killable);
	})

	//enemy stuff
	onUpdate("follower", (follower) => {
		//makes the followers follow the player once they are in a certain distance of them
		if (follower.pos.x - player.pos.x < follower.dis && follower.pos.x - player.pos.x > -follower.dis) {
			if (player.pos.x > follower.pos.x) {
				follower.move(follower.spd,0)
			} else if (player.pos.x < follower.pos.x) {
				follower.move(-follower.spd,0)
			}
		}
	})

	onUpdate("flyer", (flyer) => {
		//counts down a timer, when it reaches zero it shoots and resets the timer
		flyer.timer -=1;
		
		if (flyer.timer < 0 ) {
    	createBullet(flyer.pos.x,flyer.pos.y,"d")
			flyer.timer = flyer.maxTimer
		}
		
	})
	
	onUpdate(() => {

		if (player.pos.x - width()/2 > 0 && player.pos.x + width()/2 < levelWidth) {
			//makes the camera centered on the player
			camPos(player.pos.x,width()/2)
		}
	})
})

go("game")