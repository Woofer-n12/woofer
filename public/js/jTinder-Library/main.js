/**
 * jTinder initialization
 */
$(function(){

  var x=$('.thisss');
  let counter=x.length-1;

  $('#tinderslide').jTinder({
  // dislike callback
    onDislike: function (item) {
      console.log(('#tinderslide').jTinder);
      // set the status text
      console.log(item[0].classList[1]);
      onSwipe(item);
      $('#status').html('Dislike image ' + (item.index()+1));
    },
    // like callback
    onLike: function (item) {
    // set the status text
    console.log(item[0].classList[1]);
    onSwipe(item);
    $('#status').html('Dislike image ' + (item.index()+1));
    let userID= JSON.parse(localStorage.getItem('userId'));
    $.post('/dogviewed',{userId:`${userID}`, dogId:`${item[0].classList[1]}`});
  },
  // like callback
  onLike: function (item) {
    // set the status text
    onSwipe(item);
    console.log(item[0].classList[1]);
    $('#status').html('Like image ' + (item.index()+1));
    let userID= JSON.parse(localStorage.getItem('userId'));
    $.post('/likedog',{userId:`${userID}`, dogId:`${item[0].classList[1]}`});
  },
  animationRevertSpeed: 200,
  animationSpeed: 400,
  threshold: 1,
  likeSelector: '.like',
  dislikeSelector: '.dislike'
});

$('.dogShow-detailForm-div').hide();
$('.toggle').on('click',()=>{
  $(`#${x[counter].value}`).toggle();
})

function onSwipe(item){
  $(`.${item[0].classList[1]}`).show();
  $(`#${x[counter].value}`).hide();
  counter--;
}

//======================SAVE STUFF FOR DB INSERTION=================================
  //=====================================================================================
  /**
 * Set button action to trigger jTinder like & dislike.
 */
  $('.actions .like, .actions .dislike').click(function(e){
    e.preventDefault();
    console.log('look', $(this).attr('class'));
    $('#tinderslide').jTinder($(this).attr('class'));
  });

});
