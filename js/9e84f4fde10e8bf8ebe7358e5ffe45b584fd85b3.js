/*
	AnythingSlider v1.5.21

	By Chris Coyier: //css-tricks.com
	with major improvements by Doug Neiner: //pixelgraphics.us/
	based on work by Remy Sharp: //jqueryfordesigners.com/
	and crazy mods by Rob Garrison (aka Mottie): https://github.com/ProLoser/AnythingSlider

	To use the navigationFormatter function, you must have a function that
	accepts two paramaters, and returns a string of HTML text.

	index = integer index (1 based);
	panel = jQuery wrapped LI item this tab references
	@return = Must return a string of HTML/Text

	navigationFormatter: function(index, panel){
		return "Panel #" + index; // This would have each tab with the text 'Panel #X' where X = index
	}
*/

(function($) {

	$.anythingSlider = function(el, options) {

		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this, o;

		// Wraps the ul in the necessary divs and then gives Access to jQuery element
		base.$el = $(el).addClass('anythingBase').wrap('<div class="anythingSlider"><div class="anythingWindow" /></div>');

		// Add a reverse reference to the DOM object
		base.$el.data("AnythingSlider", base);

		base.init = function(){

			// Added "o" to be used in the code instead of "base.options" which doesn't get modifed by the compiler - reduces size by ~1k
			base.options = o = $.extend({}, $.anythingSlider.defaults, options);

			base.initialized = false;
			if ($.isFunction(o.onBeforeInitialize)) { base.$el.bind('before_initialize', o.onBeforeInitialize); }
			base.$el.trigger('before_initialize', base);

			// Cache existing DOM elements for later
			// base.$el = original ul
			// for wrap - get parent() then closest in case the ul has "anythingSlider" class
			base.$wrapper = base.$el.parent().closest('div.anythingSlider').addClass('anythingSlider-' + o.theme);
			base.$window = base.$el.closest('div.anythingWindow');
			base.$controls = $('<div class="anythingControls"></div>').appendTo( (o.appendControlsTo !== null && $(o.appendControlsTo).length) ? $(o.appendControlsTo) : base.$wrapper); // change so this works in jQuery 1.3.2
			base.win = window;
			base.$win = $(base.win);

			base.$nav = $('<ul class="thumbNav" />').appendTo(base.$controls);

			// Set up a few defaults & get details
			base.flag    = false; // event flag to prevent multiple calls (used in control click/focusin)
			base.playing = false; // slideshow state
			base.slideshow = false; // slideshow flag
			base.hovered = false; // actively hovering over the slider
			base.panelSize = [];  // will contain dimensions and left position of each panel
			base.currentPage = o.startPanel = parseInt(o.startPanel,10) || 1; // make sure this isn't a string
			base.adjustLimit = (o.infiniteSlides) ? 0 : 1; // adjust page limits for infinite or limited modes
			base.outerPad = [ base.$wrapper.innerWidth() - base.$wrapper.width(), base.$wrapper.innerHeight() - base.$wrapper.height() ];
			if (o.playRtl) { base.$wrapper.addClass('rtl'); }

			// save some options
			base.original = [ o.autoPlay, o.buildNavigation, o.buildArrows];

			// Expand slider to fit parent
			if (o.expand) {
				base.$outer = base.$wrapper.parent();
				base.$window.css({ width: '100%', height: '100%' }); // needed for Opera
				base.outerDim = [ base.$outer.width(), base.$outer.height() ];
				base.checkResize();
			}

			base.updateSlider();

			base.$lastPage = base.$currentPage;

			// Get index (run time) of this slider on the page
			base.runTimes = $('div.anythingSlider').index(base.$wrapper) + 1;
			base.regex = new RegExp('panel' + base.runTimes + '-(\\d+)', 'i'); // hash tag regex

			// Make sure easing function exists.
			if (!$.isFunction($.easing[o.easing])) { o.easing = "swing"; }

			// If pauseOnHover then add hover effects
			if (o.pauseOnHover) {
				base.$wrapper.hover(function() {
					if (base.playing) {
						base.$el.trigger('slideshow_paused', base);
						base.clearTimer(true);
					}
				}, function() {
					if (base.playing) {
						base.$el.trigger('slideshow_unpaused', base);
						base.startStop(base.playing, true);
					}
				});
			}

			// If a hash can not be used to trigger the plugin, then go to start panel
			var triggers, startPanel = (o.hashTags) ? base.gotoHash() || o.startPanel : o.startPanel;
			base.setCurrentPage(startPanel, false); // added to trigger events for FX code

			// Hide/Show navigation & play/stop controls
			base.slideControls(false);
			base.$wrapper.bind('mouseenter mouseleave', function(e){
				base.hovered = (e.type === "mouseenter") ? true : false;
				base.slideControls( base.hovered, false );
			});

			// Add keyboard navigation
			if (o.enableKeyboard) {
				$(document).keyup(function(e){
					// Stop arrow keys from working when focused on form items
					if (base.$wrapper.is('.activeSlider') && !e.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
						switch (e.which) {
							case 39: // right arrow
								base.goForward();
								break;
							case 37: //left arrow
								base.goBack();
								break;
						}
					}
				});
			}

			// Binds events
			triggers = "slideshow_paused slideshow_unpaused slide_init slide_begin slideshow_stop slideshow_start initialized swf_completed".split(" ");
			$.each("onShowPause onShowUnpause onSlideInit onSlideBegin onShowStop onShowStart onInitialized onSWFComplete".split(" "), function(i,o){
				if ($.isFunction(base.options[o])){
					base.$el.bind(triggers[i], base.options[o]);
				}
			});
			if ($.isFunction(o.onSlideComplete)){
				// Added setTimeout (zero time) to ensure animation is complete... see this bug report: //bugs.jquery.com/ticket/7157
				base.$el.bind('slide_complete', function(){
					setTimeout(function(){ o.onSlideComplete(base); }, 0);
				});
			}
			base.initialized = true;
			base.$el.trigger('initialized', base);

		};

		// called during initialization & to update the slider if a panel is added or deleted
		base.updateSlider = function(){
			// needed for updating the slider
			base.$el.children('.cloned').remove();
			base.$nav.empty();

			base.$items = base.$el.children();
			base.pages = base.$items.length;
			o.showMultiple = parseInt(o.showMultiple,10) || 1; // only integers allowed

			if (o.showMultiple > 1) {
				if (o.showMultiple > base.pages) { o.showMultiple = base.pages; }
				base.adjustMultiple = (o.infiniteSlides && base.pages > 1) ? 0 : parseInt(o.showMultiple, 10) - 1;
				base.pages = base.$items.length - base.adjustMultiple;
			}

			// Remove navigation & player if there is only one page
			if (base.pages <= 1) {
				o.autoPlay = false;
				o.buildNavigation = false;
				o.buildArrows = false;
				base.$controls.hide();
				base.$nav.hide();
				if (base.$forward) { base.$forward.add(base.$back).hide(); }
			} else {
				o.autoPlay = base.original[0];
				o.buildNavigation = base.original[1];
				o.buildArrows = base.original[2];
				base.$controls.show();
				base.$nav.show();
				if (base.$forward) { base.$forward.add(base.$back).show(); }

				// Build navigation tabs
				base.buildNavigation();

				// If autoPlay functionality is included, then initialize the settings
				if (o.autoPlay) {
					base.playing = !o.startStopped; // Sets the playing variable to false if startStopped is true
					base.buildAutoPlay();
				}

				// Build forwards/backwards buttons
				if (o.buildArrows) { base.buildNextBackButtons(); }
			}

			// Top and tail the list with 'visible' number of items, top has the last section, and tail has the first
			// This supports the "infinite" scrolling, also ensures any cloned elements don't duplicate an ID
			if (o.infiniteSlides && base.pages > 1) {
				base.$el.prepend( base.$items.filter(':last').clone().addClass('cloned').removeAttr('id') );
				// Add support for multiple sliders shown at the same time
				if (o.showMultiple > 1) {
					base.$el.append( base.$items.filter(':lt(' + o.showMultiple + ')').clone().addClass('cloned').addClass('multiple').removeAttr('id') );
				} else {
					base.$el.append( base.$items.filter(':first').clone().addClass('cloned').removeAttr('id') );
				}
				base.$el.find('.cloned').each(function(){
					// disable all <a> in cloned panels to prevent shifting the panels by tabbing
					$(this).find('a,input,textarea,select').attr('disabled', 'disabled');
					$(this).find('[id]').removeAttr('id');
				});
			}

			// We just added two items, time to re-cache the list, then get the dimensions of each panel
			base.$items = base.$el.children().addClass('panel');
			base.setDimensions();

			// Set the dimensions of each panel
			if (o.resizeContents) {
				if (o.width) {
					base.$items.css('width', o.width);
					base.$wrapper.css('width', base.getDim(base.currentPage)[0]);
				}
				if (o.height) { base.$wrapper.add(base.$items).css('height', o.height); }
			} else {
				base.$win.load(function(){ base.setDimensions(); }); // set dimensions after all images load
			}

			if (base.currentPage > base.pages) {
				base.currentPage = base.pages;
			}
			base.setCurrentPage(base.currentPage, false);
			base.$nav.find('a').eq(base.currentPage - 1).addClass('cur'); // update current selection

			base.hasEmb = base.$items.find('embed[src*=youtube]').length; // embedded youtube objects exist in the slider
			base.hasSwfo = (typeof(swfobject) !== 'undefined' && swfobject.hasOwnProperty('embedSWF') && $.isFunction(swfobject.embedSWF)) ? true : false; // is swfobject loaded?

			// Initialize YouTube javascript api, if YouTube video is present
			if (base.hasEmb && base.hasSwfo) {
				base.$items.find('embed[src*=youtube]').each(function(i){
					// Older IE doesn't have an object - just make sure we are wrapping the correct element
					var $tar = ($(this).parent()[0].tagName === "OBJECT") ? $(this).parent() : $(this);
					$tar.wrap('<div id="ytvideo' + i + '"></div>');
					// use SWFObject if it exists, it replaces the wrapper with the object/embed
					swfobject.embedSWF($(this).attr('src') + '&enablejsapi=1&version=3&playerapiid=ytvideo' + i, 'ytvideo' + i,
						$tar.attr('width'), $tar.attr('height'), '10', null, null,
						{ allowScriptAccess: "always", wmode : o.addWmodeToObject, allowfullscreen : true },
						{ 'class' : $tar.attr('class'), 'style' : $tar.attr('style') },
						function(){ if (i >= base.hasEmb - 1) { base.$el.trigger('swf_completed', base); } } // swf callback
					);
				});
			}

			// Fix tabbing through the page, but don't include it if multiple slides are showing
			if (o.showMultiple === false) {
				base.$items.find('a').unbind('focus').bind('focus', function(e){
					base.$items.find('.focusedLink').removeClass('focusedLink');
					$(this).addClass('focusedLink');
					var panel = $(this).closest('.panel');
					if (!panel.is('.activePage')) {
						base.gotoPage(base.$items.index(panel));
						e.preventDefault();
					}
				});
			}

		};

		// Creates the numbered navigation links
		base.buildNavigation = function() {
			var tmp, klass, $a;
			if (o.buildNavigation && (base.pages > 1)) {
				base.$items.filter(':not(.cloned)').each(function(i) {
					var index = i + 1;
					klass = ((index === 1) ? 'first' : '') + ((index === base.pages) ? 'last' : '');
					$a = $('<a href="#"></a>').addClass('panel' + index).wrap('<li class="' + klass + '" />');
					base.$nav.append($a.parent()); // use $a.parent() so it will add <li> instead of only the <a> to the <ul>

					// If a formatter function is present, use it
					if ($.isFunction(o.navigationFormatter)) {
						tmp = o.navigationFormatter(index, $(this));
						$a.html('<span>' + tmp + '</span>');
						// Add formatting to title attribute if text is hidden
						if (parseInt($a.find('span').css('text-indent'),10) < 0) { $a.addClass(o.tooltipClass).attr('title', tmp); }
					} else {
						$a.html('<span>' + index + '</span>');
					}

					$a.bind(o.clickControls, function(e) {
						if (!base.flag && o.enableNavigation) {
							// prevent running functions twice (once for click, second time for focusin)
							base.flag = true; setTimeout(function(){ base.flag = false; }, 100);
							base.gotoPage(index);
							if (o.hashTags) { base.setHash(index); }
						}
						e.preventDefault();
					});
				});
			}
		};

		// Creates the Forward/Backward buttons
		base.buildNextBackButtons = function() {
			if (base.$forward) { return; }
			base.$forward = $('<span class="arrow forward"><a href="#"><span>' + o.forwardText + '</span></a></span>');
			base.$back = $('<span class="arrow back"><a href="#"><span>' + o.backText + '</span></a></span>');

			// Bind to the forward and back buttons
			base.$back.bind(o.clickArrows, function(e) {
				base.goBack();
				e.preventDefault();
		//		if (o.hashTags) { base.setHash(base.currentPage - 1); }
			});
			base.$forward.bind(o.clickArrows, function(e) {
				base.goForward();
				e.preventDefault();
			});
			// using tab to get to arrow links will show they have focus (outline is disabled in css)
			base.$back.add(base.$forward).find('a').bind('focusin focusout',function(){
			 $(this).toggleClass('hover');
			});

			// Append elements to page
			base.$wrapper.prepend(base.$forward).prepend(base.$back);
			base.$arrowWidth = base.$forward.width();
		};

		// Creates the Start/Stop button
		base.buildAutoPlay = function(){
			if (base.$startStop || base.pages < 2) { return; }
			base.$startStop = $("<a href='#' class='start-stop'></a>").html('<span>' + (base.playing ? o.stopText : o.startText) + '</span>');
			base.$controls.prepend(base.$startStop);
			base.$startStop
				.bind(o.clickSlideshow, function(e) {
					if (o.enablePlay) {
						base.startStop(!base.playing);
						if (base.playing) {
							if (o.playRtl) {
								base.goBack(true);
							} else {
								base.goForward(true);
							}
						}
					}
					e.preventDefault();
				})
				// show button has focus while tabbing
				.bind('focusin focusout',function(){
					$(this).toggleClass('hover');
				});

			// Use the same setting, but trigger the start;
			base.startStop(base.playing);
		};

		// Adjust slider dimensions on parent element resize
		base.checkResize = function(stopTimer){
			clearTimeout(base.resizeTimer);
			base.resizeTimer = setTimeout(function(){
				var w = base.$outer.width(), h = (base.$outer[0].tagName === "BODY") ? base.$win.height() : base.$outer.height(), dim = base.outerDim;
				if (dim[0] !== w || dim[1] !== h) {
					base.outerDim = [ w, h ];
					base.setDimensions(); // adjust panel sizes
					// make sure page is lined up (use 1 millisecond animation time, because "0||x" ignores zeros)
					base.gotoPage(base.currentPage, base.playing, null, 1);
				}
				if (typeof(stopTimer) === 'undefined'){ base.checkResize(); }
			}, 500);
		};

		// Set panel dimensions to either resize content or adjust panel to content
		base.setDimensions = function(){
			var w, h, c, cw, dw, leftEdge = 0,
				// showMultiple must have o.width set!!
				bww = (o.showMultiple > 1) ? o.width || base.$window.width()/o.showMultiple : base.$window.width(),
				winw = base.$win.width();
			if (o.expand){
				w = base.$outer.width() - base.outerPad[0];
				h = base.$outer.height() - base.outerPad[1];
				base.$wrapper.add(base.$window).add(base.$items).css({ width: w, height: h });
				bww = (o.showMultiple > 1) ? w/o.showMultiple : w;
			}
			base.$items.each(function(i){
				c = $(this).children('*');
				if (o.resizeContents){
					// get viewport width & height from options (if set), or css
					w = parseInt(o.width,10) || bww;
					h = parseInt(o.height,10) || base.$window.height();
					// resize panel
					$(this).css({ width: w, height: h });
					// resize panel contents, if solitary (wrapped content or solitary image)
					if (c.length === 1){
						c.css({ width: '100%', height: '100%' });
						if (c[0].tagName === "OBJECT") { c.find('embed').andSelf().attr({ width: '100%', height: '100%' }); }
					}
				} else {
					// get panel width & height and save it
					w = $(this).width(); // if not defined, it will return the width of the ul parent
					dw = (w >= winw) ? true : false; // width defined from css?
					if (c.length === 1 && dw){
						cw = (c.width() >= winw) ? bww : c.width(); // get width of solitary child
						$(this).css('width', cw); // set width of panel
						c.css('max-width', cw);   // set max width for all children
						w = cw;
					}
					w = (dw) ? o.width || bww : w;
					$(this).css('width', w);
					h = $(this).outerHeight(); // get height after setting width
					$(this).css('height', h);
				}
				base.panelSize[i] = [w,h,leftEdge];
				leftEdge += w;
			});
			// Set total width of slider, but don't go beyond the set max overall width (limited by Opera)
			base.$el.css('width', (leftEdge < o.maxOverallWidth) ? leftEdge : o.maxOverallWidth);
		};

		// get dimension of multiple panels, as needed
		base.getDim = function(page){
			page = (o.infiniteSlides && base.pages > 1) ? page : page - 1;
			var i,
				w = base.panelSize[page][0],
				h = base.panelSize[page][1];
			if (o.showMultiple > 1) {
				for (i=1; i < o.showMultiple; i++) {
					w += base.panelSize[(page + i)%o.showMultiple][0];
					h = Math.max(h, base.panelSize[page + i][1]);
				}
			}
			return [w,h];
		};

		base.gotoPage = function(page, autoplay, callback, time) {
			if (base.pages <= 1) { return; } // prevents animation
			base.$lastPage = base.$currentPage;
			if (typeof(page) !== "number") {
				page = o.startPanel;
				base.setCurrentPage(page);
			}

			// pause YouTube videos before scrolling or prevent change if playing
			if (base.hasEmb && base.checkVideo(base.playing)) { return; }

			if (page > base.pages + 1 - base.adjustLimit) { page = (!o.infiniteSlides && !o.stopAtEnd) ? 1 : base.pages; }
			if (page < base.adjustLimit ) { page = (!o.infiniteSlides && !o.stopAtEnd) ? base.pages : 1; }
			base.currentPage = ( page > base.pages ) ? base.pages : ( page < 1 ) ? 1 : base.currentPage;
			base.$currentPage = base.$items.eq(base.currentPage - base.adjustLimit);
			base.exactPage = page;
			base.$targetPage = base.$items.eq( (page === 0) ? base.pages - base.adjustLimit : (page > base.pages) ? 1 - base.adjustLimit : page - base.adjustLimit );
			base.$el.trigger('slide_init', base);

			base.slideControls(true, false);

			// When autoplay isn't passed, we stop the timer
			if (autoplay !== true) { autoplay = false; }
			// Stop the slider when we reach the last page, if the option stopAtEnd is set to true
			if (!autoplay || (o.stopAtEnd && page === base.pages)) { base.startStop(false); }

			base.$el.trigger('slide_begin', base);

			// resize slider if content size varies
			if (!o.resizeContents) {
				// animating the wrapper resize before the window prevents flickering in Firefox
				var d = base.getDim(page);
				base.$wrapper.filter(':not(:animated)').animate(
					{ width: d[0], height: d[1] },
					{ queue: false, duration: time || o.animationTime, easing: o.easing }
				);
			}

			// Animate Slider
			base.$el.filter(':not(:animated)').animate(
				{ left : -base.panelSize[(o.infiniteSlides && base.pages > 1) ? page : page - 1][2] },
				{ queue: false, duration: time || o.animationTime, easing: o.easing, complete: function(){ base.endAnimation(page, callback); } }
			);
		};

		base.endAnimation = function(page, callback){
			if (page === 0) {
				base.$el.css('left', -base.panelSize[base.pages][2]);
				page = base.pages;
			} else if (page > base.pages) {
				// reset back to start position
				base.$el.css('left', -base.panelSize[1][2]);
				page = 1;
			}
			base.exactPage = page;
			base.setCurrentPage(page, false);
			// Add active panel class
			base.$items.removeClass('activePage').eq(page - base.adjustLimit).addClass('activePage');

			if (!base.hovered) { base.slideControls(false); }

			// continue YouTube video if in current panel
			if (base.hasEmb){
				var emb = base.$currentPage.find('object[id*=ytvideo], embed[id*=ytvideo]');
				// player states: unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5).
				if (emb.length && $.isFunction(emb[0].getPlayerState) && emb[0].getPlayerState() > 0 && emb[0].getPlayerState() !== 5) {
					emb[0].playVideo();
				}
			}

			base.$el.trigger('slide_complete', base);
			// callback from external slide control: $('#slider').anythingSlider(4, function(slider){ })
			if (typeof callback === 'function') { callback(base); }
			// Continue slideshow after a delay
			if (o.autoPlayLocked && !base.playing) {
				setTimeout(function(){
					base.startStop(true);
				// subtract out slide delay as the slideshow waits that additional time.
				}, o.resumeDelay - o.delay);
			}
		};

		base.setCurrentPage = function(page, move) {
			page = parseInt(page, 10);
			if (page > base.pages + 1 - base.adjustLimit) { page = base.pages - base.adjustLimit; }
			if (page < base.adjustLimit ) { page = 1; }

			// Set visual
			if (o.buildNavigation){
				base.$nav.find('.cur').removeClass('cur');
				base.$nav.find('a').eq(page - 1).addClass('cur');
			}

			// hide/show arrows based on infinite scroll mode
			if (!o.infiniteSlides && o.stopAtEnd){
				base.$wrapper.find('span.forward')[ page === base.pages ? 'addClass' : 'removeClass']('disabled');
				base.$wrapper.find('span.back')[ page === 1 ? 'addClass' : 'removeClass']('disabled');
				if (page === base.pages && base.playing) { base.startStop(); }
			}

			// Only change left if move does not equal false
			if (!move) {
				var d = base.getDim(page);
				base.$wrapper.css({ width: d[0], height: d[1] });
				base.$wrapper.scrollLeft(0); // reset in case tabbing changed this scrollLeft
				base.$el.css('left', -base.panelSize[(o.infiniteSlides && base.pages > 1) ? page : page - 1][2] );
			}
			// Update local variable
			base.currentPage = page;
			base.$currentPage = base.$items.eq(page - base.adjustLimit).addClass('activePage');

			// Set current slider as active so keyboard navigation works properly
			if (!base.$wrapper.is('.activeSlider')){
				$('.activeSlider').removeClass('activeSlider');
				base.$wrapper.addClass('activeSlider');
			}
		};

		base.goForward = function(autoplay) {
			if (autoplay !== true) { autoplay = false; base.startStop(false); }
			base.gotoPage(base.currentPage + 1, autoplay);
		};

		base.goBack = function(autoplay) {
			if (autoplay !== true) { autoplay = false; base.startStop(false); }
			base.gotoPage(base.currentPage - 1, autoplay);
		};

		// This method tries to find a hash that matches panel-X
		// If found, it tries to find a matching item
		// If that is found as well, then that item starts visible
		base.gotoHash = function(){
			var n = base.win.location.hash.match(base.regex);
			return (n===null) ? '' : parseInt(n[1],10);
		};

		base.setHash = function(n){
			var s = 'panel' + base.runTimes + '-',
				h = base.win.location.hash;
			if ( typeof h !== 'undefined' ) {
				base.win.location.hash = (h.indexOf(s) > 0) ? h.replace(base.regex, s + n) : h + "&" + s + n;
			}
		};

		// Slide controls (nav and play/stop button up or down)
		base.slideControls = function(toggle){
			var dir = (toggle) ? 'slideDown' : 'slideUp',
				t1 = (toggle) ? 0 : o.animationTime,
				t2 = (toggle) ? o.animationTime: 0,
				op = (toggle) ? 1: 0,
				sign = (toggle) ? 0 : 1; // 0 = visible, 1 = hidden
			if (o.toggleControls) {
				base.$controls.stop(true,true).delay(t1)[dir](o.animationTime/2).delay(t2);
			}
			if (o.buildArrows && o.toggleArrows) {
				if (!base.hovered && base.playing) { sign = 1; op = 0; } // don't animate arrows during slideshow
				base.$forward.stop(true,true).delay(t1).animate({ right: sign * base.$arrowWidth, opacity: op }, o.animationTime/2);
				base.$back.stop(true,true).delay(t1).animate({ left: sign * base.$arrowWidth, opacity: op }, o.animationTime/2);
			}
		};

		base.clearTimer = function(paused){
			// Clear the timer only if it is set
			if (base.timer) {
				base.win.clearInterval(base.timer);
				if (!paused && base.slideshow) {
					base.$el.trigger('slideshow_stop', base);
					base.slideshow = false;
				}
			}
		};

		// Handles stopping and playing the slideshow
		// Pass startStop(false) to stop and startStop(true) to play
		base.startStop = function(playing, paused) {
			if (playing !== true) { playing = false; } // Default if not supplied is false

			if (playing && !paused) {
				base.$el.trigger('slideshow_start', base);
				base.slideshow = true;
			}

			// Update variable
			base.playing = playing;

			// Toggle playing and text
			if (o.autoPlay) {
				base.$startStop.toggleClass('playing', playing).html('<span>' + (playing ? o.stopText : o.startText) + '</span>');
				// add button text to title attribute if it is hidden by text-indent
				if (parseInt(base.$startStop.find('span').css('text-indent'),10) < 0) {
					base.$startStop.addClass(o.tooltipClass).attr('title', playing ? 'Stop' : 'Start');
				}
			}

			if (playing){
				base.clearTimer(true); // Just in case this was triggered twice in a row
				base.timer = base.win.setInterval(function() {
					// prevent autoplay if video is playing
					if (!(base.hasEmb && base.checkVideo(playing))) {
						if (o.playRtl) {
							base.goBack(true);
						} else {
							base.goForward(true);
						}
					}
				}, o.delay);
			} else {
				base.clearTimer();
			}
		};

		base.checkVideo = function(playing){
			// pause YouTube videos before scrolling?
			var emb, ps, stopAdvance = false;
			base.$items.find('object[id*=ytvideo], embed[id*=ytvideo]').each(function(){ // include embed for IE; if not using SWFObject, old detach/append code needs "object embed" here
				emb = $(this);
				if (emb.length && $.isFunction(emb[0].getPlayerState)) {
					// player states: unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5).
					ps = emb[0].getPlayerState();
					// if autoplay, video playing, video is in current panel and resume option are true, then don't advance
					if (playing && (ps === 1 || ps > 2) && base.$items.index(emb.closest('.panel')) === base.currentPage && o.resumeOnVideoEnd) {
						stopAdvance = true;
					} else {
						// pause video if not autoplaying (if already initialized)
						if (ps > 0) { emb[0].pauseVideo(); }
					}
				}
			});
			return stopAdvance;
		};

		// Trigger the initialization
		base.init();
	};

	$.anythingSlider.defaults = {
		// Appearance
		width               : null,      // Override the default CSS width
		height              : null,      // Override the default CSS height
		expand              : false,     // If true, the entire slider will expand to fit the parent element
		resizeContents      : true,      // If true, solitary images/objects in the panel will expand to fit the viewport
		showMultiple        : false,     // Set this value to a number and it will show that many slides at once
		tooltipClass        : 'tooltip', // Class added to navigation & start/stop button (text copied to title if it is hidden by a negative text indent)
		theme               : 'default', // Theme name

		// Navigation
		startPanel          : 1,         // This sets the initial panel
		hashTags            : true,      // Should links change the hashtag in the URL?
		infiniteSlides      : true,      // if false, the slider will not wrap
		enableKeyboard      : true,      // if false, keyboard arrow keys will not work for the current panel.
		buildArrows         : true,      // If true, builds the forwards and backwards buttons
		toggleArrows        : false,     // If true, side navigation arrows will slide out on hovering & hide @ other times
		buildNavigation     : true,      // If true, builds a list of anchor links to link to each panel
		enableNavigation    : true,      // if false, navigation links will still be visible, but not clickable.
		toggleControls      : false,     // if true, slide in controls (navigation + play/stop button) on hover and slide change, hide @ other times
		appendControlsTo    : null,      // A HTML element (jQuery Object, selector or HTMLNode) to which the controls will be appended if not null
		navigationFormatter : null,      // Details at the top of the file on this use (advanced use)
		forwardText         : "&raquo;", // Link text used to move the slider forward (hidden by CSS, replaced with arrow image)
		backText            : "&laquo;", // Link text used to move the slider back (hidden by CSS, replace with arrow image)

		// Slideshow options
		enablePlay          : true,      // if false, the play/stop button will still be visible, but not clickable.
		autoPlay            : true,      // This turns off the entire slideshow FUNCTIONALY, not just if it starts running or not
		autoPlayLocked      : false,     // If true, user changing slides will not stop the slideshow
		startStopped        : false,     // If autoPlay is on, this can force it to start stopped
		pauseOnHover        : true,      // If true & the slideshow is active, the slideshow will pause on hover
		resumeOnVideoEnd    : true,      // If true & the slideshow is active & a youtube video is playing, it will pause the autoplay until the video is complete
		stopAtEnd           : false,     // If true & the slideshow is active, the slideshow will stop on the last page. This also stops the rewind effect when infiniteSlides is false.
		playRtl             : false,     // If true, the slideshow will move right-to-left
		startText           : "Start",   // Start button text
		stopText            : "Stop",    // Stop button text
		delay               : 3000,      // How long between slideshow transitions in AutoPlay mode (in milliseconds)
		resumeDelay         : 15000,     // Resume slideshow after user interaction, only if autoplayLocked is true (in milliseconds).
		animationTime       : 600,       // How long the slideshow transition takes (in milliseconds)
		easing              : "swing",   // Anything other than "linear" or "swing" requires the easing plugin

		// Callbacks - removed from options to reduce size - they still work

		// Interactivity
		clickArrows         : "click",         // Event used to activate arrow functionality (e.g. "click" or "mouseenter")
		clickControls       : "click focusin", // Events used to activate navigation control functionality
		clickSlideshow      : "click",         // Event used to activate slideshow play/stop button

		// Misc options
		addWmodeToObject    : "opaque", // If your slider has an embedded object, the script will automatically add a wmode parameter with this setting
		maxOverallWidth     : 32766     // Max width (in pixels) of combined sliders (side-to-side); set to 32766 to prevent problems with Opera
	};

	$.fn.anythingSlider = function(options, callback) {

		return this.each(function(){
			var page, anySlide = $(this).data('AnythingSlider');

			// initialize the slider but prevent multiple initializations
			if ((typeof(options)).match('object|undefined')){
				if (!anySlide) {
					(new $.anythingSlider(this, options));
				} else {
					anySlide.updateSlider();
				}
			// If options is a number, process as an external link to page #: $(element).anythingSlider(#)
			} else if (/\d/.test(options) && !isNaN(options) && anySlide) {
				page = (typeof(options) === "number") ? options : parseInt($.trim(options),10); // accepts "  2  "
				// ignore out of bound pages
				if ( page >= 1 && page <= anySlide.pages ) {
					anySlide.gotoPage(page, false, callback); // page #, autoplay, one time callback
				}
			}
		});
	};

})(jQuery);

/* AnythingSlider works with works with jQuery 1.4+, but you can uncomment the code below to make it
   work with jQuery 1.3.2. You'll have to manually add the code below to the minified copy if needed */
/*
 // Copied from jQuery 1.4.4 to make AnythingSlider backwards compatible to jQuery 1.3.2
 if (typeof jQuery.fn.delay === 'undefined') {
  jQuery.fn.extend({
   delay: function( time, type ) {
    time = jQuery.fx ? jQuery.fx.speeds[time] || time : time; type = type || "fx";
    return this.queue( type, function() { var elem = this; setTimeout(function() { jQuery.dequeue( elem, type ); }, time ); });
   }
  });
 }
*//*
 * AnythingSlider Slide FX 1.3 for AnythingSlider v1.5.8+
 * By Rob Garrison (aka Mottie & Fudgey)
 * Dual licensed under the MIT and GPL licenses.
 */
(function($) {
	$.fn.anythingSliderFx = function(options){

		// variable sizes shouldn't matter - it's just to get an idea to get the elements out of view
		var wrap = $(this).closest('.anythingSlider'),
		sliderWidth = wrap.width(),
		sliderHeight = wrap.height(),
		getBaseFx = function(size){
			return {
				// 'name' : [{ inFx: {effects}, { outFx: {effects} }, selector: []]
				'top'    : [{ inFx: { top: 0 }, outFx: { top: '-' + (size || sliderHeight) } }],
				'bottom' : [{ inFx: { bottom: 0 }, outFx: { bottom: (size || sliderHeight) } }],
				'left'   : [{ inFx: { left: 0 }, outFx: { left: '-' + (size || sliderWidth) } }],
				'right'  : [{ inFx: { right: 0 }, outFx: { right: (size || sliderWidth) } }],
				'fade'   : [{ inFx: { opacity: 1 }, outFx: { opacity: 0 } }],
				'expand' : [{ inFx: { width: '100%', top: '0%', left: '0%' } , outFx: { width: (size || '10%'), top: '50%', left: '50%' } }],
				'listLR' : [{ inFx: { left: 0, opacity: 1 }, outFx: [{ left: (size || sliderWidth), opacity: 0 }, { left: '-' + (size || sliderWidth), opacity: 0 }], selector: [':odd', ':even'] }],
				'listRL' : [{ inFx: { left: 0, opacity: 1 }, outFx: [{ left: (size || sliderWidth), opacity: 0 }, { left: '-' + (size || sliderWidth), opacity: 0 }], selector: [':even', ':odd'] }],

				'caption-Top'    : [{ inFx: { top: 0, opacity: 0.8 }, outFx: { top: ( '-' + size || -50 ), opacity: 0 } }],
				'caption-Right'  : [{ inFx: { right: 0, opacity: 0.8 }, outFx: { right: ( '-' + size || -150 ), opacity: 0 } }],
				'caption-Bottom' : [{ inFx: { bottom: 0, opacity: 0.8 }, outFx: { bottom: ( '-' + size || -50 ), opacity: 0 } }],
				'caption-Left'   : [{ inFx: { left: 0, opacity: 0.8 }, outFx: { left: ( '-' + size || -150 ), opacity: 0 } }]
			};
		};

		return this.each(function(){

			var baseFx = getBaseFx(), // get base FX with standard sizes
			defaults = {
				easing  : 'swing',
				timeIn  : 400,
				timeOut : 350
			},

			// hide caption using setTimeout to ensure slider_complete has fired and activePage class has been added.
			// this hides element if out of the viewport (prevents captions - right & left only - from overlapping current window)
			hideOffscreen = function(el){
				el.each(function(){
					if (!$(this).closest('.panel').is('.activePage')) { $(this).css('visibility','hidden'); }
				});
			},

			// Animate FX
			animateFx = function(el, opt, isOut){
				if (el.length === 0 || typeof opt === 'undefined') { return; } // no fx
				var o = opt[0] || opt,
					s = o[1] || '',
					// time needs to be a number, not a string
					t = parseInt( ((s === '') ? o.duration : o[0].duration), 10);
				if (isOut) {
					// don't change caption position from absolute
					if (el.css('position') !== 'absolute') { el.css({ position : 'relative' }); }
					el.stop();
					// multiple selectors for out animation
					if (s !== ''){
						el.filter(opt[1][0]).animate(o[0], { queue : false, duration : t, easing : o[0].easing });
						el.filter(opt[1][1]).animate(s, { queue : false, duration : t, easing : o[0].easing, complete: function(){
							setTimeout(function(){ hideOffscreen(el); }, defaults.timeOut);
						} });
						return;
					}
				}
				// animation for no extra selectors
				if (!isOut) { el.css('visibility','visible').show(); }
				el.animate(o, { queue : false, duration : t, easing : o.easing, complete: function(){
					if (isOut) { setTimeout(function(){ hideOffscreen(el); }, defaults.timeOut); }
				} });
			},

			// Extract FX from options
			getFx = function(opts, isOut){
				// example: '.textSlide h3' : [ 'top fade', '200px' '500', 'easeOutBounce' ],
				var tmp, bfx2,
				ex  = (isOut) ? 'outFx' : 'inFx', // object key
				bfx = {}, // base effects
				time = (isOut) ? defaults.timeOut : defaults.timeIn, // default duration settings
				// split & process multiple built-in effects (e.g. 'top fade')
				fx = $.trim(opts[0].replace(/\s+/g,' ')).split(' ');

				// look for multiple selectors in the Out effects
				if (isOut && fx.length === 1 && baseFx.hasOwnProperty(fx) && typeof (baseFx[fx][0].selector) !== 'undefined') {
					bfx2 = baseFx[fx][0].outFx;
					// add time and easing to first set, the animation will use it for both
					bfx2[0].duration = opts[2] || defaults.timeOut;
					bfx2[0].easing = opts[3] || defaults.easing;
					return [bfx2, baseFx[fx][0].selector || [] ];
				}

				// combine base effects
				$.each(fx, function(i,f){
					// check if built-in effect exists
					if (baseFx.hasOwnProperty(f)) {
						var t = typeof opts[1] === 'undefined',
							n = (f === 'fade') ? 1 : 2; // if 2nd param defined, but it's not a size ('200px'), then use it as time (for fade FX)
						// if size option is defined, get new base fx
						tmp = (t) ? baseFx : getBaseFx(opts[1]);
						$.extend(true, bfx, tmp[f][0][ex]);
						bfx.duration = opts[n] || bfx.duration || time; // user set time || built-in time || default time set above
						bfx.easing = opts[n+1] || defaults.easing;
					}
				});
				return [bfx];
			};

			$(this)

			// bind events for "OUT" effects - occur when leaving a page
			.bind('slide_init', function(e, slider){
				var el, elOut, page = slider.$lastPage.add( slider.$items.eq(slider.exactPage) );
				if (slider.exactPage === 0) { page = page.add( slider.$items.eq( slider.pages ) ); } // add last (non-cloned) page if on first
				page = page.find('*').andSelf(); // include the panel in the selectors
				for (el in options) {
					if (el === 'outFx') {
						// process "out" custom effects
						for (elOut in options.outFx) {
							// animate current/last slide, unless it's a clone, then effect the original
							if (page.filter(elOut).length) { animateFx( page.filter(elOut), options.outFx[elOut], true); }
						}
					} else if (el !== 'inFx') {
						// Use built-in effects
						if ($.isArray(options[el]) && page.filter(el).length) {
							animateFx( page.filter(el), getFx(options[el],true), true);
						}
					}
				}
			})

			// bind events for "IN" effects - occurs on target page
			.bind('slide_complete', function(e, slider){
				var el, elIn, page = slider.$currentPage.add( slider.$items.eq(slider.exactPage) );
				page = page.find('*').andSelf(); // include the panel in the selectors
				for (el in options) {
					if (el === 'inFx') {
						// process "in" custom effects
						for (elIn in options.inFx) {
							// animate current page
							if (page.filter(elIn).length) { animateFx( page.filter(elIn), options.inFx[elIn], false); }
						}
						// Use built-in effects
					} else if (el !== 'outFx' && $.isArray(options[el]) && page.filter(el).length) {
						animateFx( page.filter(el), getFx(options[el],false), false);
					}
				}
			});

		});
	};
})(jQuery);
/*
 * jQuery EasIng v1.1.2 - //gsgd.co.uk/sandbox/jquery.easIng.php
 *
 * Uses the built In easIng capabilities added In jQuery 1.1
 * to offer multiple easIng options
 *
 * Copyright (c) 2007 George Smith
 * Licensed under the MIT License:
 *   //www.opensource.org/licenses/mit-license.php
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
});/*	SWFObject v2.2 <//code.google.com/p/swfobject/>
	is released under the MIT License <//www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();/** @license
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * //schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * //schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20110424
 */

/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: false, bitwise: true, regexp: false, newcap: true, immed: true */
/*global window, SM2_DEFER, sm2Debugger, console, document, navigator, setTimeout, setInterval, clearInterval, Audio */

(function(window) {

var soundManager = null;

function SoundManager(smURL, smID) {

  this.flashVersion = 8;             // version of flash to require, either 8 or 9. Some API features require Flash 9.
  this.debugMode = false;             // enable debugging output (div#soundmanager-debug, OR console if available+configured)
  this.debugFlash = false;           // enable debugging output inside SWF, troubleshoot Flash/browser issues
  this.useConsole = true;            // use firebug/safari console.log()-type debug console if available
  this.consoleOnly = false;          // if console is being used, do not create/write to #soundmanager-debug
  this.waitForWindowLoad = false;    // force SM2 to wait for window.onload() before trying to call soundManager.onload()
  this.nullURL = 'about:blank';      // path to "null" (empty) MP3 file, used to unload sounds (Flash 8 only)
  this.allowPolling = true;          // allow flash to poll for status update (required for whileplaying() events, peak, sound spectrum functions to work.)
  this.useFastPolling = false;       // uses lower flash timer interval for higher callback frequency, best combined with useHighPerformance
  this.useMovieStar = true;          // enable support for Flash 9.0r115+ (codename "MovieStar") MPEG4 audio formats (AAC, M4V, FLV, MOV etc.)
  this.bgColor = '#ffffff';          // movie (.swf) background color, eg. '#000000'
  this.useHighPerformance = false;   // position:fixed flash movie can help increase js/flash speed, minimize lag
  this.flashPollingInterval = null;  // msec for polling interval. Defaults to 50 unless useFastPolling = true.
  this.flashLoadTimeout = 1000;      // msec to wait for flash movie to load before failing (0 = infinity)
  this.wmode = null;                 // string: flash rendering mode - null, transparent, opaque (last two allow layering of HTML on top)
  this.allowScriptAccess = 'always'; // for scripting the SWF (object/embed property), either 'always' or 'sameDomain'
  this.useFlashBlock = false;        // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
  this.useHTML5Audio = false;        // Beta feature: Use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (no MP3/MP4.) Ideally, transparent vs. Flash API where possible.
  this.html5Test = /^probably$/i;    // HTML5 Audio().canPlayType() test. /^(probably|maybe)$/i if you want to be more liberal/risky.
  this.useGlobalHTML5Audio = true;   // (experimental) if true, re-use single HTML5 audio object across all sounds. Enabled by default on mobile devices/iOS.
  this.requireFlash = false;         // (experimental) if true, prevents "HTML5-only" mode when flash present. Allows flash to handle RTMP/serverURL, but HTML5 for other cases

  this.audioFormats = {
    // determines HTML5 support, flash requirements
    // eg. if MP3 or MP4 required, Flash fallback is used if HTML5 can't play it
    // shotgun approach to MIME testing due to browser variance
    'mp3': {
      'type': ['audio/mpeg; codecs="mp3"','audio/mpeg','audio/mp3','audio/MPA','audio/mpa-robust'],
      'required': true
    },
    'mp4': {
      'related': ['aac','m4a'], // additional formats under the MP4 container
      'type': ['audio/mp4; codecs="mp4a.40.2"','audio/aac','audio/x-m4a','audio/MP4A-LATM','audio/mpeg4-generic'],
      'required': true
    },
    'ogg': {
      'type': ['audio/ogg; codecs=vorbis'],
      'required': false
    },
    'wav': {
      'type': ['audio/wav; codecs="1"','audio/wav','audio/wave','audio/x-wav'],
      'required': false
    }
  };

  this.defaultOptions = {
    'autoLoad': false,             // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
    'stream': true,                // allows playing before entire file has loaded (recommended)
    'autoPlay': false,             // enable playing of file as soon as possible (much faster if "stream" is true)
    'loops': 1,                    // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
    'onid3': null,                 // callback function for "ID3 data is added/available"
    'onload': null,                // callback function for "load finished"
    'whileloading': null,          // callback function for "download progress update" (X of Y bytes received)
    'onplay': null,                // callback for "play" start
    'onpause': null,               // callback for "pause"
    'onresume': null,              // callback for "resume" (pause toggle)
    'whileplaying': null,          // callback during play (position update)
    'onstop': null,                // callback for "user stop"
    'onfailure': null,             // callback function for when playing fails
    'onfinish': null,              // callback function for "sound finished playing"
    'onbeforefinish': null,        // callback for "before sound finished playing (at [time])"
    'onbeforefinishtime': 5000,    // offset (milliseconds) before end of sound to trigger beforefinish (eg. 1000 msec = 1 second)
    'onbeforefinishcomplete': null,// function to call when said sound finishes playing
    'onjustbeforefinish': null,    // callback for [n] msec before end of current sound
    'onjustbeforefinishtime': 200, // [n] - if not using, set to 0 (or null handler) and event will not fire.
    'multiShot': true,             // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
    'multiShotEvents': false,      // fire multiple sound events (currently onfinish() only) when multiShot is enabled
    'position': null,              // offset (milliseconds) to seek to within loaded sound data.
    'pan': 0,                      // "pan" settings, left-to-right, -100 to 100
    'type': null,                  // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
    'usePolicyFile': false,        // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
    'volume': 100                  // self-explanatory. 0-100, the latter being the max.
  };

  this.flash9Options = {      // flash 9-only options, merged into defaultOptions if flash 9 is being used
    'isMovieStar': null,      // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
    'usePeakData': false,     // enable left/right channel peak (level) data
    'useWaveformData': false, // enable sound spectrum (raw waveform data) - WARNING: CPU-INTENSIVE: may set CPUs on fire.
    'useEQData': false,       // enable sound EQ (frequency spectrum data) - WARNING: Also CPU-intensive.
    'onbufferchange': null,   // callback for "isBuffering" property change
    'ondataerror': null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)
  };

  this.movieStarOptions = { // flash 9.0r115+ MPEG4 audio options, merged into defaultOptions if flash 9+movieStar mode is enabled
    'bufferTime': 3,        // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
    'serverURL': null,      // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
    'onconnect': null,      // rtmp: callback for connection to flash media server
    'duration': null        // rtmp: song duration (msec)
  };

  this.version = null;
  this.versionNumber = 'V2.97a.20110424';
  this.movieURL = null;
  this.url = (smURL || null);
  this.altURL = null;
  this.swfLoaded = false;
  this.enabled = false;
  this.o = null;
  this.movieID = 'sm2-container';
  this.id = (smID || 'sm2movie');
  this.swfCSS = {
    'swfBox': 'sm2-object-box',
    'swfDefault': 'movieContainer',
    'swfError': 'swf_error', // SWF loaded, but SM2 couldn't start (other error)
    'swfTimedout': 'swf_timedout',
    'swfLoaded': 'swf_loaded',
    'swfUnblocked': 'swf_unblocked', // or loaded OK
    'sm2Debug': 'sm2_debug',
    'highPerf': 'high_performance',
    'flashDebug': 'flash_debug'
  };
  this.oMC = null;
  this.sounds = {};
  this.soundIDs = [];
  this.muted = false;
  this.debugID = 'soundmanager-debug';
  this.debugURLParam = /([#?&])debug=1/i;
  this.specialWmodeCase = false;
  this.didFlashBlock = false;

  this.filePattern = null;
  this.filePatterns = {
    'flash8': /\.mp3(\?.*)?$/i,
    'flash9': /\.mp3(\?.*)?$/i
  };

  this.baseMimeTypes = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // mp3
  this.netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // mp3, mp4, aac etc.
  this.netStreamTypes = ['aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'mp4v', '3gp', '3g2']; // Flash v9.0r115+ "moviestar" formats
  this.netStreamPattern = new RegExp('\\.(' + this.netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
  this.mimePattern = this.baseMimeTypes;

  this.features = {
    'buffering': false,
    'peakData': false,
    'waveformData': false,
    'eqData': false,
    'movieStar': false
  };

  this.sandbox = {
    /*
    'type': null,
    'types': {
      'remote': 'remote (domain-based) rules',
      'localWithFile': 'local with file access (no internet access)',
      'localWithNetwork': 'local with network (internet access only, no local access)',
      'localTrusted': 'local, trusted (local+internet access)'
    },
    'description': null,
    'noRemote': null,
    'noLocal': null
    */
  };

  this.hasHTML5 = null; // switch for handling logic
  this.html5 = { // stores canPlayType() results, etc. treat as read-only.
    // mp3: boolean
    // mp4: boolean
    'usingFlash': null // set if/when flash fallback is needed
  };
  this.ignoreFlash = false; // used for special cases (eg. iPad/iPhone/palm OS?)

  // --- private SM2 internals ---

  var SMSound,
  _s = this, _sm = 'soundManager', _smc = _sm+'::', _h5 = 'HTML5::', _id, _ua = navigator.userAgent, _win = window, _wl = _win.location.href.toString(), _fV = this.flashVersion, _doc = document, _doNothing, _init, _on_queue = [], _debugOpen = true, _debugTS, _didAppend = false, _appendSuccess = false, _didInit = false, _disabled = false, _windowLoaded = false, _wDS, _wdCount = 0, _initComplete, _mixin, _addOnEvent, _processOnEvents, _initUserOnload, _go, _delayWaitForEI, _waitForEI, _setVersionInfo, _handleFocus, _beginInit, _strings, _initMovie, _dcLoaded, _didDCLoaded, _getDocument, _createMovie, _die, _setPolling, _debugLevels = ['log', 'info', 'warn', 'error'], _defaultFlashVersion = 8, _disableObject, _failSafely, _normalizeMovieURL, _oRemoved = null, _oRemovedHTML = null, _str, _flashBlockHandler, _getSWFCSS, _toggleDebug, _loopFix, _policyFix, _complain, _idCheck, _waitingForEI = false, _initPending = false, _smTimer, _onTimer, _startTimer, _stopTimer, _needsFlash = null, _featureCheck, _html5OK, _html5Only = false, _html5CanPlay, _html5Ext,  _dcIE, _testHTML5, _event, _slice = Array.prototype.slice, _useGlobalHTML5Audio = false, _hasFlash, _detectFlash, _badSafariFix,
  _is_pre = _ua.match(/pre\//i), _is_iDevice = _ua.match(/(ipad|iphone|ipod)/i), _isMobile = (_ua.match(/mobile/i) || _is_pre || _is_iDevice), _isIE = _ua.match(/msie/i), _isWebkit = _ua.match(/webkit/i), _isSafari = (_ua.match(/safari/i) && !_ua.match(/chrome/i)), _isOpera = (_ua.match(/opera/i)),
  _isBadSafari = (!_wl.match(/usehtml5audio/i) && !_wl.match(/sm2\-ignorebadua/i) && _isSafari && _ua.match(/OS X 10_6_([3-9])/i)), // Safari 4 and 5 occasionally fail to load/play HTML5 audio on Snow Leopard due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Known Apple "radar" bug. https://bugs.webkit.org/show_bug.cgi?id=32159
  _hasConsole = (typeof console !== 'undefined' && typeof console.log !== 'undefined'), _isFocused = (typeof _doc.hasFocus !== 'undefined'?_doc.hasFocus():null), _tryInitOnFocus = (typeof _doc.hasFocus === 'undefined' && _isSafari), _okToDisable = !_tryInitOnFocus;

  this._use_maybe = (_wl.match(/sm2\-useHTML5Maybe\=1/i)); // temporary feature: #sm2-useHTML5Maybe=1 forces loose canPlay() check
  this._overHTTP = (_doc.location?_doc.location.protocol.match(/http/i):null);
  this._http = (!this._overHTTP ? 'http:' : '');
  this.useAltURL = !this._overHTTP; // use altURL if not "online"
  this._global_a = null;

  if (_is_iDevice || _is_pre) {
    // during HTML5 beta period (off by default), may as well force it on Apple + Palm, flash support unlikely
    _s.useHTML5Audio = true;
    _s.ignoreFlash = true;
    if (_s.useGlobalHTML5Audio) {
      _useGlobalHTML5Audio = true;
    }
  }

  if (_is_pre || this._use_maybe) {
    // less-strict canPlayType() checking option
    _s.html5Test = /^(probably|maybe)$/i;
  }

  // Temporary feature: allow force of HTML5 via URL: #sm2-usehtml5audio=0 or 1
  /*
  (function(){
    var a = '#sm2-usehtml5audio=', l = _wl, b = null;
    if (l.indexOf(a) !== -1) {
      b = (l.charAt(l.indexOf(a)+a.length) === '1');
      if (typeof console !== 'undefined' && typeof console.log !== 'undefined') {
        console.log((b?'Enabling ':'Disabling ')+'useHTML5Audio via URL parameter');
      }
      _s.useHTML5Audio = b;
    }
  }());
  */

  // --- public API methods ---

  this.ok = function() {
    return (_needsFlash?(_didInit && !_disabled):(_s.useHTML5Audio && _s.hasHTML5));
  };

  this.supported = this.ok; // legacy

  this.getMovie = function(smID) {
    return _isIE?_win[smID]:(_isSafari?_id(smID) || _doc[smID]:_id(smID));
  };

  this.createSound = function(oOptions) {
    var _cs = _sm+'.createSound(): ',
    thisOptions = null, oSound = null, _tO = null;
    if (!_didInit || !_s.ok()) {
      _complain(_cs + _str(!_didInit?'notReady':'notOK'));
      return false;
    }
    if (arguments.length === 2) {
      // function overloading in JS! :) ..assume simple createSound(id,url) use case
      oOptions = {
        'id': arguments[0],
        'url': arguments[1]
      };
    }
    thisOptions = _mixin(oOptions); // inherit from defaultOptions
    _tO = thisOptions; // alias
    /*
    if (_tO.id.toString().charAt(0).match(/^[0-9]$/)) {
      //_s._wD(_cs + _str('badID', _tO.id), 2);
    }
    //_s._wD(_cs + _tO.id + ' (' + _tO.url + ')', 1);
    */
    if (_idCheck(_tO.id, true)) {
      //_s._wD(_cs + _tO.id + ' exists', 1);
      return _s.sounds[_tO.id];
    }

    function make() {
      thisOptions = _loopFix(thisOptions);
      _s.sounds[_tO.id] = new SMSound(_tO);
      _s.soundIDs.push(_tO.id);
      return _s.sounds[_tO.id];
    }

    if (_html5OK(_tO)) {
      oSound = make();
      //_s._wD('Loading sound '+_tO.id+' via HTML5');
      oSound._setup_html5(_tO);
    } else {
      if (_fV > 8 && _s.useMovieStar) {
        if (_tO.isMovieStar === null) {
          _tO.isMovieStar = ((_tO.serverURL || (_tO.type?_tO.type.match(_s.netStreamPattern):false)||_tO.url.match(_s.netStreamPattern))?true:false);
        }
        if (_tO.isMovieStar) {
          //_s._wD(_cs + 'using MovieStar handling');
        }
        if (_tO.isMovieStar) {
          if (_tO.usePeakData) {
            //_wDS('noPeak');
            _tO.usePeakData = false;
          }
          if (_tO.loops > 1) {
            //_wDS('noNSLoop');
          }
        }
      }
      _tO = _policyFix(_tO, _cs);
      oSound = make();
      if (_fV === 8) {
        _s.o._createSound(_tO.id, _tO.onjustbeforefinishtime, _tO.loops||1, _tO.usePolicyFile);
      } else {
        _s.o._createSound(_tO.id, _tO.url, _tO.onjustbeforefinishtime, _tO.usePeakData, _tO.useWaveformData, _tO.useEQData, _tO.isMovieStar, (_tO.isMovieStar?_tO.bufferTime:false), _tO.loops||1, _tO.serverURL, _tO.duration||null, _tO.autoPlay, true, _tO.autoLoad, _tO.usePolicyFile);
        if (!_tO.serverURL) {
          // We are connected immediately
          oSound.connected = true;
          if (_tO.onconnect) {
            _tO.onconnect.apply(oSound);
          }
        }
      }

      if ((_tO.autoLoad || _tO.autoPlay) && !_tO.serverURL) {
        oSound.load(_tO); // call load for non-rtmp streams
      }
    }

    if (_tO.autoPlay && !_tO.serverURL) { // rtmp will play in onconnect
      oSound.play();
    }
    return oSound;
  };

  this.destroySound = function(sID, _bFromSound) {
    // explicitly destroy a sound before normal page unload, etc.
    if (!_idCheck(sID)) {
      return false;
    }
    var oS = _s.sounds[sID], i;
    oS._iO = {}; // Disable all callbacks while the sound is being destroyed
    oS.stop();
    oS.unload();
    for (i = 0; i < _s.soundIDs.length; i++) {
      if (_s.soundIDs[i] === sID) {
        _s.soundIDs.splice(i, 1);
        break;
      }
    }
    if (!_bFromSound) {
      // ignore if being called from SMSound instance
      oS.destruct(true);
    }
    oS = null;
    delete _s.sounds[sID];
    return true;
  };

  this.load = function(sID, oOptions) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].load(oOptions);
  };

  this.unload = function(sID) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].unload();
  };

  this.play = function(sID, oOptions) {
    var fN = _sm+'.play(): ';
    if (!_didInit || !_s.ok()) {
      _complain(fN + _str(!_didInit?'notReady':'notOK'));
      return false;
    }
    if (!_idCheck(sID)) {
      if (!(oOptions instanceof Object)) {
        oOptions = {
          url: oOptions
        }; // overloading use case: play('mySound','/path/to/some.mp3');
      }
      if (oOptions && oOptions.url) {
        // overloading use case, create+play: .play('someID',{url:'/path/to.mp3'});
        //_s._wD(fN + 'attempting to create "' + sID + '"', 1);
        oOptions.id = sID;
        return _s.createSound(oOptions).play();
      } else {
        return false;
      }
    }
    return _s.sounds[sID].play(oOptions);
  };

  this.start = this.play; // just for convenience

  this.setPosition = function(sID, nMsecOffset) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].setPosition(nMsecOffset);
  };

  this.stop = function(sID) {
    if (!_idCheck(sID)) {
      return false;
    }
    //_s._wD(_sm+'.stop(' + sID + ')', 1);
    return _s.sounds[sID].stop();
  };

  this.stopAll = function() {
    //_s._wD(_sm+'.stopAll()', 1);
    for (var oSound in _s.sounds) {
      if (_s.sounds[oSound] instanceof SMSound) {
        _s.sounds[oSound].stop(); // apply only to sound objects
      }
    }
  };

  this.pause = function(sID) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].pause();
  };

  this.pauseAll = function() {
    for (var i = _s.soundIDs.length; i--;) {
      _s.sounds[_s.soundIDs[i]].pause();
    }
  };

  this.resume = function(sID) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].resume();
  };

  this.resumeAll = function() {
    for (var i = _s.soundIDs.length; i--;) {
      _s.sounds[_s.soundIDs[i]].resume();
    }
  };

  this.togglePause = function(sID) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].togglePause();
  };

  this.setPan = function(sID, nPan) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].setPan(nPan);
  };

  this.setVolume = function(sID, nVol) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].setVolume(nVol);
  };

  this.mute = function(sID) {
    var fN = _sm+'.mute(): ',
    i = 0;
    if (typeof sID !== 'string') {
      sID = null;
    }
    if (!sID) {
      //_s._wD(fN + 'Muting all sounds');
      for (i = _s.soundIDs.length; i--;) {
        _s.sounds[_s.soundIDs[i]].mute();
      }
      _s.muted = true;
    } else {
      if (!_idCheck(sID)) {
        return false;
      }
      //_s._wD(fN + 'Muting "' + sID + '"');
      return _s.sounds[sID].mute();
    }
    return true;
  };

  this.muteAll = function() {
    _s.mute();
  };

  this.unmute = function(sID) {
    var fN = _sm+'.unmute(): ', i;
    if (typeof sID !== 'string') {
      sID = null;
    }
    if (!sID) {
      //_s._wD(fN + 'Unmuting all sounds');
      for (i = _s.soundIDs.length; i--;) {
        _s.sounds[_s.soundIDs[i]].unmute();
      }
      _s.muted = false;
    } else {
      if (!_idCheck(sID)) {
        return false;
      }
      //_s._wD(fN + 'Unmuting "' + sID + '"');
      return _s.sounds[sID].unmute();
    }
    return true;
  };

  this.unmuteAll = function() {
    _s.unmute();
  };

  this.toggleMute = function(sID) {
    if (!_idCheck(sID)) {
      return false;
    }
    return _s.sounds[sID].toggleMute();
  };

  this.getMemoryUse = function() {
    if (_fV === 8) {
      return 0;
    }
    if (_s.o) {
      return parseInt(_s.o._getMemoryUse(), 10);
    }
  };

  this.disable = function(bNoDisable) {
    // destroy all functions
    if (typeof bNoDisable === 'undefined') {
      bNoDisable = false;
    }
    if (_disabled) {
      return false;
    }
    _disabled = true;
    //_wDS('shutdown', 1);
    for (var i = _s.soundIDs.length; i--;) {
      _disableObject(_s.sounds[_s.soundIDs[i]]);
    }
    _initComplete(bNoDisable); // fire "complete", despite fail
    _event.remove(_win, 'load', _initUserOnload);
    return true;
  };

  this.canPlayMIME = function(sMIME) {
    var result;
    if (_s.hasHTML5) {
      result = _html5CanPlay({type:sMIME});
    }
    if (!_needsFlash || result) {
      // no flash, or OK
      return result;
    } else {
      return (sMIME?(sMIME.match(_s.mimePattern)?true:false):null);
    }
  };

  this.canPlayURL = function(sURL) {
    var result;
    if (_s.hasHTML5) {
      result = _html5CanPlay(sURL);
    }
    if (!_needsFlash || result) {
      // no flash, or OK
      return result;
    } else {
      return (sURL?(sURL.match(_s.filePattern)?true:false):null);
    }
  };

  this.canPlayLink = function(oLink) {
    if (typeof oLink.type !== 'undefined' && oLink.type) {
      if (_s.canPlayMIME(oLink.type)) {
        return true;
      }
    }
    return _s.canPlayURL(oLink.href);
  };

  this.getSoundById = function(sID, suppressDebug) {
    if (!sID) {
      throw new Error(_sm+'.getSoundById(): sID is null/undefined');
    }
    var result = _s.sounds[sID];
    if (!result && !suppressDebug) {
      //_s._wD('"' + sID + '" is an invalid sound ID.', 2);
    }
    return result;
  };

  this.onready = function(oMethod, oScope) {
    var sType = 'onready';
    if (oMethod && oMethod instanceof Function) {
      if (_didInit) {
        //_wDS('queue', sType);
      }
      if (!oScope) {
        oScope = _win;
      }
      _addOnEvent(sType, oMethod, oScope);
      _processOnEvents();
      return true;
    } else {
      throw _str('needFunction', sType);
    }
  };

  this.ontimeout = function(oMethod, oScope) {
    var sType = 'ontimeout';
    if (oMethod && oMethod instanceof Function) {
      if (_didInit) {
        //_wDS('queue');
      }
      if (!oScope) {
        oScope = _win;
      }
      _addOnEvent(sType, oMethod, oScope);
      _processOnEvents({type:sType});
      return true;
    } else {
      throw _str('needFunction', sType);
    }
  };

  this.getMoviePercent = function() {
    return (_s.o && typeof _s.o.PercentLoaded !== 'undefined'?_s.o.PercentLoaded():null);
  };

  this._writeDebug = function(sText, sType, bTimestamp) {
    // pseudo-private console.log()-style output
    /*
    var sDID = 'soundmanager-debug', o, oItem, sMethod;
    if (!_s.debugMode) {
      return false;
    }
    if (typeof bTimestamp !== 'undefined' && bTimestamp) {
      sText = sText + ' | ' + new Date().getTime();
    }
    if (_hasConsole && _s.useConsole) {
      sMethod = _debugLevels[sType];
      if (typeof console[sMethod] !== 'undefined') {
        console[sMethod](sText);
      } else {
        console.log(sText);
      }
      if (_s.useConsoleOnly) {
        return true;
      }
    }
    try {
      o = _id(sDID);
      if (!o) {
        return false;
      }
      oItem = _doc.createElement('div');
      if (++_wdCount % 2 === 0) {
        oItem.className = 'sm2-alt';
      }
      if (typeof sType === 'undefined') {
        sType = 0;
      } else {
        sType = parseInt(sType, 10);
      }
      oItem.appendChild(_doc.createTextNode(sText));
      if (sType) {
        if (sType >= 2) {
          oItem.style.fontWeight = 'bold';
        }
        if (sType === 3) {
          oItem.style.color = '#ff3333';
        }
      }
      // o.appendChild(oItem); // top-to-bottom
      o.insertBefore(oItem, o.firstChild); // bottom-to-top
    } catch(e) {
      // oh well
    }
    o = null;
    */
    return true;
  };
  this._wD = this._writeDebug; // alias

  this._debug = function() {
    /*
    //_wDS('currentObj', 1);
    for (var i = 0, j = _s.soundIDs.length; i < j; i++) {
      _s.sounds[_s.soundIDs[i]]._debug();
    }
    */
  };

  this.reboot = function() {
    // attempt to reset and init SM2
    //_s._wD(_sm+'.reboot()');
    if (_s.soundIDs.length) {
      //_s._wD('Destroying ' + _s.soundIDs.length + ' SMSound objects...');
    }
    var i, j;
    for (i = _s.soundIDs.length; i--;) {
      _s.sounds[_s.soundIDs[i]].destruct();
    }
    // trash ze flash
    try {
      if (_isIE) {
        _oRemovedHTML = _s.o.innerHTML;
      }
      _oRemoved = _s.o.parentNode.removeChild(_s.o);
      //_s._wD('Flash movie removed.');
    } catch(e) {
      // uh-oh.
      //_wDS('badRemove', 2);
    }
    // actually, force recreate of movie.
    _oRemovedHTML = _oRemoved = null;
    _s.enabled = _didInit = _waitingForEI = _initPending = _didAppend = _appendSuccess = _disabled = _s.swfLoaded = false;
    _s.soundIDs = _s.sounds = [];
    _s.o = null;
    for (i in _on_queue) {
      if (_on_queue.hasOwnProperty(i)) {
        for (j = _on_queue[i].length; j--;) {
          _on_queue[i][j].fired = false;
        }
      }
    }
    //_s._wD(_sm + ': Rebooting...');
    _win.setTimeout(function() {
      _s.beginDelayedInit();
    }, 20);
  };

  this.destruct = function() {
    //_s._wD(_sm+'.destruct()');
    _s.disable(true);
  };

  this.beginDelayedInit = function() {
    // //_s._wD(_sm+'.beginDelayedInit()');
    _windowLoaded = true;
   _dcLoaded();
    setTimeout(_beginInit, 20);
    _delayWaitForEI();
  };


  // Wrap html5 event handlers so we don't call them on destroyed sounds
  function _html5_event(oFn) {
    return function(e) {
      if (!this._t || !this._t._a) {
        if (this._t && this._t.sID) {
          //_s._wD(_h5+'ignoring '+e.type+': '+this._t.sID);
        } else {
          //_s._wD(_h5+'ignoring '+e.type);
        }
        return null;
      } else {
        return oFn.call(this, e);
      }
    };
  }

  this._html5_events = {

    // HTML5 event-name-to-handler map
    abort: _html5_event(function(e) {
      //_s._wD(_h5+'abort: '+this._t.sID);
    }),

    // enough has loaded to play
    canplay: _html5_event(function(e) {
      //_s._wD(_h5+'canplay: '+this._t.sID+', '+this._t.url);
      this._t._onbufferchange(0);
      var position1K = (!isNaN(this._t.position)?this._t.position/1000:null);
      // set the position if position was set before the sound loaded
      this._t._html5_canplay = true;
      if (this._t.position && this.currentTime !== position1K) {
        //_s._wD(_h5+'canplay: setting position to '+position1K+'');
        try {
          this.currentTime = position1K;
        } catch(ee) {
          //_s._wD(_h5+'setting position failed: '+ee.message, 2);
        }
      }
    }),

    load: _html5_event(function(e) {
      if (!this._t.loaded) {
        this._t._onbufferchange(0);
        // should be 1, and the same
        this._t._whileloading(this._t.bytesTotal, this._t.bytesTotal, this._t._get_html5_duration());
        this._t._onload(true);
      }
    }),

    emptied: _html5_event(function(e) {
      //_s._wD(_h5+'emptied: '+this._t.sID);
    }),

    ended: _html5_event(function(e) {
      //_s._wD(_h5+'ended: '+this._t.sID);
      this._t._onfinish();
    }),

    error: _html5_event(function(e) {
      //_s._wD(_h5+'error: '+this.error.code);
      // call load with error state?
      this._t._onload(false);
    }),

    loadeddata: _html5_event(function(e) {
      //_s._wD(_h5+'loadeddata: '+this._t.sID);
    }),

    loadedmetadata: _html5_event(function(e) {
      //_s._wD(_h5+'loadedmetadata: '+this._t.sID);
    }),

    loadstart: _html5_event(function(e) {
      //_s._wD(_h5+'loadstart: '+this._t.sID);
      // assume buffering at first
      this._t._onbufferchange(1);
    }),

    play: _html5_event(function(e) {
      //_s._wD(_h5+'play: '+this._t.sID+', '+this._t.url);
      // once play starts, no buffering
      this._t._onbufferchange(0);
    }),

    // TODO: verify if this is actually implemented anywhere yet.
    playing: _html5_event(function(e) {
      //_s._wD(_h5+'playing: '+this._t.sID+', '+this._t.url);
      // once play starts, no buffering
      this._t._onbufferchange(0);
    }),

    progress: _html5_event(function(e) {

      if (this._t.loaded) {
        return false;
      }

      var i, j, str, loadSum = 0, buffered = 0,
          isProgress = (e.type === 'progress'),
          ranges = e.target.buffered,
          loaded = (e.loaded||0), // firefox 3.6 implements e.loaded/total (bytes)
          total = (e.total||1);

      if (ranges && ranges.length) {

        // if loaded is 0, try TimeRanges implementation as % of load
        // https://developer.mozilla.org/en/DOM/TimeRanges
        for (i=ranges.length; i--;) {
          buffered = (ranges.end(i) - ranges.start(i));
        }

        // linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
        loaded = buffered/e.target.duration;

        /*
        if (isProgress && ranges.length > 1) {
          str = [];
          j = ranges.length;
          for (i=0; i<j; i++) {
            str.push(e.target.buffered.start(i) +'-'+ e.target.buffered.end(i));
          }
          //_s._wD(_h5+'progress: timeRanges: '+str.join(', '));
        }
        */

        if (isProgress && !isNaN(loaded)) {
          //_s._wD(_h5+'progress: '+this._t.sID+': ' + Math.floor(loaded*100)+'% loaded');
        }

      }

      if (!isNaN(loaded)) {

        this._t._onbufferchange(0); // if progress, likely not buffering
        this._t._whileloading(loaded, total, this._t._get_html5_duration());

        if (loaded && total && loaded === total) {
          // in case "onload" doesn't fire (eg. gecko 1.9.2)
          _s._html5_events.load.call(this, e);
        }

      }

    }),

    ratechange: _html5_event(function(e) {
      //_s._wD(_h5+'ratechange: '+this._t.sID);
    }),

    suspend: _html5_event(function(e) {
      // download paused/stopped, may have finished (eg. onload)
      //_s._wD(_h5+'suspend: '+this._t.sID);
      _s._html5_events.progress.call(this, e);
    }),

    stalled: _html5_event(function(e) {
      //_s._wD(_h5+'stalled: '+this._t.sID);
    }),

    timeupdate: _html5_event(function(e) {
      this._t._onTimer();
    }),

    waiting: _html5_event(function(e) { // see also: seeking
      //_s._wD(_h5+'waiting: '+this._t.sID);
      // playback faster than download rate, etc.
      this._t._onbufferchange(1);
    })

  };

  // --- SMSound (sound object) instance ---

  SMSound = function(oOptions) {
    var _t = this, _resetProperties, _stop_html5_timer, _start_html5_timer;
    this.sID = oOptions.id;
    this.url = oOptions.url;
    this.options = _mixin(oOptions);
    this.instanceOptions = this.options; // per-play-instance-specific options
    this._iO = this.instanceOptions; // short alias
    // assign property defaults
    this.pan = this.options.pan;
    this.volume = this.options.volume;
    this._lastURL = null;
    this.isHTML5 = false;
    this._a = null;

    // --- public methods ---

    this.id3 = {};

    this._debug = function() {
      /*
      // pseudo-private console.log()-style output
      if (_s.debugMode) {
        var stuff = null, msg = [], sF, sfBracket, maxLength = 64;
        for (stuff in _t.options) {
          if (_t.options[stuff] !== null) {
            if (_t.options[stuff] instanceof Function) {
              // handle functions specially
              sF = _t.options[stuff].toString();
              sF = sF.replace(/\s\s+/g, ' '); // normalize spaces
              sfBracket = sF.indexOf('{');
              msg.push(' ' + stuff + ': {' + sF.substr(sfBracket + 1, (Math.min(Math.max(sF.indexOf('\n') - 1, maxLength), maxLength))).replace(/\n/g, '') + '... }');
            } else {
              msg.push(' ' + stuff + ': ' + _t.options[stuff]);
            }
          }
        }
        //_s._wD('SMSound() merged options: {\n' + msg.join(', \n') + '\n}');
      }
      */
    };

    this._debug();

    this.load = function(oOptions) {
      var oS = null;
      if (typeof oOptions !== 'undefined') {
        _t._iO = _mixin(oOptions, _t.options);
        _t.instanceOptions = _t._iO;
      } else {
        oOptions = _t.options;
        _t._iO = oOptions;
        _t.instanceOptions = _t._iO;
        if (_t._lastURL && _t._lastURL !== _t.url) {
          //_wDS('manURL');
          _t._iO.url = _t.url;
          _t.url = null;
        }
      }
      if (!_t._iO.url) {
        _t._iO.url = _t.url;
      }
      //_s._wD('SMSound.load(): ' + _t._iO.url, 1);
      if (_t._iO.url === _t.url && _t.readyState !== 0 && _t.readyState !== 2) {
        //_wDS('onURL', 1);
        return _t;
      }
      _t._lastURL = _t.url;
      _t.loaded = false;
      _t.readyState = 1;
      _t.playState = 0;
      if (_html5OK(_t._iO)) {
        oS = _t._setup_html5(_t._iO);
        if (!oS._called_load) {
          //_s._wD(_h5+'load: '+_t.sID);
          oS.load();
          oS._called_load = true;
          if (_t._iO.autoPlay) {
            _t.play();
          }
        } else {
          //_s._wD('HTML5 ignoring request to load again: '+_t.sID);
        }
      } else {
        try {
          _t.isHTML5 = false;
          _t._iO = _policyFix(_loopFix(_t._iO));
          if (_fV === 8) {
            _s.o._load(_t.sID, _t._iO.url, _t._iO.stream, _t._iO.autoPlay, (_t._iO.whileloading?1:0), _t._iO.loops||1, _t._iO.usePolicyFile);
          } else {
            _s.o._load(_t.sID, _t._iO.url, _t._iO.stream?true:false, _t._iO.autoPlay?true:false, _t._iO.loops||1, _t._iO.autoLoad?true:false, _t._iO.usePolicyFile);
          }
        } catch(e) {
          //_wDS('smError', 2);
          //_debugTS('onload', false);
          _die();
        }
      }
      return _t;
    };

    this.unload = function() {
      // Flash 8/AS2 can't "close" a stream - fake it by loading an empty MP3
      // Flash 9/AS3: Close stream, preventing further load
      if (_t.readyState !== 0) {
        //_s._wD('SMSound.unload(): "' + _t.sID + '"');
        if (!_t.isHTML5) {
          if (_fV === 8) {
            _s.o._unload(_t.sID, _s.nullURL);
          } else {
            _s.o._unload(_t.sID);
          }
        } else {
          _stop_html5_timer();
          if (_t._a) {
            // abort()-style method here, stop loading? (doesn't exist?)
            _t._a.pause();
// if (!_useGlobalHTML5Audio || (_useGlobalHTML5Audio && _t.playState)) { // if global audio, only unload if actively playing
            _t._a.src = ''; // https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
// }
          }
        }
        // reset load/status flags
        _resetProperties();
      }
      return _t;
    };

    this.destruct = function(_bFromSM) {
      //_s._wD('SMSound.destruct(): "' + _t.sID + '"');
      if (!_t.isHTML5) {
        // kill sound within Flash
        // Disable the onfailure handler
        _t._iO.onfailure = null;
        _s.o._destroySound(_t.sID);
      } else {
        _stop_html5_timer();
        if (_t._a) {
          // abort()-style method here, stop loading? (doesn't exist?)
          _t._a.pause();
          _t._a.src = ''; // https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
          if (!_useGlobalHTML5Audio) {
            _t._remove_html5_events();
          }
        }
      }
      if (!_bFromSM) {
        _s.destroySound(_t.sID, true); // ensure deletion from controller
      }
    };

    this.play = function(oOptions, _updatePlayState) {
      var fN = 'SMSound.play(): ', allowMulti;
      _updatePlayState = _updatePlayState === undefined ? true : _updatePlayState; // default true
      if (!oOptions) {
        oOptions = {};
      }
      _t._iO = _mixin(oOptions, _t._iO);
      _t._iO = _mixin(_t._iO, _t.options);
      _t.instanceOptions = _t._iO;
      if (_t._iO.serverURL) {
        if (!_t.connected) {
          if (!_t.getAutoPlay()) {
            //_s._wD(fN+' Netstream not connected yet - setting autoPlay');
            _t.setAutoPlay(true);
          }
          return _t; // play will be called in _onconnect()
        }
      }
      if (_html5OK(_t._iO)) {
        _t._setup_html5(_t._iO);
        _start_html5_timer();
      }
      if (_t.playState === 1 && !_t.paused) {
        allowMulti = _t._iO.multiShot;
        if (!allowMulti) {
          //_s._wD(fN + '"' + _t.sID + '" already playing (one-shot)', 1);
          return _t;
        } else {
          //_s._wD(fN + '"' + _t.sID + '" already playing (multi-shot)', 1);
          if (_t.isHTML5) {
            // TODO: BUG?
            _t.setPosition(_t._iO.position);
          }
        }
      }
      if (!_t.loaded) {
        if (_t.readyState === 0) {
          //_s._wD(fN + 'Attempting to load "' + _t.sID + '"', 1);
          // try to get this sound playing ASAP
          if (!_t.isHTML5) {
            _t._iO.autoPlay = true; // assign directly because setAutoPlay() increments the instanceCount
            _t.load(_t._iO);
          } else {
            _t.load(_t._iO);
            // _t.readyState = 1; // redundant
          }
        } else if (_t.readyState === 2) {
          //_s._wD(fN + 'Could not load "' + _t.sID + '" - exiting', 2);
          return _t;
        } else {
          //_s._wD(fN + '"' + _t.sID + '" is loading - attempting to play..', 1);
        }
      } else {
        //_s._wD(fN + '"' + _t.sID + '"');
      }
      // Streams will pause when their buffer is full if they are being loaded.
      // In this case paused is true, but the song hasn't started playing yet. If
      // we just call resume() the onplay() callback will never be called.  So
      // only call resume() if the position is > 0.
      // Another reason is because options like volume won't have been applied yet.
      if (_t.paused && _t.position && _t.position > 0) { // https://gist.github.com/37b17df75cc4d7a90bf6
        //_s._wD(fN + '"' + _t.sID + '" is resuming from paused state',1);
        _t.resume();
      } else {
        //_s._wD(fN+'"'+ _t.sID+'" is starting to play');
        _t.playState = 1;
        _t.paused = false;
        if (!_t.instanceCount || _t._iO.multiShotEvents || (_fV > 8 && !_t.isHTML5 && !_t.getAutoPlay())) {
          _t.instanceCount++;
        }
        _t.position = (typeof _t._iO.position !== 'undefined' && !isNaN(_t._iO.position)?_t._iO.position:0);
        if (!_t.isHTML5) {
          _t._iO = _policyFix(_loopFix(_t._iO));
        }
        if (_t._iO.onplay && _updatePlayState) {
          _t._iO.onplay.apply(_t);
          _t._onplay_called = true;
        }
        _t.setVolume(_t._iO.volume, true);
        _t.setPan(_t._iO.pan, true);
        if (!_t.isHTML5) {
          _s.o._start(_t.sID, _t._iO.loops || 1, (_fV === 9?_t.position:_t.position / 1000));
        } else {
          _start_html5_timer();
          _t._setup_html5().play();
        }
      }
      return _t;
    };

    this.start = this.play; // just for convenience

    this.stop = function(bAll) {
      if (_t.playState === 1) {
        _t._onbufferchange(0);
        _t.resetOnPosition(0);
        if (!_t.isHTML5) {
          _t.playState = 0;
        }
        _t.paused = false;
        if (_t._iO.onstop) {
          _t._iO.onstop.apply(_t);
        }
        if (!_t.isHTML5) {
          _s.o._stop(_t.sID, bAll);
          // hack for netStream: just unload
          if (_t._iO.serverURL) {
            _t.unload();
          }
        } else {
          if (_t._a) {
            _t.setPosition(0); // act like Flash, though
            _t._a.pause(); // html5 has no stop()
            _t.playState = 0;
            _t._onTimer(); // and update UI
            _stop_html5_timer();
            _t.unload();
          }
        }
        _t.instanceCount = 0;
        _t._iO = {};
      }
      return _t;
    };

    this.setAutoPlay = function(autoPlay) {
      //_s._wD('sound '+_t.sID+' turned autoplay ' + (autoPlay ? 'on' : 'off'));
      _t._iO.autoPlay = autoPlay;
      if (_t.isHTML5) {
        if (_t._a && autoPlay) {
          _t.play(); // HTML5 onload isn't reliable
        }
      } else {
        _s.o._setAutoPlay(_t.sID, autoPlay);
      }
      if (autoPlay) {
        // only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
        if (!_t.instanceCount && _t.readyState === 1) {
          _t.instanceCount++;
          //_s._wD('sound '+_t.sID+' incremented instance count to '+_t.instanceCount);
        }
      }
    };

    this.getAutoPlay = function() {
      return _t._iO.autoPlay;
    };

    this.setPosition = function(nMsecOffset, bNoDebug) {
      if (nMsecOffset === undefined) {
        nMsecOffset = 0;
      }
      // Use the duration from the instance options, if we don't have a track duration yet.
      var original_pos, position, position1K, offset = (_t.isHTML5 ? Math.max(nMsecOffset,0) : Math.min(_t.duration || _t._iO.duration, Math.max(nMsecOffset, 0))); // position >= 0 and <= current available (loaded) duration
      original_pos = _t.position;
      _t.position = offset;
      position1K = _t.position/1000;
      _t.resetOnPosition(_t.position);
      _t._iO.position = offset;
      if (!_t.isHTML5) {
        position = _fV === 9 ? _t.position : position1K;
        if (_t.readyState && _t.readyState !== 2) {
          _s.o._setPosition(_t.sID, position, (_t.paused || !_t.playState)); // if paused or not playing, will not resume (by playing)
        }
      } else if (_t._a) {
        // Set the position in the canplay handler if the sound is not ready yet
        if (_t._html5_canplay) {
          if (_t._a.currentTime !== position1K) {
            // Only set the position if we need to.
            // DOM/JS errors/exceptions to watch out for:
            // if seek is beyond (loaded?) position, "DOM exception 11"
            // "INDEX_SIZE_ERR": DOM exception 1
            //_s._wD('setPosition('+position1K+'): setting position');
            try {
              _t._a.currentTime = position1K;
            } catch(e) {
              //_s._wD('setPosition('+position1K+'): setting position failed: '+e.message, 2);
            }
          }
        } else {
          //_s._wD('setPosition('+position1K+'): delaying, sound not ready');
        }
      }
      if (_t.isHTML5) {
        if (_t.paused) { // if paused, refresh UI right away
          _t._onTimer(true); // force update
        }
      }
      return _t;
    };

    this.pause = function(bCallFlash) {
      if (_t.paused || (_t.playState === 0 && _t.readyState !== 1)) {
        return _t;
      }
      //_s._wD('SMSound.pause()');
      _t.paused = true;
      if (!_t.isHTML5) {
        if (bCallFlash || bCallFlash === undefined) {
          _s.o._pause(_t.sID);
        }
      } else {
        _t._setup_html5().pause();
        _stop_html5_timer();
      }
      if (_t._iO.onpause) {
        _t._iO.onpause.apply(_t);
      }
      return _t;
    };

    // When auto-loaded streams pause on buffer full they have a playState of 0.
    // We need to make sure that the playState is set to 1 when these streams "resume".
    //
    // When a paused stream is resumed, we need to trigger the onplay() callback if it
    // hasn't been called already.  In this case since the sound is being played for the
    // first time, I think it's more appropriate to call onplay() rather than onresume().
    this.resume = function() {
      if (!_t.paused) {
        return _t;
      }
      //_s._wD('SMSound.resume()');
      _t.paused = false;
      _t.playState = 1;
      if (!_t.isHTML5) {
        if (_t._iO.isMovieStar) {
          // Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
          _t.setPosition(_t.position);
        }
        _s.o._pause(_t.sID); // flash method is toggle-based (pause/resume)
      } else {
        _t._setup_html5().play();
        _start_html5_timer();
      }
      if (!_t._onplay_called && _t._iO.onplay) {
        _t._iO.onplay.apply(_t);
        _t._onplay_called = true;
      } else if (_t._iO.onresume) {
        _t._iO.onresume.apply(_t);
      }
      return _t;
    };

    this.togglePause = function() {
      //_s._wD('SMSound.togglePause()');
      if (_t.playState === 0) {
        _t.play({
          position: (_fV === 9 && !_t.isHTML5 ? _t.position:_t.position / 1000)
        });
        return _t;
      }
      if (_t.paused) {
        _t.resume();
      } else {
        _t.pause();
      }
      return _t;
    };

    this.setPan = function(nPan, bInstanceOnly) {
      if (typeof nPan === 'undefined') {
        nPan = 0;
      }
      if (typeof bInstanceOnly === 'undefined') {
        bInstanceOnly = false;
      }
      if (!_t.isHTML5) {
        _s.o._setPan(_t.sID, nPan);
      } // else { no HTML5 pan? }
      _t._iO.pan = nPan;
      if (!bInstanceOnly) {
        _t.pan = nPan;
        _t.options.pan = nPan;
      }
      return _t;
    };

    this.setVolume = function(nVol, bInstanceOnly) {
      if (typeof nVol === 'undefined') {
        nVol = 100;
      }
      if (typeof bInstanceOnly === 'undefined') {
        bInstanceOnly = false;
      }
      if (!_t.isHTML5) {
        _s.o._setVolume(_t.sID, (_s.muted && !_t.muted) || _t.muted?0:nVol);
      } else if (_t._a) {
        _t._a.volume = Math.max(0, Math.min(1, nVol/100)); // valid range: 0-1
      }
      _t._iO.volume = nVol;
      if (!bInstanceOnly) {
        _t.volume = nVol;
        _t.options.volume = nVol;
      }
      return _t;
    };

    this.mute = function() {
      _t.muted = true;
      if (!_t.isHTML5) {
        _s.o._setVolume(_t.sID, 0);
      } else if (_t._a) {
        _t._a.muted = true;
      }
      return _t;
    };

    this.unmute = function() {
      _t.muted = false;
      var hasIO = typeof _t._iO.volume !== 'undefined';
      if (!_t.isHTML5) {
        _s.o._setVolume(_t.sID, hasIO?_t._iO.volume:_t.options.volume);
      } else if (_t._a) {
        _t._a.muted = false;
      }
      return _t;
    };

    this.toggleMute = function() {
      return (_t.muted?_t.unmute():_t.mute());
    };

    this.onposition = function(nPosition, oMethod, oScope) {
      // TODO: allow for ranges, too? eg. (nPosition instanceof Array)
      _t._onPositionItems.push({
        position: nPosition,
        method: oMethod,
        scope: (typeof oScope !== 'undefined'?oScope:_t),
        fired: false
      });
      return _t;
    };

    this.processOnPosition = function() {
      var i, item, j = _t._onPositionItems.length;
      if (!j || !_t.playState || _t._onPositionFired >= j) {
        return false;
      }
      for (i=j; i--;) {
        item = _t._onPositionItems[i];
        if (!item.fired && _t.position >= item.position) {
          item.method.apply(item.scope,[item.position]);
          item.fired = true;
          _s._onPositionFired++;
        }
      }
      return true;
    };

    this.resetOnPosition = function(nPosition) {
      // reset "fired" for items interested in this position
      var i, item, j = _t._onPositionItems.length;
      if (!j) {
        return false;
      }
      for (i=j; i--;) {
        item = _t._onPositionItems[i];
        if (item.fired && nPosition <= item.position) {
          item.fired = false;
          _s._onPositionFired--;
        }
      }
      return true;
    };

    // pseudo-private soundManager reference

    this._onTimer = function(bForce) {
      // HTML5-only _whileplaying() etc.
      var time, x = {};
      if (_t._hasTimer || bForce) {
        if (_t._a && (bForce || ((_t.playState > 0 || _t.readyState === 1) && !_t.paused))) { // TODO: May not need to track readyState (1 = loading)
          _t.duration = _t._get_html5_duration();
          _t.durationEstimate = _t.duration;
          time = _t._a.currentTime?_t._a.currentTime*1000:0;
          _t._whileplaying(time,x,x,x,x);
          return true;
        } else {
         //_s._wD('_onTimer: Warn for "'+_t.sID+'": '+(!_t._a?'Could not find element. ':'')+(_t.playState === 0?'playState bad, 0?':'playState = '+_t.playState+', OK'));
          return false;
        }
      }
    };

    // --- private internals ---

    this._get_html5_duration = function() {
      var d = (_t._a ? _t._a.duration*1000 : (_t._iO ? _t._iO.duration : undefined));
      return (d && !isNaN(d) && d !== Infinity ? d : (_t._iO ? _t._iO.duration : null));
    };

    _start_html5_timer = function() {
      if (_t.isHTML5) {
        _startTimer(_t);
      }
    };

    _stop_html5_timer = function() {
      if (_t.isHTML5) {
        _stopTimer(_t);
      }
    };

    _resetProperties = function(bLoaded) {
      _t._onPositionItems = [];
      _t._onPositionFired = 0;
      _t._hasTimer = null;
      _t._onplay_called = false;
      _t._a = null;
      _t._html5_canplay = false;
      _t.bytesLoaded = null;
      _t.bytesTotal = null;
      _t.position = null;
      _t.duration = (_t._iO && _t._iO.duration?_t._iO.duration:null);
      _t.durationEstimate = null;
      _t.failures = 0;
      _t.loaded = false;
      _t.playState = 0;
      _t.paused = false;
      _t.readyState = 0; // 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
      _t.muted = false;
      _t.didBeforeFinish = false;
      _t.didJustBeforeFinish = false;
      _t.isBuffering = false;
      _t.instanceOptions = {};
      _t.instanceCount = 0;
      _t.peakData = {
        left: 0,
        right: 0
      };
      _t.waveformData = {
        left: [],
        right: []
      };
      _t.eqData = []; // legacy: 1D array
      _t.eqData.left = [];
      _t.eqData.right = [];
    };

    _resetProperties();

    // pseudo-private methods used by soundManager

    this._setup_html5 = function(oOptions) {
      var _iO = _mixin(_t._iO, oOptions), d = decodeURI,
          _a = _useGlobalHTML5Audio ? _s._global_a : _t._a,
          _dURL = d(_iO.url),
          _oldIO = (_a && _a._t ? _a._t.instanceOptions : null);
      if (_a) {
        if (_a._t && _oldIO.url === _iO.url && (!_t._lastURL || (_t._lastURL === _oldIO.url))) {
          return _a; // same url, ignore request
        }
        //_s._wD('setting new URL on existing object: ' + _dURL + (_t._lastURL ? ', old URL: ' + _t._lastURL : ''));
        /*
         * "First things first, I, Poppa.." (reset the previous state of the old sound, if playing)
         * Fixes case with devices that can only play one sound at a time
         * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
         */
        if (_useGlobalHTML5Audio && _a._t && _a._t.playState && _iO.url !== _oldIO.url) {
          _a._t.stop();
        }
        _resetProperties(); // new URL, so reset load/playstate and so on
        _a.src = _iO.url;
        _t.url = _iO.url;
        _t._lastURL = _iO.url;
        _a._called_load = false;
      } else {
        //_s._wD('creating HTML5 Audio() element with URL: '+_dURL);
        _a = new Audio(_iO.url);
        _a._called_load = false;
        if (_useGlobalHTML5Audio) {
          _s._global_a = _a;
        }
      }
      _t.isHTML5 = true;
      _t._a = _a; // store a ref on the track
      _a._t = _t; // store a ref on the audio
      _t._add_html5_events();
      _a.loop = (_iO.loops>1?'loop':'');
      if (_iO.autoLoad || _iO.autoPlay) {
        _a.autobuffer = 'auto'; // early HTML5 implementation (non-standard)
        _a.preload = 'auto'; // standard
        _t.load();
        _a._called_load = true;
      } else {
        _a.autobuffer = false; // early HTML5 implementation (non-standard)
        _a.preload = 'none'; // standard
      }
      _a.loop = (_iO.loops>1?'loop':''); // boolean instead of "loop", for webkit? - spec says string. //www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
      return _a;
    };

    // related private methods

    this._add_html5_events = function() {
      if (_t._a._added_events) {
        return false;
      }

      var f;

      function add(oEvt, oFn, bCapture) {
        return _t._a ? _t._a.addEventListener(oEvt, oFn, bCapture||false) : null;
      }

      //_s._wD(_h5+'adding event listeners: '+_t.sID);
      _t._a._added_events = true;

      for (f in _s._html5_events) {
        if (_s._html5_events.hasOwnProperty(f)) {
          add(f, _s._html5_events[f]);
        }
      }

      return true;
    };

    // Keep this externally accessible
    this._remove_html5_events = function() {
      // Remove event listeners
      function remove(oEvt, oFn, bCapture) {
        return (_t._a ? _t._a.removeEventListener(oEvt, oFn, bCapture||false) : null);
      }
      //_s._wD(_h5+'removing event listeners: '+_t.sID);
      _t._a._added_events = false;

      for (var f in _s._html5_events) {
        if (_s._html5_events.hasOwnProperty(f)) {
          remove(f, _s._html5_events[f]);
        }
      }
    };

    // --- "private" methods called by Flash ---

    this._whileloading = function(nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {
      _t.bytesLoaded = nBytesLoaded;
      _t.bytesTotal = nBytesTotal;
      _t.duration = Math.floor(nDuration);
      _t.bufferLength = nBufferLength;
      if (!_t._iO.isMovieStar) {
        if (_t._iO.duration) {
          // use options, if specified and larger
          _t.durationEstimate = (_t.duration > _t._iO.duration) ? _t.duration : _t._iO.duration;
        } else {
          _t.durationEstimate = parseInt((_t.bytesTotal / _t.bytesLoaded) * _t.duration, 10);
        }
        if (_t.durationEstimate === undefined) {
          _t.durationEstimate = _t.duration;
        }
        if (_t.readyState !== 3 && _t._iO.whileloading) {
          _t._iO.whileloading.apply(_t);
        }
      } else {
        _t.durationEstimate = _t.duration;
        if (_t.readyState !== 3 && _t._iO.whileloading) {
          _t._iO.whileloading.apply(_t);
        }
      }
    };

    this._onid3 = function(oID3PropNames, oID3Data) {
      // oID3PropNames: string array (names)
      // ID3Data: string array (data)
      //_s._wD('SMSound._onid3(): "' + this.sID + '" ID3 data received.');
      var oData = [], i, j;
      for (i = 0, j = oID3PropNames.length; i < j; i++) {
        oData[oID3PropNames[i]] = oID3Data[i];
      }
      _t.id3 = _mixin(_t.id3, oData);
      if (_t._iO.onid3) {
        _t._iO.onid3.apply(_t);
      }
    };

    this._whileplaying = function(nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {
      if (isNaN(nPosition) || nPosition === null) {
        return false; // flash safety net
      }
      if (_t.playState === 0 && nPosition > 0) {
        // invalid position edge case for end/stop
        nPosition = 0;
      }
      _t.position = nPosition;
      _t.processOnPosition();
      if (_fV > 8 && !_t.isHTML5) {
        if (_t._iO.usePeakData && typeof oPeakData !== 'undefined' && oPeakData) {
          _t.peakData = {
            left: oPeakData.leftPeak,
            right: oPeakData.rightPeak
          };
        }
        if (_t._iO.useWaveformData && typeof oWaveformDataLeft !== 'undefined' && oWaveformDataLeft) {
          _t.waveformData = {
            left: oWaveformDataLeft.split(','),
            right: oWaveformDataRight.split(',')
          };
        }
        if (_t._iO.useEQData) {
          if (typeof oEQData !== 'undefined' && oEQData && oEQData.leftEQ) {
            var eqLeft = oEQData.leftEQ.split(',');
            _t.eqData = eqLeft;
            _t.eqData.left = eqLeft;
            if (typeof oEQData.rightEQ !== 'undefined' && oEQData.rightEQ) {
              _t.eqData.right = oEQData.rightEQ.split(',');
            }
          }
        }
      }
      if (_t.playState === 1) {
        // special case/hack: ensure buffering is false if loading from cache (and not yet started)
        if (!_t.isHTML5 && _s.flashVersion === 8 && !_t.position && _t.isBuffering) {
          _t._onbufferchange(0);
        }
        if (_t._iO.whileplaying) {
          _t._iO.whileplaying.apply(_t); // flash may call after actual finish
        }
        if ((_t.loaded || (!_t.loaded && _t._iO.isMovieStar)) && _t._iO.onbeforefinish && _t._iO.onbeforefinishtime && !_t.didBeforeFinish && _t.duration - _t.position <= _t._iO.onbeforefinishtime) {
          _t._onbeforefinish();
        }
      }
      return true;
    };

    // Only applies to RTMP
    this._onconnect = function(bSuccess) {
      var fN = 'SMSound._onconnect(): ';
      bSuccess = (bSuccess === 1);
      //_s._wD(fN+'"'+_t.sID+'"'+(bSuccess?' connected.':' failed to connect? - '+_t.url), (bSuccess?1:2));
      _t.connected = bSuccess;
      if (bSuccess) {
        _t.failures = 0;
        if (_idCheck(_t.sID)) {
          if (_t.getAutoPlay()) {
            _t.play(undefined, _t.getAutoPlay()); // only update the play state if auto playing
          } else if (_t._iO.autoLoad) {
            _t.load();
          }
        }
        if (_t._iO.onconnect) {
          _t._iO.onconnect.apply(_t,[bSuccess]);
        }
      }
    };

    this._onload = function(nSuccess) {
      var fN = 'SMSound._onload(): ', loadOK = (nSuccess?true:false);
      //_s._wD(fN + '"' + _t.sID + '"' + (loadOK?' loaded.':' failed to load? - ' + _t.url), (loadOK?1:2));
      /*
      if (!loadOK && !_t.isHTML5) {
        if (_s.sandbox.noRemote === true) {
          //_s._wD(fN + _str('noNet'), 1);
        }
        if (_s.sandbox.noLocal === true) {
          //_s._wD(fN + _str('noLocal'), 1);
        }
      }
      */
      _t.loaded = loadOK;
      _t.readyState = loadOK?3:2;
      _t._onbufferchange(0);
      if (_t._iO.onload) {
        _t._iO.onload.apply(_t, [loadOK]);
      }
      return true;
    };

    // fire onfailure() only once at most
    // at this point we just recreate failed sounds rather than trying to reconnect.
    this._onfailure = function(msg, level, code) {
      _t.failures++;
      //_s._wD('SMSound._onfailure(): "'+_t.sID+'" count '+_t.failures);
      if (_t._iO.onfailure && _t.failures === 1) {
        _t._iO.onfailure(_t, msg, level, code);
      } else {
        //_s._wD('SMSound._onfailure(): ignoring');
      }
    };

    this._onbeforefinish = function() {
      if (!_t.didBeforeFinish) {
        _t.didBeforeFinish = true;
        if (_t._iO.onbeforefinish) {
          //_s._wD('SMSound._onbeforefinish(): "' + _t.sID + '"');
          _t._iO.onbeforefinish.apply(_t);
        }
      }
    };

    this._onjustbeforefinish = function(msOffset) {
      if (!_t.didJustBeforeFinish) {
        _t.didJustBeforeFinish = true;
        if (_t._iO.onjustbeforefinish) {
          //_s._wD('SMSound._onjustbeforefinish(): "' + _t.sID + '"');
          _t._iO.onjustbeforefinish.apply(_t);
        }
      }
    };

    this._onfinish = function() {
      // //_s._wD('SMSound._onfinish(): "' + _t.sID + '" got instanceCount '+_t.instanceCount);
      var _io_onfinish = _t._iO.onfinish; // store local copy before it gets trashed..
      _t._onbufferchange(0);
      _t.resetOnPosition(0);
      if (_t._iO.onbeforefinishcomplete) {
        _t._iO.onbeforefinishcomplete.apply(_t);
      }
      // reset some state items
      _t.didBeforeFinish = false;
      _t.didJustBeforeFinish = false;
      if (_t.instanceCount) {
        _t.instanceCount--;
        if (!_t.instanceCount) {
          // reset instance options
          _t.playState = 0;
          _t.paused = false;
          _t.instanceCount = 0;
          _t.instanceOptions = {};
          _t._iO = {};
          _stop_html5_timer();
        }
        if (!_t.instanceCount || _t._iO.multiShotEvents) {
          // fire onfinish for last, or every instance
          if (_io_onfinish) {
            //_s._wD('SMSound._onfinish(): "' + _t.sID + '"');
            _io_onfinish.apply(_t);
          }
        }
      }
    };

    this._onbufferchange = function(nIsBuffering) {
      var fN = 'SMSound._onbufferchange()';
      if (_t.playState === 0) {
        // ignore if not playing
        return false;
      }
      if ((nIsBuffering && _t.isBuffering) || (!nIsBuffering && !_t.isBuffering)) {
        return false;
      }
      _t.isBuffering = (nIsBuffering === 1);
      if (_t._iO.onbufferchange) {
        //_s._wD(fN + ': ' + nIsBuffering);
        _t._iO.onbufferchange.apply(_t);
      }
      return true;
    };

    this._ondataerror = function(sError) {
      // flash 9 wave/eq data handler
      if (_t.playState > 0) { // hack: called at start, and end from flash at/after onfinish()
        //_s._wD('SMSound._ondataerror(): ' + sError);
        if (_t._iO.ondataerror) {
          _t._iO.ondataerror.apply(_t);
        }
      }
    };

  }; // SMSound()

  // --- private SM2 internals ---

  _getDocument = function() {
    return (_doc.body?_doc.body:(_doc._docElement?_doc.documentElement:_doc.getElementsByTagName('div')[0]));
  };

  _id = function(sID) {
    return _doc.getElementById(sID);
  };

  _mixin = function(oMain, oAdd) {
    // non-destructive merge
    var o1 = {}, i, o2, o;
    for (i in oMain) { // clone c1
      if (oMain.hasOwnProperty(i)) {
        o1[i] = oMain[i];
      }
    }
    o2 = (typeof oAdd === 'undefined'?_s.defaultOptions:oAdd);
    for (o in o2) {
      if (o2.hasOwnProperty(o) && typeof o1[o] === 'undefined') {
        o1[o] = o2[o];
      }
    }
    return o1;
  };

  _event = (function() {

    var old = (_win.attachEvent),
    evt = {
      add: (old?'attachEvent':'addEventListener'),
      remove: (old?'detachEvent':'removeEventListener')
    };

    function getArgs(oArgs) {
      var args = _slice.call(oArgs), len = args.length;
      if (old) {
        args[1] = 'on' + args[1]; // prefix
        if (len > 3) {
          args.pop(); // no capture
        }
      } else if (len === 3) {
        args.push(false);
      }
      return args;
    }

    function apply(args, sType) {
      var element = args.shift(),
          method = [evt[sType]];
      if (old) {
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }
    }

    function add() {
      apply(getArgs(arguments), 'add');
    }

    function remove() {
      apply(getArgs(arguments), 'remove');
    }

    return {
      'add': add,
      'remove': remove
    };

  }());

  _html5OK = function(iO) {
    return (!iO.serverURL && (iO.type?_html5CanPlay({type:iO.type}):_html5CanPlay(iO.url)||_html5Only)); // Use type, if specified. If HTML5-only mode, no other options, so just give 'er
  };

  _html5CanPlay = function(sURL) {
    // try to find MIME, test and return truthiness
    if (!_s.useHTML5Audio || !_s.hasHTML5) {
      return false;
    }
    var result, mime, offset, fileExt, item, aF = _s.audioFormats;
    if (!_html5Ext) {
      _html5Ext = [];
      for (item in aF) {
        if (aF.hasOwnProperty(item)) {
          _html5Ext.push(item);
          if (aF[item].related) {
            _html5Ext = _html5Ext.concat(aF[item].related);
          }
        }
      }
      _html5Ext = new RegExp('\\.('+_html5Ext.join('|')+')','i');
    }
    mime = (typeof sURL.type !== 'undefined'?sURL.type:null);
    fileExt = (typeof sURL === 'string'?sURL.toLowerCase().match(_html5Ext):null); // TODO: Strip URL queries, etc.
    if (!fileExt || !fileExt.length) {
      if (!mime) {
        return false;
      } else {
        // audio/mp3 -> mp3, result should be known
        offset = mime.indexOf(';');
        fileExt = (offset !== -1?mime.substr(0,offset):mime).substr(6); // strip "audio/X; codecs.."
      }
    } else {
      fileExt = fileExt[0].substr(1); // "mp3", for example
    }
    if (fileExt && typeof _s.html5[fileExt] !== 'undefined') {
      // result known
      return _s.html5[fileExt];
    } else {
      if (!mime) {
        if (fileExt && _s.html5[fileExt]) {
          return _s.html5[fileExt];
        } else {
          // best-case guess, audio/whatever-dot-filename-format-you're-playing
          mime = 'audio/'+fileExt;
        }
      }
      result = _s.html5.canPlayType(mime);
      _s.html5[fileExt] = result;
      // //_s._wD('canPlayType, found result: '+result);
      return result;
    }
  };

  _testHTML5 = function() {
    if (!_s.useHTML5Audio || typeof Audio === 'undefined') {
      return false;
    }
    // double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
    var a = (typeof Audio !== 'undefined' ? (_isOpera ? new Audio(null) : new Audio()) : null), item, support = {}, aF, i, _hasFlash = _detectFlash();
    function _cp(m) {
      var canPlay, i, j, isOK = false;
      if (!a || typeof a.canPlayType !== 'function') {
        return false;
      }
      if (m instanceof Array) {
        // iterate through all mime types, return any successes
        for (i=0, j=m.length; i<j && !isOK; i++) {
          if (_s.html5[m[i]] || a.canPlayType(m[i]).match(_s.html5Test)) {
            isOK = true;
            _s.html5[m[i]] = true;
          }
        }
        return isOK;
      } else {
        canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
        return (canPlay && (canPlay.match(_s.html5Test)?true:false));
      }
    }
    // test all registered formats + codecs
    aF = _s.audioFormats;
    for (item in aF) {
      if (aF.hasOwnProperty(item)) {
        support[item] = _cp(aF[item].type);
        // assign result to related formats, too
        if (aF[item] && aF[item].related) {
          for (i=aF[item].related.length; i--;) {
            _s.html5[aF[item].related[i]] = support[item];
          }
        }
      }
    }
    support.canPlayType = (a?_cp:null);
    _s.html5 = _mixin(_s.html5, support);
    return true;
  };

  _strings = {
    /*
    notReady: 'Not loaded yet - wait for soundManager.onload()/onready()',
    notOK: 'Audio support is not available.',
    appXHTML: _smc + 'createMovie(): appendChild/innerHTML set failed. May be app/xhtml+xml DOM-related.',
    spcWmode: _smc + 'createMovie(): Removing wmode, preventing known SWF loading issue(s)',
    swf404: _sm + ': Verify that %s is a valid path.',
    tryDebug: 'Try ' + _sm + '.debugFlash = true for more security details (output goes to SWF.)',
    checkSWF: 'See SWF output for more debug info.',
    localFail: _sm + ': Non-HTTP page (' + _doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\n//www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
    waitFocus: _sm + ': Special case: Waiting for focus-related event..',
    waitImpatient: _sm + ': Getting impatient, still waiting for Flash%s...',
    waitForever: _sm + ': Waiting indefinitely for Flash (will recover if unblocked)...',
    needFunction: _sm + ': Function object expected for %s',
    badID: 'Warning: Sound ID "%s" should be a string, starting with a non-numeric character',
    noMS: 'MovieStar mode not enabled. Exiting.',
    currentObj: '--- ' + _sm + '._debug(): Current sound objects ---',
    waitEI: _smc + 'initMovie(): Waiting for ExternalInterface call from Flash..',
    waitOnload: _sm + ': Waiting for window.onload()',
    docLoaded: _sm + ': Document already loaded',
    onload: _smc + 'initComplete(): calling soundManager.onload()',
    onloadOK: _sm + '.onload() complete',
    init: '-- ' + _smc + 'init() --',
    didInit: _smc + 'init(): Already called?',
    flashJS: _sm + ': Attempting to call Flash from JS..',
    noPolling: _sm + ': Polling (whileloading()/whileplaying() support) is disabled.',
    secNote: 'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: //www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
    badRemove: 'Warning: Failed to remove flash movie.',
    noPeak: 'Warning: peakData features unsupported for movieStar formats',
    shutdown: _sm + '.disable(): Shutting down',
    queue: _sm + ': Queueing %s handler',
    smFail: _sm + ': Failed to initialise.',
    smError: 'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
    fbTimeout: 'No flash response, applying .'+_s.swfCSS.swfTimedout+' CSS..',
    fbLoaded: 'Flash loaded',
    fbHandler: _smc+'flashBlockHandler()',
    manURL: 'SMSound.load(): Using manually-assigned URL',
    onURL: _sm + '.load(): current URL already assigned.',
    badFV: _sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
    as2loop: 'Note: Setting stream:false so looping can work (flash 8 limitation)',
    noNSLoop: 'Note: Looping not implemented for MovieStar formats',
    needfl9: 'Note: Switching to flash 9, required for MP4 formats.',
    mfTimeout: 'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
    mfOn: 'mobileFlash::enabling on-screen flash repositioning',
    policy: 'Enabling usePolicyFile for data access'
    */
  };

  _str = function() { // o [,items to replace]
    /*
    var args = _slice.call(arguments), // real array, please
    o = args.shift(), // first arg
    str = (_strings && _strings[o]?_strings[o]:''), i, j;
    if (str && args && args.length) {
      for (i = 0, j = args.length; i < j; i++) {
        str = str.replace('%s', args[i]);
      }
    }
    return str;
    */
  };

  _loopFix = function(sOpt) {
    // flash 8 requires stream = false for looping to work
    if (_fV === 8 && sOpt.loops > 1 && sOpt.stream) {
      //_wDS('as2loop');
      sOpt.stream = false;
    }
    return sOpt;
  };

  _policyFix = function(sOpt, sPre) {
    if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
      //_s._wD((sPre?sPre+':':'') + _str('policy'));
      sOpt.usePolicyFile = true;
    }
    return sOpt;
  };

  _complain = function(sMsg) {
    if (typeof console !== 'undefined' && typeof console.warn !== 'undefined') {
      console.warn(sMsg);
    } else {
      //_s._wD(sMsg);
    }
  };

  _doNothing = function() {
    return false;
  };

  _disableObject = function(o) {
    for (var oProp in o) {
      if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
        o[oProp] = _doNothing;
      }
    }
    oProp = null;
  };

  _failSafely = function(bNoDisable) {
    // general failure exception handler
    if (typeof bNoDisable === 'undefined') {
      bNoDisable = false;
    }
    if (_disabled || bNoDisable) {
      //_wDS('smFail', 2);
      _s.disable(bNoDisable);
    }
  };

  _normalizeMovieURL = function(smURL) {
    var urlParams = null;
    if (smURL) {
      if (smURL.match(/\.swf(\?.*)?$/i)) {
        urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
        if (urlParams) {
          return smURL; // assume user knows what they're doing
        }
      } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
        smURL = smURL + '/';
      }
    }
    return (smURL && smURL.lastIndexOf('/') !== - 1?smURL.substr(0, smURL.lastIndexOf('/') + 1):'./') + _s.movieURL;
  };

  _setVersionInfo = function() {
    if (_fV !== 8 && _fV !== 9) {
      //_s._wD(_str('badFV', _fV, _defaultFlashVersion));
      _s.flashVersion = _defaultFlashVersion;
    }
    var isDebug = (_s.debugMode || _s.debugFlash?'_debug.swf':'.swf'); // debug flash movie, if applicable
    if (_s.useHTML5Audio && !_html5Only && _s.audioFormats.mp4.required && _s.flashVersion < 9) {
      //_s._wD(_str('needfl9'));
      _s.flashVersion = 9;
    }
    _fV = _s.flashVersion; // short-hand for internal use
    _s.version = _s.versionNumber + (_html5Only?' (HTML5-only mode)':(_fV === 9?' (AS3/Flash 9)':' (AS2/Flash 8)'));
    // set up default options
    if (_fV > 8) {
      _s.defaultOptions = _mixin(_s.defaultOptions, _s.flash9Options);
      _s.features.buffering = true;
    }
    if (_fV > 8 && _s.useMovieStar) {
      // flash 9+ support for movieStar formats as well as MP3
      _s.defaultOptions = _mixin(_s.defaultOptions, _s.movieStarOptions);
      _s.filePatterns.flash9 = new RegExp('\\.(mp3|' + _s.netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
      _s.mimePattern = _s.netStreamMimeTypes;
      _s.features.movieStar = true;
    } else {
      _s.useMovieStar = false;
      _s.features.movieStar = false;
    }
    _s.filePattern = _s.filePatterns[(_fV !== 8?'flash9':'flash8')];
    _s.movieURL = (_fV === 8?'soundmanager2.swf':'soundmanager2_flash9.swf').replace('.swf',isDebug);
    _s.features.peakData = _s.features.waveformData = _s.features.eqData = (_fV > 8);
  };

  _setPolling = function(bPolling, bHighPerformance) {
    if (!_s.o || !_s.allowPolling) {
      return false;
    }
    _s.o._setPolling(bPolling, bHighPerformance);
  };

  function _initDebug() {
    if (_s.debugURLParam.test(_wl)) {
      _s.debugMode = true; // allow force of debug mode via URL
    }
    /*
    if (_id(_s.debugID)) {
      return false;
    }
    var oD, oDebug, oTarget, oToggle, tmp;
    if (_s.debugMode && !_id(_s.debugID) && ((!_hasConsole || !_s.useConsole) || (_s.useConsole && _hasConsole && !_s.consoleOnly))) {
      oD = _doc.createElement('div');
      oD.id = _s.debugID + '-toggle';
      oToggle = {
        'position': 'fixed',
        'bottom': '0px',
        'right': '0px',
        'width': '1.2em',
        'height': '1.2em',
        'lineHeight': '1.2em',
        'margin': '2px',
        'textAlign': 'center',
        'border': '1px solid #999',
        'cursor': 'pointer',
        'background': '#fff',
        'color': '#333',
        'zIndex': 10001
      };
      oD.appendChild(_doc.createTextNode('-'));
      oD.onclick = _toggleDebug;
      oD.title = 'Toggle SM2 debug console';
      if (_ua.match(/msie 6/i)) {
        oD.style.position = 'absolute';
        oD.style.cursor = 'hand';
      }
      for (tmp in oToggle) {
        if (oToggle.hasOwnProperty(tmp)) {
          oD.style[tmp] = oToggle[tmp];
        }
      }
      oDebug = _doc.createElement('div');
      oDebug.id = _s.debugID;
      oDebug.style.display = (_s.debugMode?'block':'none');
      if (_s.debugMode && !_id(oD.id)) {
        try {
          oTarget = _getDocument();
          oTarget.appendChild(oD);
        } catch(e2) {
          throw new Error(_str('appXHTML'));
        }
        oTarget.appendChild(oDebug);
      }
    }
    oTarget = null;
    */
  }

  _createMovie = function(smID, smURL) {

    var specialCase = null,
    remoteURL = (smURL?smURL:_s.url),
    localURL = (_s.altURL?_s.altURL:remoteURL),
    oEmbed, oMovie, oTarget = _getDocument(), tmp, movieHTML, oEl, extraClass = _getSWFCSS(), s, x, sClass, side = '100%', isRTL = null, html = _doc.getElementsByTagName('html')[0];
    isRTL = (html && html.dir && html.dir.match(/rtl/i));
    smID = (typeof smID === 'undefined'?_s.id:smID);

    if (_didAppend && _appendSuccess) {
      return false; // ignore if already succeeded
    }

    function _initMsg() {
      //_s._wD('-- SoundManager 2 ' + _s.version + (!_html5Only && _s.useHTML5Audio?(_s.hasHTML5?' + HTML5 audio':', no HTML5 audio support'):'') + (!_html5Only ? (_s.useMovieStar?', MovieStar mode':'') + (_s.useHighPerformance?', high performance mode, ':', ') + (( _s.flashPollingInterval ? 'custom (' + _s.flashPollingInterval + 'ms)' : (_s.useFastPolling?'fast':'normal')) + ' polling') + (_s.wmode?', wmode: ' + _s.wmode:'') + (_s.debugFlash?', flash debug mode':'') + (_s.useFlashBlock?', flashBlock mode':'') : '') + ' --', 1);
    }

    if (_html5Only) {
      _setVersionInfo();
      _initMsg();
      _s.oMC = _id(_s.movieID);
      _init();
      // prevent multiple init attempts
      _didAppend = true;
      _appendSuccess = true;
      return false;
    }

    _didAppend = true;

    // safety check for legacy (change to Flash 9 URL)
    _setVersionInfo();
    _s.url = _normalizeMovieURL(_s._overHTTP?remoteURL:localURL);
    smURL = _s.url;

    _s.wmode = (!_s.wmode && _s.useHighPerformance && !_s.useMovieStar?'transparent':_s.wmode);

    if (_s.wmode !== null && (_ua.match(/msie 8/i) || (!_isIE && !_s.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
      _s.specialWmodeCase = true;
      // extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
      // does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
      // wmode breaks IE 8 on Vista + Win7 too in some cases, as of Jan.2011 (?)
      //_wDS('spcWmode');
      _s.wmode = null;
    }

    oEmbed = {
      'name': smID,
      'id': smID,
      'src': smURL,
      'width': side,
      'height': side,
      'quality': 'high',
      'allowScriptAccess': _s.allowScriptAccess,
      'bgcolor': _s.bgColor,
      'pluginspage': _s._http+'//www.macromedia.com/go/getflashplayer',
      'type': 'application/x-shockwave-flash',
      'wmode': _s.wmode,
      'hasPriority': 'true' // //help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
    };

    if (_s.debugFlash) {
      oEmbed.FlashVars = 'debug=1';
    }

    if (!_s.wmode) {
      delete oEmbed.wmode; // don't write empty attribute
    }

    if (_isIE) {
      // IE is "special".
      oMovie = _doc.createElement('div');
      movieHTML = '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="'+_s._http+'//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="' + oEmbed.width + '" height="' + oEmbed.height + '"><param name="movie" value="' + smURL + '" /><param name="AllowScriptAccess" value="' + _s.allowScriptAccess + '" /><param name="quality" value="' + oEmbed.quality + '" />' + (_s.wmode?'<param name="wmode" value="' + _s.wmode + '" /> ':'') + '<param name="bgcolor" value="' + _s.bgColor + '" />' + (_s.debugFlash?'<param name="FlashVars" value="' + oEmbed.FlashVars + '" />':'') + '</object>';
    } else {
      oMovie = _doc.createElement('embed');
      for (tmp in oEmbed) {
        if (oEmbed.hasOwnProperty(tmp)) {
          oMovie.setAttribute(tmp, oEmbed[tmp]);
        }
      }
    }

    _initDebug();
    extraClass = _getSWFCSS();
    oTarget = _getDocument();

    if (oTarget) {
      _s.oMC = _id(_s.movieID)?_id(_s.movieID):_doc.createElement('div');
      if (!_s.oMC.id) {
        _s.oMC.id = _s.movieID;
        _s.oMC.className = _s.swfCSS.swfDefault + ' ' + extraClass;
        // "hide" flash movie
        s = null;
        oEl = null;
        if (!_s.useFlashBlock) {
          if (_s.useHighPerformance) {
            s = {
              'position': 'fixed',
              'width': '8px',
              'height': '8px',
              // >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
              'bottom': '0px',
              'left': '0px',
              'overflow': 'hidden'
            };
          } else {
            s = {
              'position': 'absolute',
              'width': '6px',
              'height': '6px',
              'top': '-9999px',
              'left': '-9999px'
            };
            if (isRTL) {
              s.left = Math.abs(parseInt(s.left,10))+'px';
            }
          }
        }
        if (_isWebkit) {
          _s.oMC.style.zIndex = 10000; // soundcloud-reported render/crash fix, safari 5
        }
        if (!_s.debugFlash) {
          for (x in s) {
            if (s.hasOwnProperty(x)) {
              _s.oMC.style[x] = s[x];
            }
          }
        }
        try {
          if (!_isIE) {
            _s.oMC.appendChild(oMovie);
          }
          oTarget.appendChild(_s.oMC);
          if (_isIE) {
            oEl = _s.oMC.appendChild(_doc.createElement('div'));
            oEl.className = _s.swfCSS.swfBox;
            oEl.innerHTML = movieHTML;
          }
          _appendSuccess = true;
        } catch(e) {
          throw new Error(_str('appXHTML'));
        }
      } else {
        // it's already in the document.
        sClass = _s.oMC.className;
        _s.oMC.className = (sClass?sClass+' ':_s.swfCSS.swfDefault) + (extraClass?' '+extraClass:'');
        _s.oMC.appendChild(oMovie);
        if (_isIE) {
          oEl = _s.oMC.appendChild(_doc.createElement('div'));
          oEl.className = _s.swfCSS.swfBox;
          oEl.innerHTML = movieHTML;
        }
        _appendSuccess = true;
      }
    }

    if (specialCase) {
      //_s._wD(specialCase);
    }

    _initMsg();
    //_s._wD(_smc+'createMovie(): Trying to load ' + smURL + (!_s._overHTTP && _s.altURL?' (alternate URL)':''), 1);

    return true;
  };

  _idCheck = this.getSoundById;

  _initMovie = function() {
    if (_html5Only) {
      _createMovie();
      return false;
    }
    // attempt to get, or create, movie
    if (_s.o) {
      return false; // may already exist
    }
    _s.o = _s.getMovie(_s.id); // inline markup
    if (!_s.o) {
      if (!_oRemoved) {
        // try to create
        _createMovie(_s.id, _s.url);
      } else {
        // try to re-append removed movie after reboot()
        if (!_isIE) {
          _s.oMC.appendChild(_oRemoved);
        } else {
          _s.oMC.innerHTML = _oRemovedHTML;
        }
        _oRemoved = null;
        _didAppend = true;
      }
      _s.o = _s.getMovie(_s.id);
    }
    if (_s.o) {
      //_s._wD(_smc+'initMovie(): Got '+_s.o.nodeName+' element ('+(_didAppend?'created via JS':'static HTML')+')');
      //_wDS('waitEI');
    }
    if (_s.oninitmovie instanceof Function) {
      setTimeout(_s.oninitmovie, 1);
    }
    return true;
  };

  _go = function(sURL) {
    // where it all begins.
    if (sURL) {
      _s.url = sURL;
    }
    _initMovie();
  };

  _delayWaitForEI = function() {
    setTimeout(_waitForEI, 500);
  };

  _waitForEI = function() {
    if (_waitingForEI) {
      return false;
    }
    _waitingForEI = true;
    _event.remove(_win, 'load', _delayWaitForEI);
    if (_tryInitOnFocus && !_isFocused) {
      //_wDS('waitFocus');
      return false;
    }
    var p;
    if (!_didInit) {
      p = _s.getMoviePercent();
      //_s._wD(_str('waitImpatient', (p === 100?' (SWF loaded)':(p > 0?' (SWF ' + p + '% loaded)':''))));
    }
    setTimeout(function() {
      p = _s.getMoviePercent();
      if (!_didInit) {
        //_s._wD(_sm + ': No Flash response within expected time.\nLikely causes: ' + (p === 0?'Loading ' + _s.movieURL + ' may have failed (and/or Flash ' + _fV + '+ not present?), ':'') + 'Flash blocked or JS-Flash security error.' + (_s.debugFlash?' ' + _str('checkSWF'):''), 2);
        if (!_s._overHTTP && p) {
          //_wDS('localFail', 2);
          if (!_s.debugFlash) {
            //_wDS('tryDebug', 2);
          }
        }
        if (p === 0) {
          // if 0 (not null), probably a 404.
          //_s._wD(_str('swf404', _s.url));
        }
        //_debugTS('flashtojs', false, ': Timed out' + _s._overHTTP?' (Check flash security or flash blockers)':' (No plugin/missing SWF?)');
      }
      // give up / time-out, depending
      if (!_didInit && _okToDisable) {
        if (p === null) {
          // SWF failed. Maybe blocked.
          if (_s.useFlashBlock || _s.flashLoadTimeout === 0) {
            if (_s.useFlashBlock) {
              _flashBlockHandler();
            }
            //_wDS('waitForever');
          } else {
            // old SM2 behaviour, simply fail
            _failSafely(true);
          }
        } else {
          // flash loaded? Shouldn't be a blocking issue, then.
          if (_s.flashLoadTimeout === 0) {
             //_wDS('waitForever');
          } else {
            _failSafely(true);
          }
        }
      }
    }, _s.flashLoadTimeout);
  };

  _go = function(sURL) {
    // where it all begins.
    if (sURL) {
      _s.url = sURL;
    }
    _initMovie();
  };

  /*
  _wDS = function(o, errorLevel) {
    if (!o) {
      return '';
    } else {
      return //_s._wD(_str(o), errorLevel);
    }
  };

  if (_wl.indexOf('debug=alert') + 1 && _s.debugMode) {
    _s._wD = function(sText) {window.alert(sText);};
  }

  _toggleDebug = function() {
    var o = _id(_s.debugID),
    oT = _id(_s.debugID + '-toggle');
    if (!o) {
      return false;
    }
    if (_debugOpen) {
      // minimize
      oT.innerHTML = '+';
      o.style.display = 'none';
    } else {
      oT.innerHTML = '-';
      o.style.display = 'block';
    }
    _debugOpen = !_debugOpen;
  };

  _debugTS = function(sEventType, bSuccess, sMessage) {
    // troubleshooter debug hooks
    if (typeof sm2Debugger !== 'undefined') {
      try {
        sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
      } catch(e) {
        // oh well
      }
    }
    return true;
  };
  */

  _getSWFCSS = function() {
    var css = [];
    if (_s.debugMode) {
      css.push(_s.swfCSS.sm2Debug);
    }
    if (_s.debugFlash) {
      css.push(_s.swfCSS.flashDebug);
    }
    if (_s.useHighPerformance) {
      css.push(_s.swfCSS.highPerf);
    }
    return css.join(' ');
  };

  _flashBlockHandler = function() {
    // *possible* flash block situation.
    var name = _str('fbHandler'), p = _s.getMoviePercent(), css = _s.swfCSS;
    if (!_s.ok()) {
      if (_needsFlash) {
        // make the movie more visible, so user can fix
        _s.oMC.className = _getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null?css.swfTimedout:css.swfError);
        //_s._wD(name+': '+_str('fbTimeout')+(p?' ('+_str('fbLoaded')+')':''));
      }
      _s.didFlashBlock = true;
      _processOnEvents({type:'ontimeout',ignoreInit:true}); // fire onready(), complain lightly
      if (_s.onerror instanceof Function) {
        _s.onerror.apply(_win);
      }
    } else {
      // SM2 loaded OK (or recovered)
      if (_s.didFlashBlock) {
        //_s._wD(name+': Unblocked');
      }
      if (_s.oMC) {
        _s.oMC.className = [_getSWFCSS(), css.swfDefault, css.swfLoaded + (_s.didFlashBlock?' '+css.swfUnblocked:'')].join(' ');
      }
    }
  };

  _handleFocus = function() {
    function cleanup() {
      _event.remove(_win, 'focus', _handleFocus);
      _event.remove(_win, 'load', _handleFocus);
    }
    if (_isFocused || !_tryInitOnFocus) {
      cleanup();
      return true;
    }
    _okToDisable = true;
    _isFocused = true;
    //_s._wD(_smc+'handleFocus()');
    if (_isSafari && _tryInitOnFocus) {
      // giant Safari 3.1 hack - assume mousemove = focus given lack of focus event
      _event.remove(_win, 'mousemove', _handleFocus);
    }
    // allow init to restart
    _waitingForEI = false;
    cleanup();
    return true;
  };

  _initComplete = function(bNoDisable) {
    if (_didInit) {
      return false;
    }
    if (_html5Only) {
      // all good.
      //_s._wD('-- SoundManager 2: loaded --');
      _didInit = true;
      _processOnEvents();
      _initUserOnload();
      return true;
    }
    var sClass = _s.oMC.className,
    wasTimeout = (_s.useFlashBlock && _s.flashLoadTimeout && !_s.getMoviePercent());
    if (!wasTimeout) {
      _didInit = true;
    }
    //_s._wD('-- SoundManager 2 ' + (_disabled?'failed to load':'loaded') + ' (' + (_disabled?'security/load error':'OK') + ') --', 1);
    if (_disabled || bNoDisable) {
      if (_s.useFlashBlock) {
        _s.oMC.className = _getSWFCSS() + ' ' + (_s.getMoviePercent() === null?_s.swfCSS.swfTimedout:_s.swfCSS.swfError);
      }
      _processOnEvents({type:'ontimeout'});
      //_debugTS('onload', false);
      if (_s.onerror instanceof Function) {
        _s.onerror.apply(_win);
      }
      return false;
    } else {
      //_debugTS('onload', true);
    }
    _event.add(_win, 'unload', _doNothing); // prevent browser from showing cached state via back button, because flash will be dead
    if (_s.waitForWindowLoad && !_windowLoaded) {
      //_wDS('waitOnload');
      _event.add(_win, 'load', _initUserOnload);
      return false;
    } else {
      if (_s.waitForWindowLoad && _windowLoaded) {
        //_wDS('docLoaded');
      }
      _initUserOnload();
    }
    return true;
  };

  _addOnEvent = function(sType, oMethod, oScope) {
    if (typeof _on_queue[sType] === 'undefined') {
      _on_queue[sType] = [];
    }
    _on_queue[sType].push({
      'method': oMethod,
      'scope': (oScope || null),
      'fired': false
    });
  };

  _processOnEvents = function(oOptions) {
    if (!oOptions) { // assume onready, if unspecified
      oOptions = {
        type: 'onready'
      };
    }
    if (!_didInit && oOptions && !oOptions.ignoreInit) {
      // not ready yet.
      return false;
    }
    var status = {
      success: (oOptions && oOptions.ignoreInit?_s.ok():!_disabled)
    },
    srcQueue = (oOptions && oOptions.type?_on_queue[oOptions.type]||[]:[]), // queue specified by type, or none
    queue = [], i, j,
    canRetry = (_needsFlash && _s.useFlashBlock && !_s.ok());
    for (i = 0; i < srcQueue.length; i++) {
      if (srcQueue[i].fired !== true) {
        queue.push(srcQueue[i]);
      }
    }
    if (queue.length) {
      //_s._wD(_sm + ': Firing ' + queue.length + ' '+oOptions.type+'() item' + (queue.length === 1?'':'s'));
      for (i = 0, j = queue.length; i < j; i++) {
        if (queue[i].scope) {
          queue[i].method.apply(queue[i].scope, [status]);
        } else {
          queue[i].method(status);
        }
        if (!canRetry) { // flashblock case doesn't count here
          queue[i].fired = true;
        }
      }
    }
    return true;
  };

  _initUserOnload = function() {
    _win.setTimeout(function() {
      if (_s.useFlashBlock) {
        _flashBlockHandler();
      }
      _processOnEvents();
      // call user-defined "onload", scoped to window
      if (_s.onload instanceof Function) {
        //_wDS('onload', 1);
        _s.onload.apply(_win);
        //_wDS('onloadOK', 1);
      }
      if (_s.waitForWindowLoad) {
        _event.add(_win, 'load', _initUserOnload);
      }
    },1);
  };

  _detectFlash = function() {

    // hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau - //featureblend.com/javascript-flash-detection-library.html / //featureblend.com/license.txt

    if (_hasFlash !== undefined) {
      // this work has already been done.
      return _hasFlash;
    }

    var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = _win.ActiveXObject;

    if (nP && nP.length) {

      type = 'application/x-shockwave-flash';
      types = n.mimeTypes;
      if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
        hasPlugin = true;
      }

    } else if (typeof AX !== 'undefined') {

      try {
        obj = new AX('ShockwaveFlash.ShockwaveFlash');
      } catch(e) {
        // oh well
      }
      hasPlugin = (!!obj);

    }

    _hasFlash = hasPlugin;

    return hasPlugin;

  };

  _featureCheck = function() {
    var needsFlash, item,
    isSpecial = (_ua.match(/iphone os (1|2|3_0|3_1)/i)?true:false); // iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (iPad) + iOS4 works.
    if (isSpecial) {
      _s.hasHTML5 = false; // has Audio(), but is broken; let it load links directly.
      _html5Only = true; // ignore flash case, however
      if (_s.oMC) {
        _s.oMC.style.display = 'none';
      }
      return false;
    }
    if (_s.useHTML5Audio) {
      if (!_s.html5 || !_s.html5.canPlayType) {
        //_s._wD('SoundManager: No HTML5 Audio() support detected.');
        _s.hasHTML5 = false;
        return true;
      } else {
        _s.hasHTML5 = true;
      }
      if (_isBadSafari) {
        //_s._wD(_smc+'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - '+(!_hasFlash?' would use flash fallback for MP3/MP4, but none detected.':'will use flash fallback for MP3/MP4, if available'),1);
        if (_detectFlash()) {
          return true;
        }
      }
    } else {
      // flash required.
      return true;
    }
    for (item in _s.audioFormats) {
      if (_s.audioFormats.hasOwnProperty(item) && _s.audioFormats[item].required && !_s.html5.canPlayType(_s.audioFormats[item].type)) {
        // may need flash for this format?
        needsFlash = true;
      }
    }
    // sanity check..
    if (_s.ignoreFlash) {
      needsFlash = false;
    }
    _html5Only = (_s.useHTML5Audio && _s.hasHTML5 && !needsFlash && !_s.requireFlash);
    return (_detectFlash() && needsFlash);
  };

  _init = function() {
    var item, tests = [];
    //_wDS('init');

    // called after onload()
    if (_didInit) {
      //_wDS('didInit');
      return false;
    }

    function _cleanup() {
      _event.remove(_win, 'load', _s.beginDelayedInit);
    }

    if (_s.hasHTML5) {
      for (item in _s.audioFormats) {
        if (_s.audioFormats.hasOwnProperty(item)) {
          tests.push(item+': '+_s.html5[item]);
        }
      }
      //_s._wD('-- SoundManager 2: HTML5 support tests ('+_s.html5Test+'): '+tests.join(', ')+' --',1);
    }

    if (_html5Only) {
      if (!_didInit) {
        // we don't need no steenking flash!
        _cleanup();
        _s.enabled = true;
        _initComplete();
      }
      return true;
    }

    // flash path
    _initMovie();
    try {
      //_wDS('flashJS');
      _s.o._externalInterfaceTest(false); // attempt to talk to Flash
      if (!_s.allowPolling) {
        //_wDS('noPolling', 1);
      } else {
        _setPolling(true, _s.flashPollingInterval ? _s.flashPollingInterval : (_s.useFastPolling ? 10 : 50));
      }
      if (!_s.debugMode) {
        _s.o._disableDebug();
      }
      _s.enabled = true;
      //_debugTS('jstoflash', true);
    } catch(e) {
      //_s._wD('js/flash exception: ' + e.toString());
      //_debugTS('jstoflash', false);
      _failSafely(true); // don't disable, for reboot()
      _initComplete();
      return false;
    }
    _initComplete();
    // event cleanup
    _cleanup();
    return true;
  };

  _beginInit = function() {
    if (_initPending) {
      return false;
    }
    _createMovie();
    _initMovie();
    _initPending = true;
    return true;
  };

  _dcLoaded = function() {
    if (_didDCLoaded) {
      return false;
    }
    _didDCLoaded = true;
    _initDebug();
    if (!_s.useHTML5Audio) {
      if (!_detectFlash()) {
        //_s._wD('SoundManager: No Flash detected, trying HTML5');
        _s.useHTML5Audio = true;
      }
    }
    _testHTML5();
    _s.html5.usingFlash = _featureCheck();
    _needsFlash = _s.html5.usingFlash;
    _didDCLoaded = true;
    if (_doc.removeEventListener) {
      _doc.removeEventListener('DOMContentLoaded', _dcLoaded, false);
    }
    _go();
    return true;
  };

  _startTimer = function(oSound) {
    if (!oSound._hasTimer) {
      oSound._hasTimer = true;
    }
  };

  _stopTimer = function(oSound) {
    if (oSound._hasTimer) {
      oSound._hasTimer = false;
    }
  };

  _die = function() {
    if (_s.onerror instanceof Function) {
      _s.onerror();
    }
    _s.disable();
  };

  _badSafariFix = function() {
    // special case: "bad" Safari can fall back to flash for MP3/MP4
    if (!_isBadSafari || !_detectFlash()) {
      return false; // doesn't apply
    }
    var aF = _s.audioFormats, i, item;
    for (item in aF) {
      if (aF.hasOwnProperty(item)) {
        // special case: "bad" Safari can fall back to flash for MP3/MP4
        if (item === 'mp3' || item === 'mp4') {
          //_s._wD(_sm+': Using flash fallback for '+item+' format');
          _s.html5[item] = false;
          // assign result to related formats, too
          if (aF[item] && aF[item].related) {
            for (i = aF[item].related.length; i--;) {
              _s.html5[aF[item].related[i]] = false;
            }
          }
        }
      }
    }
  };

  // pseudo-private methods called by Flash

  this._setSandboxType = function(sandboxType) {
    /*
    var sb = _s.sandbox;
    sb.type = sandboxType;
    sb.description = sb.types[(typeof sb.types[sandboxType] !== 'undefined'?sandboxType:'unknown')];
    //_s._wD('Flash security sandbox type: ' + sb.type);
    if (sb.type === 'localWithFile') {
      sb.noRemote = true;
      sb.noLocal = false;
      //_wDS('secNote', 2);
    } else if (sb.type === 'localWithNetwork') {
      sb.noRemote = false;
      sb.noLocal = true;
    } else if (sb.type === 'localTrusted') {
      sb.noRemote = false;
      sb.noLocal = false;
    }
    */
  };

  this._externalInterfaceOK = function(flashDate) {
    // flash callback confirming flash loaded, EI working etc.
    // flashDate = approx. timing/delay info for JS/flash bridge
    if (_s.swfLoaded) {
      return false;
    }
    var eiTime = new Date().getTime();
    //_s._wD(_smc+'externalInterfaceOK()' + (flashDate?' (~' + (eiTime - flashDate) + ' ms)':''));
    //_debugTS('swf', true);
    //_debugTS('flashtojs', true);
    _s.swfLoaded = true;
    _tryInitOnFocus = false;
    if (_isBadSafari) {
      _badSafariFix();
    }
    if (_isIE) {
      // IE needs a timeout OR delay until window.onload - may need TODO: investigating
      setTimeout(_init, 100);
    } else {
      _init();
    }
  };

  _dcIE = function() {
    if (_doc.readyState === 'complete') {
      _dcLoaded();
      _doc.detachEvent('onreadystatechange', _dcIE);
    }
    return true;
  };

  // focus and window load, init
  if (!_s.hasHTML5 || _needsFlash) {
    // only applies to Flash mode
    _event.add(_win, 'focus', _handleFocus);
    _event.add(_win, 'load', _handleFocus);
    _event.add(_win, 'load', _delayWaitForEI);
    if (_isSafari && _tryInitOnFocus) {
      _event.add(_win, 'mousemove', _handleFocus); // massive Safari focus hack
    }
  }

  if (_doc.addEventListener) {
    _doc.addEventListener('DOMContentLoaded', _dcLoaded, false);
  } else if (_doc.attachEvent) {
    _doc.attachEvent('onreadystatechange', _dcIE);
  } else {
    // no add/attachevent support - safe to assume no JS -> Flash either
    //_debugTS('onload', false);
    _die();
  }

  if (_doc.readyState === 'complete') {
    setTimeout(_dcLoaded,100);
  }

} // SoundManager()

// SM2_DEFER details: //www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading
if (typeof SM2_DEFER === 'undefined' || !SM2_DEFER) {
  soundManager = new SoundManager();
}

// public interfaces
window.SoundManager = SoundManager; // constructor
window.soundManager = soundManager; // public API, flash callbacks etc

}(window));
	soundManager.url = 'js/mylibs/soundmanager2.swf';
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
		if ( $.cookie('muteMusic') != 'mute' ) {
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
// Licensed under the MIT license: //www.opensource.org/licenses/mit-license.php

(function ($, document, window) {
	var
	// ColorBox Default Settings.
	// See //colorpowered.com/colorbox for details.
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

}(jQuery, document, this));window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;console.log(Array.prototype.slice.call(arguments))}};(function(e){function h(){}for(var g="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),f;f=g.pop();){e[f]=e[f]||h}})(window.console=window.console||{});jQuery.cookie=function(c,l,p){if(typeof l!="undefined"||(c&&typeof c!="string")){if(typeof c=="string"){p=p||{};if(l===null){l="";p.expires=-1}var e="";if(p.expires&&(typeof p.expires=="number"||p.expires.toUTCString)){var g;if(typeof p.expires=="number"){g=new Date();g.setTime(g.getTime()+(p.expires*24*60*60*1000))}else{g=p.expires}e="; expires="+g.toUTCString()}var o=p.path?"; path="+(p.path):"";var h=p.domain?"; domain="+(p.domain):"";var a=p.secure?"; secure":"";document.cookie=c+"="+encodeURIComponent(l)+e+o+h+a}else{for(var f in c){jQuery.cookie(f,c[f],l||p)}}}else{var b={};if(document.cookie){var m=document.cookie.split(";");for(var j=0;j<m.length;j++){var d=jQuery.trim(m[j]);if(!c){var k=d.indexOf("=");b[d.substr(0,k)]=decodeURIComponent(d.substr(k+1))}else{if(d.substr(0,c.length+1)==(c+"=")){b=decodeURIComponent(d.substr(c.length+1));break}}}}return b}};(function(c,d){var a=c.document;(function(){var e=false,f=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.JRClass=function(){};JRClass.extend=function(k){var i=this.prototype;e=true;var h=new this();e=false;for(var g in k){h[g]=typeof k[g]=="function"&&typeof i[g]=="function"&&f.test(k[g])?(function(l,m){return function(){var o=this._super;this._super=i[l];var n=m.apply(this,arguments);this._super=o;return n}})(g,k[g]):k[g]}function j(){if(!e&&this.init){this.init.apply(this,arguments)}}j.prototype=h;j.constructor=j;j.extend=arguments.callee;return j}})();var b=JRClass.extend({init:function(f,e){if(typeof f=="string"){this.video=a.getElementById(f)}else{this.video=f}this.video.player=this;this.values={};this.elements={};this.options={autoplay:false,preload:true,useBuiltInControls:false,controlsBelow:false,controlsAtStart:false,controlsHiding:true,defaultVolume:0.85,playerFallbackOrder:["html5","flash","links"],flashPlayer:"htmlObject",flashPlayerVersion:false};if(typeof b.options=="object"){_V_.merge(this.options,b.options)}if(typeof e=="object"){_V_.merge(this.options,e)}if(this.getPreloadAttribute()!==d){this.options.preload=this.getPreloadAttribute()}if(this.getAutoplayAttribute()!==d){this.options.autoplay=this.getAutoplayAttribute()}this.box=this.video.parentNode;this.linksFallback=this.getLinksFallback();this.hideLinksFallback();this.each(this.options.playerFallbackOrder,function(g){if(this[g+"Supported"]()){this[g+"Init"]();return true}});this.activateElement(this,"player");this.activateElement(this.box,"box")},behaviors:{},newBehavior:function(e,f,g){this.behaviors[e]=f;this.extend(g)},activateElement:function(e,f){if(typeof e=="string"){e=a.getElementById(e)}this.behaviors[f].call(this,e)},errors:[],warnings:[],warning:function(e){this.warnings.push(e);this.log(e)},history:[],log:function(f){if(!f){return}if(typeof f=="string"){f={type:f}}if(f.type){this.history.push(f.type)}if(this.history.length>=50){this.history.shift()}try{console.log(f.type)}catch(g){try{opera.postError(f.type)}catch(g){}}},setLocalStorage:function(f,g){if(!localStorage){return}try{localStorage[f]=g}catch(h){if(h.code==22||h.code==1014){this.warning(b.warnings.localStorageFull)}}},getPreloadAttribute:function(){if(typeof this.video.hasAttribute=="function"&&this.video.hasAttribute("preload")){var e=this.video.getAttribute("preload");if(e===""||e==="true"){return"auto"}if(e==="false"){return"none"}return e}},getAutoplayAttribute:function(){if(typeof this.video.hasAttribute=="function"&&this.video.hasAttribute("autoplay")){var e=this.video.getAttribute("autoplay");if(e==="false"){return false}return true}},bufferedPercent:function(){return(this.duration())?this.buffered()[1]/this.duration():0},each:function(e,h){if(!e||e.length===0){return}for(var g=0,f=e.length;g<f;g++){if(h.call(this,e[g],g)){break}}},extend:function(f){for(var e in f){if(f.hasOwnProperty(e)){this[e]=f[e]}}}});b.player=b.prototype;b.player.extend({flashSupported:function(){if(!this.flashElement){this.flashElement=this.getFlashElement()}if(this.flashElement&&this.flashPlayerVersionSupported()){return true}else{return false}},flashInit:function(){this.replaceWithFlash();this.element=this.flashElement;this.video.src="";var e=b.flashPlayers[this.options.flashPlayer];this.extend(b.flashPlayers[this.options.flashPlayer].api);(e.init.context(this))()},getFlashElement:function(){var g=this.video.children;for(var f=0,e=g.length;f<e;f++){if(g[f].className=="vjs-flash-fallback"){return g[f]}}},replaceWithFlash:function(){if(this.flashElement){this.box.insertBefore(this.flashElement,this.video);this.video.style.display="none"}},flashPlayerVersionSupported:function(){var e=(this.options.flashPlayerVersion)?this.options.flashPlayerVersion:b.flashPlayers[this.options.flashPlayer].flashPlayerVersion;return b.getFlashVersion()>=e}});b.flashPlayers={};b.flashPlayers.htmlObject={flashPlayerVersion:9,init:function(){return true},api:{width:function(e){if(e!==d){this.element.width=e;this.box.style.width=e+"px";
this.triggerResizeListeners();return this}return this.element.width},height:function(e){if(e!==d){this.element.height=e;this.box.style.height=e+"px";this.triggerResizeListeners();return this}return this.element.height}}};b.player.extend({linksSupported:function(){return true},linksInit:function(){this.showLinksFallback();this.element=this.video},getLinksFallback:function(){return this.box.getElementsByTagName("P")[0]},hideLinksFallback:function(){if(this.linksFallback){this.linksFallback.style.display="none"}},showLinksFallback:function(){if(this.linksFallback){this.linksFallback.style.display="block"}}});b.merge=function(h,g,f){for(var e in g){if(g.hasOwnProperty(e)&&(!f||!h.hasOwnProperty(e))){h[e]=g[e]}}return h};b.extend=function(e){this.merge(this,e,true)};b.extend({setupAllWhenReady:function(e){b.options=e;b.DOMReady(b.setup)},DOMReady:function(e){b.addToDOMReady(e)},setup:function(g,e){var k=false,j=[],h;if(!g||g=="All"){g=b.getVideoJSTags()}else{if(typeof g!="object"||g.nodeType==1){g=[g];k=true}}for(var f=0;f<g.length;f++){if(typeof g[f]=="string"){h=a.getElementById(g[f])}else{h=g[f]}j.push(new b(h,e))}return(k)?j[0]:j},getVideoJSTags:function(){var g=a.getElementsByTagName("video"),e=[],k;for(var h=0,f=g.length;h<f;h++){k=g[h];if(k.className.indexOf("video-js")!=-1){e.push(k)}}return e},browserSupportsVideo:function(){if(typeof b.videoSupport!="undefined"){return b.videoSupport}b.videoSupport=!!a.createElement("video").canPlayType;return b.videoSupport},getFlashVersion:function(){if(typeof b.flashVersion!="undefined"){return b.flashVersion}var f=0,i;if(typeof navigator.plugins!="undefined"&&typeof navigator.plugins["Shockwave Flash"]=="object"){i=navigator.plugins["Shockwave Flash"].description;if(i&&!(typeof navigator.mimeTypes!="undefined"&&navigator.mimeTypes["application/x-shockwave-flash"]&&!navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin)){f=parseInt(i.match(/^.*\s+([^\s]+)\.[^\s]+\s+[^\s]+$/)[1],10)}}else{if(typeof c.ActiveXObject!="undefined"){try{var g=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");if(g){f=parseInt(g.GetVariable("$version").match(/^[^\s]+\s(\d+)/)[1],10)}}catch(h){}}}b.flashVersion=f;return b.flashVersion},isIE:function(){return !+"\v1"},isIPad:function(){return navigator.userAgent.match(/iPad/i)!==null},isIPhone:function(){return navigator.userAgent.match(/iPhone/i)!==null},isIOS:function(){return b.isIPhone()||b.isIPad()},iOSVersion:function(){var e=navigator.userAgent.match(/OS (\d+)_/i);if(e&&e[1]){return e[1]}},isAndroid:function(){return navigator.userAgent.match(/Android/i)!==null},androidVersion:function(){var e=navigator.userAgent.match(/Android (\d+)\./i);if(e&&e[1]){return e[1]}},warnings:{videoNotReady:"Video is not ready yet (try playing the video first).",localStorageFull:"Local Storage is Full"}});if(b.isIE()){a.createElement("video")}c.VideoJS=c._V_=b;b.player.extend({html5Supported:function(){if(b.browserSupportsVideo()&&this.canPlaySource()){return true}else{return false}},html5Init:function(){this.element=this.video;this.fixPreloading();this.supportProgressEvents();this.volume((localStorage&&localStorage.volume)||this.options.defaultVolume);if(b.isIOS()){this.options.useBuiltInControls=true;this.iOSInterface()}else{if(b.isAndroid()){this.options.useBuiltInControls=true;this.androidInterface()}}if(!this.options.useBuiltInControls){this.video.controls=false;if(this.options.controlsBelow){_V_.addClass(this.box,"vjs-controls-below")}this.activateElement(this.video,"playToggle");this.buildStylesCheckDiv();this.buildAndActivatePoster();this.buildBigPlayButton();this.buildAndActivateSpinner();this.buildAndActivateControlBar();this.loadInterface();this.getSubtitles()}},canPlaySource:function(){if(this.canPlaySourceResult){return this.canPlaySourceResult}var h=this.video.children;for(var g=0,f=h.length;g<f;g++){if(h[g].tagName.toUpperCase()=="SOURCE"){var e=this.video.canPlayType(h[g].type)||this.canPlayExt(h[g].src);if(e=="probably"||e=="maybe"){this.firstPlayableSource=h[g];
this.canPlaySourceResult=true;return true}}}this.canPlaySourceResult=false;return false},canPlayExt:function(g){if(!g){return""}var e=g.match(/\.([^\.]+)$/);if(e&&e[1]){var f=e[1].toLowerCase();if(b.isAndroid()){if(f=="mp4"||f=="m4v"){return"maybe"}}else{if(b.isIOS()){if(f=="m3u8"){return"maybe"}}}}return""},forceTheSource:function(){this.video.src=this.firstPlayableSource.src;this.video.load()},fixPreloading:function(){if(typeof this.video.hasAttribute=="function"&&this.video.hasAttribute("preload")&&this.video.preload!="none"){this.video.autobuffer=true}else{this.video.autobuffer=false;this.video.preload="none"}},supportProgressEvents:function(f){_V_.addListener(this.video,"progress",this.playerOnVideoProgress.context(this))},playerOnVideoProgress:function(e){this.setBufferedFromProgress(e)},setBufferedFromProgress:function(f){if(f.total>0){var e=(f.loaded/f.total)*this.duration();if(e>this.values.bufferEnd){this.values.bufferEnd=e}}},iOSInterface:function(){if(b.iOSVersion()<4){this.forceTheSource()}if(b.isIPad()){this.buildAndActivateSpinner()}},androidInterface:function(){this.forceTheSource();_V_.addListener(this.video,"click",function(){this.play()});this.buildBigPlayButton();_V_.addListener(this.bigPlayButton,"click",function(){this.play()}.context(this));this.positionBox();this.showBigPlayButtons()},loadInterface:function(){if(!this.stylesHaveLoaded()){if(!this.positionRetries){this.positionRetries=1}if(this.positionRetries++<100){setTimeout(this.loadInterface.context(this),10);return}}this.hideStylesCheckDiv();this.showPoster();if(this.video.paused!==false){this.showBigPlayButtons()}if(this.options.controlsAtStart){this.showControlBars()}this.positionAll()},buildAndActivateControlBar:function(){this.controls=_V_.createElement("div",{className:"vjs-controls"});this.box.appendChild(this.controls);this.activateElement(this.controls,"controlBar");this.activateElement(this.controls,"mouseOverVideoReporter");this.playControl=_V_.createElement("div",{className:"vjs-play-control",innerHTML:"<span></span>"});this.controls.appendChild(this.playControl);this.activateElement(this.playControl,"playToggle");this.progressControl=_V_.createElement("div",{className:"vjs-progress-control"});this.controls.appendChild(this.progressControl);this.progressHolder=_V_.createElement("div",{className:"vjs-progress-holder"});this.progressControl.appendChild(this.progressHolder);this.activateElement(this.progressHolder,"currentTimeScrubber");this.loadProgressBar=_V_.createElement("div",{className:"vjs-load-progress"});this.progressHolder.appendChild(this.loadProgressBar);this.activateElement(this.loadProgressBar,"loadProgressBar");this.playProgressBar=_V_.createElement("div",{className:"vjs-play-progress"});this.progressHolder.appendChild(this.playProgressBar);this.activateElement(this.playProgressBar,"playProgressBar");this.timeControl=_V_.createElement("div",{className:"vjs-time-control"});this.controls.appendChild(this.timeControl);this.currentTimeDisplay=_V_.createElement("span",{className:"vjs-current-time-display",innerHTML:"00:00"});this.timeControl.appendChild(this.currentTimeDisplay);this.activateElement(this.currentTimeDisplay,"currentTimeDisplay");this.timeSeparator=_V_.createElement("span",{innerHTML:" / "});this.timeControl.appendChild(this.timeSeparator);this.durationDisplay=_V_.createElement("span",{className:"vjs-duration-display",innerHTML:"00:00"});this.timeControl.appendChild(this.durationDisplay);this.activateElement(this.durationDisplay,"durationDisplay");this.volumeControl=_V_.createElement("div",{className:"vjs-volume-control",innerHTML:"<div><span></span><span></span><span></span><span></span><span></span><span></span></div>"});this.controls.appendChild(this.volumeControl);this.activateElement(this.volumeControl,"volumeScrubber");this.volumeDisplay=this.volumeControl.children[0];this.activateElement(this.volumeDisplay,"volumeDisplay");this.fullscreenControl=_V_.createElement("div",{className:"vjs-fullscreen-control",innerHTML:"<div><span></span><span></span><span></span><span></span></div>"});
this.controls.appendChild(this.fullscreenControl);this.activateElement(this.fullscreenControl,"fullscreenToggle")},buildAndActivatePoster:function(){this.updatePosterSource();if(this.video.poster){this.poster=a.createElement("img");this.box.appendChild(this.poster);this.poster.src=this.video.poster;this.poster.className="vjs-poster";this.activateElement(this.poster,"poster")}else{this.poster=false}},buildBigPlayButton:function(){this.bigPlayButton=_V_.createElement("div",{className:"vjs-big-play-button",innerHTML:"<span></span>"});this.box.appendChild(this.bigPlayButton);this.activateElement(this.bigPlayButton,"bigPlayButton")},buildAndActivateSpinner:function(){this.spinner=_V_.createElement("div",{className:"vjs-spinner",innerHTML:"<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>"});this.box.appendChild(this.spinner);this.activateElement(this.spinner,"spinner")},buildStylesCheckDiv:function(){this.stylesCheckDiv=_V_.createElement("div",{className:"vjs-styles-check"});this.stylesCheckDiv.style.position="absolute";this.box.appendChild(this.stylesCheckDiv)},hideStylesCheckDiv:function(){this.stylesCheckDiv.style.display="none"},stylesHaveLoaded:function(){if(this.stylesCheckDiv.offsetHeight!=5){return false}else{return true}},positionAll:function(){this.positionBox();this.positionControlBars();this.positionPoster()},positionBox:function(){if(this.videoIsFullScreen){this.box.style.width="";this.element.style.height="";if(this.options.controlsBelow){this.box.style.height="";this.element.style.height=(this.box.offsetHeight-this.controls.offsetHeight)+"px"}}else{this.box.style.width=this.width()+"px";this.element.style.height=this.height()+"px";if(this.options.controlsBelow){this.element.style.height=""}}},getSubtitles:function(){var f=this.video.getElementsByTagName("TRACK");for(var g=0,e=f.length;g<e;g++){if(f[g].getAttribute("kind")=="subtitles"&&f[g].getAttribute("src")){this.subtitlesSource=f[g].getAttribute("src");this.loadSubtitles();this.buildSubtitles()}}},loadSubtitles:function(){_V_.get(this.subtitlesSource,this.parseSubtitles.context(this))},parseSubtitles:function(g){var f=g.split("\n"),e="",k,m,n;this.subtitles=[];this.currentSubtitle=false;this.lastSubtitleIndex=0;for(var l=0;l<f.length;l++){e=_V_.trim(f[l]);if(e){k={id:e,index:this.subtitles.length};e=_V_.trim(f[++l]);m=e.split(" --> ");k.start=this.parseSubtitleTime(m[0]);k.end=this.parseSubtitleTime(m[1]);n=[];for(var h=l;h<f.length;h++){e=_V_.trim(f[++l]);if(!e){break}n.push(e)}k.text=n.join("<br/>");this.subtitles.push(k)}}},parseSubtitleTime:function(e){var g=e.split(":"),f=0;f+=parseFloat(g[0])*60*60;f+=parseFloat(g[1])*60;var h=g[2].split(/\.|,/);f+=parseFloat(h[0]);ms=parseFloat(h[1]);if(ms){f+=ms/1000}return f},buildSubtitles:function(){this.subtitlesDisplay=_V_.createElement("div",{className:"vjs-subtitles"});this.box.appendChild(this.subtitlesDisplay);this.activateElement(this.subtitlesDisplay,"subtitlesDisplay")},addVideoListener:function(f,e){_V_.addListener(this.video,f,e.rEvtContext(this))},play:function(){this.video.play();return this},onPlay:function(e){this.addVideoListener("play",e);return this},pause:function(){this.video.pause();return this},onPause:function(e){this.addVideoListener("pause",e);return this},paused:function(){return this.video.paused},currentTime:function(g){if(g!==d){try{this.video.currentTime=g}catch(f){this.warning(b.warnings.videoNotReady)}this.values.currentTime=g;return this}return this.video.currentTime},onCurrentTimeUpdate:function(e){this.currentTimeListeners.push(e)},duration:function(){return this.video.duration},buffered:function(){if(this.values.bufferStart===d){this.values.bufferStart=0;this.values.bufferEnd=0}if(this.video.buffered&&this.video.buffered.length>0){var e=this.video.buffered.end(0);if(e>this.values.bufferEnd){this.values.bufferEnd=e}}return[this.values.bufferStart,this.values.bufferEnd]},volume:function(e){if(e!==d){this.values.volume=Math.max(0,Math.min(1,parseFloat(e)));
this.video.volume=this.values.volume;this.setLocalStorage("volume",this.values.volume);return this}if(this.values.volume){return this.values.volume}return this.video.volume},onVolumeChange:function(e){_V_.addListener(this.video,"volumechange",e.rEvtContext(this))},width:function(e){if(e!==d){this.video.width=e;this.box.style.width=e+"px";this.triggerResizeListeners();return this}return this.video.offsetWidth},height:function(e){if(e!==d){this.video.height=e;this.box.style.height=e+"px";this.triggerResizeListeners();return this}return this.video.offsetHeight},supportsFullScreen:function(){if(typeof this.video.webkitEnterFullScreen=="function"){if(!navigator.userAgent.match("Chrome")&&!navigator.userAgent.match("Mac OS X 10.5")){return true}}return false},html5EnterNativeFullScreen:function(){try{this.video.webkitEnterFullScreen()}catch(f){if(f.code==11){this.warning(b.warnings.videoNotReady)}}return this},enterFullScreen:function(){if(this.supportsFullScreen()){this.html5EnterNativeFullScreen()}else{this.enterFullWindow()}},exitFullScreen:function(){if(this.supportsFullScreen()){}else{this.exitFullWindow()}},enterFullWindow:function(){this.videoIsFullScreen=true;this.docOrigOverflow=a.documentElement.style.overflow;_V_.addListener(a,"keydown",this.fullscreenOnEscKey.rEvtContext(this));_V_.addListener(c,"resize",this.fullscreenOnWindowResize.rEvtContext(this));a.documentElement.style.overflow="hidden";_V_.addClass(this.box,"vjs-fullscreen");this.positionAll()},exitFullWindow:function(){this.videoIsFullScreen=false;a.removeEventListener("keydown",this.fullscreenOnEscKey,false);c.removeEventListener("resize",this.fullscreenOnWindowResize,false);a.documentElement.style.overflow=this.docOrigOverflow;_V_.removeClass(this.box,"vjs-fullscreen");this.positionAll()},onError:function(e){this.addVideoListener("error",e);return this},onEnded:function(e){this.addVideoListener("ended",e);return this}});b.player.newBehavior("player",function(e){this.onError(this.playerOnVideoError);this.onPlay(this.playerOnVideoPlay);this.onPlay(this.trackCurrentTime);this.onPause(this.playerOnVideoPause);this.onPause(this.stopTrackingCurrentTime);this.onEnded(this.playerOnVideoEnded);this.trackBuffered();this.onBufferedUpdate(this.isBufferFull)},{playerOnVideoError:function(e){this.log(e);this.log(this.video.error)},playerOnVideoPlay:function(e){this.hasPlayed=true},playerOnVideoPause:function(e){},playerOnVideoEnded:function(e){this.currentTime(0);this.pause()},trackBuffered:function(){this.bufferedInterval=setInterval(this.triggerBufferedListeners.context(this),500)},stopTrackingBuffered:function(){clearInterval(this.bufferedInterval)},bufferedListeners:[],onBufferedUpdate:function(e){this.bufferedListeners.push(e)},triggerBufferedListeners:function(){this.isBufferFull();this.each(this.bufferedListeners,function(e){(e.context(this))()})},isBufferFull:function(){if(this.bufferedPercent()==1){this.stopTrackingBuffered()}},trackCurrentTime:function(){if(this.currentTimeInterval){clearInterval(this.currentTimeInterval)}this.currentTimeInterval=setInterval(this.triggerCurrentTimeListeners.context(this),100);this.trackingCurrentTime=true},stopTrackingCurrentTime:function(){clearInterval(this.currentTimeInterval);this.trackingCurrentTime=false},currentTimeListeners:[],triggerCurrentTimeListeners:function(e,f){this.each(this.currentTimeListeners,function(g){(g.context(this))(f||this.currentTime())})},resizeListeners:[],onResize:function(e){this.resizeListeners.push(e)},triggerResizeListeners:function(){this.each(this.resizeListeners,function(e){(e.context(this))()})}});b.player.newBehavior("mouseOverVideoReporter",function(e){_V_.addListener(e,"mousemove",this.mouseOverVideoReporterOnMouseMove.context(this));_V_.addListener(e,"mouseout",this.mouseOverVideoReporterOnMouseOut.context(this))},{mouseOverVideoReporterOnMouseMove:function(){this.showControlBars();clearInterval(this.mouseMoveTimeout);this.mouseMoveTimeout=setTimeout(this.hideControlBars.context(this),4000)
},mouseOverVideoReporterOnMouseOut:function(f){var e=f.relatedTarget;while(e&&e!==this.box){e=e.parentNode}if(e!==this.box){this.hideControlBars()}}});b.player.newBehavior("box",function(e){this.positionBox();_V_.addClass(e,"vjs-paused");this.activateElement(e,"mouseOverVideoReporter");this.onPlay(this.boxOnVideoPlay);this.onPause(this.boxOnVideoPause)},{boxOnVideoPlay:function(){_V_.removeClass(this.box,"vjs-paused");_V_.addClass(this.box,"vjs-playing")},boxOnVideoPause:function(){_V_.removeClass(this.box,"vjs-playing");_V_.addClass(this.box,"vjs-paused")}});b.player.newBehavior("poster",function(e){this.activateElement(e,"mouseOverVideoReporter");this.activateElement(e,"playButton");this.onPlay(this.hidePoster);this.onEnded(this.showPoster);this.onResize(this.positionPoster)},{showPoster:function(){if(!this.poster){return}this.poster.style.display="block";this.positionPoster()},positionPoster:function(){if(!this.poster||this.poster.style.display=="none"){return}this.poster.style.height=this.height()+"px";this.poster.style.width=this.width()+"px"},hidePoster:function(){if(!this.poster){return}this.poster.style.display="none"},updatePosterSource:function(){if(!this.video.poster){var e=this.video.getElementsByTagName("img");if(e.length>0){this.video.poster=e[0].src}}}});b.player.newBehavior("controlBar",function(e){if(!this.controlBars){this.controlBars=[];this.onResize(this.positionControlBars)}this.controlBars.push(e);_V_.addListener(e,"mousemove",this.onControlBarsMouseMove.context(this));_V_.addListener(e,"mouseout",this.onControlBarsMouseOut.context(this))},{showControlBars:function(){if(!this.options.controlsAtStart&&!this.hasPlayed){return}this.each(this.controlBars,function(e){e.style.display="block"})},positionControlBars:function(){this.updatePlayProgressBars();this.updateLoadProgressBars()},hideControlBars:function(){if(this.options.controlsHiding&&!this.mouseIsOverControls){this.each(this.controlBars,function(e){e.style.display="none"})}},onControlBarsMouseMove:function(){this.mouseIsOverControls=true},onControlBarsMouseOut:function(e){this.mouseIsOverControls=false}});b.player.newBehavior("playToggle",function(e){if(!this.elements.playToggles){this.elements.playToggles=[];this.onPlay(this.playTogglesOnPlay);this.onPause(this.playTogglesOnPause)}this.elements.playToggles.push(e);_V_.addListener(e,"click",this.onPlayToggleClick.context(this))},{onPlayToggleClick:function(e){if(this.paused()){this.play()}else{this.pause()}},playTogglesOnPlay:function(e){this.each(this.elements.playToggles,function(f){_V_.removeClass(f,"vjs-paused");_V_.addClass(f,"vjs-playing")})},playTogglesOnPause:function(e){this.each(this.elements.playToggles,function(f){_V_.removeClass(f,"vjs-playing");_V_.addClass(f,"vjs-paused")})}});b.player.newBehavior("playButton",function(e){_V_.addListener(e,"click",this.onPlayButtonClick.context(this))},{onPlayButtonClick:function(e){this.play()}});b.player.newBehavior("pauseButton",function(e){_V_.addListener(e,"click",this.onPauseButtonClick.context(this))},{onPauseButtonClick:function(e){this.pause()}});b.player.newBehavior("playProgressBar",function(e){if(!this.playProgressBars){this.playProgressBars=[];this.onCurrentTimeUpdate(this.updatePlayProgressBars)}this.playProgressBars.push(e)},{updatePlayProgressBars:function(f){var e=(f!==d)?f/this.duration():this.currentTime()/this.duration();if(isNaN(e)){e=0}this.each(this.playProgressBars,function(g){if(g.style){g.style.width=_V_.round(e*100,2)+"%"}})}});b.player.newBehavior("loadProgressBar",function(e){if(!this.loadProgressBars){this.loadProgressBars=[]}this.loadProgressBars.push(e);this.onBufferedUpdate(this.updateLoadProgressBars)},{updateLoadProgressBars:function(){this.each(this.loadProgressBars,function(e){if(e.style){e.style.width=_V_.round(this.bufferedPercent()*100,2)+"%"}})}});b.player.newBehavior("currentTimeDisplay",function(e){if(!this.currentTimeDisplays){this.currentTimeDisplays=[];this.onCurrentTimeUpdate(this.updateCurrentTimeDisplays)}this.currentTimeDisplays.push(e)
},{updateCurrentTimeDisplays:function(e){if(!this.currentTimeDisplays){return}var f=(e)?e:this.currentTime();this.each(this.currentTimeDisplays,function(g){g.innerHTML=_V_.formatTime(f)})}});b.player.newBehavior("durationDisplay",function(e){if(!this.durationDisplays){this.durationDisplays=[];this.onCurrentTimeUpdate(this.updateDurationDisplays)}this.durationDisplays.push(e)},{updateDurationDisplays:function(){if(!this.durationDisplays){return}this.each(this.durationDisplays,function(e){if(this.duration()){e.innerHTML=_V_.formatTime(this.duration())}})}});b.player.newBehavior("currentTimeScrubber",function(e){_V_.addListener(e,"mousedown",this.onCurrentTimeScrubberMouseDown.rEvtContext(this))},{onCurrentTimeScrubberMouseDown:function(e,f){e.preventDefault();this.currentScrubber=f;this.stopTrackingCurrentTime();this.videoWasPlaying=!this.paused();this.pause();_V_.blockTextSelection();this.setCurrentTimeWithScrubber(e);_V_.addListener(a,"mousemove",this.onCurrentTimeScrubberMouseMove.rEvtContext(this));_V_.addListener(a,"mouseup",this.onCurrentTimeScrubberMouseUp.rEvtContext(this))},onCurrentTimeScrubberMouseMove:function(e){this.setCurrentTimeWithScrubber(e)},onCurrentTimeScrubberMouseUp:function(e){_V_.unblockTextSelection();a.removeEventListener("mousemove",this.onCurrentTimeScrubberMouseMove,false);a.removeEventListener("mouseup",this.onCurrentTimeScrubberMouseUp,false);if(this.videoWasPlaying){this.play();this.trackCurrentTime()}},setCurrentTimeWithScrubber:function(f){var g=_V_.getRelativePosition(f.pageX,this.currentScrubber);var e=g*this.duration();this.triggerCurrentTimeListeners(0,e);if(e==this.duration()){e=e-0.1}this.currentTime(e)}});b.player.newBehavior("volumeDisplay",function(e){if(!this.volumeDisplays){this.volumeDisplays=[];this.onVolumeChange(this.updateVolumeDisplays)}this.volumeDisplays.push(e);this.updateVolumeDisplay(e)},{updateVolumeDisplays:function(){if(!this.volumeDisplays){return}this.each(this.volumeDisplays,function(e){this.updateVolumeDisplay(e)})},updateVolumeDisplay:function(f){var e=Math.ceil(this.volume()*6);this.each(f.children,function(h,g){if(g<e){_V_.addClass(h,"vjs-volume-level-on")}else{_V_.removeClass(h,"vjs-volume-level-on")}})}});b.player.newBehavior("volumeScrubber",function(e){_V_.addListener(e,"mousedown",this.onVolumeScrubberMouseDown.rEvtContext(this))},{onVolumeScrubberMouseDown:function(e,f){_V_.blockTextSelection();this.currentScrubber=f;this.setVolumeWithScrubber(e);_V_.addListener(a,"mousemove",this.onVolumeScrubberMouseMove.rEvtContext(this));_V_.addListener(a,"mouseup",this.onVolumeScrubberMouseUp.rEvtContext(this))},onVolumeScrubberMouseMove:function(e){this.setVolumeWithScrubber(e)},onVolumeScrubberMouseUp:function(e){this.setVolumeWithScrubber(e);_V_.unblockTextSelection();a.removeEventListener("mousemove",this.onVolumeScrubberMouseMove,false);a.removeEventListener("mouseup",this.onVolumeScrubberMouseUp,false)},setVolumeWithScrubber:function(e){var f=_V_.getRelativePosition(e.pageX,this.currentScrubber);this.volume(f)}});b.player.newBehavior("fullscreenToggle",function(e){_V_.addListener(e,"click",this.onFullscreenToggleClick.context(this))},{onFullscreenToggleClick:function(e){if(!this.videoIsFullScreen){this.enterFullScreen()}else{this.exitFullScreen()}},fullscreenOnWindowResize:function(e){this.positionControlBars()},fullscreenOnEscKey:function(e){if(e.keyCode==27){this.exitFullScreen()}}});b.player.newBehavior("bigPlayButton",function(e){if(!this.elements.bigPlayButtons){this.elements.bigPlayButtons=[];this.onPlay(this.bigPlayButtonsOnPlay);this.onEnded(this.bigPlayButtonsOnEnded)}this.elements.bigPlayButtons.push(e);this.activateElement(e,"playButton")},{bigPlayButtonsOnPlay:function(e){this.hideBigPlayButtons()},bigPlayButtonsOnEnded:function(e){this.showBigPlayButtons()},showBigPlayButtons:function(){this.each(this.elements.bigPlayButtons,function(e){e.style.display="block"})},hideBigPlayButtons:function(){this.each(this.elements.bigPlayButtons,function(e){e.style.display="none"
})}});b.player.newBehavior("spinner",function(e){if(!this.spinners){this.spinners=[];_V_.addListener(this.video,"loadeddata",this.spinnersOnVideoLoadedData.context(this));_V_.addListener(this.video,"loadstart",this.spinnersOnVideoLoadStart.context(this));_V_.addListener(this.video,"seeking",this.spinnersOnVideoSeeking.context(this));_V_.addListener(this.video,"seeked",this.spinnersOnVideoSeeked.context(this));_V_.addListener(this.video,"canplay",this.spinnersOnVideoCanPlay.context(this));_V_.addListener(this.video,"canplaythrough",this.spinnersOnVideoCanPlayThrough.context(this));_V_.addListener(this.video,"waiting",this.spinnersOnVideoWaiting.context(this));_V_.addListener(this.video,"stalled",this.spinnersOnVideoStalled.context(this));_V_.addListener(this.video,"suspend",this.spinnersOnVideoSuspend.context(this));_V_.addListener(this.video,"playing",this.spinnersOnVideoPlaying.context(this));_V_.addListener(this.video,"timeupdate",this.spinnersOnVideoTimeUpdate.context(this))}this.spinners.push(e)},{showSpinners:function(){this.each(this.spinners,function(e){e.style.display="block"});clearInterval(this.spinnerInterval);this.spinnerInterval=setInterval(this.rotateSpinners.context(this),100)},hideSpinners:function(){this.each(this.spinners,function(e){e.style.display="none"});clearInterval(this.spinnerInterval)},spinnersRotated:0,rotateSpinners:function(){this.each(this.spinners,function(e){e.style.WebkitTransform="scale(0.5) rotate("+this.spinnersRotated+"deg)";e.style.MozTransform="scale(0.5) rotate("+this.spinnersRotated+"deg)"});if(this.spinnersRotated==360){this.spinnersRotated=0}this.spinnersRotated+=45},spinnersOnVideoLoadedData:function(e){this.hideSpinners()},spinnersOnVideoLoadStart:function(e){this.showSpinners()},spinnersOnVideoSeeking:function(e){},spinnersOnVideoSeeked:function(e){},spinnersOnVideoCanPlay:function(e){},spinnersOnVideoCanPlayThrough:function(e){this.hideSpinners()},spinnersOnVideoWaiting:function(e){this.showSpinners()},spinnersOnVideoStalled:function(e){},spinnersOnVideoSuspend:function(e){},spinnersOnVideoPlaying:function(e){this.hideSpinners()},spinnersOnVideoTimeUpdate:function(e){if(this.spinner.style.display=="block"){this.hideSpinners()}}});b.player.newBehavior("subtitlesDisplay",function(e){if(!this.subtitleDisplays){this.subtitleDisplays=[];this.onCurrentTimeUpdate(this.subtitleDisplaysOnVideoTimeUpdate);this.onEnded(function(){this.lastSubtitleIndex=0}.context(this))}this.subtitleDisplays.push(e)},{subtitleDisplaysOnVideoTimeUpdate:function(h){if(this.subtitles){if(!this.currentSubtitle||this.currentSubtitle.start>=h||this.currentSubtitle.end<h){var g=false,e=(this.subtitles[this.lastSubtitleIndex].start>h),f=this.lastSubtitleIndex-(e)?1:0;while(true){if(e){if(f<0||this.subtitles[f].end<h){break}if(this.subtitles[f].start<h){g=f;break}f--}else{if(f>=this.subtitles.length||this.subtitles[f].start>h){break}if(this.subtitles[f].end>h){g=f;break}f++}}if(g!==false){this.currentSubtitle=this.subtitles[g];this.lastSubtitleIndex=g;this.updateSubtitleDisplays(this.currentSubtitle.text)}else{if(this.currentSubtitle){this.currentSubtitle=false;this.updateSubtitleDisplays("")}}}}},updateSubtitleDisplays:function(e){this.each(this.subtitleDisplays,function(f){f.innerHTML=e})}});b.extend({addClass:function(e,f){if((" "+e.className+" ").indexOf(" "+f+" ")==-1){e.className=e.className===""?f:e.className+" "+f}},removeClass:function(f,e){if(f.className.indexOf(e)==-1){return}var g=f.className.split(/\s+/);g.splice(g.lastIndexOf(e),1);f.className=g.join(" ")},createElement:function(f,e){return this.merge(a.createElement(f),e)},blockTextSelection:function(){a.body.focus();a.onselectstart=function(){return false}},unblockTextSelection:function(){a.onselectstart=function(){return true}},formatTime:function(f){var g=Math.round(f);var e=Math.floor(g/60);e=(e>=10)?e:"0"+e;g=Math.floor(g%60);g=(g>=10)?g:"0"+g;return e+":"+g},getRelativePosition:function(f,e){return Math.max(0,Math.min(1,(f-this.findPosX(e))/e.offsetWidth))
},findPosX:function(e){var f=e.offsetLeft;while(e=e.offsetParent){f+=e.offsetLeft}return f},getComputedStyleValue:function(e,f){return c.getComputedStyle(e,null).getPropertyValue(f)},round:function(e,f){if(!f){f=0}return Math.round(e*Math.pow(10,f))/Math.pow(10,f)},addListener:function(e,g,f){if(e.addEventListener){e.addEventListener(g,f,false)}else{if(e.attachEvent){e.attachEvent("on"+g,f)}}},removeListener:function(e,g,f){if(e.removeEventListener){e.removeEventListener(g,f,false)}else{if(e.attachEvent){e.detachEvent("on"+g,f)}}},get:function(e,g){if(typeof XMLHttpRequest=="undefined"){XMLHttpRequest=function(){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(j){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(i){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(h){}throw new Error("This browser does not support XMLHttpRequest.")}}var f=new XMLHttpRequest();f.open("GET",e);f.onreadystatechange=function(){if(f.readyState==4&&f.status==200){g(f.responseText)}}.context(this);f.send()},trim:function(e){return e.toString().replace(/^\s+/,"").replace(/\s+$/,"")},bindDOMReady:function(){if(a.readyState==="complete"){return b.onDOMReady()}if(a.addEventListener){a.addEventListener("DOMContentLoaded",b.DOMContentLoaded,false);c.addEventListener("load",b.onDOMReady,false)}else{if(a.attachEvent){a.attachEvent("onreadystatechange",b.DOMContentLoaded);c.attachEvent("onload",b.onDOMReady)}}},DOMContentLoaded:function(){if(a.addEventListener){a.removeEventListener("DOMContentLoaded",b.DOMContentLoaded,false);b.onDOMReady()}else{if(a.attachEvent){if(a.readyState==="complete"){a.detachEvent("onreadystatechange",b.DOMContentLoaded);b.onDOMReady()}}}},DOMReadyList:[],addToDOMReady:function(e){if(b.DOMIsReady){e.call(a)}else{b.DOMReadyList.push(e)}},DOMIsReady:false,onDOMReady:function(){if(b.DOMIsReady){return}if(!a.body){return setTimeout(b.onDOMReady,13)}b.DOMIsReady=true;if(b.DOMReadyList){for(var e=0;e<b.DOMReadyList.length;e++){b.DOMReadyList[e].call(a)}b.DOMReadyList=null}}});b.bindDOMReady();Function.prototype.context=function(f){var g=this,e=function(){return g.apply(f,arguments)};return e};Function.prototype.evtContext=function(f){var g=this,e=function(){var h=this;return g.call(f,arguments[0],h)};return e};Function.prototype.rEvtContext=function(g,e){if(this.hasContext===true){return this}if(!e){e=g}for(var f in e){if(e[f]==this){e[f]=this.evtContext(g);e[f].hasContext=true;return e[f]}}return this.evtContext(g)};if(c.jQuery){(function(e){e.fn.VideoJS=function(f){this.each(function(){b.setup(this,f)});return this};e.fn.player=function(){return this[0].player}})(jQuery)}c.VideoJS=c._V_=b})(window);