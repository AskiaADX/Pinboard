(function () {
    var msEdgeMatch = /Edge\/([0-9]+)/i.exec(navigator.userAgent);
    if (msEdgeMatch) document.documentMode = parseInt(msEdgeMatch[1]);
})();
(function () {

    /**
  * function that emulate the jQuery matches function
  *
  * @param {HTMLElement} obj HTMLElement which should be listen
  * @param {String} selector The start element to returns his matches 
  */
    function matches(el, selector) {
        return (
            el.matches ||
            el.matchesSelector ||
            el.msMatchesSelector ||
            el.mozMatchesSelector ||
            el.webkitMatchesSelector ||
            el.oMatchesSelector
        ).call(el, selector);
    }

    /**
   * function that emulate the jQuery parents function
   *
   * @param {HTMLElement} obj HTMLElement which should be listen
   * @param {String} selector The start element to returns his parents 
   */
    function parents(el, selector) {
        var parents = [];
        while ((el = el.parentNode) && el !== document) {
            // See "Matches Selector" above
            if (!selector || matches(el, selector)) parents.push(el);
        }
        return parents;
    }

    /**
  * function that emulate the jQuery offset function
  *
  * @param {HTMLElement} obj HTMLElement which should be listen
  */
    function offset(el) {
        box = el.getBoundingClientRect();
        docElem = document.documentElement;
        return {
            top: box.top + window.pageYOffset - docElem.clientTop,
            left: box.left + window.pageXOffset - docElem.clientLeft
        };
    }

    /**
   * function that emulate the jQuery trigger (native event) function
   *
   * @param {HTMLElement} obj HTMLElement which should be listen
   * @param {string} eventname which should be listen
   */
    function trigger(el, eventType) {
        if (typeof eventType === 'string' && typeof el[eventType] === 'function') {
            el[eventType]();
        } else {
            var event;
            if (eventType === 'string') {
                event = document.createEvent('HTMLEvents');
                event.initEvent(eventType, true, false);
            } else {
                event = eventType;
            }
            el.dispatchEvent(event);
        }
    }

    /**
   * function that emulate the jQuery index function
   *
   * @param {HTMLElement} obj HTMLElement which should be listen
   */
    function index(el) {
        if (!el) return -1;
        var i = 0;
        while ((el = el.previousElementSibling)) {
            i++;
        }
        return i;
    }

    var shakingElements = [];

    /**
   * function that emulate the jQuery effect Shake
   *
   * @param {HTMLElement} obj HTMLElement which should be shaked
   * @param {Number} number magnitude of the shake optional by default 15
   */
    function shake(element, magnitude) {

        //A counter to count the number of shakes
        var counter = 1;

        //The total number of shakes (there will be 1 shake per frame)
        var numberOfShakes = 15;

        //Capture the element's position and angle so you can
        //restore them after the shaking has finished
        var startX = 0,
            startY = 0;

        // Divide the magnitude into 10 units so that you can 
        // reduce the amount of shake by 10 percent each frame
        var magnitudeUnit = magnitude / numberOfShakes;

        //The `randomInt` helper function
        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        //Add the element to the `shakingElements` array if it
        //isn't already there
        if (shakingElements.indexOf(element) === -1) {
            //console.log("added")
            shakingElements.push(element);

            upAndDownShake();
        }

        //The `upAndDownShake` function
        function upAndDownShake() {

            //Shake the element while the `counter` is less than 
            //the `numberOfShakes`
            if (counter < numberOfShakes) {

                //Reset the element's position at the start of each shake
                element.style.transform = 'translate(' + startX + 'px, ' + startY + 'px)';

                //Reduce the magnitude
                magnitude -= magnitudeUnit;

                //Randomly change the element's position
                var randomX = randomInt(-magnitude, magnitude);
                var randomY = randomInt(-magnitude, magnitude);

                element.style.transform = 'translate(' + randomX + 'px, ' + randomY + 'px)';

                //Add 1 to the counter
                counter += 1;

                requestAnimationFrame(upAndDownShake);
            }

            //When the shaking is finished, restore the element to its original 
            //position and remove it from the `shakingElements` array
            if (counter >= numberOfShakes) {
                element.style.transform = 'translate(' + startX + ', ' + startY + ')';
                shakingElements.splice(shakingElements.indexOf(element), 1);
            }
        }

    };

    /**
  * IE8 and below fix
  */
    if (!Array.prototype.indexOf) {

        Array.prototype.indexOf = function (elt) {
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

    /**
   * Creates a new instance of the Pinboard
   *
   * @param {Object} options Options of the Pinboard
   */
    function Pinboard(options) {

        this.options = options;
        this.instanceId = options.instanceId || 1;
        this.maxWidth = options.maxWidth || 400;
        this.controlWidth = options.controlWidth || "100%";
        this.controlAlign = options.controlAlign || 'center';
        this.imagePath = options.imagePath || '';
        this.popupQText = options.popupQText || '';
        this.currentQuestion = options.currentQuestion;

        var adcControl = document.getElementById('adc_' + this.instanceId),
            smartBoard = adcControl.querySelectorAll('.smartBoard')[0],
            total_images = !!adcControl.querySelector('img'),
            areaWidth = 0,
            areaHeight = 0,
            noteMessage = options.popupQText,
            images_loaded = 0,
            resizedWidth = 0,
            resizedHeight = 0,
            ratio = 1,
            items = options.items,
            showCounter = options.showCounter || 0,
            askComment = options.askComment || 0,
            numberOfMoods = options.numberOfMoods || 3,
            singleMoodState = options.singleMoodState,
            slLength = options.askComment ? 4 : 4;


        adcControl.style.maxWidth = options.maxWidth;
        adcControl.style.width = options.controlWidth;
        parents(adcControl, '.controlContainer')[0].style.width = '100%';

        if (this.controlAlign === "center") {
            parents(adcControl, '.controlContainer')[0].style.textAlign = 'center';
            adcControl.style.margin = '0px auto';
        } else if (this.controlAlign === "right") {
            adcControl.style.margin = '0 0 0 auto';
        }

        var imgLoad = adcControl.querySelector('img');
        imgLoad.setAttribute('src', this.imagePath + "?" + new Date().getTime());
        imgLoad.removeEventListener('load', function () { });
        imgLoad.addEventListener('load', function () {
            // Get image sizes - this is the img
            areaWidth = this.width;
            areaHeight = this.height;

            smartBoard.style.width = '';
            smartBoard.style.height = '';
            // hide the img
            this.style.display = 'none';

            ratio = areaHeight / areaWidth,
                resizedWidth = adcControl.offsetWidth > areaWidth ? areaWidth : adcControl.offsetWidth,
                resizedHeight = (resizedWidth * ratio);

            this.style.display = 'block';
            this.style.width = resizedWidth + 'px';
            this.style.height = resizedHeight + 'px';
            smartBoard.style.display = 'block';
            smartBoard.style.width = resizedWidth + 'px';
            smartBoard.style.height = resizedHeight + 'px';

            init();
        });

        function init() {

            var counterNumber = adcControl.querySelectorAll('.counterNumber')[0];

            if (showCounter) {
                counterNumber.textContent = items.length / slLength;
            }

            var noteWidth = 300,
                noteHeight = 130,
                topAdjust = 20,
                pinWidth = 28,
                pinHeight = 33,
                pinID = adcControl.querySelectorAll('.pin').length - 1,
                pinMoodArray = ['gPin', 'nPin', 'bPin'];

            if (numberOfMoods === 2) pinMoodArray = ['gPin', 'bPin', 'nPin'];

            //prepend
            document.querySelector('.tempArea').innerHTML = '<div class="smartArea" data-id="0" style="position:absolute;top:0px; left:0px;width:100%; height:100%;"></div>';
            smartBoard.insertAdjacentElement('afterbegin', document.querySelector('.smartArea'));

            var smartArea = adcControl.querySelectorAll('.smartArea')[0];

            smartArea.addEventListener('click', function (e) {

                if (this.querySelectorAll('.pin').length < (items.length / slLength)) {

                    var offsetSmartArea = offset(this),
                        xCoord = (e.pageX - offsetSmartArea.left),
                        yCoord = (e.pageY - offsetSmartArea.top),
                        offsetParent = offset(smartBoard),
                        xCoordParent = (e.pageX - offsetParent.left),
                        yCoordParent = (e.pageY - offsetParent.top);

                    var smartNoteTextArea = adcControl.querySelectorAll('.smartNote textarea')[0];
                    var smartNoteActive = adcControl.querySelectorAll('.smartNote .active')[0];
                    var dataPinId = adcControl.querySelectorAll('[data-pinid="' + pinID + '"]');
                    var smartNote = adcControl.querySelectorAll('.smartNote');

                    // if no text and no feeling then remove pin
                    if (((smartNoteTextArea !== undefined && smartNoteTextArea.value.trim() === '' && !askComment) || (smartNoteTextArea !== undefined && smartNoteTextArea.value.trim() === '' && askComment)) && smartNoteActive !== undefined && smartNoteActive.length === 0) {
                        for (var i1 = 0; i1 < dataPinId.length; i1++) {
                            if (dataPinId[i1].parentNode !== null) {
                                dataPinId[i1].parentNode.removeChild(dataPinId[i1]);
                            }
                        }

                        //remove old notes
                        for (var i2 = 0; i2 < smartNote.length; i2++) {
                            if (smartNote[i2].parentNode !== null) {
                                smartNote[i2].parentNode.removeChild(smartNote[i2]);
                            }
                        }
                    }

                    if (smartNote.length === 0) {

                        //remove old notes
                        for (var i3 = 0; i3 < smartNote.length; i3++) {
                            if (smartNote[i3].parentNode !== null) {
                                smartNote[i3].parentNode.removeChild(smartNote[i3]);
                            }
                        }

                        //add new pin and note  
                        pinID = this.querySelectorAll('.pin').length;
                        document.querySelector('.tempArea').innerHTML = '<div class="pin active" style="top:' + (yCoord - pinHeight + 8) + 'px; left:' + (xCoord - (pinWidth * 0.5) + 3) + 'px;" data-pinid="' + pinID + '" ></div>';
                        this.appendChild(document.querySelector('.tempArea .pin.active'));
                        var dataPinId2 = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                        dataPinId2.dataset.target = e.target;
                        dataPinId2.dataset.x = xCoord;
                        dataPinId2.dataset.y = yCoord;
                        dataPinId2.dataset.x0 = xCoordParent;
                        dataPinId2.dataset.y0 = yCoordParent;
                        addNote(e.target, xCoord, yCoord, xCoordParent, yCoordParent, pinID);

                        if ((document.body.clientWidth / window.innerWidth) > 1) {
                            var zoom = document.body.clientWidth / window.innerWidth;
                            dataPinId2.dataset.x = xCoord * zoom;
                            dataPinId2.dataset.y = yCoord * zoom;
                            dataPinId2.dataset.x0 = xCoordParent * zoom;
                            dataPinId2.dataset.y0 = yCoordParent * zoom;
                        }

                        // enable pin editing
                        var pins = adcControl.querySelectorAll('.pin');
                        for (var i4 = 0; i4 < pins.length; i4++) {
                            pins[i4].removeEventListener('click', function () { });
                            pins[i4].addEventListener('click', function (e) {
                                e.stopImmediatePropagation();

                                var smartNoteTextArea = adcControl.querySelectorAll('.smartNote textarea')[0];
                                var smartNoteActive = adcControl.querySelectorAll('.smartNote .active')[0];
                                var dataPinId3 = adcControl.querySelector('[data-pinid="' + pinID + '"]');

                                // if no text and no feeling then remove pin
                                if (((smartNoteTextArea !== undefined && smartNoteTextArea.value.trim() === '' && !askComment) || (smartNoteTextArea !== undefined && smartNoteTextArea.value.trim() === '' && askComment)) && smartNoteActive !== undefined && smartNoteActive.length === 0) {
                                    if (dataPinId3.parentNode !== null) {
                                        dataPinId3.parentNode.removeChild(dataPinId3);
                                    }
                                }

                                //remove old notes
                                var smartNote = adcControl.querySelector('.smartNote');
                                if (smartNote !== null && smartNote.parentNode !== null) {
                                    smartNote.parentNode.removeChild(smartNote);
                                }

                                addNote(this, this.dataset.x, this.dataset.y, this.dataset.x0, this.dataset.y0, this.dataset.pinid);

                                var smartNoteFeeling = adcControl.querySelectorAll('.smartNote .feeling');
                                smartNote = adcControl.querySelector('.smartNote');
                                smartNoteTextArea = adcControl.querySelectorAll('.smartNote textarea')[0];
                                smartNoteFeeling[this.dataset.feeling - 1].classList.add('active');
                                smartNote.dataset.feeling = this.dataset.feeling;
                                if (askComment) {
                                    smartNoteTextArea.textContent = this.dataset.comment;
                                    smartNote.dataset.comment = this.dataset.comment;
                                }
                            });
                        }
                    } else {
                        smartNote = adcControl.querySelector('.smartNote');
                        shake(smartNote, 15);
                    }
                }
            });

            function addNote(target, x, y, x0, y0, pinID) {
                var noteX = (resizedWidth - (noteWidth + 14)) * 0.5;
                var noteY = y - (noteHeight) - topAdjust;

                var smartNotePinActive = adcControl.querySelector('.smartArea .pin.active');
                if (smartNotePinActive !== null) smartNotePinActive.classList.remove('active');
                adcControl.querySelector('.smartArea .pin[data-pinid="' + pinID + '"]').classList.add('active');

                // Reposition if note goes off screen
                if ((y0 - noteHeight) < 0) noteY = y;

                var smartNoteContent = '<div class="smartNote" style="top:' + noteY + 'px; left:' + noteX + 'px; ' +
                    'width:' + noteWidth + 'px; height:' + noteHeight + 'px;" data-pinid="' + pinID + '">' +
                    '<p>' + noteMessage + '</p>';

                if (numberOfMoods === 3 || numberOfMoods === 2) smartNoteContent += '<div class="goodVibe feeling"><i class="demo-icon icon-emo-happy">&#xe800;</i></div>';
                if (numberOfMoods === 3) smartNoteContent += '<div class="neutralVibe feeling"><i class="demo-icon icon-emo-sleep">&#xe802;</i></div>';
                if (numberOfMoods > 1) smartNoteContent += '<div class="badVibe feeling"><i class="demo-icon icon-emo-unhappy">&#xe801;</i></div>';
                if (numberOfMoods === 1) {
                    if (singleMoodState === 1) smartNoteContent += '<div class="goodVibe feeling"><i class="demo-icon icon-emo-happy">&#xe800;</i></div>';
                    else if (singleMoodState === 2) smartNoteContent += '<div class="neutralVibe feeling"><i class="demo-icon icon-emo-sleep">&#xe802;</i></div>';
                    else if (singleMoodState === 3) smartNoteContent += '<div class="badVibe feeling"><i class="demo-icon icon-emo-unhappy">&#xe801;</i></div>';
                }

                if (askComment) smartNoteContent += '<textarea name="note" id="note"></textarea>';

                smartNoteContent += '<div class="closeNote"><i class="demo-icon icon-cancel">&#xe805;</i></div>' +
                    '<div class="deleteNote"><i class="demo-icon icon-trash-1">&#xe804;</i></div>' +
                    '<div class="confirmNote"><i class="demo-icon icon-ok">&#xe806;</i></div>' +
                    '</div>';

                document.querySelector('.tempArea').innerHTML = smartNoteContent;

                document.querySelector('.smartBoard').appendChild(document.querySelector('.tempArea .smartNote'));

                if (numberOfMoods === 1) {
                    var feeling = adcControl.querySelector('.feeling');
                    feeling.classList.add('active');
                    parents(feeling, '.smartNote')[0].dataset.feeling = singleMoodState;
                }

                var note = adcControl.querySelector('#note');
                if (note !== null) trigger(note, 'focus');

                var smartNote = adcControl.querySelector('.smartNote');

                smartNote.addEventListener('click', function (e) {
                    e.stopImmediatePropagation();
                });

                var smartNoteFeeling = adcControl.querySelectorAll('.smartNote .feeling');

                for (var i5 = 0; i5 < smartNoteFeeling.length; i5++) {
                    smartNoteFeeling[i5].addEventListener('click', function (e) {
                        e.stopImmediatePropagation();
                        var feelingActive = adcControl.querySelector('.feeling.active');
                        if (feelingActive !== null) feelingActive.classList.remove('active');

                        if (!e.target.classList.contains('feeling')) parents(e.target, '.feeling')[0].classList.add('active');
                        else e.target.classList.add('active');

                        // Write temp data to actual note
                        parents(this, '.smartNote')[0].dataset.feeling = index(this);
                        var note = adcControl.querySelector('#note');
                        if (note !== null) trigger(note, 'focus');
                    });
                }

                var smartNoteCloseNote = adcControl.querySelector('.smartNote .closeNote');
                smartNoteCloseNote.addEventListener('click', function (e) {
                    e.stopImmediatePropagation();

                    //remove note
                    var smartNote = adcControl.querySelector('.smartNote');
                    if (smartNote.parentNode !== null) {
                        smartNote.parentNode.removeChild(smartNote);
                    }

                    // if no text and no feeling then remove pin
                    var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                    if (dataPinId.dataset.feeling === '' || !dataPinId.dataset.feeling &&
                        (dataPinId.dataset.comment === '' || !askComment) || (!dataPinId.dataset.comment && askComment)) {
                        if (dataPinId.parentNode !== null) {
                            dataPinId.parentNode.removeChild(dataPinId);
                        }
                    }

                });

                var smartNoteConfirmNote = adcControl.querySelector('.smartNote .confirmNote');

                smartNoteConfirmNote.addEventListener('click', function (e) {

                    e.stopImmediatePropagation();

                    var feeling = parents(this, '.smartNote')[0].dataset.feeling,
                        comment = askComment ? parents(this, '.smartNote')[0].dataset.comment : '';

                    var smartNote = adcControl.querySelector('.smartNote');
                    if (!feeling || (!comment && askComment)) {
                        shake(smartNote, 15);
                    } else {
                        // store data
                        var ratioX = areaWidth / resizedWidth,
                            ratioY = areaHeight / resizedHeight;

                        var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                        dataPinId.dataset.feeling = feeling;
                        if (askComment) dataPinId.dataset.comment = comment;
                        dataPinId.classList.remove('gPin');
                        dataPinId.classList.remove('nPin');
                        dataPinId.classList.remove('bPin');
                        dataPinId.classList.add(pinMoodArray[feeling - 1]);
                        document.getElementById(items[(pinID * slLength)].element).value = x * ratioX;
                        document.getElementById(items[(pinID * slLength) + 1].element).value = y * ratioY;
                        document.getElementById(items[(pinID * slLength) + 2].element).value = feeling;
                        if (askComment) document.getElementById(items[(pinID * slLength) + 3].element).value = comment;

                        //remove note
                        if (smartNote.parentNode !== null) {
                            smartNote.parentNode.removeChild(smartNote);
                        }
                        document.querySelector('html').style.cursor = 'default';

                        // live routing
                        if (window.askia
                            && window.arrLiveRoutingShortcut
                            && window.arrLiveRoutingShortcut.length > 0
                            && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                            askia.triggerAnswer();
                        }
                    }
                    var counterNumber = adcControl.querySelector('.counterNumber');
                    if (counterNumber !== null) adcControl.querySelector('.counterNumber').textContent = parseInt(items.length / slLength) - adcControl.querySelectorAll('.smartArea .pin').length;
                });

                var smartNoteDeleteNote = adcControl.querySelector('.smartNote .deleteNote');

                smartNoteDeleteNote.addEventListener('click', function (e) {
                    e.stopImmediatePropagation();

                    var ratioX = areaWidth / resizedWidth,
                        ratioY = areaHeight / resizedHeight;

                    var currentPinID = adcControl.querySelector('.smartNote').dataset.pinid;

                    // if no text and no feeling then remove pin
                    document.getElementById(items[(currentPinID * slLength)].element).value = '';
                    document.getElementById(items[(currentPinID * slLength) + 1].element).value = '';
                    document.getElementById(items[(currentPinID * slLength) + 2].element).value = '';
                    if (askComment) document.getElementById(items[(currentPinID * slLength) + 3].element).value = '';

                    var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                    if (dataPinId.parentNode !== null) {
                        dataPinId.parentNode.removeChild(dataPinId);
                    }

                    // cycle through each item and readjust data
                    // remove all data
                    for (var i6 = 0; i6 < (items.length / slLength); i6++) {
                        document.getElementById(items[(i6 * slLength)].element).value = '';
                        document.getElementById(items[(i6 * slLength) + 1].element).value = '';
                        document.getElementById(items[(i6 * slLength) + 2].element).value = '';
                        if (askComment) document.getElementById(items[(i6 * slLength) + 3].element).value = '';
                    }
                    // change pin id on all current pins1
                    var smartAreaPin = adcControl.querySelectorAll('.smartArea .pin');
                    for (var i7 = 0; i7 < smartAreaPin.length; i7++) {
                        pinID = i7;
                        smartAreaPin[i7].setAttribute('data-pinid', pinID);
                        document.getElementById(items[(i7 * slLength)].element).value = smartAreaPin[i7].dataset.x * ratioX;
                        document.getElementById(items[(i7 * slLength) + 1].element).value = smartAreaPin[i7].dataset.y * ratioY;
                        document.getElementById(items[(i7 * slLength) + 2].element).value = smartAreaPin[i7].dataset.feeling;
                        if (askComment) document.getElementById(items[(i7 * slLength) + 3].element).value = smartAreaPin[i7].dataset.comment;
                    }

                    var smartNote = adcControl.querySelector('.smartNote');
                    //remove note
                    if (smartNote.parentNode !== null) {
                        smartNote.parentNode.removeChild(smartNote);
                    }
                    document.querySelector('html').style.cursor = 'default';

                    var counterNumber = adcControl.querySelector('.counterNumber');
                    if (counterNumber !== null) counterNumber.textContent = parseInt(items.length / slLength) - adcControl.querySelectorAll('.smartArea .pin').length;

                    // live routing
                    if (window.askia
                        && window.arrLiveRoutingShortcut
                        && window.arrLiveRoutingShortcut.length > 0
                        && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                        askia.triggerAnswer();
                    }

                });

                if (askComment) {
                    var smartNoteTextArea = adcControl.querySelector('.smartNote textarea');

                    smartNoteTextArea.addEventListener('change', function () {
                        var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                        dataPinId.dataset.comment = this.value;

                        // Write temp data to actual note
                        parents(this, '.smartNote')[0].dataset.comment = this.value;

                        document.getElementById(items[(pinID * slLength) + 3].element).value = this.value;
                        var ratioX = areaWidth / resizedWidth,
                            ratioY = areaHeight / resizedHeight;
                        document.getElementById(items[(pinID * slLength)].element).value = x * ratioX;
                        document.getElementById(items[(pinID * slLength) + 1].element).value = y * ratioY;
                    });
                }
            }

            // Check for old values
            for (var k = 0; k < (items.length / slLength); k++) {

                var pinX = parseFloat(document.getElementById(items[(k * slLength)].element).value),
                    pinY = parseFloat(document.getElementById(items[(k * slLength) + 1].element).value),
                    pinFeeling = parseInt(document.getElementById(items[(k * slLength) + 2].element).value),
                    pinComment = askComment ? document.getElementById(items[(k * slLength) + 3].element).value : '',
                    ratioX = areaWidth / resizedWidth,
                    ratioY = areaHeight / resizedHeight;

                if (pinComment !== '' || (!askComment && pinFeeling > 0)) {

                    var counterNumber = adcControl.querySelector('.counterNumber');
                    if (counterNumber !== null) counterNumber.textContent = parseInt(counterNumber.textContent) - 1;

                    var offsetParent = offset(adcControl.querySelector('.smartBoard')),
                        xCoordParent = ((pinX + offset(adcControl.querySelector('.smartArea')).left) - offsetParent.left),
                        yCoordParent = ((pinY + offset(adcControl.querySelector('.smartArea')).top) - offsetParent.top);

                    pinID++;

                    document.querySelector('.tempArea').innerHTML = '<div class="pin" style="top:' + ((pinY / ratioY) - pinHeight + 8) + 'px; left:' + ((pinX / ratioX) - (pinWidth * 0.5) + 3) + 'px;" data-pinid="' + pinID + '" ></div>'
                    adcControl.querySelector('.smartArea').appendChild(document.querySelector('.tempArea .pin'));
                    var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                    if (dataPinId !== null) {
                        dataPinId.dataset.target = adcControl.querySelector('.smartArea');
                        dataPinId.dataset.x = pinX / ratioX;
                        dataPinId.dataset.y = pinY / ratioY;
                        dataPinId.dataset.x0 = xCoordParent;
                        dataPinId.dataset.y0 = yCoordParent;
                        dataPinId.dataset.feeling = pinFeeling;
                        if (askComment) dataPinId.dataset.comment = pinComment;
                        dataPinId.classList.remove('gPin');
                        dataPinId.classList.remove('nPin');
                        dataPinId.classList.remove('bPin');
                        dataPinId.classList.add(pinMoodArray[pinFeeling - 1]);
                    }
                }
            }

            // enable pin editing
            var pins = adcControl.querySelectorAll('.pin');
            for (var m = 0; m < pins.length; m++) {
                pins[m].removeEventListener('click', function () { });
                pins[m].addEventListener('click', function (e) {
                    e.stopImmediatePropagation();

                    // if no text and no feeling then remove pin
                    var smartNoteTextArea = adcControl.querySelector('.smartNote textarea');
                    var smartNoteActive = adcControl.querySelector('.smartNote .active');
                    if ((smartNoteTextArea !== null && smartNoteTextArea.value === '' && showComment) && smartNoteActive !== null && smartNoteActive.length === 0) {
                        var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                        if (dataPinId.parentNode !== null) {
                            dataPinId.parentNode.removeChild(dataPinId);
                        }
                    }

                    //remove old notes
                    var smartNote = adcControl.querySelector('.smartNote');
                    if (smartNote !== null && smartNote.parentNode !== null) {
                        smartNote.parentNode.removeChild(smartNote);
                    }

                    addNote(this, this.dataset.x, this.dataset.y, this.dataset.x0, this.dataset.y0, this.dataset.pinid);

                    var smartNoteFeeling = adcControl.querySelectorAll('.smartNote .feeling');

                    smartNoteFeeling[this.dataset.feeling - 1].classList.add('active');

                    smartNote = adcControl.querySelector('.smartNote');
                    smartNoteTextArea = adcControl.querySelector('.smartNote textarea');
                    smartNote.dataset.feeling = this.dataset.feeling;
                    if (askComment) {
                        smartNoteTextArea.textContent = this.dataset.comment;
                        smartNote.dataset.comment = this.dataset.comment;
                    }

                });
            }

        }

        // Attach all events
        if (total_images > 0) {
            var container = document.querySelector('#adc_' + this.instanceId);
            var imgs = container.querySelectorAll('img');
            for (var n = 0; n < imgs.length; n++) {
                var fakeSrc = imgs[n].getAttribute('src');
                imgs[n].style.display = 'none';
                imgs[n].addEventListener('load', function () {
                    images_loaded++;
                    if (images_loaded >= total_images) {
                        container.style.visibility = 'visible';
                    }
                })
                imgs[n].setAttribute('src', fakeSrc);
            }
        } else {
            container.style.visibility = 'visible';
            init();
        }

    }

    /**
   * Attach the Pinboard to the window object
   */
    window.Pinboard = Pinboard;

}());
