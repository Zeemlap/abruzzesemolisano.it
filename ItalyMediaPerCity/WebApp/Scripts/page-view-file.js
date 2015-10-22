
(function () {

    var nextRecId = 1;
    var nextUnnamedFileId = 1;

    function ViewFilePage() {
        Page.call(this, "page-view-file");
        this.__sampleMetadata = null;
    }
    ViewFilePage.prototype = Object.create(Page.prototype, {

        _onFirstShow: {
            value: function ( paramsPojo ) {

                $( ".play-button", this.htmlElement ).click( this.__playButton_onClick.bind(this) );

                $( $( ".btn-transcr", this.htmlElement )[0] ).click( this.__transcBtn_onClick.bind( this ) );
                $( $( ".btn-trans", this.htmlElement )[0] ).click( this.__transBtn_onClick.bind( this ) );

            }
        },


        __transcBtn_onClick: {
            value: function () {
                var id = this.__sampleMetadata !== null ? this.__sampleMetadata.transcriptionFileId : null;
                if ( id === null ) {
                    return;
                }
                saveAs2( id );
            }
        },

        __transBtn_onClick: {
            value: function () {
                var id = this.__sampleMetadata !== null ? this.__sampleMetadata.translationFileId : null;
                if ( id === null ) {
                    return;
                }
                saveAs2( id );
            }
        },

        __playButton_onClick: {
            value: function () {
                if ( this.__sampleMetadata !== null ) {
                    this.__sampleMetadata.play();
                }
            }
        },

        _onShow: {
            value: function ( paramsPojo ) {

                var flag1;
                var _this;
                _this = this;
                flag1 = false;
                elem_display( htmlElem_get( ".ui-content-inner", this.htmlElement ), false );
                BusinessLogic.instance.getSampleMetadataAsync( Number(paramsPojo.id), function ( sampleMetadata, fCompletedSynchronously, fError ) {
                    flag1 = fCompletedSynchronously && sampleMetadata !== null;
                    _this.__setSampleMetadata( sampleMetadata );
                    BusinessLogic.instance.getApprovedSampleFieldsAsync( sampleMetadata.id, function ( approvedFields, fCompletedSynchronously, fError ) {
                        if ( fError ) {
                            alertGeneralError();
                            window.location.reload();
                            return;
                        }
                        _this.__processApprovedFields( approvedFields );
                    } );
                } );
                if ( !flag1 ) {
                    this.__setSampleMetadata( null );
                }
            }
        },
        __processApprovedFields: {
            value: function ( af ) {

                var _this = this;
                ["gender", "yearOfBirth", "motherTongues", "alwaysLivedAtLocation0", "yearOfMovingToLocation0"/*, "otherInformation"*/].forEach( function ( fn ) {

                    var obj = $( ".field-" + fn, _this.htmlElement )[0].parentNode;
                    elem_display( obj, 0 <= af.indexOf( fn ) );
                } );

                var flag1 = this.__sampleMetadata !== null && !this.__sampleMetadata.isAnonymous  && 0 <= af.indexOf( "name" );
                var fn = $( ".field-name", this.htmlElement )[0].parentNode;
                elem_display( fn, flag1 );
                elem_display( fn.nextElementSibling, flag1 );

                elem_display( $( ".btn-transcr", this.htmlElement )[0].parentNode, this.__sampleMetadata !== null && this.__sampleMetadata.transcriptionFileId !== null && 0 <= af.indexOf( "transcriptionFile" ) );
                elem_display( $( ".btn-trans", this.htmlElement )[0].parentNode, this.__sampleMetadata !== null && this.__sampleMetadata.translationFileId !== null && 0 <= af.indexOf( "translationFile" ) );


                elem_display( htmlElem_get( ".ui-content-inner", this.htmlElement ), true );
            }
        },
        __setSampleMetadata: {
            value: function ( sampleMetadata ) {
                var t1, t2;
                this.__sampleMetadata = sampleMetadata;

                t1 = $( ".play-button", this.htmlElement );
                for (t2 = t1.length; --t2 >= 0;) {
                    elem_display( t1[t2], sampleMetadata !== null );
                }

                elem_display( $( ".btn-transcr", this.htmlElement )[0], this.__sampleMetadata !== null && this.__sampleMetadata.transcriptionFileId !== null );
                elem_display( $( ".btn-trans", this.htmlElement )[0], this.__sampleMetadata !== null && this.__sampleMetadata.translationFileId !== null );
                

                var t1 = $( ".field-name", this.htmlElement )[0];
                t2 = sampleMetadata === null || !sampleMetadata.isAnonymous;
                if ( t2 ) {
                    t1.innerText = sampleMetadata === null ? "-" : sampleMetadata.name;
                }
                elem_display( t1.parentNode, !t2 );

                $( ".field-gender", this.htmlElement )[0].innerText = sampleMetadata === null ? "-" : ( sampleMetadata.gender === "male" ? "Maschio" : "Femmina" );
                $( ".field-yearOfBirth", this.htmlElement )[0].innerText = sampleMetadata === null ? "-" : sampleMetadata.yearOfBirth;
                $( ".field-motherTongues", this.htmlElement )[0].innerText = sampleMetadata === null ? "-" : sampleMetadata.motherTongues;
                $( ".field-alwaysLivedAtLocation0", this.htmlElement )[0].innerText = sampleMetadata === null || sampleMetadata.alwaysLivedAtLocation0 === null ? "-" : ( sampleMetadata.alwaysLivedAtLocation0 ? "Si" : "No" );
                $( ".field-yearOfMovingToLocation0", this.htmlElement )[0].innerText = sampleMetadata === null || sampleMetadata.yearOfMovingToLocation0 === null ? "-" : sampleMetadata.yearOfMovingToLocation0;
                //$( ".field-otherInformation", this.htmlElement )[0].value = sampleMetadata === null || sampleMetadata.otherInformation === null ? "-" : sampleMetadata.otherInformation;
                
            }
        }

    });

    PageMgr.instance.registerPage(new ViewFilePage());
})();