Util = {
	detect_collision: function(sx,sy,sr,tx,ty,tr) {
		//detect collision between source object (sx,sy) and target
		var xx = sx - tx;
		var yy = sy - ty;
		var d = Math.sqrt(xx*xx + yy*yy);
		return d < sr + tr;
	}
}
