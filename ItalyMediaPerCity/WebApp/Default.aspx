<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebApp._Default" %>
<!DOCTYPE html>

<html>
<head>
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="Content/jquery.mobile-1.4.5.min.css">
    <link rel="stylesheet" href="Content/redactor/redactor.css" />
    <style type="text/css">
        .save:not(.busy) > .progress {
            display: none;
        }
    </style>
    <script src="Scripts/jquery-1.9.1.min.js"></script>
    <script src="Scripts/jquery.mobile-1.4.5.min.js"></script>
    <script src="Scripts/jquery.validate.js"></script>
    <script>
        $.extend($.validator.messages, {
            required: "Campo obbligatorio",
            requiredAudioFile: "Please record or select an audio file",
            remote: "Controlla questo campo",
            email: "Inserisci un indirizzo email valido",
            url: "Inserisci un indirizzo web valido",
            date: "Inserisci una data valida",
            dateISO: "Inserisci una data valida (ISO)",
            number: "Inserisci un numero valido",
            digits: "Inserisci solo numeri",
            creditcard: "Inserisci un numero di carta di credito valido",
            equalTo: "Il valore non corrisponde",
            extension: "Inserisci un valore con un&apos;estensione valida",
            maxlength: $.validator.format("Non inserire pi&ugrave; di {0} caratteri"),
            minlength: $.validator.format("Inserisci almeno {0} caratteri"),
            rangelength: $.validator.format("Inserisci un valore compreso tra {0} e {1} caratteri"),
            range: $.validator.format("Inserisci un valore compreso tra {0} e {1}"),
            max: $.validator.format("Inserisci un valore minore o uguale a {0}"),
            min: $.validator.format("Inserisci un valore maggiore o uguale a {0}"),
            nifES: "Inserisci un NIF valido",
            nieES: "Inserisci un NIE valido",
            cifES: "Inserisci un CIF valido",
            currency: "Inserisci una valuta valida"
        });
    </script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBTjc4KFqfCbhQ-64PjFcDZW5kEiBlLfdc&libraries=geocoding"></script>
    <script type="text/javascript" src="Scripts/events.js"></script>  
    <script type="text/javascript" src="Scripts/core.js"></script>
    <script type="text/javascript" src="Scripts/composite-formatting.js"></script> 
    <script type="text/javascript" src="Scripts/data-binding.js"></script>
    <script type="text/javascript" src="Scripts/observable-list.js"></script>
    <script type="text/javascript" src="Scripts/other.js"></script>
    <script type="text/javascript" src="Scripts/audio-recorder.js"></script>
    <script type="text/javascript" src="Scripts/file-saver.js"></script>
    <!--
        <script type="text/javascript" src="Scripts/redactor/redactor.js"></script>
    -->
    <style type="text/css">
        .table-collapsed {
            border-spacing: 0;
            border-collapse: collapse;
        }
        .table-collapsed td,
        .table-collapsed th {
            padding: 0;
        }
        .info-table td {
            border: 1px solid #ddd;
            background-color: #fff;
            padding: .4em !important;
        }
        .header-title-wrapper {
            position: absolute; 
            left: 0; 
            width: 100%; 
            z-index: 3;
            border-collapse: collapse;
            border-spacing: 0;
        }
        .header-title {
            font-size: 50px; 
            vertical-align: bottom; 
            color: white; 
            text-align: left;
            padding: 0 0.2em;
            text-shadow: 0 0 10px black;
        }
        .item-template {
            display: none;
        }
        label.error { 
            display: block;
	        color: red; 
            margin-top: .4em;
            margin-bottom: 2em;
	        vertical-align: top; 
	        font-weight: bold;
        }
        .ui-content-inner {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
        }

        *[data-x-can-approve] .ui-content-inner {

        }

        .approval-layout-table td {
            vertical-align: top;
        }
        .approval-layout-table td:last-child {
            position: relative;
            width: 104px;
        }
        .approval-layout-table td:last-child > * {
            margin: 0 0 0 0.5em;
        }


    </style>
</head>
<body>
    <div data-role="page" id="page-default" style="background-color: #ddd;">
        
      <div style="max-width: 1154px;margin: 0 auto; -webkit-box-shadow: 0px 0px 79px 3px rgba(0,0,0,1);
-moz-box-shadow: 0px 0px 79px 3px rgba(0,0,0,1);
box-shadow: 0px 0px 79px 3px rgba(0,0,0,1); position: relative;">
        <div style="height: 203px; background-color: black; position: relative;">
            <div style="height: 100%; position: relative; opacity: 1;">
                <div style="margin: 0 auto;
                max-width: 1154px;
                height: 100%; ">
                    <div style="
                    z-index: 2; 
                    position: relative;
                    width: 100%;
                    height: 203px;
                    background-image: url(Content/images/header2.png); 
                    background-repeat: no-repeat; 
                    background-position-x: center;">
                    </div>
                </div>
                <div style="background-color: white; height: 100%; z-index: 1; position: absolute; left: 0; top: 0; width: 50%;"></div>
                <div style="background-color: white; height: 100%; z-index: 1; position: absolute; right: 0; top: 0; width: 50%;"></div>
            </div>
            <table class="header-title-wrapper" style="bottom:15px;">
                <tbody><tr>
                <td class="header-title" style="vertical-align: bottom;">
            <img src="Content/images/logo.jpg" width="80" height="80"/>
                    Abruzzo e Molise <span style="font-size:50%;">data crowdsourcing</span>
                </td>
                </tr>
                    <!--
                    <tr><td style="padding-left: .2em; color: #f03b20; font-weight: bold; font-size: 30px; 
                        -webkit-text-stroke: 1px rgb(254, 204, 92);">
                        Under construction
                        </td></tr>
                    -->
                </tbody>
            </table>
        </div>
        <div style="position: relative; height: 760px;">
            <div style="padding-top: 1em; z-index: 2; position: relative;">
                <div class="ui-content ui-popup ui-body-a ui-overlay-shadow ui-corner-all" style="float: right; margin: 0 1em; max-width: 500px;">
                    Partecipa anche tu alla documentazione delle lingue di Abruzzo e Molise! 
Vai dai tuoi nonni e chiedi loro di parlare per 10 minuti (raccontando la loro giovinezza, o la guerra), e registrali con il tuo telefonino. Poi entra nel sito (vai alla mappa), seleziona il cerchietto che corrisponde al tuo paese, e fai l’upload dell’audio o del video che hai registrato.
Grazie!</div>
                <div style="clear: both;"></div>
            </div>   
            <div style="margin: 1em 0;  z-index: 2; position: relative;">
                <div class="ui-content ui-popup ui-body-a ui-overlay-shadow ui-corner-all" style="float: left; width: 300px; margin: 0 1em;">
                    <div><span id="welcome-msg" style="display: none;">Welcome, administrator.</span>Clicca sul cerchietto corrispondente alla località i cui dati hai registrato (nella prossima pagina):</div>
                    <a data-role="button" data-x-nav="page-map" style="float: left;">Vai alla mappa</a>
                    <div style="display: none;">
                        <a data-role="button" data-x-nav="page-sign-in" id="sign-in" style="float: left; margin-left: .5em;">Sign in</a>
                        <a data-role="button" id="sign-out" style="float: left; margin-left: .5em; display: none;">Sign out</a>
                    </div>
                    <div style="clear: both;"></div>
                </div>
                <div style="clear: both;"></div>
            </div>
            <div style="margin: 1em 0;  z-index: 2; position: relative; overflow: visible;">
                <div class="ui-content ui-popup ui-body-a ui-overlay-shadow ui-corner-all" style="float: left; margin: 0 1em; width: 300px;">
                    I punti di raccolta dati sono indicati sulla mappa. Ciascun comune è rappresentato da un cerchietto. Il colore del cerchietto e la sua consistenza indicano quanti dati sono già stati raccolti:
                    <table class="table-collapsed">
                        <tr>
                            <td><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="60">
                                <g transform="translate(29.1,29.1) scale(1.7,-1.7)">
                                    <g style="cursor: default;">
                                        <circle r="14.166666666666668" fill="black" fill-opacity="0.001" stroke="#bd0026" stroke-opacity="0.75" stroke-width="5.666666666666666" id="0.4448003936558962"></circle>
                                    </g>
                                </g>
                            </svg></td>
                            <td>Nessun dato</td>
                        </tr>
                        <tr>
                            <td><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="60">
                                <g transform="translate(29.1,29.1) scale(1.7,-1.7)">
                                    <g style="cursor: default;">
                                        <circle r="14.166666666666668" fill="black" fill-opacity="0.001" stroke="#f03b20" stroke-opacity="0.75" stroke-width="5.666666666666666" id="0.092671426711604"></circle>
                                        <path stroke="none" d="M0,0L0,10.333333333333334 A10.333333333333334,10.333333333333334 0 0,0 8.9489291724392,-5.166666666666665Z" fill="#f03b20" fill-opacity="0.75"></path>
                                    </g>
                                </g>
                                </svg></td>
                            <td>Pochi dati: ne servono altri!</td>
                        </tr>
                        <tr>
                            <td><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="60">
                                <g transform="translate(29.1,29.1) scale(2.3,-2.3)">
                                    <g style="cursor: default;">
                                        <circle r="10" fill="black" fill-opacity="0.001" stroke="#fd8d3c" stroke-opacity="0.75" stroke-width="4" id="0.583845596993342"></circle>
                                        <path stroke="none" d="M0,0L0,7 A7,7 0 1,0 -6.0621778264910695,-3.500000000000002Z" fill="#fd8d3c" fill-opacity="0.75"></path>
                                    </g>
                                </g>
                                </svg></td>
                            <td>Alcuni dati: se ne possono aggiungere altri</td>
                        </tr>
                        <tr>
                            <td><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="60">
                                <g transform="translate(29.1,29.1) scale(2.4,-2.4)">
                                    <g style="cursor: default;">
                                        <!--#fecc5c-->
                                        <circle r="10" fill="black" fill-opacity="0.001" stroke="#2ca25f" stroke-opacity="0.75" stroke-width="4" id="0.7697729414794594"></circle>
                                        <path stroke="none" d="M-7,0A7,7 0 0,0 7,0A7,7 0 0,0 -7,0" fill="#2ca25f" fill-opacity="0.75"></path>
                                    </g>
                                </g>
                                </svg>
                            </td><td>Abbastanza dati: altri dati sono sempre graditi!</td>
                        </tr>
                    </table>
                </div>
                <div style="clear: both;"></div>
            </div>
        
      
            <div style="position: absolute; z-index: 1; left: 0; top: 0; height: 100%; width: 100%; background: url(Content/images/map.png) no-repeat center; "></div>
        </div>
        <div style="height: 15px; background-color: rgb(115, 146, 203);"></div>
        <div data-role="footer">
            <h1 style="float: left;">Contatto (<a href="mailto:dialetti@hum.leidenuniv.nl">dialetti@hum.leidenuniv.nl</a>)</h1>
            <div style="clear:both;"></div>
        </div>
      </div>
      <script type="text/javascript" src="Scripts/page-default.js"></script>
    </div>

    <div data-role="page" id="page-map">
      <div data-role="header">
        <div class="ui-btn-left" data-role="controlgroup" data-type="horizontal">
            <button data-x-nav="@back" data-icon="arrow-l" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
            <button data-x-nav="@forward" data-icon="arrow-r" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
        </div>
        <h1>Scegli la località</h1>
        <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
            <button data-x-nav="page-map-instructions" data-icon="info" data-iconpos="right" style="width: 0; padding-right: 1.6em;">&nbsp;</button>
            <button data-icon="search" data-iconpos="right" class="search-bar-toggle-btn" style="width: 0; padding-right: 1.6em;">&nbsp;</button>
        </div>
      </div>
      <div data-role="main" class="ui-content" style="padding:0;position: relative;">
        <div id="search-bar" style="position: absolute; z-index:1; background-color: #fff; border-bottom: 1px solid #ddd; left: 0; right: 0; padding: 0 0.5em; display: none;"><input type="text" /></div>
        <div id="other-location" class="ui-content ui-popup ui-body-a ui-overlay-shadow ui-corner-all" style="z-index: 1; position: absolute; top: 0.5em; right: 0.5em; max-width: 20em;">
            <div style="text-align:right;"><a href="javascript:;" id="cannot-find-your-location-btn">Non riesci a trovare la località?</a></div>
            <div id="cannot-find-your-location-info" style="display: none; padding-top: 2em;">
                Hai provato con la funzione <a href="javascript:;" class="search-bar-toggle-btn">cerca</a>?<br />
                Se la località non è contrassegnata, puoi <a href="javascript:;" id="no-data-collection-point-btn">aggiungerla qui</a>.
            </div>               
            <div id="no-data-collection-point-info" style="padding-top:2em;display:none;">
                <label for="name1234">Nome della località:</label>
                <input id="name1234" name="name1234" type="text" style=""/>
                <button style="margin-top: 0;" id="add-location-and-go-to-page-btn">Aggiungi e vai alla pagina</button>
            </div>
        </div>
        <div id="map-canvas"></div>
      </div>
        <!--
      <div data-role="footer">
        <h1>Page 1 footer</h1>
      </div>
        -->
        <script type="text/javascript" src="Scripts/page-map.js"></script>
    </div> 
    
    <div data-role="page" id="page-map-instructions">
      <div data-role="header">
        <div class="ui-btn-left" data-role="controlgroup" data-type="horizontal">
            <button data-x-nav="@back" data-icon="arrow-l" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
            <button data-x-nav="@forward" data-icon="arrow-r" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
        </div>
        <h1>Istruzioni</h1>
        <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
            <button data-x-nav="page-map-instructions" data-icon="info" data-iconpos="right" style="width: 0; padding-right: 1.6em;">&nbsp;</button>
        </div>
      </div>
      <div data-role="main" class="ui-content" >
          <div class="ui-content-inner">
              <div style="margin: 0 1em;">
          <p>
            <h3>Chi registrare</h3>
            Puoi registrare chi vuoi, purché parli il dialetto/la lingua locale. Gli anziani solitamente parlano meglio il dialetto, ma anche i giovani vanno bene.
              </p>
          <p>
            <h3>Cosa fare</h3>
            Vai dalla persona che vuoi registrare e chiedile di parlare per 10 minuti, raccontando la sua giovinezza, o la guerra, o un argomento a piacere, e registrala con il tuo telefonino (o con una videocamera). I formati ammessi sono .mp3, .mp4, ...
              </p>
          <p>
        Entra nel sito (<a href="javascript:;" data-x-nav="page-map">clicca su Vai alla mappa</a>), seleziona il cerchietto che corrisponde al tuo paese, e fai l’upload dell’audio o del video che hai registrato.
              </p><p>
        Riceverai un messaggio di conferma della riuscita dell’operazione. 
                  </p><p>
        La tua registrazione non apparirà online immediatamente, ma dopo qualche giorno.
                      </p><p>
        Se preferisci, puoi aggiungere una trascrizione di quello che ha detto la persona registrata. Fa’ attenzione a trascrivere ogni parola. 
        Puoi, se preferisci, anche aggiungere una traduzione.
                          </p><p>
        Grazie!</p>
                  </div>
            </div>
      </div>
      <script type="text/javascript">
          PageMgr.instance.registerPage(new Page("page-map-instructions"));
      </script>
    </div> 
    
    <div data-role="page" id="page-location">
      <div data-role="header">
        <div class="ui-btn-left" data-role="controlgroup" data-type="horizontal">
            <button data-x-nav="@back" data-icon="arrow-l" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
            <button data-x-nav="@forward" data-icon="arrow-r" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
        </div>
        <h1>Unknown city</h1>

        <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
            <button data-icon="plus" data-iconpos="right" class="add-audio">Audio</button>
            <button data-icon="plus" data-iconpos="right" class="add-video">Video</button>
            <button data-x-nav="page-map-instructions" data-icon="info" data-iconpos="right" style="width: 0; padding-right: 1.6em;">&nbsp;</button>
        </div>
      </div>
      <div data-role="main" class="ui-content">
        <div class="ui-content-inner">
            <ul id="sampleUploaders" data-role="listview" style="margin-bottom:0;">
                <li style="padding: 0 1em;" class="item-template"><span style="padding-top:1.2em;float: left;" data-role="none">{name}</span><button data-icon="audio" style="width: auto; float: right;" data-command="{play}">Play</button></li>
            </ul>
            <ul id="samplesMetadata" data-role="listview" style="margin-top:0;">
                <li style="padding: 0 1em;" class="item-template"><span style="padding-top:1.2em;float: left;" data-role="none">{title}</span>
                
                    <button data-icon="audio" style="width: auto; float: right;" data-command="{play}">Play</button>
                    <button data-icon="search" style="width: auto; float: right; margin-right: 0.5em;" data-command="{view}">Dati</button>

                </li>
            </ul>
            <div id="no-files" style="text-align: center; display: none;">
                Non ci sono dati per questa località
            </div>
        </div>
      </div>
      <script type="text/javascript" src="Scripts/page-location.js"></script>
    </div> 
    
    <div data-role="page" id="page-add-or-update-sample" style="overflow: visible;">
        <div data-role="header">
            <div class="ui-btn-left" data-role="controlgroup" data-type="horizontal">
                <button data-x-nav="@back" data-icon="arrow-l" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
                <button data-x-nav="@forward" data-icon="arrow-r" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
            </div>
            <h1>Upload audio</h1>
            <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
                
                <button data-icon="delete" class="delete if-is-in-update-mode">Delete</button>
                <button data-icon="check" class="save"><span class="text">Salva</span><span class="progress"></span></button>
                <button data-x-nav="page-map-instructions" data-icon="info" data-iconpos="right" style="width: 0; padding-right: 1.6em;">&nbsp;</button>
            </div>
        </div>
        <form data-role="main">
            <div class="ui-content-inner">
                <!-- When changing this layout one should take into account a portion of it is scripted, see page-add-or-update-sample.js. -->
                <table style="margin: 0 0.5em;" class="table-collapsed approval-layout-table"><tbody><tr><td>
                    <div id="sample-data-file" style="margin: 0.5em 0; position: relative;">
                        <div class="sample-data-file x-file-input">
                            <div class="file-name ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset" style="margin: 0; padding: 0.7em 1em; font-size: 16px;">&nbsp;</div>
                            <button style="border-top-left-radius: 0; border-bottom-left-radius: 0; position: absolute; right: 0; top: 0; width: auto; margin: 0;">Seleziona il file</button>
                            <input class="hidden" data-role="none" style="display:block; opacity: 0; position: absolute; width: 100%; top: 0; bottom: 0;" type="file" accept="audio/*;capture=microphone">
                        </div>
                        <button id="start-recording-audio" class="audio-recording-supported" style="float: left; box-sizing: border-box; width: 33%; border-top-right-radius: 0; border-bottom-right-radius: 0; border-right-width: 0;">
                            <span class="record-icon" style="position: relative;display:inline-block;background-color:black;border-radius:0.5em;width:1em;height:1em;left:-0.5em;top:0.1em;"></span>Registra
                        </button>
                        <button id="stop-recording-audio" class="audio-recording-supported" style="float: left; box-sizing: border-box; width: 33%; border-radius: 0;border-right-width: 0;">
                            <span class="stop-icon" style="position: relative;display:inline-block;background-color:black;width:1em;height:1em;left:-0.5em;top:0.1em;"></span>Stop
                        </button> 
                        <button class="play-button" style="float:right;box-sizing:border-box;width:34%;border-top-left-radius: 0; border-bottom-left-radius:0;">
                    
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="12" height="16" style="position: relative;display:inline-block;left:-0.5em;top:0.1em;">
                                <path d="M0,0L12,8 0,16Z" fill="black"></path>
                            </svg>Play

                        </button>
                        <div style="clear: left;"></div>
                        <span class="audio-recording-not-supported" style="text-align: center;">
                            Recording audio is not supported in your browser. Consider using the latest version of Google Chrome or Firefox.
                        </span>
                    </div>

                    <label for="name" style="display: block; margin-top: 2em;">Nome:</label>
                    <input type="text" name="name" class="required" id="name" />
                

                    <label for="isAnonymous">Il nome può essere reso pubblico</label>
                    <input type="checkbox" name="isAnonymous" id="isAnonymous" checked/>

                    <div style="margin: 2em 0;">
                        Ti chiediamo di rispondere ad alcune domande sul profilo del parlante.
                    </div>
                    <label for="gender">Sesso del parlante:</label>
                    <select name="gender" id="gender" class="required">
		                <option value="">Seleziona</option>
		                <option value="male">Maschio</option>
		                <option value="female">Femmina</option>
	                </select>
                    <label>Anno di nascita:</label>
                    <input type="number" name="yearOfBirth" min="1850" max="2015" class="required" />
                    <label>Lingue parlate (è possibile indicare più lingue)</label>
                    <input type="text" name="motherTongues"/>
                    <label>Il parlante ha sempre vissuto in questa località?</label>
                    <select name="alwaysLivedAtLocation0">
		                <option value="">&nbsp;</option>
		                <option value="true">Si</option>
		                <option value="false">No</option>
	                </select>
                    <label>Se no, quando ci si è trasferito?</label>
                    <input type="number" name="yearOfMovingToLocation0" min="1850" max="2015"/>
                    <label>Trascrizione:</label>

                    <div style="margin: 0.5em 0;position:relative;">
                        <div id="transcription-file" style="margin-right:2.5em;position:relative;">
                            <div class="file-name ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset" style="margin: 0; padding: 0.7em 1em; font-size: 16px;">&nbsp;</div>
                            <button style="border-top-left-radius: 0; border-bottom-left-radius: 0; position: absolute; right: 0; bottom:0; top: 0; width: auto; margin: 0;border-right-width:0;border-top-right-radius: 0; border-bottom-right-radius: 0;">Seleziona il file</button>
                            <input class="hidden" data-role="none" style="display:block; opacity: 0; position: absolute; width: 100%; top: 0; bottom: 0;" type="file" accept="*/*">
                        </div>
                        <button class="clear-transcription-button" data-icon="delete" style="position:absolute; padding:0; width: 2.5em;margin:0;right:0;top:0;bottom:0;border-top-left-radius: 0; border-bottom-left-radius: 0; "></button>
                    </div>
                    <button class="download-transcription-button">Download</button>
                 
                    <div style="height:.4em;"></div>
                    <label>Traduzione:</label>
                    
                    <div style="margin: 0.5em 0;position:relative;">
                        <div id="translation-file" style="margin-right:2.5em;position:relative;">
                            <div class="file-name ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset" style="margin: 0; padding: 0.7em 1em; font-size: 16px;">&nbsp;</div>
                            <button style="border-top-left-radius: 0; border-bottom-left-radius: 0; position: absolute; right: 0; bottom:0; top: 0; width: auto; margin: 0;border-right-width:0;border-top-right-radius: 0; border-bottom-right-radius: 0;">Seleziona il file</button>
                            <input class="hidden" data-role="none" style="display:block; opacity: 0; position: absolute; width: 100%; top: 0; bottom: 0;" type="file" accept="*/*">
                        </div>
                        <button class="clear-translation-button" data-icon="delete" style="position:absolute; padding:0; width: 2.5em;margin:0;right:0;top:0;bottom:0;border-top-left-radius: 0; border-bottom-left-radius: 0; "></button>
                    </div>
                    <button class="download-translation-button">Download</button>
                    <div style="height:.4em;"></div>
                    <label>Email o telefono (visibile solo per l'amministratore) e/o altre informazioni:</label>
                    <textarea name="otherInformation" style="resize: vertical;"></textarea>
                    <div style="height: 10em;"></div>

                    <div class="if-is-in-update-mode">
                        <label for="location-select">Location:</label>
                        <select id="location-select"></select>
                        <button data-icon="delete" class="delete">Delete</button>
                    </div>

                    <button data-icon="check" class="save"><span class="text">Salva</span><span class="progress"></span></button>
                </td><td>
                </td></tr></tbody></table>
            </div>
        </form>
        <script type="text/javascript" src="Scripts/page-add-or-update-sample.js"></script>
    </div>
    <div data-role="page" id="page-view-file">
        <div data-role="header">
            <div class="ui-btn-left" data-role="controlgroup" data-type="horizontal">
                <button data-x-nav="@back" data-icon="arrow-l" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
                <button data-x-nav="@forward" data-icon="arrow-r" style="width: 0; padding-right: 0.1em;">&nbsp;</button>
            </div>
            <h1>View</h1>
            <div class="ui-btn-right" data-role="controlgroup" data-type="horizontal">
                <button data-x-nav="page-map-instructions" data-icon="info" data-iconpos="right" style="width: 0; padding-right: 1.6em;">&nbsp;</button>
            </div>
        </div>
        <div data-role="main" class="ui-content">
            <div class="ui-content-inner">
                <button class="play-button">Play</button>
                <table style="width: 100%;" class="table-collapsed info-table"><tbody>
                    <tr><td>Nome:</td><td class="field-name"></td></tr>
                    <tr><td colspan="2">&nbsp;</td></tr>
                    <tr><td>Sesso del parlante:</td><td class="field-gender"></td></tr>
                    <tr><td>Anno di nascita:</td><td class="field-yearOfBirth"></td></tr>
                    <tr><td>Lingue parlate (è possibile indicare più lingue)</td><td class="field-motherTongues"></td></tr>
                    <tr><td>Il parlante ha sempre vissuto in questa località?</td><td class="field-alwaysLivedAtLocation0"></td></tr>
                    <tr><td>Se no, quando ci si è trasferito?</td><td class="field-yearOfMovingToLocation0"></td></tr>  
                </tbody></table>
                <div style="height: 2em;"></div>
                <table style="width: 100%;" class="table-collapsed info-table"><tbody>
                    <tr><td colspan="2">Trascrizione:<button class="btn-transcr">Download</button></td></tr>
                    <tr><td colspan="2">Traduzione:<button class="btn-trans">Download</button></td></tr>
                </tbody></table>
                <!--
                    <label>Se no, quando ci si è trasferito?</label>
                    <input type="number" name="yearOfMovingToLocation0" min="1850" max="2015"/>
                    <label>Trascrizione:</label>
                    <textarea name="transcription" style="resize: vertical;"></textarea>
                    <div style="height:.4em;"></div>
                    <label>Traduzione:</label>
                    <textarea name="translation" style="resize: vertical;"></textarea>
                    <div style="height:.4em;"></div>
                    <label>Altre informazioni:</label>
                    <textarea name="otherInformation" style="resize: vertical;"></textarea>
                    <div style="height: 10em;"></div>
                -->


            </div>

        </div>
        <script type="text/javascript" src="Scripts/page-view-file.js"></script>
    </div>
    

   
</body>
</html>
