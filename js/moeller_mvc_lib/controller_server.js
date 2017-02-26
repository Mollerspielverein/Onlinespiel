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

/**
 * 
 * oSpiele
 * [Spiel]
 * [Zuege]
 * 
 */

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

//var hostname = '10.0.18.19';
hostname="localhost"
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
                    oSpiele[neueSpielId]={};
                    oSpiele[neueSpielId]["game"] = new spielobject(neueSpielId,
                                                            new bobj(["e","g","h","s"],["9","t","U","O","K","A"],{ "M":7 ,"A": 6, "K": 5, "O": 4, "U": 3, "t": 2, "9": 1 },{ "A": 11, "K": 4, "O": 3, "U": 2, "t": 10, "9": 0 },2),
                                                            aDieMitspieler);
                    oSpiele[neueSpielId]["moves"]=new Array();
                    //Spiel.set_spielmodus(MOE_SPIELTYP_Ramsch);
                    oSpiele[neueSpielId]["game"].set_spielmodus(MOE_SPIELTYP_Ramsch);

                    initGameData["spielId"]=oSpiele[neueSpielId]["game"].get_spielid();


                    //geben und im view anzeigen
                    initGameData["offeneKarten"]  = oSpiele[neueSpielId]["game"].karten_geben();
                    initGameData["kartenAufDemNachziehStapel"] = oSpiele[neueSpielId]["game"].get_nachziehstapel_startkartenzahl();

                    //vorersten spieler festlegen
                    oSpiele[neueSpielId]["game"].get_aktuellen_spieler();

                    //holt den nächsten spieler, den echten ersten spieler aus dem modell, ohne den aktuellen spieler im modell weiterzusetzen, wird wegen get_offene_karten gebraucht --> workaround muss dann mal weg
                    initGameData["ersterSpieler"] = oSpiele[neueSpielId]["game"].get_naechsten_spieler();

                    initGameData["ersterSpielerTyp"] = oSpiele[neueSpielId]["game"].spieler(initGameData["ersterSpieler"]).get_spielertyp();
                    initGameData["ersterSpielerDarfStapelDrehen"] = oSpiele[neueSpielId]["game"].spieler(initGameData["ersterSpieler"]).darf_stapel_drehen();

                    //legt den nächsten spieler auch im modell fest
                    oSpiele[neueSpielId]["game"].naechster_spieler();

                    response.end(JSON.stringify(initGameData));
                    break;
                case "make_move":

                    var spielId = request.post.msg.gameId;

                    oSpiele[spielId]["game"]["moves"]=new Array();
                    oSpiele[spielId]["game"]["moves"].push(oSpiele[spielId]["game"].zug_machen(request.post.msg.playerId, request.post.msg.playerStack, request.post.msg.vindmillStack));

                    //Wenn der nächste Spieler eine kI ist
                    while(oSpiele[spielId]["game"]["moves"][oSpiele[spielId]["game"]["moves"].length-1].sNaechsterSpielertyp=="kI"){
                        var aEinZug = oSpiele[spielId]["game"]["moves"][oSpiele[spielId]["game"]["moves"].length-1];
                         //nun soll der kI-Zug ausgeführt werden
                        var kIId = oSpiele[spielId]["game"].spieler(aEinZug.iNaechsterSpielernummer).get_spielerid();
                         if(typeof(o_kI_Engines[kIId])!="undefined"){
                            var aZug = o_kI_Engines["kI/Nora"].apply(o_kI_Engines["kI/Nora"],new Array(oSpiele[spielId]["game"],aEinZug.iNaechsterSpielernummer));
                        } else {
                            var aZug = o_kI_Engines[kIId].apply(o_kI_Engines[kIId],new Array(oSpiele[spielId]["game"],aEinZug.iNaechsterSpielernummer));
                        }
                        oSpiele[spielId]["game"]["moves"].push(oSpiele[spielId]["game"].zug_machen(aEinZug.iNaechsterSpielernummer, aZug[0], aZug[1]));
                    }

                    console.log(oSpiele[spielId]["game"]["moves"]);
                    response.end(JSON.stringify(oSpiele[spielId]["game"]["moves"]));
                    break;
                case "get_ki_move":

                    var spielId = request.post.msg.gameId;
                    oSpiele[spielId]["game"]["moves"]=new Array();

                     //nun soll der kI-Zug ausgeführt werden
                    var kIId = oSpiele[spielId]["game"].spieler(request.post.msg.playerId).get_spielerid();
                    if (typeof(o_kI_Engines[kIId]) != "undefined") {
                        var aZug = o_kI_Engines["kI/Nora"].apply(o_kI_Engines["kI/Nora"], new Array(oSpiele[spielId]["game"], request.post.msg.playerId));
                    } else {
                        var aZug = o_kI_Engines[kIId].apply(o_kI_Engines[kIId], new Array(oSpiele[spielId]["game"], request.post.msg.playerId));
                    }
                    oSpiele[spielId]["game"]["moves"].push(oSpiele[spielId]["game"].zug_machen(request.post.msg.playerId, aZug[0], aZug[1]));

                    //oSpiele[spielId]["game"]["moves"].push(oSpiele[spielId]["game"].zug_machen(request.post.msg.playerId, request.post.msg.playerStack, request.post.msg.vindmillStack));

                    //Wenn der nächste Spieler eine kI ist
                    while(oSpiele[spielId]["game"]["moves"][oSpiele[spielId]["game"]["moves"].length-1].sNaechsterSpielertyp=="kI") {
                        var aEinZug = oSpiele[spielId]["game"]["moves"][oSpiele[spielId]["game"]["moves"].length - 1];
                        //nun soll der kI-Zug ausgeführt werden
                        var kIId = oSpiele[spielId]["game"].spieler(aEinZug.iNaechsterSpielernummer).get_spielerid();
                        if (typeof(o_kI_Engines[kIId]) != "undefined") {
                            var aZug = o_kI_Engines["kI/Nora"].apply(o_kI_Engines["kI/Nora"], new Array(oSpiele[spielId]["game"], aEinZug.iNaechsterSpielernummer));
                        } else {
                            console.log("Mache ki Zug:"+kIId)
                            var aZug = o_kI_Engines[kIId].apply(o_kI_Engines[kIId], new Array(oSpiele[spielId]["game"], aEinZug.iNaechsterSpielernummer));
                        }
                        oSpiele[spielId]["game"]["moves"].push(oSpiele[spielId]["game"].zug_machen(aEinZug.iNaechsterSpielernummer, aZug[0], aZug[1]));
                    }

                    console.log(oSpiele[spielId]["game"]["moves"]);
                    response.end(JSON.stringify(oSpiele[spielId]["game"]["moves"]));
                    break;
                case "turn_stack":

                    var spielId = request.post.msg.gameId;

                    //Wenn der falsche Spieler dran ist!
                    if (oSpiele[spielId]["game"].get_aktuellen_spieler() !== request.post.msg.playerId) {response.end(JSON.stringify(3003));}

                    var oiDrehZug = oSpiele[spielId]["game"].bankstapel_drehen(request.post.msg.vindmillStack);
                    console.log(oiDrehZug);
                    response.end(JSON.stringify(oiDrehZug));
                    break;
                case "get_results":

                    var spielId = request.post.msg.gameId;

                    if(oSpiele[spielId]["game"].get_spielstatus()===MOE_STATUS_ENDE) {
                        response.end(JSON.stringify({
                            allePunkte:oSpiele[spielId]["game"].get_spieler_punkte(),
                            alleAblagestapel:new Array(
                                oSpiele[spielId]["game"].spieler(0).ablagestapel().get_stapel(),
                                oSpiele[spielId]["game"].spieler(1).ablagestapel().get_stapel(),
                                oSpiele[spielId]["game"].spieler(2).ablagestapel().get_stapel()
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
