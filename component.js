/*
  コンポーネントクラス

  フィールド:
    x: x座標
    y: y座標
    width: 幅
    height: 高さ

  メソッド:
    resize(x, y, width, height): リサイズ
    mouseMove(x, y): マウス移動
    click(x, y): 左クリック
    contextMenu(x, y): 右クリック
    draw(ctx): 描画
*/

/*
  マインスイーパークラス
*/
function MineSweeper(x, y, width, height){
  this.x = x, this.y = y;
  this.width = width, this.height = height;
  var self = this;
  var getDbWidth = function(){return (self.width < self.height ? self.width : self.height) / 2};
  var getDbHeight = function(){return (self.width < self.height ? self.width : self.height) / 8.5};
  var getDbMargin = function(){return getDbHeight()/3};

  this.titleLabel = new Label(function(){return self.x+self.width/2-getDbWidth()*1.375}, function(){return self.y+getDbMargin()},
  function(){return getDbWidth()*2.75}, getDbHeight, function(){return "Logical Minesweeper"});
  this.titleLabel.fontStyle = 'italic';
  this.titleLabel.fontColor = 'rgba(0, 0, 0, 1)';

  var getButtonX = function(){return self.x+self.width/2-getDbWidth()/2};
  this.easyButton = new DifficultyButton(getButtonX, function(){return self.y+getDbHeight()+getDbMargin()*2}, getDbWidth, getDbHeight,
                    9, 9, 10/81, 'Easy', this); // 0.12345679
  this.mediumButton = new DifficultyButton(getButtonX, function(){return self.y+getDbHeight()*2+getDbMargin()*3}, getDbWidth, getDbHeight,
                    16, 16, 40/256, 'Medium', this); // 0.15625
  this.hardButton = new DifficultyButton(getButtonX, function(){return self.y+getDbHeight()*3+getDbMargin()*4}, getDbWidth, getDbHeight,
                    16, 30, 99/480, 'Hard', this); // 0.20625
  this.veryHardButton = new DifficultyButton(getButtonX, function(){return self.y+getDbHeight()*4+getDbMargin()*5}, getDbWidth, getDbHeight,
                    24, 48, 256/1152, 'Very Hard', this); // 0.22222
  this.extremeButton = new DifficultyButton(getButtonX, function(){return self.y+getDbHeight()*5+getDbMargin()*6}, getDbWidth, getDbHeight,
                    32, 64, 512/2048, 'Extreme', this); // 0.25

  this.field = null;
  this.timer = new Timer(null, function(){return self.y}, null, null);
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

  this.reset();
}
MineSweeper.prototype = {
  // 難易度選択画面へ戻る
  reset: function(){
    this.mouseMoveListenComponents = [this.easyButton, this.mediumButton, this.hardButton, this.veryHardButton, this.extremeButton];
    this.clickListenComponents = [this.easyButton, this.mediumButton, this.hardButton, this.veryHardButton, this.extremeButton];
    this.contextMenuListenComponents = [];
    this.renderComponents = [this.titleLabel, this.easyButton, this.mediumButton, this.hardButton, this.veryHardButton, this.extremeButton];
    this.resize(this.x, this.y, this.width, this.height);
  },
  // ゲームをセットアップする
  gameSetup: function(){
    var self = this;
    var getCounterHeight = function(){return self.height / 12};
    var getCellSize = function(row, col){
      var w = self.width/col;
      var h = (self.height-getCounterHeight()*1.1)/row;
      return w < h ? w : h;
    };
    var getCounterWidth = function(){return getCellSize(9, 9)*2};
    var getFieldCellSize = function(){return getCellSize(self.cellRow, self.cellCol)}
    var getFieldWidth = function(){return getFieldCellSize()*self.cellCol};
    var getFieldHeight = function(){return getFieldCellSize()*self.cellRow};

    this.timer.getX = function(){return self.x+self.width/2+getFieldWidth()/2-getCounterWidth()};
    this.timer.getWidth = getCounterWidth; this.timer.getHeight = getCounterHeight;
    this.timer.resize();
    var getFieldX = function(){return self.x+self.width/2-getFieldWidth()/2};
    var getFieldY = function(){var h = getCounterHeight(); return self.y+h*1.1};
    this.field = new Field(getFieldX, getFieldY, getFieldCellSize, getFieldCellSize,
      this.cellRow, this.cellCol, this.mineRatio, this.timer, this);
    this.field.reset();

    var mineCounter = new MineCounter(getFieldX, function(){return self.y}, getCounterWidth, getCounterHeight, this.field);
    var resetButton = new ResetButton(function(){return self.x+self.width/2-getCounterWidth()}, function(){return self.y},
    function(){return getCounterWidth()*2}, getCounterHeight, this.field);

    this.aModeLabel.getX = this.hModeLabel.getX = this.sModeLabel.getX = function(){return getFieldX()-getCounterWidth()/5};
    this.aModeLabel.getY = function(){return self.y+getFieldHeight()/50};
    this.hModeLabel.getY = function(){return self.y+getFieldHeight()*3.5/50};
    this.sModeLabel.getY = function(){return self.y+getFieldHeight()*6/50};
    this.aModeLabel.getWidth = this.hModeLabel.getWidth = this.sModeLabel.getWidth = function(){return getCounterWidth()/10};
    this.aModeLabel.resize(); this.hModeLabel.resize(); this.sModeLabel.resize();

    this.mouseMoveListenComponents = [this.field, resetButton];
    this.clickListenComponents = [this.field, resetButton];
    this.contextMenuListenComponents = [this.field];
    this.renderComponents = [this.timer, this.aModeLabel, this.hModeLabel, this.sModeLabel, this.field, mineCounter, resetButton];

    render();
  },
  // リサイズ
  resize: function(x, y, width, height){
    this.x = x, this.y = y;
    this.width = width, this.height = height;
    this.renderComponents.forEach(function(component){
      component.resize();
    });
  },
  // マウス移動
  mouseMove: function(x, y){
    this.mouseMoveListenComponents.forEach(function(component){
      component.mouseMove(x, y);
    });
  },
  // 左クリック
  click: function(x, y){
    this.clickListenComponents.forEach(function(component){
      component.click(x, y);
    })
  },
  // 右クリック
  contextMenu: function(x, y){
    this.contextMenuListenComponents.forEach(function(component){
      component.contextMenu(x, y);
    })
  },
  // 取り消し
  undo: function(){
    if(this.field) this.field.undo();
  },
  // やり直し
  redo: function(){
    if(this.field) this.field.redo();
  },
  // 描画
  draw: function(ctx){
    this.renderComponents.forEach(function(component){
      component.draw(ctx);
    });
  },
  // オートソルバーの切り換え
  swithAutoSolverMode: function(){
    this.autoSolverMode = !this.autoSolverMode;
    if(this.autoSolverMode) this.aModeLabel.fontColor = 'rgba(0, 255, 0, 1.0)';
    else this.aModeLabel.fontColor = 'rgba(0, 0, 0, 0.5)';
  },
  // ヒント表示の切り換え
  swichHintMode: function(){
    this.hintMode = !this.hintMode;
    if(this.hintMode) this.hModeLabel.fontColor = 'rgba(0, 255, 0, 1.0)';
    else this.hModeLabel.fontColor = 'rgba(0, 0, 0, 0.5)';
  },
  // 論理的盤面作成モードの切り換え
  switchSolvableMode: function(){
    this.solvableMode = !this.solvableMode;
    if(this.solvableMode) this.sModeLabel.fontColor = 'rgba(0, 255, 0, 1.0)';
    else this.sModeLabel.fontColor = 'rgba(0, 0, 0, 0.5)';
  }
}

/*
  フィールドクラス
*/
function Field(getX, getY, getCellWidth, getCellHeight, cellRow, cellCol, mineRatio, timer, mineSweeper){
  this.getX = getX, this.getY = getY;
  this.getCellWidth = getCellWidth, this.getCellHeight = getCellHeight;
  this.cellRow = cellRow, this.cellCol = cellCol;
  this.resize();

  this.mineRatio = mineRatio;
  this.cells = null;
  this.onMouseCellPos = null;
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
  // 盤面に存在できる地雷の数を返す
  getMineNum: function(){return Math.floor(this.cellRow * this.cellCol * this.mineRatio)},
  // マークしたセルの数を返す
  getMarkNum: function(){return this.getFilterdCells(function(fc){return fc.marked}).length},
  // 地雷であることが確定したセルの数を返す
  getFoundMinesNum: function(){return this.getFilterdCells(function(fc){return fc.probability > 0.99}).length;},
  // リサイズ
  resize : function(){
    this.x = this.getX(), this.y = this.getY();
    this.cellWidth = this.getCellWidth();
    this.cellHeight = this.getCellHeight();
    this.width = this.getCellWidth()*this.cellCol;
    this.height = this.getCellHeight()*this.cellRow;
    if(this.cells){
      for(row = 0; row < this.cellRow; row++){
        for(col = 0; col < this.cellCol; col++){
          this.cells[row][col].resize();
        }
      }
    }
  },
  // マウス移動
  mouseMove: function(x, y){
    if(this.ended){
      return;
    }
    var onMouseCell = this.getCellXY(x, y);
    if(onMouseCell){
      if(this.onMouseCellPos &&
        (onMouseCell.row != this.onMouseCellPos.row || onMouseCell.col != this.onMouseCellPos.col)){
        this.cells[this.onMouseCellPos.row][this.onMouseCellPos.col].isOnMouse = false;
        renderComponent(this.cells[this.onMouseCellPos.row][this.onMouseCellPos.col]);
      }
      this.onMouseCellPos = new function(){this.row = onMouseCell.row; this.col = onMouseCell.col;}
      if(!onMouseCell.isOnMouse){
        onMouseCell.isOnMouse = true;
        renderComponent(onMouseCell);
      }
    }else{
      if(this.onMouseCellPos){
        this.cells[this.onMouseCellPos.row][this.onMouseCellPos.col].isOnMouse = false;
        renderComponent(this.cells[this.onMouseCellPos.row][this.onMouseCellPos.col]);
      }
      this.onMouseCellPos = null;
    }
  },
  // 左クリック
  click : function(x, y){
    this.clickCell(this.getCellXY(x, y));
    render();
  },
  // 左クリック時のセルへのアクション
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
  // 右クリック
  contextMenu : function(x, y){
    this.contextMenuCell(this.getCellXY(x, y));
    render();
  },
  // 右クリック時のセルへのアクション
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
  // 行動を一回取り消す
  undo : function(){
    if(this.undoList.length > 0){
      if(this.ended || this.gameCleared){
        this.ended = this.gameCleared = false;
        this.timer.resume();
      }
      this.redoList.push(this.cloneCells());
      this.cells = this.undoList.pop();
      if(this.undoList.length <= 0) this.reset();
      }
  },
  // 行動を一回やり直す
  redo : function(){
    if(this.redoList.length > 0){
      this.undoList.push(this.cloneCells());
      this.cells = this.redoList.pop();
      if(this.getFilterdCells(function(fc){return fc.isMine && fc.uncovered}).length > 0){
        this.mineBang();
      }
      if(this.checkGameClear()) this.gameClear();
    }
  },
  // ゲームをリセットする
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
  // 描画
  draw : function(ctx){
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        this.cells[row][col].draw(ctx);
      }
    }
    if(this.gameCleared){
      var x = this.mineSweeper.x+this.mineSweeper.width/2;
      var y = this.mineSweeper.y+this.mineSweeper.height/2;
      ctx.font = 'bold '+String(Math.floor(this.width*0.25))+'px Century Gothic';
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
  // 引数のセル配列へ配置できるだけ地雷を配置する
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
  // 論理的に解ける盤面を作成する
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
  // 全てのセルの数字を更新する
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
  // オートソルバーの起動/終了
  autoSolve : function(){
    this.autoSolverController.running = !this.autoSolverController.running;
    if(this.autoSolverController.running){
      var self = this;
      var controller = this.autoSolverController;
      var mineCells = this.getFilterdCells(function(fc){return !fc.marked && fc.probability > 0.99});
      var safeCells = this.getFilterdCells(function(fc){return !fc.uncovered && fc.probability < 0.01});
      var act = function(){
        var updated = false;
        if(!controller.running || self.ended){
          controller.running = false;
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
          if(controller.running) setTimeout(act, self.autoSolveInterval);
          render();
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
  // 引数のセルを開く
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
  // 全てのセルの地雷率を更新する
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
  // 引数の座標に存在するセルを返す
  getCellXY : function(x, y){
    x -= this.x, y -= this.y;
    if(0 < x && x < this.cellWidth*this.cellCol){
      if(0 < y && y < this.cellHeight*this.cellRow){
        return this.cells[Math.floor(y/this.cellHeight)][Math.floor(x/this.cellWidth)];
      }
    }
    return null;
  },
  // 引数の関数がtrueを返すセルを配列に入れて返す
  getFilterdCells: function(filter){
    var cells = [];
    for(row = 0; row < this.cellRow; row++){
      for(col = 0; col < this.cellCol; col++){
        if(filter(this.cells[row][col])) cells.push(this.cells[row][col]);
      }
    }
    return cells;
  },
  // 盤面上のセルを全て複製し2次元配列に入れて返す
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
  // ゲームクリア条件を満たしているかをbool型として返す
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
  // ゲームをクリア状態にし終了する
  gameClear: function(){
    this.gameCleared = true;
    this.end();
  },
  // 爆弾を全て開いてゲームを終了する
  mineBang : function(){
    this.getFilterdCells(function(fc){return fc.isMine}).forEach(function(mc){
      mc.uncovered = true;
    });
    this.end();
  },
  // ゲームを開始する
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
  // ゲームを終了する
  end : function(){
    this.ended = true;
    this.timer.stop();
    this.autoSolverController.running = false;
  }
}

/*
  セルクラス
*/
function Cell(field, row, col){
  this.field = field;
	this.row = row, this.col = col;
  this.resize();

	this.uncovered = false;
  this.marked = false;
  this.isMine = false;
  this.neighborMines = 0;
  this.probability = this.field.mineRatio;
  this.certainNeighbor = false;
  this.isOnMouse = false;
}
Cell.prototype = {
  // セル間の隙間の大きさを返す
  getMargin: function(){return (this.field.getCellWidth() < this.field.getCellHeight() ?
    this.field.getCellHeight() : this.field.getCellWidth())/16},
  // このセルの幅・高さ・座標を返す
  getWidth: function(){return this.field.getCellWidth()-this.getMargin()},
  getHeight: function(){return this.field.getCellHeight()-this.getMargin()},
  getX: function(){return this.field.getX()+this.col*(this.getWidth()+this.getMargin())+this.getMargin()/2},
  getY: function(){return this.field.getY()+this.row*(this.getHeight()+this.getMargin())+this.getMargin()/2},
  // リサイズ
  resize: function(){
    this.margin = this.getMargin();
    this.width = this.getWidth();
    this.height = this.getHeight();
    this.x = this.getX(), this.y = this.getY();
    this.numberFont = 'bold '+String(Math.floor(this.width*0.7))+'px Century Gothic';
  },
  // このセルを開く
  uncover: function(){
    if(!this.uncovered){
      this.uncovered = true;
    }
  },
  // このセルのマーク状態を切り換える
  mark: function(){
    this.marked = !this.marked;
  },
  // 描画
  draw: function(ctx){
    var r = g = b = 0;
    if(this.uncovered){
      if(this.isMine){
        r = 255, g = 50, b = 75;
      }else{
        r = 0, g = 50, b = 100;
      }
    }else{
      if(this.marked){
        r = 50, g = 200, b = 50;
      }else{
        if(this.field.mineSweeper.hintMode){
          var field = this.field;
          var prob = this.probability < 0 ? 0 : (1 < this.probability ? 1 : this.probability);
          var mR = field.mineRatio;
          var r = Math.floor(50 + (prob < mR ? 0 : (prob-mR)/(1-mR)*205));
          var g = Math.floor(100 + (prob > mR ? 0 : (1-prob/mR)*55));
          var b = Math.floor(200 + (prob > mR ? 0 : (1-prob/mR)*55));
        }else if(this.field.ended && this.probability < 0.01){
          r = 50, g = 155, b = 255;
        }else{
          r = 50, g = 100, b = 200;
        }
      }
      if(!this.field.ended && this.isOnMouse){
        r += 15, g += 15, b += 15;
      }
    }
    ctx.fillStyle = 'rgba('+String(r)+', '+String(g)+', '+String(b)+', 0.75)';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    if(this.uncovered && !this.isMine && this.neighborMines > 0){
      ctx.font = this.numberFont;
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255, 255, 255, 1.00)';
      ctx.fillText(String(this.neighborMines), this.x+this.width/2, this.y+this.height/2);
    }
  },
  // このセルの周囲1マスに存在するセルを配列に入れて返す
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
  // このセルのインスタンスを複製して返す
  clone: function(){
    var copy = new Cell(this.field);
    for (var attr in this) {
        if (this.hasOwnProperty(attr)) copy[attr] = this[attr];
    }
    return copy;
  }
};

/*
  ラベルクラス
*/
function Label(getX, getY, getWidth, getHeight, getText){
  this.getX = getX, this.getY = getY;
  this.getWidth = getWidth, this.getHeight = getHeight;
  this.resize();

  this.getText = getText;
  this.textSize = 0.07;
  this.fontFamily = 'Century Gothic';
  this.fontStyle = '';
  this.fontColor = 'rgba(255, 255, 255, 1.00)';
  this.bgColor = 'rgba(0, 0, 0, 0)';
}
Label.prototype = {
  // リサイズ
  resize: function(){
    this.x = this.getX ? this.getX() : null, this.y = this.getY ? this.getY() : null;
    this.width = this.getWidth ? this.getWidth() : null;
    this.height = this.getHeight ? this.getHeight() : null;
  },
  // 描画
  draw: function(ctx){
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.font = this.fontStyle+' '+String(Math.floor(this.width*this.textSize))+'px '+this.fontFamily;
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.fontColor;
    ctx.fillText(this.getText(), this.x+this.width/2, this.y+this.height/2);
  }
}

/*
  地雷カウンタークラス
*/
function MineCounter(getX, getY, getWidth, getHeight, field){
  Label.call(this, getX, getY, getWidth, getHeight, function(){return String(this.field.getMineNum()-this.field.getMarkNum())});
  this.bgColor = 'rgba(0, 0, 100, 0.75)';
  this.textSize = 0.35;
  this.field = field;
}
MineCounter.prototype = Object.create(Label.prototype);

/*
  タイマークラス
*/
function Timer(getX, getY, getWidth, getHeight){
  Label.call(this, getX, getY, getWidth, getHeight, function(){return String(this.time)});
  this.bgColor = 'rgba(0, 0, 100, 0.75)';
  this.textSize = 0.35;
  this.timer = null;
  this.time = 0;
}
Timer.prototype = Object.create(Label.prototype, {
  // カウント開始
  start: {configurable: true, value: function(){
    this.time = 0;
    var self = this;
    this.timer = setInterval(function(){self.update()}, 1000);
  }},
  // カウント再開
  resume: {configurable: true, value: function(){
    var self = this;
    if(this.timer) clearInterval(this.timer);
    this.timer = setInterval(function(){self.update()}, 1000);
  }},
  // カウント停止
  stop: {configurable: true, value: function(){
    clearInterval(this.timer);
  }},
  // カウンターを回す
  update:  {configurable: true, value: function(){
    this.time++;
    render();
  }}
});

/*
  ボタンクラス
*/
function Button(getX, getY, getWidth, getHeight, getText, action){
  Label.call(this, getX, getY, getWidth, getHeight, getText);
  this.action = action;
  this.isOnMouse = false;
}
Button.prototype = Object.create(Label.prototype, {
  // マウス移動
  mouseMove: {configurable: true, value: function(x, y){
    if(this.x < x && x < this.x + this.width && this.y < y && y < this.y + this.height){
      if(!this.isOnMouse){
        this.isOnMouse = true;
        this.bgColor = this.selectedBgColor;
        renderComponent(this);
      }
    }else{
      if(this.isOnMouse){
        this.isOnMouse = false;
        this.bgColor = this.unselectedBgColor;
        renderComponent(this);
      }
    }
  }},
  // 左クリック
  click: {configurable: true, value: function(x, y){
    if(this.x < x && x < this.x + this.width && this.y < y && y < this.y + this.height){
      this.action();
    }
  }}
});

/*
  リセットボタンクラス
*/
function ResetButton(getX, getY, getWidth, getHeight, field){
  Button.call(this, getX, getY, getWidth, getHeight, function(){return "Reset"}, function(){field.reset(); render()});
  this.unselectedBgColor = this.bgColor = 'rgba(20, 40, 80, 0.75)';
  this.selectedBgColor = 'rgba(30, 50, 90, 0.75)';
  this.textSize = 0.2;
  this.field = field;
}
ResetButton.prototype = Object.create(Button.prototype);

/*
  難易度ボタンクラス
*/
function DifficultyButton(getX, getY, getWidth, getHeight, cellRow, cellCol, mineRatio, text, mineSweeper){
  Button.call(this, getX, getY, getWidth, getHeight, function(){return text}, function(){
    mineSweeper.cellRow = cellRow;
    mineSweeper.cellCol = cellCol;
    mineSweeper.mineRatio = mineRatio;
    mineSweeper.gameSetup();
  });
  this.unselectedBgColor = this.bgColor = 'rgba(20, 40, 80, 0.75)';
  this.selectedBgColor = 'rgba(30, 50, 90, 0.75)';
  this.textSize = 0.1;
  this.cellRow = cellRow;
  this.cellCol = cellCol;
  this.mineRatio = mineRatio;
  this.mineSweeper = mineSweeper
}
DifficultyButton.prototype = Object.create(Button.prototype);

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
