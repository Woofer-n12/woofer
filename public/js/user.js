'use strict';

$(function(){
  let ok = $('#something').html();
  localStorage.setItem('userId', JSON.stringify(ok));
});
