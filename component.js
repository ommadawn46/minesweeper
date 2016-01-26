/*
  マインスイーパー
*/
function MineSweeper(){
  var self = this;
  var getDbMargin = function(){return self.getDbHeight()/3};

  this.titleLabel = new Label(function(){return canvas.width/2-self.getDbWidth()*1.375}, getDbMargin,
  function(){return self.getDbWidth()*2.75}, this.getDbHeight, function(){return "Logical Minesweeper"});
  this.titleLabel.fontStyle = 'italic';
  this.titleLabel.fontColor = 'rgba(0, 0, 0, 1)';

  var getButtonX = function(){return canvas.width/2-self.getDbWidth()/2};
  this.easyButton = new DifficultyButton(getButtonX, function(){return self.getDbHeight()+getDbMargin()*2}, this.getDbWidth, this.getDbHeight,
                    9, 9, 10/81, 'Easy', this); // 0.12345679
  this.mediumButton = new DifficultyButton(getButtonX, function(){return self.getDbHeight()*2+getDbMargin()*3}, this.getDbWidth, this.getDbHeight,
                    16, 16, 40/256, 'Medium', this); // 0.15625
  this.hardButton = new DifficultyButton(getButtonX, function(){return self.getDbHeight()*3+getDbMargin()*4}, this.getDbWidth, this.getDbHeight,
                    16, 30, 99/480, 'Hard', this); // 0.20625
  this.veryHardButton = new DifficultyButton(getButtonX, function(){return self.getDbHeight()*4+getDbMargin()*5}, this.getDbWidth, this.getDbHeight,
                    24, 48, 256/1152, 'Very Hard', this); // 0.22222
  this.extremeButton = new DifficultyButton(getButtonX, function(){return self.getDbHeight()*5+getDbMargin()*6}, this.getDbWidth, this.getDbHeight,
                    32, 64, 512/2048, 'Extreme', this); // 0.25

  this.field = null;
  this.timer = new Timer(null, function(){return 0}, null, this.getCounterHeight);
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
  getDbWidth: function(){return (canvas.width < canvas.height ? canvas.width : canvas.height) / 2},
  getDbHeight: function(){return (canvas.width < canvas.height ? canvas.width : canvas.height) / 8.5},
  getCounterHeight: function(){return canvas.height / 12},
  reset: function(){
    this.clickListenComponents = [this.easyButton, this.mediumButton, this.hardButton, this.veryHardButton, this.extremeButton];
    this.contextMenuListenComponents = [];
    this.renderComponents = [this.titleLabel, this.easyButton, this.mediumButton, this.hardButton, this.veryHardButton, this.extremeButton];
    render();
  },
  gameSetup: function(){
    var self = this;
    var getCellSize = function(row, col){
      var w = canvas.width/col;
      var h = (canvas.height-self.getCounterHeight()*1.1)/row;
      return w < h ? w : h;
    };
    var getCounterWidth = function(){return getCellSize(9, 9)*2};
    var getFieldCellSize = function(){return getCellSize(self.cellRow, self.cellCol)}
    var getFieldWidth = function(){return getFieldCellSize()*self.cellCol};
    var getFieldHeight = function(){return getFieldCellSize()*self.cellRow};

    this.timer.getX = function(){return canvas.width/2+getFieldWidth()/2-getCounterWidth()};
    this.timer.getWidth = getCounterWidth;
    var getFieldX = function(){return canvas.width/2-getFieldWidth()/2};
    var getFieldY = function(){var h = self.getCounterHeight(); return h + h/10};
    this.field = new Field(getFieldX, getFieldY, getFieldCellSize, getFieldCellSize,
      this.cellRow, this.cellCol, this.mineRatio, this.timer, this);
    this.field.reset();

    var mineCounter = new MineCounter(getFieldX, function(){return 0}, getCounterWidth, this.getCounterHeight, this.field);
    var resetButton = new ResetButton(function(){return canvas.width/2-getCounterWidth()}, function(){return 0},
    function(){return getCounterWidth()*2}, this.getCounterHeight, this.field);

    this.aModeLabel.getX = this.hModeLabel.getX = this.sModeLabel.getX = function(){return getFieldX()-getCounterWidth()/5};
    this.aModeLabel.getY = function(){return getFieldHeight()/50};
    this.hModeLabel.getY = function(){return getFieldHeight()*3.5/50};
    this.sModeLabel.getY = function(){return getFieldHeight()*6/50};
    this.aModeLabel.getWidth = this.hModeLabel.getWidth = this.sModeLabel.getWidth = function(){return getCounterWidth()/10};

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
function Field(getX, getY, getCellWidth, getCellHeight, cellRow, cellCol, mineRatio, timer, mineSweeper){
  this.getX = getX, this.getY = getY;
  this.getCellWidth = getCellWidth, this.getCellHeight = getCellHeight;
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
  this.autoSolveInterval = 25;
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
  draw : function(ctx){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        this.cells[row][col].draw(ctx);
      }
    }
    if(this.gameCleared){
      var x = canvas.width/2, y = canvas.height/2;
      var width = this.getCellWidth()*this.cellCol, height = this.getCellHeight()*this.cellRow;
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
        cell.uncovered = cell.certainNeighbor = false;
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
    if(this.autoSolverController.running && !this.ended){
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
            self.undoList.push(self.cloneCells());
            self.redoList = [];
            cell.mark();
            updated = true;
          }
        }else if(safeCells.length > 0){
          var cell = safeCells.pop();
          while(cell && cell.uncovered) cell = safeCells.pop();
          if(cell){
            self.undoList.push(self.cloneCells());
            self.redoList = [];
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
          if(mineCells.length > 0 || safeCells.length > 0){
            setTimeout(act, 0);
          }else{
            if(self.getMineNum() == self.getFoundMinesNum()){
              safeCells = self.getFilterdCells(function(fc){return !fc.uncovered && fc.probability < 0.99});
              setTimeout(act, 0);
            }else{
              controller.running = false;
              return;
            }
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
    var stack = this.getFilterdCells(function(fc){
      return fc.uncovered && fc.neighborMines > 0 && !fc.certainNeighbor;
    });
    var needOnce = false;
    stack.forEach(function(cc){
      var mineNum = 0, noMineNum = 0, coveredCells = [];
      cc.getNeighborCells().forEach(function(nc){
        if(!nc.uncovered){
          if(nc.probability > 0.99){
            mineNum++;
          }else if(nc.probability > 0.01){
            coveredCells.push(nc);
          }
        }
      });
      var probability = (cc.neighborMines-mineNum)/coveredCells.length;
      if(probability < 0.01 || 0.99 < probability) cc.certainNeighbor = true;
      coveredCells.forEach(function(coveredCell){
        if(cc.certainNeighbor){
          coveredCell.probability = probability;
          needOnce = true;
        }else{
          coveredCell.probability = coveredCell.probability*0.7 + probability*0.3;
        }
      });
    });
    if(needOnce) this.updateMineProbability();
  },
  getCellXY : function(x, y){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        var cell = this.cells[row][col];
        if(cell.getX() < x && x < cell.getX() + this.getCellWidth()){
          if(cell.getY() < y && y < cell.getY() + this.getCellHeight()){
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
  this.certainNeighbor = false;
}
Cell.prototype = {
  getMargin: function(){return (this.field.getCellWidth() < this.field.getCellHeight() ?
    this.field.getCellHeight() : this.field.getCellWidth())/10},
  getWidth: function(){return this.field.getCellWidth()-this.getMargin()},
  getHeight: function(){return this.field.getCellHeight()-this.getMargin()},
  getX: function(){return this.field.getX()+this.col*(this.getWidth()+this.getMargin())+this.getMargin()/2},
  getY: function(){return this.field.getY()+this.row*(this.getHeight()+this.getMargin())+this.getMargin()/2},
  uncover: function(){
    if(!this.uncovered){
      this.uncovered = true;
    }
  },
  mark: function(){
    this.marked = !this.marked;
  },
  draw: function(ctx){
    var x = this.getX(), y = this.getY(), width = this.getWidth(), height = this.getHeight();
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
function Label(getX, getY, getWidth, getHeight, getText){
  this.getX = getX, this.getY = getY;
  this.getWidth = getWidth, this.getHeight = getHeight;
  this.getText = getText;
  this.textSize = 0.07;
  this.fontFamily = 'Century Gothic';
  this.fontStyle = '';
  this.fontColor = 'rgba(255, 255, 255, 1.00)';
  this.bgColor = 'rgba(0, 0, 0, 0)';
}
Label.prototype = {
  draw: function(ctx){
    var x = this.getX(), y = this.getY(), width = this.getWidth(), height = this.getHeight();
    ctx.beginPath();
    ctx.fillStyle = this.bgColor;
    ctx.rect(x, y, width, height);
    ctx.fill();

    ctx.beginPath();
    ctx.font = this.fontStyle+' '+String(Math.floor(width*this.textSize))+'px '+this.fontFamily;
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.fontColor;
    ctx.fillText(this.getText(), x+width/2, y+height/2);
  }
}

/*
  地雷カウンター
*/
function MineCounter(getX, getY, getWidth, getHeight, field){
  Label.call(this, getX, getY, getWidth, getHeight, function(){return String(this.field.getMineNum()-this.field.getMarkNum())});
  this.bgColor = 'rgba(0, 0, 100, 0.75)';
  this.textSize = 0.35;
  this.field = field;
}
MineCounter.prototype = Object.create(Label.prototype);

/*
  タイマー
*/
function Timer(getX, getY, getWidth, getHeight){
  Label.call(this, getX, getY, getWidth, getHeight, function(){return String(this.time)});
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
function Button(getX, getY, getWidth, getHeight, getText, action){
  Label.call(this, getX, getY, getWidth, getHeight, getText);
  this.action = action;
}
Button.prototype = Object.create(Label.prototype, {
  click: {configurable: true, value: function(x, y){
    if(this.getX() < x && x < this.getX() + this.getWidth()){
      if(this.getY() < y && y < this.getY() + this.getHeight()){
        this.action();
      }
    }
  }}
});

/*
  リセットボタン
*/
function ResetButton(getX, getY, getWidth, getHeight, field){
  Button.call(this, getX, getY, getWidth, getHeight, function(){return "Reset"}, function(){field.reset(); render()});
  this.bgColor = 'rgba(20, 40, 80, 0.75)';
  this.textSize = 0.2;
  this.field = field;
}
ResetButton.prototype = Object.create(Button.prototype);

/*
  難易度ボタン
*/
function DifficultyButton(getX, getY, getWidth, getHeight, cellRow, cellCol, mineRatio, text, mineSweeper){
  Button.call(this, getX, getY, getWidth, getHeight, function(){return text}, function(){
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
