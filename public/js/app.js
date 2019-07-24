$( document ).ready();

$( '.editDeets' ).on('click', event => {
  const $id = $( event.target );
  const value = $id.val();
  $(`#${value}`).toggleClass('hide');
})

