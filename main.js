var canvas, ctx;
var mineSweeper;

window.onload = function(){
  canvas = document.getElementById('canvas');
  canvas.style.position = "absolute"
  canvas.style.top = "50%";
  canvas.style.left = "50%";
  ctx = canvas.getContext('2d');
  canvas.addEventListener('click', click, true);
  canvas.addEventListener('contextmenu', contextMenu, true);
  window.addEventListener('keydown', keyDown, true);

  mineSweeper = new MineSweeper();
  mineSweeper.reset();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mineSweeper.renderComponents.forEach(function(component){
    component.draw(ctx);
  })
}

function setCanvasSize(width, height){
  canvas.width = width;
  canvas.height = height;
  canvas.style.marginLeft = -(width < window.innerWidth ? width : window.innerWidth-10)/2;
  canvas.style.marginTop = -(height < window.innerHeight ? height : window.innerHeight-10)/2;
}

function click(event){
  var rect = event.target.getBoundingClientRect()
  var x = event.clientX-rect.left, y = event.clientY-rect.top;
  mineSweeper.click(x, y);
}

function contextMenu(event){
  event.preventDefault();
  var rect = event.target.getBoundingClientRect()
  var x = event.clientX-rect.left, y = event.clientY-rect.top;
  mineSweeper.contextMenu(x, y);
}

function keyDown(event){
  if(event.keyCode == 27){ // ESC
    mineSweeper.reset();
  }
}
