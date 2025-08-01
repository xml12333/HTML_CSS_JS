$( document ).ready(function() {
    $('#view-controller img').on('click', function(){
      $('#view-controller').find('img.active').removeClass('active');
      $(this).addClass('active');
      $('body').removeClass().addClass($(this).attr('data-id'));
    });
});