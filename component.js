/*
  マインスイーパー
*/
function MineSweeper(){
  var self = this;
  var dbMargin = function(){return self.dbHeight()/3};

  this.titleLabel = new Label(function(){return canvas.width/2-self.dbWidth()*1.375}, dbMargin,
  function(){return self.dbWidth()*2.75}, this.dbHeight, function(){return "Logical Minesweeper"});
  this.titleLabel.fontStyle = 'italic';
  this.titleLabel.fontColor = 'rgba(0, 0, 0, 1)';

  var buttonX = function(){return canvas.width/2-self.dbWidth()/2};
  this.easyButton = new DifficultyButton(buttonX, function(){return self.dbHeight()+dbMargin()*2}, this.dbWidth, this.dbHeight,
                    9, 9, 10/81, 'Easy', this); // 0.12345679
  this.mediumButton = new DifficultyButton(buttonX, function(){return self.dbHeight()*2+dbMargin()*3}, this.dbWidth, this.dbHeight,
                    16, 16, 40/256, 'Medium', this); // 0.15625
  this.hardButton = new DifficultyButton(buttonX, function(){return self.dbHeight()*3+dbMargin()*4}, this.dbWidth, this.dbHeight,
                    16, 30, 99/480, 'Hard', this); // 0.20625
  this.veryHardButton = new DifficultyButton(buttonX, function(){return self.dbHeight()*4+dbMargin()*5}, this.dbWidth, this.dbHeight,
                    24, 48, 256/1152, 'Very Hard', this); // 0.22222
  this.extremeButton = new DifficultyButton(buttonX, function(){return self.dbHeight()*5+dbMargin()*6}, this.dbWidth, this.dbHeight,
                    32, 64, 512/2048, 'Extreme', this); // 0.25

  this.field = null;
  this.timer = new Timer(null, function(){return 0}, null, this.counterHeight);
  this.aModeLabel = new Label(null, null, null, function(){return 0}, function(){return "A"});
  this.hModeLabel = new Label(null, null, null, function(){return 0}, function(){return "H"});
  this.sModeLabel = new Label(null, null, null, function(){return 0}, function(){return "S"});
  this.aModeLabel.textSize = this.hModeLabel.textSize = this.sModeLabel.textSize = 2.0
  this.aModeLabel.fontColor = this.hModeLabel.fontColor = 'rgba(0, 0, 0, 0.5)';
  this.sModeLabel.fontColor = 'rgba(0, 255, 0, 1.0)';
  this.aModeLabel.fontFamily = this.hModeLabel.fontFamily = this.sModeLabel.fontFamily = 'Consolas';

  this.autoSolverMode = false;
  this.hintMode = false;
  this.solvableMode = true;
  this.cellRow = this.cellCol = this.mineRatio = null;
  this.clickListenComponents = this.contextMenuListenComponents = this.renderComponents = null;
}
MineSweeper.prototype = {
  dbWidth: function(){return (canvas.width < canvas.height ? canvas.width : canvas.height) / 2},
  dbHeight: function(){return (canvas.width < canvas.height ? canvas.width : canvas.height) / 8.5},
  counterHeight: function(){return canvas.height / 12},
  reset: function(){
    this.clickListenComponents = [this.easyButton, this.mediumButton, this.hardButton, this.veryHardButton, this.extremeButton];
    this.contextMenuListenComponents = [];
    this.renderComponents = [this.titleLabel, this.easyButton, this.mediumButton, this.hardButton, this.veryHardButton, this.extremeButton];
    render();
  },
  gameSetup: function(){
    var self = this;
    var cellSize = function(row, col){
      var w = canvas.width/col;
      var h = (canvas.height-self.counterHeight()*1.1)/row;
      return w < h ? w : h;
    };
    var counterWidth = function(){return cellSize(9, 9)*2};
    var fieldCellSize = function(){return cellSize(self.cellRow, self.cellCol)}
    var fieldWidth = function(){return fieldCellSize()*self.cellCol};
    var fieldHeight = function(){return fieldCellSize()*self.cellRow};

    this.timer.x = function(){return canvas.width/2+fieldWidth()/2-counterWidth()};
    this.timer.width = counterWidth;
    var fieldX = function(){return canvas.width/2-fieldWidth()/2};
    var fieldY = function(){var h = self.counterHeight(); return h + h/10};
    this.field = new Field(fieldX, fieldY, fieldCellSize, fieldCellSize,
      this.cellRow, this.cellCol, this.mineRatio, this.timer, this);
    this.field.reset();

    var mineCounter = new MineCounter(fieldX, function(){return 0}, counterWidth, this.counterHeight, this.field);
    var resetButton = new ResetButton(function(){return canvas.width/2-counterWidth()}, function(){return 0},
    function(){return counterWidth()*2}, this.counterHeight, this.field);

    this.aModeLabel.x = this.hModeLabel.x = this.sModeLabel.x = function(){return fieldX()-counterWidth()/5};
    this.aModeLabel.y = function(){return fieldHeight()/50};
    this.hModeLabel.y = function(){return fieldHeight()*3.5/50};
    this.sModeLabel.y = function(){return fieldHeight()*6/50};
    this.aModeLabel.width = this.hModeLabel.width = this.sModeLabel.width = function(){return counterWidth()/10};

    this.clickListenComponents = [this.field, resetButton];
    this.contextMenuListenComponents = [this.field];
    this.renderComponents = [this.timer, this.aModeLabel, this.hModeLabel, this.sModeLabel, this.field, mineCounter, resetButton];

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
  },
  undo: function(){
    if(this.field) this.field.undo();
  },
  redo: function(){
    if(this.field) this.field.redo();
  },
  draw: function(ctx){
    this.renderComponents.forEach(function(component){
      component.draw(ctx);
    });
  },
  swithAutoSolverMode: function(){
    this.autoSolverMode = !this.autoSolverMode;
    if(this.autoSolverMode) this.aModeLabel.fontColor = 'rgba(0, 255, 0, 1.0)';
    else this.aModeLabel.fontColor = 'rgba(0, 0, 0, 0.5)';
    render();
  },
  swichHintMode: function(){
    this.hintMode = !this.hintMode;
    if(this.hintMode) this.hModeLabel.fontColor = 'rgba(0, 255, 0, 1.0)';
    else this.hModeLabel.fontColor = 'rgba(0, 0, 0, 0.5)';
    render();
  },
  switchSolvableMode: function(){
    this.solvableMode = !this.solvableMode;
    if(this.solvableMode) this.sModeLabel.fontColor = 'rgba(0, 255, 0, 1.0)';
    else this.sModeLabel.fontColor = 'rgba(0, 0, 0, 0.5)';
    render();
  }
}

/*
  フィールド
*/
function Field(x, y, cellWidth, cellHeight, cellRow, cellCol, mineRatio, timer, mineSweeper){
  this.x = x, this.y = y;
  this.cellWidth = cellWidth, this.cellHeight = cellHeight;
  this.cellRow = cellRow, this.cellCol = cellCol;
  this.mineRatio = mineRatio;
  this.cells = null;
  this.started = false;
  this.ended = false;
  this.gameCleared = false;
  this.timer = timer;
  this.mineSweeper = mineSweeper;
  this.undoList = [];
  this.redoList = [];
  this.autoSolveInterval = 30;
  this.autoSolverController = new function(){this.running = false};
}
Field.prototype = {
  getMineNum: function(){return Math.floor(this.cellRow * this.cellCol * this.mineRatio)},
  getMarkNum: function(){return this.getFilterdCells(function(fc){return fc.marked}).length},
  getFoundMinesNum: function(){return this.getFilterdCells(function(fc){return fc.probability > 0.99}).length;},
  click : function(x, y){
    var startTime = Date.now();
    this.clickCell(this.getCellXY(x, y));
    console.log(Date.now()-startTime);
    render();
  },
  clickCell : function(cell){
    if(!this.ended){
      if(cell && !cell.marked && !cell.uncovered){
        if(!this.started){
          this.start(cell);
        }
        this.undoList.push(this.cloneCells());
        this.redoList = [];
        if(cell.isMine){
          this.mineBang();
        }else if(!cell.uncovered){
          this.uncoverCell(cell);
        }
        if(this.checkGameClear()) this.gameClear();
      }
      if(mineSweeper.autoSolverMode) this.autoSolve();
    }
  },
  contextMenu : function(x, y){
    this.contextMenuCell(this.getCellXY(x, y));
    render();
  },
  contextMenuCell : function(cell){
    if(!this.ended && cell && !cell.uncovered){
      if(!this.started){
        this.start(cell);
      }
      this.undoList.push(this.cloneCells());
      this.redoList = [];
      cell.mark();
    }
  },
  undo : function(){
    if(this.undoList.length > 0){
      if(this.ended || this.gameCleared){
        this.ended = this.gameCleared = false;
        this.timer.resume();
      }
      this.redoList.push(this.cloneCells());
      this.cells = this.undoList.pop();
      if(this.undoList.length <= 0) this.reset();
      render();
      }
  },
  redo : function(){
    if(this.redoList.length > 0){
      this.undoList.push(this.cloneCells());
      this.cells = this.redoList.pop();
      if(this.getFilterdCells(function(fc){return fc.isMine && fc.uncovered}).length > 0){
        this.mineBang();
      }
      if(this.checkGameClear()) this.gameClear();
      render();
    }
  },
  reset : function(){
    var cells = [];
    for(row = 0; row < this.cellRow; row++){
      var rowCells = []
      for(col = 0; col < this.cellCol; col++){
        rowCells.push(new Cell(this, row, col));
      }
      cells.push(rowCells);
    }
    this.cells = cells;
    this.started = false;
    this.ended = false;
    this.gameCleared = false;
    this.timer.stop();
    this.timer.time = 0;
    this.undoList = [];
    this.redoList = [];
    this.autoSolverController.running = false;
    this.autoSolverController = new function(){this.running = false};
  },
  setMines : function(settableCells){
    settableCells.forEach(function(sc){
      sc.isMine = false;
    });
    var setted = 0;
    var retainMinesNum = this.getMineNum()-this.getFoundMinesNum();
    while(setted < retainMinesNum){
      var cc = settableCells[Math.floor(Math.random() * settableCells.length)];
      if(!cc.isMine){
        cc.isMine = true;
        setted++;
      }
    }
    this.updateNeighborMinesNum();
  },
  setSolvableMines : function(orgCell){
    var self = this;
    var orgRow = orgCell.row, orgCol = orgCell.col;
    orgCell.getNeighborCells().concat([orgCell]).forEach(function(nc){nc.uncovered = true;});
    var startCells = this.cloneCells();
    var noUncoverTimes = 0;
    while(!(this.checkGameClear() || this.getMineNum() == this.getFoundMinesNum())){
      settableCells = this.getFilterdCells(function(fc){return !fc.uncovered && fc.probability < 0.99});
      this.setMines(settableCells);
      this.updateMineProbability();
      var safeCells = this.getFilterdCells(function(fc){return !fc.uncovered && fc.probability < 0.01});
      if(safeCells.length <= 0){
        if(++noUncoverTimes > 10){
          this.cells = startCells;
          startCells = this.cloneCells();
          noUncoverTimes = 0;
        }
      }else{
        noUncoverTimes = 0;
      }
      while(safeCells.length > 0){
        safeCells.forEach(function(ucc){self.uncoverCell(ucc)});
        safeCells = this.getFilterdCells(function(fc){return !fc.uncovered && fc.probability < 0.01});
      }
    }
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        cell.uncovered = cell.marked = false;
        cell.probability = this.mineRatio;
      }
    }
    orgCell.uncovered = orgCell.marked = false;
    this.cells[orgRow][orgCol] = orgCell;
  },
  updateNeighborMinesNum : function(){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        var neighborMines = 0;
        cell.getNeighborCells().forEach(function(nc){
          if(nc.isMine) neighborMines++;
        });
        cell.neighborMines = neighborMines;
      }
    }
  },
  autoSolve : function(){
    this.autoSolverController.running = !this.autoSolverController.running;
    if(this.autoSolverController.running){
      var self = this;
      var controller = this.autoSolverController;
      var mineCells = this.getFilterdCells(function(fc){return !fc.marked && fc.probability > 0.99});
      var safeCells = this.getFilterdCells(function(fc){return !fc.uncovered && fc.probability < 0.01});
      var act = function(){
        var updated = false;
        if(!controller.running){
          return;
        }
        if(mineCells.length > 0){
          var cell = mineCells.pop();
          while(cell && cell.marked) cell = mineCells.pop();
          if(cell){
            self.contextMenuCell(cell);
            updated = true;
          }
        }else if(safeCells.length > 0){
          var cell = safeCells.pop();
          while(cell && cell.uncovered) cell = safeCells.pop();
          if(cell){
            self.uncoverCell(cell);
            updated = true;
          }
        }
        if(updated){
          if(self.checkGameClear()) self.gameClear();
          render();
          if(controller.running) setTimeout(act, self.autoSolveInterval);
        }else{
          mineCells = self.getFilterdCells(function(fc){return !fc.marked && fc.probability > 0.99});
          safeCells = self.getFilterdCells(function(fc){return !fc.uncovered && fc.probability < 0.01});
          if(mineCells.length <= 0 && safeCells.length <= 0){
            return;
          }else{
            setTimeout(act, 0);
          }
        }
      };
      setTimeout(act, this.autoSolveInterval);
    }
  },
  uncoverCell : function(cell){
    var stack = [];
    if(!cell.uncovered) stack.push(cell);
    while(stack.length > 0){
      var cc = stack.pop();
      cc.uncover();
      if(cc.neighborMines <= 0){
        cc.getNeighborCells().forEach(function(nc){
          if(!nc.uncovered && !stack.include(nc)){
            stack.push(nc);
          }
        });
      }
    }
    this.updateMineProbability();
  },
  updateMineProbability : function(){
    var self = this;
    var stack = [];
    this.getFilterdCells(function(fc){return fc.uncovered}).forEach(function(ucc){
      if(ucc.neighborMines > 0 && !stack.include(ucc)){
        stack.push(ucc);
      }
    });
    var needOnce = false;
    var checkedCells = [];
    stack.forEach(function(cc){
      var mineNum = 0, noMineNum = 0, coveredCells = [];
      cc.getNeighborCells().forEach(function(nc){
        if(nc.probability > 0.99){
          mineNum++;
        }else if(nc.probability > 0.01){
          if(!checkedCells.include(nc)){
            checkedCells.push(nc);
          }
          if(!nc.uncovered){
            coveredCells.push(nc);
          }
        }
      });
      var probability = (cc.neighborMines-mineNum)/coveredCells.length;
      coveredCells.forEach(function(coveredCell){
        if(probability < 0.01 || 0.99 < probability){
          coveredCell.probability = probability;
          needOnce = true;
        }else{
          coveredCell.probability = coveredCell.probability*0.7 + probability*0.3;
        }
      });
    });
    if(needOnce) this.updateMineProbability();
  },
  draw : function(ctx){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        this.cells[row][col].draw(ctx);
      }
    }
    if(this.gameCleared){
      var x = canvas.width/2, y = canvas.height/2;
      var width = this.cellWidth()*this.cellCol, height = this.cellHeight()*this.cellRow;
      ctx.beginPath();
      ctx.font = 'bold '+String(Math.floor(width*0.25))+'px Century Gothic';
      ctx.shadowColor = "white";
      ctx.shadowOffsetX = ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 5;
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
      ctx.fillText('Clear!', x, y);
      ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.00)';;
      ctx.strokeText('Clear!', x, y);
    }
  },
  start : function(cell){
    if(mineSweeper.solvableMode){
      this.setSolvableMines(cell);
    }else{
      var noMinesCells = cell.getNeighborCells().concat([cell]);
      this.setMines(this.getFilterdCells(function(fc){return !noMinesCells.include(fc)}));
    }
    this.started = true;
    this.timer.start();
  },
  end : function(){
    this.ended = true;
    this.timer.stop();
    this.autoSolverController.running = false;
  },
  getCellXY : function(x, y){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        if(cell.x() < x && x < cell.x() + this.cellWidth()){
          if(cell.y() < y && y < cell.y() + this.cellHeight()){
            return cell;
          }
        }
      }
    }
    return null;
  },
  getFilterdCells: function(filter){
    var cells = [];
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        if(filter(this.cells[row][col])) cells.push(this.cells[row][col]);
      }
    }
    return cells;
  },
  cloneCells: function(){
    var cells = [];
    for(row = 0; row < this.cellRow; row++){
      var rowCells = [];
      for(col = 0; col < this.cellCol; col++){
        rowCells.push(this.cells[row][col].clone());
      }
      cells.push(rowCells);
    }
    return cells;
  },
  checkGameClear : function(){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        if(!cell.uncovered && !cell.isMine){
          return false;
        }
      }
    }
    return true;
  },
  gameClear: function(){
    this.gameCleared = true;
    this.end();
  },
  mineBang : function(){
    this.getFilterdCells(function(fc){return fc.isMine}).forEach(function(mc){
      mc.uncovered = true;
    });
    this.end();
  }
}

/*
  セル
*/
function Cell(field, row, col){
  this.field = field;
	this.row = row, this.col = col;
	this.uncovered = false;
  this.marked = false;
  this.isMine = false;
  this.neighborMines = 0;
  this.probability = this.field.mineRatio;
}
Cell.prototype = {
  margin: function(){return (this.field.cellWidth() < this.field.cellHeight() ?
    this.field.cellHeight() : this.field.cellWidth())/10},
  width: function(){return this.field.cellWidth()-this.margin()},
  height: function(){return this.field.cellHeight()-this.margin()},
  x: function(){return this.field.x()+this.col*(this.width()+this.margin())+this.margin()/2},
  y: function(){return this.field.y()+this.row*(this.height()+this.margin())+this.margin()/2},
  uncover: function(){
    if(!this.uncovered){
      this.uncovered = true;
    }
  },
  mark: function(){
    this.marked = !this.marked;
  },
  draw: function(ctx){
    var x = this.x(), y = this.y(), width = this.width(), height = this.height();
    ctx.beginPath();
    if(this.uncovered){
      if(this.isMine){
        ctx.fillStyle = 'rgba(255, 50, 75, 0.75)';
      }else{
        ctx.fillStyle = 'rgba(0, 50, 100, 0.75)';
      }
    }else{
      if(this.marked){
        ctx.fillStyle = 'rgba(50, 200, 50, 0.75)';
      }else{
        if(this.field.mineSweeper.hintMode){
          var field = this.field;
          var prob = this.probability < 0 ? 0 : (1 < this.probability ? 1 : this.probability);
          var mR = field.mineRatio;
          var r = Math.floor(50 + (prob < mR ? 0 : (prob-mR)/(1-mR)*205));
          var g = Math.floor(100 + (prob > mR ? 0 : (1-prob/mR)*55));
          var b = Math.floor(200 + (prob > mR ? 0 : (1-prob/mR)*55));
          ctx.fillStyle = 'rgba('+String(r)+', '+String(g)+', '+String(b)+', 0.75)';
        }else if(this.field.ended && this.probability < 0.01){
          ctx.fillStyle = 'rgba(50, 155, 255, 0.75)';
        }else{
          ctx.fillStyle = 'rgba(50, 100, 200, 0.75)';
        }
      }
    }

    ctx.rect(x, y, width, height);
    ctx.fill();

    if(this.uncovered && !this.isMine && this.neighborMines > 0){
      ctx.beginPath();
      ctx.font = 'bold '+String(Math.floor(width*0.7))+'px Century Gothic';
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
      ctx.fillText(String(this.neighborMines), x+width/2, y+height/2);
    }
  },
  getNeighborCells: function(){
    var row = this.row, col = this.col;
    var cells = [], field = this.field;
    var neighborPos = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    for(i = 0; i < 8; i++){
      var d = neighborPos[i];
      if(0 <= row+d[0] && row+d[0] < field.cellRow && 0 <= col+d[1] && col+d[1] < field.cellCol){
        cells.push(field.cells[row+d[0]][col+d[1]]);
      }
    }
    return cells;
  },
  clone: function(){
    var copy = new Cell(this.field);
    for (var attr in this) {
        if (this.hasOwnProperty(attr)) copy[attr] = this[attr];
    }
    return copy;
  }
};

/*
  ラベル
*/
function Label(x, y, width, height, text){
  this.x = x, this.y = y;
  this.width = width, this.height = height;
  this.text = text;
  this.textSize = 0.07;
  this.fontFamily = 'Century Gothic';
  this.fontStyle = '';
  this.fontColor = 'rgba(255, 255, 255, 1.00)';
  this.bgColor = 'rgba(0, 0, 0, 0)';
}
Label.prototype = {
  draw: function(ctx){
    var x = this.x(), y = this.y(), width = this.width(), height = this.height();
    ctx.beginPath();
    ctx.fillStyle = this.bgColor;
    ctx.rect(x, y, width, height);
    ctx.fill();

    ctx.beginPath();
    ctx.font = this.fontStyle+' '+String(Math.floor(width*this.textSize))+'px '+this.fontFamily;
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.fontColor;
    ctx.fillText(this.text(), x+width/2, y+height/2);
  }
}

/*
  地雷カウンター
*/
function MineCounter(x, y, width, height, field){
  Label.call(this, x, y, width, height, function(){return String(this.field.getMineNum()-this.field.getMarkNum())});
  this.bgColor = 'rgba(0, 0, 100, 0.75)';
  this.textSize = 0.35;
  this.field = field;
}
MineCounter.prototype = Object.create(Label.prototype);

/*
  タイマー
*/
function Timer(x, y, width, height){
  Label.call(this, x, y, width, height, function(){return String(this.time)});
  this.bgColor = 'rgba(0, 0, 100, 0.75)';
  this.textSize = 0.35;
  this.timer = null;
  this.time = 0;
}
Timer.prototype = Object.create(Label.prototype, {
  start: {configurable: true, value: function(){
    this.time = 0;
    var self = this;
    this.timer = setInterval(function(){self.update()}, 1000);
  }},
  resume: {configurable: true, value: function(){
    var self = this;
    this.timer = setInterval(function(){self.update()}, 1000);
  }},
  stop: {configurable: true, value: function(){
    clearInterval(this.timer);
  }},
  update:  {configurable: true, value: function(){
    this.time++;
    render();
  }}
});

/*
  ボタン
*/
function Button(x, y, width, height, text, action){
  Label.call(this, x, y, width, height, text);
  this.action = action;
}
Button.prototype = Object.create(Label.prototype, {
  click: {configurable: true, value: function(x, y){
    if(this.x() < x && x < this.x() + this.width()){
      if(this.y() < y && y < this.y() + this.height()){
        this.action();
      }
    }
  }}
});

/*
  リセットボタン
*/
function ResetButton(x, y, width, height, field){
  Button.call(this, x, y, width, height, function(){return "Reset"}, function(){field.reset(); render()});
  this.bgColor = 'rgba(20, 40, 80, 0.75)';
  this.textSize = 0.2;
  this.field = field;
}
ResetButton.prototype = Object.create(Button.prototype);

/*
  難易度ボタン
*/
function DifficultyButton(x, y, width, height, cellRow, cellCol, mineRatio, text, mineSweeper){
  Button.call(this, x, y, width, height, function(){return text}, function(){
    mineSweeper.cellRow = cellRow;
    mineSweeper.cellCol = cellCol;
    mineSweeper.mineRatio = mineRatio;
    mineSweeper.gameSetup();
  });
  this.bgColor = 'rgba(20, 40, 80, 0.75)';
  this.textSize = 0.1;
  this.cellRow = cellRow;
  this.cellCol = cellCol;
  this.mineRatio = mineRatio;
  this.mineSweeper = mineSweeper
}
DifficultyButton.prototype = Object.create(Button.prototype);
