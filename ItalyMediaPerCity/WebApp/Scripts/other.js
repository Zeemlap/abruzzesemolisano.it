

( function () {

    function hasOwnP(obj, pn) {
        return Object.prototype.hasOwnProperty.call( obj, pn );
    }


    function Page( id ) {
        var htmlElement;
        if ( typeof ( id ) !== "string" ) {
            throw Error( "id must be a string (invalid argument)" );
        }
        this.__id = id;
        htmlElement = htmlElem_get( "#" + id, document.body);
        this.__htmlElement = htmlElement;
        this.__hasBeenShown = false;
        this.__isShown = false;
    }
    Page.prototype = Object.create( Object.prototype, {
        _isShown: {
            get: function () {
                return this.__isShown;
            },
            set: function ( value ) {          
                if ( this.__isShown === value ) {
                    throw Error();
                }
                this.__isShown = value;
                console.log( "The page with id \"" + this.__id + "\" " + ( value ? "has been shown" : "has been hidden" ) + ".");
            }
        },
        id: { get: function () { return this.__id; } },
        htmlElement: { get: function () { return this.__htmlElement; } },
        _onFirstShow: { value: function (paramsPojo) { } },
        _onShow: { value: function (paramsPojo) { } },
        _onHide: { value: function () { } }
    } );

    function SampleMetadata() {
        this.__name = null;
        this.__id = null;
        this.__sampleDataFileId = 0;
        this.__gender = null;
        this.__motherTongues = null;
        this.__isAnonymous = false;
        this.__otherInformation = null;
        this.__locationId = 0;
        this.__transcriptionFileId = null;
        this.__translationFileId = null;
        this.__yearOfBirth = 0;
        this.__yearOfMovingToLocation0 = 0;

    }
    SampleMetadata.prototype = Object.create( Object.prototype, {
        isAnonymous: {
            get: function () { return this.__isAnonymous; },
            set: function ( value ) { if ( typeof value !== "boolean" ) throw Error(); this.__isAnonymous = value; }
        },
        alwaysLivedAtLocation0: {
            get: function () { return this.__alwaysLivedAtLocation0; },
            set: function ( value ) { this.__alwaysLivedAtLocation0 = value; }
        },
        motherTongues: {
            get: function () { return this.__motherTongues; },
            set: function ( value ) { this.__motherTongues = value; },
        },
        otherInformation: {
            get: function () { return this.__otherInformation; },
            set: function ( value ) { this.__otherInformation = value; },
        },
        transcriptionFileId: {
            get: function () { return this.__transcriptionFileId; },
            set: function ( value ) { this.__transcriptionFileId = value; },
        },

        translationFileId: {
            get: function () { return this.__translationFileId; },
            set: function ( value ) { this.__translationFileId = value; },
        },

        yearOfBirth: {
            get: function () { return this.__yearOfBirth; },
            set: function ( value ) { if ( typeof value !== "number" || value % 1 !== 0) throw Error(); this.__yearOfBirth = value; },
        },

        yearOfMovingToLocation0: {
            get: function () { return this.__yearOfMovingToLocation0; },
            set: function ( value ) { this.__yearOfMovingToLocation0 = value; },
        },

        locationId: {
            get: function () {
                return this.__locationId;
            },
            set: function ( value ) {
                this.__locationId = value;
            }
        },
        gender: {
            get: function () {
                return this.__gender;
            },
            set: function ( value ) {
                if ( value !== null && value !== "male" && value !== "female" ) {
                    throw Error();
                }
                this.__gender = value;
            }
        },
        name: {
            get: function () {
                return this.__name;
            },
            set: function (value) {
                if (typeof value !== "string") {
                    throw Error();
                }
                this.__name = value;
            }
        },
        id: {
            get: function () {
                return this.__id;
            },
            set: function (value) {
                if (typeof value !== "number" || value % 1 !== 0) {
                    throw Error();
                }
                this.__id = value;
            }
        },
        sampleDataFileId: {
            get: function () {
                return this.__sampleDataFileId;
            },
            set: function ( value ) {
                if ( typeof value !== "number" || value % 1 !== 0 ) {
                    throw Error();
                }
                this.__sampleDataFileId = value;
            }
        },
        play: {
            value: function () {
                
                saveAs2( this.sampleDataFileId );

            }
        },
        view: {
            value: function () {
                var r;
                PageMgr.instance.setCurrentPage( "page-view-file", { id: this.id + "" } );
            }
        }
    
    } );

    function saveAs2( fid ) {

        if ( typeof fid !== "number" || !( fid % 1 === 0 ) ) {
            throw Error();
        }
        CachedEntitySet_entityIdToString( fid );

        window.location.href = "DefaultHandler.ashx?action=GetFileData&id=" + fid;
    }

    function MimeType_isAudio( mimeType ) {
        return /^\s*audio\//.test( mimeType );
    }
    function genderFromInteger(num) {
        switch ( num ) {
            case 0:
                return null;
            case 1:
                return "male";
            case 2:
                return "female";
            default:
                throw Error();
        }
    }
    Object.defineProperties(SampleMetadata, {
        copyPojoIntoSampleMetadata: {
            value: function ( sm, obj ) {
                var pns, i, n, pn;
                var sm;
                var t1;
                assert(isPojo(obj));
                pns = Object.getOwnPropertyNames(obj);
                n = pns.length;
                for (i = 0; i < n; ++i) {
                    pn = pns[i];
                    switch ( pn ) {

                        case "AlwaysLivedAtLocation0":
                            sm.alwaysLivedAtLocation0 = obj[pn];
                        case "CreatedAt":
                            break;
                        case "Gender":
                            sm.gender = genderFromInteger( obj[pn] );
                            break;
                        case "Id":
                            sm.id = obj[pn];
                            break;
                        case "IsAnonymous":
                            if ( typeof obj[pn] !== "boolean" ) {
                                throw Error();
                            }
                            sm.isAnonymous = obj[pn];
                            break;
                        case "LocationId":
                            sm.locationId = obj[pn];
                            break;
                        case "MotherTongues":  
                            sm.motherTongues = obj[pn];
                            break;
                        case "Name":
                            sm.name = obj[pn] === null ? "" : obj[pn];
                            break;
                        case "OtherInformation":   
                            sm.otherInformation = obj[pn];
                            break;
                        case "SampleDataFileId":
                            sm.sampleDataFileId = obj[pn];
                            break;
                        case "TranscriptionFileId":
                            sm.transcriptionFileId = obj[pn];
                            break;
                        case "TranslationFileId":
                            sm.translationFileId = obj[pn];
                            break;
                        case "YearOfBirth": 
                            sm.yearOfBirth = obj[pn];
                            break;
                        case "YearOfMovingToLocation0":
                            sm.yearOfMovingToLocation0 = obj[pn];
                            break;
                        default:
                            throw Error();
                    }
                }
                return sm;
            }
        }
    });

    function SampleUploader( obj ) {
        if ( !hasOwnP( obj, "name" ) || typeof obj.name !== "string" ) {
            throw Error();
        }
        if ( !hasOwnP( obj, "sampleDataFileName" ) || typeof obj.sampleDataFileName !== "string" ) {
            throw Error();
        }
        if ( !hasOwnP( obj, "sampleDataFileData" ) || !( obj.sampleDataFileData instanceof ArrayBuffer ) ) {
            throw Error();
        }
        ObjectWithEvents.call( this );
        this.__name = obj.name;
        this.__sampleDataFileName = obj.sampleDataFileName;
        this.__sampleDataFileData = obj.sampleDataFileData;
        this.__httpReq = null;
        this.__httpReqBody = new HttpRequestFormData( obj );
    }
    SampleUploader.prototype = Object.create( ObjectWithEvents.prototype, {
        start: {
            value: function () {
                this.__httpReq = new HttpRequest( {
                    method: "POST",
                    url: "DefaultHandler.ashx?action=CreateSample",
                    body: this.__httpReqBody,
                    timeout: 10000,
                    retry_triggerOnNonTimeoutError: true
                } );
                this.__httpReq.addListener( "completed", this.__httpReq_onCompleted, this );
                this.__httpReq.send();
            }
        },
        name: {
            get: function () {
                return this.__name;
            }
        },
        __httpReq_onCompleted: {
            value: function ( sampleMetadataPojo, statusCode ) {
                var sampleMetadata, _this;
                this.__httpReq = null;
                if ( statusCode !== 200 ) {
                    this.raiseEvent( "uploadCompleted", [true] );
                    return;
                }
                sampleMetadata = BusinessLogic.instance.__processSampleMetadataFromServer( sampleMetadataPojo );
                _this = this;
                BusinessLogic.instance.getLocationAsync( sampleMetadata.locationId, function ( location, fCompletedSynchronously, fError ) {

                    if ( location === null ) {
                        _this.raiseEvent( "uploadCompleted", [true] );
                        window.location.reload();
                        return;
                    }
                    location.sampleUploaders.remove( _this );
                    if ( BusinessLogic.instance.__isAuthenticated ) {
                        location.sampleMetadatas.add( sampleMetadata );
                    }
                    _this.raiseEvent( "uploadCompleted", [false] );
                } );

            }
        },
        play: {
            value: function () {
                saveAs( new Blob( [this.__sampleDataFileData] ), this.__sampleDataFileName );
            }
        }
    } );


    function EntityChildCollection( childConstructor ) {
        ObservableList.call(this, {
            isValidValueFunction: function ( o ) { return o instanceof childConstructor; }
        } );
        this.__isInitialized = false;
        this.__isInitializing = false;
        this.__onTriedInitializeCallbackFunctions = [];
    }
    EntityChildCollection.prototype = Object.create( ObservableList.prototype, {
        /*
        _onListChanging: {
            value: function ( lcea ) {
                if ( !this.__isInitialized ) {
                    throw Error();
                }
                ObservableList.prototype._onListChanging.call( this, lcea );
            }
        },
        */
        isInitialized: {
            get: function () {
                return this.__isInitialized;
            }
        },
        isInitializing: {
            get: function () {
                return this.__isInitializing;
            }
        },
        __tryEndInitialize: {
            value: function ( elements, fCompletedSynchronously ) {
                var i, n, a, fn, t1, elements_writable;
                a = this.__onTriedInitializeCallbackFunctions;
                this.__onTriedInitializeCallbackFunctions = [];
                n = a.length;
                this.__isInitializing = false;
                if ( elements === null ) {
                    for ( i = 0; i < n; ++i ) {
                        fn = a[i];
                        fn( elements, fCompletedSynchronously );
                    }
                    return;
                }

                elements_writable = false;
                n = elements.length;
                for ( i = 0; i < n; ) {
                    t1 = this.indexOf( elements[i] );
                    if ( 0 <= t1 ) {
                        if ( !elements_writable ) {
                            elements = elements.slice(0);
                            elements_writable = true;
                        }
                        elements.splice( i, 1 );
                        --n;
                    } else {
                        ++i;
                    }
                }
                this.addRange( elements );
                this.__isInitialized = true;
                n = a.length;
                for ( i = 0; i < n; ++i ) {
                    fn = a[i];
                    fn( elements, fCompletedSynchronously );
                }
                this.raiseEvent( "initialized" );
            }
        }
    });

    function Location() {
        ObjectWithEvents.call(this);
        this.__name = null;
        this.__id = 0;
        this.__sampleUploaders = null;
        this.__sampleMetadatas = new EntityChildCollection( SampleMetadata );
        this.__sampleMetadatas.addListener( "listChanged", this.__sampleMetadatas_onListChanged, this );
        this.__sampleMetadatas.addListener( "initialized", this.__sampleMetadatas_onInitialized, this );
        this.__geocodeResult = null;
        this.__gmapsLatLng = null;
        this.__sampleMetadataCount = 0;
        this.__importanceCategory = 0;
    }
    Location.prototype = Object.create( ObjectWithEvents.prototype, {
        id: {
            get: function () { return this.__id; }
        },

        __sampleMetadatas_onListChanged: {
            value: function ( lcea ) {
                var dn;
                if ( this.__sampleMetadatas.isInitialized ) {
                    this.__setSampleMetadataCount( this.__sampleMetadatas.count );
                } else {
                    dn = lcea.newItems.length - lcea.oldItems.length;
                    this.__setSampleMetadataCount( this.__sampleMetadataCount + dn );
                }
            }
        },

        __sampleMetadatas_onInitialized: {
            value: function () {
                this.__sampleMetadatas.removeListener( "initialized", this.__sampleMetadatas_onInitialized, this );
                this.__setSampleMetadataCount( this.__sampleMetadatas.count );
            }
        },

        sampleMetadataCount: {
            get: function () {
                return this.__sampleMetadataCount;
            }
        },

        __setSampleMetadataCount: {
            value: function ( value ) {
                var oldValue;
                if ( value !== this.__sampleMetadataCount ) {
                    oldValue = this.__sampleMetadataCount;
                    this.__sampleMetadataCount = value;
                    this.raiseEvent( "propertyChanged", ["sampleMetadataCount", oldValue, value] );
                }
            }
        },

        _geocodeResult: {
            get: function () {
                return this.__geocodeResult;
            },
            set: function ( value ) {
                if ( value !== null && !isPojo( value ) ) {
                    throw Error();
                }
                this.__geocodeResult = Object.freeze(cloneValue(value, true));
            }
        },
        __setLatitudeLongitude: {
            value: function ( latitude, longitude ) {
                this.__gmapsLatLng = new google.maps.LatLng( latitude, longitude );
            }
        },
        name: {
            get: function () { return this.__name; }
        },
        importanceCategory: {
            get: function () { return this.__importanceCategory; },
            set: function ( value ) {
                if ( value !== 0 && value !== 1 ) {
                    throw Error();
                }
                this.__importanceCategory = value;
            }
        },
        sampleUploaders: {
            get: function () {
                if ( this.__sampleUploaders === null ) {
                    this.__sampleUploaders = new ObservableList( {
                        isValidValueFunction: function (value) { return value instanceof SampleUploader; }
                    });
                }
                return this.__sampleUploaders;
            }
        },
        sampleMetadatas: {
            get: function () {
                return this.__sampleMetadatas;
            }
        }
    
    });
    Object.defineProperty(Location, "copyPojoIntoLocation", {
        value: function ( loc, pojoObj ) {
            loc.__name = pojoObj.Name;
            loc.__id = pojoObj.Id;
            loc.importanceCategory = pojoObj.ImportanceCategory;
            loc.__setLatitudeLongitude( pojoObj.Latitude, pojoObj.Longitude );
        }
    });



    var pageMgr0;
    function PageMgr() {
        throw Error( "Cannot instantiate singleton class, the sole instance can be accessed through window.PageMgr.instance" );
    }
    function __PageMgr() {
        this.__init();
    }
    function Window_navigate_uriFragment(s) {
        if (typeof s !== "string") {
            throw Error();
        }
        if (history.pushState instanceof Function) {
            history.pushState(null, null, '#' + s);
            return true;
        }
        location.hash = '#' + s;
        return false;
    }
    function PageMgr_checkPageIdParsingConsistency(jqPageId, ourPageId) {
        if (ourPageId !== jqPageId) {
            console.error("Inconsistent parsing of page id from window.location.hash between jQuery.mobile logic and our logic. Results are \"" + jqPageId + "\" and \"" + ourPageId + "\", respectively.");
        }
    }
    function PageMgr_computeJQPageId() {
        var jqPageId = jQuery.mobile.pageContainer.pagecontainer( "getActivePage" );
        jqPageId = jqPageId.length === 0 ? null : jqPageId.prop( "id" );
        return jqPageId;
    }
    __PageMgr.prototype = PageMgr.prototype = Object.create( ObjectWithEvents.prototype, {
        __init: {
            value: function () {

                ObjectWithEvents.call( this );
                this.__curPageId = null;
                this.__pageFromId = {};
                this.__defaultPageId = null;
                this.__windowOnLoad_deferCount = 0;
                this.__windowOnLoadFunc = this.__windowOnLoad.bind(this);
                window.addEventListener( "load", this.__windowOnLoadFunc, false );

                // this.__pageContainerInterval = setInterval( this.__checkJQPage.bind( this ), 10 );   
                    
            }
        },

        __jqOnPageShown: {
            value: function (event, ui) {
                if (ui.toPage.attr("id") === this.__curPageId) {
                    return;
                }
                this.__synchronizeCurrentPageFromHash();
            }
        },
        
        __synchronizeCurrentPageFromHash: {
            value: function () {
                var jqPageId, ourPageId;
                var str, i, paramsPojo, str_len;
                jqPageId = PageMgr_computeJQPageId();
                str = location.hash;
                i = str.lastIndexOf("?");
                str_len = str.length;
                if (0 <= i && i < str_len - 1) {
                    paramsPojo = pojoFromUrlQueryString(str, i + 1);
                } else {
                    i = str_len;
                    paramsPojo = {};
                }

                ourPageId = decodeURIComponent(str.substring(1, i));
                if (0 === ourPageId.length) {
                    ourPageId = this.__defaultPageId;
                }

                PageMgr_checkPageIdParsingConsistency(jqPageId, ourPageId);
                this.__setCurrentPage(jqPageId, paramsPojo);
            }
        },


        __windowOnLoad: {
            value: function () {
                var $q1, $q2;
                var jqPageId;
                $q1 = jQuery("body > *[data-role=page]");
                $q2 = $q1.filter(function () {
                    return jQuery(this).css("display") !== "none";
                });
                jqPageId = PageMgr_computeJQPageId();
                if ($q2.length !== 1 || jqPageId !== (ourPageId = $q2.attr("id"))) {
                    if ($q2.length > 1) {
                        throw Error( "There are multiple visible pages." );
                    }
                    if ( this.__windowOnLoad_deferCount++ > 3 ) {
                        throw Error( "There are no visible pages." );
                    }
                    setTimeout( this.__windowOnLoadFunc, 10 );
                    return;
                }
                console.log("The initial page has id \"" + jqPageId + "\".");
                this.__defaultPageId = $q1.attr("id");
                this.__synchronizeCurrentPageFromHash();
                jQuery.mobile.pageContainer.on("pagecontainershow", this.__jqOnPageShown.bind(this));
            }
        },
        registerPage: {
            value: function (page) {
                if ( !( page instanceof Page ) ) {
                    throw Error("page must be a Page (invalid argument)");
                }
                if ( this.__pageFromId.hasOwnProperty( page.id ) ) {
                    throw Error("A page with that id has already been registered.");
                }
                this.__pageFromId[page.id] = page;
            }
        },

        // Sets the current page (usually as a result of hash changes).
        __setCurrentPage: {
            value: function (pageId, paramsPojo) {
                var oldValue, oldPage, newPage;
                if (pageId === null || typeof (pageId) !== "string") {
                    throw Error();
                }
                if (this.__curPageId === pageId) {
                    return;
                }
                oldValue = this.__curPageId;
                oldPage = this.__pageFromId.hasOwnProperty(oldValue) ? this.__pageFromId[oldValue] : null;
                this.raiseEvent("propertyChanging", ["currentPageId", oldValue, pageId]);

                if (oldPage !== null) {
                    if (!oldPage.__isShown) {
                        throw Error();
                    }
                    oldPage.__isShown = false;
                    oldPage._onHide();
                    console.log( this.__curPageId + "._onHide: " );
                }
                this.__curPageId = pageId;
                jQuery.mobile.pageContainer.pagecontainer("change", "#" + pageId, {
                    changeHash: false
                });
                newPage = this.__pageFromId.hasOwnProperty(pageId) ? this.__pageFromId[pageId] : null;
                if (newPage !== null) {
                    if (newPage.__isShown) {
                        throw Error();
                    }
                    newPage.__isShown = true;
                    if ( !newPage.__hasBeenShown ) {
                        newPage.__hasBeenShown = true;
                        console.log( pageId + "._onFirstShow: ", paramsPojo );
                        newPage._onFirstShow( paramsPojo );
                    }
                    console.log( pageId + "._onShow: ", paramsPojo );
                    newPage._onShow( paramsPojo );
                }
                this.raiseEvent("propertyChanged", ["currentPageId", oldValue, pageId]);
            }
        },

        // Sets the current page by updating the hash.
        setCurrentPage: {
            value: function (pageId, paramsPojo) {
                var uriFragment;
                var queryString;
                if (typeof pageId !== "string") {
                    throw Error();
                }
                uriFragment = pageId;
                if (1 < arguments.length) {
                    queryString = pojoToUrlQueryString(paramsPojo);
                    if (queryString !== null) {
                        uriFragment += "?" + queryString;
                    }
                } else {
                    paramsPojo = {};
                }
                if (Window_navigate_uriFragment(uriFragment)) {
                    this.__setCurrentPage(pageId, paramsPojo);
                }
            }
        },
        currentPageId: {
            get: function () {
                return this.__curPageId;
            }
        }
    } );



    pageMgr0 = new __PageMgr();
    Object.defineProperties( PageMgr, {
        instance: { value: pageMgr0 }
    } );

    Object.defineProperties( window, {
        MimeType_isAudio: { value: MimeType_isAudio },
        saveAs2: { value: saveAs2 },
        Page: { value: Page },
        PageMgr: { value: PageMgr },
        Location: { value: Location },
        SampleMetadata: { value: SampleMetadata }
    } );


    var timeout = 10000;
    function CachedEntitySet( entityConstructor, entitySetName ) {
        Object.call( this );
        this.__getAllRequest = null;
        this.__entityConstructor = entityConstructor;
        this.__entitySetName = entitySetName;
        this.__fromIdCache = {};
        this.__hasGetAllBeenCompletedSuccessfully = false;
        this.__getAllCallbackFunctions = [];
    }
    
    function CachedEntitySet_entityIdToString( i ) {
        var s = i + "";
        if (0 <= s.lastIndexOf("e") ||
            0 <= s.lastIndexOf( "E" ) ) {
            throw Error();
        }
        return s;
    }

    function CachedEntitySet_matchPojoWithEntity( pojo, pojo_pna, entity ) {
        var i, n;
        var pojo_pn;
        n = pojo_pna.length;

        for ( i = 0; i < n; ++i ) {
            pojo_pn = pojo_pna[i];
            if ( pojo[pojo_pn] !== entity[pojo_pn] ) {
                return false;
            }
        }
        return true;
    }

    CachedEntitySet.prototype = Object.create( Object.prototype, {
        getAllAsync: {
            value: function ( callbackFunction ) {
                var entities;
                var entityIdStrings, i, n;
                if ( !( callbackFunction instanceof Function ) ) {
                    throw Error();
                }
                if ( !this.__hasGetAllBeenCompletedSuccessfully ) {
                    if ( this.__getAllRequest === null ) {
                        this.__getAllRequest = new HttpRequest( {
                            method: "GET",
                            url: "DefaultHandler.ashx?action=Get" + this.__entitySetName,
                            timeout: timeout,
                            retry_triggerOnNonTimeoutError: true
                        } );
                        this.__getAllRequest.addListener( "completed", this.__getAllRequestCompleted, this );
                        this.__getAllRequest.send();
                    }
                    this.__getAllCallbackFunctions.push( callbackFunction );
                } else {
                    entities = [];
                    entityIdStrings = Object.getOwnPropertyNames( this.__fromIdCache );
                    n = entityIdStrings.length;
                    for ( i = 0; i < n; ++i ) {
                        entities.push( this.__fromIdCache[entityIdStrings[i]] );
                    }
                    Object.freeze( entities );
                    callbackFunction( entities, true );
                }
            }
        },

        hasGetAllBeenCompletedSuccessfully: {
            get: function () {
                return this.__hasGetAllBeenCompletedSuccessfully;
            }
        },

        __getFromCacheSlow: {
            value: function ( pojo ) {
                var pojo_pna;
                var entity;
                var entityIdStrings;
                var i, n;
                var entities;
                pojo_pna = Object.getOwnPropertyNames( pojo );
                entityIdStrings = Object.getOwnPropertyNames(this.__fromIdCache);
                n = entityIdStrings.length;
                entities = [];
                for ( i = 0; i < n; ++i ) {
                    entity = this.__fromIdCache[entityIdStrings[i]];
                    if ( CachedEntitySet_matchPojoWithEntity( pojo, pojo_pna, entity ) ) {
                        entities.push( entity );
                    }
                }
                return entities;
            }
        },

        // TODO remove duplicate code: start of getFromCache and getAsync have very similar code.

        getFromCache: {
            value: function ( pojo ) {
                var id;
                var idString;
                var entity;
                if ( hasOwnP( pojo, "id" ) ) {
                    id = pojo.id;
                    if ( typeof id !== "number" || !( id % 1 === 0 ) ) {
                        throw Error();
                    }
                    delete pojo.id;
                    idString = CachedEntitySet_entityIdToString( id );
                    if ( hasOwnP( this.__fromIdCache, idString ) ) {
                        entity = this.__fromIdCache[idString];
                        if ( entity.id !== id ) {
                            throw Error();
                        }
                        return CachedEntitySet_matchPojoWithEntity( pojo, Object.getOwnPropertyNames( pojo ), entity ) ? [ entity ] : [];
                    }
                    return [];
                }
                return this.__getFromCacheSlow( pojo );

            }
        },

        getAsync: {
            value: function ( pojo, callbackFunction ) {
                var request;
                var entity;
                var id;
                var idString;
                var pojo_pna;
                var i, n;
                var url_queryStringSuffix;
                if ( !( callbackFunction instanceof Function ) ) {
                    throw Error();
                }
                if ( hasOwnP( pojo, "id" ) ) {
                    id = pojo.id;
                    if ( typeof id !== "number" || !( id % 1 === 0 ) ) {
                        throw Error();
                    }
                    delete pojo.id;
                    idString = CachedEntitySet_entityIdToString( id );
                    if ( hasOwnP( this.__fromIdCache, idString ) ) {
                        entity = this.__fromIdCache[idString];
                        if ( entity.id !== id ) {
                            throw Error();
                        }
                        callbackFunction(
                            Object.freeze( CachedEntitySet_matchPojoWithEntity( pojo, Object.getOwnPropertyNames( pojo ), entity )
                                ? [entity]
                                : [] ), true );
                        return;
                    }
                    if ( this.hasGetAllBeenCompletedSuccessfully ) {
                        callbackFunction( Object.freeze( [] ), true );
                        return;
                    }
                } else {
                    if ( this.hasGetAllBeenCompletedSuccessfully ) {
                        return callbackFunction( this.__getFromCacheSlow( pojo ), true );
                    }
                }
                url_queryStringSuffix = "";
                if ( id !== undefined ) {
                    url_queryStringSuffix += "&id=" + idString;
                }
                pojo_pna = Object.getOwnPropertyNames( pojo );
                n = pojo_pna.length;
                for ( i = 0; i < n; ++i ) {
                    url_queryStringSuffix += "&" + encodeURIComponent( pojo_pna[i] ) + "=" + encodeURIComponent( pojo[pojo_pna[i]] );
                }
                if ( url_queryStringSuffix.length === 0 ) {
                    return this.getAllAsync( callbackFunction );
                }
                request = new HttpRequest( {
                    method: "GET",
                    url: "DefaultHandler.ashx?action=Get" + this.__entitySetName + url_queryStringSuffix,
                    timeout: timeout,
                    retry_triggerOnNonTimeoutError: true
                } );
                request.addListener( "completed", function ( result, statusCode ) {
                    var entities;
                    var i, n;
                    if ( statusCode === 200 ) {
                        n = result.length;
                        entities = new Array( n );
                        for ( i = 0; i < n; ++i ) {
                            entities[i] = this.__processEntityFromServer( result[i] );
                        }
                        entities = Object.freeze( entities );
                    } else {
                        entities = null;
                    }
                    callbackFunction( entities, false );
                }, this );
                request.send();
            }
        },
        __processEntityFromServer: {
            value: function ( entityPojo ) {
                var copyPojoIntoEntityFunction;
                var copyPojoIntoEntityFunctionName;
                var getIdFromPojoFunction;
                var entity;
                var entityId;
                var entityIdString;
                var entityWasJustCreated;

                copyPojoIntoEntityFunctionName = "copyPojoInto" + this.__entityConstructor.name;
                if ( !hasOwnP( this.__entityConstructor, copyPojoIntoEntityFunctionName ) ) {
                    throw Error();
                }
                copyPojoIntoEntityFunction = this.__entityConstructor[copyPojoIntoEntityFunctionName];
                if ( !( copyPojoIntoEntityFunction instanceof Function ) ) {
                    throw Error();
                }
                if ( !hasOwnP( this.__entityConstructor, "getIdFromPojo" ) ) {
                    if ( !hasOwnP( entityPojo, "Id" ) ) {
                        throw Error();
                    }
                    entityId = entityPojo.Id;
                } else {
                    getIdFromPojoFunction = this.__entityConstructor.getIdFromPojo;
                    if ( !( getIdFromPojoFunction instanceof Function ) ) {
                        throw Error();
                    }
                    entityId = getIdFromPojoFunction( entityPojo );
                }
                if ( !(typeof entityId === "number" && entityId % 1 === 0) ) {
                    throw Error();
                }
                entityIdString = CachedEntitySet_entityIdToString( entityId );
                entityWasJustCreated = false;
                if ( hasOwnP( this.__fromIdCache, entityIdString ) ) {
                    entity = this.__fromIdCache[entityIdString];
                } else {
                    entity = new this.__entityConstructor();
                    entityWasJustCreated = true;
                }
                copyPojoIntoEntityFunction( entity, entityPojo );
                if ( entityWasJustCreated ) {
                    this.__fromIdCache[entityIdString] = entity;
                }
                return entity;
            }
        },

        __getAllAsyncNotify: {
            value: function ( entities ) {
                var arr;
                var i, n;
                var fn;
                arr = this.__getAllCallbackFunctions;
                this.__getAllCallbackFunctions = [];
                n = arr.length;
                for ( i = 0; i < n; ++i ) {
                    fn = arr[i];
                    fn( entities, false );
                }
            }
        },

        __getAllRequestCompleted: {
            value: function ( entityPojos, statusCode ) {
                if ( statusCode !== 200 ) {
                    if ( HttpRequest.STATUS_TIMEOUT !== statusCode ) {
                        throw Error();
                    }
                    this.__getAllRequest = null;
                    this.__getAllAsyncNotify( null );
                    return;
                }
                var i, n;
                var entity;
                var entities;
                this.__getAllRequest = null;
                n = entityPojos.length;
                entities = new Array( n );
                for ( i = 0; i < n; ++i ) {
                    entities[i] = this.__processEntityFromServer( entityPojos[i] );
                }
                Object.freeze( entities );
                this.__hasGetAllBeenCompletedSuccessfully = true;
                this.__getAllAsyncNotify( entities );
            }
        }
    } );

    function FileMetadata() {
        this.__id = 0;
        this.__name = null;
        this.__mimeType = null;
    }
    FileMetadata.prototype = Object.create( Object.prototype, {
        id: {
            get: function () {
                return this.__id;
            },
            set: function ( value ) {
                if ( typeof value !== "number" || !( value % 1 === 0 ) ) {
                    throw Error();
                }
                this.__id = value;
            }
        },
        name: {
            get: function () {
                return this.__name;
            },
            set: function ( value ) {
                if ( typeof value !== "string" ) {
                    throw Error();
                }
                this.__name = value;
            }
        },
        mimeType: {
            get: function () {
                return this.__mimeType;
            },
            set: function ( value ) {
                if ( typeof value !== "string" ) {
                    throw Error();
                }
                this.__mimeType = value;
            }
        }
    } );
    Object.defineProperties( FileMetadata, {
        copyPojoIntoFileMetadata: {
            value: function ( fmd, pojo ) {
                if ( !( fmd instanceof FileMetadata ) ) {
                    throw Error();
                }
                if ( !isPojo( pojo ) ) {
                    return false;
                }
                var pna, i, n;
                pna = Object.getOwnPropertyNames( pojo );
                n = pna.length;
                for ( i = 0; i < n; ++i ) {
                    var v = pojo[pna[i]];
                    try {
                        switch ( pna[i] ) {
                            case "Id":
                                fmd.id = v;
                                continue;
                            case "Name":
                                fmd.name = v;
                                continue;
                            case "MimeType":
                                fmd.mimeType = v;
                                continue;
                        }
                    } catch ( e ) {
                    }
                    return false;
                }
                return true;
            }
        }
    } );

    function BusinessLogic() {
        throw new Error();
    }
    function __BusinessLogic() {
        this.__isAuthenticated = false;
        this.__locations = new CachedEntitySet( Location, "Locations" );
        this.__sampleMetadatas = new CachedEntitySet( SampleMetadata, "SampleMetadatas" );

        this.__updateIsAuthenticated();
    }
    __BusinessLogic.prototype = BusinessLogic.prototype = Object.create( Object.prototype, {

        deleteSampleAsync: {
            value: function ( smdId, callbackFunction ) {
                var r = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=DeleteSample&id=" + smdId,
                    method: "POST"
                } );
                r.addListener( "completed", function ( result, statusCode ) {
                    callbackFunction( statusCode !== 200 );
                } );
                r.send();
            }
        },

        __updateIsAuthenticated: {
            value: function () {
                var r = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetIsAuthenticated",
                    method: "POST"
                } );
                var _this = this;
                r.addListener( "completed", function ( result, statusCode ) {
                    if ( statusCode !== 200 ) {
                        alertGeneralError();
                        return;
                    }
                    _this.__isAuthenticated = result;
                } );
                r.send();
            }
        },

        getFileMetadataAsync: {
            value: function ( fileId, callbackFunction ) {

                if ( typeof fileId !== "number" || !( fileId % 1 === 0 ) ) {
                    throw Error();
                }
                if ( !(callbackFunction instanceof Function) ) {
                    throw Error();
                }
                var request = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetFileMetadata&id=" + fileId,
                    method: "GET",
                    timeout: timeout,
                    retry_triggerOnNonTimeoutError: true
                } );
                request.addListener( "completed", function ( result, statusCode ) {
                   
                    if ( statusCode !== 200 ) {
                        callbackFunction( null, false, true );
                        return;
                    }
                    var fmd = new FileMetadata();
                    var fError = !FileMetadata.copyPojoIntoFileMetadata( fmd, result );
                    callbackFunction( fError ? null : fmd, false, fError );
                } );
                request.send();
            }
        },

        getAllLocationsAsync: {
            value: function ( callbackFunction ) {
                return this.__locations.getAllAsync( callbackFunction );
            }
        },

        getApprovedSampleFieldsAsync: {
            value: function ( smdId, callbackFunction ) {

                if ( !( callbackFunction instanceof Function ) ) {
                    throw Error();
                }
                var request;
                request = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetApprovedSampleFields&id=" + smdId,
                    retry_triggerOnNonTimeoutError: true,
                    timeout: timeout,
                    method: "GET"
                } );
                request.addListener( "completed", function ( result, statusCode ) {
                    callbackFunction( statusCode === 200 ? result : null, false, statusCode !== 200 );
                }, this );
                request.send();

            }
        },

        getSampleMetadataAsync: {
            value: function ( id, callbackFunction ) {
                if ( !( callbackFunction instanceof Function ) ) {
                    throw Error();
                }

                this.__sampleMetadatas.getAsync( { id: id }, function ( sampleMetadatas, fCompletedSynchronously ) {

                    if ( sampleMetadatas === null ) {
                        callbackFunction( null, fCompletedSynchronously, true );
                        return;
                    }
                    if ( 1 < sampleMetadatas.length ) {
                        throw Error();
                    }
                    callbackFunction( sampleMetadatas.length === 0 ? null : sampleMetadatas[0], fCompletedSynchronously, false );

                } );

            }
        },


        getLocationAsync: {
            value: function ( arg1, callbackFunction ) {
                var getAsyncPojo;
                if ( typeof arg1 !== "string" &&
                    typeof arg1 !== "number" ) {
                    throw Error();
                }
                if ( !( callbackFunction instanceof Function ) ) {
                    throw Error();
                }
                if ( typeof arg1 === "number" ) {
                    getAsyncPojo = { id: arg1 };
                } else {
                    getAsyncPojo = { name: arg1 };
                }

                this.__locations.getAsync( getAsyncPojo, function ( locations, fCompletedSynchronously ) {

                    if ( locations === null ) {
                        callbackFunction( null, fCompletedSynchronously, true );
                    } else {
                        if ( 1 < locations.length ) {
                            throw Error();
                        }
                        callbackFunction( locations.length === 0 ? null : locations[0], fCompletedSynchronously, false );
                    }
                } );
            }
        },

        // This method performs best if getAllLocationsAsync is called at least once before the first call to this.
        __initializeNumberOfSamplesPerLocation: {
            value: function () {

                var request;
                request = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetSampleCountPerLocation",
                    retry_triggerOnNonTimeoutError: true,
                    timeout: timeout
                } );
                request.addListener( "completed", function ( result, statusCode ) {

                    if ( statusCode !== 200 ) {
                        return;
                    }

                    var i, n;
                    var obj;
                    n = result.length;
                    for ( i = 0; i < n; ++i ) {

                        obj = result[i];
                        this.__initializeNumberOfSamplesPerLocation_one( obj.Key, obj.Value );

                    }


                }, this );
                request.send();


            }
        },
        __initializeNumberOfSamplesPerLocation_one: {
            value: function ( locationId, sampleMetadataCount ) {
                this.getLocationAsync( locationId, function ( location, fCompletedSynchronously, fError ) {
                    if ( location !== null ) {
                        location.__setSampleMetadataCount( sampleMetadataCount );
                    }
                } );
            }
        },

        __processSampleMetadataFromServer: {
            value: function ( sampleMetadataPojo ) {
                return this.__sampleMetadatas.__processEntityFromServer( sampleMetadataPojo );
            }
        },

        getAllSampleMetadataAsync: {
            value: function ( locationId, callbackFunction ) {
                var _this;
                _this = this;
                _this.getLocationAsync( locationId, function ( location, fCompletedSynchronously, fError ) {

                    var sampleMetadatas;
                    var sampleMetadataList;
                    if ( fError ) {
                        callbackFunction( null, fCompletedSynchronously );
                        return;
                    }
                    if ( location === null ) {
                        callbackFunction( Object.freeze( [] ), fCompletedSynchronously );
                        return;
                    }
                    sampleMetadataList = location.sampleMetadatas;
                    if ( sampleMetadataList.isInitialized ) {
                        sampleMetadatas = Object.freeze( sampleMetadataList.toArray() );
                        callbackFunction( sampleMetadatas, fCompletedSynchronously );
                        return;
                    }
                    sampleMetadataList.__onTriedInitializeCallbackFunctions.push( callbackFunction );
                    if ( sampleMetadataList.isInitializing ) {
                        return;
                    }
                    sampleMetadataList.__isInitializing = true;
                    _this.__sampleMetadatas.getAsync( {
                        locationId: locationId
                    }, sampleMetadataList.__tryEndInitialize.bind(sampleMetadataList));
               

                } );

      

            }
        },

        updateSampleAsync: {
            value: function ( sampleAsPojo, callbackFunction ) {
                var req;
                req = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=UpdateSample",
                    method: "POST",
                    body: new HttpRequestFormData( sampleAsPojo ),
                    timeout: timeout,
                    retry_triggerOnNonTimeoutError: true
                } );
                req.addListener( "completed", function ( result, statusCode ) {
                    if ( statusCode !== 200 || result === null ) {
                        callbackFunction( null, false, true );
                        return;
                    }
                    var smd = this.__processSampleMetadataFromServer( result );
                    callbackFunction( smd, false, false );
                }, this );
                req.send();
            }
        },

        createSampleAsync: {
            value: function ( sampleAsPojo, callbackFunction ) {
                var locationId, locations, sampleUploader;
                if ( !(callbackFunction instanceof Function) ) {
                    throw Error();
                }
                if ( !hasOwnP( sampleAsPojo, "locationId" ) ) {
                    throw Error();
                }
                locationId = sampleAsPojo.locationId;
                locations = this.__locations.getFromCache( { id: locationId } );
                if ( locations.length !== 1 ) {
                    throw Error();
                }
                sampleUploader = new SampleUploader( sampleAsPojo );
                locations[0].sampleUploaders.add( sampleUploader );
                sampleUploader.addListener( "uploadCompleted", function ( fError ) {
                    callbackFunction( fError );
                } );
                sampleUploader.start();
            }
        },

        getOrCreateLocationAsync: {
            value: function ( name, callbackFunction ) {
                var t1;
                if ( !( callbackFunction instanceof Function ) ) {
                    throw Error();
                }
                if ( typeof name !== "string" ) {
                    throw Error();
                }

                t1 = this.__locations.getFromCache( {
                    name: name
                } );
                if ( t1.length !== 0 ) {
                    if ( 1 < t1.length ) {
                        throw Error();
                    }
                    callbackFunction( t1[0], true, false );
                    return;
                }

                t1 = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetOrCreateLocation&name=" + encodeURIComponent(name),
                    timeout: timeout,
                    retry_triggerOnNonTimeoutError: true
                } );
                t1.addListener( "completed", function ( locationPojo, statusCode ) {
                    var location;
                    if ( statusCode !== 200 ) {
                        callbackFunction( null, false, true );
                        return;
                    }
                    location = this.__locations.__processEntityFromServer( locationPojo );
                    callbackFunction( location, false, false );
                }, this);
                t1.send();
            }
        }
    } );


    Object.defineProperties( BusinessLogic, {
        instance: { value: new __BusinessLogic() }
    } );

    Object.defineProperties( window, {
        BusinessLogic: { value: BusinessLogic }
    } );


    function addOwnSrcPropertiesToDst( src, dst ) {
        var srcOwnPropNames, i, n, srcOwnPropName;
        srcOwnPropNames = Object.getOwnPropertyNames( src );
        n = srcOwnPropNames.length;
        for ( i = 0; i < n; ++i ) {
            if ( hasOwnP( dst, srcOwnPropNames[i] ) ) {
                throw Error();
            }
        }
        for ( i = 0; i < n; ++i ) {
            srcOwnPropName = srcOwnPropNames[i];
            dst[srcOwnPropName] = src[srcOwnPropName];
        }
        return dst;
    }

    function setOwnSrcPropertiesOnDst( src, dst ) {
        var srcOwnPropNames, i, n, srcOwnPropName;
        srcOwnPropNames = Object.getOwnPropertyNames( src );
        n = srcOwnPropNames.length;
        for ( i = 0; i < n; ++i ) {
            srcOwnPropName = srcOwnPropNames[i];
            dst[srcOwnPropName] = src[srcOwnPropName];
        }
        return dst;
    }

    function setOwnSrcPropertiesOnDstAsAttrs( src, dst ) {
        var srcOwnPropNames, i, n, srcOwnPropName, srcOwnPropVal;
        srcOwnPropNames = Object.getOwnPropertyNames( src );
        n = srcOwnPropNames.length;
        for ( i = 0; i < n; ++i ) {
            srcOwnPropName = srcOwnPropNames[i];
            srcOwnPropVal = src[srcOwnPropName];
            if ( typeof srcOwnPropVal !== "string" ) {
                throw Error();
            }
            dst.setAttribute( srcOwnPropName, srcOwnPropVal );
        }
        return dst;
    }

    Object.defineProperties( window, {
        addOwnSrcPropertiesToDst: { value: addOwnSrcPropertiesToDst },
        setOwnSrcPropertiesOnDst: { value: setOwnSrcPropertiesOnDst },
        setOwnSrcPropertiesOnDstAsAttrs: { value: setOwnSrcPropertiesOnDstAsAttrs }
    } );

} )();


$(function () {
    $("*[data-x-nav],*[data-x-nav-params]").on("click", function () {
        var pageId;
        var paramsPojo, paramsPojo_asJson;

        pageId = elem_getAttr(this, "data-x-nav");
        paramsPojo_asJson = elem_getAttr(this, "data-x-nav-params");
        if (paramsPojo_asJson !== null) {
            paramsPojo = JSON.parse(paramsPojo_asJson);
            if (!isPojo(paramsPojo)) {
                throw Error();
            }
        } else {
            paramsPojo = null;
        }
        
        switch (pageId) {
            case "@forward":1
                if (paramsPojo !== null) {
                    throw Error();
                }
                history.forward();
                break;
            case "@back":
                if (paramsPojo !== null) {
                    throw Error();
                }
                history.back();
                break;
            default:
                if (paramsPojo === null) {
                    PageMgr.instance.setCurrentPage(pageId);
                } else {
                    PageMgr.instance.setCurrentPage(pageId, paramsPojo);
                }
                break;
        }
    } );



} );



function Color( r, g, b, a ) {
    assert( Number_is01( r ) );
    assert( Number_is01( g ) );
    assert( Number_is01( b ) );
    assert( Number_is01( a ) );
    this.__r = r;
    this.__g = g;
    this.__b = b;
    this.__a = a;
}
Color.prototype = Object.create( Object.prototype, {
    r: {
        get: function () { return this.__r; }
    },
    g: {
        get: function () { return this.__g; }
    },
    b: {
        get: function () { return this.__b; }
    },
    a: {
        get: function () { return this.__a; }
    },
    toString: {
        value: function ( format ) {
            var t;
            t = arguments.length;
            if ( t > 1 ) {
                throw Error();
            }
            if ( t === 0 ) {
                format = "rgb_bytes_css";
            }
            switch ( format ) {
                case "rgb_bytes_css":
                    return "rgb(" + Number_01ToByte( this.__r ) + "," + Number_01ToByte( this.__g ) + "," + Number_01ToByte( this.__b ) + ")";
                default:
                    throw Error();
            }
        }
    }
} );
Object.defineProperties( Color, {
    fromRgbaBytes: {
        value: function ( r, g, b, a ) {
            return new Color( Number_byteTo01( r ), Number_byteTo01( g ), Number_byteTo01( b ), a );
        }
    },
    parseHexadecimalString: {
        value: function (s) {
            if (typeof s !== "string" || !/^[a-fA-F0-9]{6}([a-fA-F0-9]{2})?$/.test(s)) {
                throw Error();
            }
            var r, g, b, a;
            var t;
            t = parseInt( s, 16 );
            if ( s.length > 6 ) {
                a = Number_byteTo01( t & 0xFF );
                t = t * (1 / 256);
            } else {
                a = 1;
            }
            b = Number_byteTo01( t & 0xFF );
            g = Number_byteTo01( (t >> 8) & 0xFF );
            r = Number_byteTo01(( t >> 16 ) & 0xFF );
            return new Color( r, g, b, a );
        }
    }
} );

Object.defineProperty( window, "alertGeneralError", {
    value: function () {
        alert("A general error occured. Please try again later.");
    }
} );
// jQuery.mobile.defaultPageTransition = "slide";