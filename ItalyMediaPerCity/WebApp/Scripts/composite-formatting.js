( function () {

    // Parses mark to be replaced in .NET format strings (search for .NET Composite Formatting on Google).




    function compositeFormatting_MarksParser() {
        this.__results = [];
        this.clear();
    }
    compositeFormatting_MarksParser.prototype = Object.create( Object.prototype, {

        // Assume there is one type of curly bracket. In other words: either only left curly brackets or only 
        // right curly brackets occur in the string. If not all of curly brackets are escaped then this is an 
        // error.
        __run0: {
            value: function ( bStr, bCode ) {
                assert( this.__i < this.__s.length );
                assert( bStr === "{" || bStr === "}" );
                assert( bStr.charCodeAt( 0 ) === bCode );
                while ( true ) {
                    // There is a bracket at position this.__i.
                    if ( !( this.__s.charCodeAt( this.__i + 1 ) === bCode ) ) {
                        // There is no bracket at position this.__i + 1 with the same character code as the one at position this.__i.
                        // Note that it could be the case that this.__s.length <= this.__i + 1 in which case the character at position this.__i + 1 is undefined.
                        // In this case the charCodeAt method will return 0/0.
                        return true;
                    }
                    this.__sPartNorm_appendSubstringOfS( this.__sPartNorm_nextSegStart, this.__i + 1 );
                    this.__sPartNorm_nextSegStart = this.__i + 2;
                    if ( this.__s.length <= this.__sPartNorm_nextSegStart ) {
                        break;
                    }
                    this.__i = this.__s.indexOf( bStr, this.__sPartNorm_nextSegStart );
                    if ( this.__i < 0 ) {
                        this.__sPartNorm_appendSubstringOfS( this.__sPartNorm_nextSegStart, this.__s.length );
                        break;
                    }
                }
                return false;
            }
        },

        __run1: {
            value: function ( iMaxExcl ) {
                assert( this.__i < iMaxExcl );
                while ( true ) {
                    if ( !( this.__s.charCodeAt( this.__i + 1 ) === 125 ) ) {
                        throw Error();
                    }
                    this.__sPartNorm_appendSubstringOfS( this.__sPartNorm_nextSegStart, this.__i + 1 );
                    this.__sPartNorm_nextSegStart = this.__i + 2;
                    if ( iMaxExcl <= this.__sPartNorm_nextSegStart ) {
                        break;
                    }
                    this.__i = this.__indexOfRightCurlyBracket(this.__sPartNorm_nextSegStart);
                    assert( iMaxExcl !== this.__i );
                    if ( this.__i < 0 || iMaxExcl < this.__i ) {
                        break;
                    }
                }
            }   
        },

        __sPartNorm_appendSubstringOfS: {
            value: function ( fromIncl, toExcl ) {
                var t;
                t = this.__sPartNorm;
                if ( t === null ) {
                    this.__sPartNorm = Interval.POOL.getOrAllocate( fromIncl, toExcl );
                    return;
                }
                if ( t instanceof Interval ) {
                    Interval.POOL.recycle( t );
                    this.__sPartNorm = this.__s.substring( t.fromIncl, t.toExcl );
                }
                this.__sPartNorm += this.__s.substring( fromIncl, toExcl );
            }
        },

        __sPartNorm_isEmpty: {
            get: function () {
                var t;
                t = this.__sPartNorm;
                if ( t === null ) {
                    return true;
                }
                if ( t instanceof Interval ) {
                    return t.isEmpty;
                }
                assert( typeof t === "string" );
                return t.length === 0;
            }
        },

        initialize: {
            value: function ( s ) {
                this.__s = s;
                assert( this.__i === 0 );
                assert( this.__results.length === 0 );
                assert( this.__sPartNorm === null );
                assert( this.__sPartNorm_nextSegStart === 0 );
                assert( this.__isWithinMark === false );
                assert( this.__iOfRightCurlyBracket === -2 );
            }
        },

        __toggleIsWithinMark: {
            value: function () {
                this.__sPartNorm_appendSubstringOfS( this.__sPartNorm_nextSegStart, this.__i );
                this.__sPartNorm_nextSegStart = this.__i + 1;
                this.__results.push( this.__sPartNorm );
                this.__sPartNorm = null;
                this.__isWithinMark = true;
                this.__i = this.__sPartNorm_nextSegStart;
            }
        },

        __indexOfRightCurlyBracket: {
            value: function (iFrom) {
                if ( this.__iOfRightCurlyBracket < iFrom && this.__iOfRightCurlyBracket !== -1 ) {
                    this.__iOfRightCurlyBracket = this.__s.indexOf( "}", iFrom );
                }
                return this.__iOfRightCurlyBracket;
            }
        },

        run: {
            // Left curly brackets and right curly brackets are treated specially. They can be escaped by doubling them, that is: { and } are escaped 
            // by writing {{ and }} respectively. 
            value: function () {
                var j, k;
                while ( true ) {
                    // The first iteration can be optimized by unrolling. We don't want to do this since the cons (harder maintenance) weigh heavier then the pros (faster code), if any.
                    j = this.__s.indexOf( "{", this.__i );
                    k = this.__indexOfRightCurlyBracket(this.__i);
                    if ( j < 0 ) {
                        if ( k < 0 ) {
                            // When this.__sPartNorm_nextSegStart is zero this line can be simplified to this.__sPartNorm = this.__s.
                            this.__sPartNorm_appendSubstringOfS( this.__sPartNorm_nextSegStart, this.__s.length );
                            return;
                        }
                        this.__i = k;
                        // This is always false the first iteration.
                        if ( this.__isWithinMark ) {
                            if ( this.__run0( "}", 125 ) ) {
                                this.__toggleIsWithinMark();
                            }
                            if ( this.__i === this.__s.length ) {
                                return;
                            }
                        }
                        if ( this.__run0( "}", 125 ) ) {
                            throw Error();
                        }
                        return;
                    }
                    // This is always false the first iteration.
                    if ( this.__isWithinMark ) {
                        throw Error();
                    }
                    if ( k < 0 ) {
                        this.__i = j;
                        if ( this.__run0( "{", 123 ) ) {
                            throw Error();
                        }
                        return;
                    }
                    if ( k < j ) {
                        this.__i = k;
                        // TODO double indexOf call possible..., result of indexOf in run0 could be used.
                        this.__run1( j );
                    }
                    this.__i = j;
                    if ( this.__i + 1 === this.__s.length ) {
                        assert( !this.__isWithinMark );
                        return;
                    }
                    if ( this.__s.charCodeAt( this.__i + 1 ) === 123 ) {
                        this.__sPartNorm_appendSubstringOfS( this.__sPartNorm_nextSegStart, this.__i + 1 );
                        this.__sPartNorm_nextSegStart = this.__i + 2;
                        this.__i = this.__sPartNorm_nextSegStart;
                    } else {
                        assert( !this.__isWithinMark );
                        this.__toggleIsWithinMark();
                    }
                }
            }
        },

        clear: {
            value: function () {
                var n, i, t;
                n = this.__results.length;
                for ( i = 0; i < n; ++i ) {
                    t = this.__results[i];
                    if ( t instanceof Interval ) {
                        Interval.POOL.recycle( t );
                    }
                }
                this.__results.length = 0;
                if ( this.__sPartNorm instanceof Interval ) {
                    Interval.POOL.recycle( this.__sPartNorm );
                }
                this.__sPartNorm = null;
                this.__sPartNorm_nextSegStart = 0;
                this.__isWithinMark = false;
                this.__iOfRightCurlyBracket = -2;
                this.__s = null;
                this.__i = 0;
            }
        }
    } );



    Object.defineProperties( window, {
        compositeFormatting_MarksParser: { value: compositeFormatting_MarksParser }
    } );



} )();