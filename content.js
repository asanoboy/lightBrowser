var createLightBrowser = function(){
	return new LightBrowser($(this).attr("href"), 300, 300, 100, 100, $("body"));
};

var bindShiftCtrlClick = function(doc){
	
	$(doc).delegate("a", "click", function(e){
		if( e.ctrlKey && e.shiftKey ){
			createLightBrowser.apply(this);
			e.preventDefault();
		}
	});
};

bindShiftCtrlClick(document);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	alert("create");
	createLightBrowser();
	sendResponse({});
});

var LightBrowser = function(url, width, height, x, y, $parent){
	this.url = url;
	this.width = width;
	this.height = height;
	this.offsetX = x;
	this.offsetY = y;
	this.$parent = $parent;
	
	/*
	 * style
	 */
	this.resizeBarWidth = 3;
	this.grabHeaderHeight = 20;
	
	this.initRender();
	this.initMouseEvents();
	
	var _this = this;
	this.$iframe.attr("src", this.url);
	this.$iframe.load(function(){
		_this.document = _this.$iframe.contents();
		bindShiftCtrlClick( _this.document );
	});

};

LightBrowser.prototype.initRender = function(){
	
	this.$browser = $("<div>");
	this.$leftTopResizeEdge = this.$browser.append($("<div>")).find(":last");
	this.$topEdge = this.$browser.append($("<div>")).find(":last");
	this.$rightTopResizeEdge = this.$browser.append($("<div>")).find(":last");
	this.$leftEdge = this.$browser.append($("<div>")).find(":last");
	this.$content = this.$browser.append($("<div>")).find(":last");
	this.$header = this.$content.append($("<div>")).find(":last");
	this.$closeButton = this.$header.append($("<div>")).find(":last"); 
	this.$iframe = this.$content.append($("<iframe>")).find(":last");
	this.$overlay = this.$content.append($("<div>")).find(":last").hide();
	this.$rightEdge = this.$browser.append($("<div>")).find(":last");
	this.$leftBottomResizeEdge = this.$browser.append($("<div>")).find(":last");
	this.$bottomEdge = this.$browser.append($("<div>")).find(":last");
	this.$rightBottomResizeEdge = this.$browser.append($("<div>")).find(":last");
	
	this.$browser.find("*").css({
		'margin': 0,
		'padding': 0,
		'border': '0 solid #FFF'
	});
	
	this.$browser.css({
		'position': 'absolute',
		'backgroundColor': '#4271C9',
		'border': 'solid 1px #444'
	});
	
	this.$leftTopResizeEdge.css({
		'cursor': 'nw-resize',
		'backgroundColor': '#5C8EDA',
		'display': 'inline-block'
	});
	
	this.$topEdge.css({
		'cursor': 'n-resize',
		'backgroundColor': '#5C8EDA',
		'display': 'inline-block'
	});
	
	this.$rightTopResizeEdge.css({
		'cursor': 'ne-resize',
		'backgroundColor': '#5C8EDA',
		'display': 'inline-block'
	});
	
	this.$leftEdge.css({
		'cursor': 'w-resize',
		'float': 'left'
	});
	
	this.$content.css({
		'float': 'left'
	});
	
	this.$header.css({
		'backgroundImage': '-webkit-linear-gradient(top, #5C8EDA, #4271C9)'
	});
	
	this.$closeButton.append("<a href='#'>x</a>").css({
		'float': 'right'
	}).find("a").css({
		'color': '#DDD',
		'textShadow': '1px 1px 1px #999'
	});
	
	this.$iframe.css({
	});
	
	this.$overlay.css({
		'position': 'absolute',
		'top': this.grabHeaderHeight+'px',
		'opacity': 0
	});
	
	this.$rightEdge.css({
		'cursor': 'e-resize',
		'float': 'right'
	});
	
	this.$leftBottomResizeEdge.css({
		'cursor': 'sw-resize',
		'position': 'absolute'
	});
	
	this.$bottomEdge.css({
		'cursor': 's-resize',
		'position': 'absolute'
	});
	
	this.$rightBottomResizeEdge.css({
		'cursor': 'se-resize',
		'position': 'absolute'
	});
	
	this.arrangeSize();
	
	this.$parent.append(this.$browser);	
};

LightBrowser.prototype.arrangeSize = function(){
	
	this.$browser.css({
		'left': this.offsetX+'px',
		'top': this.offsetY+'px',
		'width': this.width+'px',
		'height': this.height+'px'
	});
	
	this.$leftTopResizeEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px'
	});
	
	this.$topEdge.css({
		'width': (this.width-this.resizeBarWidth*2)+'px',
		'height': this.resizeBarWidth+'px'
	});
	
	this.$rightTopResizeEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px'		
	});
	
	this.$leftEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': (this.height-this.resizeBarWidth*2)+'px'
	});
	
	this.$content.css({
		'width': (this.width-this.resizeBarWidth*2)+'px',
		'height': (this.height-this.resizeBarWidth*2)+'px'
	});
	
	this.$header.css({
		'width': (this.width-this.resizeBarWidth*2)+'px',
		'height': this.grabHeaderHeight+'px'
	});
	
	this.$iframe.css({
		'width': (this.width-this.resizeBarWidth*2)+'px',
		'height': (this.height-this.resizeBarWidth*2 - this.grabHeaderHeight)+'px'
	});
	
	this.$overlay.css({
		'width': (this.width-this.resizeBarWidth*2)+'px',
		'height': (this.height-this.resizeBarWidth*2 - this.grabHeaderHeight)+'px'
	});
	
	this.$rightEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': (this.height-this.resizeBarWidth*2)+'px'
	});
	
	
	this.$leftBottomResizeEdge.css({
		'top': (this.height-this.resizeBarWidth)+'px',
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px'
	});
	
	this.$bottomEdge.css({
		'top': (this.height-this.resizeBarWidth)+'px',
		'left': this.resizeBarWidth+'px',
		'width': (this.width-this.resizeBarWidth*2)+'px',
		'height': this.resizeBarWidth+'px'
	});
	
	this.$rightBottomResizeEdge.css({
		'top': (this.height-this.resizeBarWidth)+'px',
		'left': (this.width-this.resizeBarWidth)+'px',
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px'
	});
};

LightBrowser.prototype.initMouseEvents = function(){
	var moveAction = null, _this = this;
	
	var startGrab = function(x, y ,callback){
		if( moveAction ){
			endGrab();
		}
		_this.$overlay.show(); // iframe内にマウスが行くとmousemoveイベントがキャッチできなくなるため、iframeにoverlayさせるdocument内要素
		moveAction = new GrabAction(x, y, callback);
	};

	var endGrab = function(){
		_this.$overlay.hide();
		if( moveAction ){
			moveAction.unbind();
			delete moveAction;
			moveAction = null;
		}
	};
	
	this.$header.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.offsetX += deltaX;
				_this.offsetY += deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$topEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.offsetY += deltaY;
				_this.height -= deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$leftEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.offsetX += deltaX;
				_this.width -= deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$rightEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.width += deltaX;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$bottomEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.height += deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$leftTopResizeEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.offsetX += deltaX;
				_this.offsetY += deltaY;
				_this.width -= deltaX;
				_this.height -= deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$rightTopResizeEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.offsetY += deltaY;
				_this.width += deltaX;
				_this.height -= deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$leftBottomResizeEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.offsetX += deltaX;
				_this.width -= deltaX;
				_this.height += deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	this.$rightBottomResizeEdge.bind('mousedown', function(e){
		if( e.button==0 ){
			startGrab(e.clientX, e.clientY, function(deltaX, deltaY){
				_this.width += deltaX;
				_this.height += deltaY;
				_this.arrangeSize();
			});
			return false;
		}
	});
	
	$(document).bind('mouseup', function(e){
		console.log('mouseup');
		if( e.button==0 ){
			endGrab();
		}
	});
	
	this.$closeButton.find("a").click(function(){
		_this.$browser.remove();
		return false;
	});
};

var GrabAction = function(x, y, callback){
	this.currentX = x;
	this.currentY = y;
	var _this = this;
	this.handler = function(e){
		if( e.which==1 ){ // mouse左クリックがdownの状態
			callback(e.clientX - _this.currentX, e.clientY - _this.currentY);
			_this.currentX = e.clientX;
			_this.currentY = e.clientY;
			return false;	
		}
		else {
			_this.unbind();
		}
	};
	$(document).bind("mousemove", this.handler);
};

GrabAction.prototype.unbind = function(){
	$(document).unbind("mousemove", this.handler);
};
