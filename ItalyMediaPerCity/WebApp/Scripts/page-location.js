(function() {

    function RelevantCityPage() {
        Page.call( this, "page-location")
        this.__city = null;
        this.__city_sampleUploaders_listChangedListener = null;
        this.__city_sampleMetadatas_listChangedListener = null;
        this.__btnAddAudio = null;
        this.__btnAddAudio_onClickFunc = null;
        this.__btnAddVideo = null;
        this.__btnAddVideo_onClickFunc = null;
        this.__sampleUploaders = null;
        this.__sampleUploaders_listView = null;
        this.__sampleMetadatas = null;
        this.__sampleMetadatas_listView = null;
        // this.__tmpBtn = null;
    }
    RelevantCityPage.prototype = Object.create( Page.prototype, {

        _city: {
            get: function() {
                return this.__city;
            },
            set: function(value) {
                if (value !== null && !(value instanceof Location)) {
                    throw Error();
                }
                if ( this.__city_sampleUploaders_listChangedListener !== null ) {
                    this.__city_sampleUploaders_listChangedListener.remove();
                    this.__city_sampleMetadatas_listChangedListener.remove();
                    this.__city_sampleUploaders_listChangedListener = null;
                    this.__city_sampleMetadatas_listChangedListener = null;
                }
                this.__city = value;
                if ( this.__city !== null ) {
                    this.__city_sampleUploaders_listChangedListener =
                        this.__city.sampleUploaders.addListener("listChanged", this.__city_sampleUploaders_listChanged, this);
                    this.__city_sampleMetadatas_listChangedListener =
                        this.__city.sampleMetadatas.addListener( "listChanged", this.__city__sampleMetadatas_listChanged, this );
                    this.__sampleUploaders_listView.items = this.__city.sampleUploaders;
                    this.__sampleMetadatas_listView.items = this.__city.sampleMetadatas;
                }
                this.__update();

            }
        },

        __city_sampleUploaders_listChanged: {
            value: function (lcea) {
                this.__update();
            }
        },
        __city__sampleMetadatas_listChanged: {
            value: function (lcea) {
                for (var i = 0; i < lcea._newItems.length; i++) {
                    lcea._newItems[i].__title = this.__city.__name + ' ' + (i + 1);
                }
                this.__update();
            }
        },

        _onShow: {
            value: function ( paramsPojo ) {
                var _this = this;
                BusinessLogic.instance.getLocationAsync( paramsPojo.location, function ( location, fCompletedSynchronously, fError ) {
                    _this._city = location;
                    if ( _this.__city !== null ) {
                        _this.__sampleUploaders_listView.items = _this.__city.sampleUploaders;
                        _this.__sampleMetadatas_listView.items = _this.__city.sampleMetadatas;

                        BusinessLogic.instance.getAllSampleMetadataAsync( location.id, function ( sampleMetadatas, fCompletedSynchronously ) {

                            var q = 0;

                        } );


                    }
                    _this.__updateTitle();
                } );
            }
        },

        __updateTitle: {
            value: function () {


                var titleElem;
                titleElem = htmlElem_get( "*[data-role=header] > h1", this.htmlElement );
                titleElem.innerHTML = ( this.__city === null ? "Unknown city" : this.__city.name );
            }
        },

        __update: {
            value: function () {
                this.__updateTitle();
                var noFilesElem = htmlElem_get("#no-files", this.htmlElement);
                var sampleUploadersElem = htmlElem_get("#sampleUploaders", this.htmlElement);
                var sampleMetadatasElem = htmlElem_get("#samplesMetadata", this.htmlElement);
                var flag = this.__city === null || (this.__city.sampleUploaders.count === 0 && (this.__city.sampleMetadatas === null || this.__city.sampleMetadatas.count === 0));
                elem_display(noFilesElem, flag);
                elem_display(sampleUploadersElem, !flag);
                elem_display(sampleMetadatasElem, !flag);
            }
        },

        _onFirstShow: {
            value: function (paramsPojo) {
                this.__btnAddAudio = htmlElem_get(".add-audio", this.htmlElement);
                this.__btnAddAudio_onClickFunc = this.__btnAddAudio_onClick.bind(this);
                this.__btnAddAudio.addEventListener("click", this.__btnAddAudio_onClickFunc, false);

                this.__btnAddVideo = htmlElem_get(".add-video", this.htmlElement);
                this.__btnAddVideo_onClickFunc = this.__btnAddVideo_onClick.bind(this);
                this.__btnAddVideo.addEventListener("click", this.__btnAddVideo_onClickFunc, false);

                //this.__tmpBtn = htmlElem_get( "#samples-metadata button", this.htmlElement );
                //this.__tmpBtn_onClickFunc = this.__tmpBtn_onClick.bind( this );
                //this.__tmpBtn.addEventListener( "click", this.__tmpBtn_onClickFunc, false );
                


                this.__sampleUploaders = htmlElem_get("#sampleUploaders", this.htmlElement);
                this.__sampleUploaders_listView = ListView.fromJQueryMobileListView( this.__sampleUploaders );


                this.__sampleMetadatas = htmlElem_get( "#samplesMetadata", this.htmlElement );
                this.__sampleMetadatas_listView = ListView.fromJQueryMobileListView( this.__sampleMetadatas );

            }
        },
        /*
        __tmpBtn_onClick: {
            value: function () {
                var r;
                if ( this.__city === null ) {
                    return;
                }
                r = new XMLHttpRequest();
                r.open( "GET", "DefaultHandler.ashx?action=downloadMediaObjectAsFile&cityName=" + encodeURIComponent( this.__city.name ) );
                r.responseType = "arraybuffer";
                r.onreadystatechange = function () {
                    if ( r.readyState !== 4 ) {
                        return;
                    }
                    saveAs( new Blob( [r.response] ), "temp.wav" );
                };
                r.send();
            }
        }
        */
        __btnAddVideo_onClick: {
            value: function (event) {
                PageMgr.instance.setCurrentPage( "page-add-or-update-sample", {
                    location: this.__city.name,
                    type: "video"
                });
            }
        },
        __btnAddAudio_onClick: {
            value: function (event) {

                PageMgr.instance.setCurrentPage("page-add-or-update-sample", {
                    location: this.__city.name,
                    type: "audio"
                });
            }
        }
    } );

    PageMgr.instance.registerPage( new RelevantCityPage() );

})();
