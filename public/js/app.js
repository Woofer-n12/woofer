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

if (!localStorage.getItem('userId')){
  $.get('http://localhost:8000/something').then(console.log).catch(console.error);
}

