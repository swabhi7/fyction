$(document).ready(function(){

  $('.full').hide();

  $('.deleteFanTheory').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/fanTheories/delete/' + id,
      success: function(responce){
        alert('Deleting fanTheory');
        window.location.href = '/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  $('.readMoreBtn').on('click', function(e){
    $target = $(e.target);
    let id = $target.attr('data-id');
    id--;
    if($target.html() === 'Read more'){
      $('.half' + id).hide();
      $('.full' + id).show();
      //alert('' + $(this).html());
      $(this).html('Read less');
      //alert('' + $(this).html());
    }
    else{
      $('.full' + id).hide();
      $('.half' + id).show();
      $(this).html('Read more');
    }

  });

  $('.readLessBtn').on('click', function(e){
    $('.full').hide();
    $('.half').show();
  });

});
