'use strict';
$(function(){
  if (!localStorage.getItem('userId')){
    console.log('hello');
    // $.get('http://localhost:8000/user').then(console.log).catch(console.error);
    $('#checkU').hide();
    $('#checkU').click();
  }

});

$('#search-button').on('click', function(){
  console.log('++++button clicked+++++');
});

//========================call wooflist===============================
$('#wooflist').on('click', ()=>{
  console.log('getting wooflist');
  let uid= JSON.parse(localStorage.getItem('userId'));
  $.post('/woof-list', {userId:`${uid}`});
})

