/**
 * Created by micro on 29.12.2016.
 */


var http = require('http');
var fs = require('fs');

eval(fs.readFileSync('../zus_lib/zus_lib.js')+'');
eval(fs.readFileSync('modell2.js')+'');
eval(fs.readFileSync('ki.js')+'');

var Spiel;


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
            console.log(request.post.msg);

            response.writeHead(200, "OK", {'Content-Type': 'text/plain'});

            switch(request.post.ctrl){
                case "init_game":
                    //var aDieMitspieler = new Array(new Array("kI3/Laura","Laura","rechts"),new Array("kI3/Laura","Laura2","mitte"),new Array("ki3/Laura","Laura3","links"));
                    var initGameData = {};

                    aDieMitspieler = request.post.msg.player;
                    initGameData["alleMitspieler"]=request.post.msg.player;
                    initGameData["spielOptionen"]=request.post.msg.options;
                    initGameData["spielModus"]=request.post.msg.modus;
                    initGameData["spielType"]=request.post.msg.type;

                    console.log(aDieMitspieler);
                    console.log(init_SpielID);
                    console.log(init_oBlatt);

                    Spiel = new spielobject(init_SpielID,init_oBlatt,aDieMitspieler);
                    Spiel.set_spielmodus(MOE_SPIELTYP_Ramsch);

                    //geben und im view anzeigen
                    initGameData["offeneKarten"]  = Spiel.karten_geben();
                    initGameData["kartenAufDemNachziehStapel"] = Spiel.get_nachziehstapel_startkartenzahl();

                    //vorersten spieler festlegen
                    Spiel.get_aktuellen_spieler();

                    //holt den nächsten spieler, den echten ersten spieler aus dem modell, ohne den aktuellen spieler im modell weiterzusetzen, wird wegen get_offene_karten gebraucht --> workaround muss dann mal weg
                    initGameData["ersterSpieler"] = Spiel.get_naechsten_spieler();

                    initGameData["ersterSpielerTyp"] = Spiel.spieler(initGameData["ersterSpieler"]).get_spielertyp();
                    initGameData["ersterSpielerDarfStapelDrehen"] = Spiel.spieler(initGameData["ersterSpieler"]).darf_stapel_drehen();

                    //legt den nächsten spieler auch im modell fest
                    Spiel.naechster_spieler();

                    response.end(JSON.stringify(initGameData));
                    break;
                case "make_turn":
                    var oZug = Spiel.zug_machen(request.post.msg.playerId, request.post.msg.playerStack, request.post.msg.vindmillStack);
                    console.log(oZug);
                    response.end(JSON.stringify(oZug));
                    break;
                case "turn_stack":
                    //Wenn der falsche Spieler dran ist!
                    if (Spiel.get_aktuellen_spieler() !== request.post.msg.playerId) {response.end(JSON.stringify(3003));}

                    var oiDrehZug = Spiel.bankstapel_drehen(request.post.msg.vindmillStack);
                    console.log(oiDrehZug);
                    response.end(JSON.stringify(oiDrehZug));
                    break;
                case "get_results":
                    if(Spiel.get_spielstatus()===MOE_STATUS_ENDE) {
                        response.end(JSON.stringify({
                            allePunkte:Spiel.get_spieler_punkte(),
                            alleAblagestapel:new Array(
                                Spiel.spieler(0).ablagestapel().get_stapel(),
                                Spiel.spieler(1).ablagestapel().get_stapel(),
                                Spiel.spieler(2).ablagestapel().get_stapel()
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
