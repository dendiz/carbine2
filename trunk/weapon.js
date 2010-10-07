Weapon = {
	fire: function() {
		C.player.weapon.last_fire_frame = C.frame;
		C.total_fired++;
		C.player.bullets--;
		var x = C.player.x;
		var y = C.player.y;
		C.projectiles.push(new C.player.weapon.projectile(x,y));
	},
	fire_sharpnel: function() {
		for(var i=0;i<7;i++) Weapon.fire();				   
	}
}
Pistol = {
	fire_interval: C.fps, //frames between two shots
	last_fire_frame: 0,
	name: "pistol",
	mag_size: 10,
	projectile: Bullet,
	image_file: 'img/pistol.png',
	fire: Weapon.fire
}

Submachinegun = {
	fire_interval: ~~(C.fps/3), //frames between two shots
	last_fire_frame: 0,
	name: "submachine gun",
	mag_size: 30,
	projectile: Bullet,
	image_file: 'img/submachinegun2.png',
	fire: Weapon.fire
}

Shotgun = {
	fire_interval: C.fps, //frames between two shots
	last_fire_frame: 0,
	name: "shotgun",
	mag_size: 35,
	projectile: Bullet,
	image_file: 'img/shotgun.png',
	fire: Weapon.fire_sharpnel
}
