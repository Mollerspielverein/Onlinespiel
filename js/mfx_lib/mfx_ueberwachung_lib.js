

function mfx_protokoll() {
  n=oMfxQueue.get_queue();
  m=oMfxQueue.show_queue();
  $("#mfx_protokoll").empty();
  $("#mfx_protokoll").append("<p>"+n.length+"</p>");
  $("#mfx_protokoll").append("<p>"+m+"</p>");
  setTimeout(mfx_protokoll, 10);
}


