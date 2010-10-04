C = {canvas: {}, mouse:{}, sounds:{}, canvasobj:{}, raid:{}};
C.pause = false;
C.canvas.w = 640;
C.canvas.h = 480;
C.zombies = [];
C.level = 1;
C.raid.ratios = [0.1, 0.2, 0.3, 0.4];
C.raid.current = 0;
C.zombies_alive = 0; //zombies that are still alive
C.zombie_count = 100; //total # of zombies to create
C.zombie_seq = 0; //used to generate unique ids for zombies
C.projectiles = []; //projectiles on screen
C.dead = []; //dead zombies (to display carcasses)
C.perks = []; //perks displayed on screen
C.crosshair_radius = 15;
C.images = {};
C.real_fps = 0;
C.fps = 30;
C.prev_frame = 0;
C.total_fired = 0; //used to calculate hit ratio
C.raid.last_raid_interval = 0;
C.mouse = [false,false]; //mouse buttons
document.addEventListener("DOMContentLoaded", function() {C.init()}, false);
C.init = function() {
	C.check_firebug();
	console.log("init");
	var c = document.createElement("canvas");
	C.canvasobj = c;
	c.id = "canvas";
	document.body.appendChild(c);
	c.style.cursor = "url('img/1x1.gif'), default";
	c.width = C.canvas.w;
	c.height = C.canvas.h;
	C.ctx = c.getContext("2d");
	C.frame = 0;
	C.load_resources();
	C.player = new Player();
	C.player.bind_keys();
	C.create_zombies();
	c.addEventListener('mousemove', C.mousemove_handler, false);
	c.addEventListener('mousedown', C.mousedown_handler, false);
	c.addEventListener('mouseup', C.mouseup_handler, false);
	C.mouse.currentx = C.canvas.w/2;
	C.mouse.currenty = C.canvas.h/2;
	C.timer = setInterval(C.update, 1000/C.fps);
	setInterval(C.fps_timer, 1000); //used for stats (real fps)
	setInterval(C.rand_weapon_perk, 1000);
}

C.fps_timer = function() {
	C.real_fps = C.frame - C.prev_frame;
	C.prev_frame = C.frame;
}
C.debug = function(msg) {
	console.log(msg);
}
C.check_firebug = function() {
	if (!window.console || !console.firebug) {
		(function (m, i) {
			window.console = {};
			while (i--) {
				window.console[m[i]] = function () {};
			}
		})('log debug info warn error'.split(' '), 5);
	}
}
C.load_resources = function() {
	//player - silent
	C.debug("loading resources.");
	C.images.player = [];
	C.images.player[0] = new Image();//document.getElementById("player1");
	C.images.player[1] = new Image();//document.getElementById("player2");
	C.images.player[0].src = "img/kamil1.png";
	C.images.player[1].src = "img/kamil2.png";

	//player - noisy
	C.images.playerfire = [];
	C.images.playerfire[0] = new Image();
	C.images.playerfire[1] = new Image();
	C.images.playerfire[0].src = "img/kamil1fire.png";
	C.images.playerfire[1].src = "img/kamil2fire.png";

	C.images.terrain = new Image();
	C.images.terrain.src = "img/terrain.png";

	C.images.deadzombie = new Image();
	C.images.deadzombie.src = "img/deadzombie.png";
	
	C.images.blood = new Image();
	C.images.blood.src = "img/blood.png";
	C.images.blood2 = new Image();
	C.images.blood2.src = "img/blood2.png";

	C.images.zombie = [];
	var zi = ['img/zombi1.png','img/zombi3.png','img/zombi2.png','img/zombi3.png'];
	for (var j=0;j<2;j++){
		for (var i=0;i<zi.length;i++) {
			C.images.zombie[j*zi.length+i] = new Image();	
			C.images.zombie[j*zi.length+i].src = zi[i];
		}
	}
}
C.mouseup_handler = function(evt) {
	evt.preventDefault();
	C.mouse[0] = false;
}
C.mousedown_handler = function(evt) {
	evt.preventDefault();
	C.mouse[0] = true;
}
C.mousemove_handler = function(evt) {
	var pos = C.canvasobj;
	var x = evt.pageX - C.canvasobj.offsetLeft;
	var y = evt.pageY - C.canvasobj.offsetTop;
	C.mouse.currentx = x;
	C.mouse.currenty = y;
	C.update_crosshair(x,y);
}

C.update_crosshair = function(x,y) {
	C.crosshair_x = x;
	C.crosshair_y = y;
	C.crosshair_radius = Math.max(C.projectiles.length * 10,15);
}
C.draw_crosshair = function() {
	var x = C.crosshair_x;
	var y = C.crosshair_y;
	if (x == undefined || x == null) x = C.canvas.w/2;
	if (y == undefined || y == null) y = C.canvas.h/2;
	var r = C.crosshair_radius;
	C.ctx.beginPath();
	C.ctx.arc(x, y, r, 0, Math.PI*2, true);
	C.ctx.strokeStyle = "rgb(255,0,0)";
	C.ctx.stroke();
	C.ctx.beginPath();
	C.ctx.fillStyle = "rgba(31,32,37,0.6)";
	C.ctx.arc(x,y,r,0,Math.PI*2,true);
	C.ctx.fill();
}
C.levelcomplete = function() {
	setTimeout("clearInterval(C.timer)",2000); //delay to let the bullets fly
	console.log("level completed!");
}
C.gameover = function() {
	clearInterval(C.timer);
	C.canvasobj.removeEventListener('mousemove', C.mousemove_handler, false);
	C.canvasobj.removeEventListener('mousedown', C.mousedown_handler, false);
	C.canvasobj.removeEventListener('mouseup', C.mouseup_handler, false);
	console.log("game over!");
}
C.create_zombies = function() {
//create some zombies
	C.debug("creating zombies");
	if (C.raid.current >= C.raid.ratios.length) return;
	var zc = C.zombie_count * C.raid.ratios[C.raid.current]; //zombie count
	cz:
	for (var i=0;i<zc;i++) {
		var x = 0,y = 0;

		if (Math.random() < 0.5) x = C.canvas.w;
		else x = 0;

		if (Math.random() < 0.5) y = C.canvas.h;
		else y = 0;

		if (Math.random() < 0.5) x = C.canvas.w * Math.random();
		else y = C.canvas.h * Math.random();
		
		for (var j=0,len=C.zombies.length;j<len;j++) {
			var z = C.zombies[j];
			if (z.detect_collision(x,y,z.radius)) {
				i--;
				console.log("zombie create collision");
				continue cz;
			}
		}
		C.zombies.push(new Zombie(C.zombie_seq++,x,y));
	}
	C.zombies_alive = zc;
	C.raid.current++;
}
C.render_bg = function() {
//render terrain bg
	var iw = C.images.terrain.width;
	var ih = C.images.terrain.height;
	var xtimes = Math.ceil(C.canvas.w / iw);
	var ytimes = Math.ceil(C.canvas.h / ih);
	for (var i=0;i<xtimes;i++){
		for (var j=0;j<ytimes;j++) {
			C.ctx.drawImage(C.images.terrain,
				i*iw,j*ih);
		}
	}
}
C.render_stats = function() {
//render various stats, hit ratio, fps, etc.
	var c = 100*(C.dead.length)/C.total_fired;
	var c = (c + "").substr(0,4) + "%";
	C.ctx.fillStyle = "white";
	C.ctx.fillText("Hit ratio " + c, 10,10);
	C.ctx.fillText("FPS: " + C.real_fps, 10,20);
	C.ctx.fillText("Weapon:" + C.player.weapon.name, 10, 30);
	C.ctx.fillText("Bullets: " + C.player.bullets, 10, 40);
	C.ctx.fillText("Xp:"+C.player.xp, 10, 50);
}
C.render_dead = function() {
//render all dead zombies
	var deltax = C.images.deadzombie.width / 2;
	var deltay = C.images.deadzombie.height / 2;
	for (var i in C.dead) {
		var z = C.dead[i];
		C.ctx.save();
		C.ctx.translate(z.x, z.y);
		C.ctx.drawImage(C.images.blood,0,0); //0 due to translated coordinates
		C.ctx.save();
		C.ctx.rotate(z.blood_phi);
		if (z.bloody > 0.5) {//50% change of more blood
			C.ctx.rotate(z.blood_phi);
			C.ctx.drawImage(C.images.blood2,z.radius,z.radius); 
		}
		C.ctx.restore();
		C.ctx.rotate((Math.PI-z.direction));
		C.ctx.drawImage(C.images.deadzombie,
			0-deltax,0-deltay);
		C.ctx.restore();
	}
}
C.render_perks = function() {
	for (var i in C.perks) {
		var p = C.perks[i];
		C.ctx.drawImage(p.img,p.x,p.y);
	}
}

C.terrain = function() {
//clear the canvas and generate terrain
	C.render_bg();
	C.render_dead();
	C.render_stats();
	C.render_perks();
}

C.update = function() {
//call all actors coordinate calculations
	if (C.pause) return;
	C.frame++;
	var interval = Math.ceil(C.frame / C.fps);
	if (interval > C.raid.last_raid_interval)
	if (C.zombies.length == 0 || (interval>C.raid.last_raid_interval && interval % 12 == 11)) {
		C.raid.last_raid_interval = interval;
		C.create_zombies();
	}
	for (var i in C.zombies) {
		var z = C.zombies[i];
		z.move();
	}
	for (var i in C.projectiles) {
		var p = C.projectiles[i];
		p.move();
	}
	C.player.move();
	if (C.mouse[0]) {
		C.player.fire();
	}
	C.draw();
}

C.draw = function() {
//call all actors drawing functions
	C.terrain();
	for (var i in C.zombies) {
		var z = C.zombies[i];
		z.draw();
	}
	for (var i in C.projectiles){
		var p = C.projectiles[i];
		p.draw();
	}
	C.draw_crosshair();
	C.player.draw();
}

C.rand_weapon_perk = function() {
	if (Math.random() < 0.5) return;
	var x = C.canvas.w * Math.random();
	var y = C.canvas.h * Math.random();
	var wa = [Submachinegun];
	if (C.weapon_perk_present) {
		//TODO: the perk should dissapear at some time.
		return;
	}
	C.weapon_perk_present = true;
	var w = wa[Math.floor((wa.length-1)*Math.random())];
	var i = new Image();
	i.src = w.image_file;
	console.log("got random weapon perk %s at %d;%d", 
		w.image_file, x, y);
	C.perks.push({x:x,y:y,img:i});
}



