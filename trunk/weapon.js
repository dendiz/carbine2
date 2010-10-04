Weapon = {
	fire: function() {
		C.player.weapon.last_fire_frame = C.frame;
		C.total_fired++;
		C.player.bullets--;
		var x = C.player.x;
		var y = C.player.y;
		C.projectiles.push(new C.player.weapon.projectile(x,y));
	}
}
Pistol = {
	fire_interval: C.fps, //frames between two shots
	last_fire_frame: 0,
	name: "pistol",
	mag_size: 10,
	projectile: Bullet,
	fire: Weapon.fire
}

Submachinegun = {
	fire_interval: Math.floor(C.fps/3), //frames between two shots
	last_fire_frame: 0,
	name: "sub-machine gun",
	mag_size: 30,
	projectile: Bullet,
	image_file: 'img/submachinegun2.png',
	fire: Weapon.fire
}
