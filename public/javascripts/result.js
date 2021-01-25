$(document).ready(()=>{
  $('#repeatForm').submit(function(event) {
    if (!grecaptcha.getResponse()) {
      event.preventDefault();
      grecaptcha.execute();
    }
  });
  onCompleted = function() {
    $('#repeatForm').submit();
  }
})
