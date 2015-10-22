(function () {

    var undefined;
    var hasOwnPropertyFunc = Object.hasOwnProperty;

    function hasOwnP( obj, p ) {
        return hasOwnPropertyFunc.call( obj, p );
    }

    function ObjectWithEvents() {
        this._eventListeners = {};
    }
    ObjectWithEvents.prototype = Object.create(Object.prototype, {
        addListener: {
            value: function ( eventName, func, thisp ) {
                if ( arguments.length < 2 || arguments.length > 3 ) {
                    throw Error();
                }
                if ( typeof eventName !== "string" || !( func instanceof Function ) ) {
                    throw Error();
                }
                var flag1 = !hasOwnP( this._eventListeners, eventName );
                this._eventListeners[eventName] = new InternalEventListener( func, thisp, this._eventListeners[eventName] );
                if ( flag1 ) {
                    this._onFirstListenerAdded( eventName );
                }
                return new EventListener( this, eventName, func, thisp );
            }
        },
        raiseEvent: {
            value: function ( eventName, argArr ) {
                if ( arguments.length !== 2 ||
                    typeof eventName !== "string" ||
                    Object.prototype.toString.call( argArr ) !== "[object Array]" ) {

                    return;
                }
                var iel = this._eventListeners[eventName];
                if ( iel === undefined ) {
                    return;
                }
                var iels = [iel];
                while ( ( iel = iel._prev ) !== undefined ) iels[iels.length] = iel;
                for ( var i = iels.length; --i >= 0; ) {
                    iels[i]._func.apply( iels[i]._thisp, argArr );
                }
            }
        },
        _onFirstListenerAdded: {
            value: function ( eventName ) {

            }
        },
        _onLastListenerRemoved: {
            value: function ( eventName ) {

            }
        },
        _removeListener: {
            value: function ( eventName, func, thisp ) {
                if ( arguments.length < 2 || arguments.length > 3 ) {
                    throw Error();
                }
                if ( typeof eventName !== "string" || !( func instanceof Function ) ) {
                    throw Error();
                }
                var iel_cur = this._eventListeners[eventName];
                if (iel_cur === undefined) {
                    return;
                }
                if (iel_cur._func === func && iel_cur._thisp === thisp) {
                    var t = iel_cur._prev;
                    if ( t === undefined ) {
                        delete this._eventListeners[eventName];
                        this._onLastListenerRemoved( eventName );
                    } else {
                        this._eventListeners[eventName] = t;
                    }
                    return;
                }
                var iel_prev = iel_cur;
                while ( ( iel_cur = iel_cur._prev ) !== undefined ) {
                    if ( iel_cur._func === func && iel_cur._thisp === thisp ) {
                        iel_prev._prev = iel_cur._prev;
                        break;
                    }
                    iel_prev = iel_cur;
                }
            }
        }
    });

    function InternalEventListener(func, thisp, prev) {
        this._func = func;
        this._thisp = thisp;
        this._prev = prev;
    }

    function EventListener( objectWithEvents, eventName, func, thisp ) {
        this._objectWithEvents = objectWithEvents;
        this._eventName = eventName;
        this._func = func;
        this._thisp = thisp;
    }
    EventListener.prototype = Object.create( Object.prototype, {
        remove: {
            value: function () {
                this._objectWithEvents._removeListener(this._eventName, this._func, this._thisp);
            }
        }
    } );
    

    Object.defineProperties(window, {
        ObjectWithEvents: { value: ObjectWithEvents },
        EventListener: { value: EventListener }
    });

})();