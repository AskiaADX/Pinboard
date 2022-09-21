(function ($) {
	"use strict";

	/**
	* Extend the jQuery with the method adcStatementList
	* Should be call on the container of the statement list
	*
	*     // Single closed question
	*     $('#adc_1').adcStatementList({
	*         iterations : [
	*           { id : 'U1', caption : "Iteration 1" },
	*           { id : 'U3', caption : "Iteration 2" },
	*           { id : 'U5', caption : "Iteration 3" }
	*         ]
	*     });
	*
	*     // Multi-coded question
	*     $('#adc_1').adcStatementList({
	*         isMultiple : true,
	*         iterations : [
	*           { id : 'L1', caption : "Iteration 1" },
	*           { id : 'L3', caption : "Iteration 2" },
	*           { id : 'L5', caption : "Iteration 3" }
	*         ]
	*     });
	*
	* @param {Object} options Statements list parameters
	* @param {Array}  options.iterations Array which contains the definition of iterations
	* @param {String} options.iterations[].id Id or name of the input which contains the value of the current iteration
	* @param {String} options.iterations[].caption Caption of the current iteration
	* @param {Boolean} [options.isMultiple] Indicates if the question is multiple
	* @return {jQuery} Returns the current instance of the root container for the call chains
	*/
	$.fn.adcPinboard = function adcPinboard(options) {

		// MS: Syntax to set the default value or use the one specified
		(options.width = options.width || 400);
		(options.height = options.height || "auto");
		(options.loading = options.loading || 'Loading $prct'); // remove
		(options.showCounter = options.showCounter || false);
        (options.currentQuestion = options.currentQuestion || '');

		$(this).css({'max-width':options.maxWidth,'width':options.controlWidth});
		$(this).parents('.controlContainer').css({'width':'100%'});

		if ( options.controlAlign === "center" ) {
			$(this).parents('.controlContainer').css({'text-align':'center'});
			$(this).css({'margin':'0px auto'});
		} else if ( options.controlAlign === "right" ) {
			$(this).css({'margin':'0 0 0 auto'});
		}

		// IE8 and below fix
		if (!Array.prototype.indexOf) {

		  Array.prototype.indexOf = function(elt /*, from*/) {
			var len = this.length >>> 0;

			var from = Number(arguments[1]) || 0;
			from = (from < 0)
				 ? Math.ceil(from)
				 : Math.floor(from);
			if (from < 0)
			  from += len;

			for (; from < len; from++) {
			  if (from in this && this[from] === elt)
				return from;
			}
			return -1;
		  };
		}

		// Global variables
		var $container = $(this),
			currentIteration = 0,
			total_images = $container.find("img").length,
			items = options.items,
			imagePath = options.imagePath,
			areaWidth = 0,
			areaHeight = 0,
			noteMessage = options.popupQText,
			images_loaded = 0,
			resizedWidth = 0,
			resizedHeight = 0,
			ratio = 1,
			showCounter = options.showCounter,
			askComment = options.askComment,
			slLength = askComment ? 4 : 4,
            numberOfMoods = options.numberOfMoods,
            singleMoodState = options.singleMoodState;

		var imgLoad = $("<img />");
			imgLoad.attr("src", imagePath + "?" + new Date().getTime());
			imgLoad.off("load");
			imgLoad.on("load", function () {
		   		// Get image sizes
		  		//$('.smartBoard').css({'display':'block','width':this.width + 'px','height':this.height + 'px'});

				areaWidth = this.width;
				areaHeight = this.height;

				$('.smartBoard').css({
					'width' : '',
					'height': ''
				});

				$container.find('img').hide();

				ratio = areaHeight/areaWidth,
				resizedWidth = $container.outerWidth() > areaWidth ? areaWidth : $container.outerWidth(),
				resizedHeight = (resizedWidth * ratio);

				$('.smartBG, .smartBoard').css({
					'display' : 'block',
					'width' : resizedWidth + 'px',
					'height': resizedHeight + 'px'
				});

				init();
			});


		function init() {

			if ( showCounter ) $('.counterNumber').text( items.length/slLength );

			// Check if response already has a value

			var noteWidth = 300,
				noteHeight = 130,
				topAdjust = 20,
				pinWidth = 28,
				pinHeight = 33,
				pinID = $('.pin').length - 1,
				pinMoodArray = [];

            pinMoodArray = ['gPin','nPin','bPin'];
            if ( numberOfMoods === 3 ) pinMoodArray = ['gPin','nPin','bPin'];
            else if ( numberOfMoods === 2 ) pinMoodArray = ['gPin', 'bPin'];
			else if ( numberOfMoods === 1 ) {
                if ( singleMoodState === 'yes' ) pinMoodArray = ['gPin'];
                else if ( singleMoodState === 'maybe' ) pinMoodArray = ['nPin'];
                else if ( singleMoodState === 'no' ) pinMoodArray = ['bPin'];
            }

			$('.smartBoard').prepend('<div class="smartArea" data-id="0" style="position:absolute; ' +
				'top:0px; left:0px; ' +
				'width:100%; height:100%; ' +
				'"></div>');

			$('.smartArea').on('click', function(e) {

				if ( $(this).find('.pin').length < (items.length/slLength) ) {

					var offset = $(this).offset(),
						xCoord = (e.pageX - offset.left),
						yCoord = (e.pageY - offset.top),
						offsetParent = $(this).parent('.smartBoard').offset(),
						xCoordParent = (e.pageX - offsetParent.left),
						yCoordParent = (e.pageY - offsetParent.top);

					// if no text and no feeling then remove pin
					if ( (($('.smartNote textarea').val() === '' && !askComment) || ($('.smartNote textarea').val() === '' && askComment)) && $('.smartNote .active').length === 0 ) {
						$('[data-pinid="' + pinID + '"]').remove();

						//remove old notes
						$('.smartNote').remove();
					}

					if ( $('.smartNote').length === 0 ) {

						//remove old notes
						$('.smartNote').remove();

						//add new pin and note
						pinID = $(this).find('.pin').length;
						$(e.target).append('<div class="pin active" style="top:' + (yCoord - pinHeight + 5) + 'px; left:' + (xCoord-(pinWidth*0.5)) + 'px;" data-pinid="' + pinID + '" ></div>');
						$('[data-pinid="' + pinID + '"]').data("data", {target:e.target, x:xCoord, y:yCoord, x0:xCoordParent, y0:yCoordParent});
						addNote(e.target,xCoord,yCoord,xCoordParent,yCoordParent,pinID);

						if ((document.body.clientWidth / window.innerWidth)>1) {
							var zoom = document.body.clientWidth / window.innerWidth;
							$('[data-pinid="' + pinID + '"]').data("data", {x:(xCoord*zoom), y:(yCoord*zoom), x0:(xCoordParent*zoom), y0:(yCoordParent*zoom)});
						}

						// enable pin editing
						$('.pin').off('click').on('click', function(e) {
							e.stopImmediatePropagation();

							// if no text and no feeling then remove pin
							if ( (($('.smartNote textarea').val() === '' && !askComment) || ($('.smartNote textarea').val() === '' && askComment)) && $('.smartNote .active').length === 0 ) {
								$('[data-pinid="' + pinID + '"]').remove();
							}

							//remove old notes
							$('.smartNote').remove();

							addNote( $(this).data('data').target , $(this).data('data').x, $(this).data('data').y, $(this).data('data').x0, $(this).data('data').y0, $(this).data('pinid'));

							$('.smartNote .feeling').eq( $(this).data('feeling')-1 ).addClass('active');
							$('.smartNote').data('feeling', $(this).data('feeling') );
							if ( askComment ) {
								$('.smartNote textarea').text( $(this).data('comment') );
								$('.smartNote').data('comment', $(this).data('comment') );
							}

						});
					} else {
						$('.smartNote').effect('shake');
					}
				}
			});

			function addNote(target,x,y,x0,y0,pinID) {
				var noteX = /*x - (noteWidth/2)*/ ( resizedWidth - ( noteWidth + 14 ) ) * 0.5,
					noteY = y - (noteHeight) - topAdjust;

				$('.smartArea .pin.active').removeClass('active');
				$('.smartArea .pin[data-pinid='+pinID+']').addClass('active');

				// Reposition if note goes off screen
				/*if ( x0 - (noteWidth/2) < 0 ) noteX = 0;
				else if ( (x0 + (noteWidth/2)) > areaWidth ) noteX = areaWidth - noteWidth;	*/
				if ( (y0 - noteHeight) < 0 ) noteY = y;

				var smartNoteContent =  '<div class="smartNote" style="top:' + noteY + 'px; left:' + noteX + 'px; ' +
										'width:' + noteWidth + 'px; height:' + noteHeight + 'px;">' +
										'<p>' + noteMessage + '</p>';

                if ( numberOfMoods === 3 || numberOfMoods === 2 ) smartNoteContent += '<div class="goodVibe feeling"><i class="demo-icon icon-emo-happy">&#xe800;</i></div>';
                if ( numberOfMoods === 3 ) smartNoteContent += '<div class="neutralVibe feeling"><i class="demo-icon icon-emo-sleep">&#xe802;</i></div>';
				if ( numberOfMoods > 1 ) smartNoteContent += '<div class="badVibe feeling"><i class="demo-icon icon-emo-unhappy">&#xe801;</i></div>';
				if ( numberOfMoods === 1 ) {
                    if ( singleMoodState === 1 ) smartNoteContent += '<div class="goodVibe feeling"><i class="demo-icon icon-emo-happy">&#xe800;</i></div>';
                    else if ( singleMoodState === 2 ) smartNoteContent += '<div class="neutralVibe feeling"><i class="demo-icon icon-emo-sleep">&#xe802;</i></div>';
                    else if ( singleMoodState === 3 ) smartNoteContent += '<div class="badVibe feeling"><i class="demo-icon icon-emo-unhappy">&#xe801;</i></div>';
                }

				if ( askComment ) smartNoteContent += '<textarea name="note" id="note"></textarea>';

					smartNoteContent += '<div class="closeNote"><i class="demo-icon icon-cancel">&#xe805;</i></div>' +
										'<div class="deleteNote"><i class="demo-icon icon-trash-1">&#xe804;</i></div>' +
										'<div class="confirmNote"><i class="demo-icon icon-ok">&#xe806;</i></div>' +
										'</div>';

				$(target).append( smartNoteContent );

                if ( numberOfMoods === 1 ) {
                    $('.feeling').addClass('active');
                    $('.feeling').parents('.smartNote').data('feeling',singleMoodState);
                }

				$('#note').trigger("focus");

				$('.smartNote').on('click', function(e) {
					e.stopImmediatePropagation();
				});

				$('.smartNote .feeling').on('click', function(e) {
					e.stopImmediatePropagation();
					$('.feeling.active').removeClass('active');
					if ( !$(e.target).hasClass('feeling') ) $(e.target).parent('.feeling').addClass('active');
                    else $(e.target).addClass('active');

					// Write temp data to actual note
					$(this).parents('.smartNote').data('feeling',$(this).index());
					$('#note').trigger( "focus" );
				});

				$('.smartNote .closeNote').on('click', function(e) {
					e.stopImmediatePropagation();

					//remove note
					$('.smartNote').remove();

					// if no text and no feeling then remove pin
					if ( $('[data-pinid="' + pinID + '"]').data('feeling') === '' || !$('[data-pinid="' + pinID + '"]').data('feeling') &&
						 ($('[data-pinid="' + pinID + '"]').data('comment') === '' || !askComment) || (!$('[data-pinid="' + pinID + '"]').data('comment') && askComment) ) {
						$('[data-pinid="' + pinID + '"]').remove();
					}

				});

				$('.smartNote .confirmNote').on('click', function(e) {

					e.stopImmediatePropagation();

					var feeling = $(this).parents('.smartNote').data('feeling'),
						comment = askComment ? $(this).parents('.smartNote').data('comment') : '';

					if ( !feeling || (!comment && askComment) ) {
						$('.smartNote').effect('shake');

					} else {
						// store data

						var ratioX = areaWidth/resizedWidth,
							ratioY = areaHeight/resizedHeight;

						$('[data-pinid="' + pinID + '"]').data('feeling',feeling);
						if ( askComment ) $('[data-pinid="' + pinID + '"]').data('comment',comment);
						$('[data-pinid="' + pinID + '"]').removeClass('gPin nPin bPin').addClass( pinMoodArray[feeling-1]);
						items[(pinID*slLength)].element.val( x*ratioX );
						items[(pinID*slLength)+1].element.val( y*ratioY );
						items[(pinID*slLength)+2].element.val(feeling);
						if ( askComment ) items[(pinID*slLength)+3].element.val(comment);

						//remove note
						$('.smartNote').remove();
						$('html').css('cursor','default');

                        if (window.askia
                            && window.arrLiveRoutingShortcut
                            && window.arrLiveRoutingShortcut.length > 0
                            && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                            askia.triggerAnswer();
                        }

					}

					$('.counterNumber').text( parseInt( items.length/slLength )- $('.smartArea .pin').length );

				});

				$('.smartNote .deleteNote').on('click', function(e) {
                    e.stopImmediatePropagation();

                    var ratioX = areaWidth/resizedWidth,
							ratioY = areaHeight/resizedHeight;

					var currentPinID = $(this).parents('.smartArea').find('.pin').data('pinid');

					// if no text and no feeling then remove pin
					items[(currentPinID*slLength)].element.val( '' );
					items[(currentPinID*slLength)+1].element.val( '' );
					items[(currentPinID*slLength)+2].element.val( '' );
					if ( askComment ) items[(currentPinID*slLength)+3].element.val( '' );
					$('[data-pinid="' + pinID + '"]').remove();

					// cycle through each item and readjust data
					// remove all data
					for ( var i=0; i<(items.length/slLength); i++ ) {
						items[(i*slLength)].element.val('');
						items[(i*slLength)+1].element.val('');
						items[(i*slLength)+2].element.val('');
						if ( askComment ) items[(i*slLength)+3].element.val('');
					}
					// change pin id on all current pins1
					for ( var j=0; j<$('.smartArea .pin').length; j++ ) {
						pinID = j;
						$('.smartArea .pin').eq(j).attr('data-pinid',pinID);
						items[(j*slLength)].element.val( $('.smartArea .pin').eq(j).data('data').x*ratioX );
						items[(j*slLength)+1].element.val( $('.smartArea .pin').eq(j).data('data').y*ratioY );
						items[(j*slLength)+2].element.val($('.smartArea .pin').eq(j).data('feeling'));
						if ( askComment ) items[(j*slLength)+3].element.val($('.smartArea .pin').eq(j).data('comment'));
					}

					$('.smartNote').remove();
					$('html').css('cursor','default');

					$('.counterNumber').text( parseInt( items.length/slLength )- $('.smartArea .pin').length );
                    if (window.askia
                        && window.arrLiveRoutingShortcut
                        && window.arrLiveRoutingShortcut.length > 0
                        && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                        askia.triggerAnswer();
                    }

				});

				if ( askComment ) {
					$('.smartNote textarea').on('change',function() {
						$('[data-pinid="' + pinID + '"]').data('comment',$(this).val());

						// Write temp data to actual note
						$(this).parents('.smartNote').data('comment',$(this).val());

						//items[(pinID*4)+2].element.val(feeling);
						items[(pinID*slLength)+3].element.val($(this).val());
                        var ratioX = areaWidth/resizedWidth,
							ratioY = areaHeight/resizedHeight;
							items[(pinID*slLength)].element.val( x*ratioX );
							items[(pinID*slLength)+1].element.val( y*ratioY );
					});
				}

			}

			// Check for old values
			for ( var k=0; k<(items.length/slLength); k++ ) {

				var pinX = parseFloat(items[(k*slLength)].element.val()),
					pinY = parseFloat(items[(k*slLength)+1].element.val()),
					pinFeeling = parseInt(items[(k*slLength)+2].element.val()),
					pinComment = askComment ? items[(k*slLength)+3].element.val() : '',
					ratioX = areaWidth/resizedWidth,
					ratioY = areaHeight/resizedHeight;

				if ( pinComment !== '' || ( !askComment && pinFeeling > 0) ) {

					$('.counterNumber').text( parseInt($('.counterNumber').text())-1 );

					var offsetParent = $('.smartBoard').offset(),
						xCoordParent = ((pinX + $('.smartArea').offset().left )- offsetParent.left),
						yCoordParent = ((pinY + $('.smartArea').offset().top) - offsetParent.top);

						pinID++;
						$('.smartArea').append('<div class="pin" style="top:' + ((pinY/ratioY) - pinHeight + 5) + 'px; left:' + ((pinX/ratioX) - (pinWidth*0.5)) + 'px;" data-pinid="' + pinID + '" ></div>');
						$('[data-pinid="' + pinID + '"]').data("data", {target:$('.smartArea'), x:pinX/ratioX, y:pinY/ratioY, x0:xCoordParent, y0:yCoordParent});
						$('[data-pinid="' + pinID + '"]').data('feeling',pinFeeling);
						if ( askComment ) $('[data-pinid="' + pinID + '"]').data('comment',pinComment);
						$('[data-pinid="' + pinID + '"]').removeClass('gPin nPin bPin').addClass( pinMoodArray[pinFeeling-1]);

				}
			}

			// enable pin editing
			$('.pin').off('click').on('click', function(e) {
				e.stopImmediatePropagation();

				// if no text and no feeling then remove pin
				if ( ($('.smartNote textarea').val() === '' && showComment) && $('.smartNote .active').length === 0 ) {
					$('[data-pinid="' + pinID + '"]').remove();
				}

				//remove old notes
				$('.smartNote').remove();

				addNote( $(this).data('data').target , $(this).data('data').x, $(this).data('data').y, $(this).data('data').x0, $(this).data('data').y0, $(this).data('pinid'));

				$('.smartNote .feeling').eq( $(this).data('feeling')-1 ).addClass('active');
				$('.smartNote').data('feeling', $(this).data('feeling') );
				if ( askComment ) {
					$('.smartNote textarea').text( $(this).data('comment') );
					$('.smartNote').data('comment', $(this).data('comment') );
				}

			});


		}

		// Attach all events
		//$container.delegate('.responseItem', 'click', (!isMultiple) ? selectStatementSingle : selectStatementMulitple);
		if ( total_images > 0 ) {
			$container.find('img').each(function() {
				var fakeSrc = $(this).attr('src');
				$("<img/>").css('display', 'none').on('load', function() {
					images_loaded++;
					if (images_loaded >= total_images) {
						// now all images are loaded.

						// Check for missing images and resize
						/*$container.find('.responseItem img').each(function forEachImage(index) {

							$(this).show();

							var size = {
								width: $(this).width(),
								height: $(this).height()
							};

						});*/

						$container.css('visibility','visible');

					}
				}).attr("src", fakeSrc);
			});
		} else {
			$container.css('visibility','visible');
			init();
		}

		// Returns the container
		return this;
	};

} (jQuery));
