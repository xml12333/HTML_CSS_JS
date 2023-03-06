
import clrsets from "./colorsets.js";

window.addEventListener("DOMContentLoaded", () => {
	'use strict';
	let paper = SVG("paper").size(window.innerWidth, window.innerHeight),
		bg = lightenDarken('#B5B09C', 0),
		leaves = '#525b54',
		roofColor ='#7c7870',
		mX = .866,
		mY = .5,
		time = 3000,
		t;
	
	window.addEventListener("resize", render);
	window.addEventListener("mousedown", render);
	window.addEventListener("mousemove", () => {
			let elem = document.getElementById('exportAsSvg')
			clearTimeout(t);
			elem.classList.add('visible')
			t = setTimeout(() => elem.classList.remove('visible'), 2000);
		});
	
	render();
	function render() {		
		paper.clear()
			.size(window.innerWidth, window.innerHeight)
			.rect(window.innerWidth, window.innerHeight)
			.fill(lightenDarken(bg, -3));
			//.fill(bgGradient);
		
		mX = .866 + (Math.random())/2;
		//mY = .5 + ((Math.random()-.5)*.7)
		//mX = 1, mY = 1;
		
		let cityWidth = 35,//random(10)+10,
			cityDepth = cityWidth,
			clr = clrsets[random(clrsets.length)].colourset,
			heightRand = random(10)+2,
			w = random(30)+50, d = w, h,
			streetW = Number.EPSILON,// No division by 0! //random(15),
			streetX = streetW * mX,
			streetY = streetW * mY,	
			streetGrid = getStreetGrid(cityWidth, cityDepth),
			centerness,
			c, x, y,
			city = paper.group().move(window.innerWidth/2, window.innerHeight/2 - (cityWidth*(w+streetW)/2.2))//.scale(.5);
			//city = paper.group().move(window.innerWidth/2, window.innerHeight/2 - (cityWidth*(w+streetW)/2))//.scale(1.2);
			
		for (let i = 0; i < cityWidth; i++){			
			x = -(i * d*mX) - d*mX -(i*streetX);
			y = (i * d*mY) - d*mY +(i*streetY);
			for (let j = 0; j < cityDepth; j++) {
				c = clr[random(clr.length)];
				centerness = getCenterness(j, i, cityWidth, cityDepth, heightRand/2);
				h = ((random(heightRand)*(centerness+.2))+1) * 30;
								
				drawBlock(
					{
						obj: city, 
						x: j, 
						y: i, 
						grid: streetGrid, 
						cityWidth, 
						cityDepth, 
						streetW, 
						centerness, 
						width: w, 
						depth: d, 
						height: h, 
						color: c
					}
				)
				.stroke({width:0}).move(x+=w*mX + streetX, y+=w*mY + streetY);
			}
		}
	    createSvgExport();
        // document.getElementById('svgexport').value = encodeURIComponent(paper.svg())
	}

	function drawBlock({obj, x, y, grid, cityWidth, cityDepth, streetW, centerness, width = 50, depth = 25, height = 100, color = "#ccc"}) {
		let top =   [mX, mY, -mX, mY, 0, 0],
			left =  [mX, mY, 0, mY*2, 0, 0],
			right = [mX, -mY, 0, mY*2, 0, 0],
			flat =  [mX, 0, 0, mY*2, 0, 0],
			centerX = getCenterX(width, depth),
			centerY = getCenterY(width, depth),
			isRoad = (grid.grid[x + cityWidth * y ] > 0),
			r = random(6)/centerness,
			block = obj.group().fill('none').stroke({width: 0});
		
		if(!isRoad){
			if (r != 0 && r < 6) house(block, width, depth, height, centerX, centerY);
			else if (r != 0 && r < 8) tree(block);
			//else ground(block);
		} else road(block);
		
		function drawBox(obj, w, d, h, c = '#ccc'){
			let box = obj.group();					
			box.rect(w,d).fill(lightenDarken(c, 0)).dmove(-(h+w),-(h+d)).matrix(top);
			box.rect(w,h).fill(lightenDarken(c, -25)).dmove(-w,-h).matrix(left);
			box.rect(d,h).fill(lightenDarken(c, -50)).dmove(0,-h).matrix(right);
			return box;
		}
		
		function ground(obj){
			//let ground = obj.group();
			//ground.rect(width-2,depth-2).fill(lightenDarken(bg, 3)).move(-width,-depth).matrix(top)
			//return ground;
		}
		
		function road(obj) {
			let theRoad = obj.group(),
				padding = streetW/2+.2,
				paths = [],
				coords = {
					wNeg: 	[-width-padding, -depth/2],
					wPos: 	[padding, -depth/2],
					dNeg: 	[-width/2, -depth-padding],
					dPos: 	[-width/2, padding],
					center: [-width/2, -depth/2]
				},
				maxRoads = grid.grid[x + cityWidth * y ],
				numRoads = 0;
			//console.log(maxRoads, grid.roads.length)

			for (let road of grid.roads){
				let i = road.findIndex(e => e[0] == x && e[1] == y);
				if(i > -1) {
					numRoads++;
					let prev = road[i-1],
						next = road[i+1],
						start = coords.center, end = coords.center;
					
					if(!prev){
						start = (road[i][0] == 0) ? coords.wNeg : coords.dNeg;
						prev = road[i];
					}
					if(!next){
						end = (road[i][0] == cityWidth-1) ? coords.wPos : coords.dPos;
						next = road[i];
					}
					if(road[i][0] > prev[0]) start = coords.wNeg;
					if(road[i][1] > prev[1]) start = coords.dNeg;
					if(road[i][0] < prev[0]) start = coords.wPos;
					if(road[i][1] < prev[1]) start = coords.dPos;
					if(road[i][0] > next[0]) end = coords.wNeg;
					if(road[i][1] > next[1]) end = coords.dNeg;
					if(road[i][0] < next[0]) end = coords.wPos;
					if(road[i][1] < next[1]) end = coords.dPos;
					
					paths.push([
						'M', start,
						'Q', coords.center, 
						end 
					]);
				}
				if (numRoads === maxRoads) break;
			}
			
			ground(theRoad);
			
			for(let path of paths)
				theRoad.path(path).stroke({width:Math.min(width, depth)/1.2, color: lightenDarken(bg, -5)}).matrix(top)
			
			for(let path of paths)
				theRoad.path(path).stroke({width:Math.min(width, depth)/1.6, color: lightenDarken(bg, -10)}).matrix(top)
			
			//for(let path of paths)
				//theRoad.path(path).stroke({width:1, color: lightenDarken(bg, 0), dasharray: [3,3]}).matrix(top)
			
			return theRoad;
		}
		
		function tree(obj){
			let tree = obj.group(),
				w = random(5)+4, h = random(25)+10,
				centerYforFlat = centerY/(mY*2);
			
			ground(tree);
			tree.circle(w*2).fill(lightenDarken(bg, -10)).center(-width/2,-depth/2).matrix(top)
			tree.circle(w*.75).fill(lightenDarken(bg, -30)).center(-width/2,-depth/2).matrix(top)			
			tree.rect(w, h).fill(lightenDarken(bg, -30)).center(centerX,centerYforFlat-h*.5).matrix(flat)
			// '#689F38' 
			for (let i = 0; i < 20; i++) {
				tree.circle(w*2.5).fill(lightenDarken(leaves, random(-20)+10))
					.center(centerX+ndist(random(30)+10),(centerYforFlat-h)+ndist(random(20)+10)).matrix(flat)
			}
			return tree;
		}
		
		function house(obj, width, depth, height, centerX, centerY){
			const pad = 5;
			let box = obj.group();
			ground(box)
			
			width = random(width/2)+width/2;
			depth = random(depth/2)+depth/2;
			centerX = getCenterX(width, depth);
			centerY = getCenterY(width, depth);
			
			box.rect(width+pad,depth+pad).fill(lightenDarken(bg, -10)).move(-width-(pad/2),-depth-(pad/2)).matrix(top)
			
			box.rect(width,height).fill(lightenDarken(color, -25)).move(-width,-height).matrix(left);
			box.rect(depth,height).fill(lightenDarken(color, -50)).move(0,-height).matrix(right);
		
			windows();
			roof();
			if (random(5) == 0) antenna();
			
			function roof(){				
				let roofHeight = random(20)+5,
					r = random(3);
				if (r==0) leftRoof();
				else if (r==1) rightRoof();
				else flatRoof();
				
				function flatRoof() {
					box.rect(width,depth).fill(lightenDarken(color, 0)).dmove(-(height+width),-(height+depth)).matrix(top);
					if (random(5) == 0){
						let w = random(width-10)+9,
						d = random(depth-10)+9,
						h = random(5)+2;
						drawBox(block, w, d, h, color)
							.move(centerX-getCenterX(w, d), centerY-(height*mY*2)-getCenterY(w, d))
					} else if (random(5) == 0){
						bird();
					}
					
					function bird(){
						let c = '#000';
						let bird = box.group();
						
						if (random(2) == 0 ) bird.flip('x');
						bird.move(centerX, centerY-(height*mY*2))
						
						let theBird = bird.group().center(0,0).scale(.5, 0, 0);
						
						theBird.circle(3).fill(c).center(0, 0).matrix(flat);
						
						let head = theBird.group();
						head.circle(2).fill(c).center(0, 0).dmove(-1, -1).matrix(flat);
						head.polygon([0,1,-2,1,0,-1]).fill(c).center(0, 0).dmove(-2, -1).matrix(flat);
						
						let wings = theBird.group().hide();
						wings.polygon([0,2,-9,0,0,0]).fill(c).dmove(0, -1.5).matrix(flat).rotate(-20,0,0)
							.animate(time/4,'<').rotate(50,0,0).loop(true, true);
						wings.polygon([0,2,9,0,0,0]).fill(c).dmove(0, -1.5).matrix(flat).rotate(20,0,0)
							.animate(time/4,'<').rotate(-50,0,0).loop(true, true);
						
						let flightpath = bird.path(getFlightpath())//.stroke({width:1}).matrix(flat);
						
						aniBird(theBird, flightpath);
						
						function getFlightpath(){
							let arr = ['M', 0, 0];
							for (let i = 0; i < 3; i++)
								arr.push(['Q', 
										  random(200)-100, -random(200), 
										  random(200)-100, -random(200)])
							arr.push('Z')
							return arr;
						}
						
						function aniBird(obj, path){
							obj.delay((Math.random()+.5)*time)
									.after(() => {
									wings.show();
									head.hide();
								})
								.animate((random(10)+5)*time, '<>').during((pos, morph, eased) => {
									var p = path.pointAt(eased * path.length())
									obj.center(p.x, p.y)
								})
								.after(() => {
									wings.hide();
									head.show();
									aniBird(obj, path);
								}) 
						}
					}
				}
				
				function rightRoof(){
					box.rect(width,depth).fill(lightenDarken(color, -50)).dmove(-(height+width),-(height+depth)).matrix(top);
					box.polygon([ 
						depth/2, -roofHeight, 
						depth/2+width, -roofHeight+width, 
						width+depth, width,
						depth, 0
					]).fill(lightenDarken(roofColor, -25)).dmove(-width, -height-width).matrix(right);

					box.polygon([
						0, 0, 
						depth/2, -roofHeight, 
						depth/2+width, -roofHeight+width, 
						width, width
					]).fill(lightenDarken(roofColor, 0)).dmove(-width, -height-width).matrix(right);

					box.polygon([0, 0, depth/2, -roofHeight, depth, 0])
						.fill(lightenDarken(color, -50)).dmove(0, -height).matrix(right);
				}
				
				function leftRoof(){
					box.rect(width,depth).fill(lightenDarken(color, -25)).dmove(-(height+width),-(height+depth)).matrix(top);
					box.polygon([
						0, 0, 
						width/2, -roofHeight, 
						width/2+depth, -roofHeight-depth,
						depth, -depth
					]).fill(lightenDarken(roofColor, 0)).dmove(-width, -height).matrix(left);
					
					box.polygon([ 
						0, 0, 
						-width/2, -roofHeight, 
						-width/2+depth, -roofHeight-depth,
						depth, -depth
					]).fill(lightenDarken(roofColor, -30)).dmove(0, -height).matrix(left);

					box.polygon([0, 0, width/2, -roofHeight, width, 0])
						.fill(lightenDarken(color, -25)).dmove(-width, -height).matrix(left);
				}
			}
			
			function antenna(){
				let thisMatrix = (random(2) == 0) ? left.slice(0) : right.slice(0);
				// translate
				thisMatrix[4] = centerX + (random(Math.min(width, depth)/4)-Math.min(width, depth)/4);
				thisMatrix[5] = centerY - (height*mY*2) + (random(Math.min(width, depth)/4)-Math.min(width, depth)/4)*mY*2;
				
				let h = -(random(20)+10),
					w = random(10)+5,
					num = random(2)+2,
					dist = -(h/num/2);

				let antenna = box.group().matrix(thisMatrix).opacity(.7)
				antenna.line(0, 0, 0, h).stroke({ width: 1 });
				for (let i = 0; i < num; i++) 
					antenna.line(-w/2, h+dist*(i+1)+(random(3)-1.5), w/2, h+dist*(i+1)+(random(3)-1.5)).stroke({ width: 1 });
			}
			
			function windows(){
				let offset = 4.5, floorHeight = 20, 
					nLeft = Math.round(width/10), 
					nRight = Math.round(depth/10), 
					nHeight = Math.floor(height/floorHeight),
					wHeight = 9, 
					wWidthLeft = (width-offset*(nLeft+1))/nLeft,
					wWidthRight = (depth-offset*(nRight+1))/nRight,
					master = box.rect(wWidthLeft,wHeight);
				
				for (let i = 0; i < nHeight; i++){
					for (let j = 0, obj; j < nLeft; j++){
						obj = box.use(master)
								.fill(lightenDarken(color, (random(15)==0) ? 50 : -50))
								//.stroke({width:1, color: lightenDarken(color, -20)})
								.move(-width+offset+(offset*j)+(wWidthLeft*j),-height+offset+(floorHeight*i)).matrix(left);
						aniWindow(obj, -50, 50)
					}
					for (let j = 0, obj; j < nRight; j++){
						obj = box.use(master)
								.fill(lightenDarken(color, (random(15)==0) ? 25 : -75))
								//.stroke({width:1, color: lightenDarken(color, -50)})
								.move(offset+(offset*j)+(wWidthRight*j),-height+offset+(floorHeight*i)).matrix(right);
						aniWindow(obj, -75, 25)
					}
				}
			
				function aniWindow(obj, dark, light){
					if (random(100) == 0) {
						a(true);
					}
					function a(toDark){ 
						obj.animate(random(time))
							.fill(lightenDarken(color, (toDark) ? dark : light ))
							.delay(random(time)*5)
							.after(() => a(!toDark)) 
					}
				}
			}
			return box;
		}
		return block;
	}
	
	function getStreetGrid(cityWidth, cityDepth){
		let masterGrid = new Array(cityWidth * cityDepth).fill(0),
			roads = [];
		
		for (let i = 0; i < (random(cityWidth/4)/*+1*/); i++) roads.push(drawRoad(cityWidth, cityDepth, false));
		for (let i = 0; i < (random(cityDepth/4)/*+1*/); i++) roads.push(drawRoad(cityWidth, cityDepth, true));
		
		function drawRoad(width, depth, flip){
			let grid = new Array(width * depth).fill(0);
			if (flip) [width, depth] = [depth, width];
			let x = 0, y = random(depth), r, thisRoad = [];
			isRoad(x, y);
			while (x < width-1) {
				r = random(20); // lower = more curviness
				if (r == 0 && y < depth-1){
					if (grid[coord(x, ++y)] == 0) isRoad(x, y);
					else y--;
				} else if (r == 1 && y > 0){
					if (grid[coord(x, --y)] == 0) isRoad(x, y);
					else y++;
				}
				++x;
				isRoad(x, y);
			}
			function coord(x, y){ return (flip) ? y + depth * x : x + width * y }
			function isRoad(x, y){
				grid[coord(x, y)] = 1;
				masterGrid[coord(x, y)] += 1;
				thisRoad.push((flip) ? [y, x] : [x, y])
			}
			return thisRoad;
		}
		
		return {
			grid: masterGrid,
			roads: roads
		};
	}

	function getCenterness(thisW, thisD, w, d, p){
		//return Math.pow(Math.sin(Math.PI*((thisW+.5)/w)), p) * Math.pow(Math.sin(Math.PI*((thisD+.5)/d)), p)
		return (Math.sin(Math.PI*((thisW+.5)/w)) * Math.sin(Math.PI*((thisD+.5)/d))) ** p;
	}
	
	function getCenterX(w, d){ 
		return d/2-w/2;
	}
	
	function getCenterY(w, d){ 
		return -((Math.sqrt(w**2)/2 + Math.sqrt(d**2)/2)*.5) *mY*2;
	}

	function random(n) {
		return Math.floor(Math.random() * n);
	}
	
	function ndist(n) {
		return (((Math.random() + Math.random() + Math.random())/3) - .5 ) * n
	}
	
	function lightenDarken(color, percent) {
		const rgb2Hex = s => s.match(/[0-9]+/g).reduce((a, b) => a+(b|256).toString(16).slice(1), '')
		
		color = color.length > 7 ? rgb2Hex(color) : color.slice(1);
		let num = parseInt(color,16),
			amt = Math.round(2.55 * percent),
			R = (num >> 16) + amt,
			B = (num >> 8 & 0x00FF) + amt,
			G = (num & 0x0000FF) + amt;

			return '#'+(0x1000000 
						+ (R<255?R<1?0:R:255)*0x10000 
						+ (B<255?B<1?0:B:255)*0x100 
						+ (G<255?G<1?0:G:255))
					.toString(16).slice(1);
	};
	
	function nextFrame() {
		return new Promise(resolve => requestAnimationFrame(resolve));
	}

    function createSvgExport(){
        //get svg element.
        var svg = document.querySelector("#paper>svg");
        console.log(svg)
        //get svg source.
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(svg);

        //add name spaces.
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        //add xml declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

        //convert svg source to URI data scheme.
        var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

        //set url value to a element's href attribute.
        document.getElementById("exportAsSvg").href = url;
        //you can download svg file by right click menu.
    }
});

