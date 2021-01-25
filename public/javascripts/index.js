$(document).ready(()=>{
  $('#searchForm').submit(function(event) {
    if (!grecaptcha.getResponse()) {
      event.preventDefault();
      grecaptcha.execute();
    }
  });
  onCompleted = function() {
    $('#searchForm').submit();
  }
})
