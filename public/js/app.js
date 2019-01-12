'use strict';
$(function(){
  if (!localStorage.getItem('userId')){
    console.log('hello');
    $.get('http://localhost:8000/user').catch(console.error);
  }

});
$('#something').on('click', function(){
  console.log('++++button clicked+++++');
});

// if (!localStorage.getItem('userId')){
//   $.get('http://localhost:8000/something').then(console.log).catch(console.error);
// }

