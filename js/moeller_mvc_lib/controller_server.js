/**
 * Created by micro on 29.12.2016.
 */


var http = require('http');
var fs = require('fs');

eval(fs.readFileSync('../zus_lib/zus_lib.js')+'');
eval(fs.readFileSync('modell2.js')+'');
eval(fs.readFileSync('ki.js')+'');

var Spiel;
var oSpiele ={};

/**********************
 *
 *       Server
 *
 *********************/

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = JSON.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

var hostname = '10.0.18.19';
var port =3000;

var server = http.createServer(function(request, response) {

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');

    if(request.method == 'POST') {
        processPost(request, response, function() {
            console.log(request.post);
            // Use request.post here

            //Nachricht parsen
            request.post.msg=JSON.parse(request.post.msg);
            //console.log(request.post.msg);

            response.writeHead(200, "OK", {'Content-Type': 'text/plain'});

            //console.log(request.post.ctrl+":"+request.post.msg.gameId);

            switch(request.post.ctrl){
                case "init_game":
                    //var aDieMitspieler = new Array(new Array("kI3/Laura","Laura","rechts"),new Array("kI3/Laura","Laura2","mitte"),new Array("ki3/Laura","Laura3","links"));
                    var initGameData = {};

                    var aDieMitspieler = request.post.msg.player;
                    initGameData["alleMitspieler"]=request.post.msg.player;
                    initGameData["spielOptionen"]=request.post.msg.options;
                    initGameData["spielModus"]=request.post.msg.modus;
                    initGameData["spielType"]=request.post.msg.type;

                    //console.log(init_oBlatt);

                    var neueSpielId = ma_z_rand(0,1000000000000);

                    //console.log("Neues Spiel:"+neueSpielId);

                    //
                    //Spiel = new spielobject(,init_oBlatt,aDieMitspieler);
                    oSpiele[neueSpielId] = new spielobject(neueSpielId,init_oBlatt,aDieMitspieler);
                    //Spiel.set_spielmodus(MOE_SPIELTYP_Ramsch);
                    oSpiele[neueSpielId].set_spielmodus(MOE_SPIELTYP_Ramsch);

                    initGameData["spielId"]=oSpiele[neueSpielId].get_spielid();


                    //geben und im view anzeigen
                    initGameData["offeneKarten"]  = oSpiele[neueSpielId].karten_geben();
                    initGameData["kartenAufDemNachziehStapel"] = oSpiele[neueSpielId].get_nachziehstapel_startkartenzahl();

                    //vorersten spieler festlegen
                    oSpiele[neueSpielId].get_aktuellen_spieler();

                    //holt den nächsten spieler, den echten ersten spieler aus dem modell, ohne den aktuellen spieler im modell weiterzusetzen, wird wegen get_offene_karten gebraucht --> workaround muss dann mal weg
                    initGameData["ersterSpieler"] = oSpiele[neueSpielId].get_naechsten_spieler();

                    initGameData["ersterSpielerTyp"] = oSpiele[neueSpielId].spieler(initGameData["ersterSpieler"]).get_spielertyp();
                    initGameData["ersterSpielerDarfStapelDrehen"] = oSpiele[neueSpielId].spieler(initGameData["ersterSpieler"]).darf_stapel_drehen();

                    //legt den nächsten spieler auch im modell fest
                    oSpiele[neueSpielId].naechster_spieler();

                    response.end(JSON.stringify(initGameData));
                    break;
                case "make_move":

                    var spielId = request.post.msg.gameId;


                    aAktuelleZuege=new Array();
                    aAktuelleZuege.push(oSpiele[spielId].zug_machen(request.post.msg.playerId, request.post.msg.playerStack, request.post.msg.vindmillStack));

                    //Wenn der nächste Spieler eine kI ist
                    while(aAktuelleZuege[aAktuelleZuege.length-1].sNaechsterSpielertyp=="kI"){
                        var aEinZug = aAktuelleZuege[aAktuelleZuege.length-1];
                         //nun soll der kI-Zug ausgeführt werden
                        var kIId = oSpiele[spielId].spieler(aEinZug.iNaechsterSpielernummer).get_spielerid();
                         if(typeof(o_kI_Engines[kIId])!="undefined"){
                            var aZug = o_kI_Engines["kI/Nora"].apply(o_kI_Engines["kI/Nora"],new Array(oSpiele[spielId],aEinZug.iNaechsterSpielernummer));
                        } else {
                            var aZug = o_kI_Engines[kIId].apply(o_kI_Engines[kIId],new Array(oSpiele[spielId],aEinZug.iNaechsterSpielernummer));
                        }
                        aAktuelleZuege.push(oSpiele[spielId].zug_machen(aEinZug.iNaechsterSpielernummer, aZug[0], aZug[1]));
                    }

                    console.log(aAktuelleZuege);
                    response.end(JSON.stringify(aAktuelleZuege));
                    break;
                case "get_ki_move":

                    var spielId = request.post.msg.gameId;
                    aAktuelleZuege=new Array();

                     //nun soll der kI-Zug ausgeführt werden
                    var kIId = oSpiele[spielId].spieler(request.post.msg.playerId).get_spielerid();
                    if (typeof(o_kI_Engines[kIId]) != "undefined") {
                        var aZug = o_kI_Engines["kI/Nora"].apply(o_kI_Engines["kI/Nora"], new Array(oSpiele[spielId], request.post.msg.playerId));
                    } else {
                        var aZug = o_kI_Engines[kIId].apply(o_kI_Engines[kIId], new Array(oSpiele[spielId], request.post.msg.playerId));
                    }
                    aAktuelleZuege.push(oSpiele[spielId].zug_machen(request.post.msg.playerId, aZug[0], aZug[1]));

                    //aAktuelleZuege.push(oSpiele[spielId].zug_machen(request.post.msg.playerId, request.post.msg.playerStack, request.post.msg.vindmillStack));

                    //Wenn der nächste Spieler eine kI ist
                    while(aAktuelleZuege[aAktuelleZuege.length-1].sNaechsterSpielertyp=="kI") {
                        var aEinZug = aAktuelleZuege[aAktuelleZuege.length - 1];
                        //nun soll der kI-Zug ausgeführt werden
                        var kIId = oSpiele[spielId].spieler(aEinZug.iNaechsterSpielernummer).get_spielerid();
                        if (typeof(o_kI_Engines[kIId]) != "undefined") {
                            var aZug = o_kI_Engines["kI/Nora"].apply(o_kI_Engines["kI/Nora"], new Array(oSpiele[spielId], aEinZug.iNaechsterSpielernummer));
                        } else {
                            var aZug = o_kI_Engines[kIId].apply(o_kI_Engines[kIId], new Array(oSpiele[spielId], aEinZug.iNaechsterSpielernummer));
                        }
                        aAktuelleZuege.push(oSpiele[spielId].zug_machen(aEinZug.iNaechsterSpielernummer, aZug[0], aZug[1]));
                    }

                    console.log(aAktuelleZuege);
                    response.end(JSON.stringify(aAktuelleZuege));
                    break;
                case "turn_stack":

                    var spielId = request.post.msg.gameId;

                    //Wenn der falsche Spieler dran ist!
                    if (oSpiele[spielId].get_aktuellen_spieler() !== request.post.msg.playerId) {response.end(JSON.stringify(3003));}

                    var oiDrehZug = oSpiele[spielId].bankstapel_drehen(request.post.msg.vindmillStack);
                    console.log(oiDrehZug);
                    response.end(JSON.stringify(oiDrehZug));
                    break;
                case "get_results":

                    var spielId = request.post.msg.gameId;

                    if(oSpiele[spielId].get_spielstatus()===MOE_STATUS_ENDE) {
                        response.end(JSON.stringify({
                            allePunkte:oSpiele[spielId].get_spieler_punkte(),
                            alleAblagestapel:new Array(
                                oSpiele[spielId].spieler(0).ablagestapel().get_stapel(),
                                oSpiele[spielId].spieler(1).ablagestapel().get_stapel(),
                                oSpiele[spielId].spieler(2).ablagestapel().get_stapel()
                            )
                        }));
                    } else {
                        response.end(JSON.stringify(5001));
                    }
                    break;
                default:
                    response.end(JSON.stringify(5001));
            }
            //response.end('<!DOCTYPE html><html><head><title>Hello World</title></head><body><h1>POST-DATA</h1><p>'+request.post.nameDesSpielers+'</p></body></html>');
        });
    } else {
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.end('<!DOCTYPE html><html><head><title>Hello World</title></head><body><h1>GET-URL</h1><p>'+request.url+'</p></body></html>');
    }
});

server.listen(port,hostname, function(){
    console.log('Server running at http://'+hostname+':'+port+'/');
});
