$(document).ready(function(){

  $('.full').hide();
  $('#filterOptions').hide();

  $('#filter').on('click', function(e){
    $('#filterOptions').toggle();
  });

  $('.deleteFanTheory').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    const userid = $target.attr('data-userid');
    $.ajax({
      type: 'DELETE',
      url: '/fanTheories/delete/' + id,
      success: function(responce){
        alert('Deleting fanTheory');
        window.location.href = '/users/profile/' + userid;
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  $('.deleteFanFiction').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    const userid = $target.attr('data-userid');
    $.ajax({
      type: 'DELETE',
      url: '/fanFictions/delete/' + id,
      success: function(responce){
        alert('Deleting fanFiction');
        window.location.href = '/users/profile/' + userid;
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  $('.deleteFanArt').on('click', function(e){
    console.log('reached main');
    $target = $(e.target);
    const id = $target.attr('data-id');
    const userid = $target.attr('data-userid');
    $.ajax({
      type: 'DELETE',
      url: '/fanArts/delete/' + id,
      success: function(responce){
        alert('Deleting fanFiction');
        window.location.href = '/users/profile/' + userid;
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

  $(function() {
    // for bootstrap 3 use 'shown.bs.tab', for bootstrap 2 use 'shown' in the next line
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        // save the latest tab; use cookies if you like 'em better:
        localStorage.setItem('lastTab', $(this).attr('href'));
    });

    // go to the latest tab, if it exists:
    var lastTab = localStorage.getItem('lastTab');
    if (lastTab) {
        $('[href="' + lastTab + '"]').tab('show');
    }
});

});
