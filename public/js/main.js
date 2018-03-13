$(document).ready(function(){
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
});
