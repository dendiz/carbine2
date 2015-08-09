Bullet = function(x,y) {
//TODO: damage factor for bullets
	C.debug("created bullet");
	this.id = new Date().getTime();
	this.x = x;
	this.y = y;

	//random point inside crosshair area to simulate inaccuracy due to recoil
	var randphi = Math.random() * 2 * Math.PI;
	var randr = Math.random() * C.crosshair_radius;
	var dx = C.crosshair_x + randr * Math.cos(randphi);
	var dy = C.crosshair_y + randr * Math.sin(randphi);

	this.direction = Math.atan2(dx-this.x,dy-this.y);
	this.vel = 0.5;
	this.radius = 1;
	this.life = 1; //number of frames the bullet has lived

	//x,y coord's of the trail
	this.tx = this.x;
	this.ty = this.y;

	this.damage = 30; //total damge inflicted on collision. Subtracted from health
}

Bullet.prototype.detect_collision = function() {
//check for a collision with an object (zombie)
//return the id and position in array of the object if there is a collision
	for (var i in C.zombies) {
		var z = C.zombies[i];
		var xx = this.x - z.x;
		var yy = this.y - z.y;
		var d = Math.sqrt(xx*xx + yy*yy);
		if(d < this.radius + z.radius) {
			console.log("bullet %d collided with zombie %d",this.id,z.id);
			return {id:z.id, pos:i};
		}
	}
	return false;
}

Bullet.prototype.move = function() {
//calculate bullet coordinates.
	var sinx = Math.sin(this.direction) * this.vel;
	var cosy = Math.cos(this.direction) * this.vel;
	this.x = this.x + sinx * this.life;
	this.y = this.y + cosy * this.life;
	this.life+=this.vel;
	var collision = this.detect_collision();
	if(collision) {
		this.evict();
		C.zombies[collision.pos].hit(this);
	}
	if (this.x < 0 || this.x > C.canvas.w) this.evict();
	if (this.y < 0 || this.y > C.canvas.h) this.evict();
}
Bullet.prototype.evict = function() {
//remove the bullet from the onscreen projectile array
	for (var i in C.projectiles) {
		var p = C.projectiles[i];
		if (p.id == this.id) {
			C.projectiles.splice(i,1);
			break;
		}
	}
}

Bullet.prototype.draw = function() {
	var trail = 5;
	C.ctx.beginPath();
	C.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
	C.ctx.fillStyle = "white";
	C.ctx.fill();
	C.ctx.beginPath();
	var grad = C.ctx.createLinearGradient(this.x,this.y,this.tx,this.ty);
	grad.addColorStop(0,'rgba(255,255,255,1)');
	grad.addColorStop(1,'rgba(0,0,0,0)');
	C.ctx.strokeStyle = grad;
	C.ctx.moveTo(this.x, this.y);
	C.ctx.lineTo(this.tx,this.ty);
	C.ctx.stroke();
}
