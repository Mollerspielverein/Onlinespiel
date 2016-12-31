
function ui_bind_start_events()
{

	//SpielerButtons anbinden
	for(var i=1;i<4;i++)
	{
		dArray= aAlleKI.concat(new Array("Mensch","kiz"));
		for(var j=0;j< dArray.length;j++)
		{
			sKiTyp=dArray[j];
			$("#"+sKiTyp+i).click(function(){
				var dsName=$(this).attr("id")
				var dsPosition=dsName[dsName.length-1];
				dsName= dsName.slice(0,dsName.length-1);
				ui_spielerwahl_button_loesen(dsPosition);
				startlogik_setze_position(parseInt(dsPosition),dsName);
				ui_spielerwahl_button_druecken(dsPosition);
			});
		}
	}
	

	
	//Spielmodus Buttons

	$('#normalmodus').click(function(){
		iStartSpielModus=MOE_SPIELTYP_KeinRamsch;
		$('#ramschmodus').addClass("option");
		$('#ramschmodus').removeClass("option_aktiv");
		$('#wildermodus').addClass("option");
		$('#wildermodus').removeClass("option_aktiv");
		$('#normalmodus').addClass("option_aktiv");
		$('#normalmodus').removeClass("option");
	});
	
	$('#ramschmodus').click(function(){
		iStartSpielModus=MOE_SPIELTYP_Ramsch;
		$('#normalmodus').addClass("option");
		$('#normalmodus').removeClass("option_aktiv");
		$('#wildermodus').addClass("option");
		$('#wildermodus').removeClass("option_aktiv");
		$('#ramschmodus').addClass("option_aktiv");
		$('#ramschmodus').removeClass("option");
	});
	
	$('#wildermodus').click(function(){
		iStartSpielModus=MOE_SPIELTYP_WildesSpiel;
		$('#normalmodus').addClass("option");
		$('#normalmodus').removeClass("option_aktiv");
		$('#ramschmodus').addClass("option");
		$('#ramschmodus').removeClass("option_aktiv");
		$('#wildermodus').addClass("option_aktiv");
		$('#wildermodus').removeClass("option");		
	});
	
	//Spielstarten anbinden
	$('#startfeld').click(function(){
		startlogik_startespiel();
	});


}

function ui_spielerwahl_button_loesen(sPosition)
{
	sButtonId="#"+aStartAuswahl[sPosition-1]+sPosition;
	protokoll("Loese Button "+sButtonId);
	$(sButtonId).addClass("option");
	$(sButtonId).removeClass("option_aktiv");
}


function ui_spielerwahl_button_druecken(sPosition)
{
	sButtonId="#"+aStartAuswahl[sPosition-1]+sPosition;
	protokoll("Loese Button "+sButtonId);
	$(sButtonId).addClass("option_aktiv");
	$(sButtonId).removeClass("option");
}