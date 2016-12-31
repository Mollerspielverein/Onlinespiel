//*****************
// MUSIKPLAYER
//*****************

$(document).ready(function(){

  new jPlayerPlaylist({
    jPlayer: "#jquery_jplayer_1",
    cssSelectorAncestor: "#jp_container_1"
  }, [
    {
      title:"Lucky",
      mp3:"/fileadmin/Musik/lucky.mp3",
      oga:"/fileadmin/Musik/lucky.ogg"
    },
    {
      title:"Lucky_2",
      mp3:"/fileadmin/Musik/lucky.mp3",
      oga:"/fileadmin/Musik/lucky.ogg"
    },
    {
      title:"Lucky_3",
      mp3:"/fileadmin/Musik/lucky.mp3",
      oga:"/fileadmin/Musik/lucky.ogg"
    },
    {
      title:"Poker Face",
      mp3:"/fileadmin/Musik/poker_face.mp3",
      oga:"/fileadmin/Musik/poker_face.ogg"
    }
  ], {
    swfPath: "/fileadmin/design/ep/js/musik",
    supplied: "oga, mp3",
    wmode: "window",
    smoothPlayBar: true,
    keyEnabled: true
  });

  /*$("#jplayer_inspector_1").jPlayerInspector({jPlayer:$("#jquery_jplayer_1")});*/
  
  
  /* Shuffle at beginning */
  $("a.jp-shuffle").click();
  
  
  
  /* Hide and show Volume-bar */
  var oTimer;
  
  function volumeBarFadeOut(){
    $("div.jp-volume-bar").fadeOut();
  }
  
  $("div.jp-volume-bar").css("display","none");
  $("a.jp-mute").hover(function(){
    $("div.jp-volume-bar").fadeIn();
  clearTimeout(oTimer);
  },
  function(){
    oTimer = setTimeout(function(){volumeBarFadeOut();},1500);
  });

  $("div.jp-volume-bar").hover(function(){
    clearTimeout(oTimer);
  },
  function(){
    oTimer = setTimeout(function(){volumeBarFadeOut();},1500);
  });

  
});