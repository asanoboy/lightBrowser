var lightBrowsers = [];
var createLightBrowser = function(url){
	lightBrowsers.push( new LightBrowser(url, 300, 300, 100, $('body').scrollTop()+100, $("body")) );
};

var bindShiftCtrlClick = function(doc){
	$(window).delegate("a", "click", function(e){
		if( e.ctrlKey && e.shiftKey ){
			createLightBrowser($(this).attr("href"));
			e.preventDefault();
		}
	});
};

bindShiftCtrlClick(document);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	createLightBrowser(request.url);
	sendResponse({});
});

var LightBrowser = function(url, width, height, x, y, $parent){
	this.iframeName = "lightBrowserName"+lightBrowsers.length;
	this.index = lightBrowsers.length; // lightBrowserにつける通し番号
	this.removed = false;
	this.url = url;
	this.width = width;
	this.height = height;
	this.offsetX = x;
	this.offsetY = y;
	this.$parent = $parent;
	
	/*
	 * style
	 */
	this.resizeBarWidth = 4;
	this.grabHeaderHeight = 29;
	this.grabHeaderTopPadding = 4;
	this.radius = 4;
	this.isFullScreen = false;
	
	this.initRender();
	this.initMouseEvents();
	
	this.history = [];
	this.historyIndex = -1;
	
	var _this = this;
	this.$iframe.attr("src", this.url);
	
	this.popstateHandler = function(e){
		console.log(e);
		if( e.originalEvent.state+1==_this.index ){
			if( _this.removed )
				console.log('a');
			else
				_this.$browser.toggle();
		}
		else if( e.originalEvent.state==null && _this.index==0){
			_this.$browser.toggle();
		}
	};
	
	$(window).bind('popstate', this.popstateHandler);
	
	this.$iframe.one("load", function(e){
		_this.url = this.src;
		history.pushState(_this.index, "", document.location.href);
		
		_this.updateHeader();
		e.stopImmediatePropagation();
	});
	
	this.$iframe.load(function(){
		try{
			var url = _this.$iframe.contents()[0].location.href;
			_this.url = url;
		}
		catch(e){
			alert("cross domain");
		}
		_this.updateHeader();
	});
};

LightBrowser.prototype.updateHeader = function(){
	this.$urlDisplay.val(this.url);
};

LightBrowser.prototype.historyForward = function(){
	history.forward();
	//this.$iframe[0].history.forward();
	return true;
	if( this.historyIndex>=0 && this.history.length>this.historyIndex-1 ){
		this.$iframe.attr("src", this.history[++this.historyIndex]);
		--this.historyIndex;
		return true;
	}
	else return false;
};

LightBrowser.prototype.historyBack = function(){
	history.back();
	return true;
	if( this.historyIndex>=1 ){
		this.$iframe.attr("src", this.history[--this.historyIndex]);
		--this.historyIndex;
		return true;
	}
	else return false;	
};

LightBrowser.prototype.initRender = function(){
	
	this.$browser = $("<div>");
	this.$topBackSheet = this.$browser.append($("<div>")).find(":last");
	this.$leftTopResizeEdge = this.$browser.append($("<div>")).find(":last");
	this.$topEdge = this.$browser.append($("<div>")).find(":last");
	this.$rightTopResizeEdge = this.$browser.append($("<div>")).find(":last");
	this.$leftEdge = this.$browser.append($("<div>")).find(":last");
	this.$content = this.$browser.append($("<div>")).find(":last");
	this.$header = this.$content.append($("<div>")).find(":last");
	this.$prevButton = this.$header.append($("<div>")).find(":last"); 
	this.$nextButton = this.$header.append($("<div>")).find(":last");
	this.$urlDisplayWrapper = this.$header.append($("<div>")).find(":last"); 
	this.$urlDisplay = this.$urlDisplayWrapper.append($("<input type='text' readonly='readonly'/>")).find(":last");
	this.$closeButton = this.$header.append($("<div>")).find(":last"); 
	this.$iframe = this.$content.append($("<iframe name='"+this.iframeName+"'>")).find(":last");
	this.$overlay = this.$content.append($("<div>")).find(":last").hide();
	this.$rightEdge = this.$browser.append($("<div>")).find(":last");
	this.$leftBottomResizeEdge = this.$browser.append($("<div>")).find(":last");
	this.$bottomEdge = this.$browser.append($("<div>")).find(":last");
	this.$rightBottomResizeEdge = this.$browser.append($("<div>")).find(":last");
	
	this.$browser.css({
		'position': 'absolute',
		'backgroundColor': '#4271C9',
		'border': 'solid 1px #444',
		'WebkitBorderRadius': this.radius+'px',
		'zIndex': 1000000
	});
	
	this.$leftTopResizeEdge.css({
		'cursor': 'nw-resize',
		'backgroundColor': '#5C8EDA',
		'border': 'solid 1px #444',
		'_display': 'inline-block',
		'float': 'left',
		'opacity': 0
	});
	
	this.$topEdge.css({
		'cursor': 'n-resize',
		'backgroundColor': '#5C8EDA',
		'display': 'inline-block',
		'float': 'left'
	});
	
	this.$rightTopResizeEdge.css({
		'cursor': 'ne-resize',
		'backgroundColor': '#5C8EDA',
		'display': 'inline-block',
		'float': 'left'
	});
	
	this.$leftEdge.css({
		'background': 'url('+chrome.extension.getURL('images/borderTop.png')+') repeat-x',
		'cursor': 'w-resize',
		'float': 'left',
		'clear': 'both'
	});
	
	this.$content.css({
		'float': 'left'
	});
	
	this.$header.css({
		'backgroundImage': '-webkit-linear-gradient(top, #5C8EDA, #4271C9)'
	});
	
	this.$prevButton.append("<a href='#'><img src="+chrome.extension.getURL('images/prev.png')+"></a>").css({
		'float': 'left'
	}).find('img').css({
		'verticalAlign': 'bottom'
	}).length;
	
	this.$nextButton.append("<a href='#'><img src="+chrome.extension.getURL('images/next.png')+"></a>").css({
		'float': 'left'
	}).find('img').css({
		'verticalAlign': 'bottom'
	});
	
	this.$urlDisplayWrapper.css({
		'float': 'left'
	});
	
	this.$closeButton.append("<a href='#'><img src="+chrome.extension.getURL('images/close.png')+"></a>").css({
		'float': 'right'
	}).find('img').css({
		'verticalAlign': 'bottom'
	});
	
	this.$iframe.css({
		'backgroundColor': '#FFF'
	});
	
	this.$overlay.css({
		'position': 'absolute',
		'top': this.grabHeaderHeight+'px',
		'opacity': 0
	});
	
	this.$rightEdge.css({
		'background': 'url('+chrome.extension.getURL('images/borderTop.png')+') repeat-x',
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
	
	this.$browser.find("*").css({
		'margin': 0,
		'padding': 0,
		'border': '0 solid #FFF'
	});
	
	// borderを設定しているので後ろに持ってきた
	this.$topBackSheet.css({
		'position': 'absolute',
		'backgroundColor': '#5C8EDA',
		'height': (this.resizeBarWidth+this.grabHeaderHeight)+'px',
		'borderLeft': 'solid 1px #444',
		'borderTop': 'solid 1px #444',
		'borderRight': 'solid 1px #444',
		'WebkitBorderRadius': this.radius+'px',
		'zIndex': -1,
		'left': '-1px',
		'top':' -1px'
	});
	
	this.$header.css({
		'height': (this.grabHeaderHeight-this.grabHeaderTopPadding)+'px',
		'paddingTop': this.grabHeaderTopPadding+'px'
	});
	
	this.$urlDisplay.css({
		'border': '1px solid #777',
		'padding': '0 5px 0 5px'
	});
};

LightBrowser.prototype.arrangeSize = function(){
	
	this.displayWidth = this.width; 
	this.displayHeight = this.height;
	var left = this.offsetX;
	var top = this.offsetY;
	if( this.isFullScreen ){
		this.displayWidth = $(window).width()-2;
		this.displayHeight = $(window).height()-2;
		top = $(window).scrollTop();
		left = $(window).scrollLeft();
	}
	else {
		this.displayWidth = this.displayWidth<100 ? 100 : this.displayWidth;
		this.displayHeight = this.displayHeight<100 ? 100 : this.displayHeight;
	}
	
	var width = this.displayWidth, height = this.displayHeight;
	
	this.$browser.css({
		'left': left+'px',
		'top': top+'px',
		'width': width+'px',
		'height': height+'px'
	});
	
	this.$topBackSheet.css({
		'width': width+'px'
	});
	
	this.$leftTopResizeEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px',
		'opacity': 0
	});
	
	this.$topEdge.css({
		'width': (width-this.resizeBarWidth*2)+'px',
		'height': this.resizeBarWidth+'px'
	});
	
	this.$rightTopResizeEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px',
		'opacity': 0		
	});
	
	this.$leftEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': (height-this.resizeBarWidth*2)+'px'
	});
	
	this.$content.css({
		'width': (width-this.resizeBarWidth*2)+'px',
		'height': (height-this.resizeBarWidth*2)+'px'
	});
	
	this.$header.css({
		'width': (width-this.resizeBarWidth*2)+'px'
	});
	
	this.$urlDisplayWrapper.css({
		'width': (width - 100)+'px'
	});
	this.$urlDisplay.css({
		'width': (width - 100)+'px',
		'height': '19px'
	});
	
	this.$iframe.css({
		'width': (width-this.resizeBarWidth*2)+'px',
		'height': (height-this.resizeBarWidth*2 - this.grabHeaderHeight)+'px'
	});
	
	this.$overlay.css({
		'width': (width-this.resizeBarWidth*2)+'px',
		'height': (height-this.resizeBarWidth*2 - this.grabHeaderHeight)+'px'
	});
	
	this.$rightEdge.css({
		'width': this.resizeBarWidth+'px',
		'height': (height-this.resizeBarWidth*2)+'px'
	});
	
	
	this.$leftBottomResizeEdge.css({
		'top': (height-this.resizeBarWidth)+'px',
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px'
	});
	
	this.$bottomEdge.css({
		'top': (height-this.resizeBarWidth)+'px',
		'left': this.resizeBarWidth+'px',
		'width': (width-this.resizeBarWidth*2)+'px',
		'height': this.resizeBarWidth+'px'
	});
	
	this.$rightBottomResizeEdge.css({
		'top': (height-this.resizeBarWidth)+'px',
		'left': (width-this.resizeBarWidth)+'px',
		'width': this.resizeBarWidth+'px',
		'height': this.resizeBarWidth+'px'
	});
};

LightBrowser.prototype.toggleFullScreen = function(){
	var _this = this;
	if( !this.fullScreenResizeHandler ){
		this.fullScreenResizeHandler = function(){
			_this.arrangeSize();
		}
	}
	
	if( this.isFullScreen ){
		this.isFullScreen = false;
		$(window).unbind('resize', this.fullScreenResizeHandler);
	}
	else {
		this.isFullScreen = true;
		$(window).bind('resize', this.fullScreenResizeHandler);
	}
	this.arrangeSize();
};

LightBrowser.prototype.initMouseEvents = function(){
	var moveAction = null, _this = this;
	
	var startGrab = function(x, y ,callback){
		if( moveAction ){
			endGrab();
		}
		// iframe内にマウスが行くとmousemoveイベントがキャッチできなくなるため、iframeにoverlayさせるdocument内要素
		$.each(lightBrowsers, function(i, b){
			b.$overlay.show();
		});
		 
		moveAction = new GrabAction(x, y, callback);
	};

	var endGrab = function(){
		if( _this.isFullScreen ) return;
		_this.width = _this.displayWidth;
		_this.height = _this.displayHeight;
		
		$.each(lightBrowsers, function(i, b){
			b.$overlay.hide();
		});
		if( moveAction ){
			moveAction.unbind();
			delete moveAction;
			moveAction = null;
		}
	};
	
	this.$header.dblclick(function(e){
		_this.toggleFullScreen();
	});
	
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
	
	this.$urlDisplayWrapper.bind('mousedown', function(e){
		e.stopPropagation();
	})
	.bind('dblclick', function(e){
		e.stopPropagation();
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
				_this.width -= deltaX;
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
		if( e.button==0 ){
			endGrab();
		}
	});
	
	this.$prevButton.find("a").click(function(){
		if( !_this.historyBack() ){
			alert("can't go back.")
		}
		return false;
	});
	
	this.$nextButton.find("a").click(function(){
		if( !_this.historyForward() ){
			alert("can't go forward.")
		}
		return false;
	});
	
	this.$closeButton.find("a").click(function(){
		_this.$browser.remove();
		_this.removed = true;
		//$(window).unbind('popstate', _this.popstateHandler);
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
