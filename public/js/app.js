'use strict';


$(function(){
  if (localStorage.getItem('userId')){
    console.log(localStorage.getItem('userId'));
    $('#unameit').attr('value', JSON.parse(localStorage.getItem('userId')))
  }else{
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
$('#wooflistformsubmit').on('click', ()=>{
  console.log('click!');
  console.log(JSON.parse(localStorage.getItem('userId')));
  $('#lsun').attr('value',`${JSON.parse(localStorage.getItem('userId'))}`);
  $('#wooflistformform').click();
})

