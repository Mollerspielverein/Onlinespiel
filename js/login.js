/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function(){
	var oLoginTimer;
  
  function loginFadeOut(){
    $("div#Loginbox").fadeOut();
  }
  
  function loginFadeIn(){
	  $("div#Loginbox input#user").attr("value","Benutzername");
	  $("div#Loginbox input#pass").attr("value","Passwort");
	  $("div#Loginbox").fadeIn();
  }
  
  $("div#Loginbox input#user").focus(function(e){
	$(this).attr("value","");
  });
  
  $("div#Loginbox input#pass").focus(function(e){
	$(this).attr("value","");
  });
  
  $("div#Loginbox").css("display","none");

  $('#loginbutton').click(function(){
		loginFadeIn()
		clearTimeout(oLoginTimer); 
		return false;
  });
  
  $("#loginbutton").hover(
	function(){
	},
	function(){
	    oLoginTimer = setTimeout(function(){loginFadeOut();},500);
	}
  );

  $("div#Loginbox").hover(
	function(){
		clearTimeout(oLoginTimer);
	},
	function(){
		oLoginTimer = setTimeout(function(){loginFadeOut();},500);
	}
  );
	
	
})

