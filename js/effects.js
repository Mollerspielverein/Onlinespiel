/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function activeHeadSliding(delayed){
	
	if(typeof(delayed)=="undefined")var delayed=false;

	//Sliding
	$('#moe_Kopf_toggle').click(function(){
		if($('#Kopf').css("display")=="none"){
			$('#Kopf').slideDown(function(){$('#Navi').slideDown(100,function(){$('#moe_Kopf_toggle img').attr("src","fileadmin/design/ep/bilder/einklappen.png");});});
			
		}
		else {
			$('#Navi').slideUp(100,function(){$('#Kopf').slideUp(function(){$('#moe_Kopf_toggle img').attr("src","fileadmin/design/ep/bilder/ausklappen.png");});});

		}
	});

	var oParameter = new htmlParameterObject(window.location.search);

	if(oParameter["delayed"]==="true" || delayed===true){$('#moe_Kopf_toggle').delay(1500).click();} else {$('#Kopf').css("display","none");$('#Navi').css("display","none");}

}