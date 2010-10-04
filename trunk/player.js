Player = function() {
	C.debug("created player");
	this.xp = 0;
	this.weapon = Submachinegun;// Pistol
	this.x = C.canvas.w / 2;
	this.y = C.canvas.h / 2;
	this.radius = 10;
	this.direction = 0;
	this.maxspeed = 0.5; //maximum speed the player can move
	this.vel = 0; //w,s keys velocity
	this.vel2 = 0; //a,d keys velocity
	this.bullets = this.weapon.mag_size;
	this.fire_anim = false;
	this.sprite_idx = 1; //holds the index for the firing animation sprites
	this.sprite = C.images.player[0];
	this.reload_time = C.fps; //as fps
}
Player.prototype.bind_keys = function() {
//bind the keyboard keys for player movement
	C.debug("binding keys");
	document.onkeydown = function(event) {
		var keyCode = (event === null ? window.event.keyCode : event.keyCode);
		switch(keyCode) {
			case 27:
				C.pause = !C.pause;
			case 87:
				C.player.vel = -C.player.maxspeed;
				break; //w
			case 83: 
				C.player.vel = C.player.maxspeed;
				break; //s
			case 65: 
				C.player.vel2 = -C.player.maxspeed;
				break; //a
			case 68: 
				C.player.vel2 = C.player.maxspeed;
				break; //d
		}
	};
	document.onkeyup = function(event) {
		var keyCode = (event === null ? window.event.keyCode : event.keyCode);
		switch(keyCode) {
			case 83:
			case 87:
				C.player.vel = 0;
				break;
			case 65:
			case 68:
				C.player.vel2 = 0;
				C.player.angle = 0;
				break;
		}
	};
}
Player.prototype.move = function() {
//calculate the next player coordinates
//don't move from the view point of the actor but the player.
	this.direction = Math.atan2(C.mouse.currentx - this.x, 
		C.mouse.currenty - this.y);
	this.x += this.vel2;
	this.y += this.vel;
	if (this.vel2 != 0 || this.vel != 0) {
		var interval = Math.ceil((C.frame / C.fps)*2);
		var len = C.images.player.length;
		this.sprite_idx = (interval % len);
		this.sprite = C.images.player[this.sprite_idx];
	}
	if (this.fire_anim) {
		var interval = Math.ceil(C.frame / C.fps);
		var len = C.images.playerfire.length;
		this.sprite = C.images.playerfire[(interval % len)];
	} else {
		this.sprite = C.images.player[this.sprite_idx];
	}

}

Player.prototype.draw = function() {
//draw the player on the canvas
	var w = this.sprite.width/2;
	var h = this.sprite.height/2;
	C.ctx.save();
	C.ctx.translate(this.x,this.y);
	C.ctx.rotate(Math.PI-this.direction);
	C.ctx.drawImage(this.sprite,0-w,0-h);
	C.ctx.restore();
	this.check_reload_finished();
	if (this.reloading)
		this.reload_anim();
}

Player.prototype.fire = function() {
//file a projectile form the weapon
	if (this.reloading) return;
	if (C.frame < this.weapon.last_fire_frame + this.weapon.fire_interval) 
		return;
	if (this.bullets == 0) {
		this.reload();
		return;
	}
	this.weapon.fire();
	C.player.fire_anim = true;
	setTimeout(function() {C.player.fire_anim = false;}, 100);
}
Player.prototype.check_reload_finished = function() {
	if (this.reloading && C.frame > this.reload_start_frame + this.reload_time) {
		console.log("reloading finished");
		this.bullets = this.weapon.mag_size;
		this.reloading = false;
	}
}
Player.prototype.reload = function() {
//reload the weapon
	console.log("reloading started");
	this.reload_start_frame = C.frame;
	this.reloading = true;
}
Player.prototype.reload_anim = function() {
	C.ctx.save();
	C.ctx.translate(this.x+this.radius+5,this.y+this.radius+5);
	var sector = (C.frame - this.reload_start_frame)/this.reload_time;
	C.ctx.beginPath();
	C.ctx.strokeStyle = "rgb(255,0,0)";
	C.ctx.arc(0,0,11,0,Math.PI*2,true);
	C.ctx.stroke();
	C.ctx.beginPath();
	C.ctx.fillStyle = "rgba(128,128,128,0.6)";
	C.ctx.arc(0, 0, 10,
		0, 2 * Math.PI * sector, true);
	C.ctx.fill();
	C.ctx.restore();
}
Player.prototype.add_xp = function() {
	var p = C.dead.length/C.total_fired
	this.xp += Math.floor(1000 * p);
}
