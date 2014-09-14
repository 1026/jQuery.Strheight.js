/*
* jQuery.Strheight.js ( http://github.com/1026/jQuery.Strheight.js )
* author: 1026 (Tenjiro Namba)
* License: MIT ( http://www.opensource.org/licenses/mit-license.php )
*/
(function(window, document, $) {

function Strheight(elsS, elsM, opts) {
  return (this instanceof Strheight)
    ? this.init(elsS, elsM, opts)
    : new Strheight(elsS, elsM, opts);
};

Strheight.prototype.init = function(elsS, elsM, opts){
  var self = this;

  self.elsS = elsS;
  self.elsM = elsM;

  opts = $.extend({
    checkInterval: 0,
    liquid: false,
    divideEqually: true
  }, opts);

  self.checkInterval = opts.checkInterval;
  self.liquid = opts.liquid;
  self.divide = opts.divideEqually;

  self.setSingle();
  self.setMultiple();

  self.loadHandler();
};

Strheight.prototype.setSingle = function(){
  var self = this;

  self.arrElsS = [];

  var strheightSingle;
  for(var i = 0, l = self.elsS.length; i < l; ++i){
    strheightSingle = new StrheightSingle(self.elsS[i]);
    self.arrElsS.push(strheightSingle);
  }
};

Strheight.prototype.setMultiple = function(){
  var self = this;

  self.arrElsM = [];

  var strheightMultiple;
  for(key in self.elsM){
    strheightMultiple = new StrheightMultiple(key, self.elsM[key], self.elsS, self.divide);
    self.arrElsM.push(strheightMultiple);
  }
};

Strheight.prototype.refresh = function(){
  var self = this;
  
  self.winW = $(window).innerWidth();

  for(var i = 0; i < self.arrElsS.length; ++i){
    self.arrElsS[i].init();
  }
  var j = 0;
  for(key in self.elsM){
    self.arrElsM[j].checkElement();
    j += 1;
  }
};

Strheight.prototype.loadHandler = function(){
  var self = this;

  $(window).on('load',function(){
    self.refresh();

    if(self.checkInterval > 0) self.setChecker(self.checkInterval);
    if(self.liquid) self.resizeHandler();
  });
};

Strheight.prototype.resizeHandler = function(){
  var self = this;

  var timer = null;
  $(window).on('resize',function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      if(self.winW != $(window).innerWidth()){
        self.refresh();
      }
    }, 300);
  });
};

Strheight.prototype.setChecker = function(){
  var self = this;

  self.cheker = null;

  var fontSizeCheker = new FontSizeCheker(self.checkInterval);
  self.cheker = fontSizeCheker;

  self.cheker.$el.on('changeSizeRequest',function(){
    self.refresh();
  });
};

/* 
 Strheight Single
---------------------------------------------- */
var StrheightSingle = function(el){
  this.$el = $(el);

  this.init();
};

StrheightSingle.prototype.init = function(){
  var self = this;

  self.maxHeight = 0;
  self.offsetTop = 0;
  self.crtOffsetTop = 0;
  self.rows = [];

  if(self.$el.length > 0) {
    self.sortOffset(this.$el);
  }
};

StrheightSingle.prototype.sortOffset = function(els){
  var self = this;

  self.els = els;
  self.cols = [];

  $.each(els, function(i, e){

    var $e = ($.isArray(self.els)) ? $(e.item) : $(e);

    $e.height('auto');

    var arr = {};

    arr.item = $e;
    arr.offset = $e.offset().top;

    self.cols.push(arr);
  });

  self.cols.sort(function(a, b) {
    return a.offset - b.offset;
  });

  self.checkElement();
};

StrheightSingle.prototype.checkElement = function(){
  var self = this;

  var $item,rowHeight;
  for (var i = 0, l = self.cols.length; i < l; i++) {
    $item = $(self.cols[i].item);

    $item.height('auto');
    rowHeight = $item.outerHeight();
    self.crtOffsetTop = $item.offset().top;

    if(self.offsetTop != self.crtOffsetTop){
      break;
    }

    self.rows.push($item);
    self.offsetTop = self.crtOffsetTop;

    if (rowHeight > self.maxHeight) {
      self.maxHeight = rowHeight;
    }
  }

  self.setHeight();

  self.cols.splice(0, i+1);
  i = 0;

  if(self.cols.length > 0){

    self.rows.push($item);
    self.offsetTop = $item.offset().top;

    if (rowHeight > self.maxHeight) {
      self.maxHeight = rowHeight;
    }

    self.sortOffset(self.cols);
  }
};

StrheightSingle.prototype.setHeight = function(e){
  var self = this;

  var $col, colHeight, colOuterHeight;
  for (var i = 0, l = self.rows.length; i < l; i++) {
    $col = $(self.rows[i]);
    colHeight = $col.height();
    colOuterHeight = $col.outerHeight();

    $(self.rows[i]).height(colHeight + self.maxHeight - colOuterHeight);
  }

  self.rows = [];
  self.maxHeight = 0;
};

/* 
 Strheight Multiple
---------------------------------------------- */
var StrheightMultiple = function(key, hash, elsS, divide){

  this.init(key, hash, elsS, divide);
};

StrheightMultiple.prototype.init = function(key, hash, elsS, divide){
  var self = this;

  self.$el = $(key);
  self._hash = hash;
  self.elsS = elsS;
  self.divide = divide;

  self.exElement();
  self.checkElement();
};

StrheightMultiple.prototype.exElement = function(){
  var self = this;

  var exEl = '';
  for(var i = 0, l = self.elsS.length; i < l; ++i){
      exEl += (i != l -1) ? (self.elsS[i] +', ') : self.elsS[i];
  }

  self.exEl = exEl;
};

StrheightMultiple.prototype.checkElement = function(){
  var self = this;

  self.maxHeight = 0;
  self.offsetTop = 0;
  self.crtOffsetTop = 0;
  self.rows = [];

  self.$el.each(function(i, e){
    var $e = $(e);

    $e.find(self._hash).not(self.exEl).height('auto');

    var rowHeight = $e.outerHeight();
    self.crtOffsetTop = $e.offset().top;

    if(self.offsetTop != self.crtOffsetTop){
      self.setHeight($e);
    }

    self.rows.push($e);
    self.offsetTop = self.crtOffsetTop;

    if (rowHeight > self.maxHeight) {
      self.maxHeight = rowHeight;
    }

  });
  self.setHeight();
};

StrheightMultiple.prototype.setHeight = function(e){
  var self = this;

  var $hash, hashH, diffH, $row, rowHeight, thisH;
  for (var i = 0, l = self.rows.length; i < l; i++) {
    $row = $(self.rows[i]);
    rowHeight = $row.outerHeight();

    if(self.maxHeight > $row.height()){
      $hash = $row.find(self._hash);
      hashLength = $hash.length;
      diffH = self.maxHeight - rowHeight;

      if(self.divide){
        $hash.each(function(){
          thisH = $(this).height();
          $(this).height(thisH+diffH/hashLength);
        });
      } else {
        $hash.eq(-1).each(function(){
          thisH = $(this).height();
          $(this).height(thisH+diffH);
        });
      }
    }
  }

  if(e) self.crtOffsetTop = e.offset().top;

  self.rows = [];
  self.maxHeight = 0;
};



/* 
 Font Size Cheker
---------------------------------------------- */
var FontSizeCheker = function(checkInterval) {
  this.$el = ($('#h').length > 0) ? $('#h') : $(('<div id="h">H</div>')).appendTo('body');

  this.init(checkInterval);
};

FontSizeCheker.prototype.init = function(checkInterval){
  var self = this;

  self.$el.css({position:'absolute',top: 0, left: 0, zIndex: -99999, visibility: 'hidden'});
  self.defHeight = self.$el.height();

  setInterval(function(){
    self.checkSize();
  },checkInterval);
};

FontSizeCheker.prototype.checkSize = function(){
  var self = this;

  if(self.defHeight != self.$el.height()){
    self.$el.triggerHandler('changeSizeRequest');
    self.defHeight = self.$el.height();
  }
};

window.Strheight = Strheight;


})(window, window.document, jQuery);