

//Simulating a ragdoll falling down using Verlet integration. The idea behind Verlet integration is that it uses an objects
//previous position to calculate its next velocity. This can be accomplished multipled times per frame and is a fast and more
//stable method, compared to using Euler.

window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight;
		var count = 0;

	var keypoint = [],
		limbs = [];
		//gravity
		grav = 0.25,
		//how "springy" the ragdoll is in terms of bouncing from the walls
		//changing this value to over 1.5 twists and breaks our ragdoll :(
		rebound = .85,
		//coefficient of friction
		//decreasing the value to under .9 causes the ragdoll to slow down due to vertical friction on the walls
		coefff = 0.99;

		//keypoints represent the connecting keypoint between the lines that construct the body
		//some of the keypoint will therefore act as the joints in our ragdoll
		//randomizing initial velocity
		
		//the parameter "pinned" has been added to some of the keypoints to exclude them from updating and thus
		//keeping them stationary
		
		
	keypoint.push({
		x: 120,
		y: 100,
		OldX: 100 + Math.random() * 50,
		OldY: 100
	});
	keypoint.push({
		x: 180,
		y: 100,
		OldX: 210,
		OldY: 100
	});
	keypoint.push({
		x: 200,
		y: 300,
		OldX: 200,
		OldY: 300
	});
	keypoint.push({
		x: 100,
		y: 300,
		OldX: 100,
		OldY: 300
	});
	
	// ARMS--------------------------------------------------------------------------------------------
	keypoint.push({
		x: 10,
		y: 170,
		OldX: 10,
		OldY: 170
	});
	keypoint.push({
		x: 290,
		y: 170,
		OldX: 290,
		OldY: 170
	});
	
	// LEGS--------------------------------------------------------------------------------------------
	keypoint.push({
		x: 70,
		y: 400,
		OldX: 70,
		OldY: 400
	});
	keypoint.push({
		x: 230,
		y: 400,
		OldX: 230,
		OldY: 400
	});
	
	// FOREARMS----------------------------------------------------------------------------------------
	keypoint.push({
		x: 10,
		y: 230,
		OldX: 10,
		OldY: 230
	});
	keypoint.push({
		x: 290,
		y: 230,
		OldX: 290,
		OldY: 230
	});
	
	//KNEE--------------------------------------------------------------------------------------------
	keypoint.push({
		x: 70,
		y: 500,
		OldX: 70,
		OldY: 500
	});
	keypoint.push({
		x: 230,
		y: 500,
		OldX: 230,
		OldY: 500
	});
	keypoint.push({
		x: 230,
		y: 200,
		OldX: 230,
		OldY: 200,
		pinned: true
	});
	keypoint.push({
		x: 330,
		y: 300,
		OldX: 330,
		OldY: 300,
		pinned: true
	});
	
	//WALL--------------------------------------------------------------------------------------------
	keypoint.push({
		x: 300,
		y: 500,
		OldX: 300,
		OldY: 500,
		pinned: true
	});
	keypoint.push({
		x: 300,
		y: 0,
		OldX: 300,
		OldY: 0,
		pinned: true
	});
	

	//lines used to connect the dots, and give our ragdoll its shape
	//invisible lines are used to prevent the body from collapsing into itself
	//those are set to visible: false
	
	limbs.push({
		p0: keypoint[0],
		p1: keypoint[1],
		length: distance(keypoint[0], keypoint[1]),
		visible: true
	});
	limbs.push({
		p0: keypoint[1],
		p1: keypoint[2],
		length: distance(keypoint[1], keypoint[2]),
		visible: true
	});
	limbs.push({
		p0: keypoint[2],
		p1: keypoint[3],
		length: distance(keypoint[2], keypoint[3]),
		visible: true
	});
	limbs.push({
		p0: keypoint[3],
		p1: keypoint[0],
		length: distance(keypoint[3], keypoint[0]),
		visible: true
	});
	limbs.push({
		p0: keypoint[0],
		p1: keypoint[2],
		length: distance(keypoint[0], keypoint[2]),
		visible: false
	});
	// arms
	limbs.push({
		p0: keypoint[0],
		p1: keypoint[4],
		length: distance(keypoint[0], keypoint[4]),
		visible: true
	});
	limbs.push({
		p0: keypoint[1],
		p1: keypoint[5],
		length: distance(keypoint[1], keypoint[5]),
		visible: true
	});
	
	
	
	// LEGS--------------------------------------------------------------------------------------------
	
	//left
	limbs.push({
		p0: keypoint[3],
		p1: keypoint[6],
		length: distance(keypoint[3], keypoint[6]),
		visible: true
	});
	limbs.push({
		p0: keypoint[6],
		p1: keypoint[10],
		length: distance(keypoint[6], keypoint[10]),
		visible: true
	});
	limbs.push({
		p0: keypoint[6],
		p1: keypoint[2],
		length: distance(keypoint[6], keypoint[2]),
		visible: false
	});
	
	
	//right
	limbs.push({
		p0: keypoint[2],
		p1: keypoint[7],
		length: distance(keypoint[2], keypoint[7]),
		visible: true
	});
	limbs.push({
		p0: keypoint[7],
		p1: keypoint[11],
		length: distance(keypoint[7], keypoint[11]),
		visible: true
	});

	limbs.push({
		p0: keypoint[7],
		p1: keypoint[3],
		length: distance(keypoint[7], keypoint[3]),
		visible: false
	});

	
	// ARMS--------------------------------------------------------------------------------------------
	
	//left
	limbs.push({
		p0: keypoint[4],
		p1: keypoint[8],
		length: distance(keypoint[4], keypoint[8]),
		visible: true
	});
	
	
	//right
	limbs.push({
		p0: keypoint[5],
		p1: keypoint[9],
		length: distance(keypoint[5], keypoint[9]),
		visible: true
	});
	
	
	//WALL--------------------------------------------------------------------------------------------
	
	limbs.push({
		p0: keypoint[14],
		p1: keypoint[15],
		length: distance(keypoint[14], keypoint[15]),
		visible: true
	});
		
	
	
	
	
	//DISTANCE CALCULATION----------------------------------------------------------------------------
	//finding the distance between any two keypoint by simply rooting the sum of the squares
	function distance(p0, p1) {
		
		var dx = p1.x - p0.x,
			dy = p1.y - p0.y;
			
		return Math.sqrt(dx * dx + dy * dy);
	}

	
	//UPDATE------------------------------------------------------------------------------------------
	
	update();

	function update() {
		updatekeypoint();
		//note that the keypoint are being updated twice per frame
		//this can have an impact on the performance in the case of multiple calculations but usually does not influence
		//it as much
		for(var i = 0; i < 2; i++) {
			updatelimbs();
			constrainkeypoint();
		}
		render();
		requestAnimationFrame(update);
	}
	
	function updatekeypoint() {
		for(var i = 0; i < keypoint.length; i++) {
			var p = keypoint[i], NewX, NewY
			if(!p.pinned){
				//calculating velocity and updating it by setting the variables correctly
					NewX = (p.x - p.OldX) * coefff;
					NewY = (p.y - p.OldY) * coefff;
				
				//setting the current position as the old position
				p.OldX = p.x;
				p.OldY = p.y;
				//updating position based on velocity
				p.x += NewX;
				p.y += NewY;
				//taking into account the gravity factor
				p.y += grav;
			}
		}
	}
	
	
	//CONSTRAINTS
	//used not only to prevent the ragdoll from falling off the screen but also for creating a "tunnel" through which it 
	//initially falls in the scene. This is done by inversing its velocity
	
	function constrainkeypoint() {

		for(var i = 0; i < keypoint.length; i++) {
			var p = keypoint[i];
			if(!p.pinned){
				
				//screen border-----------------------------------------------------------------------------
				if(p.x > width) {
					p.x = width;
					p.OldX = p.x + (p.x - p.OldX) * rebound;
				}
				else if(p.x < 0) {
					p.x = 0;
					p.OldX = p.x + (p.x - p.OldX) * rebound;
				}
				if(p.y > height) {
					p.y = height;
					p.OldY = p.y + (p.y - p.OldY) * rebound;
				}
				if(p.y < 0) {
					p.y = 0;
					p.OldY = p.y + (p.y - p.OldY) * rebound;
				}
				
				//"tunnel"-----------------------------------------------------------------------------------
				if((p.y < 500) && (p.x > 300)) {
					(p.y < 500) && (p.x > 300);
					p.OldX = p.x + (p.x - p.OldX) * rebound;
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
				OffsetX = dx / 2 * ratio,
				OffsetY = dy / 2 * ratio;
			
			//subtracting and adding offsets
			s.p0.x = midx - OffsetX;
			s.p0.y = midy - OffsetY;
			s.p1.x = midx + OffsetX;
			s.p1.y = midy + OffsetY;
	
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