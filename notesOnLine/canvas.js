(function() {
  var dyl = {cache: {}};
  dyl.setContext = function(context) {
    dyl.cache._context = context;
    return context;
  };
  dyl.getDom = function(id) {
    return document.getElementById(id);
  };
  dyl._getContext = function() {
    return dyl.cache._context;
  };
  dyl.save = function() {
    var context = dyl._getContext();
    context ? context.save() : void(0);
  };
  dyl.restore = function() {
    var context = dyl._getContext();
    context ? context.restore() : void(0);
  };
  dyl.createContext = function(canvasID) {
    var canvas = this.getDom(canvasID);
    if(!canvas) {
      return null;
    }
    return dyl.setContext(canvas.getContext("2d"));
  };
  dyl.createColor = function() {
    var color = "rgb(";
    color += Math.round(Math.random()*255);
    color += ",";
    color += Math.round(Math.random()*255);
    color += ",";
    color += Math.round(Math.random()*255);
    color += ")";
    return color;
  };
  dyl.addImg = function(img, x, y) {
    var context = dyl._getContext();
    if(!img || !context) {
      return;
    }
    if(typeof img === "string") {
      var oImg = new Image();
      oImg.src = img;
      oImg.onload = function() {
        context.drawImage(oImg, x, y);
      }
      return;
    } 
    context.drawImage(img, x, y);
  };
  dyl.rect = function(color, x, y, width, height, alpha) {
    var context = dyl._getContext();
    if(!context) {
      return;
    }
    context.save();
    context.fillStyle = color;
    context.globalAlpha = alpha ? alpha : 1;
    context.fillRect(x, y, width, height);
    context.restore();
  };
  dyl.circle = function(color, x, y, r, alpha) {
    var context = dyl._getContext();
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.globalAlpha = alpha ? alpha : 1;
    context.arc(x, y, r, 0, 2*Math.PI);
    context.fill();
    context.stroke();
  };
  dyl.clearRect = function(x, y, width, height) {
    var context = dyl._getContext();
    if(!context) {
      return;
    }
    context.clearRect(x, y, width, height);
  };
  dyl.scale = function(x, y) {
    var context = dyl._getContext();
    if(!context) {
      return;
    }
    x = x ? x : 1;
    y = y ? y : 1;
    context.scale(x, y);
  };
  if(!window.dyl) {
    window.dyl = dyl;
  }
})();