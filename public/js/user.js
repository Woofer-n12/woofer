'use strict';

$(function(){
  console.log('indx2');
  let ok = $('#something').html();
  localStorage.setItem('userId', JSON.stringify(ok));
});
