( function () {

    var array_prototype_push = Array.prototype.push;

    var compositeFormat_marksParser0 = new compositeFormatting_MarksParser();
    function BindingExpression( propertyName ) {
        this.__propertyName = propertyName;
    }
    BindingExpression.prototype = Object.create(Object.prototype, {
        propertyName: {
            get: function () {
                return this.__propertyName;
            }
        }
    });

    function BindingExpressionsStringLiteralsConcatExpression(evaluatorFunc, bindingExpressions, isSimple) {
        this.__evaluatorFunc = evaluatorFunc;
        this.__bindingExpressions = bindingExpressions;
        this.__isSimple = isSimple;
    }
    BindingExpressionsStringLiteralsConcatExpression.prototype = Object.create( Object.prototype, {
        evaluatorFunction: {
            get: function () {
                return this.__evaluatorFunc;
            }
        },
        bindingExpressions: {
            get: function () {
                return this.__bindingExpressions;
            }
        },
        isSimple: {
            get: function () {
                return this.__isSimple;
            }
        }
    } );


    function BindingExpressionsStringLiteralsConcatExpression_Parser() {
        this.__substring = new Substring( "", null );
        this.__result = null;
    }
    BindingExpressionsStringLiteralsConcatExpression_Parser.prototype = Object.create( Object.prototype, {
        __getIString: {
            value: function ( v ) {
                var iString;
                if ( v instanceof Interval ) {
                    this.__substring.__interval = v;
                    iString = this.__substring;
                } else {
                    assert( typeof v === "string" );
                    iString = v;
                }
                return iString;
            }
        },
        __getEcmaScriptStringLiteral: {
            value: function ( v ) {
                return iString_toEcmaScriptStringLiteral(this.__getIString(v));
            }
        },
        run: {
            value: function (s) {
                var r, i, n;
                var bindingExpressions;
                var evaluatorFuncBodyStr;
                var evaluatorFunc;
                var iString;
                var isSimple;
                assert( typeof s === "string" );
                try {
                    compositeFormat_marksParser0.initialize( s );
                    compositeFormat_marksParser0.run();

                    r = compositeFormat_marksParser0.__results;
                    n = r.length;   
                    assert(( n & 1 ) === 0 );
                    if ( n === 0 ) {

                        if ( compositeFormat_marksParser0.__sPartNorm instanceof Interval ) {
                            this.__result = null;
                        } else {
                            this.__result = this.__getIString( compositeFormat_marksParser0.__sPartNorm ).toString();
                        }
                    } else {
                        try {
                            this.__substring.__s = s;

                            bindingExpressions = new Array( n * 0.5 );
                            for ( i = 1; i < n; i += 2 ) {
                                bindingExpressions[( i - 1 ) * 0.5] = new BindingExpression(this.__getIString( r[i] ).toString());
                            }
                            evaluatorFuncBodyStr = "return";
                            iString = this.__getIString( r[0] );
                            evaluatorFuncBodyStr += iString_toEcmaScriptStringLiteral( iString );
                            isSimple = iString.length === 0 && n === 2;
                            evaluatorFuncBodyStr += "+a[" + this.__getEcmaScriptStringLiteral( r[1] ) + "]";
                            for ( i = 2; i < n; i += 2 ) {
                                evaluatorFuncBodyStr +=
                                    "+" + this.__getEcmaScriptStringLiteral( r[i] ) +
                                    "+a[" + this.__getEcmaScriptStringLiteral( r[i + 1] ) + "]";
                            }
                            if ( !compositeFormat_marksParser0.__sPartNorm_isEmpty ) {
                                evaluatorFuncBodyStr += this.__getEcmaScriptStringLiteral( compositeFormat_marksParser0.__sPartNorm );
                            }
                            evaluatorFunc = Function( "a", evaluatorFuncBodyStr );
                            this.__result = new BindingExpressionsStringLiteralsConcatExpression( evaluatorFunc, Object.freeze( bindingExpressions ), isSimple );
                        } finally {
                            this.__substring.__interval = null;
                            this.__substring.__s = null;
                        }
                    }

                    return this.__result;
                } finally {
                    this.__result = null;
                    compositeFormat_marksParser0.clear();
                }

            }
        }
    } );
    Object.defineProperties( window, {
        compositeFormatting_MarksParser: { value: compositeFormatting_MarksParser },
        BindingExpressionsStringLiteralsConcatExpression_Parser: { value: BindingExpressionsStringLiteralsConcatExpression_Parser },
        BindingExpressionsStringLiteralsConcatExpression: { value: BindingExpressionsStringLiteralsConcatExpression },
        BindingExpression: { value: BindingExpression }
    } );

          
    var bindingExprsStringLitsConcatExprParser0 = new BindingExpressionsStringLiteralsConcatExpression_Parser();


   
    function DataTemplate_Parser() {
        this.__node = null;
        this.__pathToNode = null;
        this.__nodePathStack = [];
        this.__results = [];
    }
    DataTemplate_Parser.prototype = Object.create( Object.prototype, {
        __runTextOrAttribute: {
            value: function ( ) {
                var v, propName;
                propName = this.__node.nodeType === 3 ? "nodeValue" : "value";
                v = bindingExprsStringLitsConcatExprParser0.run( this.__node[propName] );
                if ( v === null ) {                     
                    // The attribute value expression has no dependencies and has not been normalized.
                    // Because the expression has no dependecies and does not have to be normalized we don't have to do anything.
                    return;
                }
                if ( typeof v === "string" ) {
                    // The attribute value expression has no dependencies, but may have been normalized.
                    // Because the expression has no dependecies it can be evaluated once (on the following line) to account for normalizations.
                    this.__node[propName] = v;
                    return;
                } 
                assert( v instanceof BindingExpressionsStringLiteralsConcatExpression );
                // The attribute value must be evaluated and depends on properties v.functionDependentOnPropertyNames.
                // v.function_ is a function accepting one argument: the value on which one property access operations is performed for 
                // each property name in v.functionDependentOnPropertyNames.
                this.__results.push(new Pair(Function("e", "return e" + this.__pathToNode + ";"), v));

            }
        },
        __runElementChildren: {
            value: function() {
                var ec, i, n, p;
                assert( this.__node.nodeType === 1 );
                ec = this.__node.childNodes;
                n = ec.length;
                for ( i = 0; i < n; ++i ) {
                    p = Pair.POOL.getOrAllocate( ec[i], this.__pathToNode + ".childNodes[" + i + "]" );
                    this.__nodePathStack.push( p );
                }
            }
        },
        __runElementAttributes: {
            value: function () {
                var attrs;
                var i, attributeCount;
                var p;
                attrs = this.__node.attributes;
                attributeCount = attrs.length;
                for ( i = 0; i < attributeCount; ++i ) {
                    p = Pair.POOL.getOrAllocate( attrs[i], this.__pathToNode + ".attributes[" + i + "]" );
                    this.__nodePathStack.push( p );
                }
            }
        },
        run: {
            value: function ( node ) {
                var p;
                try {
                    assert( this.__results.length === 0 );
                    p = Pair.POOL.getOrAllocate(node, "");
                    this.__nodePathStack.push( p );
                    do {
                        p = this.__nodePathStack.pop();
                        this.__node = p.a;
                        this.__pathToNode = p.b;
                        Pair.POOL.recycle( p );
                        switch (this.__node.nodeType) {
                            case 1:
                                // element node          
                                this.__runElementAttributes();
                                this.__runElementChildren();
                                break;
                            case 2:
                                // attribute node
                                this.__runTextOrAttribute();
                                break;
                            case 3:
                                // text node    
                                assert( this.__node.childNodes.length === 0 );
                                this.__runTextOrAttribute();
                                break;
                            case 4:
                                break;
                            default:
                                throw Error();
                        }
                    } while ( this.__nodePathStack.length > 0 );
                    return this.__results;
                }
                finally {
                    this.__results = [];
                    for ( p = this.__nodePathStack.length; --p >= 0; ) {
                        Pair.POOL.recycle(this.__nodePathStack[p]);
                    }
                    this.__nodePathStack.length = 0;
                    this.__pathToNode = null;
                    this.__node = null;
                }
            }
        }
    });
    var dataTemplateParser0 = new DataTemplate_Parser();

    
    function ElementDataBindingEngine(element) {
        if ( !( element instanceof Element ) ) {
            throw Error();
        }
        this.__element = element;
        this.__dataContext = null;
        this.__dataContext_propertyChangedListener = null;
    }

    ElementDataBindingEngine.prototype = Object.create( Object.prototype, {
        dataContext: {
            get: function () {
                return this.__dataContext;
            },
            set: function ( value ) {
                if ( !( value === null || value instanceof Object ) ) {
                    throw Error();
                }
                if ( value === this.__dataContext ) {
                    return;
                }
                if ( this.__dataContext_propertyChangedListener !== null ) {
                    this.__dataContext_propertyChangedListener.remove();
                    this.__dataContext_propertyChangedListener = null;
                }
                this.__dataContext = value;
                if ( value !== null && value instanceof ObjectWithEvents ) {
                    this.__dataContext_propertyChangedListener = this.__dataContext.addListener( "propertyChanged", this.__dataContext_onPropertyChanged, this );
                }
                this._onDataContextChanged();
            }
        },
        __setBinding_attribute: {
            value: function ( element, attributeName, expr ) {
                // Assume element is a descendant of this.__element.
                var dataBindingEngine;
                var value;
                if ( !expr.isSimple ) {
                    throw Error();
                }
                dataBindingEngine = this;
                try {
                    value = this.dataContext[expr.bindingExpressions[0].propertyName];
                } catch ( e ) {
                    console.error( "Error while getting property \"" + expr.bindingExpressions[0].propertyName + "\".", this.dataContext );
                    return;
                }
                switch ( attributeName ) {
                    case "data-command":
                        assert( value instanceof Function );
                        assert( element.nodeName.toLowerCase() == "button" );
                        element.addEventListener( "click", function ( event ) {
                            value.call( dataBindingEngine.dataContext );
                        }, false );
                        break;
                    default:
                        throw Error();
                }
            }
        },
        __setBinding_text: {
            value: function ( textNode, expr ) {
                // Assume textNode is a descendant of this.__element.
                var value;
                value = this.dataContext[expr.bindingExpressions[0].propertyName];
                assert( typeof value === "string" );
                textNode.nodeValue = value;
            }
        },
        dispose: {
            value: function () {
                if ( this.__dataContext_propertyChangedListener !== null ) {
                    this.__dataContext_propertyChangedListener.remove();
                    this.__dataContext_propertyChangedListener = null;
                }
            }
        },
        __dataContext_onPropertyChanged: {
            value: function ( propertyName, oldValue, newValue ) {

            }
        },
        _onDataContextChanged: {
            value: function () {

            }
        }
    } );


    function __DataTemplate(element, dependantNodes) {
        assert( element instanceof Element );
        assert(element.parentNode === null);
        this.__element = element.cloneNode(true);
        this.__dependantNodes = dependantNodes;
    }
  
    function DataTemplate() {
        throw Error();
    }
    __DataTemplate.prototype = DataTemplate.prototype = Object.create( Object.prototype, {
        createInstance: {
            value: function(dataContext) {
                var element, element_dataBindingEngine;
                var i, n;
                var t1, expr;
                element = this.__element.cloneNode( true );
                element_dataBindingEngine = new ElementDataBindingEngine( element );
                element_dataBindingEngine.dataContext = dataContext;
                for ( i = 0, n = this.__dependantNodes.length; i < n; ++i ) {
                    t1 = this.__dependantNodes[i].a;
                    t1 = t1(element);
                    expr = this.__dependantNodes[i].b;
                    if (t1.nodeType === 2) { // Attribute
                        element_dataBindingEngine.__setBinding_attribute(t1.ownerElement, t1.nodeName, expr);
                    } else { // Text Node
                        assert(t1.nodeType === 3);
                        element_dataBindingEngine.__setBinding_text(t1, expr);
                    }
                }
                return element;
            }
        }
    } );

    Object.defineProperties( DataTemplate, {
        parse: {
            value: function ( element ) {
                var r;
                if ( !( element instanceof Element ) ) {
                    throw Error();
                }
                element = element.cloneNode( true );
                r = dataTemplateParser0.run( element );
                return new __DataTemplate( element, r );
            }
        }
    } );
    Object.defineProperties( window, {
        DataTemplate: { value: DataTemplate },
        DataTemplate_Parser: { value: DataTemplate_Parser }
    });



    function ListView_ItemView(containerElement, itemTemplate, item) {
        this.__itemTemplate = itemTemplate;
        this.__containerElement = containerElement;
        this.__itemElement = null;
        this.__setItem(item);
    }
    ListView_ItemView.prototype = Object.create( Object.prototype, {
        dispose: {
            value: function () {
                if ( this.__itemElement !== null ) {
                    this.__containerElement.removeChild( this.__itemElement );
                    this.__itemElement = null;
                }
            }
        },
        __setItem: {
            value: function (value) {
                this.dispose();
                this.__itemElement = this.__itemTemplate.createInstance( value );
                this.__item = value;
                this.__containerElement.appendChild( this.__itemElement );
            }
        },
        item: {
            get: function() {
                return this.__item;
            },
            set: function (value) {
                this.__setItem( value );
            }
        }
    } );
    
    function ListView(containerElement, items, itemTemplate) {
        var t;
        if ( items !== null && !( items instanceof ObservableList ) ) {
            throw Error();
        }
        if ( !( itemTemplate instanceof DataTemplate ) ) {
            throw Error();
        }
        if ( !( containerElement instanceof Element ) ) {
            throw Error();
        }
        this.__containerElement = containerElement;
        this.__itemTemplate = itemTemplate;
        this.__items_onChangedListener = null;
        this.__itemViews = [];
        this.__isDisposed = false;
        this.__lastItemView_classNames = [];
        this.__firstItemView_classNames = [];
        this.__setItems(items);
        this.__update();
    }
    ListView.prototype = Object.create(Object.prototype, {

        __setItems: {
            value: function(value) {
                this.__items = value;
                if (value !== null) {
                    this.__items_onChangedListener = value.addListener("listChanged", this.__items_onChanged, this);
                }
            }
        },

        dispose: {
            value: function () {
                if ( !this.__isDisposed ) {
                    this.__itemViews_dispose( 0, this.__itemViews.length );
                    if ( this.__items_onChangedListener !== null ) {
                        this.__items_onChangedListener.remove();
                        this.__items_onChangedListener = null;
                        this.__items = null;
                    }
                    this.__isDisposed = true;
                }
            }
        },

        lastItemView_classNames: {
            get: function () {
                return this.__lastItemView_classNames.slice( 0 );
            },
            set: function (value) {
                var classNames, i, itemView;
                classNames = ClassNameList_normalize( value );
                i = this.__itemViews.length - 1;
                if (0 <= i) {
                    itemView = this.__itemViews[i];
                    elem_removeClassNames(itemView.__itemElement, this.__lastItemView_classNames);
                    elem_addClassNames(itemView.__itemElement, classNames);
                }
                this.__lastItemView_classNames = classNames;
            }
        },

        firstItemView_classNames: {
            get: function () {
                return this.__firstItemView_classNames.slice( 0 );
            },
            set: function (value) {
                var classNames, itemView;
                classNames = ClassNameList_normalize( value );
                if (0 < this.__itemViews.length) {
                    itemView = this.__itemViews[0];
                    elem_removeClassNames(itemView.__itemElement, this.__firstItemView_classNames);
                    elem_addClassNames(itemView.__itemElement, classNames);
                }
                this.__firstItemView_classNames = classNames;
            }
        },

        __firstItemView_onRankChanging: {
            value: function ( itemWillBeDisposed ) {
                if ( !itemWillBeDisposed ) {
                    elem_removeClassNames( this.__itemViews[0].__itemElement, this.__firstItemView_classNames );
                }
            }
        },

        __lastItemView_onRankChanging: {
            value: function ( itemWillBeDisposed ) {
                if ( !itemWillBeDisposed ) {
                    elem_removeClassNames( this.__itemViews[this.__itemViews.length - 1].__itemElement, this.__lastItemView_classNames );
                }
            }
        },

        __onNewFirstItemView: {
            value: function () {
                elem_addClassNames( this.__itemViews[0].__itemElement, this.__firstItemView_classNames );
            }
        },

        __onNewLastItemView: {
            value: function () {
                elem_addClassNames( this.__itemViews[this.__itemViews.length - 1].__itemElement, this.__lastItemView_classNames );
            }
        },

        __doDisposeCheck: {
            value: function () {
                if ( this.__isDisposed ) {
                    throw Error();
                }
            }
        },

        items: {
            get: function () {
                return this.__items;
            },
            set: function (value) {
                if ( value !== null && !(value instanceof ObservableList) ) {
                    throw Error();
                }
                this.__doDisposeCheck();
                if ( value === this.__items ) {
                    return;
                }
                if ( this.__items_onChangedListener !== null ) {
                    this.__items_onChangedListener.remove();
                    this.__items_onChangedListener = null;
                }
                this.__setItems(value);
                this.__update();
            }
        },

        itemTemplate: {
            get: function () {
                return this.__itemTemplate;
            },
            set: function ( value ) {
                if ( !( value instanceof DataTemplate ) ) {
                    throw Error();
                }
                throw Error();
                this.__itemTemplate = value; // Update item views...
            }
        },

        __itemViews_dispose: {
            value: function ( i, n) {
                for (; i < n; ++i) {
                    this.__itemViews[i].dispose();
                }
            }
        },
        __update: {
            value: function () {
                var i, n, j, f;
                if ( this.__items === null ) {
                    if ( 0 < this.__itemViews.length ) {
                        this.__firstItemView_onRankChanging( true );
                        this.__lastItemView_onRankChanging( true );
                        this.__itemViews_dispose( 0, this.__itemViews.length );
                        this.__itemViews.length = 0;
                    }
                    return;
                }
                n = this.__items.count;
                j = this.__itemViews.length - 1;
                if ( n <= j ) {
                    // We have at least one too many views.
                    this.__lastItemView_onRankChanging( true );
                    f = 0 < n ? 1 : 0;
                    this.__itemViews_dispose( n, j + 1 );
                    this.__itemViews.length = n;
                    j = n - 1;
                } else {
                    // We have exactly the right amount or too little views.   
                    f = 0;
                }
                for ( i = 0; i <= j; ++i ) {
                    this.__itemViews[i].item = this.__items.get( i );
                }
                this.__itemViews_initializeRange( j + 1, n );
                if ( j + 1 < n ) {
                    f |= 1;
                }
                if ( f !== 0 ) {
                    this.__onNewLastItemView();
                }
            }
        },
        __itemViews_initializeRange: {
            value: function ( i, n ) {
                for ( ; i < n; ++i ) {
                    this.__itemViews[i] = new ListView_ItemView( this.__containerElement, this.__itemTemplate, this.__items.get( i ) );
                }
            }
        },
        __items_onChanged: {
            value: function ( lcea ) {
                var i, n, t, t2;
                switch ( lcea.type ) {
                    case "insert":
                        assert( lcea.oldIndex === -1 && lcea.oldItems.length === 0 );   
                        i = lcea.newIndex;
                        n = lcea.newItems.length;
                        assert( 0 < n );
                        t2 = this.__itemViews.length;
                        if ( i === 0 && 0 < t2 ) {
                            this.__firstItemView_onRankChanging( false );
                        }
                        if ( i === t2 && 0 < t2 ) {
                            this.__lastItemView_onRankChanging( false );
                        }
                        Array_insertUninitializedRange( this.__itemViews, i, n );
                        this.__itemViews_initializeRange( i, i + n );
                        if ( i === 0 ) {
                            this.__onNewFirstItemView();
                        }
                        if ( i === t2 ) {
                            this.__onNewLastItemView();
                        }
                        break;
                    case "replace":
                        i = lcea.oldIndex;
                        assert( i === lcea.newIndex );
                        n = lcea.oldItems.length;             
                        assert( n === lcea.newItems.length );
                        assert(0 < n);
                        t = i + n;
                        if ( i === 0 ) {
                            this.__firstItemView_onRankChanging( false );
                        }
                        t2 = this.__itemViews.length;
                        if ( t === t2 ) {
                            this.__lastItemView_onRankChanging( false );
                        }
                        for ( ; i < t; ++i ) {
                            this.__itemViews[i].item = this.__items.get( i );
                        }
                        if ( i === 0 ) {
                            this.__onNewFirstItemView();
                        }
                        if ( t === t2 ) {
                            this.__onNewLastItemView();
                        }
                        break;
                    case "remove":
                        i = lcea.oldIndex;
                        n = lcea.oldItems.length;
                        assert( n > 0 && lcea.newIndex === -1 && lcea.newItems.length === 0 );
                        if ( i === 0 ) this.__firstItemView_onRankChanging( true );
                        t2 = this.__itemViews.length;
                        if ( i + n === t2 ) this.__lastItemView_onRankChanging( true );
                        this.__itemViews_dispose( i, i + n );
                        this.__itemViews.splice( i, n );
                        if ( 0 < t2 - n ) {
                            if ( i === 0 ) this.__onNewFirstItemView();
                            if ( i + n === t2 ) this.__onNewLastItemView();
                        }
                        break;
                    case "reset":
                        assert( lcea.newIndex === -1 && lcea.newItems.length === 0 );
                        assert( lcea.oldIndex === -1 && lcea.oldItems.length === 0 );
                        this.__update();
                        break;
                    default:
                        throw Error();
                }
            }
        }
    } );

    Object.defineProperties( ListView, {
        fromJQueryMobileListView: {
            value: function ( element ) {
                var itemTemplateElement, itemTemplate, listView;
                var firstItemView_classNames, lastItemView_classNames;
                itemTemplateElement = htmlElem_get( ".item-template", element );
                itemTemplateElement.parentNode.removeChild( itemTemplateElement );

                firstItemView_classNames = "ui-first-child";
                lastItemView_classNames = "ui-last-child";

                elem_removeClassNames( itemTemplateElement, "item-template" );
                elem_removeClassNames( itemTemplateElement, firstItemView_classNames );
                elem_removeClassNames( itemTemplateElement, lastItemView_classNames );

                itemTemplate = DataTemplate.parse( itemTemplateElement );
                listView = new ListView( element, null, itemTemplate );
                listView.firstItemView_classNames = firstItemView_classNames;
                listView.lastItemView_classNames = lastItemView_classNames;
                return listView;
            }
        }
    } );

    Object.defineProperties( window, {
        ListView: { value: ListView }
    } );

} )();