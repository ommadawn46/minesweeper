/*
  メイン関数
*/
var canvas, ctx;
var mineSweeper;

window.onload = function(){
  canvas = document.getElementById('canvas');
  canvas.style.position = "absolute"
  canvas.width = window.innerWidth*0.99;
  canvas.height = window.innerHeight*0.98;
  ctx = canvas.getContext('2d');
  canvas.addEventListener('mousemove', mouseMove, true);
  canvas.addEventListener('click', click, true);
  canvas.addEventListener('contextmenu', contextMenu, true);
  window.addEventListener('keydown', keyDown, true);

  mineSweeper = new MineSweeper(0, 0, canvas.width, canvas.height);
  render();
}

// 画面の大きさが変更された時
var queue = null;
window.onresize = function(){
  canvas.width = window.innerWidth*0.99;
  canvas.height = window.innerHeight*0.98;

  clearTimeout(queue);
  queue = setTimeout(function(){
    mineSweeper.resize(0, 0, canvas.width, canvas.height);
    render();
  }, 100);
}

// 描画
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mineSweeper.draw(ctx);
}

// 一つの部品だけ再描画する
function renderComponent(component) {
  ctx.clearRect(component.x, component.y, component.width, component.height);
  component.draw(ctx);
}

function mouseMove(event){
  var rect = event.target.getBoundingClientRect()
  var x = event.clientX-rect.left, y = event.clientY-rect.top;
  mineSweeper.mouseMove(x, y);
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
  var keyCode = event.keyCode;
  if(keyCode == 27){ // ESC
    event.preventDefault();
    mineSweeper.reset(); render();
  }else if(keyCode == 37){ // left
    mineSweeper.undo(); render();
  }else if(keyCode == 39){ // right
    mineSweeper.redo(); render();
  }else if(keyCode == 65){ // A
    mineSweeper.swithAutoSolverMode(); render();
  }else if(keyCode == 72){ // H
    mineSweeper.swichHintMode(); render();
  }else if(keyCode == 83){ // S
    mineSweeper.switchSolvableMode(); render();
  }
}
