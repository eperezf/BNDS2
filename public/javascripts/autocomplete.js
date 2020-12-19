$(document).ready(()=>{
  let delay = null;
  $('#smartphone').on('input', (event) => {
    clearTimeout(delay)
    if ($('#smartphone').val() != "") {
      delay = setTimeout(()=>{
          string = $('#smartphone').val();
          var request = new Request('/api/autocomplete/' + string);
          fetch(request).then(function(response){return response.json();}).then(function(res){
            if ($('#suggestions').length == 0) {
              $('.autocomplete').append('<ul class="list-group mt-2" id="suggestions" ></ul>')
            }
            $('#suggestions').empty();
            if (!res.suggestions[0]) {
              $('#suggestions').append('<li class="list-group-item">No encontramos el teléfono que buscabas.</br><button class="btn btn-primary mt-2" formaction="agregar" role="button">Agregar teléfono</a></li>')
            }
            res.suggestions.forEach((item, i) => {
              $('#suggestions').append('<li class="list-group-item list-group-item-action" style="cursor:pointer;" id='+i+'>'+item.fullName+'</li>')
              $( "#"+i ).click(function() {
                $('#smartphone').val($( "#"+i ).text())
                $('.autocomplete').empty();
              });
            });

          });
      }, 250)
    }
    else {
      $('.autocomplete').empty();
    }
  })
})
