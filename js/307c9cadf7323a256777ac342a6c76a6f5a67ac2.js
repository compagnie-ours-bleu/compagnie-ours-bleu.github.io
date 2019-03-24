/*
 AnythingSlider v1.5.21 minified using Google Closure Compiler
 By Chris Coyier: http://css-tricks.com
 with major improvements by Doug Neiner: http://pixelgraphics.us/
 based on work by Remy Sharp: http://jqueryfordesigners.com/
*/

(function(d){d.anythingSlider=function(i,j){var a=this,b;a.$el=d(i).addClass("anythingBase").wrap('<div class="anythingSlider"><div class="anythingWindow" /></div>');a.$el.data("AnythingSlider",a);a.init=function(){a.options=b=d.extend({},d.anythingSlider.defaults,j);a.initialized=!1;d.isFunction(b.onBeforeInitialize)&&a.$el.bind("before_initialize",b.onBeforeInitialize);a.$el.trigger("before_initialize",a);a.$wrapper=a.$el.parent().closest("div.anythingSlider").addClass("anythingSlider-"+b.theme); a.$window=a.$el.closest("div.anythingWindow");a.$controls=d('<div class="anythingControls"></div>').appendTo(b.appendControlsTo!==null&&d(b.appendControlsTo).length?d(b.appendControlsTo):a.$wrapper);a.win=window;a.$win=d(a.win);a.$nav=d('<ul class="thumbNav" />').appendTo(a.$controls);a.flag=!1;a.playing=!1;a.slideshow=!1;a.hovered=!1;a.panelSize=[];a.currentPage=b.startPanel=parseInt(b.startPanel,10)||1;a.adjustLimit=b.infiniteSlides?0:1;a.outerPad=[a.$wrapper.innerWidth()-a.$wrapper.width(),a.$wrapper.innerHeight()- a.$wrapper.height()];b.playRtl&&a.$wrapper.addClass("rtl");a.original=[b.autoPlay,b.buildNavigation,b.buildArrows];if(b.expand)a.$outer=a.$wrapper.parent(),a.$window.css({width:"100%",height:"100%"}),a.outerDim=[a.$outer.width(),a.$outer.height()],a.checkResize();a.updateSlider();a.$lastPage=a.$currentPage;a.runTimes=d("div.anythingSlider").index(a.$wrapper)+1;a.regex=RegExp("panel"+a.runTimes+"-(\\d+)","i");if(!d.isFunction(d.easing[b.easing]))b.easing="swing";b.pauseOnHover&&a.$wrapper.hover(function(){a.playing&& (a.$el.trigger("slideshow_paused",a),a.clearTimer(!0))},function(){a.playing&&(a.$el.trigger("slideshow_unpaused",a),a.startStop(a.playing,!0))});var c,e=b.hashTags?a.gotoHash()||b.startPanel:b.startPanel;a.setCurrentPage(e,!1);a.slideControls(!1);a.$wrapper.bind("mouseenter mouseleave",function(b){a.hovered=b.type==="mouseenter"?!0:!1;a.slideControls(a.hovered,!1)});b.enableKeyboard&&d(document).keyup(function(b){if(a.$wrapper.is(".activeSlider")&&!b.target.tagName.match("TEXTAREA|INPUT|SELECT"))switch(b.which){case 39:a.goForward(); break;case 37:a.goBack()}});c="slideshow_paused slideshow_unpaused slide_init slide_begin slideshow_stop slideshow_start initialized swf_completed".split(" ");d.each("onShowPause onShowUnpause onSlideInit onSlideBegin onShowStop onShowStart onInitialized onSWFComplete".split(" "),function(b,e){d.isFunction(a.options[e])&&a.$el.bind(c[b],a.options[e])});d.isFunction(b.onSlideComplete)&&a.$el.bind("slide_complete",function(){setTimeout(function(){b.onSlideComplete(a)},0)});a.initialized=!0;a.$el.trigger("initialized", a)};a.updateSlider=function(){a.$el.children(".cloned").remove();a.$nav.empty();a.$items=a.$el.children();a.pages=a.$items.length;b.showMultiple=parseInt(b.showMultiple,10)||1;if(b.showMultiple>1){if(b.showMultiple>a.pages)b.showMultiple=a.pages;a.adjustMultiple=b.infiniteSlides&&a.pages>1?0:parseInt(b.showMultiple,10)-1;a.pages=a.$items.length-a.adjustMultiple}if(a.pages<=1)b.autoPlay=!1,b.buildNavigation=!1,b.buildArrows=!1,a.$controls.hide(),a.$nav.hide(),a.$forward&&a.$forward.add(a.$back).hide(); else{b.autoPlay=a.original[0];b.buildNavigation=a.original[1];b.buildArrows=a.original[2];a.$controls.show();a.$nav.show();a.$forward&&a.$forward.add(a.$back).show();a.buildNavigation();if(b.autoPlay)a.playing=!b.startStopped,a.buildAutoPlay();b.buildArrows&&a.buildNextBackButtons()}b.infiniteSlides&&a.pages>1&&(a.$el.prepend(a.$items.filter(":last").clone().addClass("cloned").removeAttr("id")),b.showMultiple>1?a.$el.append(a.$items.filter(":lt("+b.showMultiple+")").clone().addClass("cloned").addClass("multiple").removeAttr("id")): a.$el.append(a.$items.filter(":first").clone().addClass("cloned").removeAttr("id")),a.$el.find(".cloned").each(function(){d(this).find("a,input,textarea,select").attr("disabled","disabled");d(this).find("[id]").removeAttr("id")}));a.$items=a.$el.children().addClass("panel");a.setDimensions();b.resizeContents?(b.width&&(a.$items.css("width",b.width),a.$wrapper.css("width",a.getDim(a.currentPage)[0])),b.height&&a.$wrapper.add(a.$items).css("height",b.height)):a.$win.load(function(){a.setDimensions()}); if(a.currentPage>a.pages)a.currentPage=a.pages;a.setCurrentPage(a.currentPage,!1);a.$nav.find("a").eq(a.currentPage-1).addClass("cur");a.hasEmb=a.$items.find("embed[src*=youtube]").length;a.hasSwfo=typeof swfobject!=="undefined"&&swfobject.hasOwnProperty("embedSWF")&&d.isFunction(swfobject.embedSWF)?!0:!1;a.hasEmb&&a.hasSwfo&&a.$items.find("embed[src*=youtube]").each(function(c){var e=d(this).parent()[0].tagName==="OBJECT"?d(this).parent():d(this);e.wrap('<div id="ytvideo'+c+'"></div>');swfobject.embedSWF(d(this).attr("src")+ "&enablejsapi=1&version=3&playerapiid=ytvideo"+c,"ytvideo"+c,e.attr("width"),e.attr("height"),"10",null,null,{allowScriptAccess:"always",wmode:b.addWmodeToObject,allowfullscreen:!0},{"class":e.attr("class"),style:e.attr("style")},function(){c>=a.hasEmb-1&&a.$el.trigger("swf_completed",a)})});b.showMultiple===!1&&a.$items.find("a").unbind("focus").bind("focus",function(b){a.$items.find(".focusedLink").removeClass("focusedLink");d(this).addClass("focusedLink");var e=d(this).closest(".panel");e.is(".activePage")|| (a.gotoPage(a.$items.index(e)),b.preventDefault())})};a.buildNavigation=function(){var c,e,f;b.buildNavigation&&a.pages>1&&a.$items.filter(":not(.cloned)").each(function(g){var h=g+1;e=(h===1?"first":"")+(h===a.pages?"last":"");f=d('<a href="#"></a>').addClass("panel"+h).wrap('<li class="'+e+'" />');a.$nav.append(f.parent());d.isFunction(b.navigationFormatter)?(c=b.navigationFormatter(h,d(this)),f.html("<span>"+c+"</span>"),parseInt(f.find("span").css("text-indent"),10)<0&&f.addClass(b.tooltipClass).attr("title", c)):f.html("<span>"+h+"</span>");f.bind(b.clickControls,function(c){if(!a.flag&&b.enableNavigation)a.flag=!0,setTimeout(function(){a.flag=!1},100),a.gotoPage(h),b.hashTags&&a.setHash(h);c.preventDefault()})})};a.buildNextBackButtons=function(){if(!a.$forward)a.$forward=d('<span class="arrow forward"><a href="#"><span>'+b.forwardText+"</span></a></span>"),a.$back=d('<span class="arrow back"><a href="#"><span>'+b.backText+"</span></a></span>"),a.$back.bind(b.clickArrows,function(b){a.goBack();b.preventDefault()}), a.$forward.bind(b.clickArrows,function(b){a.goForward();b.preventDefault()}),a.$back.add(a.$forward).find("a").bind("focusin focusout",function(){d(this).toggleClass("hover")}),a.$wrapper.prepend(a.$forward).prepend(a.$back),a.$arrowWidth=a.$forward.width()};a.buildAutoPlay=function(){if(!(a.$startStop||a.pages<2))a.$startStop=d("<a href='#' class='start-stop'></a>").html("<span>"+(a.playing?b.stopText:b.startText)+"</span>"),a.$controls.prepend(a.$startStop),a.$startStop.bind(b.clickSlideshow,function(c){b.enablePlay&& (a.startStop(!a.playing),a.playing&&(b.playRtl?a.goBack(!0):a.goForward(!0)));c.preventDefault()}).bind("focusin focusout",function(){d(this).toggleClass("hover")}),a.startStop(a.playing)};a.checkResize=function(b){clearTimeout(a.resizeTimer);a.resizeTimer=setTimeout(function(){var e=a.$outer.width(),d=a.$outer[0].tagName==="BODY"?a.$win.height():a.$outer.height(),g=a.outerDim;if(g[0]!==e||g[1]!==d)a.outerDim=[e,d],a.setDimensions(),a.gotoPage(a.currentPage,a.playing,null,1);typeof b==="undefined"&& a.checkResize()},500)};a.setDimensions=function(){var c,e,f,g,h,i=0,k=b.showMultiple>1?b.width||a.$window.width()/b.showMultiple:a.$window.width(),j=a.$win.width();b.expand&&(c=a.$outer.width()-a.outerPad[0],e=a.$outer.height()-a.outerPad[1],a.$wrapper.add(a.$window).add(a.$items).css({width:c,height:e}),k=b.showMultiple>1?c/b.showMultiple:c);a.$items.each(function(l){f=d(this).children("*");b.resizeContents?(c=parseInt(b.width,10)||k,e=parseInt(b.height,10)||a.$window.height(),d(this).css({width:c, height:e}),f.length===1&&(f.css({width:"100%",height:"100%"}),f[0].tagName==="OBJECT"&&f.find("embed").andSelf().attr({width:"100%",height:"100%"}))):(c=d(this).width(),h=c>=j?!0:!1,f.length===1&&h&&(g=f.width()>=j?k:f.width(),d(this).css("width",g),f.css("max-width",g),c=g),c=h?b.width||k:c,d(this).css("width",c),e=d(this).outerHeight(),d(this).css("height",e));a.panelSize[l]=[c,e,i];i+=c});a.$el.css("width",i<b.maxOverallWidth?i:b.maxOverallWidth)};a.getDim=function(c){var c=b.infiniteSlides&&a.pages> 1?c:c-1,e,d=a.panelSize[c][0],g=a.panelSize[c][1];if(b.showMultiple>1)for(e=1;e<b.showMultiple;e++)d+=a.panelSize[(c+e)%b.showMultiple][0],g=Math.max(g,a.panelSize[c+e][1]);return[d,g]};a.gotoPage=function(c,e,d,g){if(!(a.pages<=1)){a.$lastPage=a.$currentPage;if(typeof c!=="number")c=b.startPanel,a.setCurrentPage(c);if(!a.hasEmb||!a.checkVideo(a.playing))c>a.pages+1-a.adjustLimit&&(c=!b.infiniteSlides&&!b.stopAtEnd?1:a.pages),c<a.adjustLimit&&(c=!b.infiniteSlides&&!b.stopAtEnd?a.pages:1),a.currentPage= c>a.pages?a.pages:c<1?1:a.currentPage,a.$currentPage=a.$items.eq(a.currentPage-a.adjustLimit),a.exactPage=c,a.$targetPage=a.$items.eq(c===0?a.pages-a.adjustLimit:c>a.pages?1-a.adjustLimit:c-a.adjustLimit),a.$el.trigger("slide_init",a),a.slideControls(!0,!1),e!==!0&&(e=!1),(!e||b.stopAtEnd&&c===a.pages)&&a.startStop(!1),a.$el.trigger("slide_begin",a),b.resizeContents||(e=a.getDim(c),a.$wrapper.filter(":not(:animated)").animate({width:e[0],height:e[1]},{queue:!1,duration:g||b.animationTime,easing:b.easing})), a.$el.filter(":not(:animated)").animate({left:-a.panelSize[b.infiniteSlides&&a.pages>1?c:c-1][2]},{queue:!1,duration:g||b.animationTime,easing:b.easing,complete:function(){a.endAnimation(c,d)}})}};a.endAnimation=function(c,e){c===0?(a.$el.css("left",-a.panelSize[a.pages][2]),c=a.pages):c>a.pages&&(a.$el.css("left",-a.panelSize[1][2]),c=1);a.exactPage=c;a.setCurrentPage(c,!1);a.$items.removeClass("activePage").eq(c-a.adjustLimit).addClass("activePage");a.hovered||a.slideControls(!1);if(a.hasEmb){var f= a.$currentPage.find("object[id*=ytvideo], embed[id*=ytvideo]");f.length&&d.isFunction(f[0].getPlayerState)&&f[0].getPlayerState()>0&&f[0].getPlayerState()!==5&&f[0].playVideo()}a.$el.trigger("slide_complete",a);typeof e==="function"&&e(a);b.autoPlayLocked&&!a.playing&&setTimeout(function(){a.startStop(!0)},b.resumeDelay-b.delay)};a.setCurrentPage=function(c,e){c=parseInt(c,10);c>a.pages+1-a.adjustLimit&&(c=a.pages-a.adjustLimit);c<a.adjustLimit&&(c=1);b.buildNavigation&&(a.$nav.find(".cur").removeClass("cur"), a.$nav.find("a").eq(c-1).addClass("cur"));!b.infiniteSlides&&b.stopAtEnd&&(a.$wrapper.find("span.forward")[c===a.pages?"addClass":"removeClass"]("disabled"),a.$wrapper.find("span.back")[c===1?"addClass":"removeClass"]("disabled"),c===a.pages&&a.playing&&a.startStop());if(!e){var f=a.getDim(c);a.$wrapper.css({width:f[0],height:f[1]});a.$wrapper.scrollLeft(0);a.$el.css("left",-a.panelSize[b.infiniteSlides&&a.pages>1?c:c-1][2])}a.currentPage=c;a.$currentPage=a.$items.eq(c-a.adjustLimit).addClass("activePage"); a.$wrapper.is(".activeSlider")||(d(".activeSlider").removeClass("activeSlider"),a.$wrapper.addClass("activeSlider"))};a.goForward=function(b){b!==!0&&(b=!1,a.startStop(!1));a.gotoPage(a.currentPage+1,b)};a.goBack=function(b){b!==!0&&(b=!1,a.startStop(!1));a.gotoPage(a.currentPage-1,b)};a.gotoHash=function(){var b=a.win.location.hash.match(a.regex);return b===null?"":parseInt(b[1],10)};a.setHash=function(b){var e="panel"+a.runTimes+"-",d=a.win.location.hash;if(typeof d!=="undefined")a.win.location.hash= d.indexOf(e)>0?d.replace(a.regex,e+b):d+"&"+e+b};a.slideControls=function(c){var d=c?0:b.animationTime,f=c?b.animationTime:0,g=c?1:0,h=c?0:1;b.toggleControls&&a.$controls.stop(!0,!0).delay(d)[c?"slideDown":"slideUp"](b.animationTime/2).delay(f);b.buildArrows&&b.toggleArrows&&(!a.hovered&&a.playing&&(h=1,g=0),a.$forward.stop(!0,!0).delay(d).animate({right:h*a.$arrowWidth,opacity:g},b.animationTime/2),a.$back.stop(!0,!0).delay(d).animate({left:h*a.$arrowWidth,opacity:g},b.animationTime/2))};a.clearTimer= function(b){if(a.timer&&(a.win.clearInterval(a.timer),!b&&a.slideshow))a.$el.trigger("slideshow_stop",a),a.slideshow=!1};a.startStop=function(c,d){c!==!0&&(c=!1);if(c&&!d)a.$el.trigger("slideshow_start",a),a.slideshow=!0;a.playing=c;b.autoPlay&&(a.$startStop.toggleClass("playing",c).html("<span>"+(c?b.stopText:b.startText)+"</span>"),parseInt(a.$startStop.find("span").css("text-indent"),10)<0&&a.$startStop.addClass(b.tooltipClass).attr("title",c?"Stop":"Start"));c?(a.clearTimer(!0),a.timer=a.win.setInterval(function(){if(!a.hasEmb|| !a.checkVideo(c))b.playRtl?a.goBack(!0):a.goForward(!0)},b.delay)):a.clearTimer()};a.checkVideo=function(c){var e,f,g=!1;a.$items.find("object[id*=ytvideo], embed[id*=ytvideo]").each(function(){e=d(this);e.length&&d.isFunction(e[0].getPlayerState)&&(f=e[0].getPlayerState(),c&&(f===1||f>2)&&a.$items.index(e.closest(".panel"))===a.currentPage&&b.resumeOnVideoEnd?g=!0:f>0&&e[0].pauseVideo())});return g};a.init()};d.anythingSlider.defaults={width:null,height:null,expand:!1,resizeContents:!0,showMultiple:!1, tooltipClass:"tooltip",theme:"default",startPanel:1,hashTags:!0,infiniteSlides:!0,enableKeyboard:!0,buildArrows:!0,toggleArrows:!1,buildNavigation:!0,enableNavigation:!0,toggleControls:!1,appendControlsTo:null,navigationFormatter:null,forwardText:"&raquo;",backText:"&laquo;",enablePlay:!0,autoPlay:!0,autoPlayLocked:!1,startStopped:!1,pauseOnHover:!0,resumeOnVideoEnd:!0,stopAtEnd:!1,playRtl:!1,startText:"Start",stopText:"Stop",delay:3E3,resumeDelay:15E3,animationTime:600,easing:"swing",clickArrows:"click", clickControls:"click focusin",clickSlideshow:"click",addWmodeToObject:"opaque",maxOverallWidth:32766};d.fn.anythingSlider=function(i,j){return this.each(function(){var a,b=d(this).data("AnythingSlider");(typeof i).match("object|undefined")?b?b.updateSlider():new d.anythingSlider(this,i):/\d/.test(i)&&!isNaN(i)&&b&&(a=typeof i==="number"?i:parseInt(d.trim(i),10),a>=1&&a<=b.pages&&b.gotoPage(a,!1,j))})}})(jQuery);
/*
 * AnythingSlider Slide FX 1.3 minified for AnythingSlider v1.5.8+
 * By Rob Garrison (aka Mottie & Fudgey)
 * Dual licensed under the MIT and GPL licenses.
 */
(function(h){h.fn.anythingSliderFx=function(g){var l=h(this).closest(".anythingSlider"),i=l.width(),n=l.height(),o=function(a){return{top:[{inFx:{top:0},outFx:{top:"-"+(a||n)}}],bottom:[{inFx:{bottom:0},outFx:{bottom:a||n}}],left:[{inFx:{left:0},outFx:{left:"-"+(a||i)}}],right:[{inFx:{right:0},outFx:{right:a||i}}],fade:[{inFx:{opacity:1},outFx:{opacity:0}}],expand:[{inFx:{width:"100%",top:"0%",left:"0%"},outFx:{width:a||"10%",top:"50%",left:"50%"}}],listLR:[{inFx:{left:0,opacity:1},outFx:[{left:a|| i,opacity:0},{left:"-"+(a||i),opacity:0}],selector:[":odd",":even"]}],listRL:[{inFx:{left:0,opacity:1},outFx:[{left:a||i,opacity:0},{left:"-"+(a||i),opacity:0}],selector:[":even",":odd"]}],"caption-Top":[{inFx:{top:0,opacity:0.8},outFx:{top:"-"+a||-50,opacity:0}}],"caption-Right":[{inFx:{right:0,opacity:0.8},outFx:{right:"-"+a||-150,opacity:0}}],"caption-Bottom":[{inFx:{bottom:0,opacity:0.8},outFx:{bottom:"-"+a||-50,opacity:0}}],"caption-Left":[{inFx:{left:0,opacity:0.8},outFx:{left:"-"+a||-150,opacity:0}}]}}; return this.each(function(){var a=o(),k={easing:"swing",timeIn:400,timeOut:350},i=function(e){e.each(function(){h(this).closest(".panel").is(".activePage")||h(this).css("visibility","hidden")})},m=function(e,a,c){if(!(e.length===0||typeof a==="undefined")){var b=a[0]||a,d=b[1]||"",h=parseInt(d===""?b.duration:b[0].duration,10);if(c&&(e.css("position")!=="absolute"&&e.css({position:"relative"}),e.stop(),d!=="")){e.filter(a[1][0]).animate(b[0],{queue:!1,duration:h,easing:b[0].easing});e.filter(a[1][1]).animate(d, {queue:!1,duration:h,easing:b[0].easing,complete:function(){setTimeout(function(){i(e)},k.timeOut)}});return}c||e.css("visibility","visible").show();e.animate(b,{queue:!1,duration:h,easing:b.easing,complete:function(){c&&setTimeout(function(){i(e)},k.timeOut)}})}},l=function(e,f){var c,b,d=f?"outFx":"inFx",g={},i=f?k.timeOut:k.timeIn,j=h.trim(e[0].replace(/\s+/g," ")).split(" ");if(f&&j.length===1&&a.hasOwnProperty(j)&&typeof a[j][0].selector!=="undefined")return b=a[j][0].outFx,b[0].duration=e[2]|| k.timeOut,b[0].easing=e[3]||k.easing,[b,a[j][0].selector||[]];h.each(j,function(b,f){if(a.hasOwnProperty(f)){var j=f==="fade"?1:2;c=typeof e[1]==="undefined"?a:o(e[1]);h.extend(!0,g,c[f][0][d]);g.duration=e[j]||g.duration||i;g.easing=e[j+1]||k.easing}});return[g]};h(this).bind("slide_init",function(a,f){var c,b,d=f.$lastPage.add(f.$items.eq(f.exactPage));f.exactPage===0&&(d=d.add(f.$items.eq(f.pages)));d=d.find("*").andSelf();for(c in g)if(c==="outFx")for(b in g.outFx)d.filter(b).length&&m(d.filter(b), g.outFx[b],!0);else c!=="inFx"&&h.isArray(g[c])&&d.filter(c).length&&m(d.filter(c),l(g[c],!0),!0)}).bind("slide_complete",function(a,f){var c,b,d=f.$currentPage.add(f.$items.eq(f.exactPage)),d=d.find("*").andSelf();for(c in g)if(c==="inFx")for(b in g.inFx)d.filter(b).length&&m(d.filter(b),g.inFx[b],!1);else c!=="outFx"&&h.isArray(g[c])&&d.filter(c).length&&m(d.filter(c),l(g[c],!1),!1)})})}})(jQuery);
/*
 * jQuery EasIng v1.1.2 - http://gsgd.co.uk/sandbox/jquery.easIng.php
 *
 * Uses the built In easIng capabilities added In jQuery 1.1
 * to offer multiple easIng options
 *
 * Copyright (c) 2007 George Smith
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */

// t: current time, b: begInnIng value, c: change In value, d: duration

jQuery.extend( jQuery.easing,
{
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();/** @license

 SoundManager 2: JavaScript Sound for the Web
 ----------------------------------------------
 http://schillmania.com/projects/soundmanager2/

 Copyright (c) 2007, Scott Schiller. All rights reserved.
 Code provided under the BSD License:
 http://schillmania.com/projects/soundmanager2/license.txt

 V2.97a.20110424
*/
(function(Y){function M(M,X){function i(c){return function(a){return!this._t||!this._t._a?null:c.call(this,a)}}function pa(){if(c.debugURLParam.test(N))c.debugMode=!0}this.flashVersion=8;this.debugFlash=this.debugMode=!1;this.useConsole=!0;this.waitForWindowLoad=this.consoleOnly=!1;this.nullURL="about:blank";this.allowPolling=!0;this.useFastPolling=!1;this.useMovieStar=!0;this.bgColor="#ffffff";this.useHighPerformance=!1;this.flashPollingInterval=null;this.flashLoadTimeout=1E3;this.wmode=null;this.allowScriptAccess=
"always";this.useHTML5Audio=this.useFlashBlock=!1;this.html5Test=/^probably$/i;this.useGlobalHTML5Audio=!0;this.requireFlash=!1;this.audioFormats={mp3:{type:['audio/mpeg; codecs="mp3"',"audio/mpeg","audio/mp3","audio/MPA","audio/mpa-robust"],required:!0},mp4:{related:["aac","m4a"],type:['audio/mp4; codecs="mp4a.40.2"',"audio/aac","audio/x-m4a","audio/MP4A-LATM","audio/mpeg4-generic"],required:!0},ogg:{type:["audio/ogg; codecs=vorbis"],required:!1},wav:{type:['audio/wav; codecs="1"',"audio/wav","audio/wave",
"audio/x-wav"],required:!1}};this.defaultOptions={autoLoad:!1,stream:!0,autoPlay:!1,loops:1,onid3:null,onload:null,whileloading:null,onplay:null,onpause:null,onresume:null,whileplaying:null,onstop:null,onfailure:null,onfinish:null,onbeforefinish:null,onbeforefinishtime:5E3,onbeforefinishcomplete:null,onjustbeforefinish:null,onjustbeforefinishtime:200,multiShot:!0,multiShotEvents:!1,position:null,pan:0,type:null,usePolicyFile:!1,volume:100};this.flash9Options={isMovieStar:null,usePeakData:!1,useWaveformData:!1,
useEQData:!1,onbufferchange:null,ondataerror:null};this.movieStarOptions={bufferTime:3,serverURL:null,onconnect:null,duration:null};this.version=null;this.versionNumber="V2.97a.20110424";this.movieURL=null;this.url=M||null;this.altURL=null;this.enabled=this.swfLoaded=!1;this.o=null;this.movieID="sm2-container";this.id=X||"sm2movie";this.swfCSS={swfBox:"sm2-object-box",swfDefault:"movieContainer",swfError:"swf_error",swfTimedout:"swf_timedout",swfLoaded:"swf_loaded",swfUnblocked:"swf_unblocked",sm2Debug:"sm2_debug",
highPerf:"high_performance",flashDebug:"flash_debug"};this.oMC=null;this.sounds={};this.soundIDs=[];this.muted=!1;this.debugID="soundmanager-debug";this.debugURLParam=/([#?&])debug=1/i;this.didFlashBlock=this.specialWmodeCase=!1;this.filePattern=null;this.filePatterns={flash8:/\.mp3(\?.*)?$/i,flash9:/\.mp3(\?.*)?$/i};this.baseMimeTypes=/^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;this.netStreamMimeTypes=/^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;this.netStreamTypes=["aac","flv","mov","mp4","m4v",
"f4v","m4a","mp4v","3gp","3g2"];this.netStreamPattern=RegExp("\\.("+this.netStreamTypes.join("|")+")(\\?.*)?$","i");this.mimePattern=this.baseMimeTypes;this.features={buffering:!1,peakData:!1,waveformData:!1,eqData:!1,movieStar:!1};this.sandbox={};this.hasHTML5=null;this.html5={usingFlash:null};this.ignoreFlash=!1;var Z,c=this,y,n=navigator.userAgent,h=Y,N=h.location.href.toString(),k=this.flashVersion,g=document,$,O,r=[],E=!1,F=!1,m=!1,t=!1,qa=!1,G,o,aa,u,z,ba,P,ra,ca,v,sa,H,A,da,ea,Q,fa,ta,ua,R,
va,I=null,ga=null,w,ha,B,S,T,ia,j,U=!1,ja=!1,wa,xa,x=null,ya,V,p=!1,J,s,ka,za,l,Da=Array.prototype.slice,K=!1,la,C,Aa,Ba=n.match(/pre\//i),Ea=n.match(/(ipad|iphone|ipod)/i);n.match(/mobile/i);var q=n.match(/msie/i),Fa=n.match(/webkit/i),L=n.match(/safari/i)&&!n.match(/chrome/i),Ga=n.match(/opera/i),ma=!N.match(/usehtml5audio/i)&&!N.match(/sm2\-ignorebadua/i)&&L&&n.match(/OS X 10_6_([3-9])/i),na=typeof g.hasFocus!=="undefined"?g.hasFocus():null,D=typeof g.hasFocus==="undefined"&&L,Ca=!D;this._use_maybe=
N.match(/sm2\-useHTML5Maybe\=1/i);this._overHTTP=g.location?g.location.protocol.match(/http/i):null;this._http=!this._overHTTP?"http:":"";this.useAltURL=!this._overHTTP;this._global_a=null;if(Ea||Ba)c.useHTML5Audio=!0,c.ignoreFlash=!0,c.useGlobalHTML5Audio&&(K=!0);if(Ba||this._use_maybe)c.html5Test=/^(probably|maybe)$/i;this.supported=this.ok=function(){return x?m&&!t:c.useHTML5Audio&&c.hasHTML5};this.getMovie=function(c){return q?h[c]:L?y(c)||g[c]:y(c)};this.createSound=function(b){function a(){e=
S(e);c.sounds[d.id]=new Z(d);c.soundIDs.push(d.id);return c.sounds[d.id]}var e=null,f=null,d=null;if(!m||!c.ok())return ia("soundManager.createSound(): "+w(!m?"notReady":"notOK")),!1;arguments.length===2&&(b={id:arguments[0],url:arguments[1]});d=e=o(b);if(j(d.id,!0))return c.sounds[d.id];if(V(d))f=a(),f._setup_html5(d);else{if(k>8&&c.useMovieStar){if(d.isMovieStar===null)d.isMovieStar=d.serverURL||d.type&&d.type.match(c.netStreamPattern)||d.url.match(c.netStreamPattern)?!0:!1;if(d.isMovieStar&&d.usePeakData)d.usePeakData=
!1}d=T(d,"soundManager.createSound(): ");f=a();if(k===8)c.o._createSound(d.id,d.onjustbeforefinishtime,d.loops||1,d.usePolicyFile);else if(c.o._createSound(d.id,d.url,d.onjustbeforefinishtime,d.usePeakData,d.useWaveformData,d.useEQData,d.isMovieStar,d.isMovieStar?d.bufferTime:!1,d.loops||1,d.serverURL,d.duration||null,d.autoPlay,!0,d.autoLoad,d.usePolicyFile),!d.serverURL)f.connected=!0,d.onconnect&&d.onconnect.apply(f);(d.autoLoad||d.autoPlay)&&!d.serverURL&&f.load(d)}d.autoPlay&&!d.serverURL&&f.play();
return f};this.destroySound=function(b,a){if(!j(b))return!1;var e=c.sounds[b],f;e._iO={};e.stop();e.unload();for(f=0;f<c.soundIDs.length;f++)if(c.soundIDs[f]===b){c.soundIDs.splice(f,1);break}a||e.destruct(!0);delete c.sounds[b];return!0};this.load=function(b,a){if(!j(b))return!1;return c.sounds[b].load(a)};this.unload=function(b){if(!j(b))return!1;return c.sounds[b].unload()};this.start=this.play=function(b,a){if(!m||!c.ok())return ia("soundManager.play(): "+w(!m?"notReady":"notOK")),!1;if(!j(b))return a instanceof
Object||(a={url:a}),a&&a.url?(a.id=b,c.createSound(a).play()):!1;return c.sounds[b].play(a)};this.setPosition=function(b,a){if(!j(b))return!1;return c.sounds[b].setPosition(a)};this.stop=function(b){if(!j(b))return!1;return c.sounds[b].stop()};this.stopAll=function(){for(var b in c.sounds)c.sounds[b]instanceof Z&&c.sounds[b].stop()};this.pause=function(b){if(!j(b))return!1;return c.sounds[b].pause()};this.pauseAll=function(){for(var b=c.soundIDs.length;b--;)c.sounds[c.soundIDs[b]].pause()};this.resume=
function(b){if(!j(b))return!1;return c.sounds[b].resume()};this.resumeAll=function(){for(var b=c.soundIDs.length;b--;)c.sounds[c.soundIDs[b]].resume()};this.togglePause=function(b){if(!j(b))return!1;return c.sounds[b].togglePause()};this.setPan=function(b,a){if(!j(b))return!1;return c.sounds[b].setPan(a)};this.setVolume=function(b,a){if(!j(b))return!1;return c.sounds[b].setVolume(a)};this.mute=function(b){var a=0;typeof b!=="string"&&(b=null);if(b){if(!j(b))return!1;return c.sounds[b].mute()}else{for(a=
c.soundIDs.length;a--;)c.sounds[c.soundIDs[a]].mute();c.muted=!0}return!0};this.muteAll=function(){c.mute()};this.unmute=function(b){typeof b!=="string"&&(b=null);if(b){if(!j(b))return!1;return c.sounds[b].unmute()}else{for(b=c.soundIDs.length;b--;)c.sounds[c.soundIDs[b]].unmute();c.muted=!1}return!0};this.unmuteAll=function(){c.unmute()};this.toggleMute=function(b){if(!j(b))return!1;return c.sounds[b].toggleMute()};this.getMemoryUse=function(){if(k===8)return 0;if(c.o)return parseInt(c.o._getMemoryUse(),
10)};this.disable=function(b){typeof b==="undefined"&&(b=!1);if(t)return!1;t=!0;for(var a=c.soundIDs.length;a--;)ua(c.sounds[c.soundIDs[a]]);G(b);l.remove(h,"load",z);return!0};this.canPlayMIME=function(b){var a;c.hasHTML5&&(a=J({type:b}));return!x||a?a:b?b.match(c.mimePattern)?!0:!1:null};this.canPlayURL=function(b){var a;c.hasHTML5&&(a=J(b));return!x||a?a:b?b.match(c.filePattern)?!0:!1:null};this.canPlayLink=function(b){if(typeof b.type!=="undefined"&&b.type&&c.canPlayMIME(b.type))return!0;return c.canPlayURL(b.href)};
this.getSoundById=function(b){if(!b)throw Error("soundManager.getSoundById(): sID is null/undefined");return c.sounds[b]};this.onready=function(c,a){if(c&&c instanceof Function)return a||(a=h),aa("onready",c,a),u(),!0;else throw w("needFunction","onready");};this.ontimeout=function(c,a){if(c&&c instanceof Function)return a||(a=h),aa("ontimeout",c,a),u({type:"ontimeout"}),!0;else throw w("needFunction","ontimeout");};this.getMoviePercent=function(){return c.o&&typeof c.o.PercentLoaded!=="undefined"?
c.o.PercentLoaded():null};this._wD=this._writeDebug=function(){return!0};this._debug=function(){};this.reboot=function(){var b,a;for(b=c.soundIDs.length;b--;)c.sounds[c.soundIDs[b]].destruct();try{if(q)ga=c.o.innerHTML;I=c.o.parentNode.removeChild(c.o)}catch(e){}ga=I=null;c.enabled=m=U=ja=E=F=t=c.swfLoaded=!1;c.soundIDs=c.sounds=[];c.o=null;for(b in r)if(r.hasOwnProperty(b))for(a=r[b].length;a--;)r[b][a].fired=!1;h.setTimeout(function(){c.beginDelayedInit()},20)};this.destruct=function(){c.disable(!0)};
this.beginDelayedInit=function(){qa=!0;A();setTimeout(sa,20);P()};this._html5_events={abort:i(function(){}),canplay:i(function(){this._t._onbufferchange(0);var c=!isNaN(this._t.position)?this._t.position/1E3:null;this._t._html5_canplay=!0;if(this._t.position&&this.currentTime!==c)try{this.currentTime=c}catch(a){}}),load:i(function(){this._t.loaded||(this._t._onbufferchange(0),this._t._whileloading(this._t.bytesTotal,this._t.bytesTotal,this._t._get_html5_duration()),this._t._onload(!0))}),emptied:i(function(){}),
ended:i(function(){this._t._onfinish()}),error:i(function(){this._t._onload(!1)}),loadeddata:i(function(){}),loadedmetadata:i(function(){}),loadstart:i(function(){this._t._onbufferchange(1)}),play:i(function(){this._t._onbufferchange(0)}),playing:i(function(){this._t._onbufferchange(0)}),progress:i(function(b){if(this._t.loaded)return!1;var a,e=0,f=b.type==="progress",d=b.target.buffered;a=b.loaded||0;var oa=b.total||1;if(d&&d.length){for(a=d.length;a--;)e=d.end(a)-d.start(a);a=e/b.target.duration;
f&&isNaN(a)}isNaN(a)||(this._t._onbufferchange(0),this._t._whileloading(a,oa,this._t._get_html5_duration()),a&&oa&&a===oa&&c._html5_events.load.call(this,b))}),ratechange:i(function(){}),suspend:i(function(b){c._html5_events.progress.call(this,b)}),stalled:i(function(){}),timeupdate:i(function(){this._t._onTimer()}),waiting:i(function(){this._t._onbufferchange(1)})};Z=function(b){var a=this,e,f,d;this.sID=b.id;this.url=b.url;this._iO=this.instanceOptions=this.options=o(b);this.pan=this.options.pan;
this.volume=this.options.volume;this._lastURL=null;this.isHTML5=!1;this._a=null;this.id3={};this._debug=function(){};this._debug();this.load=function(b){var d=null;if(typeof b!=="undefined")a._iO=o(b,a.options),a.instanceOptions=a._iO;else if(b=a.options,a._iO=b,a.instanceOptions=a._iO,a._lastURL&&a._lastURL!==a.url)a._iO.url=a.url,a.url=null;if(!a._iO.url)a._iO.url=a.url;if(a._iO.url===a.url&&a.readyState!==0&&a.readyState!==2)return a;a._lastURL=a.url;a.loaded=!1;a.readyState=1;a.playState=0;if(V(a._iO)){if(d=
a._setup_html5(a._iO),!d._called_load)d.load(),d._called_load=!0,a._iO.autoPlay&&a.play()}else try{a.isHTML5=!1,a._iO=T(S(a._iO)),k===8?c.o._load(a.sID,a._iO.url,a._iO.stream,a._iO.autoPlay,a._iO.whileloading?1:0,a._iO.loops||1,a._iO.usePolicyFile):c.o._load(a.sID,a._iO.url,a._iO.stream?!0:!1,a._iO.autoPlay?!0:!1,a._iO.loops||1,a._iO.autoLoad?!0:!1,a._iO.usePolicyFile)}catch(e){fa()}return a};this.unload=function(){if(a.readyState!==0){if(a.isHTML5){if(f(),a._a)a._a.pause(),a._a.src=""}else k===8?
c.o._unload(a.sID,c.nullURL):c.o._unload(a.sID);e()}return a};this.destruct=function(b){if(a.isHTML5){if(f(),a._a)a._a.pause(),a._a.src="",K||a._remove_html5_events()}else a._iO.onfailure=null,c.o._destroySound(a.sID);b||c.destroySound(a.sID,!0)};this.start=this.play=function(b,W){var e,W=W===void 0?!0:W;b||(b={});a._iO=o(b,a._iO);a._iO=o(a._iO,a.options);a.instanceOptions=a._iO;if(a._iO.serverURL&&!a.connected)return a.getAutoPlay()||a.setAutoPlay(!0),a;V(a._iO)&&(a._setup_html5(a._iO),d());if(a.playState===
1&&!a.paused)if(e=a._iO.multiShot)a.isHTML5&&a.setPosition(a._iO.position);else return a;if(!a.loaded)if(a.readyState===0){if(!a.isHTML5)a._iO.autoPlay=!0;a.load(a._iO)}else if(a.readyState===2)return a;if(a.paused&&a.position&&a.position>0)a.resume();else{a.playState=1;a.paused=!1;(!a.instanceCount||a._iO.multiShotEvents||k>8&&!a.isHTML5&&!a.getAutoPlay())&&a.instanceCount++;a.position=typeof a._iO.position!=="undefined"&&!isNaN(a._iO.position)?a._iO.position:0;if(!a.isHTML5)a._iO=T(S(a._iO));if(a._iO.onplay&&
W)a._iO.onplay.apply(a),a._onplay_called=!0;a.setVolume(a._iO.volume,!0);a.setPan(a._iO.pan,!0);a.isHTML5?(d(),a._setup_html5().play()):c.o._start(a.sID,a._iO.loops||1,k===9?a.position:a.position/1E3)}return a};this.stop=function(b){if(a.playState===1){a._onbufferchange(0);a.resetOnPosition(0);if(!a.isHTML5)a.playState=0;a.paused=!1;a._iO.onstop&&a._iO.onstop.apply(a);if(a.isHTML5){if(a._a)a.setPosition(0),a._a.pause(),a.playState=0,a._onTimer(),f(),a.unload()}else c.o._stop(a.sID,b),a._iO.serverURL&&
a.unload();a.instanceCount=0;a._iO={}}return a};this.setAutoPlay=function(b){a._iO.autoPlay=b;a.isHTML5?a._a&&b&&a.play():c.o._setAutoPlay(a.sID,b);b&&!a.instanceCount&&a.readyState===1&&a.instanceCount++};this.getAutoPlay=function(){return a._iO.autoPlay};this.setPosition=function(b){b===void 0&&(b=0);var d=a.isHTML5?Math.max(b,0):Math.min(a.duration||a._iO.duration,Math.max(b,0));a.position=d;b=a.position/1E3;a.resetOnPosition(a.position);a._iO.position=d;if(a.isHTML5){if(a._a&&a._html5_canplay&&
a._a.currentTime!==b)try{a._a.currentTime=b}catch(e){}}else b=k===9?a.position:b,a.readyState&&a.readyState!==2&&c.o._setPosition(a.sID,b,a.paused||!a.playState);a.isHTML5&&a.paused&&a._onTimer(!0);return a};this.pause=function(b){if(a.paused||a.playState===0&&a.readyState!==1)return a;a.paused=!0;a.isHTML5?(a._setup_html5().pause(),f()):(b||b===void 0)&&c.o._pause(a.sID);a._iO.onpause&&a._iO.onpause.apply(a);return a};this.resume=function(){if(!a.paused)return a;a.paused=!1;a.playState=1;a.isHTML5?
(a._setup_html5().play(),d()):(a._iO.isMovieStar&&a.setPosition(a.position),c.o._pause(a.sID));!a._onplay_called&&a._iO.onplay?(a._iO.onplay.apply(a),a._onplay_called=!0):a._iO.onresume&&a._iO.onresume.apply(a);return a};this.togglePause=function(){if(a.playState===0)return a.play({position:k===9&&!a.isHTML5?a.position:a.position/1E3}),a;a.paused?a.resume():a.pause();return a};this.setPan=function(b,d){typeof b==="undefined"&&(b=0);typeof d==="undefined"&&(d=!1);a.isHTML5||c.o._setPan(a.sID,b);a._iO.pan=
b;if(!d)a.pan=b,a.options.pan=b;return a};this.setVolume=function(b,d){typeof b==="undefined"&&(b=100);typeof d==="undefined"&&(d=!1);if(a.isHTML5){if(a._a)a._a.volume=Math.max(0,Math.min(1,b/100))}else c.o._setVolume(a.sID,c.muted&&!a.muted||a.muted?0:b);a._iO.volume=b;if(!d)a.volume=b,a.options.volume=b;return a};this.mute=function(){a.muted=!0;if(a.isHTML5){if(a._a)a._a.muted=!0}else c.o._setVolume(a.sID,0);return a};this.unmute=function(){a.muted=!1;var b=typeof a._iO.volume!=="undefined";if(a.isHTML5){if(a._a)a._a.muted=
!1}else c.o._setVolume(a.sID,b?a._iO.volume:a.options.volume);return a};this.toggleMute=function(){return a.muted?a.unmute():a.mute()};this.onposition=function(c,b,d){a._onPositionItems.push({position:c,method:b,scope:typeof d!=="undefined"?d:a,fired:!1});return a};this.processOnPosition=function(){var b,d;b=a._onPositionItems.length;if(!b||!a.playState||a._onPositionFired>=b)return!1;for(;b--;)if(d=a._onPositionItems[b],!d.fired&&a.position>=d.position)d.method.apply(d.scope,[d.position]),d.fired=
!0,c._onPositionFired++;return!0};this.resetOnPosition=function(b){var d,e;d=a._onPositionItems.length;if(!d)return!1;for(;d--;)if(e=a._onPositionItems[d],e.fired&&b<=e.position)e.fired=!1,c._onPositionFired--;return!0};this._onTimer=function(c){var b={};if(a._hasTimer||c)return a._a&&(c||(a.playState>0||a.readyState===1)&&!a.paused)?(a.duration=a._get_html5_duration(),a.durationEstimate=a.duration,c=a._a.currentTime?a._a.currentTime*1E3:0,a._whileplaying(c,b,b,b,b),!0):!1};this._get_html5_duration=
function(){var c=a._a?a._a.duration*1E3:a._iO?a._iO.duration:void 0;return c&&!isNaN(c)&&c!==Infinity?c:a._iO?a._iO.duration:null};d=function(){a.isHTML5&&wa(a)};f=function(){a.isHTML5&&xa(a)};e=function(){a._onPositionItems=[];a._onPositionFired=0;a._hasTimer=null;a._onplay_called=!1;a._a=null;a._html5_canplay=!1;a.bytesLoaded=null;a.bytesTotal=null;a.position=null;a.duration=a._iO&&a._iO.duration?a._iO.duration:null;a.durationEstimate=null;a.failures=0;a.loaded=!1;a.playState=0;a.paused=!1;a.readyState=
0;a.muted=!1;a.didBeforeFinish=!1;a.didJustBeforeFinish=!1;a.isBuffering=!1;a.instanceOptions={};a.instanceCount=0;a.peakData={left:0,right:0};a.waveformData={left:[],right:[]};a.eqData=[];a.eqData.left=[];a.eqData.right=[]};e();this._setup_html5=function(b){var b=o(a._iO,b),d=K?c._global_a:a._a;decodeURI(b.url);var f=d&&d._t?d._t.instanceOptions:null;if(d){if(d._t&&f.url===b.url&&(!a._lastURL||a._lastURL===f.url))return d;K&&d._t&&d._t.playState&&b.url!==f.url&&d._t.stop();e();d.src=b.url;a.url=
b.url;a._lastURL=b.url;d._called_load=!1}else if(d=new Audio(b.url),d._called_load=!1,K)c._global_a=d;a.isHTML5=!0;a._a=d;d._t=a;a._add_html5_events();d.loop=b.loops>1?"loop":"";b.autoLoad||b.autoPlay?(d.autobuffer="auto",d.preload="auto",a.load(),d._called_load=!0):(d.autobuffer=!1,d.preload="none");d.loop=b.loops>1?"loop":"";return d};this._add_html5_events=function(){if(a._a._added_events)return!1;var b;a._a._added_events=!0;for(b in c._html5_events)c._html5_events.hasOwnProperty(b)&&a._a&&a._a.addEventListener(b,
c._html5_events[b],!1);return!0};this._remove_html5_events=function(){a._a._added_events=!1;for(var b in c._html5_events)c._html5_events.hasOwnProperty(b)&&a._a&&a._a.removeEventListener(b,c._html5_events[b],!1)};this._whileloading=function(c,b,d,e){a.bytesLoaded=c;a.bytesTotal=b;a.duration=Math.floor(d);a.bufferLength=e;if(a._iO.isMovieStar)a.durationEstimate=a.duration;else if(a.durationEstimate=a._iO.duration?a.duration>a._iO.duration?a.duration:a._iO.duration:parseInt(a.bytesTotal/a.bytesLoaded*
a.duration,10),a.durationEstimate===void 0)a.durationEstimate=a.duration;a.readyState!==3&&a._iO.whileloading&&a._iO.whileloading.apply(a)};this._onid3=function(c,b){var d=[],e,f;e=0;for(f=c.length;e<f;e++)d[c[e]]=b[e];a.id3=o(a.id3,d);a._iO.onid3&&a._iO.onid3.apply(a)};this._whileplaying=function(b,d,e,f,g){if(isNaN(b)||b===null)return!1;a.playState===0&&b>0&&(b=0);a.position=b;a.processOnPosition();if(k>8&&!a.isHTML5){if(a._iO.usePeakData&&typeof d!=="undefined"&&d)a.peakData={left:d.leftPeak,right:d.rightPeak};
if(a._iO.useWaveformData&&typeof e!=="undefined"&&e)a.waveformData={left:e.split(","),right:f.split(",")};if(a._iO.useEQData&&typeof g!=="undefined"&&g&&g.leftEQ&&(b=g.leftEQ.split(","),a.eqData=b,a.eqData.left=b,typeof g.rightEQ!=="undefined"&&g.rightEQ))a.eqData.right=g.rightEQ.split(",")}a.playState===1&&(!a.isHTML5&&c.flashVersion===8&&!a.position&&a.isBuffering&&a._onbufferchange(0),a._iO.whileplaying&&a._iO.whileplaying.apply(a),(a.loaded||!a.loaded&&a._iO.isMovieStar)&&a._iO.onbeforefinish&&
a._iO.onbeforefinishtime&&!a.didBeforeFinish&&a.duration-a.position<=a._iO.onbeforefinishtime&&a._onbeforefinish());return!0};this._onconnect=function(b){b=b===1;if(a.connected=b)a.failures=0,j(a.sID)&&(a.getAutoPlay()?a.play(void 0,a.getAutoPlay()):a._iO.autoLoad&&a.load()),a._iO.onconnect&&a._iO.onconnect.apply(a,[b])};this._onload=function(b){b=b?!0:!1;a.loaded=b;a.readyState=b?3:2;a._onbufferchange(0);a._iO.onload&&a._iO.onload.apply(a,[b]);return!0};this._onfailure=function(b,c,d){a.failures++;
if(a._iO.onfailure&&a.failures===1)a._iO.onfailure(a,b,c,d)};this._onbeforefinish=function(){if(!a.didBeforeFinish)a.didBeforeFinish=!0,a._iO.onbeforefinish&&a._iO.onbeforefinish.apply(a)};this._onjustbeforefinish=function(){if(!a.didJustBeforeFinish)a.didJustBeforeFinish=!0,a._iO.onjustbeforefinish&&a._iO.onjustbeforefinish.apply(a)};this._onfinish=function(){var b=a._iO.onfinish;a._onbufferchange(0);a.resetOnPosition(0);a._iO.onbeforefinishcomplete&&a._iO.onbeforefinishcomplete.apply(a);a.didBeforeFinish=
!1;a.didJustBeforeFinish=!1;if(a.instanceCount){a.instanceCount--;if(!a.instanceCount)a.playState=0,a.paused=!1,a.instanceCount=0,a.instanceOptions={},a._iO={},f();(!a.instanceCount||a._iO.multiShotEvents)&&b&&b.apply(a)}};this._onbufferchange=function(b){if(a.playState===0)return!1;if(b&&a.isBuffering||!b&&!a.isBuffering)return!1;a.isBuffering=b===1;a._iO.onbufferchange&&a._iO.onbufferchange.apply(a);return!0};this._ondataerror=function(){a.playState>0&&a._iO.ondataerror&&a._iO.ondataerror.apply(a)}};
ea=function(){return g.body?g.body:g._docElement?g.documentElement:g.getElementsByTagName("div")[0]};y=function(b){return g.getElementById(b)};o=function(b,a){var e={},f,d;for(f in b)b.hasOwnProperty(f)&&(e[f]=b[f]);f=typeof a==="undefined"?c.defaultOptions:a;for(d in f)f.hasOwnProperty(d)&&typeof e[d]==="undefined"&&(e[d]=f[d]);return e};l=function(){function b(a){var a=Da.call(a),b=a.length;c?(a[1]="on"+a[1],b>3&&a.pop()):b===3&&a.push(!1);return a}function a(a,b){var g=a.shift(),h=[f[b]];if(c)g[h](a[0],
a[1]);else g[h].apply(g,a)}var c=h.attachEvent,f={add:c?"attachEvent":"addEventListener",remove:c?"detachEvent":"removeEventListener"};return{add:function(){a(b(arguments),"add")},remove:function(){a(b(arguments),"remove")}}}();V=function(b){return!b.serverURL&&(b.type?J({type:b.type}):J(b.url)||p)};J=function(b){if(!c.useHTML5Audio||!c.hasHTML5)return!1;var a,e=c.audioFormats;if(!s){s=[];for(a in e)e.hasOwnProperty(a)&&(s.push(a),e[a].related&&(s=s.concat(e[a].related)));s=RegExp("\\.("+s.join("|")+
")","i")}a=typeof b.type!=="undefined"?b.type:null;b=typeof b==="string"?b.toLowerCase().match(s):null;if(!b||!b.length)if(a)b=a.indexOf(";"),b=(b!==-1?a.substr(0,b):a).substr(6);else return!1;else b=b[0].substr(1);if(b&&typeof c.html5[b]!=="undefined")return c.html5[b];else{if(!a)if(b&&c.html5[b])return c.html5[b];else a="audio/"+b;a=c.html5.canPlayType(a);return c.html5[b]=a}};za=function(){function b(b){var d,e,f=!1;if(!a||typeof a.canPlayType!=="function")return!1;if(b instanceof Array){d=0;for(e=
b.length;d<e&&!f;d++)if(c.html5[b[d]]||a.canPlayType(b[d]).match(c.html5Test))f=!0,c.html5[b[d]]=!0;return f}else return(b=a&&typeof a.canPlayType==="function"?a.canPlayType(b):!1)&&(b.match(c.html5Test)?!0:!1)}if(!c.useHTML5Audio||typeof Audio==="undefined")return!1;var a=typeof Audio!=="undefined"?Ga?new Audio(null):new Audio:null,e,f={},d,g;C();d=c.audioFormats;for(e in d)if(d.hasOwnProperty(e)&&(f[e]=b(d[e].type),d[e]&&d[e].related))for(g=d[e].related.length;g--;)c.html5[d[e].related[g]]=f[e];
f.canPlayType=a?b:null;c.html5=o(c.html5,f);return!0};w=function(){};S=function(b){if(k===8&&b.loops>1&&b.stream)b.stream=!1;return b};T=function(b){if(b&&!b.usePolicyFile&&(b.onid3||b.usePeakData||b.useWaveformData||b.useEQData))b.usePolicyFile=!0;return b};ia=function(b){typeof console!=="undefined"&&typeof console.warn!=="undefined"&&console.warn(b)};$=function(){return!1};ua=function(b){for(var a in b)b.hasOwnProperty(a)&&typeof b[a]==="function"&&(b[a]=$)};R=function(b){typeof b==="undefined"&&
(b=!1);(t||b)&&c.disable(b)};va=function(b){var a=null;if(b)if(b.match(/\.swf(\?.*)?$/i)){if(a=b.substr(b.toLowerCase().lastIndexOf(".swf?")+4))return b}else b.lastIndexOf("/")!==b.length-1&&(b+="/");return(b&&b.lastIndexOf("/")!==-1?b.substr(0,b.lastIndexOf("/")+1):"./")+c.movieURL};ca=function(){if(k!==8&&k!==9)c.flashVersion=8;var b=c.debugMode||c.debugFlash?"_debug.swf":".swf";if(c.useHTML5Audio&&!p&&c.audioFormats.mp4.required&&c.flashVersion<9)c.flashVersion=9;k=c.flashVersion;c.version=c.versionNumber+
(p?" (HTML5-only mode)":k===9?" (AS3/Flash 9)":" (AS2/Flash 8)");if(k>8)c.defaultOptions=o(c.defaultOptions,c.flash9Options),c.features.buffering=!0;k>8&&c.useMovieStar?(c.defaultOptions=o(c.defaultOptions,c.movieStarOptions),c.filePatterns.flash9=RegExp("\\.(mp3|"+c.netStreamTypes.join("|")+")(\\?.*)?$","i"),c.mimePattern=c.netStreamMimeTypes,c.features.movieStar=!0):(c.useMovieStar=!1,c.features.movieStar=!1);c.filePattern=c.filePatterns[k!==8?"flash9":"flash8"];c.movieURL=(k===8?"soundmanager2.swf":
"soundmanager2_flash9.swf").replace(".swf",b);c.features.peakData=c.features.waveformData=c.features.eqData=k>8};ta=function(b,a){if(!c.o||!c.allowPolling)return!1;c.o._setPolling(b,a)};Q=function(b,a){var e=a?a:c.url,f=c.altURL?c.altURL:e,d;d=ea();var h,k,i=B(),j,l=null,l=(l=g.getElementsByTagName("html")[0])&&l.dir&&l.dir.match(/rtl/i),b=typeof b==="undefined"?c.id:b;if(E&&F)return!1;if(p)return ca(),c.oMC=y(c.movieID),O(),F=E=!0,!1;E=!0;ca();c.url=va(c._overHTTP?e:f);a=c.url;c.wmode=!c.wmode&&
c.useHighPerformance&&!c.useMovieStar?"transparent":c.wmode;if(c.wmode!==null&&(n.match(/msie 8/i)||!q&&!c.useHighPerformance)&&navigator.platform.match(/win32|win64/i))c.specialWmodeCase=!0,c.wmode=null;d={name:b,id:b,src:a,width:"100%",height:"100%",quality:"high",allowScriptAccess:c.allowScriptAccess,bgcolor:c.bgColor,pluginspage:c._http+"//www.macromedia.com/go/getflashplayer",type:"application/x-shockwave-flash",wmode:c.wmode,hasPriority:"true"};if(c.debugFlash)d.FlashVars="debug=1";c.wmode||
delete d.wmode;if(q)e=g.createElement("div"),k='<object id="'+b+'" data="'+a+'" type="'+d.type+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="'+c._http+'//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="'+d.width+'" height="'+d.height+'"><param name="movie" value="'+a+'" /><param name="AllowScriptAccess" value="'+c.allowScriptAccess+'" /><param name="quality" value="'+d.quality+'" />'+(c.wmode?'<param name="wmode" value="'+c.wmode+'" /> ':"")+
'<param name="bgcolor" value="'+c.bgColor+'" />'+(c.debugFlash?'<param name="FlashVars" value="'+d.FlashVars+'" />':"")+"</object>";else for(h in e=g.createElement("embed"),d)d.hasOwnProperty(h)&&e.setAttribute(h,d[h]);pa();i=B();if(d=ea())if(c.oMC=y(c.movieID)?y(c.movieID):g.createElement("div"),c.oMC.id){j=c.oMC.className;c.oMC.className=(j?j+" ":c.swfCSS.swfDefault)+(i?" "+i:"");c.oMC.appendChild(e);if(q)h=c.oMC.appendChild(g.createElement("div")),h.className=c.swfCSS.swfBox,h.innerHTML=k;F=!0}else{c.oMC.id=
c.movieID;c.oMC.className=c.swfCSS.swfDefault+" "+i;h=i=null;if(!c.useFlashBlock)if(c.useHighPerformance)i={position:"fixed",width:"8px",height:"8px",bottom:"0px",left:"0px",overflow:"hidden"};else if(i={position:"absolute",width:"6px",height:"6px",top:"-9999px",left:"-9999px"},l)i.left=Math.abs(parseInt(i.left,10))+"px";if(Fa)c.oMC.style.zIndex=1E4;if(!c.debugFlash)for(j in i)i.hasOwnProperty(j)&&(c.oMC.style[j]=i[j]);try{q||c.oMC.appendChild(e);d.appendChild(c.oMC);if(q)h=c.oMC.appendChild(g.createElement("div")),
h.className=c.swfCSS.swfBox,h.innerHTML=k;F=!0}catch(m){throw Error(w("appXHTML"));}}return!0};j=this.getSoundById;H=function(){if(p)return Q(),!1;if(c.o)return!1;c.o=c.getMovie(c.id);if(!c.o)I?(q?c.oMC.innerHTML=ga:c.oMC.appendChild(I),I=null,E=!0):Q(c.id,c.url),c.o=c.getMovie(c.id);c.oninitmovie instanceof Function&&setTimeout(c.oninitmovie,1);return!0};ba=function(b){if(b)c.url=b;H()};P=function(){setTimeout(ra,500)};ra=function(){if(U)return!1;U=!0;l.remove(h,"load",P);if(D&&!na)return!1;var b;
m||(b=c.getMoviePercent());setTimeout(function(){b=c.getMoviePercent();!m&&Ca&&(b===null?c.useFlashBlock||c.flashLoadTimeout===0?c.useFlashBlock&&ha():R(!0):c.flashLoadTimeout!==0&&R(!0))},c.flashLoadTimeout)};ba=function(b){if(b)c.url=b;H()};B=function(){var b=[];c.debugMode&&b.push(c.swfCSS.sm2Debug);c.debugFlash&&b.push(c.swfCSS.flashDebug);c.useHighPerformance&&b.push(c.swfCSS.highPerf);return b.join(" ")};ha=function(){w("fbHandler");var b=c.getMoviePercent(),a=c.swfCSS;if(c.ok()){if(c.oMC)c.oMC.className=
[B(),a.swfDefault,a.swfLoaded+(c.didFlashBlock?" "+a.swfUnblocked:"")].join(" ")}else{if(x)c.oMC.className=B()+" "+a.swfDefault+" "+(b===null?a.swfTimedout:a.swfError);c.didFlashBlock=!0;u({type:"ontimeout",ignoreInit:!0});c.onerror instanceof Function&&c.onerror.apply(h)}};v=function(){function b(){l.remove(h,"focus",v);l.remove(h,"load",v)}if(na||!D)return b(),!0;na=Ca=!0;L&&D&&l.remove(h,"mousemove",v);U=!1;b();return!0};G=function(b){if(m)return!1;if(p)return m=!0,u(),z(),!0;c.useFlashBlock&&
c.flashLoadTimeout&&!c.getMoviePercent()||(m=!0);if(t||b){if(c.useFlashBlock)c.oMC.className=B()+" "+(c.getMoviePercent()===null?c.swfCSS.swfTimedout:c.swfCSS.swfError);u({type:"ontimeout"});c.onerror instanceof Function&&c.onerror.apply(h);return!1}l.add(h,"unload",$);if(c.waitForWindowLoad&&!qa)return l.add(h,"load",z),!1;else z();return!0};aa=function(b,a,c){typeof r[b]==="undefined"&&(r[b]=[]);r[b].push({method:a,scope:c||null,fired:!1})};u=function(b){b||(b={type:"onready"});if(!m&&b&&!b.ignoreInit)return!1;
var a={success:b&&b.ignoreInit?c.ok():!t},e=b&&b.type?r[b.type]||[]:[],b=[],f,d=x&&c.useFlashBlock&&!c.ok();for(f=0;f<e.length;f++)e[f].fired!==!0&&b.push(e[f]);if(b.length){f=0;for(e=b.length;f<e;f++)if(b[f].scope?b[f].method.apply(b[f].scope,[a]):b[f].method(a),!d)b[f].fired=!0}return!0};z=function(){h.setTimeout(function(){c.useFlashBlock&&ha();u();c.onload instanceof Function&&c.onload.apply(h);c.waitForWindowLoad&&l.add(h,"load",z)},1)};C=function(){if(la!==void 0)return la;var b=!1,a=navigator,
c=a.plugins,f,d=h.ActiveXObject;if(c&&c.length)(a=a.mimeTypes)&&a["application/x-shockwave-flash"]&&a["application/x-shockwave-flash"].enabledPlugin&&a["application/x-shockwave-flash"].enabledPlugin.description&&(b=!0);else if(typeof d!=="undefined"){try{f=new d("ShockwaveFlash.ShockwaveFlash")}catch(g){}b=!!f}return la=b};ya=function(){var b,a;if(n.match(/iphone os (1|2|3_0|3_1)/i)){c.hasHTML5=!1;p=!0;if(c.oMC)c.oMC.style.display="none";return!1}if(c.useHTML5Audio){if(!c.html5||!c.html5.canPlayType)return c.hasHTML5=
!1,!0;else c.hasHTML5=!0;if(ma&&C())return!0}else return!0;for(a in c.audioFormats)c.audioFormats.hasOwnProperty(a)&&c.audioFormats[a].required&&!c.html5.canPlayType(c.audioFormats[a].type)&&(b=!0);c.ignoreFlash&&(b=!1);p=c.useHTML5Audio&&c.hasHTML5&&!b&&!c.requireFlash;return C()&&b};O=function(){var b,a=[];if(m)return!1;if(c.hasHTML5)for(b in c.audioFormats)c.audioFormats.hasOwnProperty(b)&&a.push(b+": "+c.html5[b]);if(p){if(!m)l.remove(h,"load",c.beginDelayedInit),c.enabled=!0,G();return!0}H();
try{c.o._externalInterfaceTest(!1),c.allowPolling&&ta(!0,c.flashPollingInterval?c.flashPollingInterval:c.useFastPolling?10:50),c.debugMode||c.o._disableDebug(),c.enabled=!0}catch(e){return R(!0),G(),!1}G();l.remove(h,"load",c.beginDelayedInit);return!0};sa=function(){if(ja)return!1;Q();H();return ja=!0};A=function(){if(da)return!1;da=!0;pa();if(!c.useHTML5Audio&&!C())c.useHTML5Audio=!0;za();c.html5.usingFlash=ya();x=c.html5.usingFlash;da=!0;g.removeEventListener&&g.removeEventListener("DOMContentLoaded",
A,!1);ba();return!0};wa=function(b){if(!b._hasTimer)b._hasTimer=!0};xa=function(b){if(b._hasTimer)b._hasTimer=!1};fa=function(){if(c.onerror instanceof Function)c.onerror();c.disable()};Aa=function(){if(!ma||!C())return!1;var b=c.audioFormats,a,e;for(e in b)if(b.hasOwnProperty(e)&&(e==="mp3"||e==="mp4"))if(c.html5[e]=!1,b[e]&&b[e].related)for(a=b[e].related.length;a--;)c.html5[b[e].related[a]]=!1};this._setSandboxType=function(){};this._externalInterfaceOK=function(){if(c.swfLoaded)return!1;(new Date).getTime();
c.swfLoaded=!0;D=!1;ma&&Aa();q?setTimeout(O,100):O()};ka=function(){g.readyState==="complete"&&(A(),g.detachEvent("onreadystatechange",ka));return!0};if(!c.hasHTML5||x)l.add(h,"focus",v),l.add(h,"load",v),l.add(h,"load",P),L&&D&&l.add(h,"mousemove",v);g.addEventListener?g.addEventListener("DOMContentLoaded",A,!1):g.attachEvent?g.attachEvent("onreadystatechange",ka):fa();g.readyState==="complete"&&setTimeout(A,100)}var X=null;if(typeof SM2_DEFER==="undefined"||!SM2_DEFER)X=new M;Y.SoundManager=M;Y.soundManager=
X})(window);(function(window,undefined){var document=window.document;(function(){var initializing=false,fnTest=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.JRClass=function(){};JRClass.extend=function(prop){var _super=this.prototype;initializing=true;var prototype=new this;initializing=false;for(var name in prop)prototype[name]=typeof prop[name]=="function"&&typeof _super[name]=="function"&&fnTest.test(prop[name])?function(name,fn){return function(){var tmp=this._super;this._super=_super[name];var ret=
fn.apply(this,arguments);this._super=tmp;return ret}}(name,prop[name]):prop[name];function JRClass(){if(!initializing&&this.init)this.init.apply(this,arguments)}JRClass.prototype=prototype;JRClass.constructor=JRClass;JRClass.extend=arguments.callee;return JRClass}})();var VideoJS=JRClass.extend({init:function(element,setOptions){if(typeof element=="string")this.video=document.getElementById(element);else this.video=element;this.video.player=this;this.values={};this.elements={};this.options={autoplay:false,
preload:true,useBuiltInControls:false,controlsBelow:false,controlsAtStart:false,controlsHiding:true,defaultVolume:0.85,playerFallbackOrder:["html5","flash","links"],flashPlayer:"htmlObject",flashPlayerVersion:false};if(typeof VideoJS.options=="object")_V_.merge(this.options,VideoJS.options);if(typeof setOptions=="object")_V_.merge(this.options,setOptions);if(this.getPreloadAttribute()!==undefined)this.options.preload=this.getPreloadAttribute();if(this.getAutoplayAttribute()!==undefined)this.options.autoplay=
this.getAutoplayAttribute();this.box=this.video.parentNode;this.linksFallback=this.getLinksFallback();this.hideLinksFallback();this.each(this.options.playerFallbackOrder,function(playerType){if(this[playerType+"Supported"]()){this[playerType+"Init"]();return true}});this.activateElement(this,"player");this.activateElement(this.box,"box")},behaviors:{},newBehavior:function(name,activate,functions){this.behaviors[name]=activate;this.extend(functions)},activateElement:function(element,behavior){if(typeof element==
"string")element=document.getElementById(element);this.behaviors[behavior].call(this,element)},errors:[],warnings:[],warning:function(warning){this.warnings.push(warning);this.log(warning)},history:[],log:function(event){if(!event)return;if(typeof event=="string")event={type:event};if(event.type)this.history.push(event.type);if(this.history.length>=50)this.history.shift();try{console.log(event.type)}catch(e){try{opera.postError(event.type)}catch(e){}}},setLocalStorage:function(key,value){if(!localStorage)return;
try{localStorage[key]=value}catch(e){if(e.code==22||e.code==1014)this.warning(VideoJS.warnings.localStorageFull)}},getPreloadAttribute:function(){if(typeof this.video.hasAttribute=="function"&&this.video.hasAttribute("preload")){var preload=this.video.getAttribute("preload");if(preload===""||preload==="true")return"auto";if(preload==="false")return"none";return preload}},getAutoplayAttribute:function(){if(typeof this.video.hasAttribute=="function"&&this.video.hasAttribute("autoplay")){var autoplay=
this.video.getAttribute("autoplay");if(autoplay==="false")return false;return true}},bufferedPercent:function(){return this.duration()?this.buffered()[1]/this.duration():0},each:function(arr,fn){if(!arr||arr.length===0)return;for(var i=0,j=arr.length;i<j;i++)if(fn.call(this,arr[i],i))break},extend:function(obj){for(var attrname in obj)if(obj.hasOwnProperty(attrname))this[attrname]=obj[attrname]}});VideoJS.player=VideoJS.prototype;VideoJS.player.extend({flashSupported:function(){if(!this.flashElement)this.flashElement=
this.getFlashElement();if(this.flashElement&&this.flashPlayerVersionSupported())return true;else return false},flashInit:function(){this.replaceWithFlash();this.element=this.flashElement;this.video.src="";var flashPlayerType=VideoJS.flashPlayers[this.options.flashPlayer];this.extend(VideoJS.flashPlayers[this.options.flashPlayer].api);flashPlayerType.init.context(this)()},getFlashElement:function(){var children=this.video.children;for(var i=0,j=children.length;i<j;i++)if(children[i].className=="vjs-flash-fallback")return children[i]},
replaceWithFlash:function(){if(this.flashElement){this.box.insertBefore(this.flashElement,this.video);this.video.style.display="none"}},flashPlayerVersionSupported:function(){var playerVersion=this.options.flashPlayerVersion?this.options.flashPlayerVersion:VideoJS.flashPlayers[this.options.flashPlayer].flashPlayerVersion;return VideoJS.getFlashVersion()>=playerVersion}});VideoJS.flashPlayers={};VideoJS.flashPlayers.htmlObject={flashPlayerVersion:9,init:function(){return true},api:{width:function(width){if(width!==
undefined){this.element.width=width;this.box.style.width=width+"px";this.triggerResizeListeners();return this}return this.element.width},height:function(height){if(height!==undefined){this.element.height=height;this.box.style.height=height+"px";this.triggerResizeListeners();return this}return this.element.height}}};VideoJS.player.extend({linksSupported:function(){return true},linksInit:function(){this.showLinksFallback();this.element=this.video},getLinksFallback:function(){return this.box.getElementsByTagName("P")[0]},
hideLinksFallback:function(){if(this.linksFallback)this.linksFallback.style.display="none"},showLinksFallback:function(){if(this.linksFallback)this.linksFallback.style.display="block"}});VideoJS.merge=function(obj1,obj2,safe){for(var attrname in obj2)if(obj2.hasOwnProperty(attrname)&&(!safe||!obj1.hasOwnProperty(attrname)))obj1[attrname]=obj2[attrname];return obj1};VideoJS.extend=function(obj){this.merge(this,obj,true)};VideoJS.extend({setupAllWhenReady:function(options){VideoJS.options=options;VideoJS.DOMReady(VideoJS.setup)},
DOMReady:function(fn){VideoJS.addToDOMReady(fn)},setup:function(videos,options){var returnSingular=false,playerList=[],videoElement;if(!videos||videos=="All")videos=VideoJS.getVideoJSTags();else if(typeof videos!="object"||videos.nodeType==1){videos=[videos];returnSingular=true}for(var i=0;i<videos.length;i++){if(typeof videos[i]=="string")videoElement=document.getElementById(videos[i]);else videoElement=videos[i];playerList.push(new VideoJS(videoElement,options))}return returnSingular?playerList[0]:
playerList},getVideoJSTags:function(){var videoTags=document.getElementsByTagName("video"),videoJSTags=[],videoTag;for(var i=0,j=videoTags.length;i<j;i++){videoTag=videoTags[i];if(videoTag.className.indexOf("video-js")!=-1)videoJSTags.push(videoTag)}return videoJSTags},browserSupportsVideo:function(){if(typeof VideoJS.videoSupport!="undefined")return VideoJS.videoSupport;VideoJS.videoSupport=!!document.createElement("video").canPlayType;return VideoJS.videoSupport},getFlashVersion:function(){if(typeof VideoJS.flashVersion!=
"undefined")return VideoJS.flashVersion;var version=0,desc;if(typeof navigator.plugins!="undefined"&&typeof navigator.plugins["Shockwave Flash"]=="object"){desc=navigator.plugins["Shockwave Flash"].description;if(desc&&!(typeof navigator.mimeTypes!="undefined"&&navigator.mimeTypes["application/x-shockwave-flash"]&&!navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin))version=parseInt(desc.match(/^.*\s+([^\s]+)\.[^\s]+\s+[^\s]+$/)[1],10)}else if(typeof window.ActiveXObject!="undefined")try{var testObject=
new ActiveXObject("ShockwaveFlash.ShockwaveFlash");if(testObject)version=parseInt(testObject.GetVariable("$version").match(/^[^\s]+\s(\d+)/)[1],10)}catch(e){}VideoJS.flashVersion=version;return VideoJS.flashVersion},isIE:function(){return!+"\u000b1"},isIPad:function(){return navigator.userAgent.match(/iPad/i)!==null},isIPhone:function(){return navigator.userAgent.match(/iPhone/i)!==null},isIOS:function(){return VideoJS.isIPhone()||VideoJS.isIPad()},iOSVersion:function(){var match=navigator.userAgent.match(/OS (\d+)_/i);
if(match&&match[1])return match[1]},isAndroid:function(){return navigator.userAgent.match(/Android/i)!==null},androidVersion:function(){var match=navigator.userAgent.match(/Android (\d+)\./i);if(match&&match[1])return match[1]},warnings:{videoNotReady:"Video is not ready yet (try playing the video first).",localStorageFull:"Local Storage is Full"}});if(VideoJS.isIE())document.createElement("video");window.VideoJS=window._V_=VideoJS;VideoJS.player.extend({html5Supported:function(){if(VideoJS.browserSupportsVideo()&&
this.canPlaySource())return true;else return false},html5Init:function(){this.element=this.video;this.fixPreloading();this.supportProgressEvents();this.volume(localStorage&&localStorage.volume||this.options.defaultVolume);if(VideoJS.isIOS()){this.options.useBuiltInControls=true;this.iOSInterface()}else if(VideoJS.isAndroid()){this.options.useBuiltInControls=true;this.androidInterface()}if(!this.options.useBuiltInControls){this.video.controls=false;if(this.options.controlsBelow)_V_.addClass(this.box,
"vjs-controls-below");this.activateElement(this.video,"playToggle");this.buildStylesCheckDiv();this.buildAndActivatePoster();this.buildBigPlayButton();this.buildAndActivateSpinner();this.buildAndActivateControlBar();this.loadInterface();this.getSubtitles()}},canPlaySource:function(){if(this.canPlaySourceResult)return this.canPlaySourceResult;var children=this.video.children;for(var i=0,j=children.length;i<j;i++)if(children[i].tagName.toUpperCase()=="SOURCE"){var canPlay=this.video.canPlayType(children[i].type)||
this.canPlayExt(children[i].src);if(canPlay=="probably"||canPlay=="maybe"){this.firstPlayableSource=children[i];this.canPlaySourceResult=true;return true}}this.canPlaySourceResult=false;return false},canPlayExt:function(src){if(!src)return"";var match=src.match(/\.([^\.]+)$/);if(match&&match[1]){var ext=match[1].toLowerCase();if(VideoJS.isAndroid()){if(ext=="mp4"||ext=="m4v")return"maybe"}else if(VideoJS.isIOS())if(ext=="m3u8")return"maybe"}return""},forceTheSource:function(){this.video.src=this.firstPlayableSource.src;
this.video.load()},fixPreloading:function(){if(typeof this.video.hasAttribute=="function"&&this.video.hasAttribute("preload")&&this.video.preload!="none")this.video.autobuffer=true;else{this.video.autobuffer=false;this.video.preload="none"}},supportProgressEvents:function(e){_V_.addListener(this.video,"progress",this.playerOnVideoProgress.context(this))},playerOnVideoProgress:function(event){this.setBufferedFromProgress(event)},setBufferedFromProgress:function(event){if(event.total>0){var newBufferEnd=
event.loaded/event.total*this.duration();if(newBufferEnd>this.values.bufferEnd)this.values.bufferEnd=newBufferEnd}},iOSInterface:function(){if(VideoJS.iOSVersion()<4)this.forceTheSource();if(VideoJS.isIPad())this.buildAndActivateSpinner()},androidInterface:function(){this.forceTheSource();_V_.addListener(this.video,"click",function(){this.play()});this.buildBigPlayButton();_V_.addListener(this.bigPlayButton,"click",function(){this.play()}.context(this));this.positionBox();this.showBigPlayButtons()},
loadInterface:function(){if(!this.stylesHaveLoaded()){if(!this.positionRetries)this.positionRetries=1;if(this.positionRetries++<100){setTimeout(this.loadInterface.context(this),10);return}}this.hideStylesCheckDiv();this.showPoster();if(this.video.paused!==false)this.showBigPlayButtons();if(this.options.controlsAtStart)this.showControlBars();this.positionAll()},buildAndActivateControlBar:function(){this.controls=_V_.createElement("div",{className:"vjs-controls"});this.box.appendChild(this.controls);
this.activateElement(this.controls,"controlBar");this.activateElement(this.controls,"mouseOverVideoReporter");this.playControl=_V_.createElement("div",{className:"vjs-play-control",innerHTML:"<span></span>"});this.controls.appendChild(this.playControl);this.activateElement(this.playControl,"playToggle");this.progressControl=_V_.createElement("div",{className:"vjs-progress-control"});this.controls.appendChild(this.progressControl);this.progressHolder=_V_.createElement("div",{className:"vjs-progress-holder"});
this.progressControl.appendChild(this.progressHolder);this.activateElement(this.progressHolder,"currentTimeScrubber");this.loadProgressBar=_V_.createElement("div",{className:"vjs-load-progress"});this.progressHolder.appendChild(this.loadProgressBar);this.activateElement(this.loadProgressBar,"loadProgressBar");this.playProgressBar=_V_.createElement("div",{className:"vjs-play-progress"});this.progressHolder.appendChild(this.playProgressBar);this.activateElement(this.playProgressBar,"playProgressBar");
this.timeControl=_V_.createElement("div",{className:"vjs-time-control"});this.controls.appendChild(this.timeControl);this.currentTimeDisplay=_V_.createElement("span",{className:"vjs-current-time-display",innerHTML:"00:00"});this.timeControl.appendChild(this.currentTimeDisplay);this.activateElement(this.currentTimeDisplay,"currentTimeDisplay");this.timeSeparator=_V_.createElement("span",{innerHTML:" / "});this.timeControl.appendChild(this.timeSeparator);this.durationDisplay=_V_.createElement("span",
{className:"vjs-duration-display",innerHTML:"00:00"});this.timeControl.appendChild(this.durationDisplay);this.activateElement(this.durationDisplay,"durationDisplay");this.volumeControl=_V_.createElement("div",{className:"vjs-volume-control",innerHTML:"<div><span></span><span></span><span></span><span></span><span></span><span></span></div>"});this.controls.appendChild(this.volumeControl);this.activateElement(this.volumeControl,"volumeScrubber");this.volumeDisplay=this.volumeControl.children[0];this.activateElement(this.volumeDisplay,
"volumeDisplay");this.fullscreenControl=_V_.createElement("div",{className:"vjs-fullscreen-control",innerHTML:"<div><span></span><span></span><span></span><span></span></div>"});this.controls.appendChild(this.fullscreenControl);this.activateElement(this.fullscreenControl,"fullscreenToggle")},buildAndActivatePoster:function(){this.updatePosterSource();if(this.video.poster){this.poster=document.createElement("img");this.box.appendChild(this.poster);this.poster.src=this.video.poster;this.poster.className=
"vjs-poster";this.activateElement(this.poster,"poster")}else this.poster=false},buildBigPlayButton:function(){this.bigPlayButton=_V_.createElement("div",{className:"vjs-big-play-button",innerHTML:"<span></span>"});this.box.appendChild(this.bigPlayButton);this.activateElement(this.bigPlayButton,"bigPlayButton")},buildAndActivateSpinner:function(){this.spinner=_V_.createElement("div",{className:"vjs-spinner",innerHTML:"<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>"});
this.box.appendChild(this.spinner);this.activateElement(this.spinner,"spinner")},buildStylesCheckDiv:function(){this.stylesCheckDiv=_V_.createElement("div",{className:"vjs-styles-check"});this.stylesCheckDiv.style.position="absolute";this.box.appendChild(this.stylesCheckDiv)},hideStylesCheckDiv:function(){this.stylesCheckDiv.style.display="none"},stylesHaveLoaded:function(){if(this.stylesCheckDiv.offsetHeight!=5)return false;else return true},positionAll:function(){this.positionBox();this.positionControlBars();
this.positionPoster()},positionBox:function(){if(this.videoIsFullScreen){this.box.style.width="";this.element.style.height="";if(this.options.controlsBelow){this.box.style.height="";this.element.style.height=this.box.offsetHeight-this.controls.offsetHeight+"px"}}else{this.box.style.width=this.width()+"px";this.element.style.height=this.height()+"px";if(this.options.controlsBelow)this.element.style.height=""}},getSubtitles:function(){var tracks=this.video.getElementsByTagName("TRACK");for(var i=0,
j=tracks.length;i<j;i++)if(tracks[i].getAttribute("kind")=="subtitles"&&tracks[i].getAttribute("src")){this.subtitlesSource=tracks[i].getAttribute("src");this.loadSubtitles();this.buildSubtitles()}},loadSubtitles:function(){_V_.get(this.subtitlesSource,this.parseSubtitles.context(this))},parseSubtitles:function(subText){var lines=subText.split("\n"),line="",subtitle,time,text;this.subtitles=[];this.currentSubtitle=false;this.lastSubtitleIndex=0;for(var i=0;i<lines.length;i++){line=_V_.trim(lines[i]);
if(line){subtitle={id:line,index:this.subtitles.length};line=_V_.trim(lines[++i]);time=line.split(" --\> ");subtitle.start=this.parseSubtitleTime(time[0]);subtitle.end=this.parseSubtitleTime(time[1]);text=[];for(var j=i;j<lines.length;j++){line=_V_.trim(lines[++i]);if(!line)break;text.push(line)}subtitle.text=text.join("<br/>");this.subtitles.push(subtitle)}}},parseSubtitleTime:function(timeText){var parts=timeText.split(":"),time=0;time+=parseFloat(parts[0])*60*60;time+=parseFloat(parts[1])*60;var seconds=
parts[2].split(/\.|,/);time+=parseFloat(seconds[0]);ms=parseFloat(seconds[1]);if(ms)time+=ms/1E3;return time},buildSubtitles:function(){this.subtitlesDisplay=_V_.createElement("div",{className:"vjs-subtitles"});this.box.appendChild(this.subtitlesDisplay);this.activateElement(this.subtitlesDisplay,"subtitlesDisplay")},addVideoListener:function(type,fn){_V_.addListener(this.video,type,fn.rEvtContext(this))},play:function(){this.video.play();return this},onPlay:function(fn){this.addVideoListener("play",
fn);return this},pause:function(){this.video.pause();return this},onPause:function(fn){this.addVideoListener("pause",fn);return this},paused:function(){return this.video.paused},currentTime:function(seconds){if(seconds!==undefined){try{this.video.currentTime=seconds}catch(e){this.warning(VideoJS.warnings.videoNotReady)}this.values.currentTime=seconds;return this}return this.video.currentTime},onCurrentTimeUpdate:function(fn){this.currentTimeListeners.push(fn)},duration:function(){return this.video.duration},
buffered:function(){if(this.values.bufferStart===undefined){this.values.bufferStart=0;this.values.bufferEnd=0}if(this.video.buffered&&this.video.buffered.length>0){var newEnd=this.video.buffered.end(0);if(newEnd>this.values.bufferEnd)this.values.bufferEnd=newEnd}return[this.values.bufferStart,this.values.bufferEnd]},volume:function(percentAsDecimal){if(percentAsDecimal!==undefined){this.values.volume=Math.max(0,Math.min(1,parseFloat(percentAsDecimal)));this.video.volume=this.values.volume;this.setLocalStorage("volume",
this.values.volume);return this}if(this.values.volume)return this.values.volume;return this.video.volume},onVolumeChange:function(fn){_V_.addListener(this.video,"volumechange",fn.rEvtContext(this))},width:function(width){if(width!==undefined){this.video.width=width;this.box.style.width=width+"px";this.triggerResizeListeners();return this}return this.video.offsetWidth},height:function(height){if(height!==undefined){this.video.height=height;this.box.style.height=height+"px";this.triggerResizeListeners();
return this}return this.video.offsetHeight},supportsFullScreen:function(){if(typeof this.video.webkitEnterFullScreen=="function")if(!navigator.userAgent.match("Chrome")&&!navigator.userAgent.match("Mac OS X 10.5"))return true;return false},html5EnterNativeFullScreen:function(){try{this.video.webkitEnterFullScreen()}catch(e){if(e.code==11)this.warning(VideoJS.warnings.videoNotReady)}return this},enterFullScreen:function(){if(this.supportsFullScreen())this.html5EnterNativeFullScreen();else this.enterFullWindow()},
exitFullScreen:function(){if(this.supportsFullScreen());else this.exitFullWindow()},enterFullWindow:function(){this.videoIsFullScreen=true;this.docOrigOverflow=document.documentElement.style.overflow;_V_.addListener(document,"keydown",this.fullscreenOnEscKey.rEvtContext(this));_V_.addListener(window,"resize",this.fullscreenOnWindowResize.rEvtContext(this));document.documentElement.style.overflow="hidden";_V_.addClass(this.box,"vjs-fullscreen");this.positionAll()},exitFullWindow:function(){this.videoIsFullScreen=
false;document.removeEventListener("keydown",this.fullscreenOnEscKey,false);window.removeEventListener("resize",this.fullscreenOnWindowResize,false);document.documentElement.style.overflow=this.docOrigOverflow;_V_.removeClass(this.box,"vjs-fullscreen");this.positionAll()},onError:function(fn){this.addVideoListener("error",fn);return this},onEnded:function(fn){this.addVideoListener("ended",fn);return this}});VideoJS.player.newBehavior("player",function(player){this.onError(this.playerOnVideoError);
this.onPlay(this.playerOnVideoPlay);this.onPlay(this.trackCurrentTime);this.onPause(this.playerOnVideoPause);this.onPause(this.stopTrackingCurrentTime);this.onEnded(this.playerOnVideoEnded);this.trackBuffered();this.onBufferedUpdate(this.isBufferFull)},{playerOnVideoError:function(event){this.log(event);this.log(this.video.error)},playerOnVideoPlay:function(event){this.hasPlayed=true},playerOnVideoPause:function(event){},playerOnVideoEnded:function(event){this.currentTime(0);this.pause()},trackBuffered:function(){this.bufferedInterval=
setInterval(this.triggerBufferedListeners.context(this),500)},stopTrackingBuffered:function(){clearInterval(this.bufferedInterval)},bufferedListeners:[],onBufferedUpdate:function(fn){this.bufferedListeners.push(fn)},triggerBufferedListeners:function(){this.isBufferFull();this.each(this.bufferedListeners,function(listener){listener.context(this)()})},isBufferFull:function(){if(this.bufferedPercent()==1)this.stopTrackingBuffered()},trackCurrentTime:function(){if(this.currentTimeInterval)clearInterval(this.currentTimeInterval);
this.currentTimeInterval=setInterval(this.triggerCurrentTimeListeners.context(this),100);this.trackingCurrentTime=true},stopTrackingCurrentTime:function(){clearInterval(this.currentTimeInterval);this.trackingCurrentTime=false},currentTimeListeners:[],triggerCurrentTimeListeners:function(late,newTime){this.each(this.currentTimeListeners,function(listener){listener.context(this)(newTime||this.currentTime())})},resizeListeners:[],onResize:function(fn){this.resizeListeners.push(fn)},triggerResizeListeners:function(){this.each(this.resizeListeners,
function(listener){listener.context(this)()})}});VideoJS.player.newBehavior("mouseOverVideoReporter",function(element){_V_.addListener(element,"mousemove",this.mouseOverVideoReporterOnMouseMove.context(this));_V_.addListener(element,"mouseout",this.mouseOverVideoReporterOnMouseOut.context(this))},{mouseOverVideoReporterOnMouseMove:function(){this.showControlBars();clearInterval(this.mouseMoveTimeout);this.mouseMoveTimeout=setTimeout(this.hideControlBars.context(this),4E3)},mouseOverVideoReporterOnMouseOut:function(event){var parent=
event.relatedTarget;while(parent&&parent!==this.box)parent=parent.parentNode;if(parent!==this.box)this.hideControlBars()}});VideoJS.player.newBehavior("box",function(element){this.positionBox();_V_.addClass(element,"vjs-paused");this.activateElement(element,"mouseOverVideoReporter");this.onPlay(this.boxOnVideoPlay);this.onPause(this.boxOnVideoPause)},{boxOnVideoPlay:function(){_V_.removeClass(this.box,"vjs-paused");_V_.addClass(this.box,"vjs-playing")},boxOnVideoPause:function(){_V_.removeClass(this.box,
"vjs-playing");_V_.addClass(this.box,"vjs-paused")}});VideoJS.player.newBehavior("poster",function(element){this.activateElement(element,"mouseOverVideoReporter");this.activateElement(element,"playButton");this.onPlay(this.hidePoster);this.onEnded(this.showPoster);this.onResize(this.positionPoster)},{showPoster:function(){if(!this.poster)return;this.poster.style.display="block";this.positionPoster()},positionPoster:function(){if(!this.poster||this.poster.style.display=="none")return;this.poster.style.height=
this.height()+"px";this.poster.style.width=this.width()+"px"},hidePoster:function(){if(!this.poster)return;this.poster.style.display="none"},updatePosterSource:function(){if(!this.video.poster){var images=this.video.getElementsByTagName("img");if(images.length>0)this.video.poster=images[0].src}}});VideoJS.player.newBehavior("controlBar",function(element){if(!this.controlBars){this.controlBars=[];this.onResize(this.positionControlBars)}this.controlBars.push(element);_V_.addListener(element,"mousemove",
this.onControlBarsMouseMove.context(this));_V_.addListener(element,"mouseout",this.onControlBarsMouseOut.context(this))},{showControlBars:function(){if(!this.options.controlsAtStart&&!this.hasPlayed)return;this.each(this.controlBars,function(bar){bar.style.display="block"})},positionControlBars:function(){this.updatePlayProgressBars();this.updateLoadProgressBars()},hideControlBars:function(){if(this.options.controlsHiding&&!this.mouseIsOverControls)this.each(this.controlBars,function(bar){bar.style.display=
"none"})},onControlBarsMouseMove:function(){this.mouseIsOverControls=true},onControlBarsMouseOut:function(event){this.mouseIsOverControls=false}});VideoJS.player.newBehavior("playToggle",function(element){if(!this.elements.playToggles){this.elements.playToggles=[];this.onPlay(this.playTogglesOnPlay);this.onPause(this.playTogglesOnPause)}this.elements.playToggles.push(element);_V_.addListener(element,"click",this.onPlayToggleClick.context(this))},{onPlayToggleClick:function(event){if(this.paused())this.play();
else this.pause()},playTogglesOnPlay:function(event){this.each(this.elements.playToggles,function(toggle){_V_.removeClass(toggle,"vjs-paused");_V_.addClass(toggle,"vjs-playing")})},playTogglesOnPause:function(event){this.each(this.elements.playToggles,function(toggle){_V_.removeClass(toggle,"vjs-playing");_V_.addClass(toggle,"vjs-paused")})}});VideoJS.player.newBehavior("playButton",function(element){_V_.addListener(element,"click",this.onPlayButtonClick.context(this))},{onPlayButtonClick:function(event){this.play()}});
VideoJS.player.newBehavior("pauseButton",function(element){_V_.addListener(element,"click",this.onPauseButtonClick.context(this))},{onPauseButtonClick:function(event){this.pause()}});VideoJS.player.newBehavior("playProgressBar",function(element){if(!this.playProgressBars){this.playProgressBars=[];this.onCurrentTimeUpdate(this.updatePlayProgressBars)}this.playProgressBars.push(element)},{updatePlayProgressBars:function(newTime){var progress=newTime!==undefined?newTime/this.duration():this.currentTime()/
this.duration();if(isNaN(progress))progress=0;this.each(this.playProgressBars,function(bar){if(bar.style)bar.style.width=_V_.round(progress*100,2)+"%"})}});VideoJS.player.newBehavior("loadProgressBar",function(element){if(!this.loadProgressBars)this.loadProgressBars=[];this.loadProgressBars.push(element);this.onBufferedUpdate(this.updateLoadProgressBars)},{updateLoadProgressBars:function(){this.each(this.loadProgressBars,function(bar){if(bar.style)bar.style.width=_V_.round(this.bufferedPercent()*
100,2)+"%"})}});VideoJS.player.newBehavior("currentTimeDisplay",function(element){if(!this.currentTimeDisplays){this.currentTimeDisplays=[];this.onCurrentTimeUpdate(this.updateCurrentTimeDisplays)}this.currentTimeDisplays.push(element)},{updateCurrentTimeDisplays:function(newTime){if(!this.currentTimeDisplays)return;var time=newTime?newTime:this.currentTime();this.each(this.currentTimeDisplays,function(dis){dis.innerHTML=_V_.formatTime(time)})}});VideoJS.player.newBehavior("durationDisplay",function(element){if(!this.durationDisplays){this.durationDisplays=
[];this.onCurrentTimeUpdate(this.updateDurationDisplays)}this.durationDisplays.push(element)},{updateDurationDisplays:function(){if(!this.durationDisplays)return;this.each(this.durationDisplays,function(dis){if(this.duration())dis.innerHTML=_V_.formatTime(this.duration())})}});VideoJS.player.newBehavior("currentTimeScrubber",function(element){_V_.addListener(element,"mousedown",this.onCurrentTimeScrubberMouseDown.rEvtContext(this))},{onCurrentTimeScrubberMouseDown:function(event,scrubber){event.preventDefault();
this.currentScrubber=scrubber;this.stopTrackingCurrentTime();this.videoWasPlaying=!this.paused();this.pause();_V_.blockTextSelection();this.setCurrentTimeWithScrubber(event);_V_.addListener(document,"mousemove",this.onCurrentTimeScrubberMouseMove.rEvtContext(this));_V_.addListener(document,"mouseup",this.onCurrentTimeScrubberMouseUp.rEvtContext(this))},onCurrentTimeScrubberMouseMove:function(event){this.setCurrentTimeWithScrubber(event)},onCurrentTimeScrubberMouseUp:function(event){_V_.unblockTextSelection();
document.removeEventListener("mousemove",this.onCurrentTimeScrubberMouseMove,false);document.removeEventListener("mouseup",this.onCurrentTimeScrubberMouseUp,false);if(this.videoWasPlaying){this.play();this.trackCurrentTime()}},setCurrentTimeWithScrubber:function(event){var newProgress=_V_.getRelativePosition(event.pageX,this.currentScrubber);var newTime=newProgress*this.duration();this.triggerCurrentTimeListeners(0,newTime);if(newTime==this.duration())newTime=newTime-0.1;this.currentTime(newTime)}});
VideoJS.player.newBehavior("volumeDisplay",function(element){if(!this.volumeDisplays){this.volumeDisplays=[];this.onVolumeChange(this.updateVolumeDisplays)}this.volumeDisplays.push(element);this.updateVolumeDisplay(element)},{updateVolumeDisplays:function(){if(!this.volumeDisplays)return;this.each(this.volumeDisplays,function(dis){this.updateVolumeDisplay(dis)})},updateVolumeDisplay:function(display){var volNum=Math.ceil(this.volume()*6);this.each(display.children,function(child,num){if(num<volNum)_V_.addClass(child,
"vjs-volume-level-on");else _V_.removeClass(child,"vjs-volume-level-on")})}});VideoJS.player.newBehavior("volumeScrubber",function(element){_V_.addListener(element,"mousedown",this.onVolumeScrubberMouseDown.rEvtContext(this))},{onVolumeScrubberMouseDown:function(event,scrubber){_V_.blockTextSelection();this.currentScrubber=scrubber;this.setVolumeWithScrubber(event);_V_.addListener(document,"mousemove",this.onVolumeScrubberMouseMove.rEvtContext(this));_V_.addListener(document,"mouseup",this.onVolumeScrubberMouseUp.rEvtContext(this))},
onVolumeScrubberMouseMove:function(event){this.setVolumeWithScrubber(event)},onVolumeScrubberMouseUp:function(event){this.setVolumeWithScrubber(event);_V_.unblockTextSelection();document.removeEventListener("mousemove",this.onVolumeScrubberMouseMove,false);document.removeEventListener("mouseup",this.onVolumeScrubberMouseUp,false)},setVolumeWithScrubber:function(event){var newVol=_V_.getRelativePosition(event.pageX,this.currentScrubber);this.volume(newVol)}});VideoJS.player.newBehavior("fullscreenToggle",
function(element){_V_.addListener(element,"click",this.onFullscreenToggleClick.context(this))},{onFullscreenToggleClick:function(event){if(!this.videoIsFullScreen)this.enterFullScreen();else this.exitFullScreen()},fullscreenOnWindowResize:function(event){this.positionControlBars()},fullscreenOnEscKey:function(event){if(event.keyCode==27)this.exitFullScreen()}});VideoJS.player.newBehavior("bigPlayButton",function(element){if(!this.elements.bigPlayButtons){this.elements.bigPlayButtons=[];this.onPlay(this.bigPlayButtonsOnPlay);
this.onEnded(this.bigPlayButtonsOnEnded)}this.elements.bigPlayButtons.push(element);this.activateElement(element,"playButton")},{bigPlayButtonsOnPlay:function(event){this.hideBigPlayButtons()},bigPlayButtonsOnEnded:function(event){this.showBigPlayButtons()},showBigPlayButtons:function(){this.each(this.elements.bigPlayButtons,function(element){element.style.display="block"})},hideBigPlayButtons:function(){this.each(this.elements.bigPlayButtons,function(element){element.style.display="none"})}});VideoJS.player.newBehavior("spinner",
function(element){if(!this.spinners){this.spinners=[];_V_.addListener(this.video,"loadeddata",this.spinnersOnVideoLoadedData.context(this));_V_.addListener(this.video,"loadstart",this.spinnersOnVideoLoadStart.context(this));_V_.addListener(this.video,"seeking",this.spinnersOnVideoSeeking.context(this));_V_.addListener(this.video,"seeked",this.spinnersOnVideoSeeked.context(this));_V_.addListener(this.video,"canplay",this.spinnersOnVideoCanPlay.context(this));_V_.addListener(this.video,"canplaythrough",
this.spinnersOnVideoCanPlayThrough.context(this));_V_.addListener(this.video,"waiting",this.spinnersOnVideoWaiting.context(this));_V_.addListener(this.video,"stalled",this.spinnersOnVideoStalled.context(this));_V_.addListener(this.video,"suspend",this.spinnersOnVideoSuspend.context(this));_V_.addListener(this.video,"playing",this.spinnersOnVideoPlaying.context(this));_V_.addListener(this.video,"timeupdate",this.spinnersOnVideoTimeUpdate.context(this))}this.spinners.push(element)},{showSpinners:function(){this.each(this.spinners,
function(spinner){spinner.style.display="block"});clearInterval(this.spinnerInterval);this.spinnerInterval=setInterval(this.rotateSpinners.context(this),100)},hideSpinners:function(){this.each(this.spinners,function(spinner){spinner.style.display="none"});clearInterval(this.spinnerInterval)},spinnersRotated:0,rotateSpinners:function(){this.each(this.spinners,function(spinner){spinner.style.WebkitTransform="scale(0.5) rotate("+this.spinnersRotated+"deg)";spinner.style.MozTransform="scale(0.5) rotate("+
this.spinnersRotated+"deg)"});if(this.spinnersRotated==360)this.spinnersRotated=0;this.spinnersRotated+=45},spinnersOnVideoLoadedData:function(event){this.hideSpinners()},spinnersOnVideoLoadStart:function(event){this.showSpinners()},spinnersOnVideoSeeking:function(event){},spinnersOnVideoSeeked:function(event){},spinnersOnVideoCanPlay:function(event){},spinnersOnVideoCanPlayThrough:function(event){this.hideSpinners()},spinnersOnVideoWaiting:function(event){this.showSpinners()},spinnersOnVideoStalled:function(event){},
spinnersOnVideoSuspend:function(event){},spinnersOnVideoPlaying:function(event){this.hideSpinners()},spinnersOnVideoTimeUpdate:function(event){if(this.spinner.style.display=="block")this.hideSpinners()}});VideoJS.player.newBehavior("subtitlesDisplay",function(element){if(!this.subtitleDisplays){this.subtitleDisplays=[];this.onCurrentTimeUpdate(this.subtitleDisplaysOnVideoTimeUpdate);this.onEnded(function(){this.lastSubtitleIndex=0}.context(this))}this.subtitleDisplays.push(element)},{subtitleDisplaysOnVideoTimeUpdate:function(time){if(this.subtitles)if(!this.currentSubtitle||
this.currentSubtitle.start>=time||this.currentSubtitle.end<time){var newSubIndex=false,reverse=this.subtitles[this.lastSubtitleIndex].start>time,i=this.lastSubtitleIndex-reverse?1:0;while(true)if(reverse){if(i<0||this.subtitles[i].end<time)break;if(this.subtitles[i].start<time){newSubIndex=i;break}i--}else{if(i>=this.subtitles.length||this.subtitles[i].start>time)break;if(this.subtitles[i].end>time){newSubIndex=i;break}i++}if(newSubIndex!==false){this.currentSubtitle=this.subtitles[newSubIndex];this.lastSubtitleIndex=
newSubIndex;this.updateSubtitleDisplays(this.currentSubtitle.text)}else if(this.currentSubtitle){this.currentSubtitle=false;this.updateSubtitleDisplays("")}}},updateSubtitleDisplays:function(val){this.each(this.subtitleDisplays,function(disp){disp.innerHTML=val})}});VideoJS.extend({addClass:function(element,classToAdd){if((" "+element.className+" ").indexOf(" "+classToAdd+" ")==-1)element.className=element.className===""?classToAdd:element.className+" "+classToAdd},removeClass:function(element,classToRemove){if(element.className.indexOf(classToRemove)==
-1)return;var classNames=element.className.split(/\s+/);classNames.splice(classNames.lastIndexOf(classToRemove),1);element.className=classNames.join(" ")},createElement:function(tagName,attributes){return this.merge(document.createElement(tagName),attributes)},blockTextSelection:function(){document.body.focus();document.onselectstart=function(){return false}},unblockTextSelection:function(){document.onselectstart=function(){return true}},formatTime:function(secs){var seconds=Math.round(secs);var minutes=
Math.floor(seconds/60);minutes=minutes>=10?minutes:"0"+minutes;seconds=Math.floor(seconds%60);seconds=seconds>=10?seconds:"0"+seconds;return minutes+":"+seconds},getRelativePosition:function(x,relativeElement){return Math.max(0,Math.min(1,(x-this.findPosX(relativeElement))/relativeElement.offsetWidth))},findPosX:function(obj){var curleft=obj.offsetLeft;while(obj=obj.offsetParent)curleft+=obj.offsetLeft;return curleft},getComputedStyleValue:function(element,style){return window.getComputedStyle(element,
null).getPropertyValue(style)},round:function(num,dec){if(!dec)dec=0;return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec)},addListener:function(element,type,handler){if(element.addEventListener)element.addEventListener(type,handler,false);else if(element.attachEvent)element.attachEvent("on"+type,handler)},removeListener:function(element,type,handler){if(element.removeEventListener)element.removeEventListener(type,handler,false);else if(element.attachEvent)element.detachEvent("on"+type,handler)},
get:function(url,onSuccess){if(typeof XMLHttpRequest=="undefined")XMLHttpRequest=function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(f){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(g){}throw new Error("This browser does not support XMLHttpRequest.");};var request=new XMLHttpRequest;request.open("GET",url);request.onreadystatechange=function(){if(request.readyState==4&&request.status==200)onSuccess(request.responseText)}.context(this);
request.send()},trim:function(string){return string.toString().replace(/^\s+/,"").replace(/\s+$/,"")},bindDOMReady:function(){if(document.readyState==="complete")return VideoJS.onDOMReady();if(document.addEventListener){document.addEventListener("DOMContentLoaded",VideoJS.DOMContentLoaded,false);window.addEventListener("load",VideoJS.onDOMReady,false)}else if(document.attachEvent){document.attachEvent("onreadystatechange",VideoJS.DOMContentLoaded);window.attachEvent("onload",VideoJS.onDOMReady)}},
DOMContentLoaded:function(){if(document.addEventListener){document.removeEventListener("DOMContentLoaded",VideoJS.DOMContentLoaded,false);VideoJS.onDOMReady()}else if(document.attachEvent)if(document.readyState==="complete"){document.detachEvent("onreadystatechange",VideoJS.DOMContentLoaded);VideoJS.onDOMReady()}},DOMReadyList:[],addToDOMReady:function(fn){if(VideoJS.DOMIsReady)fn.call(document);else VideoJS.DOMReadyList.push(fn)},DOMIsReady:false,onDOMReady:function(){if(VideoJS.DOMIsReady)return;
if(!document.body)return setTimeout(VideoJS.onDOMReady,13);VideoJS.DOMIsReady=true;if(VideoJS.DOMReadyList){for(var i=0;i<VideoJS.DOMReadyList.length;i++)VideoJS.DOMReadyList[i].call(document);VideoJS.DOMReadyList=null}}});VideoJS.bindDOMReady();Function.prototype.context=function(obj){var method=this,temp=function(){return method.apply(obj,arguments)};return temp};Function.prototype.evtContext=function(obj){var method=this,temp=function(){var origContext=this;return method.call(obj,arguments[0],
origContext)};return temp};Function.prototype.rEvtContext=function(obj,funcParent){if(this.hasContext===true)return this;if(!funcParent)funcParent=obj;for(var attrname in funcParent)if(funcParent[attrname]==this){funcParent[attrname]=this.evtContext(obj);funcParent[attrname].hasContext=true;return funcParent[attrname]}return this.evtContext(obj)};if(window.jQuery)(function($){$.fn.VideoJS=function(options){this.each(function(){VideoJS.setup(this,options)});return this};$.fn.player=function(){return this[0].player}})(jQuery);
window.VideoJS=window._V_=VideoJS})(window);	soundManager.url = 'js/mylibs/soundmanager2.swf';
	soundManager.useFlashBlock = false;
	//soundManager.debugFlash = true;
	soundManager.onready(function() {
	  // SM2 has loaded - now you can create and play sounds!
	  var mySound = soundManager.createSound({
		id: 'aqualo',
		url: 'music/aqualo.mp3'
		// onload: [ event handler function object ],
		// other options here..
	  });
		if ( $.cookie('muteMusic') != 'mute' && $('.video-js').length == 0 ) {
			mySound.play({volume:40,
		  				onfinish: function() {
							this.play();
							}
					});
		}
	});
	
	$(function () {
		if ( $.cookie('muteMusic') == 'mute' ) {
			$('#mute').toggleClass("mutted") ;
		}
	});
	
	soundManager.ontimeout(function() {
	});
	
	$('#mute').click(function() {
		$(this).toggleClass("mutted");
		if($(this).hasClass("mutted")) {
			soundManager.pause('aqualo');
			$.cookie('muteMusic', 'mute');
		} else {
			soundManager.play('aqualo',{volume:40,
				onfinish: function() {
					this.play();
					}
				});
			$.cookie('muteMusic', null);
		}
	
	
	});
	// ColorBox v1.3.17.2 - a full featured, light-weight, customizable lightbox based on jQuery 1.3+
// Copyright (c) 2011 Jack Moore - jack@colorpowered.com
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

(function ($, document, window) {
	var
	// ColorBox Default Settings.	
	// See http://colorpowered.com/colorbox for details.
	defaults = {
		transition: "elastic",
		speed: 300,
		width: false,
		initialWidth: "600",
		innerWidth: false,
		maxWidth: false,
		height: false,
		initialHeight: "450",
		innerHeight: false,
		maxHeight: false,
		scalePhotos: true,
		scrolling: true,
		inline: false,
		html: false,
		iframe: false,
		fastIframe: true,
		photo: false,
		href: false,
		title: false,
		rel: false,
		opacity: 0.9,
		preloading: true,
		current: "image {current} of {total}",
		previous: "previous",
		next: "next",
		close: "close",
		open: false,
		returnFocus: true,
		loop: true,
		slideshow: false,
		slideshowAuto: true,
		slideshowSpeed: 2500,
		slideshowStart: "start slideshow",
		slideshowStop: "stop slideshow",
		onOpen: false,
		onLoad: false,
		onComplete: false,
		onCleanup: false,
		onClosed: false,
		overlayClose: true,		
		escKey: true,
		arrowKey: true,
        top: false,
        bottom: false,
        left: false,
        right: false,
        fixed: false,
        data: false
	},
	
	// Abstracting the HTML and event identifiers for easy rebranding
	colorbox = 'colorbox',
	prefix = 'cbox',
    boxElement = prefix + 'Element',
	
	// Events	
	event_open = prefix + '_open',
	event_load = prefix + '_load',
	event_complete = prefix + '_complete',
	event_cleanup = prefix + '_cleanup',
	event_closed = prefix + '_closed',
	event_purge = prefix + '_purge',
	
	// Special Handling for IE
	isIE = $.browser.msie && !$.support.opacity, // Detects IE6,7,8.  IE9 supports opacity.  Feature detection alone gave a false positive on at least one phone browser and on some development versions of Chrome, hence the user-agent test.
	isIE6 = isIE && $.browser.version < 7,
	event_ie6 = prefix + '_IE6',

	// Cached jQuery Object Variables
	$overlay,
	$box,
	$wrap,
	$content,
	$topBorder,
	$leftBorder,
	$rightBorder,
	$bottomBorder,
	$related,
	$window,
	$loaded,
	$loadingBay,
	$loadingOverlay,
	$title,
	$current,
	$slideshow,
	$next,
	$prev,
	$close,
	$groupControls,

	// Variables for cached values or use across multiple functions
	settings,
	interfaceHeight,
	interfaceWidth,
	loadedHeight,
	loadedWidth,
	element,
	index,
	photo,
	open,
	active,
	closing,
    handler,
    loadingTimer,
    publicMethod;
	
	// ****************
	// HELPER FUNCTIONS
	// ****************

	// jQuery object generator to reduce code size
	function $div(id, cssText, div) { 
		div = document.createElement('div');
		if (id) {
            div.id = prefix + id;
        }
		div.style.cssText = cssText || '';
		return $(div);
	}

	// Convert '%' and 'px' values to integers
	function setSize(size, dimension) {
		return Math.round((/%/.test(size) ? ((dimension === 'x' ? $window.width() : $window.height()) / 100) : 1) * parseInt(size, 10));
	}
	
	// Checks an href to see if it is a photo.
	// There is a force photo option (photo: true) for hrefs that cannot be matched by this regex.
	function isImage(url) {
		return settings.photo || /\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i.test(url);
	}
	
	// Assigns function results to their respective settings.  This allows functions to be used as values.
	function makeSettings(i) {
        settings = $.extend({}, $.data(element, colorbox));
        
		for (i in settings) {
			if ($.isFunction(settings[i]) && i.substring(0, 2) !== 'on') { // checks to make sure the function isn't one of the callbacks, they will be handled at the appropriate time.
			    settings[i] = settings[i].call(element);
			}
		}
        
		settings.rel = settings.rel || element.rel || 'nofollow';
		settings.href = settings.href || $(element).attr('href');
		settings.title = settings.title || element.title;
        
        if (typeof settings.href === "string") {
            settings.href = $.trim(settings.href);
        }
	}

	function trigger(event, callback) {
		if (callback) {
			callback.call(element);
		}
		$.event.trigger(event);
	}

	// Slideshow functionality
	function slideshow() {
		var
		timeOut,
		className = prefix + "Slideshow_",
		click = "click." + prefix,
		start,
		stop,
		clear;
		
		if (settings.slideshow && $related[1]) {
			start = function () {
				$slideshow
					.text(settings.slideshowStop)
					.unbind(click)
					.bind(event_complete, function () {
						if (index < $related.length - 1 || settings.loop) {
							timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
						}
					})
					.bind(event_load, function () {
						clearTimeout(timeOut);
					})
					.one(click + ' ' + event_cleanup, stop);
				$box.removeClass(className + "off").addClass(className + "on");
				timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
			};
			
			stop = function () {
				clearTimeout(timeOut);
				$slideshow
					.text(settings.slideshowStart)
					.unbind([event_complete, event_load, event_cleanup, click].join(' '))
					.one(click, start);
				$box.removeClass(className + "on").addClass(className + "off");
			};
			
			if (settings.slideshowAuto) {
				start();
			} else {
				stop();
			}
		} else {
            $box.removeClass(className + "off " + className + "on");
        }
	}

	function launch(target) {
		if (!closing) {
			
			element = target;
			
			makeSettings();
			
			$related = $(element);
			
			index = 0;
			
			if (settings.rel !== 'nofollow') {
				$related = $('.' + boxElement).filter(function () {
					var relRelated = $.data(this, colorbox).rel || this.rel;
					return (relRelated === settings.rel);
				});
				index = $related.index(element);
				
				// Check direct calls to ColorBox.
				if (index === -1) {
					$related = $related.add(element);
					index = $related.length - 1;
				}
			}
			
			if (!open) {
				open = active = true; // Prevents the page-change action from queuing up if the visitor holds down the left or right keys.
				
				$box.show();
				
				if (settings.returnFocus) {
					try {
						element.blur();
						$(element).one(event_closed, function () {
							try {
								this.focus();
							} catch (e) {
								// do nothing
							}
						});
					} catch (e) {
						// do nothing
					}
				}
				
				// +settings.opacity avoids a problem in IE when using non-zero-prefixed-string-values, like '.5'
				$overlay.css({"opacity": +settings.opacity, "cursor": settings.overlayClose ? "pointer" : "auto"}).show();
				
				// Opens inital empty ColorBox prior to content being loaded.
				settings.w = setSize(settings.initialWidth, 'x');
				settings.h = setSize(settings.initialHeight, 'y');
				publicMethod.position();
				
				if (isIE6) {
					$window.bind('resize.' + event_ie6 + ' scroll.' + event_ie6, function () {
						$overlay.css({width: $window.width(), height: $window.height(), top: $window.scrollTop(), left: $window.scrollLeft()});
					}).trigger('resize.' + event_ie6);
				}
				
				trigger(event_open, settings.onOpen);
				
				$groupControls.add($title).hide();
				
				$close.html(settings.close).show();
			}
			
			publicMethod.load(true);
		}
	}

	// ****************
	// PUBLIC FUNCTIONS
	// Usage format: $.fn.colorbox.close();
	// Usage from within an iframe: parent.$.fn.colorbox.close();
	// ****************
	
	publicMethod = $.fn[colorbox] = $[colorbox] = function (options, callback) {
		var $this = this;
		
        options = options || {};
        
		if (!$this[0]) {
			if ($this.selector) { // if a selector was given and it didn't match any elements, go ahead and exit.
                return $this;
            }
            // if no selector was given (ie. $.colorbox()), create a temporary element to work with
			$this = $('<a/>');
			options.open = true; // assume an immediate open
		}
		
		if (callback) {
			options.onComplete = callback;
		}
		
		$this.each(function () {
			$.data(this, colorbox, $.extend({}, $.data(this, colorbox) || defaults, options));
			$(this).addClass(boxElement);
		});
		
        if (($.isFunction(options.open) && options.open.call($this)) || options.open) {
			launch($this[0]);
		}
        
		return $this;
	};

	// Initialize ColorBox: store common calculations, preload the interface graphics, append the html.
	// This preps ColorBox for a speedy open when clicked, and minimizes the burdon on the browser by only
	// having to run once, instead of each time colorbox is opened.
	publicMethod.init = function () {
		// Create & Append jQuery Objects
		$window = $(window);
		$box = $div().attr({id: colorbox, 'class': isIE ? prefix + (isIE6 ? 'IE6' : 'IE') : ''});
		$overlay = $div("Overlay", isIE6 ? 'position:absolute' : '').hide();
		
		$wrap = $div("Wrapper");
		$content = $div("Content").append(
			$loaded = $div("LoadedContent", 'width:0; height:0; overflow:hidden'),
			$loadingOverlay = $div("LoadingOverlay").add($div("LoadingGraphic")),
			$title = $div("Title"),
			$current = $div("Current"),
			$next = $div("Next"),
			$prev = $div("Previous"),
			$slideshow = $div("Slideshow").bind(event_open, slideshow),
			$close = $div("Close")
		);
		$wrap.append( // The 3x3 Grid that makes up ColorBox
			$div().append(
				$div("TopLeft"),
				$topBorder = $div("TopCenter"),
				$div("TopRight")
			),
			$div(false, 'clear:left').append(
				$leftBorder = $div("MiddleLeft"),
				$content,
				$rightBorder = $div("MiddleRight")
			),
			$div(false, 'clear:left').append(
				$div("BottomLeft"),
				$bottomBorder = $div("BottomCenter"),
				$div("BottomRight")
			)
		).children().children().css({'float': 'left'});
		
		$loadingBay = $div(false, 'position:absolute; width:9999px; visibility:hidden; display:none');
		
		$('body').prepend($overlay, $box.append($wrap, $loadingBay));
		
		$content.children()
		.hover(function () {
			$(this).addClass('hover');
		}, function () {
			$(this).removeClass('hover');
		}).addClass('hover');
		
		// Cache values needed for size calculations
		interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height();//Subtraction needed for IE6
		interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
		loadedHeight = $loaded.outerHeight(true);
		loadedWidth = $loaded.outerWidth(true);
		
		// Setting padding to remove the need to do size conversions during the animation step.
		$box.css({"padding-bottom": interfaceHeight, "padding-right": interfaceWidth}).hide();
		
        // Setup button events.
        // Anonymous functions here keep the public method from being cached, thereby allowing them to be redefined on the fly.
        $next.click(function () {
            publicMethod.next();
        });
        $prev.click(function () {
            publicMethod.prev();
        });
        $close.click(function () {
            publicMethod.close();
        });
		
		$groupControls = $next.add($prev).add($current).add($slideshow);
		
		// Adding the 'hover' class allowed the browser to load the hover-state
		// background graphics in case the images were not part of a sprite.  The class can now can be removed.
		$content.children().removeClass('hover');
		
		$overlay.click(function () {
			if (settings.overlayClose) {
				publicMethod.close();
			}
		});
		
		// Set Navigation Key Bindings
		$(document).bind('keydown.' + prefix, function (e) {
            var key = e.keyCode;
			if (open && settings.escKey && key === 27) {
				e.preventDefault();
				publicMethod.close();
			}
			if (open && settings.arrowKey && $related[1]) {
				if (key === 37) {
					e.preventDefault();
					$prev.click();
				} else if (key === 39) {
					e.preventDefault();
					$next.click();
				}
			}
		});
	};
	
	publicMethod.remove = function () {
		$box.add($overlay).remove();
		$('.' + boxElement).removeData(colorbox).removeClass(boxElement);
	};

	publicMethod.position = function (speed, loadedCallback) {
        var top = 0, left = 0;
        
        $window.unbind('resize.' + prefix);
        
        // remove the modal so that it doesn't influence the document width/height        
        $box.hide();
        
        if (settings.fixed && !isIE6) {
            $box.css({position: 'fixed'});
        } else {
            top = $window.scrollTop();
            left = $window.scrollLeft();
            $box.css({position: 'absolute'});
        }
        
		// keeps the top and left positions within the browser's viewport.
        if (settings.right !== false) {
            left += Math.max($window.width() - settings.w - loadedWidth - interfaceWidth - setSize(settings.right, 'x'), 0);
        } else if (settings.left !== false) {
            left += setSize(settings.left, 'x');
        } else {
            left += Math.round(Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2);
        }
        
        if (settings.bottom !== false) {
            top += Math.max(document.documentElement.clientHeight - settings.h - loadedHeight - interfaceHeight - setSize(settings.bottom, 'y'), 0);
        } else if (settings.top !== false) {
            top += setSize(settings.top, 'y');
        } else {
            top += Math.round(Math.max(document.documentElement.clientHeight - settings.h - loadedHeight - interfaceHeight, 0) / 2);
        }
        
        $box.show();
        
		// setting the speed to 0 to reduce the delay between same-sized content.
		speed = ($box.width() === settings.w + loadedWidth && $box.height() === settings.h + loadedHeight) ? 0 : speed || 0;
        
		// this gives the wrapper plenty of breathing room so it's floated contents can move around smoothly,
		// but it has to be shrank down around the size of div#colorbox when it's done.  If not,
		// it can invoke an obscure IE bug when using iframes.
		$wrap[0].style.width = $wrap[0].style.height = "9999px";
		
		function modalDimensions(that) {
			// loading overlay height has to be explicitly set for IE6.
			$topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = that.style.width;
			$loadingOverlay[0].style.height = $loadingOverlay[1].style.height = $content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = that.style.height;
		}
		
		$box.dequeue().animate({width: settings.w + loadedWidth, height: settings.h + loadedHeight, top: top, left: left}, {
			duration: speed,
			complete: function () {
				modalDimensions(this);
				
				active = false;
				
				// shrink the wrapper down to exactly the size of colorbox to avoid a bug in IE's iframe implementation.
				$wrap[0].style.width = (settings.w + loadedWidth + interfaceWidth) + "px";
				$wrap[0].style.height = (settings.h + loadedHeight + interfaceHeight) + "px";
				
				if (loadedCallback) {
					loadedCallback();
				}
                
                setTimeout(function(){  // small delay before binding onresize due to an IE8 bug.
                    $window.bind('resize.' + prefix, publicMethod.position);
                }, 1);
			},
			step: function () {
				modalDimensions(this);
			}
		});
	};

	publicMethod.resize = function (options) {
		if (open) {
			options = options || {};
			
			if (options.width) {
				settings.w = setSize(options.width, 'x') - loadedWidth - interfaceWidth;
			}
			if (options.innerWidth) {
				settings.w = setSize(options.innerWidth, 'x');
			}
			$loaded.css({width: settings.w});
			
			if (options.height) {
				settings.h = setSize(options.height, 'y') - loadedHeight - interfaceHeight;
			}
			if (options.innerHeight) {
				settings.h = setSize(options.innerHeight, 'y');
			}
			if (!options.innerHeight && !options.height) {				
				var $child = $loaded.wrapInner("<div style='overflow:auto'></div>").children(); // temporary wrapper to get an accurate estimate of just how high the total content should be.
				settings.h = $child.height();
				$child.replaceWith($child.children()); // ditch the temporary wrapper div used in height calculation
			}
			$loaded.css({height: settings.h});
			
			publicMethod.position(settings.transition === "none" ? 0 : settings.speed);
		}
	};

	publicMethod.prep = function (object) {
		if (!open) {
			return;
		}
		
		var callback, speed = settings.transition === "none" ? 0 : settings.speed;
		
		$loaded.remove();
		$loaded = $div('LoadedContent').append(object);
		
		function getWidth() {
			settings.w = settings.w || $loaded.width();
			settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
			return settings.w;
		}
		function getHeight() {
			settings.h = settings.h || $loaded.height();
			settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
			return settings.h;
		}
		
		$loaded.hide()
		.appendTo($loadingBay.show())// content has to be appended to the DOM for accurate size calculations.
		.css({width: getWidth(), overflow: settings.scrolling ? 'auto' : 'hidden'})
		.css({height: getHeight()})// sets the height independently from the width in case the new width influences the value of height.
		.prependTo($content);
		
		$loadingBay.hide();
		
		// floating the IMG removes the bottom line-height and fixed a problem where IE miscalculates the width of the parent element as 100% of the document width.
		//$(photo).css({'float': 'none', marginLeft: 'auto', marginRight: 'auto'});
		
        $(photo).css({'float': 'none'});
        
		// Hides SELECT elements in IE6 because they would otherwise sit on top of the overlay.
		if (isIE6) {
			$('select').not($box.find('select')).filter(function () {
				return this.style.visibility !== 'hidden';
			}).css({'visibility': 'hidden'}).one(event_cleanup, function () {
				this.style.visibility = 'inherit';
			});
		}
		
		callback = function () {
            var prev, prevSrc, next, nextSrc, total = $related.length, iframe, complete;
            
            if (!open) {
                return;
            }
            
            function removeFilter() {
                if (isIE) {
                    $box[0].style.removeAttribute('filter');
                }
            }
            
            complete = function () {
                clearTimeout(loadingTimer);
                $loadingOverlay.hide();
                trigger(event_complete, settings.onComplete);
            };
            
            if (isIE) {
                //This fadeIn helps the bicubic resampling to kick-in.
                if (photo) {
                    $loaded.fadeIn(100);
                }
            }
            
            $title.html(settings.title).add($loaded).show();
            
            if (total > 1) { // handle grouping
                if (typeof settings.current === "string") {
                    $current.html(settings.current.replace('{current}', index + 1).replace('{total}', total)).show();
                }
                
                $next[(settings.loop || index < total - 1) ? "show" : "hide"]().html(settings.next);
                $prev[(settings.loop || index) ? "show" : "hide"]().html(settings.previous);
                
                prev = index ? $related[index - 1] : $related[total - 1];
                next = index < total - 1 ? $related[index + 1] : $related[0];
                
                if (settings.slideshow) {
                    $slideshow.show();
                }
                
                // Preloads images within a rel group
                if (settings.preloading) {
                    nextSrc = $.data(next, colorbox).href || next.href;
                    prevSrc = $.data(prev, colorbox).href || prev.href;
                    
                    nextSrc = $.isFunction(nextSrc) ? nextSrc.call(next) : nextSrc;
                    prevSrc = $.isFunction(prevSrc) ? prevSrc.call(prev) : prevSrc;
                    
                    if (isImage(nextSrc)) {
                        $('<img/>')[0].src = nextSrc;
                    }
                    
                    if (isImage(prevSrc)) {
                        $('<img/>')[0].src = prevSrc;
                    }
                }
            } else {
                $groupControls.hide();
            }
            
            if (settings.iframe) {
                iframe = $('<iframe/>').addClass(prefix + 'Iframe')[0];
                
                if (settings.fastIframe) {
                    complete();
                } else {
                    $(iframe).one('load', complete);
                }
                iframe.name = prefix + (+new Date());
                iframe.src = settings.href;
                
                if (!settings.scrolling) {
                    iframe.scrolling = "no";
                }
                
                if (isIE) {
                    iframe.frameBorder = 0;
                    iframe.allowTransparency = "true";
                }
                
                $(iframe).appendTo($loaded).one(event_purge, function () {
                    iframe.src = "//about:blank";
                });
            } else {
                complete();
            }
            
            if (settings.transition === 'fade') {
                $box.fadeTo(speed, 1, removeFilter);
            } else {
                removeFilter();
            }
		};
		
		if (settings.transition === 'fade') {
			$box.fadeTo(speed, 0, function () {
				publicMethod.position(0, callback);
			});
		} else {
			publicMethod.position(speed, callback);
		}
	};

	publicMethod.load = function (launched) {
		var href, setResize, prep = publicMethod.prep;
		
		active = true;
		
		photo = false;
		
		element = $related[index];
		
		if (!launched) {
			makeSettings();
		}
		
		trigger(event_purge);
		
		trigger(event_load, settings.onLoad);
		
		settings.h = settings.height ?
				setSize(settings.height, 'y') - loadedHeight - interfaceHeight :
				settings.innerHeight && setSize(settings.innerHeight, 'y');
		
		settings.w = settings.width ?
				setSize(settings.width, 'x') - loadedWidth - interfaceWidth :
				settings.innerWidth && setSize(settings.innerWidth, 'x');
		
		// Sets the minimum dimensions for use in image scaling
		settings.mw = settings.w;
		settings.mh = settings.h;
		
		// Re-evaluate the minimum width and height based on maxWidth and maxHeight values.
		// If the width or height exceed the maxWidth or maxHeight, use the maximum values instead.
		if (settings.maxWidth) {
			settings.mw = setSize(settings.maxWidth, 'x') - loadedWidth - interfaceWidth;
			settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
		}
		if (settings.maxHeight) {
			settings.mh = setSize(settings.maxHeight, 'y') - loadedHeight - interfaceHeight;
			settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
		}
		
		href = settings.href;
		
        loadingTimer = setTimeout(function () {
            $loadingOverlay.show();
        }, 100);
        
		if (settings.inline) {
			// Inserts an empty placeholder where inline content is being pulled from.
			// An event is bound to put inline content back when ColorBox closes or loads new content.
			$div().hide().insertBefore($(href)[0]).one(event_purge, function () {
				$(this).replaceWith($loaded.children());
			});
			prep($(href));
		} else if (settings.iframe) {
			// IFrame element won't be added to the DOM until it is ready to be displayed,
			// to avoid problems with DOM-ready JS that might be trying to run in that iframe.
			prep(" ");
		} else if (settings.html) {
			prep(settings.html);
		} else if (isImage(href)) {
			$(photo = new Image())
			.addClass(prefix + 'Photo')
			.error(function () {
				settings.title = false;
				prep($div('Error').text('This image could not be loaded'));
			})
			.load(function () {
				var percent;
				photo.onload = null; //stops animated gifs from firing the onload repeatedly.
				
				if (settings.scalePhotos) {
					setResize = function () {
						photo.height -= photo.height * percent;
						photo.width -= photo.width * percent;	
					};
					if (settings.mw && photo.width > settings.mw) {
						percent = (photo.width - settings.mw) / photo.width;
						setResize();
					}
					if (settings.mh && photo.height > settings.mh) {
						percent = (photo.height - settings.mh) / photo.height;
						setResize();
					}
				}
				
				if (settings.h) {
					photo.style.marginTop = Math.max(settings.h - photo.height, 0) / 2 + 'px';
				}
				
				if ($related[1] && (index < $related.length - 1 || settings.loop)) {
					photo.style.cursor = 'pointer';
					photo.onclick = function () {
                        publicMethod.next();
                    };
				}
				
				if (isIE) {
					photo.style.msInterpolationMode = 'bicubic';
				}
				
				setTimeout(function () { // A pause because Chrome will sometimes report a 0 by 0 size otherwise.
					prep(photo);
				}, 1);
			});
			
			setTimeout(function () { // A pause because Opera 10.6+ will sometimes not run the onload function otherwise.
				photo.src = href;
			}, 1);
		} else if (href) {
			$loadingBay.load(href, settings.data, function (data, status, xhr) {
				prep(status === 'error' ? $div('Error').text('Request unsuccessful: ' + xhr.statusText) : $(this).contents());
			});
		}
	};
        
	// Navigates to the next page/image in a set.
	publicMethod.next = function () {
		if (!active && $related[1] && (index < $related.length - 1 || settings.loop)) {
			index = index < $related.length - 1 ? index + 1 : 0;
			publicMethod.load();
		}
	};
	
	publicMethod.prev = function () {
		if (!active && $related[1] && (index || settings.loop)) {
			index = index ? index - 1 : $related.length - 1;
			publicMethod.load();
		}
	};

	// Note: to use this within an iframe use the following format: parent.$.fn.colorbox.close();
	publicMethod.close = function () {
		if (open && !closing) {
			
			closing = true;
			
			open = false;
			
			trigger(event_cleanup, settings.onCleanup);
			
			$window.unbind('.' + prefix + ' .' + event_ie6);
			
			$overlay.fadeTo(200, 0);
			
			$box.stop().fadeTo(300, 0, function () {
                 
				$box.add($overlay).css({'opacity': 1, cursor: 'auto'}).hide();
				
				trigger(event_purge);
				
				$loaded.remove();
				
				setTimeout(function () {
					closing = false;
					trigger(event_closed, settings.onClosed);
				}, 1);
			});
		}
	};

	// A method for fetching the current element ColorBox is referencing.
	// returns a jQuery object.
	publicMethod.element = function () {
		return $(element);
	};

	publicMethod.settings = defaults;
    
	// Bind the live event before DOM-ready for maximum performance in IE6 & 7.
    handler = function (e) {
        // checks to see if it was a non-left mouse-click and for clicks modified with ctrl, shift, or alt.
        if (!((e.button !== 0 && typeof e.button !== 'undefined') || e.ctrlKey || e.shiftKey || e.altKey)) {
            e.preventDefault();
            launch(this);
        }
    };
    
    if ($.fn.delegate) {
        $(document).delegate('.' + boxElement, 'click', handler);
    } else {
        $('.' + boxElement).live('click', handler);
    }
    
	// Initializes ColorBox when the DOM has loaded
	$(publicMethod.init);

}(jQuery, document, this));window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;console.log(Array.prototype.slice.call(arguments))}};(function(e){function h(){}for(var g="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),f;f=g.pop();){e[f]=e[f]||h}})(window.console=window.console||{});jQuery.cookie=function(c,l,p){if(typeof l!="undefined"||(c&&typeof c!="string")){if(typeof c=="string"){p=p||{};if(l===null){l="";p.expires=-1}var e="";if(p.expires&&(typeof p.expires=="number"||p.expires.toUTCString)){var g;if(typeof p.expires=="number"){g=new Date();g.setTime(g.getTime()+(p.expires*24*60*60*1000))}else{g=p.expires}e="; expires="+g.toUTCString()}var o=p.path?"; path="+(p.path):"";var h=p.domain?"; domain="+(p.domain):"";var a=p.secure?"; secure":"";document.cookie=c+"="+encodeURIComponent(l)+e+o+h+a}else{for(var f in c){jQuery.cookie(f,c[f],l||p)}}}else{var b={};if(document.cookie){var m=document.cookie.split(";");for(var j=0;j<m.length;j++){var d=jQuery.trim(m[j]);if(!c){var k=d.indexOf("=");b[d.substr(0,k)]=decodeURIComponent(d.substr(k+1))}else{if(d.substr(0,c.length+1)==(c+"=")){b=decodeURIComponent(d.substr(c.length+1));break}}}}return b}};