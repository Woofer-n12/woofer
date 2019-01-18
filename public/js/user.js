'use strict';

$(function(){
  console.log('indx2');
  let ok = $('#something-else').html();
  localStorage.setItem('userId', JSON.stringify(ok));
});
