
( function ( undefined ) {

    var hasOwnPropertyFunc = Object.hasOwnProperty;
    function hasOwnP( obj, p ) {
        return hasOwnPropertyFunc.call( obj, p );
    }
    var nextRecId = 1;
    var approvePrefix = "approve-";
    
    function createJQueryMobileCheckBox( name, labelText, isChecked, isMini ) {
        var lbl = document.createElement( "label" );
        var cb = document.createElement( "input" );
        var root;
        var opts;
        cb.name = name;
        cb.type = "checkbox";
        cb.checked = isChecked;
        lbl.appendChild( cb );
        lbl.appendChild( document.createTextNode( labelText ) );
        opts = {};
        if ( isMini ) {
            opts.mini = true;
        }
        root = $( cb ).checkboxradio( opts )[0];
        while ( root.parentNode !== null ) {
            root = root.parentNode;
        }
        return root;
    }

    var approvableFieldNames = {
        "alwaysLivedAtLocation0": 1,
        "yearOfMovingToLocation0": 1,
        "yearOfBirth": 1,
        "translationFile": 1,
        "transcriptionFile": 1,
        "sampleDataFile": 1,
        "otherInformation": 1,
        "name": 1,
        "motherTongues": 1,
        "gender": 1
    };

    function AddOrUpdateSamplePage() {
        Page.call( this, "page-add-or-update-sample" );
        var audRecStartBtn = htmlElem_get( "#start-recording-audio", this.htmlElement );
        var audRecStopBtn = htmlElem_get( "#stop-recording-audio", this.htmlElement );
        htmlElem_getAll( ".audio-recording-supported", this.htmlElement ).forEach( function ( elem ) {
            elem_display( elem, AudioRecorder.isSupported ); 
        } );
        htmlElem_getAll( ".audio-recording-not-supported", this.htmlElement ).forEach( function ( elem ) {
            elem_display( elem, !AudioRecorder.isSupported ); 
        } );
        $( ".play-button" ).click( this.__btnPlay_onClick.bind( this ) );
        $( ".download-translation-button" ).click( this.__btnDownlTrans_onClick.bind( this ) );
        $( ".download-transcription-button" ).click( this.__btnDownlTranscr_onClick.bind( this ) );
        $( ".clear-translation-button" ).click( this.__btnClearTrans_onClick.bind( this ) );
        $( ".clear-transcription-button" ).click( this.__btnClearTranscr_onClick.bind( this ) );
        this.__location = null;
        this.__audRecStartBtn = audRecStartBtn;
        this.__audRecStopBtn = audRecStopBtn;
        this.__audRecStopBtn.disabled = true;
        $( ".delete", this.htmlElement ).click( this.__deleteBtn_onClick.bind( this ) );
        $( ".save", this.htmlElement ).click( this.__saveBtn_onClick.bind( this ) );
        this.__audRec = new AudioRecorder();
        this.__audRec.addListener("tryStartCompleted", this._audRecOnTryStartCompleted, this);
        this.__formElem = htmlElem_get("form", this.htmlElement);
        this.__jqValidator = $(this.__formElem).validate({
            onkeyup: function () {},
            errorPlacement: this.__jqValidator_onPlaceError.bind(this),
            submitHandler: this.__formElem_onSubmit.bind(this)
        } );
        this.__isSubmitting = false;
        this.__sampleMetadataIdToUpdate = null;
        this.__sampleDataTypeEnum = null;
        this.__audRecStartBtn.addEventListener( "click", this.__audRecStartBtn_onClick.bind( this ), false );
        this.__audRecStopBtn.addEventListener( "click", this.__audRecStopBtn_onClick.bind( this ), false );
        this.__audioFile = new FileInput( htmlElem_get( '#sample-data-file', this.htmlElement ), "sampleDataFile" );
        this.__audioFile_externalId = null;
        this.__transcriptionFile = new FileInput( htmlElem_get( "#transcription-file", this.htmlElement ), "transcriptionFile" );      
        this.__transcriptionFile_externalId = null;
        this.__translationFile = new FileInput( htmlElem_get( "#translation-file", this.htmlElement ), "translationFile" );   
        this.__translationFile_externalId = null;
        this.__audioFile.addListener( "propertyChanged", this.__audioFile_onPropertyChanged, this );
        this.__transcriptionFile.addListener( "propertyChanged", this.__transcriptionFile_onPropertyChanged, this );
        this.__translationFile.addListener( "propertyChanged", this.__translationFile_onPropertyChanged, this );
        this.__canApprove = false;
        XElement.getOrCreate( document.body ).addListener( "resize", this.__bodyOnResize, this );
    }
    AddOrUpdateSamplePage.prototype = Object.create( Page.prototype, {

        __btnClearTranscr_onClick: {
            value: function ( event ) {

                this.__transcriptionFile.setNonFile( null, null, null );
                this.__transcriptionFile_externalId = null;
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },
        __btnClearTrans_onClick: {
            value: function ( event ) {
                this.__translationFile.setNonFile( null, null, null );
                this.__translationFile_externalId = null;
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },

        __btnDownlCommon: {
            value: function ( event, fid, fi ) {
                if ( fid !== null ) {
                    saveAs2( fid );
                } else {
                    if ( fi.fileAsArrayBuffer !== null ) {
                        saveAs( new Blob( [fi.fileAsArrayBuffer] ), fi.fileName );
                    }
                }
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },

        __btnDownlTranscr_onClick: {
            value: function ( event ) {
                this.__btnDownlCommon( event, this.__transcriptionFile_externalId, this.__transcriptionFile );
            }
        },

        __btnDownlTrans_onClick: {
            value: function ( event ) {
                this.__btnDownlCommon( event, this.__translationFile_externalId, this.__translationFile );
            }
        },

        __btnPlay_onClick: {
            value: function ( event ) {
                this.__btnDownlCommon( event, this.__audioFile_externalId, this.__audioFile );
            }
        },

        isInUpdateMode: {
            get: function() {
                return this.__sampleMetadataIdToUpdate !== null;
            }                   
        },

        // "video" or "audio"
        sampleTypeDataTypeEnum: {
            get: function () {
                return this.__sampleDataTypeEnum;
            }
        },

        canApprove: {
            get: function () {
                return this.__canApprove;
            },
            set: function ( value ) {
                if ( typeof value !== "boolean" ) {
                    throw Error();
                }
                if ( value === this.__canApprove ) {
                    return;
                }
                this.__canApprove = value;       
                if ( value ) {
                    this.htmlElement.setAttribute( "data-x-can-approve", "true" );
                    this.__approveCheckBoxes_create();
                } else {
                    this.htmlElement.removeAttribute( "data-x-can-approve" );
                    this.__approveCheckBoxes_delete();
                }
            }
        },

        __approveCheckBoxes_set: {
            value: function ( approvedFields ) {
                var i, n;
                var containerElem = htmlElem_get( ".approval-layout-table td:last-child", this.htmlElement );
                var containerElem_childNodes = containerElem.childNodes;

                for ( i = 0, n = containerElem_childNodes.length; i < n; ++i ) {
                    if ( containerElem_childNodes[i].nodeType !== 1 ) {
                        continue;
                    }
                    var checkBox_wrapper = containerElem_childNodes[i];
                    var checkBox = $( "input", checkBox_wrapper )[0];
                    var fieldName = checkBox.name.substring( approvePrefix.length );
                    checkBox.checked = 0 <= approvedFields.indexOf( fieldName );
                    $( checkBox ).checkboxradio( "refresh" );
                }
            }
        },

        __approveCheckBoxes_serialize: {
            value: function ( pojo ) {
                var containerElem = htmlElem_get( ".approval-layout-table td:last-child", this.htmlElement );
                var containerElem_childNodes, i, n;
                var str1;
                var str2;
                containerElem_childNodes = containerElem.childNodes;
                n = containerElem_childNodes.length;
                for ( i = 0; i < n; ++i ) {
                    if ( containerElem_childNodes[i].nodeType !== 1 ) {
                        continue;
                    }
                    var checkBox_wrapper = containerElem_childNodes[i];
                    var checkBox = $( "input", checkBox_wrapper )[0];
                    var fieldName = checkBox.name.substring( approvePrefix.length );
                    if ( 0 <= fieldName.indexOf( "," ) ) {
                        throw Error();
                    }
                    if ( checkBox.checked ) {
                        str1 = str1 === undefined ? fieldName : str1 + "," + fieldName;
                    } else {
                        str2 = str2 === undefined ? fieldName : str2 + "," + fieldName;
                    }
                }
                if ( hasOwnP.call( pojo, "approvedFields" ) ) {
                    throw Error();
                }
                if ( str1 !== undefined ) {
                    pojo.approvedFields = str1;
                }
                if ( hasOwnP.call( pojo, "unapprovedFields" ) ) {
                    throw Error();
                }
                if ( str2 !== undefined ) {
                    pojo.unapprovedFields = str2;
                }
            }
        },

        __approveCheckBoxes_create: {
            value: function () {
                var containerElem = htmlElem_get( ".approval-layout-table td:last-child", this.htmlElement );
                this.__forEachNonApprovalField( function ( fieldName, fieldElem ) {
                    containerElem.appendChild( createJQueryMobileCheckBox( approvePrefix + fieldName, "Approve", false, true ) );
                } );
                this.__approveCheckBoxes_updateLayout();
            }
        },

        __forEachNonApprovalField: {
            value: function ( iteratorFunction ) {
                if ( !( iteratorFunction instanceof Function ) ) {
                    throw Error();
                }
                var fieldElemFromName;
                var fieldNames, i, n;
                var fieldElem;
                fieldElemFromName = formGetFieldElementFromName( htmlElem_get( ".approval-layout-table td:first-child", this.htmlElement ) );
                fieldNames = Object.getOwnPropertyNames( fieldElemFromName );
                for ( i = 0, n = fieldNames.length; i < n; ++i ) {
                    if ( !hasOwnP( approvableFieldNames, fieldNames[i] ) ) {
                        continue;
                    }
                    fieldElem = fieldElemFromName[fieldNames[i]];

                    iteratorFunction( fieldNames[i], fieldElem );
                }
            }
        },

        __bodyOnResize: {
            value: function () {
                this.__approveCheckBoxes_updateLayout();
            }
        },

        __approveCheckBoxes_updateLayout: { 
            value: function () {
                if ( !(this.canApprove && this._isShown) ) {
                    return;
                }
                var containerElem = htmlElem_get( ".approval-layout-table td:last-child", this.htmlElement );
                this.__forEachNonApprovalField( function ( fieldName, fieldElem ) {
                    var elem = fieldElem;
                    while ( elem.parentNode.tagName.toUpperCase() !== "TD" ) {
                        elem = elem.parentNode;
                    }
                    var elem_bbox = elem.getBoundingClientRect();
                    var elem_parent_bbox = elem.parentNode.getBoundingClientRect();
                    var checkBox = htmlElem_get( "input[name=approve-" + fieldName + "]", containerElem );
                    var checkBox_wrapper = checkBox;
                    while ( checkBox_wrapper.parentNode.tagName.toUpperCase() !== "TD" ) {
                        checkBox_wrapper = checkBox_wrapper.parentNode;
                    }
                    setOwnSrcPropertiesOnDst( {
                        position: "absolute",
                        top: ( elem_bbox.top - elem_parent_bbox.top ) + "px",
                        left: "0"
                    }, checkBox_wrapper.style );
                } );

                var checkBox_wrapper = containerElem.firstElementChild;
                setOwnSrcPropertiesOnDst( {
                    top: "",
                    position: "",
                    left: "",
                    marginTop: checkBox_wrapper.style.top
                }, checkBox_wrapper.style );
            }
        },

        __approveCheckBoxes_delete: {
            value: function () {
                var containerElem = htmlElem_get( ".approval-layout-table td:last-child", this.htmlElement );
                containerElem.innerHTML = "";
            }
        },

        __setSampleTypeDataTypeEnum: {
            value: function ( value ) {
                this.__sampleDataTypeEnum = value;
            }
        },

        __formElem_onSubmit: {
            value: function ( form, event ) {
                if ( this.__isSubmitting ) {
                    return;
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                this.__submitAsync();
            }
        },
        _onFirstShow: {
            value: function ( paramsPojo ) {
                BusinessLogic.instance.getAllLocationsAsync( function (locations, fCompletedSynchronously) { } );
            }
        },
        __jqValidator_onPlaceError: {
            value: function (error, element) {
                error.insertAfter(element.parent());
            }
        },
        _onHide: {
            value: function () {
            }
        }, 
        _onShow: {
            value: function ( paramsPojo ) {
                this.__formElem.reset();
                $( "input[name=isAnonymous]", this.htmlElement )[0].checked = true;
                this.__audioFile.setNonFile( null, null, null );
                this.__audioFile_externalId = null;
                this.__transcriptionFile.setNonFile( null, null, null );
                this.__transcriptionFile_externalId = null;
                this.__translationFile.setNonFile( null, null, null );
                this.__translationFile_externalId = null;
                // Reset validation
                this.__jqValidator.resetForm();
                var t1;
                if ( hasOwnP( paramsPojo, "id" ) && /^[\+-]?[0-9]+$/.test( t1 = paramsPojo.id ) && ( t1 = Number( t1 ) ) % 1 === 0 ) {
                    this.__sampleMetadataIdToUpdate = t1;
                    this.canApprove = true;
                } else {
                    this.__sampleMetadataIdToUpdate = null;
                    this.canApprove = false;
                }
                var _this = this;
                Array.prototype.forEach.call( $( ".if-is-in-update-mode", this.htmlElement ), function ( elem ) {
                    elem_display( elem, _this.isInUpdateMode );
                } );
                var titleElem = htmlElem_get( "*[data-role=header] h1", this.htmlElement );
                var title;
                if ( !this.isInUpdateMode ) {

                    if ( hasOwnP( paramsPojo, "type" ) && ( t1 = paramsPojo.type ) === "video" || t1 === "audio" ) {
                        this.__setSampleTypeDataTypeEnum( t1 );
                    } else {
                        this.__setSampleTypeDataTypeEnum( "audio" );
                    }

                    title = "Upload";
                    if ( this.__sampleDataTypeEnum !== null ) {
                        title += " " + this.__sampleDataTypeEnum;
                    }
                    if ( hasOwnP( paramsPojo, "location" ) && typeof ( t3 = paramsPojo.location ) === "string" ) {
                        BusinessLogic.instance.getLocationAsync( t3, function ( location, fCompletedSynchronously, fError ) {
                            _this.__setLocation(location);
                            if ( _this.__location !== null ) {
                                title += " - " + _this.__location.name;
                                if ( !fCompletedSynchronously ) {
                                    titleElem.innerText = title;
                                }
                            }
                        } );
                    }
                } else {
                    this.__setSampleTypeDataTypeEnum( null );
                    title = "Update";
                    if ( this.__sampleDataTypeEnum !== null ) {
                        title += " " + this.__sampleDataTypeEnum;
                    }
                    BusinessLogic.instance.getSampleMetadataAsync( this.__sampleMetadataIdToUpdate, function ( sampleMetadata, fCompletedSynchronously1, fError1 ) {
                        if ( fError1 ) {
                            alertGeneralError();
                            return;
                        }
                        if ( sampleMetadata === null ) {
                            return;
                        }
                        _this.__setFormFromSampleMetadata( sampleMetadata );
                        BusinessLogic.instance.getLocationAsync( sampleMetadata.locationId, function ( location, fCompletedSynchronously2, fError2 ) {
                            _this.__setLocation( location );
                            if ( _this.__location !== null ) {
                                title += " - " + _this.__location.name;
                                if ( !fCompletedSynchronously1 || !fCompletedSynchronously2 ) {
                                    titleElem.innerText = title;
                                }
                            }
                        } );
                    } );
                    BusinessLogic.instance.getAllLocationsAsync( function ( locations, fCompletedSynchronously, fError ) {
                        if ( fError || locations === null ) {
                            alertGeneralError();
                            return;
                        }
                        _this.__setLocationSelect( locations );
                    } );
                }
                titleElem.innerText = title;
            }
        },
        __setLocation: {
            value: function ( location ) {
                this.__location = location;
                var select = $( "#location-select", this.htmlElement )[0];
                if ( select.getAttributeNode("data-x-is-initialized") === null ) {
                    return;
                }
                this.__setLocationSelectSelectedIndex();
            }
        },
        __setLocationSelectSelectedIndex: {
            value: function () {
                if ( this.__location === null ) {
                    alertGeneralError();
                    window.location.reload();
                    return;
                }

                var select = $( "#location-select", this.htmlElement )[0];
                formSetFieldValue( select, this.__location.id + "", true );


            }
        },
        __setLocationSelect: {
            value: function ( locations ) {
                var i, n = locations.length;
                var select = $( "#location-select", this.htmlElement )[0];
                for ( i = 0; i < n; ++i ) {
                    var opt = document.createElement( "option" );
                    opt.value = locations[i].id;
                    opt.appendChild( document.createTextNode( locations[i].name ) );
                    select.appendChild( opt );
                }
                select.setAttribute( "data-x-is-initialized", "true" );
                if ( this.__location !== null ) {
                    this.__setLocationSelectSelectedIndex();
                }
            }
        },

        __setFormFromSampleMetadata: {
            value: function ( sampleMetadata ) {
                
                var _this = this;
                var fid = sampleMetadata.sampleDataFileId;
                var i = 0;
                var fErrorFlags = 0;
                var iMax = 1;
                if ( sampleMetadata.translationFileId !== null ) {
                    ++iMax;
                }
                if ( sampleMetadata.transcriptionFileId !== null ) {
                    ++iMax;
                }
                ++iMax;
                function iInc() {
                    if ( ++i !== iMax ) {
                        return;
                    }

                    // All fields that need to be retrieved async are set.
                    // For each bit set in fErrorFlags, an error occured while initializing a field.
                    if ( fErrorFlags !== 0 ) {
                        alertGeneralError();
                    }
                }
                BusinessLogic.instance.getFileMetadataAsync( fid, function ( fmd, fCompletedSynchronously, fError ) {
                    if ( fError ) {
                        fErrorFlags |= 1;
                    }
                    iInc();
                    if ( fError || fmd === null ) {
                        _this.__setSampleTypeDataTypeEnum( "audio" );
                        return;
                    }
                    _this.__audioFile.setNonFile( fmd.name, fmd.mimeType, null );
                    _this.__audioFile_externalId = fmd.id;
                    _this.__setSampleTypeDataTypeEnum( MimeType_isAudio( fmd.mimeType ) ? "audio" : "video" );
                } );

                if ( ( fid = sampleMetadata.translationFileId ) !== null ) {
                    BusinessLogic.instance.getFileMetadataAsync( fid, function ( fmd, fCompletedSynchronously, fError ) {
                        if ( fError ) {
                            fErrorFlags |= 2;
                        }
                        iInc();
                        if ( fError || fmd === null ) {
                            return;
                        }
                        _this.__translationFile.setNonFile( fmd.name, fmd.mimeType, null );
                        _this.__translationFile_externalId = fmd.id;
                    } );
                }

                if ( ( fid = sampleMetadata.transcriptionFileId ) !== null ) {
                    BusinessLogic.instance.getFileMetadataAsync( fid, function ( fmd, fCompletedSynchronously, fError ) {
                        if ( fError ) {
                            fErrorFlags |= 4;
                        }
                        iInc();
                        if ( fError || fmd === null ) {
                            return;
                        }
                        _this.__transcriptionFile.setNonFile( fmd.name, fmd.mimeType, null );
                        _this.__transcriptionFile_externalId = fmd.id;
                    } );
                }

                formSetFieldValue( $( "*[name='name']", this.htmlElement )[0], sampleMetadata.name );
                formSetFieldValue( $( "*[name='isAnonymous']", this.htmlElement )[0], sampleMetadata.isAnonymous );
                formSetFieldValue( $( "*[name='gender']", this.htmlElement )[0], sampleMetadata.gender );
                formSetFieldValue( $( "*[name='yearOfBirth']", this.htmlElement )[0], sampleMetadata.yearOfBirth );
                formSetFieldValue( $( "*[name='motherTongues']", this.htmlElement )[0], sampleMetadata.motherTongues );
                formSetFieldValue( $( "*[name='alwaysLivedAtLocation0']", this.htmlElement )[0], sampleMetadata.alwaysLivedAtLocation0 === null ? "" : sampleMetadata.alwaysLivedAtLocation0 + "" );
                formSetFieldValue( $( "*[name='yearOfMovingToLocation0']", this.htmlElement )[0], sampleMetadata.yearOfMovingToLocation0 );
                formSetFieldValue( $( "*[name='otherInformation']", this.htmlElement )[0], sampleMetadata.otherInformation );

                BusinessLogic.instance.getApprovedSampleFieldsAsync( sampleMetadata.id, function ( approvedFields, fCompletedSynchronously, fError ) {
                    if ( fError ) {
                        fErrorFlags |= 8;
                    }
                    iInc();
                    if ( fError ) {
                        return;
                    }
                    if ( _this.canApprove ) {
                        _this.__approveCheckBoxes_set( approvedFields );
                    }
                } );

            }
        },

        __stopAudioRec: {
            value: function () {
                if ( this.__audRec.isStarted || this.__audRec.isStarting ) {
                    this.__audRec.stop();
                    this.__audRecStopBtn.disabled = true;
                    this.__audRecStartBtn.disabled = false;
                    $( ".record-icon", this.__audRecStartBtn )[0].style.backgroundColor = "black";
                }
            }
        },
        _audRecOnTryStartCompleted: {
            value: function ( audRec, statusCode ) {
                console.log( "AddFilePage._audRecOnTryStartCompleted: ", audRec, statusCode );
                switch ( statusCode ) {
                    case "success":
                        this.__audRecStopBtn.disabled = false;
                        break;
                    case "failed":
                        this.__audRecStopBtn.disabled = true;
                        this.__audRecStartBtn.disabled = false;
                        alert( "Audio recording is not allowed. Please enable it and try again." );
                        break;
                    case "abort":
                        break;
                }
            }
        },
        __audRecStartBtn_onClick: {
            value: function () {
                if ( !AudioRecorder.isSupported ) {
                    return;
                }
                this.__audRecStartBtn.disabled = true;
                $( ".record-icon", this.__audRecStartBtn )[0].style.backgroundColor = "red";
                this.__audRec.tryStartAsync();
            }
        },
        __audRecStopBtn_onClick: {
            value: function () {
                var wavFileAsArrayBuffer;
                if ( !this.__audRec.isStarted ) {
                    throw Error();
                }
                this.__stopAudioRec();
                wavFileAsArrayBuffer = this.__audRec.recording.toWav();
                this.__audRec.clearRecording();
                this.__audioFile.setNonFile( "Recording" + nextRecId++ + ".wav", "audio/wav", wavFileAsArrayBuffer );
                if ( wavFileAsArrayBuffer === null ) {
                    throw Error();
                }
            }
        },
        __translationFile_onPropertyChanged: {
            value: function ( propName, oldValue, newValue ) {
                if ( propName === "fileAsArrayBuffer" ) {
                    this.__translationFile_externalId = null;
                }
            }
        },
        __transcriptionFile_onPropertyChanged: {
            value: function ( propName, oldValue, newValue ) {
                if ( propName === "fileAsArrayBuffer" ) {
                    this.__transcriptionFile_externalId = null;
                }
            }
        },
        __audioFile_onPropertyChanged: {
            value: function ( propName, oldValue, newValue ) {
                if ( propName === "fileAsArrayBuffer" ) {
                    this.__audioFile_externalId = null;
                    this.__audioFile_updateErrorMessage( true );
                }
            }
        },
        __audioFile_updateErrorMessage: {
            value: function ( fUpdateLayout ) {
                var flag = this.__audioFile.fileAsArrayBuffer === null && this.__audioFile_externalId === null;
                var elem, elem2;
                var fileElemId = "sample-data-file";
                var errorMsgElemId = fileElemId + "-error";
                elem = htmlElem_getAll( "#" + errorMsgElemId, this.htmlElement );
                assert(elem.length <= 1);
                elem = elem.length === 1 ? elem[0] : null;
                if (elem === null) {
                    if (!flag) {
                        return true;
                    }
                    elem = document.createElement("label");
                    setOwnSrcPropertiesOnDst({
                        id: "#" + errorMsgElemId,
                        "for": "file",
                        className: "error"
                    }, elem);
                    elem.appendChild(document.createTextNode($.validator.messages.requiredAudioFile));

                    elem2 = htmlElem_get( "#" + fileElemId, this.htmlElement );
                    elem2.parentNode.insertBefore( elem, elem2.nextSibling );
                    this.__approveCheckBoxes_updateLayout();
                    return false;
                }
                if ( elem_display( elem, flag ) && fUpdateLayout ) {
                    this.__approveCheckBoxes_updateLayout();
                }
                return flag;
            }
        },
        __submitAsync: {
            value: function () {
                var t1, t2;
                if ( this.__isSubmitting ) {
                    return;
                }
                var _this = this;
                if ( this.__location === null ) {

                    if ( this.isInUpdateMode ) {
                        throw Error();
                    }
                    t1 = window.location.hash;
                    t2 = t1.indexOf( "?" );
                    if ( t2 < 0 ) {
                        throw Error();
                    }
                    t1 = pojoFromUrlQueryString( t1, t2 + 1 );
                    if ( !hasOwnP( t1, "location" ) ) {
                        throw Error();
                    }
                    BusinessLogic.instance.getOrCreateLocationAsync( t1.location, function ( location, fCompletedSynchronously, fError ) {
                        if ( fCompletedSynchronously && location !== null ) {
                            _this.__location = location;
                        }
                    } );
                    if ( _this.__location === null ) {
                        throw Error();
                    }
                }

                t1 = $( this.__formElem ).valid();
                t1 = t1 && this.__audioFile_updateErrorMessage( false );
                this.__approveCheckBoxes_updateLayout();
                if ( !t1 ) {
                    return;
                }

                t1 = formToPojo( htmlElem_get( ".approval-layout-table td:first-child", this.htmlElement ) );
                if ( hasOwnP( t1, "locationId" ) ) {
                    // conflicting entries
                    throw Error();
                }
                if ( this.isInUpdateMode ) {
                    t1.locationId = Number( $( "#location-select" )[0].value );
                } else {
                    t1.locationId = this.__location.id;
                }
                if ( this.canApprove ) {
                    this.__approveCheckBoxes_serialize( t1 );
                }
                if ( this.isInUpdateMode ) {
                    if ( hasOwnP( t1, "id" ) ) {
                        // conflicting entries
                        throw Error();
                    }
                    t1.id = this.__sampleMetadataIdToUpdate;
                    if ( this.__audioFile.fileAsArrayBuffer === null ) {
                        t1.sampleDataFileId = this.__audioFile_externalId;
                    }
                    if ( this.__transcriptionFile.fileAsArrayBuffer === null && this.__transcriptionFile_externalId !== null ) {
                        t1.transcriptionFileId = this.__transcriptionFile_externalId;
                    }
                    if ( this.__translationFile.fileAsArrayBuffer === null && this.__translationFile_externalId !== null ) {
                        t1.translationFileId = this.__translationFile_externalId;
                    }
                }
                this.__isSubmitting = true;
                var approvedFields = {},
                    saveBtnText = $('.save:eq(0) .text').text();
                $('.save .progress').text('')
                $('.save').addClass('busy').find('.text').text('Salvataggio in corso...');
                if ( this.isInUpdateMode ) {
                    BusinessLogic.instance.updateSampleAsync( t1, function ( smd, fCompletedSynchronously, fError ) {
                        $('.save').text(saveBtnText);
                        _this.__onSubmitAsync_onCompleted( true, fError );
                    } );
                } else {
                    if ( this.canApprove ) {
                        throw Error();
                    }
                    BusinessLogic.instance.createSampleAsync( t1, function ( fError ) {
                        $('.save').removeClass('busy').find('.text').text(saveBtnText);
                        _this.__onSubmitAsync_onCompleted( false, fError );
                    } );
                } 
            }
        },
        __onSubmitAsync_onCompleted: {
            value: function ( isUpdate, fError ) {
                this.__isSubmitting = false;
                if ( !fError ) {
                    if ( !isUpdate ) {
                        alert( "Grazie. Il file è stato salvato. Potrebbero passare alcuni giorni prima che sia visibile sulla mappa." );
                        PageMgr.instance.setCurrentPage( "page-location", {
                            location: this.__location.name
                        } );
                    } else {
                        alert( "Changes saved successfully" );
                    }
                } else {
                    alertGeneralError();
                }
            }
        },
        __saveBtn_onClick: {
            value: function () {
                if ( this.__isSubmitting ) {
                    return;
                }
                this.__submitAsync();
            }
        },
        __deleteBtn_onClick: {
            value: function ( event ) {
                if ( this.__sampleMetadataIdToUpdate === null ) {
                    throw Error();
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                if ( !confirm( "Are you sure you want to delete this sample?" ) ) {
                    return false;
                }
                BusinessLogic.instance.deleteSampleAsync( this.__sampleMetadataIdToUpdate, function ( fCompletedSynchronously, fError ) {
                    if ( fError ) {
                        alertGeneralError();
                        return;
                    }
                    history.back();
                } );
                return false;
            }
        }
    } );

    PageMgr.instance.registerPage( new AddOrUpdateSamplePage() );
} )();
