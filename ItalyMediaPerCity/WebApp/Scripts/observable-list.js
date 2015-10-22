( function () {


    var g = this,
        Array = g.Array, isArray = Array.isArray,
        Object = g.Object, object_prototype = Object.prototype, hasOwnPropF = object_prototype.hasOwnProperty, obj_freeze = Object.freeze,
        ObjectWithEvents = g.ObjectWithEvents,
        Number = g.Number, NUMBER_MAX_INT = 9007199254740992,
        array_empty = obj_freeze( [] ),
        Function = g.Function;


    function returnTrue() {
        return true;
    }

    function equalsFunction_default( a, b ) {
        return a === b;
    }

    function ObservableList( opts ) {
        if ( arguments.length < 1 ) {
            opts = {};
        } else if ( !isPojo( opts ) ) {
            throw Error();
        }
        if ( hasOwnPropF.call( opts, "equalsFunction" ) ) {
            this._eqFunc = opts.equalsFunction;
            if ( !( this._eqFunc instanceof Function ) ) {
                throw Error();
            }
        } else {
            this._eqFunc = equalsFunction_default;
        }
        if ( hasOwnPropF.call( opts, "isValidValueFunction" ) ) {
            this._isValidValFunc = opts.isValidValueFunction;
            if ( !( this._isValidValFunc instanceof Function ) ) {
                throw Error();
            }
        } else {
            this._isValidValFunc = returnTrue;
        }

        var array, i;
        if ( hasOwnPropF.call( opts, "array" ) ) {
            array = opts.array;
            if ( !isArray( array ) ) {
                throw Error();
            }
            i = array.length;
            while ( --i >= 0 ) {
                if ( !hasOwnPropF.call( array, i ) || !this._isValidVal( array[i] ) ) {
                    throw Error();
                }
            }
            this._arr = array.slice( 0 );
        } else {
            this._arr = [];
        }
        ObjectWithEvents.call( this, opts );
    }

    ObservableList.prototype = Object.create( ObjectWithEvents.prototype, {
        _initElems: {
            value: function ( value ) {
                var a, i, n;
                a = this._arr;
                n = a.length;
                for ( i = 0; i < n; ++i ) {
                    a[i] = value;
                }
            }
        },
        count: {
            get: function () {
                return this._arr.length;
            }
        },
        get: {
            value: function ( idx ) {
                var a;
                if ( !Number_isInteger( idx ) || idx < 0 || idx >= ( a = this._arr ).length ) {
                    throw Error();
                }
                return a[idx];
            }
        },
        set: {
            value: function ( idx, value ) {
                var a, pv, ef, t;
                if ( !Number_isInteger( idx ) || idx < 0 || idx > NUMBER_MAX_INT || !this._isValidVal( value ) ) {
                    throw Error();
                }
                pv = ( a = this._arr )[idx];
                ef = this._eqFunc;
                t = ef( pv, value );
                if ( typeof t !== "boolean" ) {
                    throw Error();
                }
                if ( t ) {
                    return;
                }
                a[idx] = value;
                this._onListChanged( listChangeEventArgs_replace( idx, pv, value ) );
            }
        },
        _isValidVal: {
            value: function ( value ) {
                var t;
                t = this._isValidValFunc;
                t = t( value );
                if ( typeof t !== "boolean" ) {
                    throw Error();
                }
                return t;
            }
        },
        _onListChanged: {
            value: function ( lcea ) {
                if ( !( lcea instanceof ListChangeEventArgs ) ) {
                    throw Error();
                }
                this.raiseEvent( "listChanged", [lcea] );
            }
        },

        add: {
            value: function ( value ) {
                this.insert( this.count, value );
            }
        },
        addRange: {
            value: function ( valueArr ) {

                var i, n;
                var value;
                if ( !isIterable( valueArr ) ) {
                    throw Error();
                }
                n = valueArr.length;
                if ( n === 0 ) {
                    return;
                }
                i = 0;
                do {
                    value = valueArr[i];
                    if ( !this._isValidVal( value ) ) {
                        throw Error();
                    }
                } while ( ++i < n );
                i = this._arr.length;
                Array.prototype.splice.apply( this._arr, [i, 0].concat( valueArr ) );
                this._onListChanged( new _ListChangeEventArgs( "insert", -1, [], i, Object.freeze( Array.prototype.slice.call( valueArr, 0 ) ) ) );

            }
        },
        insert: {
            value: function ( idx, value ) {
                var a, t;
                if ( !Number_isInteger( idx ) || idx < 0 ) {
                    throw Error();
                }
                a = this._arr;
                if ( idx > a.length || idx === NUMBER_MAX_INT || !this._isValidVal( value ) ) {
                    throw Error();
                }
                a.splice( idx, 0, value );
                this._onListChanged( listChangeEventArgs_insert( idx, value ) );
            }
        },
        removeAt: {
            value: function ( idx ) {
                var a;
                if ( !Number_isInteger( idx ) || idx < 0 || idx >= ( a = this._arr ).length ) {
                    throw Error();
                }
                a.splice( idx, 1 );
                this._onListChanged( listChangeEventArgs_remove( idx, a[idx] ) );
            }
        },
        indexOf: {
            value: function ( value, i ) {
                var a, len, eqFunc, t;
                if ( arguments.length < 2 ) {
                    i = 0;
                } else if ( !Number_isInteger( i ) || i < 0 || this._arr.length < i ) {
                    throw Error();
                }
                if ( !this._isValidVal( value ) ) {
                    return -1;
                }
                eqFunc = this._eqFunc;
                a = this._arr;
                if ( eqFunc === equalsFunction_default ) {
                    return a.indexOf( value, i );
                }
                len = a.length;
                while ( i < len ) {
                    t = eqFunc( a[i], value );
                    if ( typeof t !== "boolean" ) {
                        throw Error();
                    }
                    if ( t ) {
                        return i;
                    }
                    ++i;
                }
                return -1;
            }
        },
        lastIndexOf: {
            value: function ( value, i ) {
                var a, eqFunc, t;
                a = this._arr;
                if ( arguments.length < 2 ) {
                    i = a.length - 1;
                } else if ( !Number_isInteger( i ) || i < -1 || a.length <= i ) {
                    throw Error();
                }
                if ( !this._isValidVal( value ) ) {
                    return -1;
                }
                eqFunc = this._eqFunc;
                if ( eqFunc === equalsFunction_default ) {
                    return a.lastIndexOf( value, i );
                }
                while ( i >= 0 ) {
                    t = eqFunc( a[i], value );
                    if ( typeof t !== "boolean" ) {
                        throw Error();
                    }
                    if ( t ) {
                        return i;
                    }
                    --i;
                }
                return -1;
            }
        },
        remove: {
            value: function ( value ) {
                var i;
                i = this.lastIndexOf( value );
                if ( i >= 0 ) {
                    this.removeAt( i );
                    return true;
                }
                return false;
            }
        },
        toArray: {
            value: function () {
                return this._arr.slice( 0 );
            }
        },
        clear: {
            value: function () {
                this._arr.length = 0;
                this._onListChanged( listChangeEventArgs_reset() );
            }
        }
    } );

    function ListChangeEventArgs() {
        throw Error();
    }
    function _ListChangeEventArgs( type, oldIdx, oldItems, newIdx, newItems ) {
        this._type = type;
        this._oldIdx = oldIdx;
        this._oldItems = oldItems;
        this._newIdx = newIdx;
        this._newItems = newItems;
    }
    _ListChangeEventArgs.prototype = ListChangeEventArgs.prototype = Object.create( object_prototype, {
        type: { get: function () { return this._type; } },
        oldIndex: { get: function () { return this._oldIdx; } },
        oldItems: { get: function () { return this._oldItems; } },
        newIndex: { get: function () { return this._newIdx; } },
        newItems: { get: function () { return this._newItems; } }
    } );
    Object.defineProperties( ListChangeEventArgs, {
        replace: { value: listChangeEventArgs_replace },
        insert: { value: listChangeEventArgs_insert },
        remove: { value: listChangeEventArgs_remove },
        reset: { value: listChangeEventArgs_reset }
    } );

    function listChangeEventArgs_replace( index, oldValue, newValue ) {
        return new _ListChangeEventArgs( "replace", index, obj_freeze( [oldValue] ), index, obj_freeze( [newValue] ) );
    }

    function listChangeEventArgs_insert( index, value ) {
        return new _ListChangeEventArgs( "insert", -1, array_empty, index, obj_freeze( [value] ) );
    }

    function listChangeEventArgs_remove( index, value ) {
        return new _ListChangeEventArgs( "remove", index, obj_freeze( [value] ), -1, array_empty );
    }

    function listChangeEventArgs_reset() {
        return new _ListChangeEventArgs( "reset", -1, array_empty, -1, array_empty );
    }

    Object.defineProperties( g, {
        ObservableList: { value: ObservableList },
        ListChangeEventArgs: { value: ListChangeEventArgs }
    } );
} )();