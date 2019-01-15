/**
 * jTinder initialization
 */
$('#tinderslide').jTinder({
  // dislike callback
  onDislike: function (item) {
    // set the status text
    console.log(item[0].classList[1]);
    
    $('#status').html('Dislike image ' + (item.index()+1));
  },
  // like callback
  onLike: function (item) {
    // set the status text
    console.log(item[0].classList[1]);
    console.log(('look at me', item));
    $('#status').html('Like image ' + (item.index()+1));
  },
  animationRevertSpeed: 200,
  animationSpeed: 400,
  threshold: 1,
  likeSelector: '.like',
  dislikeSelector: '.dislike'
});

function onSwipe(item){
  $(`.${item[0].classList[1]}`).show();
}

//======================SAVE STUFF FOR DB INSERTION=================================

//=====================================================================================
/**
 * Set button action to trigger jTinder like & dislike.
 */
$('.actions .like, .actions .dislike').click(function(e){
  e.preventDefault();
  $('#tinderslide').jTinder($(this).attr('class'));
});
