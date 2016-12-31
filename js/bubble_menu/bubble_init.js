// Gegnerlinks
  // Allgemeine Konfiguration
  $("#gegnerlinks_ueberschrift > ul").circleMenu({
    item_diameter: 50,
    circle_radius: 90,
    angle:{start:-15, end:125},
    delay: 100,
    speed: 500,
    'transition_function': 'ease-in-out',
    trigger: 'click',
    close:function() {
      $('#gegnerlinks_userbox_menu, #gegnerlinks_userbox_menu li').removeClass('submenu_opened');
    },
  });
  // Avatar (root) click
  $('#gegnerlinks_ueberschrift .userbox_bild, #gegnerlinks_ueberschrift .userbox_name').click(function() {
    if ($("#gegnerlinks_userbox_menu").hasClass("circleMenu-open")) {
      $('#gegnerlinks_userbox_menu').circleMenu('close');
    }
    else if ($("#gegnerlinks_userbox_menu").hasClass("circleMenu-closed")) {
      $('#gegnerlinks_userbox_menu').circleMenu('open');
    };
  });
  // Submenu Gruss click
  $('#gegnerlinks_userbox_submenu_gruss > li:first-child').click(function() {
    $('#gegnerlinks_userbox_submenu_gruss').closest('li').addClass('submenu_opened');
    $('#gegnerlinks_userbox_menu').addClass('submenu_opened');
  });
  // Submenu Bitte click
  $('#gegnerlinks_userbox_submenu_bitte > li:first-child').click(function() {
    $('#gegnerlinks_userbox_submenu_bitte').closest('li').addClass('submenu_opened');
    $('#gegnerlinks_userbox_menu').addClass('submenu_opened');
  });


// Gegnerrechts
  // Allgemeine Konfiguration
  $("#gegnerrechts_ueberschrift > ul").circleMenu({
    item_diameter: 50,
    circle_radius: 90,
    angle:{start:105, end:270},
    delay: 0,
    speed: 500,
    'transition_function': 'ease',
    trigger: 'click',
    step_in:0,
    step_out:0,
    close:function(){},
    select:function(evt,item){
      if(item.hasClass("submenue_gruss")){
        $('#gegnerrechts_userbox_submenu_gruss').circleMenu('open');
      } else if(item.hasClass("submenue_bitte")){
        $('#gegnerrechts_userbox_submenu_bitte').circleMenu('open');
      } else if(item.hasClass("submenue_du")){
        $('#gegnerrechts_userbox_submenu_du').circleMenu('open');
      }
      //$('#gegnerrechts_userbox_menu').circleMenu('close');
    }
  });

/*

Die Klicks zum starten der Untermenüs müssen aktiviert werden
wenn, ein Untermenü angeklickt wurde muss es wieder deaktiviert werden.

*/

  // Aktiviert das öffnen des Menüs durch Klicken auf Avatarbild und Name
  $('#gegnerrechts_ueberschrift .userbox_bild, #gegnerrechts_ueberschrift .userbox_name').click(function() {
  
   /*alert($("#gegnerrechts_userbox_submenu_gruss").hasClass("circleMenu-open") +" "+
        $("#gegnerrechts_userbox_submenu_bitte").hasClass("circleMenu-open")  +" "+
        $("#gegnerrechts_userbox_submenu_du").hasClass("circleMenu-open"));*/

      if(!$("#gegnerrechts_userbox_submenu_gruss").hasClass("circleMenu-open") &&
        !$("#gegnerrechts_userbox_submenu_bitte").hasClass("circleMenu-open") &&
        !$("#gegnerrechts_userbox_submenu_du").hasClass("circleMenu-open")  ){

          if ($("#gegnerrechts_userbox_menu").hasClass("circleMenu-open")) {
            $('#gegnerrechts_userbox_menu').circleMenu('close');
          }
          else {//Hier darf nix stehen, weil er nicht zuverlässig -close anhängt
            $('#gegnerrechts_userbox_menu').circleMenu('open');
          };
      } else { //Wenn ein Untermenü offen ist, wird dies hier geschlossen
          if($("#gegnerrechts_userbox_submenu_gruss").hasClass("circleMenu-open")) {
            $('#gegnerrechts_userbox_submenu_gruss').circleMenu('close');
          } else if($("#gegnerrechts_userbox_submenu_bitte").hasClass("circleMenu-open")) {
            $('#gegnerrechts_userbox_submenu_bitte').circleMenu('close');
          } else if($("#gegnerrechts_userbox_submenu_du").hasClass("circleMenu-open")) {
            $('#gegnerrechts_userbox_submenu_du').circleMenu('close');
          }
      }
  });

//Aktiviert dass öffenen des Grussmenüs durch klicken auf die Grußbutton
/*
  $('#gegnerrechts_userbox_menu li.submenue_gruss a').click(function() {
      //$('#gegnerrechts_userbox_menu').circleMenu('close');
      $('#gegnerrechts_userbox_submenu_gruss').css("display","block").circleMenu('open');
  });
*/


