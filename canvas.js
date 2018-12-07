// grabbing all elements
// used william mallones canvas tutorial as a template 
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
const canvas = document.getElementById('whiteBoard').getContext('2d');
const colorBox = document.getElementById('colorBox');
const sizeBox = document.getElementById('sizeBox');
const toolBox = document.getElementById('toolBox');
const shapeBox = document.getElementById('shapeBox');
const sprayBox = document.getElementById('sprayBox');
const backBox = document.getElementById('backBox');
const clearBox = document.getElementById('clearBox');
// initializing and declaring variables
let draw;
let color = 'black';
let size = 5;
let tool ='marker';
let line = false;
let shape = '';
let src;
let back = '';
let clear= '';
let strokeOrder = [];
let undoOrder= [];

// standard paint click coniditonals to determine which paint tool is used,
// then pushes the object to stroke order so that it can be rendered
$('#whiteBoard').mousedown(function(event){
	let x = event.pageX - this.offsetLeft;
	let y = event.pageY - this.offsetTop;
	// checks if a draw line has been initiated if so closes the line
	if (tool === 'line' && line === true){
		endPoint = {endX: x, endY: y};
		let temp = strokeOrder[strokeOrder.length-1];
		strokeOrder[strokeOrder.length-1] = {...temp, ...endPoint} 
		line = false;
	// starts to draw a line if line tool selected
	} else if (tool === 'line') {
		strokeOrder.push({type:'line',lineSize: size, lineColor: color, startX: x, startY: y});
		line = true;
	// draws shape if shape is selected
	} else if (shape){
		strokeOrder.push({type:shape, shape:shape,color:color,x:x,y:y})
	// draws image if an emoji spraw is selected
	} else if (src){
		strokeOrder.push({type:'spray', src:src,x:x,y:y})
	// does normal paint if other tools are not selected
	} else {
		draw = true;
	paint(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
	}
	render();
});
// event listeners for button-divs
sprayBox.addEventListener('click',((event)=>{
	src= document.getElementById(event.target.dataset.src);
	shape="";
	tool='marker';
}));
// checks for clear undo or redo
clearBox.addEventListener('click',((event)=>{
	if (event.target.dataset.action === 'clear') {
		strokeOrder = [];
		render();
	// if there has been strokes made it and undo tool is selected, it will soft delete the most recent action
	} else if (event.target.dataset.action === 'undo' && strokeOrder) {
		let temp = strokeOrder.pop();
		if (temp !== undefined) {
		undoOrder.push(temp);
		render();
		}
	// if there has been soft deletes made and redo is selected it will place the most recent on back in the stroke order
	} else if (event.target.dataset.action === 'redo' && undoOrder){
		let temp = undoOrder.pop()
		if (temp !== undefined) {
		strokeOrder.push(temp);
		render();
		}
	}
}));
// selects background to be displayed from html dataset
backBox.addEventListener('click',((event)=>{
	if (event.target.dataset.back) {
	back= document.getElementById(event.target.dataset.back);
	} else {
	back='';	
	}
	render();
}));
// changes color using html dataset
colorBox.addEventListener('click',((event)=>{
	color=event.target.dataset.color;
	src='';
}));
// changes the shape using html dataset
shapeBox.addEventListener('click',((event)=>{
	shape=event.target.dataset.shape;
	tool = false;
}));
// changes the brush size using html dataset
sizeBox.addEventListener('click',((event)=>{
	size=event.target.dataset.size;
}));
// selects the toolbox and clears the other tools
toolBox.addEventListener('click',((event)=>{
	if (event.target.dataset.tool==='eraser'){
		color='white'
		shape='';
		src='';
	}else 
	tool=event.target.dataset.tool;
	shape='';
	src='';
}));
// standard painting

function paint(x, y, dragging) {
	strokeOrder.push({
		paintX:x,
		paintY:y,
		paintPress:dragging,
		saveColor: color,
		saveSize: size,
		type: 'paint',
	})
}
// draws from the array
function render(){
	canvas.clearRect(0,0, canvas.canvas.width, canvas.canvas.height)
	canvas.strokeStyle = '#000000';
	canvas.lineJoin = 'round';
	canvas.lineWidth = 3;
	// lays down the drawing background first.
	if (back) {
		canvas.drawImage(back,0,0);
	}
	// paints and retains painting order so everything renders correctly
	// uses the array of objects to determine what should be rendered
	for(let i = 0; i < strokeOrder.length; i+=1){
		// draws standard painting
		if(strokeOrder[i].type ==='paint') {
			canvas.beginPath();
			if(strokeOrder[i].paintPress && i){
				canvas.moveTo(strokeOrder[i-1].paintX, strokeOrder[i-1].paintY);
			}else{
				canvas.moveTo(strokeOrder[i].paintX-1, strokeOrder[i].paintY);
		}
		canvas.lineTo(strokeOrder[i].paintX, strokeOrder[i].paintY)
		canvas.closePath();
		canvas.strokeStyle=strokeOrder[i].saveColor;
		canvas.lineWidth=strokeOrder[i].saveSize;
		canvas.stroke();  
		// draws the spray emoji
		} else if (strokeOrder[i].type ==='spray'){
			canvas.drawImage(strokeOrder[i].src,strokeOrder[i].x,strokeOrder[i].y);
		// draws square shape
		} else if (strokeOrder[i].type=== 'square') {
			canvas.lineWidth = 5;
			canvas.strokeStyle = strokeOrder[i].color;
			canvas.strokeRect(strokeOrder[i].x, strokeOrder[i].y, 50, 50);
		// draws circle shape
		} else if (strokeOrder[i].type === 'circle'){
			canvas.beginPath();
			canvas.lineWidth = 5;
			canvas.strokeStyle = strokeOrder[i].color;
			canvas.arc(strokeOrder[i].x, strokeOrder[i].y,25,0,2*Math.PI);
			canvas.stroke();
		// draws triangle shape
		} else if (strokeOrder[i].type === 'triangle') {
			canvas.beginPath();
			canvas.lineWidth = 5;
			canvas.strokeStyle = strokeOrder[i].color;
			canvas.moveTo(strokeOrder[i].x, strokeOrder[i].y);
			canvas.lineTo(strokeOrder[i].x +50, strokeOrder[i].y);
			canvas.lineTo(strokeOrder[i].x +25, strokeOrder[i].y-35);
			canvas.lineTo(strokeOrder[i].x, strokeOrder[i].y);
			canvas.stroke();
		// draws lines
		} else if (strokeOrder[i].type === 'line'){
			canvas.beginPath();
			canvas.moveTo(strokeOrder[i].startX, strokeOrder[i].startY);
			canvas.lineTo(strokeOrder[i].endX, strokeOrder[i].endY);
			canvas.lineWidth = strokeOrder[i].lineSize;
			canvas.strokeStyle = strokeOrder[i].lineColor;
			canvas.stroke();
		}
	}
	}
// clears draw on mouseup

$('#whiteBoard').mouseup(function(event){
	draw = false;
})
// clears draw on mouse leaving the canvas
$('#whiteBoard').mouseleave(function(event){
	draw = false;
})
// calls paint function with dragging if mouse is pressed and moving
$('#whiteBoard').mousemove(function(event){
	if(draw === true){
		paint(event.pageX - this.offsetLeft, event.pageY - this.offsetTop, true);
		render();
	}
});



