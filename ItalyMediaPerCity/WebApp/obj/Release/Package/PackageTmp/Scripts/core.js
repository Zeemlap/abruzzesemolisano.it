( function () {

    var JSON_TYPE_SUBTYPE = "application/json";

    var hasOwnProperty = Object.hasOwnProperty;

    function hasOwnP( obj, pn ) {
        return hasOwnProperty.call(obj, pn );
    }
    function HttpRequest(opts) {
        if (arguments.length === 1 && !isPojo(opts) || arguments.length > 1) {
            throw Error();
        }
        if (arguments.length === 0) {
            opts = {};
        }
        ObjectWithEvents.call(this);
        var keys = Object.getOwnPropertyNames(opts);
        this.__body = null;
        this.__retry_triggerOnNonTimeoutError = false;
        this.__retry_delay = 100;
        this.__timeout = 1 / 0;
        this.__method = "GET";
        this.__url = null;
        for (var i = 0; i < keys.length; ++i) {
            switch (keys[i]) {
                case "method":
                    this.__method = opts.method;
                    switch ( this.__method ) {
                        case "GET":
                        case "POST":
                            break;
                        default:
                            throw Error();
                    }
                    break;
                case "url":
                    this.__url = opts.url;
                    if ( typeof this.__url !== "string" ) {
                        throw Error();
                    }
                    break;
                case "timeout":
                    this.__timeout = opts.timeout;
                    if ( typeof this.__timeout !== "number" || !( 0 <= this.__timeout ) ) {
                        throw Error();
                    }
                    break;
                case "retry_triggerOnNonTimeoutError":
                    this.__retry_triggerOnNonTimeoutError = opts.retry_triggerOnNonTimeoutError;
                    if ( typeof this.__retry_triggerOnNonTimeoutError !== "boolean" ) {
                        throw Error();
                    }
                    break;
                case "body":
                    this.__body = opts.body;
                    if ( !( this.__body instanceof HttpRequestBody ) ) {
                        throw Error();
                    }
                    break;
                default:
                    throw Error();
            }
        }
        if ( this.__url === null ) {
            throw Error();
        }
        this.__hreq = null;
        this.__hreq_onReadyStateChangeFunc = null;
        this.__onTimeoutFunc = null;
        this.__timeout_timeoutId = null;
        this.__retry_timeoutId = null;
        this.__retry_func = null;
        this.__isSent = false;
        this.__isCompleted = false;
    }
    HttpRequest.prototype = Object.create(ObjectWithEvents.prototype, {
        send: {
            value: function () {
                if (!this.__isSent) {
                    if ( this.__timeout > 0 ) {
                        this.__sendCore();
                    } 
                    this.__isSent = true;
                    if (this.__timeout === 0) {
                        this.__completeCommon(null, -2);
                    } else if (this.__timeout < 1 / 0) {
                        this.__onTimeoutFunc = this.__onTimeout.bind(this);
                        this.__timeout_timeoutId = setTimeout(this.__onTimeoutFunc, this.__timeout);
                    }
                }
            }
        },

        __sendCore: {
            value: function () {
                // To be safe, we verify multiple calls to send are not made.
                this.__hreq = new XMLHttpRequest();
                if ( this.__hreq_onReadyStateChangeFunc === null ) {
                    this.__hreq_onReadyStateChangeFunc = this.__hreq_onReadyStateChange.bind( this );
                }
                this.__hreq.onreadystatechange = this.__hreq_onReadyStateChangeFunc;
                this.__hreq.open( this.__method, this.__url );
                if ( this.__body === null ) {
                    this.__hreq.send();
                } else {
                    this.__body.__sendWithXmlHttpRequest( this.__hreq );
                }
                console.log( this.__url, this.__body );
            }
        },

        __onTimeout: {
            value: function () {
                this.__timeout_timeoutId = null;
                this.__abortCommon(-2);
            }
        },
        __hreq_onReadyStateChange: {
            value: function () {
                var contentType, i, result;
                if (this.__hreq.readyState !== 4) {
                    return;
                }
                result = null;
                if (this.__hreq.status === 200) {
                    contentType = this.__hreq.getResponseHeader("Content-Type");
                    if (typeof contentType === "string") {
                        i = /^([!#\$%&'\*\+-\.0-9A-Z^_`a-z|]+\/[!#\$%&'\*\+-\.0-9A-Z^_`a-z|]+);?/.exec(contentType);
                        if (i !== null) {
                            switch (i[1]) {
                                case "application/json":
                                    result = JSON.parse(this.__hreq.responseText);
                                    break;
                                case "text/plain":
                                    result = this.__hreq.responseText;
                                    break;
                                default:
                                    debugger;
                                    break;
                            }
                        }
                    }
                } else if ( this.__retry_triggerOnNonTimeoutError ) {
                    if ( 0 < this.__retry_delay ) {
                        if ( this.__retry_func === null ) {
                            this.__retry_func = this.__sendCore.bind( this );
                        }
                        this.__retry_timeoutId = setTimeout( this.__retry_func, this.__retry_delay );
                        this.__hreq = null;
                    } else {
                        this.__sendCore();
                    }
                    return;
                } 
                this.__completeCommon( result, this.__hreq.status );
            }
        },
        __completeCommon: {
            value: function ( result, statusCode ) {
                if ( this.__timeout_timeoutId !== null ) {
                    clearTimeout( this.__timeout_timeoutId );
                }
                this.__isCompleted = true;
                this.raiseEvent("completed", [result, statusCode]);
            }
        },
        __abortCommon: {
            value: function ( statusCode ) {
                if ( this.__hreq !== null ) {
                    this.__hreq.onreadystatechange = null;
                    this.__hreq.abort();
                } else if ( this.__retry_timeoutId !== null ) {
                    clearTimeout( this.__retry_timeoutId );
                }
                this.__completeCommon( null, statusCode );
            }
        },
        abort: {
            value: function () {
                if ( !this.__isCompleted ) {
                    this.__abortCommon( -1 );
                }
            }
        }
    });

    function HttpRequestBody() {
    }
    HttpRequestBody.prototype = Object.create(Object.prototype, {
        __sendWithXmlHttpRequest: {
            value: function ( hreq ) {
                hreq.send();
            }
        }
    } );

    function HttpRequestFormData( obj ) {
        var pn, i;
        var val;
        var objClone;
        i = arguments.length;
        if ( i === 1 && !isPojo( obj ) ) {
            throw Error();
        }
        this.__formData = new FormData();
        if ( i === 0 ) {
            return;
        }
        pn = Object.getOwnPropertyNames( obj );
        objClone = {};
        for (i = 0; i < pn.length; ++i) {
            val = obj[pn[i]];
            if ( val instanceof ArrayBuffer ) {
                val = new Blob( [val] );
            } else {
                switch ( typeof val ) {
                    case "string":
                        break;
                    case "number":
                        val = "" + val;
                        break;
                    case "boolean":
                        val = "" + val;
                        break;
                    default:
                        throw Error();
                }
            }
            objClone[pn[i]] = val;
            this.__formData.append( pn[i], val );
        }
        this.__obj = objClone;
    }
    HttpRequestFormData.prototype = Object.create(HttpRequestBody.prototype, {
        __sendWithXmlHttpRequest: {
            value: function (hreq) {
                hreq.send(this.__formData);
            }
        },
        getValue: {
            value: function ( name ) {
                if ( hasOwnP( this.__obj, name ) ) {
                    return this.__obj[name];
                }
            }
        }
    });

    Object.defineProperties(HttpRequest, {
        STATUS_TIMEOUT: { value: -2 },
        STATUS_ABORT: { value: -1 }
    });

    Object.defineProperties( window, {
       
        HttpRequest: {
            value: HttpRequest
        },
        HttpRequestBody: {
            value: HttpRequestBody
        },
        HttpRequestFormData: {
            value: HttpRequestFormData
        }
    });


    function Interval( fromIncl, toExcl ) {
        assert( Number_isInteger( fromIncl ) && Number_isInteger( toExcl ) && fromIncl <= toExcl );
        this.__fromIncl = fromIncl;
        this.__toExcl = toExcl;
    }
    Interval.prototype = Object.create( Object.prototype, {
        fromIncl: {
            get: function () {
                return this.__fromIncl;
            }
        },
        toExcl: {
            get: function () {
                return this.__toExcl;
            }
        },
        isEmpty: {
            get: function () {
                return this.__toExcl <= this.__fromIncl;
            }
        }
    } );

    function IntervalPool() {
        throw Error();
    }
    function __IntervalPool() {
        this.__a = [];
    }
    __IntervalPool.prototype = IntervalPool.prototype = Object.create( Object.prototype, {

        getOrAllocate: {
            value: function ( fromIncl, toExcl ) {
                var interval;
                if ( this.__a.length > 0 ) {
                    interval = this.__a.pop();
                    interval.__fromIncl = fromIncl;
                    interval.__toExcl = toExcl;
                } else {
                    interval = new Interval( fromIncl, toExcl );
                }
                return interval;
            }
        },

        recycle: {
            value: function ( interval ) {
                this.__a.push( interval );
            }
        }
    } );
    Object.defineProperties( Interval, {
        POOL: {
            value: new __IntervalPool()
        }
    } );


    function Substring( s, interval ) {
        this.__s = s;
        this.__interval = interval;
    }
    Substring.prototype = Object.create( String.prototype, {
        charCodeAt: {
            value: function ( i ) {
                return this.__s.charCodeAt( i + this.__interval.fromIncl );
            }
        },
        charAt: {
            value: function ( i ) {
                return this.__s.charAt( i + this.__interval.fromIncl );
            }
        },
        length: {
            get: function () {
                return this.__interval.toExcl - this.__interval.fromIncl;
            }
        },
        toString: {
            value: function () {
                return this.__s.substring( this.__interval.fromIncl, this.__interval.toExcl );
            }
        },
        valueOf: {
            value: function () {
                return this.toString();
            }
        }
    } );

    function iString_toEcmaScriptStringLiteral( iString ) {
        var i, n, r;
        n = iString.length;
        r = "\"";
        for ( i = 0; i < n; ++i ) {
            switch ( iString.charCodeAt( i ) ) {
                case 34: // "
                    r += "\\\"";
                    break;
                case 93: // \    
                    r += "\\\\";
                    break;
                case 0xA: // <LF>
                    r += "\\n";
                    break;
                case 0xD: // <CR>
                    r += "\\r";
                    break;
                case 0x2028: // Line Separator
                    r += "\\u2028";
                    break;
                case 0x2029: // Paragraph Separator
                    r += "\\u2029";
                    break;
                default:
                    r += iString.charAt( i );
                    break;
            }
        }
        r += "\"";
        return r;
    }


    function Pair( a, b ) {
        this.__a = a;
        this.__b = b;
    }
    Pair.prototype = Object.create( Object.prototype, {
        a: {
            get: function () { return this.__a; },
            set: function ( value ) { this.__a = value; }
        },
        b: {
            get: function () { return this.__b; },
            set: function ( value ) { this.__b = value; }
        }
    } );
    function PairPool() {
        throw Error();
    }
    function __PairPool() {
        this.__a = [];
    }
    __PairPool.prototype = PairPool.prototype = Object.create( Object.prototype, {
        getOrAllocate: {
            value: function ( a, b ) {
                var p;
                if ( this.__a.length > 0 ) {
                    p = this.__a.pop();
                    p.a = a;
                    p.b = b;
                } else {
                    p = new Pair( a, b );
                }
                return p;
            }
        },
        recycle: {
            value: function ( p ) {
                this.__a.push( p );
            }
        }
    } );
    Object.defineProperties( Pair, {
        POOL: { value: new __PairPool() }
    });


    Object.defineProperties( window, {
        Interval: { value: Interval },
        IntervalPool: { value: IntervalPool },
        Substring: { value: Substring },
        iString_toEcmaScriptStringLiteral: { value: iString_toEcmaScriptStringLiteral },
        Pair: { value: Pair },
        PairPool: { value: PairPool }
    } );



    function assert( flag ) {
        if ( !flag ) {
            throw Error();
        }
    }
    function isPojo( value ) {
        return value != null && Object.getPrototypeOf( value ) === Object.prototype;
    }
    function Number_is01( num ) {
        return typeof num === "number" && 0 <= num && num <= 1;
    }
    function Number_isByte( num ) {
        return typeof num === "number" && 0 <= num && num <= 255;
    }
    function Number_byteTo01( num ) {
        assert( Number_isByte( num ) );
        return num * ( 1 / 256 );
    }
    function Number_01ToByte( num ) {
        assert( Number_is01( num ) );
        return num === 1 ? 255 : 0 | ( num * 256 );
    }
    function Number_isInteger( num ) {
        assert( typeof num === "number" );
        return num % 1 === 0;
    }
    function Array_insertUninitializedRange( array, i, n ) {
        var j;
        assert( array instanceof Array );
        assert( Number_isInteger( i ) && 0 <= i );
        assert( Number_isInteger( n ) && 0 <= n );
        if ( i > array.length ) {
            throw Error();
        }
        if (i === array.length) {
            array.length += n;
        } else {
            array.length += n;
            for (j = i + n; --j >= i;) {
                array[j + n] = array[j];
            }
        }
    }
    var Number_MAX_DECREMENTABLE = 9007199254740992;
    Object.defineProperties( window, {
        assert: { value: assert },
        isPojo: { value: isPojo },
        Number_is01: { value: Number_is01 },
        Number_isByte: { value: Number_isByte },
        Number_byteTo01: { value: Number_byteTo01 },
        Number_01ToByte: { value: Number_01ToByte },
        Number_isInteger: { value: Number_isInteger },
        Number_MAX_DECREMENTABLE: { value: Number_MAX_DECREMENTABLE },
        Array_insertUninitializedRange: { value: Array_insertUninitializedRange }
    } );



    function cloneFunction(orig, maxDepth) {

        var clone;
        clone = function () {
            return orig.apply(this, arguments);
        };
        if (Object.getPrototypeOf(clone) !== Object.getPrototypeOf(orig)) {
            throw Error();
        }
        setCloneProperties(orig, clone, maxDepth);
        return clone;
    }

    function setCloneProperties(orig, clone, maxDepth) {

        var keys = Object.getOwnPropertyNames(orig);
        for (var i = 0; i < keys.length; ++i) {
            var propDescr = Object.getOwnPropertyDescriptor(orig, keys[i]);
            if ("value" in propDescr && 0 < maxDepth) {
                propDescr.value = cloneValueCore(propDescr.value, maxDepth - 1);
            }
            Object.defineProperty(clone, keys[i], propDescr);
        }
    }

    function cloneValueCore(orig, maxDepth) {
        switch (typeof orig) {
            case "string":
            case "number":
            case "boolean":
            case "undefined":
                return orig;
            case "function": // functions and in some cases RegExp objects
                return cloneFunction(orig, maxDepth);
            case "object":
                if (orig === null) {
                    return orig;
                }
                break;
        }
        if (orig instanceof Node) {
            return orig;
        }
        if (orig instanceof RegExp || orig instanceof Date || orig instanceof RegExp || orig instanceof Number || orig instanceof String || orig instanceof Boolean) {
            throw Error();
        }
        var clone = Object.create(Object.getPrototypeOf(orig));
        setCloneProperties(orig, clone, maxDepth);
        return clone;
    }

    // dom nodes, strings, booleans, number and the undefined and null value are never cloned
    // circular references are not detected and will result in a stack overflow or out of memory error
    // an error will be thrown if cloning might not result in exactly the same object (due to this not being implemented)
    function cloneValue( orig, maxDepth ) {
        if ( arguments.length < 2 ) {
            maxDepth = 0;
        } else if (typeof maxDepth !== "number" || !(0 <= maxDepth && (maxDepth === 1/0 || maxDepth % 1 === 0))) {
            throw Error();
        }
        return cloneValueCore(orig, maxDepth);
    }

    function htmlElem_get( selector, context ) {
        var res;
        res = htmlElem_getAll( selector, context );
        if ( res.length !== 1 ) {
            throw Error();
        }
        return res[0];
    }

    function htmlElem_getAll( selector, context ) {
        var res;
        if ( arguments.length === 0 || arguments.length > 2 ) {
            throw Error();
        }
        if ( typeof selector !== "string" ) {
            throw Error();
        }
        if ( arguments.length === 2 ) {
            if ( !( context instanceof HTMLElement ) ) {
                throw Error();
            }
        } else {
            context = document;
        }
        res = context.querySelectorAll( selector );
        return Array.prototype.slice.call( res, 0 );
    }

    function elem_display(elem, flag) {
        if (typeof flag !== "boolean" || !(elem instanceof Element)) {
            throw Error();
        }
        elem.style.display = flag ? "" : "none";
    }

    function elem_getAttr(elem, attrName) {
        var v;
        if (!(elem instanceof Element && typeof attrName === "string")) {
            throw Error();
        }
        v = elem.getAttribute(attrName);
        if (v !== null && v.length === 0) {
            if (!elem.hasAttribute(attrName)) {
                v = null;
            }
        }
        return v;
    }

    function svgElem_create( tagName ) {
        var svgElem;
        svgElem = document.createElementNS( "http://www.w3.org/2000/svg", tagName );
        return svgElem;
    }

    function svgElem_createSvg() {
        var svgSvgElem;
        svgSvgElem = svgElem_create( "svg" );
        svgSvgElem.setAttribute( "xmlns", "http://www.w3.org/2000/svg" );
        svgSvgElem.setAttribute( "version", "1.1" );
        return svgSvgElem;
    }

    function svgElem_setFill_solidColor( svgElem, color ) {
        assert( svgElem instanceof SVGElement && color instanceof Color );
        setOwnSrcPropertiesOnDstAsAttrs( {
            fill: color.toString( "rgb_bytes_css" ),
            "fill-opacity": color.a + ""
        }, svgElem );
    }

    function svgElem_setStroke_solidColor( svgElem, color ) {
        assert( svgElem instanceof SVGElement && color instanceof Color );
        setOwnSrcPropertiesOnDstAsAttrs( {
            stroke: color.toString( "rgb_bytes_css" ),
            "stroke-opacity": color.a + ""
        }, svgElem );
    }

    function node_parents( n ) {
        var p = [];
        while ( n !== null ) {
            p.unshift( n );
            n = n.parentNode;
        }
        return p;
    }

    function node_deepestCommonAncestorOrSelf( n1, n2 ) {
        
        if ( !( n1 instanceof Node ) || !( n2 instanceof Node ) ) {
            throw Error();
        }
        var p1 = node_parents( n1 );
        var p2 = node_parents( n2 );
        if ( p1[0] !== p2[0] ) {
            return null;
        }
        var n = Math.min( p1.length, p2.length );
        for ( var i = 1; i < n; ++i ) {
            if ( p1[i] !== p2[i] ) {
                return p1[i - 1];
            }
        }
        if ( p1.length < p2.length ) {
            return n1;
        }
        return n2;
    }

    Object.defineProperties( window, {
        node_deepestCommonAncestorOrSelf: { value: node_deepestCommonAncestorOrSelf },
        cloneValue: { value: cloneValue },
        elem_display: { value: elem_display },
        elem_getAttr: { value: elem_getAttr },
        elem_addClassNames: { value: elem_addClassNames },
        elem_hasClassName: { value: elem_hasClassName },
        elem_removeClassNames: { value: elem_removeClassNames },
        ClassNameList_normalize: { value: ClassNameList_normalize },
        htmlElem_get: { value: htmlElem_get },
        htmlElem_getAll: { value: htmlElem_getAll },
        svgElem_create: { value: svgElem_create },
        svgElem_createSvg: { value: svgElem_createSvg },
        svgElem_setFill_solidColor: { value: svgElem_setFill_solidColor },
        svgElem_setStroke_solidColor: { value: svgElem_setStroke_solidColor }
    } );

    function BooleanBox() {
        this.value = false;
    }

    function ClassNameList_normalize( value ) {
        var classNames;
        var i, n;
        var t;
        if ( typeof value === "string" ) {
            classNames = value.split( /[ \t\r\f\n]+/g );
            if ( classNames[classNames.length - 1].length === 0 ) {
                --classNames.length;
            }
            if ( 0 < classNames.length && classNames[0].length === 0 ) {
                classNames.shift();
            }
        } else {
            if ( !isIterable( value ) ) {
                throw Error();
            }
            n = value.length;
            classNames = new Array();
            for ( i = 0; i < n; ++i ) {
                t = value[i];
                if ( typeof t !== "string" || /[ \t\r\f\n]/.test( t ) ) {
                    throw Error();
                }
                classNames[i] = t;
            }
        }
        return classNames;
    }
    function elem_removeClassNames(elem, classNames) {
        var iBegin, iEndIncl, i, classNames_i;
        var s, booleanBox;
        if ( !( elem instanceof Element ) ) {
            throw Error();
        }
        if ( typeof classNames === "string" ) {
            classNames = classNames.split( /[ \r\n\f\t]/ );
            iBegin = 0;
            iEndIncl = classNames.length - 1;
            if ( 0 <= iEndIncl ) {
                if ( classNames[iEndIncl].length === 0 ) {
                    --iEndIncl;
                }
                if ( classNames[iBegin].length === 0 ) {
                    ++iBegin;
                }
            }
        } else {
            if ( !isIterable( classNames ) ) {
                throw Error();
            }
            iBegin = 0;
            iEndIncl = classNames.length - 1;
            for ( i = iBegin; i <= iEndIncl; ++i ) {
                classNames_i = classNames[i];
                if ( typeof classNames_i !== "string" || DelimitedTokenString_containsDelimiter( classNames_i ) ) {
                    throw Error();
                }
            }
        }
        s = elem.className;
        booleanBox = new BooleanBox();
        for ( i = iBegin; i <= iEndIncl; ++i ) {
            s = DelimitedTokenString_removeAll( s, classNames[i], DelimitedTokenString_utf16CodeUnitIsDelimiterFunction, booleanBox );
        }
        elem.className = s;
        return elem;
    }
    function elem_addClassNames( elem, classNames ) {
        var iBegin, iEndIncl, i, classNames_i;
        var s;
        if ( !( elem instanceof Element ) ) {
            throw Error();
        }
        if ( typeof classNames === "string" ) {
            classNames = classNames.split( /[ \r\n\f\t]/ );
            iBegin = 0;
            iEndIncl = classNames.length - 1;
            if ( 0 <= iEndIncl ) {
                if ( classNames[iEndIncl].length === 0 ) {
                    --iEndIncl;
                }
                if ( classNames[iBegin].length === 0 ) {
                    ++iBegin;
                }
            }
        } else {
            if ( !isIterable( classNames ) ) {
                throw Error();
            }
            iBegin = 0;
            iEndIncl = classNames.length - 1;   
            for ( i = iBegin; i <= iEndIncl; ++i ) {
                classNames_i = classNames[i];
                if ( typeof classNames_i !== "string" || DelimitedTokenString_containsDelimiter(classNames_i) ) {
                    throw Error();
                }
            }
        }
        s = elem.className;
        for ( i = iBegin; i <= iEndIncl; ++i ) {
            classNames_i = classNames[i];
            if ( DelimitedTokenString_indexOf( s, classNames_i, DelimitedTokenString_utf16CodeUnitIsDelimiterFunction ) < 0 ) {
                s = ( s.length === 0 ? classNames_i : ( s + " " + classNames_i ) );
            }
        }
        elem.className = s;
        return elem;
    }      
    function elem_hasClassName( elem, className ) {
        if (!(elem instanceof Element)) {
            throw Error();
        }
        if ( typeof className !== "string" || DelimitedTokenString_containsDelimiter( className ) ) {
            throw Error();
        }
        return 0 <= DelimitedTokenString_indexOf( elem.className, className, DelimitedTokenString_utf16CodeUnitIsDelimiterFunction );
    }

    function DelimitedTokenString_containsDelimiter(str) {
        return /[ \r\n\f\t]/.test(str);
    }
    function DelimitedTokenString_utf16CodeUnitIsDelimiterFunction(cp) {
        switch ( cp ) {
            case 0x20:
            case 0x09:
            case 0x0A:
            case 0x0C:
            case 0x0D:
                return true;
        }
        return false;
    }
    function DelimitedTokenString_removeAll( s_in, token, isDelimiterFunction, changedFlag ) {
        var i;
        var scan_beg;
        var t1;
        var s_curSectionToRetain_beg;
        var s_out;
        // Assume token is a string with length greater than one.
        s_out = "";
        scan_beg = 0;
        s_curSectionToRetain_beg = 0;
        while ( true ) {
            i = s_in.indexOf( token, scan_beg );
            if ( i < 0 ) {
                changedFlag.value = ( 0 < s_curSectionToRetain_beg );
                s_out += s_in.substring( s_curSectionToRetain_beg );
                return s_out;
            }
            t1 = i + token.length;
            if ( i === 0 || isDelimiterFunction( s_in.charCodeAt( i - 1 ) ) ) {
                if ( s_in.length === t1 || isDelimiterFunction( s_in.charCodeAt( t1 ) ) ) {
                    if ( 1 < i ) {
                        s_out += s_in.substring( s_curSectionToRetain_beg, i - 1 );
                    }
                    if ( s_in.length === t1 ) {
                        changedFlag.value = true;
                        return s_out;
                    }
                    s_curSectionToRetain_beg = t1;
                }
            }
            scan_beg = t1 + 1;
        }
    }

    function DelimitedTokenString_indexOf( s, token, isDelimiterFunction ) {
        var scan_beg, i, t1;
        scan_beg = 0;
        while ( true ) {
            i = s.indexOf( token, scan_beg );
            if ( i < 0 ) {
                return -1;
            }
            t1 = i + token.length;
            if ( ( i === 0 || isDelimiterFunction( s.charCodeAt( i - 1 ) ) ) &&
                ( t1 === s.length || isDelimiterFunction( s.charCodeAt( t1 ) ) ) ) {
                return i;
            }
            scan_beg = t1 + 1;
        }
    }



    function htmlEncode(value) {
        assert( typeof value === "string" );
        return $( "<div/>" ).text( value ).html();
    }
    
    function htmlDecode( value ) {
        assert( typeof value === "string" );
        return $( "<div/>" ).html( value ).text();
    }             
    Object.defineProperties( window, {
        htmlEncode: { value: htmlEncode },
        htmlDecode: { value: htmlDecode }
    });

    Object.defineProperties(window, {
        pojoToUrlQueryString: {
            value: function (obj) {
                var pnarr, pn, i, n;
                var pv;
                var s;
                if (!isPojo(obj)) {
                    throw Error();
                }
                pnarr = Object.getOwnPropertyNames(obj);
                n = pnarr.length;
                i = 0;
                if (0 < n) {
                    s = "";
                    do {
                        pn = pnarr[i];
                        pv = obj[pn];
                        if (typeof pv !== "string") {
                            throw Error();
                        }
                        if (s.length > 0) {
                            s += "&";
                        }
                        s += encodeURIComponent(pn) + "=" + encodeURIComponent(pv);
                    } while (++i < n);
                } else {
                    s = null;
                }
                return s;
            }
        },
        pojoFromUrlQueryString: {
            value: function (str, i, n) {
                var argN, j, k, name, value;
                var pojo;
                if (typeof str !== "string") {
                    throw Error();
                }
                argN = arguments.length;
                if (argN < 2) {
                    i = 0;
                }
                if (argN < 3) {
                    n = str.length;
                }
                pojo = {};
                while (true) {
                    j = str.indexOf("&", i);
                    k = str.indexOf("=", i);
                    if (k < 0 || (0 <= j && j < k)) {
                        throw Error();
                    }
                    name = decodeURIComponent(str.substring(i, k));
                    if (j < 0) {
                        j = n;
                    }
                    value = decodeURIComponent(str.substring(k + 1, j));
                    if ( hasOwnP( pojo, name ) ) {
                        throw Error();
                    }
                    pojo[name] = value;
                    i = j + 1;
                    if (n <= i) {
                        break;
                    }
                }
                return pojo;
            }
        },
        isIterable: {
            value: function ( obj ) {
                var i, n;
                if ( !( obj instanceof Object ) ) {
                    throw Error();
                }
                if ( !hasOwnP( obj, "length" ) ) {
                    return false;
                }
                n = obj.length;
                if ( !( typeof n === "number" && 0 <= n && n <= Number_MAX_DECREMENTABLE && n % 1 === 0 ) )
                    for ( i = 0; i < n; ++i ) {
                        if ( !hasOwnP( obj, i ) ) {
                            return false;
                        }
                    }
                return true;
            }
        }
    });


    function Dictionary() {
        this.__keys = [];
        this.__values = [];
    }
    Dictionary.prototype = Object.create( Object.prototype, {
        count: {
            get: function () {
                return this.__keys.length;
            }
        },
        clear: {
            value: function () {
                this.__keys.length = 0;
                this.__values.length = 0;
            }
        },
        get: {
            value: function ( key, defaultValue ) {
                var argN = arguments.length;
                if ( argN < 1 ) {
                    throw Error();
                }
                var i = this.__keys.indexOf( key );
                if ( 0 <= i ) {
                    return this.__values[i];
                }
                if ( argN < 2 ) {
                    // Key not found and default value is not specified. 
                    throw Error();
                }
                return defaultValue;
            }
        },
        set: {
            value: function ( key, value ) {
                var argN = arguments.length;
                if ( argN < 2 ) {
                    throw Error();
                }
                var i = this.__keys.indexOf( key );
                if ( i < 0 ) {
                    i = this.__keys.length;
                    this.__keys[i] = key;
                }
                this.__values[i] = value;
                return value;
            }
        },
        containsKey: {
            value: function (key) {
                var argN = arguments.length;
                if ( argN < 1 ) {
                    throw Error();
                }
                return 0 <= this.__keys.indexOf( key );
            }
        },
        remove: {
            value: function ( key ) {
                var argN = arguments.length;
                if ( argN < 1 ) {
                    throw Error();
                }
                var i = this.__keys.indexOf( key );
                if ( 0 <= i ) {
                    this.__keys.splice( i, 1 );
                    this.__values.splice( i, 1 );
                    return true;
                }
                return false;
            }
        }
    } );

    var hostObjectMap = new Dictionary();
    function HostObject( hostObject ) {
        ObjectWithEvents.call( this );
        this.__hostObject = hostObject;
        hostObject.setAttribute( "data-x-host-object-type", this.hostObjectType );
        hostObjectMap.set( hostObject, this );
    }
    HostObject.prototype = Object.create( ObjectWithEvents.prototype, {
        hostObjectType: {
            get: function () {
                return "HostObject";
            }
        },
        hostObject: {
            get: function () {
                return this.__hostObject;
            }
        },
        dispose: {
            value: function () {
                hostObjectMap.remove( this.__hostObject );
                this.__hostObject = null;
            }
        }
    } );
    Object.defineProperties( HostObject, {
        get: {
            value: function ( hostObject ) {
                var x;
                if ( hostObject instanceof HostObject ) {
                    return hostObject;
                }
                x = hostObjectMap.get( hostObject, null );
                return x;
            }
        }
    } );


    function XElement( element ) {
        if ( !( element instanceof Element ) ) {
            throw Error();
        }
        HostObject.call( this, element );
        this.__resizePollIntervalId = null;
        this.__resizePollFunc = null;
        this.__lastWidth = null;
        this.__lastHeight = null;
    }
    XElement.prototype = Object.create( HostObject.prototype, {
        element: {
            get: function () {
                return this.hostObject;
            }
        },
        hostObjectType: {
            get: function () {
                return "XElement";
            }
        },
        _onFirstListenerAdded: {
            value: function ( eventName ) {
                if ( eventName === "resize" ) {
                    if ( this.__resizePollFunc === null ) {
                        this.__resizePollFunc = this.__resizePoll.bind( this );
                    }
                    this.__resizePollIntervalId = setInterval( this.__resizePollFunc, 200 );
                    this.__lastWidth = this.element.offsetWidth;
                    this.__lastHeight = this.element.offsetHeight;
                }
            }
        },
        dispose: {
            value: function () {
                HostObject.prototype.dispose.call( this );
                if ( this.__resizePollIntervalId !== null ) {
                    clearInterval( this.__resizePollIntervalId );
                    this.__resizePollIntervalId = null;
                }
            }
        },
        __resizePoll: {
            value: function () {
                var w, h;
                w = this.element.offsetWidth;
                h = this.element.offsetHeight;
                if ( this.__lastWidth !== w ||
                    this.__lastHeight !== h ) {
                    this.__lastWidth = w;
                    this.__lastHeight = h;
                    this.raiseEvent( "resize", [] );
                }
            }
        },
        _onLastListenerRemoved: {
            value: function ( eventName ) {
                if ( eventName === "resize" ) {
                    clearInterval( this.__resizePollIntervalId );
                    this.__resizePollIntervalId = null;
                }
            }
        }
    } );
    Object.defineProperties( XElement, {
        getOrCreate: {
            value: function ( element ) {
                if ( element instanceof XElement ) {
                    return element;
                }
                if ( element instanceof Element ) {
                    var xel = hostObjectMap.get( element, null );
                    if ( xel === null ) {
                        xel = new XElement( element );
                    }
                    return xel;
                }
                throw Error();
            }
        }
    } );


    function FormField( elem, name ) {
        XElement.call( this, elem );   
        if (typeof name !== "string") {
            throw Error();
        }
        this.__name = name;
    }
    FormField.prototype = Object.create( XElement.prototype, {
        hostObjectType: {
            get: function () {
                return "FormField";
            }
        },
        name: {
            get: function() {
                return this.__name;
            },
            set: function(value) {
                this.__name = value;
            }
        },
        serializeForForm: {
            value: function (formSerInfo) {
            }
        }
    } );

    function FormSerializationInfo( pojo ) {
        this.__pojo = pojo;
    }
    FormSerializationInfo.prototype = Object.create( Object.prototype, {
        add: {
            value: function ( key, value ) {
                if ( typeof key !== "string" && ( typeof value !== "string" || !( value instanceof ArrayBuffer ) ) ) {
                    throw Error();
                }
                if ( hasOwnP( this.__pojo, key ) ) {
                    throw Error();
                }
                this.__pojo[key] = value;
            }
        }
    } );

    function getJQFieldElems( containerElem ) {
        var jqFieldElems = $( "textarea, select, input:not(.hidden), *[data-x-host-object-type]", containerElem );
        return jqFieldElems;
    }

    function formGetFieldElementFromName( containerElem ) {
        var jqFieldElems = getJQFieldElems( containerElem );
        var fieldElemFromName = {};
        var elem, t1, t2, fieldName;
        for ( var i = 0, n = jqFieldElems.length; i < n; ++i ) {
            elem = jqFieldElems[i];
            t1 = elem.getAttributeNode( "data-x-host-object-type" );
            if ( t1 !== null ) {
                t2 = HostObject.get( elem );
                if ( t2 === null ) {
                    // Element has attribute data-x-host-object-type and therefore is expected to be wrapped by a HostObject (but is not).
                    throw Error();
                }
                if ( !(t2 instanceof FormField) ) {
                    continue;
                }
                fieldName = t2.name;
            } else {
                fieldName = elem.name;
                if ( elem.tagName.toUpperCase() === "INPUT" ) {
                    switch ( elem.type ) {
                        case "checkbox":
                            t1 = getJQueryMobileCheckBoxRoot( elem );
                            if ( t1 !== null ) {
                                elem = t1;
                            }
                            break;
                        case "text":
                        case "number":
                            t1 = getJQueryMobileTextBoxRoot( elem );
                            if ( t1 !== null ) {
                                elem = t1;
                            }
                            break;
                    }
                } else if ( elem.tagName.toUpperCase() === "SELECT" ) {
                    t1 = getJQueryMobileSelectRoot( elem );
                    if ( t1 !== null ) {
                        elem = t1;
                    }
                }
            }
            if ( hasOwnP( fieldElemFromName, fieldName ) ) {
                throw Error();
            }
            fieldElemFromName[fieldName] = elem;
        }
        return fieldElemFromName;
    }

    function formToPojo( containerElem ) {
        var jqFieldElems = getJQFieldElems( containerElem );
        var n = jqFieldElems.length;
        var pojo = {};
        var pojo_serInfo;
        for ( var i = 0; i < n; ++i ) {
            var t1 = jqFieldElems[i];
            var t2 = t1.getAttributeNode( "data-x-host-object-type" );
            if ( t2 !== null ) {
                t2 = HostObject.get( t1 );
                if ( t2 === null ) {
                    // Element has attribute data-x-host-object-type and therefore is expected to be wrapped by a HostObject (but is not).
                    throw Error();
                }
                if ( t2 instanceof FormField ) {
                    if (pojo_serInfo === undefined) {
                        pojo_serInfo = new FormSerializationInfo( pojo );
                    }
                    t2.serializeForForm( pojo_serInfo );
                }
                continue;
            }
            switch (t1.type ) {
                case "checkbox":
                    t2 = t1.checked;
                    break;
                default:
                    t2 = t1.value;
                    if (t2.length === 0) {
                        continue;
                    }
                    break;
            }   
            if ( hasOwnP( pojo, t1.name ) ) {
                // multiple form elements have the same name
                throw Error();
            }
            pojo[t1.name] = t2;
        }
        return pojo;
    }

    function FileInput( htmlElement, name ) {
        var jqFileInputElems;
        var jqFileNameElems;
        var flag1 = true;
        try {
            FormField.call( this, htmlElement, name );
            jqFileInputElems = $( "input.hidden", htmlElement );
            if ( jqFileInputElems.length !== 1 || jqFileInputElems[0].type !== "file" ) {
                throw Error();
            }
            jqFileNameElems = $( ".file-name", htmlElement );
            if ( jqFileNameElems.length !== 1 ) {
                throw Error();
            }
            this.__file = null;
            this.__fileName = null;
            this.__fileAsArrayBuffer = null;
            this.__fileNameElem = jqFileNameElems[0];
            this.__fileInputElem = jqFileInputElems[0];
            $( this.__fileInputElem ).change( this.__fileInputElem_onChange.bind( this ) );

            this.__fileReader_onLoadEndFunc = this.__fileReader_onLoadEnd.bind( this );
            this.__fileReader = null;
            this.__fileReader_isAborted = false;
            flag1 = false;
        } finally {
            if ( flag1 ) {
                FormField.prototype.dispose.call( this );
            }
        }
    }
    FileInput.prototype = Object.create( FormField.prototype, {

        serializeForForm: {
            value: function(formSerInfo) {
                if (this.__fileAsArrayBuffer !== null) {                                  
                    formSerInfo.add( this.name + "Data", this.__fileAsArrayBuffer );
                    if ( this.__fileName !== null ) {
                        formSerInfo.add( this.name + "Name", this.__fileName );
                    }
                    if ( this.__fileType !== null ) {
                        formSerInfo.add( this.name + "Type", this.__fileType );
                    }
                }
            }
        },

        __fileInputElem_onChange: {
            value: function () {
                var files;
                var file;

                var t1;
                var hostFilePath;
                var fileNameOverride;
                hostFilePath = this.__fileInputElem.value;
                files = this.__fileInputElem.files;
                if ( files.length > 1 ) {
                    alert( "Multiple files were selected, only the first one will be used." );
                }
                file = files.length > 0 ? files[0] : null;
                fileNameOverride = null;
                if ( file !== null && !/^\s*$/.test( hostFilePath ) ) {
                    t1 = hostFilePath.lastIndexOf( "/" );
                    if ( t1 < 0 ) {
                        t1 = hostFilePath.lastIndexOf( "\\" );
                    }
                    t1 = ( 0 <= t1 ? hostFilePath.substring( t1 + 1 ) : hostFilePath );
                    fileNameOverride = t1.length === 0 ? null : t1;
                }
                this.setFile( file, fileNameOverride );
            }
        },

        file: {
            get: function () {
                return this.__file;
            }
        },

        fileName: {
            get: function () {
                return this.__fileName;
            }
        },

        fileType: {
            get: function () {
                return this.__fileType;
            }
        },

        fileAsArrayBuffer: {
            get: function () {
                return this.__fileAsArrayBuffer;
            }
        },

        __setFileName: {
            value: function ( value ) {
                this.__fileName = value;
                this.__fileNameElem.innerHTML = value === null ? "&nbsp;" : htmlEncode( value );
            }
        },

        setFile: {
            value: function ( value, fileNameOverride ) {

                var old;
                var wasFileAsArrayBufferSetToNull;
                var oldFileAsArrayBuffer;
                var oldName;
                var oldType;
                var newName;
                var newType;
                if ( !( value === null || value instanceof File ) ) {
                    throw Error();
                }
                if ( 1 < arguments.length ) {
                    newName = fileNameOverride;
                    if ( newName !== null && typeof newName !== "string" ) {
                        throw Error();
                    }
                }
                old = this.__file;
                if ( old === value ) {
                    oldName = this.__fileName;
                    if ( newName !== undefined && oldName !== newName ) {
                        this.__setFileName( newName );
                        this.raiseEvent();
                    }
                    return;
                }
                this.__file = value;
                oldName = this.__fileName;
                oldType = this.__fileType;
                newType = value === null ? null : value.type;
                if ( newName === undefined ) {
                    newName = value === null ? null : value.name;
                }
                if ( oldName !== newName ) {
                    this.__setFileName( newName );
                }
                this.__fileType = newType;
                if ( this.__fileReader !== null ) {
                    this.__fileReader_isAborting = true;
                    this.__fileReader.abort();
                }
                wasFileAsArrayBufferSetToNull = false;
                if ( value !== null ) {
                    this.__fileReader = new FileReader();
                    this.__fileReader_isAborting = false;
                    this.__fileReader.onloadend = this.__fileReader_onLoadEndFunc;
                    this.__fileReader.readAsArrayBuffer( value );
                } else {
                    this.__fileReader = null;
                    oldFileAsArrayBuffer = this.__setFileAsArrayBuffer( null );
                    wasFileAsArrayBufferSetToNull = oldFileAsArrayBuffer !== null;
                }
                this.raiseEvent( "propertyChanged", ["file", old, value] );
                if ( oldName !== newName ) {
                    this.raiseEvent( "propertyChanged", ["fileName", oldName, newName] );
                }
                if ( oldType !== newType ) {
                    this.raiseEvent( "propertyChanged", ["fileType", oldType, newType] );
                }
                if ( wasFileAsArrayBufferSetToNull ) {
                    this.raiseEvent( "propertyChanged", ["fileAsArrayBuffer", oldFileAsArrayBuffer, null] );
                }

            }
        },

        setNonFile: {
            value: function ( name, type, fileAsArrayBuffer ) {
                var old, oldName, oldType, oldFileAsArrayBuffer;
                if ( ( name !== null && typeof name !== "string" ) ||
                    ( type !== null && typeof type !== "string" ) ||
                    ( fileAsArrayBuffer !== null && !( fileAsArrayBuffer instanceof ArrayBuffer ) ) ) {
                    throw Error();
                }
                old = this.__file;
                this.__file = null;
                oldName = this.__fileName;
                if ( oldName !== name ) {
                    this.__setFileName( name );
                }
                oldType = this.__fileType;
                this.__fileType = type;
                oldFileAsArrayBuffer = this.__fileAsArrayBuffer;
                this.__fileAsArrayBuffer = fileAsArrayBuffer;
                if ( old !== this.__file ) {
                    this.raiseEvent( "propertyChanged", ["file", old, null] );
                }
                if ( oldName !== name ) {
                    this.raiseEvent( "propertyChanged", ["fileName", oldName, name] );
                }
                if ( oldType !== type ) {
                    this.raiseEvent( "propertyChanged", ["fileType", oldType, type] );
                }
                if ( oldFileAsArrayBuffer !== fileAsArrayBuffer ) {
                    this.raiseEvent( "propertyChanged", ["fileAsArrayBuffer", oldFileAsArrayBuffer, fileAsArrayBuffer] );
                }
            }
        },

        __setFileAsArrayBuffer: {
            value: function ( value ) {
                var old;
                if ( !( value === null || value instanceof ArrayBuffer ) ) {
                    throw Error();
                }
                old = this.__fileAsArrayBuffer;
                this.__fileAsArrayBuffer = value;
                return old;
            }
        },

        __fileReader_onLoadEnd: {
            value: function () {
                var t;
                if ( !this.__fileReader_isAborting ) {
                    t = this.__fileReader.result;
                    this.__fileReader = null;
                    var t2 = this.__setFileAsArrayBuffer( t );
                    if ( t !== t2 ) {
                        this.raiseEvent( "propertyChanged", ["fileAsArrayBuffer", t2, t] );
                    }
                }
            }
        }
    } );

    function getJQueryMobileSelectRoot( fieldElem ) {
        if ( fieldElem === null ) {
            return null;
        }
        if ( !( fieldElem instanceof Element ) ) {
            throw Error();
        }
        if ( fieldElem.tagName.toUpperCase() === "SELECT" ) {
            var t1 = fieldElem;
            var i = 0;
            while ( (t1 = t1.parentNode) !== null && ++i <= 2 ) {
                if ( elem_hasClassName( t1, "ui-select" ) ) {
                    return t1;
                }
            }
        }       
        return null;
    }


    function getJQueryMobileTextBoxRoot( fieldElem ) {
        if ( fieldElem === null ) {
            return null;
        }
        if ( !( fieldElem instanceof Element ) ) {
            throw Error();
        }
        if ( fieldElem.tagName.toUpperCase() !== "INPUT" || ( fieldElem.type !== "number" && fieldElem.type !== "text" ) ) {
            return null;
        }
        var t1 = fieldElem.parentNode;
        if ( t1 === null || !elem_hasClassName( t1, "ui-input-text" ) ) {
            return null;
        }
        return t1;
    }

    function getJQueryMobileCheckBoxRoot( fieldElem ) {
        if ( fieldElem === null ) {
            return null;
        }
        if ( !( fieldElem instanceof Element ) ) {
            throw Error();
        }
        if ( fieldElem.tagName.toUpperCase() !== "INPUT" || fieldElem.type !== "checkbox" ) {
            return null;
        }
        var t1 = fieldElem.parentNode;
        if ( t1 === null ||  !elem_hasClassName( t1, "ui-checkbox" ) ) {
            return null;
        }
        return t1;
    }

    function selectOption( selectElem, value, treatAsJQueryMobileElem ) {
        var cn, i, n;
        var indexOfOptionToSelect;
        var indexOfChildToSelect;
        var j;
        cn = selectElem.childNodes;
        n = cn.length;
        j = -1;
        for ( i = 0; i < n; ++i ) {
            var t1 = cn[i];
            if ( t1.nodeType !== 1 || t1.tagName.toUpperCase() !== "OPTION" ) {
                continue;
            }
            ++j;
            // cn[i].removeAttribute( "selected" );
            if ( t1.value === value ) {
                if ( indexOfOptionToSelect !== undefined ) {
                    throw Error();
                }
                indexOfChildToSelect = i;
                indexOfOptionToSelect = j;
            }
        }
        if ( indexOfOptionToSelect === undefined ) {
            throw Error();
        }
        // selectElem.childNodes[indexOfChildToSelect].setAttribute( "selected", "selected" );
        // selectElem.selectedIndex = indexOfOptionToSelect;
        selectElem.value = value;
        if ( treatAsJQueryMobileElem ) {
            $( selectElem ).selectmenu( "refresh", true );
        }
    }

    function formSetFieldValue( fieldElem, value, treatAsJQueryMobileElemAnyway ) {
        var argN;
        if ( !( fieldElem instanceof Element ) ) {
            throw Error();
        }
        argN = arguments.length;
        if ( argN < 3 ) {
            treatAsJQueryMobileElemAnyway = true;
        } else if ( typeof treatAsJQueryMobileElemAnyway !== "boolean" ) {
            throw Error();
        }
        switch ( fieldElem.tagName.toUpperCase() ) {
            case "INPUT":
                break;
            case "SELECT":
                if ( typeof value !== "string" && value !== null ) {
                    throw Error();
                }
                // Setting value does not seem to work reliably in Chrome. Actually we just needed to run the following line:  
                // $( fieldElem ).selectmenu( "refresh", true );
                selectOption( fieldElem, value === null ? "" : value, treatAsJQueryMobileElemAnyway );
                return;
            case "TEXTAREA":
                if ( typeof value !== "string" && value !== null ) {
                    throw Error();
                }
                fieldElem.innerText = value === null ? "" : value;
                return;
            default:
                throw Error();
        }
       
        switch ( fieldElem.type ) {
            case "checkbox":
                if ( typeof value !== "boolean" ) {
                    throw Error();
                }
                fieldElem.checked = value;
                if ( treatAsJQueryMobileElemAnyway || null !== getJQueryMobileCheckBoxRoot( fieldElem ) ) {
                    $( fieldElem ).checkboxradio( "refresh" );
                }
                break;
            case "number":
                if ( typeof value !== "number" && value !== null ) {
                    throw Error();
                }
                fieldElem.value = value === null ? "" : "" + value;
                break;
            default:
                if ( ( typeof value !== "string" ) && value !== null ) {
                    throw Error();
                }
                fieldElem.value = value === null ? "" : value;
                break;
        }
    }
    Object.defineProperties( window, {
        XElement: { value: XElement },
        FileInput: { value: FileInput },
        formSetFieldValue: { value: formSetFieldValue },
        formGetFieldElementFromName: { value: formGetFieldElementFromName },
        formToPojo: { value: formToPojo },
        Dictionary: { value: Dictionary },
        FormField: { value: FormField },
        HostObject: { value: HostObject },
        FormSerializationInfo: { value: FormSerializationInfo }
    } );


    Object.defineProperties( String.prototype, {
        startsWith: {
            value: function ( v ) {
                var s;
                s = this.valueOf();
                if ( typeof s !== "string" || typeof v !== "string" ) {
                    throw Error();
                }
                return 0 === s.lastIndexOf( v, v.length - 1 );
            }
        }
    } );

} )();