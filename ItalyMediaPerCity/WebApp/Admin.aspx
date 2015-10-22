<!DOCTYPE html>
<html>
<head>
    <title>Admin</title>   
    <link rel="stylesheet" href="Content/jquery.mobile-1.4.5.min.css">
    
    <script src="Scripts/jquery-1.9.1.min.js"></script>
    <script src="Scripts/jquery.validate.js"></script>
    <script type="text/javascript" src="Scripts/events.js"></script>  
    <script type="text/javascript" src="Scripts/core.js"></script>
    <script type="text/javascript" src="Scripts/composite-formatting.js"></script> 
    <script type="text/javascript" src="Scripts/data-binding.js"></script>
    <script type="text/javascript" src="Scripts/observable-list.js"></script>
    <style>
        #updateLoc label, #signIn label {
            display: inline-block;
            width: 200px;
        }
        input[type=checkbox] {
            width: 2em;
            height: 2em;
        }
        #recentSamplesTable table {
            border-collapse: collapse;
            border-spacing: 0;
        }
        #recentSamplesTable td {
            padding: 0.5em;
        }
        #recentSamplesTable tbody tr:nth-child(2n+1) {
            background-color: #bbb;
        }
        #recentSamplesTable tbody tr:nth-child(2n) {
            
            background-color: #eee;
        }
    </style>
</head>
<body>
    <div class="if-not-signed-in">
        <h1>Sign in</h1>
        <form id="signIn">
            <label for="username">Username:</label><input type="text" name="username" id="username" value="" required="required" /><br />
            <label for="password">Password:</label><input type="password" name="password" id="password" value="" required="required" /><br />
            <label for="rememberMe">Remember me:</label><input type="checkbox" name="rememberMe" id="rememberMe" /><br />
            <input type="submit" value="Sign In" /><br />
        </form>
    </div>
    <div class="if-signed-in">
        <h1>Sign in</h1>
        <div>
            Welcome admin. Click <a href="javascript:;" class="sign-out-button">here</a> to sign out. 
            <button class="sign-out-button">Sign out</button>
        </div>
        <h1>Set latitude and longitude</h1>
        <form id="updateLoc">
            <label for="location">Location:</label><select id="location" name="location" class="location-select"></select><br />
            <label for="locationName">Name:</label><input id="locationName" name="locationName" type="text"/><br />
            <label for="latitude">Latitude:</label><input id="latitude" step="0.000000000000000001" name="latitude" type="number"/><br />
            <label for="longitude">Longitude:</label><input id="longitude" step="0.000000000000000001" name="longitude" type="number"/><br />
            <label for="importanceCategory">Show as big dot:</label><input id="importanceCategory" name="importanceCategory" type="checkbox"/><br />
            <input type="submit" value="Update"/><input type="button" class="delete-button" value="Delete"/><br />
        </form>
        <hr />
        <h1>Recent samples</h1>
        <div id="recentSamplesTable">
            <button class="refresh">Refresh</button>
            <table>
                <thead>
                    <tr><td>Location</td><td>Created at</td><td>Name</td><td>Link</td></tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    </div>
    <script type="text/javascript">

        var locNameFromId = {};
        var locNameFromId_isInitialized = false;
        var recentSamplesTable_refresh;

        ( function ( undefined ) {

            var samplesView = $( "#recentSamplesTable" )[0];


            $( "button.refresh", samplesView ).on( "click", refresh );
            var refreshReq;

            function refresh() {
                if ( !locNameFromId_isInitialized ) {
                    return;
                }
                if ( refreshReq !== undefined ) {
                    refreshReq.abort();
                }
                refreshReq = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetSampleMetadatas&isIsApprovedSet=false&orderByCreatedAtDescending=true",
                    method: "GET"
                } );

                refreshReq.addListener( "completed", function ( result, statusCode ) {
                    refreshReq = undefined;
                    if ( statusCode === -1 ) {
                        return;
                    }
                    fillTable( result );
                } );
                refreshReq.send();

            }

            function fillTable( result ) {

                var tbody = $( "table", samplesView )[0].tBodies[0];
                var t1, t2, t3;
                var i, n;
                while ( ( t1 = tbody.firstChild ) !== null ) tbody.removeChild( t1 );
                n = result.length;
                for ( i = 0; i < n; ++i ) {
                    t1 = document.createElement( "tr" );
                    t2 = document.createElement( "td" );
                    t2.appendChild( document.createTextNode( locNameFromId[result[i].LocationId] ) );
                    t1.appendChild( t2 );
                    t2 = document.createElement( "td" );
                    t2.appendChild( document.createTextNode( result[i].CreatedAt ) );
                    t1.appendChild( t2 );
                    t2 = document.createElement( "td" );
                    t2.appendChild( document.createTextNode( result[i].Name ) );
                    t1.appendChild( t2 );

                    t2 = document.createElement( "td" );
                    t3 = document.createElement( "a" );
                    t3.href = "/#page-add-or-update-sample?id=" + encodeURIComponent( result[i].Id );
                    t3.appendChild( document.createTextNode( "View/Edit" ) );
                    t2.appendChild( t3 );
                    t1.appendChild( t2 );

                    tbody.appendChild( t1 );
                }


            }

            recentSamplesTable_refresh = refresh;
        } )();
        ( function ( undefined ) {
            var signInForm;
            var __isSignedIn;
            __isSignedIn_setCore( false );
            function isSignedIn_get() {
                return __isSignedIn;
            }
            function __isSignedIn_setCore( value ) {

                __isSignedIn = value;
                if ( value ) {
                    $( ".if-not-signed-in" ).hide();
                    $( ".if-signed-in" ).show();
                } else {
                    $( ".if-not-signed-in" ).show();
                    $( ".if-signed-in" ).hide();
                }
                recentSamplesTable_refresh();
            }
            function isSignedIn_set( value ) {
                if ( typeof value !== "boolean" ) {
                    throw Error();
                }
                if ( value !== isSignedIn_get() ) {
                    __isSignedIn_setCore( value );
                }
            }
            signInForm = jQuery( "form#signIn" )[0];
            $( signInForm ).on( "submit", function ( event ) {
                var signInReq;

                var pojo = formToPojo( signInForm );

                signInReq = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=SignIn",
                    method: "POST",
                    body: new HttpRequestFormData( pojo )
                } );
                signInReq.addListener( "completed", function ( result, statusCode ) {
                    if ( statusCode !== 200 ) {
                        alertGeneralError();
                        return;
                    }
                    if ( result ) {
                        isSignedIn_set( true );
                        signInForm.reset();
                    } else {
                        alert( "That username/password combination is not known." );
                    }
                } );
                signInReq.send();
                event.preventDefault();
                return false;
            } );


            $( ".sign-out-button" ).click( function () {
                var r = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=SignOut",
                    method: "POST"
                } );
                r.addListener( "completed", function ( result, statusCode ) {
                    if ( statusCode !== 200 ) {
                        alertGeneralError();
                        return;
                    }
                    isSignedIn_set( false );
                } );
                r.send();
            } );

            ( function () {
                var r = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetIsAuthenticated",
                    method: "POST"
                } );
                r.addListener( "completed", function ( result, statusCode ) {
                    if ( statusCode !== 200 ) {
                        alertGeneralError();
                        return;
                    }
                    isSignedIn_set( result );
                } );
                r.send();
            } )();
        } )();

        ( function ( undefined ) {

            var getLocReq;
            var updateLocForm;
            updateLocForm = jQuery( "form#updateLoc" )[0];

            jQuery( function () {

                var locsReq = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetLocations&sortNullLatLngFirst=true",
                    method: "GET"
                } );
                locsReq.addListener( "completed", function ( result, statusCode ) {
                    if ( statusCode !== 200 ) {
                        throw Error();
                    }
                    var i, n;
                    n = result.length;
                    for ( i = 0; i < n; ++i ) {
                        locNameFromId[result[i].Id] = result[i].Name;
                    }
                    locNameFromId_isInitialized = true;
                    var selectElem = jQuery( ".location-select" )[0];
                    var opt;
                    for ( i = 0; i < n; ++i ) {
                        opt = document.createElement( "option" );
                        opt.value = result[i].Id;
                        opt.appendChild( document.createTextNode( result[i].Name ) );
                        selectElem.appendChild( opt );
                    }
                    updateLocForm_fill( selectElem.value );

                    recentSamplesTable_refresh();
                } );
                locsReq.send();

            } );

            jQuery( "select[name='location']", updateLocForm ).on( "change", function ( event ) {
                var selectElem;
                var getLocReq;
                selectElem = this;
                assert( selectElem.tagName.toUpperCase() === "SELECT" );
                updateLocForm_fill( selectElem.value );
            } );

            jQuery( ".delete-button", updateLocForm ).on( "click", function ( event ) {

                if ( !confirm( "Are you sure you want to delete this location? It may have associated samples." ) ) {
                    return;
                }
                var locsReq = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=DeleteLocation&id=" + Number($(".location-select", updateLocForm)[0].value),
                    method: "GET"
                } );
                locsReq.addListener( "completed", function ( result, statusCode ) {
                    if ( statusCode !== 200 ) {
                        alertGeneralError();
                        return;
                    }
                    alert( "Deleted successfully" );
                    window.location.reload();
                } );
                locsReq.send();
            } );

            jQuery( updateLocForm ).on( "submit", function ( event ) {

                var selectElem;
                var updateReq;
                selectElem = jQuery( "select[name='location']", updateLocForm )[0];
                updateReq = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=UpdateLocation&id=" + encodeURIComponent( selectElem.value ) +
                        "&latitude=" + encodeURIComponent( jQuery( "[name='latitude']", updateLocForm ).val() ) +
                        "&longitude=" + encodeURIComponent( jQuery( "[name='longitude']", updateLocForm ).val() ) +
                        "&name=" + encodeURIComponent( jQuery( "[name='locationName']", updateLocForm ).val() ) +
                        "&importanceCategory=" + (jQuery( "[name='importanceCategory']", updateLocForm )[0].checked ? 1 : 0) + "",
                    method: "GET"
                } );
                updateReq.addListener( "completed", function (result, statusCode) {
                    alert( statusCode === 200 ? "Updated successfully!" : "An error occured, please try again." );
                } );
                updateReq.send();

                event.preventDefault();
                return false;
            } );

            function updateLocForm_fill(id) {
                if ( getLocReq !== undefined ) {
                    getLocReq.abort();
                }
                getLocReq = new HttpRequest( {
                    url: "DefaultHandler.ashx?action=GetLocations&id=" + encodeURIComponent( id ),
                    method: "GET",
                } );
                getLocReq.addListener( "completed", function ( result, statusCode ) {
                    getLocReq = undefined;
                    if ( statusCode === -1 ) {
                        return;
                    }
                    if ( statusCode !== 200 ) {
                        alert( "An error occured, please try again." );
                    } else {
                        jQuery( "[name='locationName']", updateLocForm ).val( result[0].Name );
                        jQuery( "[name='latitude']", updateLocForm ).val( result[0].Latitude );
                        jQuery( "[name='longitude']", updateLocForm ).val( result[0].Longitude );
                        $( "[name='importanceCategory']", updateLocForm )[0].checked = result[0].ImportanceCategory === 1;

                    }
                } );
                getLocReq.send();
            }



        } )();

    </script>
</body>
</html>
