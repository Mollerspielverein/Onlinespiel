$(document).ready(function(){
	
	//Wichtige Variablen definieren
	var aZugProtokoll;
	
	//Kopf wegfahren
	activeHeadSliding(true);
	
	//Steuerelemente eingeben
	$('#moe_mplayer_laden').click(function(){
		//ZugProtokoll einlesen
		aZugProtokoll = prompt("Butte geben sie das Zugprotokoll ein!");
		if(aZugProtokoll!=""){
			//$('#moe_mplayer_laden').css("display","none");
			strg_player_laden_starten(aZugProtokoll);
			
			$('#moe_mplayer_start').click(function(){
				strg_player_stop_weiter("weiter");
				$('#moe_mplayer_pause img').attr("src","fileadmin/design/ep/bilder/pause_enabled.png");
				$('#moe_mplayer_start img').attr("src","fileadmin/design/ep/bilder/play_disabled.png");
			});


			$('#moe_mplayer_pause').click(function(){
				strg_player_stop_weiter("stop");
				$('#moe_mplayer_start img').attr("src","fileadmin/design/ep/bilder/play_enabled.png");
				$('#moe_mplayer_pause img').attr("src","fileadmin/design/ep/bilder/pause_disabled.png");
			});	
			
			$('#moe_mplayer_pause img').attr("src","fileadmin/design/ep/bilder/pause_enabled.png");

			$('#moe_mplayer_laden').unbind("click");
			$('#moe_mplayer_laden').click(function(){location.reload();});
			$('#moe_mplayer_laden').attr("title","Spiel beenden und neues Protokoll laden");
		}
		
	});
	

	
	

	
	
	
	
});