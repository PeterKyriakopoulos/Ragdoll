

//Simulating a ragdoll falling down using Verlet integration. The idea behind Verlet integration is that it uses an objects
//previous position to calculate its next velocity. This can be accomplished multipled times per frame and is a fast and more
//stable method, compared to using Euler.

window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight;
		var count = 0;

	var points = [],
		limbs = [];
		//grav
		grav = 0.25,
		//how "springy" the ragdoll is in terms of bouncing from the walls
		//changing this value to over 1.5 "breaks" our ragdoll :(
		rebound = .85,
		//coefficient of friction
		//decreasing the value to under .9 causes the ragdoll to slow down due to vertical friction on the walls
		coefff = 0.99;

		//points represent the connecting points between the lines that construct the body
		//some of the points will therefore act as the joints in our ragdoll
		//randomizing initial velocity
	points.push({
		x: 120,
		y: 100,
		oldx: 100 + Math.random() * 50,
		oldy: 100
	});
	points.push({
		x: 180,
		y: 100,
		oldx: 210,
		oldy: 100
	});
	points.push({
		x: 200,
		y: 300,
		oldx: 200,
		oldy: 300
	});
	points.push({
		x: 100,
		y: 300,
		oldx: 100,
		oldy: 300
	});
	
	// ARMS--------------------------------------------------------------------------------------------
	points.push({
		x: 10,
		y: 170,
		oldx: 10,
		oldy: 170
	});
	points.push({
		x: 290,
		y: 170,
		oldx: 290,
		oldy: 170
	});
	
	// LEGS--------------------------------------------------------------------------------------------
	points.push({
		x: 70,
		y: 400,
		oldx: 70,
		oldy: 400
	});
	points.push({
		x: 230,
		y: 400,
		oldx: 230,
		oldy: 400
	});
	
	// FOREARMS----------------------------------------------------------------------------------------
	points.push({
		x: 10,
		y: 230,
		oldx: 10,
		oldy: 230
	});
	points.push({
		x: 290,
		y: 230,
		oldx: 290,
		oldy: 230
	});
	
	//KNEE--------------------------------------------------------------------------------------------
	points.push({
		x: 70,
		y: 500,
		oldx: 70,
		oldy: 500
	});
	points.push({
		x: 230,
		y: 500,
		oldx: 230,
		oldy: 500
	});
	points.push({
		x: 230,
		y: 200,
		oldx: 230,
		oldy: 200,
		pinned: true
	});
	points.push({
		x: 330,
		y: 300,
		oldx: 330,
		oldy: 300,
		pinned: true
	});
	
	//WALL--------------------------------------------------------------------------------------------
	points.push({
		x: 250,
		y: 400,
		oldx: 250,
		oldy: 400,
		pinned: true
	});
	points.push({
		x: 250,
		y: 0,
		oldx: 250,
		oldy: 0,
		pinned: true
	});

	//lines used to connect the dots, and give our ragdoll its shape
	//invisible lines are used to prevent the body from collapsing into itself
	//those are set to visible: false
	
	limbs.push({
		p0: points[0],
		p1: points[1],
		length: distance(points[0], points[1]),
		visible: true
	});
	limbs.push({
		p0: points[1],
		p1: points[2],
		length: distance(points[1], points[2]),
		visible: true
	});
	limbs.push({
		p0: points[2],
		p1: points[3],
		length: distance(points[2], points[3]),
		visible: true
	});
	limbs.push({
		p0: points[3],
		p1: points[0],
		length: distance(points[3], points[0]),
		visible: true
	});
	limbs.push({
		p0: points[0],
		p1: points[2],
		length: distance(points[0], points[2]),
		visible: false
	});
	// arms
	limbs.push({
		p0: points[0],
		p1: points[4],
		length: distance(points[0], points[4]),
		visible: true
	});
	limbs.push({
		p0: points[1],
		p1: points[5],
		length: distance(points[1], points[5]),
		visible: true
	});
	
	
	
	// LEGS--------------------------------------------------------------------------------------------
	
	//left
	limbs.push({
		p0: points[3],
		p1: points[6],
		length: distance(points[3], points[6]),
		visible: true
	});
	limbs.push({
		p0: points[6],
		p1: points[10],
		length: distance(points[6], points[10]),
		visible: true
	});
	limbs.push({
		p0: points[6],
		p1: points[2],
		length: distance(points[6], points[2]),
		visible: false
	});
	
	//right
	limbs.push({
		p0: points[2],
		p1: points[7],
		length: distance(points[2], points[7]),
		visible: true
	});
	limbs.push({
		p0: points[7],
		p1: points[11],
		length: distance(points[7], points[11]),
		visible: true
	});

	limbs.push({
		p0: points[7],
		p1: points[3],
		length: distance(points[7], points[3]),
		visible: false
	});

	
	// ARMS--------------------------------------------------------------------------------------------
	
	//left
	limbs.push({
		p0: points[4],
		p1: points[8],
		length: distance(points[4], points[8]),
		visible: true
	});
	
	//right
	limbs.push({
		p0: points[5],
		p1: points[9],
		length: distance(points[5], points[9]),
		visible: true
	});
	
	
	//WALL--------------------------------------------------------------------------------------------
	
	limbs.push({
		p0: points[14],
		p1: points[15],
		length: distance(points[14], points[15]),
		visible: true
	});

	//finding the distance between any two points by simply rooting the sum of the squares
	function distance(p0, p1) {
		
		var dx = p1.x - p0.x,
			dy = p1.y - p0.y;
			
		return Math.sqrt(dx * dx + dy * dy);
	}

	//-----------------------------------------------------------------------------------------------------------
	//UPDATE
	
	update();

	function update() {
		updatePoints();
		//note that the points are being updated twice per frame
		for(var i = 0; i < 2; i++) {
			updatelimbs();
			constrainPoints();
		}
		render();
		requestAnimationFrame(update);
	}
	
	function updatePoints() {
		for(var i = 0; i < points.length; i++) {
			var p = points[i], vx, vy
			if(!p.pinned){
				//calculating velocity and updating it by setting the variables correctly
					vx = (p.x - p.oldx) * coefff;
					vy = (p.y - p.oldy) * coefff;
				p.oldx = p.x;
				p.oldy = p.y;
				p.x += vx;
				p.y += vy;
				p.y += grav;
			}
		}
	}
	
	
	//CONSTRAINTS
	//used not only to prevent the ragdoll from falling off the screen but also for creating a "tunnel" through which it 
	//initially falls in the scene. This is done by inversing its velocity
	
	function constrainPoints() {

		for(var i = 0; i < points.length; i++) {
			var p = points[i];
			if(!p.pinned){
				
				//screen border-----------------------------------------------------------------------------
				if(p.x > width) {
					p.x = width;
					p.oldx = p.x + (p.x - p.oldx) * rebound;
				}
				else if(p.x < 0) {
					p.x = 0;
					p.oldx = p.x + (p.x - p.oldx) * rebound;
				}
				if(p.y > height) {
					p.y = height;
					p.oldy = p.y + (p.y - p.oldy) * rebound;
				}
				if(p.y < 0) {
					p.y = 0;
					p.oldy = p.y + (p.y - p.oldy) * rebound;
				}
				
				//"tunnel"-----------------------------------------------------------------------------------
				if((p.y < 400) && (p.x > 250)) {
					(p.y < 400) && (p.x > 250);
					p.oldy = p.y + (p.y - p.oldy) * rebound;
				}
			}
		}
	}
	
	//UPDATING LIMBS--------------------------------------------------------------------------------------------
	function updatelimbs() {
		for(var i = 0; i < limbs.length; i++) {
			var s = limbs[i],
			//calculating the difference using trigonometry
				dx = s.p1.x - s.p0.x,
				dy = s.p1.y - s.p0.y,
				dis = Math.sqrt(dx * dx + dy * dy);
				//using the ratio of length over total distance
				ratio = s.length / dis,
				//making each point travel half the distance (x and y)
				midx = s.p0.x + dx / 2,
				midy = s.p0.y + dy / 2,
				
				//calculating the offset
				offsetx = dx / 2 * ratio,
				offsety = dy / 2 * ratio;
			
			//subtracting and adding offsets
			s.p0.x = midx - offsetx;
			s.p0.y = midy - offsety;
			s.p1.x = midx + offsetx;
			s.p1.y = midy + offsety;
	
		}
	}
	
	
	
	//RENDER--------------------------------------------------------------------------------------------
	function render() {
		context.clearRect(0, 0, width, height);
		for(var i = 0; i < limbs.length; i++) {
			var s = limbs[i];
			if(s.visible) {
				context.beginPath();
				context.moveTo(s.p0.x, s.p0.y);
				context.lineTo(s.p1.x, s.p1.y);
				context.stroke(); 
			}
		}
	}

};