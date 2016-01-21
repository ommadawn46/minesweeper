/*
  マインスイーパー
*/
function MineSweeper(){
  this.dbWidth = 200;
  this.dbHeight = 80;
  this.defaultWidth = this.dbWidth;
  this.defaultHeight = this.dbHeight * 3 + 60;
  this.cellSize = 34;
  this.counterSize = 70;

  this.easyButton = new DifficultyButton(0, 20, this.dbWidth, this.dbHeight, 9, 9, 10/81, 'Easy', this);
  this.normalButton = new DifficultyButton(0, this.dbHeight+40, this.dbWidth, this.dbHeight, 16, 16, 40/256, 'Normal', this);
  this.hardButton = new DifficultyButton(0, this.dbHeight*2+60, this.dbWidth, this.dbHeight, 16, 30, 99/480, 'Hard', this);

  this.cellRow = this.cellCol = this.mineRatio = null;
  this.clickListenComponents = this.contextMenuListenComponents = this.renderComponents = null;
}
MineSweeper.prototype = {
  reset: function(){
    setCanvasSize(this.defaultWidth, this.defaultHeight);
    this.clickListenComponents = [this.easyButton, this.normalButton, this.hardButton];
    this.contextMenuListenComponents = [];
    this.renderComponents = [this.easyButton, this.normalButton, this.hardButton];

    render();
  },
  gameSetup: function(){
    var canvasWidth = this.cellSize * this.cellCol;
    var canvasHeight = this.cellSize * this.cellRow + this.counterSize + 10;
    setCanvasSize(canvasWidth, canvasHeight);

    var timer = new Timer(this.cellSize*this.cellCol-this.counterSize, 0, this.counterSize, this.counterSize);
    var field = new Field(0, this.counterSize+10, this.cellSize, this.cellSize, this.cellRow, this.cellCol, this.mineRatio, timer);
    field.reset();
    var mineCounter = new MineCounter(0, 0, this.counterSize, this.counterSize, field);
    var resetButton = new ResetButton(this.cellSize*this.cellCol/2-this.counterSize, 0, this.counterSize*2, this.counterSize, field);

    this.clickListenComponents = [field, resetButton];
    this.contextMenuListenComponents = [field];
    this.renderComponents = [timer, field, mineCounter, resetButton];

    render();
  },
  click: function(x, y){
    this.clickListenComponents.forEach(function(component){
      component.click(x, y);
    })
  },
  contextMenu: function(x, y){
    this.contextMenuListenComponents.forEach(function(component){
      component.contextMenu(x, y);
    })
  }
}

/*
  フィールド
*/
function Field(x, y, cellWidth, cellHeight, cellRow, cellCol, mineRatio, timer){
  this.x = x, this.y = y;
  this.cellWidth = cellWidth, this.cellHeight = cellHeight;
  this.cellRow = cellRow, this.cellCol = cellCol;
  this.mineNum = Math.floor(this.cellRow * this.cellCol * mineRatio);
  this.cells = null;
  this.started = false;
  this.markNum = 0;
  this.ended = false;
  this.gameCleared = false;
  this.timer = timer;
}
Field.prototype = {
  click : function(x, y){
    cell = this.getCellXY(x, y);
    if(!this.ended && cell && !cell.marked){
      if(!this.started){
        this.start();
      }
      if(cell.isMine){
        this.mineBang();
      }else{
        this.checkCell(cell);
      }
      this.checkGameClear();
    }
    render();
  },
  contextMenu : function(x, y){
    cell = this.getCellXY(x, y);
    if(!this.ended && cell && !cell.uncovered){
      if(!this.started){
        this.start();
      }
      cell.mark();
    }
    render();
  },
  reset : function(){
    var cells = [];
    for(row = 0; row < this.cellRow; row++){
      var rowCells = []
      for(col = 0; col < this.cellCol; col++){
        rowCells.push(new Cell(this, row, col, false));
      }
      cells.push(rowCells);
    }
    this.cells = cells;
    this.started = false;
    this.markNum = 0;
    this.ended = false;
    this.gameCleared = false;
    this.timer.stop();
    this.timer.time = 0;
  },
  setMines : function(cell){
    var noMineCells = this.getNeighborCells(cell).concat([cell]);
    var settableCells = [];
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cc = this.cells[row][col];
        var settable = true;
        for(i = 0; i < noMineCells.length; i++){
          if(cc === noMineCells[i]){
            settable = false;
            break;
          }
        }
        if(settable){
          settableCells.push(cc);
        }
      }
    }
    var setted = 0;
    while(setted < this.mineNum){
      var cc = settableCells[Math.floor(Math.random() * settableCells.length)];
      if(!cc.isMine){
        cc.isMine = true;
        setted++;
      }
    }
    this.checkNeighborMinesNum();
  },
  checkNeighborMinesNum : function(){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        var neighborMines = 0;
        this.getNeighborCells(cell).forEach(function(neighborCell){
          if(neighborCell.isMine) neighborMines++;
        });
        cell.neighborMines = neighborMines;
      }
    }
  },
  getNeighborCells: function(cell){
    var row = cell.row, col = cell.col;
    var cells = [], field = this;
    [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]].forEach(function(d){
      if(0 <= row+d[0] && row+d[0] < field.cellRow && 0 <= col+d[1] && col+d[1] < field.cellCol){
        cells.push(field.cells[row+d[0]][col+d[1]]);
      }
    });
    return cells;
  },
  draw : function(ctx){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        this.cells[row][col].draw(ctx)
      }
    }
    if(this.gameCleared){
      ctx.beginPath();
      ctx.font = 'bold 100px Century Gothic';
      ctx.shadowColor = "white";
      ctx.shadowOffsetX = ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 5;
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';;
      var x = this.x + (this.cellWidth*this.cellCol)/2, y = this.y + (this.cellHeight*this.cellRow)/2;
      console.log(x, y);
      ctx.fillText('Clear!', x, y);
      ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.00)';;
      ctx.strokeText('Clear!', x, y);
    }
  },
  start : function(){
    this.setMines(cell);
    this.started = true;
    this.timer.start();
  },
  end : function(){
    this.ended = true;
    this.timer.stop();
  },
  getCellXY : function(x, y){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        if(cell.x < x && x < cell.x + this.cellWidth){
          if(cell.y < y && y < cell.y + this.cellHeight){
            return cell;
          }
        }
      }
    }
    return null;
  },
  checkCell : function(cell){
    var queue = [];
    var checkedCells = [cell];
    if(!cell.uncovered) queue.push(cell);
    while(queue.length > 0){
      var cc = queue.pop();
      if(!cc.uncovered){
        cc.uncover()
        if(cc.neighborMines <= 0){
          this.getNeighborCells(cc).forEach(function(neighborcell){
            var checked = false;
            for(i = 0; i < checkedCells.length; i++){
              if(neighborcell == checkedCells[i]){
                checked = true;
                break;
              }
            }
            if(!checked){
              queue.push(neighborcell);
              checkedCells.push(neighborcell)
            }
          });
        }
      }
    }
  },
  checkGameClear : function(){
    var allCellsUncoverd = true;
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        if(!cell.uncovered && !cell.isMine){
          allCellsUncoverd = false;
        }
      }
    }
    if(allCellsUncoverd){
      this.gameClear();
    }
  },
  gameClear: function(){
    this.gameCleared = true;
    this.end();
  },
  mineBang : function(){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        if(cell.isMine){
          cell.uncovered = true;
        }
      }
    }
    this.end();
  }
}

/*
  セル
*/
function Cell(field, row, col, isMine){
  this.field = field;
	this.row = row, this.col = col;

  var sp = (this.field.cellWidth < this.field.cellHeight ?
    this.field.cellHeight : this.field.cellWidth)/10
  this.width = this.field.cellWidth-sp;
  this.height = this.field.cellHeight-sp;
  this.x = this.field.x+this.col*(this.width+sp)+sp/2;
  this.y = this.field.y+this.row*(this.height+sp)+sp/2;

	this.uncovered = false;
  this.marked = false;
  this.isMine = isMine;
  this.neighborMines = 0;
}
Cell.prototype = {
  uncover: function(){
    this.uncovered = true;
  },
  mark: function(){
    if(this.marked){
      this.marked = false;
      this.field.markNum--;
    }else{
      this.marked = true;
      this.field.markNum++;
    }
  },
  draw: function(ctx){
    ctx.beginPath();
    if(this.uncovered){
      if(this.isMine){
        ctx.fillStyle = 'rgba(255, 50, 100, 0.75)';
      }else{
        ctx.fillStyle = 'rgba(0, 50, 100, 0.75)';
      }
    }else{
      if(this.marked){
        ctx.fillStyle = 'rgba(50, 200, 50, 0.75)';
      }else{
        ctx.fillStyle = 'rgba(50, 100, 200, 0.75)';
      }
    }

    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();

    if(this.uncovered && !this.isMine && this.neighborMines > 0){
      ctx.beginPath();
      ctx.font = 'bold 30px Century Gothic';
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
      ctx.fillText(String(this.neighborMines), this.x+this.width/2, this.y+this.height/2);
    }
  }
};

/*
  地雷カウンター
*/
function MineCounter(x, y, width, height, field){
  this.x = x, this.y = y;
  this.width = width, this.height = height;
  this.field = field;
}
MineCounter.prototype = {
  draw: function(ctx){
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 100, 0.75)';
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();

    ctx.beginPath();
    var remain = this.field.mineNum - this.field.markNum;
    if(remain >= 100){
      ctx.font = 'bold 40px Century Gothic';
    }else{
      ctx.font = 'bold 50px Century Gothic';
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
    ctx.fillText(String(remain), this.x+this.width/2, this.y+this.height/2);
  }
}

/*
  タイマー
*/
function Timer(x, y, width, height){
  this.x = x, this.y = y;
  this.width = width, this.height = height;
  this.timer = null;
  this.time = 0;
}
Timer.prototype = {
  start: function(){
    this.time = 0;
    var self = this;
    this.timer = setInterval(function(){self.update()}, 1000);
  },
  stop: function(){
    clearInterval(this.timer);
  },
  update: function(){
    this.time++;
    render();
  },
  draw: function(ctx){
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 100, 0.75)';
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();

    ctx.beginPath();
    if(this.time >= 100){
      ctx.font = 'bold 40px Century Gothic';
    }else{
      ctx.font = 'bold 50px Century Gothic';
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
    ctx.fillText(String(this.time), this.x+this.width/2, this.y+this.height/2);
  }
}

/*
  リセットボタン
*/
function ResetButton(x, y, width, height, field){
  this.x = x, this.y = y;
  this.width = width, this.height = height;
  this.field = field;
}
ResetButton.prototype = {
  click: function(x, y){
    if(this.x < x && x < this.x + this.width){
      if(this.y < y && y < this.y + this.height){
        this.field.reset();
      }
    }
    render();
  },
  draw: function(ctx){
    ctx.beginPath();
    ctx.fillStyle = 'rgba(20, 40, 80, 0.75)';
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();

    ctx.beginPath();
    ctx.font = 'bold 40px Century Gothic';
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
    ctx.fillText('Reset', this.x+this.width/2, this.y+this.height/2);
  }
}

/*
  難易度ボタン
*/
function DifficultyButton(x, y, width, height, cellRow, cellCol, mineRatio, label, mineSweeper){
  this.x = x, this.y = y;
  this.width = width, this.height = height;
  this.cellRow = cellRow;
  this.cellCol = cellCol;
  this.mineRatio = mineRatio;
  this.label = label;
  this.mineSweeper = mineSweeper
}
DifficultyButton.prototype = {
  click: function(x, y){
    if(this.x < x && x < this.x + this.width){
      if(this.y < y && y < this.y + this.height){
        this.mineSweeper.cellRow = this.cellRow;
        this.mineSweeper.cellCol = this.cellCol;
        this.mineSweeper.mineRatio = this.mineRatio;
        this.mineSweeper.gameSetup();
      }
    }
  },
  draw: function(ctx){
    ctx.beginPath();
    ctx.fillStyle = 'rgba(20, 40, 80, 0.75)';
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();

    ctx.beginPath();
    ctx.font = 'bold 40px Century Gothic';
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
    ctx.fillText(this.label, this.x+this.width/2, this.y+this.height/2);
  }
}
