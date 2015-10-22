(function() {

    var map;

    /*
    var updateIntervalID;
    var map_prevBounds;
    var map_prevZoom;
      */
    var map_restrictCenterToLatLngRect = null;
    var italyLatLngRect;
    var geocoder;
    var relevantCityViews;
    var MAX_RETRY_COUNT = 3;
    var STYLED_MAP_TYPE_0_NAME = "Map type 0";

    relevantCityViews = [];

    italyLatLngRect = new google.maps.LatLngBounds(
		new google.maps.LatLng(36.11429862157169, 5.7123593750000055),	// south-west
		new google.maps.LatLng(47.21466702180809, 20.126421875000005)	// north-east
		);

    // leave null to use defaults
    map_restrictCenterToLatLngRect = italyLatLngRect;


    function InitializeRelevantCity_GeocodeRequest(city) {
        this._city = city;
        this._userCallback = null;
        this._retryCount = 0;
        this._onGeocodeEndFunc = null;
    }
    InitializeRelevantCity_GeocodeRequest.prototype = Object.create(Object.prototype, {
        _error: { value: function() {
            console.error.apply(console, arguments);
            this._userCallback(null, null);
        } },
        _onGeocodeEnd: { value: function(geocoderResults, statusCode) {

            switch (statusCode) {
                case google.maps.GeocoderStatus.OK:
                    break;
                case google.maps.GeocoderStatus.ZERO_RESULTS:
                    // not sure if geocoderResults is an empty array in this case, better safe than sorry
                    geocoderResults = [];
                    break;
                case google.maps.GeocoderStatus.REQUEST_DENIED:
                case google.maps.GeocoderStatus.INVALID_REQUEST:
                case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
                    // fuck
                default:
                    this._error("InitializeRelevantCity_GeocodeRequest._onGeocodeEnd: unsupported result ", arguments);
                    return;
                case google.maps.GeocoderStatus.ERROR:
                    // "There was a problem contacting the Google servers."
                case google.maps.GeocoderStatus.UNKNOWN_ERROR:
                    // quote from
                    // https://developers.google.com/maps/documentation/javascript/reference#Geocoder
                    // "the request may succeed if you try again"
                    if (++this._retryCount > MAX_RETRY_COUNT) {
                        this._error("InitializeRelevantCity_GeocodeRequest._onGeocodeEnd: max retry count exceeded");
                    } else {
                        console.warn("InitializeRelevantCity_GeocodeRequest._onGeocodeEnd: retrying");
                        this._sendGMapRequest();
                    }
                    return;
            }

            if (geocoderResults.length === 0) {
                this._error("InitializeRelevantCity_GeocodeRequest._onGeocodeEnd: no results");
                return;
            }
            var bestGCResult;
            var bestGCResult_score = -1/0;
            for (var i = 0; i < geocoderResults.length; ++i) {
                var curGCResult_score = this._getGeocoderResultScore(geocoderResults[i]);
                if (curGCResult_score > bestGCResult_score) {
                    bestGCResult = geocoderResults[i];
                    bestGCResult_score = curGCResult_score;
                }
            }
            this._userCallback(bestGCResult, this._city);
        } },
        _getGeocoderResultScore: { value: function(geocoderResult) {

            var addrComps;
            var score;
            var num;
            score = 0;
            addrComps = geocoderResult.address_components;
            for (var i = 0; i < addrComps.length; ++i) {
                if (addrComps[i].types.indexOf("country") >= 0) {
                    if (addrComps[i].short_name !== "IT") {
                        score -= 100;
                    }
                }
                if (addrComps[i].types.indexOf("postal_code") >= 0) {
                    score -= 50;
                }
                if (addrComps[i].types.indexOf("locality") >= 0) {
                    if (addrComps[i].long_name === this._cityName) {
                        score += 25;
                    }
                }
                if (addrComps[i].types.some(function(type) {
						return type.indexOf("administrative_area_level_") === 0;
                }) && addrComps[i].long_name === this._cityName) {
                    ++score;
                }
            }
            return score;
        } },
        _sendGMapRequest: { value: function() {
            geocoder.geocode({
                address: this._city.name,
                bounds: italyLatLngRect,
                region: "IT"
            }, this._onGeocodeEndFunc);
        } },
        send: { value: function(callback) {
            if (arguments.length !== 1 || !(callback instanceof Function)) {
                throw Error();
            }
            if (this._userCallback !== null) {
                throw Error("can only call send once");
            }
            this._userCallback = callback;
            this._onGeocodeEndFunc = this._onGeocodeEnd.bind(this);
            this._sendGMapRequest();
        } }
    });
    function initializeRelevantCity_geocode_end( bestGCResult, city ) {
        var city;
        if ( bestGCResult === null ) {
            // error should be in console
            return;
        }
        city._geocodeResult = bestGCResult;

        relevantCityViews.push(new RelevantCityView(map, city));
    }

                   
    function RelevantCityView_GoogleMapsOverlayView(relevantCityView) {
        this._relevantCityView = relevantCityView;
    }
    RelevantCityView_GoogleMapsOverlayView.prototype = new google.maps.OverlayView();
    setOwnSrcPropertiesOnDst( {
        onAdd: function () {
            this._relevantCityView._gmov_onAdd();
        },
        onRemove: function () {
            this._relevantCityView._gmov_onRemove();
        },
        draw: function () {
            this._relevantCityView._gmov_draw();
        }
    }, RelevantCityView_GoogleMapsOverlayView.prototype );


    var relevantCityView_glyph_colors = [
        // default state, mouse inside state     
        /*
        [Color.fromRgbaBytes( 205, 16, 26, 0.5 ), Color.fromRgbaBytes( 205, 16, 26, 0.7 )],
        [new Color(0.5, 0.5, 0.5, 0.6), new Color(0.5, 0.5, 0.5, 0.9)],
        [Color.fromRgbaBytes(0x99, 0xd8, 0xc9, 0.7), Color.fromRgbaBytes(0x99, 0xd8, 0xc9, 0.9)],
        [Color.fromRgbaBytes( 0x2C, 0xA2, 0x5F, 0.5 ), Color.fromRgbaBytes( 0x2C, 0xA2, 0x5F, 0.7 )],
        */
          [Color.parseHexadecimalString( "bd0026C0" ), Color.parseHexadecimalString( "bd0026C0" )],
          [Color.parseHexadecimalString( "f03b20C0" ), Color.parseHexadecimalString( "f03b20C0" )],
          [Color.parseHexadecimalString( "fd8d3cC0" ), Color.parseHexadecimalString( "fd8d3cC0" )],
          //[Color.parseHexadecimalString( "fecc5cC0" ), Color.parseHexadecimalString( "fecc5cC0" )],   
          [Color.parseHexadecimalString( "2ca25fC0" ), Color.parseHexadecimalString( "2ca25fC0" )]
    ];
    var relevantCityView_glyph_donut_padding = 1;
    var relevantCityView_glyph_donut_thickness_f = 1 / 3;   // donut thickness is outerRadius times this factor
    var relevantCityView_glyph_outerRadiusBig = 17;
    var relevantCityView_glyph_outerRadiusSmall = 12;
    var relevantCityView_glyph_scale = 1.7;



    function RelevantCityView(map, city) {
        this._city = city;
        this._gmov = new RelevantCityView_GoogleMapsOverlayView( this );
        this._map = map;
        this._hideAlways = false;

        
        this._svgSvgElement = null;


        // Container for all visible elements (has a translate property so the origin is on the city itself).
        this._svgVisualElement = null;
        this._glyph_svgElement = null;
        this._glyph_onClickFunc = this._glyph_onClick.bind( this );
        this._glyph_onMouseEnterFunc = this._glyph_onMouseEnter.bind( this );
        this._glyph_onMouseLeaveFunc = this._glyph_onMouseLeave.bind( this );
        this._glyph_isMouseInside = false;

        this._city.addListener( "propertyChanged", this._city_propertyChanged, this );

        this._glyph_text = null;
        this._glyph_donut = null;
        this._glyph_pieSegment = null;
        this._updateGlyphPieType();
        this._gmov.setMap(this._map);

    }
    RelevantCityView.prototype = Object.create(Object.prototype, {
        
        city: {
            get: function () {
                return this._city;
            }
        },

        hideAlways: {
            get: function () {
                return this._hideAlways;
            },
            set: function (value) {
                assert(typeof value === "boolean");
                if (this._hideAlways !== value) {
                    this._hideAlways = value;
                    if (this._svgSvgElement !== null) {
                        elem_display(this._svgSvgElement, !value);
                    }
                }
            }
        },

        _updateGlyphPieType: {
            value: function () {
                var pt;
                var t = this._city.sampleMetadataCount;
                if (t === 0) {
                    pt = 0;
                } else if (t <= 1) {
                    pt = 1;
                } else if (t <= 2) {
                    pt = 2;
                } else {
                    pt = 3;
                }
                this.glyph_pieType = pt;
                this.glyph_colorIndex = this.glyph_pieType;
            }
        },

        _city_propertyChanged: {
            value: function () {
                this._updateGlyphPieType();
            }
        },

        _gmov_onAdd: { 
            value: function () {
                var panes;


                this._svgSvgElement = svgElem_createSvg();
                setOwnSrcPropertiesOnDst( {
                    position: "absolute",
                    overflow: "visible",
                    cursor: "pointer"
                }, this._svgSvgElement.style);
                elem_display(this._svgSvgElement, !this.hideAlways);
                this._svgSvgElement.addEventListener("click", this._glyph_onClickFunc, false);
                this._svgSvgElement.addEventListener("mouseenter", this._glyph_onMouseEnterFunc, false);
                this._svgSvgElement.addEventListener("mouseleave", this._glyph_onMouseLeaveFunc, false);

                {
                    this._svgVisualElement = svgElem_create( "g" );
               
                    this._glyph_initializeDom();

                    this._svgSvgElement.appendChild(this._svgVisualElement);
                }

                panes = this._gmov.getPanes();
                panes.overlayMouseTarget.appendChild( this._svgSvgElement );
            }
        },
        _gmov_draw: {
            value: function () {
                var projection, centerPixels;
                var or, sw;
                var clipSquareRadius;
                var scale;
                projection = this._gmov.getProjection();


                scale = Math.pow( 2, this._map.getZoom() - 11 );
                or = this.glyph_outerRadius;
                sw = or * this.glyph_donutThicknessFactor;
                or += sw * 0.5;
                clipSquareRadius = or * relevantCityView_glyph_scale * scale;

                setOwnSrcPropertiesOnDstAsAttrs( {
                    width: clipSquareRadius * 2 + "",
                    height: clipSquareRadius * 2 + "",
                }, this._svgSvgElement );

                centerPixels = projection.fromLatLngToDivPixel(this._city.__gmapsLatLng);
                setOwnSrcPropertiesOnDst( {
                    left: centerPixels.x - clipSquareRadius + "px",
                    top: centerPixels.y - clipSquareRadius + "px"
                }, this._svgSvgElement.style);
                setOwnSrcPropertiesOnDstAsAttrs({
                    transform: "translate(" + clipSquareRadius + "," + clipSquareRadius + ") scale(" + scale + "," + scale +")"
                }, this._svgVisualElement);

                this._glyph_updateDonut();
                this._glyph_updatePieSegmentShape();

            }
        },
        _gmov_onRemove: {
            value: function () {
                this._svgSvgElement.parentNode.removeChild( this._svgSvgElement );
                this._glyph_removeDomRefs();
                this._svgVisualElement = null;
                this._svgSvgElement = null;
            }
        },
        _glyph_onClick: {
            value: function ( event ) {
                if ( event.button !== 0 ) {
                    return;
                }
                PageMgr.instance.setCurrentPage( "page-location", { location: this._city.name } );
            }
        },
        _glyph_onMouseEnter: {
            value: function ( event ) {
                this._glyph_isMouseInside = true;
                this._glyph_updateColorIndex();
            }
        },
        _glyph_onMouseLeave: {
            value: function ( event ) {
                this._glyph_isMouseInside = false;
                this._glyph_updateColorIndex();
            }
        },
        glyph_pieType: {
            get: function () {
                return this._glyph_pieType;
            },
            set: function ( value ) {
                assert( typeof value === "number" && value % 1 === 0 && 0 <= value && value <= 3 );
                if ( value !== this._glyph_pieType ) {
                    this._glyph_pieType = value;
                    if ( this._glyph_svgElement !== null ) {
                        if ( this._glyph_updatePieSegmentShape() ) {
                            this._glyph_pieSegment_setColor(this.glyph_color);
                        }
                    }
                }
            }
        },
        glyph_colorIndex: {
            get: function () { return this._glyph_colorIndex; },
            set: function ( value ) {
                assert( typeof value === "number" && value % 1 === 0 && 0 <= value && value <= relevantCityView_glyph_colors.length );
                if ( value !== this._glyph_colorIndex ) {
                    this._glyph_colorIndex = value;
                    if ( this._glyph_svgElement !== null ) {
                        this._glyph_updateColorIndex();
                    }
                }
            }
        },
        glyph_donutThicknessFactor: {
            get: function () {

                var i;
                var minIn = 10;
                var maxIn = 13;
                var minOut = relevantCityView_glyph_donut_thickness_f;
                var maxOut = 1;
                var shouldInvert = true;
                i = this._map.getZoom();
                if (i > maxIn) {
                    i = maxIn;
                } else if (i < minIn) {
                    i = minIn;
                }
                i = (i - minIn) / (maxIn - minIn);
                if (shouldInvert) {
                    i = 1 - i;
                }
                i = i * (maxOut - minOut) + minOut;
                return i;
            }
        },
        glyph_outerRadius: {
            get: function () {
                var r;
                r = ( this._city.importanceCategory > 0 ? relevantCityView_glyph_outerRadiusBig : relevantCityView_glyph_outerRadiusSmall );
                return r;
            }
        },
        glyph_color: {
            get: function () {
                return relevantCityView_glyph_colors[this._glyph_colorIndex][this._glyph_isMouseInside ? 1 : 0];
            }
        },
        _glyph_updateColorIndex: {
            value: function () {  
                var c;
                c = this.glyph_color;
                svgElem_setStroke_solidColor(this._glyph_svgElement, c);
                if ( this._glyph_pieSegment !== null ) {
                    this._glyph_pieSegment_setColor( c );
                }
            }
        },
        _glyph_pieSegment_setColor: {
            value: function (color) {
                svgElem_setFill_solidColor(this._glyph_pieSegment, color);
            }
        },
        _glyph_updatePieSegmentShape: {
            value: function () {
                var isNew;
                var r;

                r = this.glyph_outerRadius;
                r = r - r * this.glyph_donutThicknessFactor - relevantCityView_glyph_donut_padding;

                if ( this._glyph_pieType === 0 || r <= 0 ) {
                    if ( this._glyph_pieSegment !== null ) {
                        this._glyph_pieSegment.parentNode.removeChild( this._glyph_pieSegment );
                        this._glyph_pieSegment = null;
                    }
                    return;
                }
                if (r > 0) {
                    isNew = (this._glyph_pieSegment === null);
                    if (isNew) {
                        this._glyph_pieSegment = svgElem_create("path");
                        setOwnSrcPropertiesOnDstAsAttrs({
                            stroke: "none"
                        }, this._glyph_pieSegment);
                        this._glyph_pieSegment_setColor(this.glyph_color);
                    }

                    assert(1 <= this._glyph_pieType && this._glyph_pieType <= 3);
                    setOwnSrcPropertiesOnDstAsAttrs({
                        d: (this._glyph_pieType === 3
                            ? svgPathStr_circle(r, true)
                            : svgPathStr_pieSegment(r, (Math.PI * 2 / 3) * this._glyph_pieType, true))
                    }, this._glyph_pieSegment);
                    if (isNew) {
                        this._glyph_svgElement.appendChild(this._glyph_pieSegment);
                    }
                }
                return isNew;
            }
        },
        _glyph_updateDonut: {
            value: function () {

                var or;
                var sw;
                or = this.glyph_outerRadius;
                sw = or * this.glyph_donutThicknessFactor;

                setOwnSrcPropertiesOnDstAsAttrs({
                    r: or - sw * 0.5 + "",
                    "stroke-width": sw + ""
                }, this._glyph_donut);

            }
        },
        _glyph_initializeDom: {
            value: function () {

                this._glyph_svgElement = svgElem_create( "g" );
                // this._glyph_svgElement.style.cursor = "default";

                this._glyph_svgElement.setAttribute("transform", "scale(" + relevantCityView_glyph_scale + ",-" + relevantCityView_glyph_scale + ")");


                {
                    this._glyph_donut = svgElem_create( "circle" );
                    setOwnSrcPropertiesOnDstAsAttrs( {
                        fill: "black",
                        "fill-opacity": 0.001 + "",
                        "id": Math.random() + ""
                    }, this._glyph_donut );
                    this._glyph_svgElement.appendChild( this._glyph_donut );
                }
                this._glyph_updateDonut();
                this._glyph_updatePieSegmentShape();
                this._glyph_updateColorIndex();
                this._svgVisualElement.appendChild(this._glyph_svgElement);



                this._glyph_text = svgElem_create("text");
                setOwnSrcPropertiesOnDstAsAttrs({

                }, this._glyph_text);
                this._glyph_text.appendChild(document.createTextNode(this._city.name));
                //this._svgVisualElement.appendChild(this._glyph_text);
            }
        },
        _glyph_removeDomRefs: {
            value: function () {
                this._glyph_pieSegment = null;
                this._glyph_donut = null;
                this._glyph_text = null;
                this._glyph_svgElement = null;
            }
        }
    } );

    
    // We assume the positive direction along the y-axis is upwards (the positive direction of the x-axis is rightwards, as one can expect).
    // When r = 1 and angleInRadians = PI / 4 then the returned path is the outline of the top-right quarter of the unit circle.
    // The pie segment will always contains the vertical line from (0,0) to (0,r).
    function svgPathStr_pieSegment( r, angleInRadians, useClockwiseWinding ) {
        var x, y, largeArcFlag;
        assert( useClockwiseWinding );
        x = Math.cos( -angleInRadians + Math.PI / 2 ) * r;
        y = Math.sin( -angleInRadians + Math.PI / 2 ) * r;
        largeArcFlag = angleInRadians > Math.PI;
        return "M0,0L0," + r + " A" + r + "," + r + " 0 " + ( largeArcFlag ? 1 : 0 ) + ",0 " + x + "," + y + "Z";
    }
    function svgPathStr_donut( innerRadius, outerRadius ) {
        var s;
        s = svgPathStr_circle( outerRadius, true ) +
            svgPathStr_circle( innerRadius, false );
        return s;
    }
    function svgPathStr_circle(r, useClockwiseWinding) {
        var s;
        if (useClockwiseWinding) {
            s = "M" + svgPathStr_p( -r, 0 ) +
                "A" + svgPathStr_p( r, r ) + " 0 0,0 " + svgPathStr_p( r, 0 ) +
                "A" + svgPathStr_p( r, r ) + " 0 0,0 " + svgPathStr_p( -r, 0 );
        } else {
            s = "M" + svgPathStr_p( -r, 0 ) +
                "A" + svgPathStr_p( r, r ) + " 0 0,1 " + svgPathStr_p( r, 0 ) +
                "A" + svgPathStr_p( r, r ) + " 0 0,1 " + svgPathStr_p( -r, 0 );
        }
        return s;
    }
    function svgPathStr_p( x, y ) {
        return x + "," + y;
    }

    /*
    function update() {
        var map_curBounds;
        map_curBounds = map.getBounds();
        if (!equals(map_curBounds, map_prevBounds)) {
            // console.log("bounds_changed: ", toString(map_curBounds));
            map_prevBounds = map_curBounds;
        }
        var map_curZoom = map.getZoom();
        if (map_curZoom !== map_prevZoom) {
            // console.log("zoom_changed: ", map_curZoom);
            map_prevZoom = map_curZoom;
        }
    }
    */

    function map_onCenterChanged() {
        restrictMapCenterToLatLngBounds();
    }

    function restrictMapCenterToLatLngBounds() {
        var C;
        if (map_restrictCenterToLatLngRect !== null && !map_restrictCenterToLatLngRect.contains(C = map.getCenter())) {
            var X = C.lng();
            var Y = C.lat();
            var AmaxX = map_restrictCenterToLatLngRect.getNorthEast().lng();
            var AmaxY = map_restrictCenterToLatLngRect.getNorthEast().lat();
            var AminX = map_restrictCenterToLatLngRect.getSouthWest().lng();
            var AminY = map_restrictCenterToLatLngRect.getSouthWest().lat();

            if (X < AminX) {X = AminX;}
            if (X > AmaxX) {X = AmaxX;}
            if (Y < AminY) {Y = AminY;}
            if (Y > AmaxY) {Y = AmaxY;}

            map.setCenter(new google.maps.LatLng(Y,X));
        }
    }

    function initialize( map_htmlElement ) {
        var c;
        var mapOptions = {
            zoom: 10,
            minZoom: 6,
            maxZoom: 14,
            mapTypeControlOptions: {
                mapTypeIds: [STYLED_MAP_TYPE_0_NAME, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN]
            },
            mapTypeId: STYLED_MAP_TYPE_0_NAME,
            panControl: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false
        };
        var styledMapType0 = new google.maps.StyledMapType( [
			{
			    featureType: "administrative",
			    elementType: "labels",
			    stylers: [
					{ visibility: "on" }
			    ]
			}, {
			    featureType: "poi",
			    elementType: "labels",
			    stylers: [
					{ visibility: "off" }
			    ]
			}, {
			    featureType: "water",
			    elementType: "labels",
			    stylers: [
					{ visibility: "off" }
			    ]
			}, {
			    featureType: "road",
			    elementType: "labels",
			    stylers: [
					{ visibility: "off" }
			    ]
			}], { name: STYLED_MAP_TYPE_0_NAME } );

        map = new google.maps.Map( map_htmlElement, mapOptions );
        map.mapTypes.set( STYLED_MAP_TYPE_0_NAME, styledMapType0 );

        geocoder = new google.maps.Geocoder();


        /*
        map_prevBounds = map.getBounds();
        map_prevZoom = map.getZoom();
        updateIntervalID = setInterval( update, 100 );
        */
        google.maps.event.addListener(map, 'center_changed', map_onCenterChanged);
        window.map = map;

        BusinessLogic.instance.getAllLocationsAsync( function ( locArr, fCompletedSynchronously ) {
            var i, n;
            if ( locArr === null ) {
                console.error("could not retrieve locations");
                return;
            }
            n = locArr.length;
            for ( i = 0; i < n; ++i ) {
                relevantCityViews.push( new RelevantCityView( map, locArr[i] ) );
            }

        } );

        BusinessLogic.instance.__initializeNumberOfSamplesPerLocation();
    }

    function toString(value, stringIfValueIsNull) {
        if (arguments.length < 2) {
            stringIfValueIsNull = "null";
        }
        if (value === null) {
            return stringIfValueIsNull;
        }
        return value.toString();
    }

    function equals(a, b) {
        return a === b || (a !== null && a.equals(b));
    }

    function MapPage() {
        Page.call(this, "page-map");
        this._window_onResizeFunc = null;
        this._map_htmlElement = null;
        this._searchBar_htmlElement = null;
        this._searchBarInput_htmlElement = null;
        this._hideSearchBarFunc = null;
        this._window_prevWidth = 0;
        this._window_prevHeight = 0;
        this._map_isSizeDirty = true;
    }
    MapPage.prototype = Object.create(Page.prototype, {
        _onFirstShow: {
            value: function (paramsPojo) {
                this._window_prevWidth = window.innerWidth;
                this._window_prevHeight = window.innerHeight;
                this._window_onResizeFunc = this._window_onResize.bind(this);
                addEventListener( "resize", this._window_onResizeFunc, false );
                this._map_htmlElement = htmlElem_get("#map-canvas", this.htmlElement);

               
                this._searchBar_htmlElement = htmlElem_get("#search-bar", this.htmlElement);
                this._searchBarInput_htmlElement = htmlElem_get("input", this._searchBar_htmlElement);
                $(".search-bar-toggle-btn", this.htmlElement).click(this._searchBarToggleBtn_onClick.bind(this));
                this._hideSearchBarFunc = this._hideSearchBar.bind(this);

                $("#cannot-find-your-location-btn", this.htmlElement).click(this._cannotFindYourLocationBtn_onClick.bind(this));
                $("#no-data-collection-point-btn", this.htmlElement).click(this._noDataCollectionPointBtn_onClick.bind(this));
                $("#add-location-and-go-to-page-btn", this.htmlElement).click(this._addLocationAndGoToPageBtn_onClick.bind(this))

                this._searchBarInput_htmlElement.addEventListener("keyup", this._searchBarInput_onKeyUp.bind(this), false);

                initialize( this._map_htmlElement );


            }
        },
        _addLocationAndGoToPageBtn_onClick: {
            value: function () {
                var locationName;
                locationName = $( "#name1234", this.htmlElement ).val();
                BusinessLogic.instance.getOrCreateLocationAsync( locationName, function ( location, fCompletedSynchronously, fError ) {
                    PageMgr.instance.setCurrentPage( "page-location", { location: location.name } );
                } );
            }
        },
        _noDataCollectionPointBtn_onClick: {
            value: function () {
                $("#no-data-collection-point-info", this.htmlElement).slideDown();
            }
        },
        _cannotFindYourLocationBtn_onClick: {
            value: function () {
                $("#cannot-find-your-location-info").slideDown();
            }
        },
        _searchBarInput_onKeyUp: {
            value: function () {
                var val;
                var i, len;
                val = this._searchBarInput_htmlElement.value.toUpperCase();
                len = relevantCityViews.length;
                for (i = 0; i < len; ++i) {

                    relevantCityViews[i].hideAlways = relevantCityViews[i].city.name.toUpperCase().indexOf(val) < 0;

                }

            }
        },
        _hideSearchBar: {
            value: function () {
                elem_display(this._searchBar_htmlElement, false);
            }
        },
        _searchBarToggleBtn_onClick: {
            value: function () {
                var $q, q, qHeight, animOptsBase, animOpts;
                var animProp_top_val;
                q = this._searchBar_htmlElement;
                $q = $(q);
                animOptsBase = {
                    duration: 200
                };
                animOpts = setOwnSrcPropertiesOnDst(animOptsBase, {});
                if (q.style.display === "") {
                    qHeight = q.offsetHeight;
                    animProp_top_val = "-=" + qHeight;
                    animOpts.complete = this._hideSearchBarFunc;
                } else {
                    q.style.display = "";
                    qHeight = q.offsetHeight;
                    q.style.top = -qHeight + "px";
                    animProp_top_val = "+=" + qHeight;
                    this._searchBarInput_htmlElement.focus();
                }
                $q.animate({
                    top: animProp_top_val
                }, animOpts);
                $("#other-location").animate({
                    top: animProp_top_val
                }, animOptsBase);
            }
        },
        _onShow: {
            value: function (paramsPojo) {
                document.documentElement.style.overflowY = "hidden";
                var _this = this;
                function t() {
                    
                    var headerHtmlElem;
                    headerHtmlElem = htmlElem_get("*[data-role=header]", _this.htmlElement);
                    if (headerHtmlElem.offsetHeight === 0) {
                        setTimeout(t, 10);
                    } else {
                        _this._map_updateSize();
                    }
                }
                t();

                google.maps.event.addListenerOnce(map, 'idle', function () {
                    map.setCenter({ lat: 42.33037775013451, lng: 14.508781947265579 });
                });
                
            }
        },
        _onHide: {
            value: function () {
                document.documentElement.style.overflowY = "";
            }
        },
        _map_updateSize: {
            value: function () {
                var headerHtmlElem;
                headerHtmlElem = htmlElem_get( "*[data-role=header]", this.htmlElement );
                this._map_htmlElement.style.height = this._window_prevHeight - headerHtmlElem.offsetHeight + "px";
                google.maps.event.trigger( map, "resize" );
                this._map_isSizeDirty = false;
            }
        },
        _window_onResize: {
            value: function () {
                var w, h;
                w = innerWidth;
                h = innerHeight;
                if ( this._window_prevWidth === w && this._window_prevHeight === h ) {
                    return;
                }
                this._window_prevWidth = w;
                this._window_prevHeight = h;
                if ( this._isShown ) {
                    this._map_updateSize();
                } else {
                    this._map_isSizeDirty = true;
                }
            }
        }

    });

    PageMgr.instance.registerPage(new MapPage());



})();