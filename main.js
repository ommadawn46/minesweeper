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
  canvas.addEventListener('click', click, true);
  canvas.addEventListener('contextmenu', contextMenu, true);
  window.addEventListener('keydown', keyDown, true);

  mineSweeper = new MineSweeper();
  mineSweeper.reset();
}

// 画面の大きさが変更された時
window.onresize = function(){
  canvas.width = window.innerWidth*0.99;
  canvas.height = window.innerHeight*0.98;
  render();
}

// 描画
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mineSweeper.draw(ctx);
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
    mineSweeper.reset();
  }else if(keyCode == 37){ // left
    mineSweeper.undo();
  }else if(keyCode == 39){ // right
    mineSweeper.redo();
  }else if(keyCode == 65){ // A
    mineSweeper.swithAutoSolverMode();
  }else if(keyCode == 72){ // H
    mineSweeper.swichHintMode();
  }else if(keyCode == 83){ // S
    mineSweeper.switchSolvableMode();
  }
}

/*
  ユーティリティ関数
*/
// 引数の要素がこの配列に含まれるかをbool型として返す
Array.prototype.include = function(val){
  var this_length = this.length;
  for(i = 0; i < this_length; i++){
    if(val === this[i]) return true;
  }
  return false;
}
