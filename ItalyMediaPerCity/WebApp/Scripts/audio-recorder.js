(function(){


    var isAudioRecorderSupported;
    var AudioContext;
    var getUserMediaFunc;
    var audioContext0;
    var hostAudioSource0;
    var getHostAudioSourceAccess_wasAttempted = false;
    var getHostAudioSourceAccess_isInProgress = false;
    var getHostAudioSourceAccess_callbacks = [];


    var BUFFER_SIZE = 4096;


    AudioContext = window.AudioContext || window.webkitAudioContext;
    isAudioRecorderSupported = true;
    if ( !( AudioContext instanceof Function ) ) {
        isAudioRecorderSupported = false;
    } else {
        getUserMediaFunc = (
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia ||
            navigator.oGetUserMedia );
        if ( !( getUserMediaFunc instanceof Function ) ) {
            isAudioRecorderSupported = false;
        }
    }

    function getHostAudioSourceAccess() {
        getHostAudioSourceAccess_isInProgress = true;
        getHostAudioSourceAccess_wasAttempted = true;
        getUserMediaFunc.call( navigator, { audio: true }, getHostAudioSourceAccess_getUserMedia_success, getHostAudioSourceAccess_getUserMedia_error );
    }

    function getHostAudioSourceAccess_getUserMedia_success( hostAudioStream ) {
        getHostAudioSourceAccess_isInProgress = false;
        var success = false;
        try {
            audioContext0 = new AudioContext();
            hostAudioSource0 = audioContext0.createMediaStreamSource( hostAudioStream );
            assert( hostAudioSource0.context === audioContext0 );
            success = true;
        } finally {
            if ( !success ) {
                audioContext0 = hostAudioSource0 = undefined;
            }
        }
        getHostAudioSourceAccess_notify( success );
    }

    function getHostAudioSourceAccess_getUserMedia_error() {
        getHostAudioSourceAccess_isInProgress = false;
        getHostAudioSourceAccess_notify( false );
        console.error( "navigator.getUserMedia: error callback invoked with arguments ", arguments );
    }

    function getHostAudioSourceAccess_notify() {
        for ( var i = 0; i < getHostAudioSourceAccess_callbacks.length; ++i ) {
            getHostAudioSourceAccess_callbacks[i].apply( null, arguments );
        }
        getHostAudioSourceAccess_callbacks.length = 0;
    }

    function AudioRecorder() {
        ObjectWithEvents.call( this );
        // this._getUserMediaOnSuccessFunc = null;
        // this._getUserMediaOnErrorFunc = null;
        this._inputProcessor = null;
        this._recording = null;
        this._isStarted = false;
        this._initialize();
    }
	
    AudioRecorder.prototype = Object.create(ObjectWithEvents.prototype, {
        _initialize: {
            value: function () {
                var self = this;
                this._getHostAudioSourceAccess_callbackFunc = function () {
                    self._getHostAudioSourceAccess_callback.apply( self, arguments );
                };
                this._inputProcessorOnAudioProcessFunc = function () {
                    self._inputProcessorOnAudioProcess.apply( self, arguments );
                };
            }
        },

        tryStartAsync: {
            value: function () {
                if ( !isAudioRecorderSupported || arguments.length > 2 ) {
                    throw Error();
                }
                if ( !getHostAudioSourceAccess_wasAttempted ) {
                    getHostAudioSourceAccess_callbacks.push( this._getHostAudioSourceAccess_callbackFunc );
                    this._isStarting = true;
                    getHostAudioSourceAccess();
                    return;
                }
                if ( getHostAudioSourceAccess_isInProgress ) {
                    if ( this._isStarting ) {
                        return;
                    }
                    this._isStarting = true;
                    getHostAudioSourceAccess_callbacks.push( this._getHostAudioSourceAccess_callbackFunc );
                    return;
                }
                if ( audioContext0 !== undefined ) {
                    this._startCore();
                }
                this._onTryStartCompleted( audioContext0 !== undefined ? "success" : "failed" );
            }
        },

        isStarting: {
            get: function () {
                return this._isStarting;
            }
        },

        isStarted: {
            get: function () {
                return this._isStarted;
            }
        },

        recording: {
            get: function () {
                return this._recording;
            }
        },

        _getHostAudioSourceAccess_callback: {
            value: function ( success ) {
                this._isStarting = false;
                if ( success ) {
                    this._startCore();
                }
                this._onTryStartCompleted( success ? "success" : "failed");
            }
        },

        _startCore: {
            value: function ( ) {
                var failed = true;
                try {
                    this._inputProcessor = ( audioContext0.createScriptProcessor || audioContext0.createJavaScriptNode )
                        .call( audioContext0, BUFFER_SIZE, 1, 1 );
                    hostAudioSource0.connect( this._inputProcessor );
                    this._inputProcessor.connect( audioContext0.destination );
                    this._inputProcessor.onaudioprocess = this._inputProcessorOnAudioProcessFunc;
                    this._recording = new AudioRecording( audioContext0.sampleRate );
                    this._isStarted = true;
                    failed = false;
                } finally {
                    if ( failed ) {
                        if ( this._inputProcessor !== null ) {
                            this._recording = null;
                            this._performCleanupCommon();
                        }
                    }
                }
            }
        },

        _onTryStartCompleted: {
            value: function (statusCode) {
                this.raiseEvent( "tryStartCompleted", [ this, statusCode ] );
            }
        },

        _inputProcessorOnAudioProcess: {
            value: function ( e ) {
                assert(( this._recording !== null ) === this._isStarted );
                this._recording._append( e.inputBuffer );
            }
        },
		
	    _performCleanupCommon: { value: function() {
	        try {
	            this._inputProcessor.disconnect(audioContext0.destination);
	        } catch (e2) {
	            console.warn(e2);
	        }
	        try {
	            hostAudioSource0.disconnect(this._inputProcessor);
	        } catch (e1) {
	            console.warn(e1);
	        }
	        this._inputProcessor = null;
	    } },
		
	    _onStopped: {
	        value: function () {
	            this.raiseEvent( "stopped" );
	        }
	    },

	    stop: {
	        value: function () {
	            if ( this._isStarted ) {
	                this._performCleanupCommon();
	                this._isStarted = false;
	                this._onStopped();
	            } else if ( this._isStarting ) {
	                getHostAudioSourceAccess_callbacks.splice(
                        getHostAudioSourceAccess_callbacks.indexOf( self._getHostAudioSourceAccess_callbackFunc ),
                        1 );
	                this._isStarting = false;
	                this._onTryStartCompleted("abort");
	            }
	        }
	    },

	    clearRecording: {
	        value: function () {
	            if ( this._isStarted ) {
	                throw Error();
	            }
	            this._recording = null;
	        }
	    }
	});
	
	Object.defineProperties(AudioRecorder, {
		isSupported: {
		    get: function () {
				return isAudioRecorderSupported;
			}
		}
	});

	
	function AudioRecording(sampleRate) {
		this._sampleRate = sampleRate;
		this._samples = new Float32Array(1024);
		this._sampleCount = 0;
	}
	AudioRecording.prototype = {
		_append: function(samplesToAppendPerChannel) {
			if (samplesToAppendPerChannel.numberOfChannels !== 1) {
				throw Error(); // not supported
			}
			var samplesToAppend = samplesToAppendPerChannel.getChannelData(0);
			assert(samplesToAppend instanceof Float32Array);
			// samplesToAppend is an array of float32's to be appended to the rest of the samples
			if (this._samples.length - this._sampleCount < samplesToAppend.length) {
				var c = this._samples.length;
				do { c = c * 2; } while (c - this._sampleCount < samplesToAppend.length);
				var newSamples = new Float32Array(c);
				newSamples.set(this._samples, 0);
				this._samples = newSamples;
			}
			this._samples.set(samplesToAppend, this._sampleCount);
			this._sampleCount += samplesToAppend.length;
			console.log(this._sampleCount);
		},
		toWav: function() {
			var buffer = new ArrayBuffer(44 + this._sampleCount * 2);
			var view = new DataView(buffer);
			// inspired by http://audior.ec/recordmp3js/js/recorderWorker.js
			/* RIFF identifier */
			dataView_writeString( view, 0, 'RIFF' );
			/* file length */
			view.setUint32(4, 32 + this._sampleCount * 2, true);
			/* RIFF type */
			dataView_writeString( view, 8, 'WAVE' );
			/* format chunk identifier */
			dataView_writeString( view, 12, 'fmt ' );
			/* format chunk length */
			view.setUint32(16, 16, true);
			/* sample format (raw) */
			view.setUint16(20, 1, true);
			/* channel count */
			//view.setUint16(22, 2, true); /*STEREO*/
			view.setUint16(22, 1, true); /*MONO*/
			/* sample rate */
			view.setUint32(24, this._sampleRate, true);
			/* byte rate (sample rate * block align) */
			//view.setUint32(28, sampleRate * 4, true); /*STEREO*/
			view.setUint32(28, this._sampleRate * 2, true); /*MONO*/
			/* block align (channel count * bytes per sample) */
			//view.setUint16(32, 4, true); /*STEREO*/
			view.setUint16(32, 2, true); /*MONO*/
			/* bits per sample */
			view.setUint16(34, 16, true);
			/* data chunk identifier */
			dataView_writeString( view, 36, 'data' );
			/* data chunk length */
			view.setUint32(40, this._sampleCount * 2, true);

			floatTo16BitPCM(view, 44, this._samples, this._sampleCount);
			return buffer;
		}
	};
	
	function floatTo16BitPCM(output, offset, samples, sampleCount){
		for (var i = 0; i < sampleCount; i++){
			var s = Math.max(-1, Math.min(1, samples[i]));
			output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
			offset += 2;
		}
	}
	
	function dataView_writeString(dv, offset, str){
	  for (var i = 0; i < str.length; i++){
		dv.setUint8(offset + i, str.charCodeAt(i));
	  }
	}
	
	function assert(flag, msg) {
		if (!flag) {
			console.error(msg);
			throw Error("assertion failed: see console.error output for more details (possibly)");
		}
	}
	
	window.AudioRecorder = AudioRecorder;
	window.AudioRecording = AudioRecording;
  
})();