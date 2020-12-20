

$(document).ready(()=>{

  $('#addPhoneForm').submit(function(event) {
        console.log('form submitted.');

        if (!grecaptcha.getResponse()) {
            console.log('captcha not yet completed.');

            event.preventDefault(); //prevent form submit
            grecaptcha.execute();
        } else {
            console.log('form really submitted.');
        }
    });

    onCompleted = function() {
        console.log('captcha completed.');
        $('#addPhoneForm').submit();
        alert('wait to check for "captcha completed" in the console.');
    }

  brand = ""
  model = ""
  variant = ""
  $("#brand").on('input',(event)=>{
    brand = $('#brand').val()
    changeTitle();
  })

  $("#model").on('input',(event)=>{
    model = $('#model').val()
    changeTitle();
  })

  $("#variant").on('input',(event)=>{
    variant = $('#variant').val()
    changeTitle();
  })


  function changeTitle(){
    $('#fullName').text(brand+" "+model+" "+variant)
  }

  $("[id^=frequency]").on('change',function(){
    card = $(this).parent().parent().parent()
    console.log($(this).val());
    if ($(this).val() == 'true') {
      card.removeClass('border-success')
      card.removeClass('border-warning')
      card.removeClass('border-secondary')
      card.addClass('border-success')
    }
    if ($(this).val() == 'false') {
      card.removeClass('border-success')
      card.removeClass('border-warning')
      card.removeClass('border-secondary')
      card.addClass('border-warning')
    }
    if ($(this).val() == 'unknown') {
      card.removeClass('border-success')
      card.removeClass('border-warning')
      card.removeClass('border-secondary')
      card.addClass('border-secondary')
    }

  })

  $("[id^=technology]").on('change',function(){
    card = $(this).parent().parent().parent()
    console.log($(this).val());
    if ($(this).val() == 'true') {
      card.removeClass('border-success')
      card.removeClass('border-warning')
      card.removeClass('border-secondary')
      card.addClass('border-success')
    }
    if ($(this).val() == 'false') {
      card.removeClass('border-success')
      card.removeClass('border-warning')
      card.removeClass('border-secondary')
      card.addClass('border-warning')
    }
    if ($(this).val() == 'unknown') {
      card.removeClass('border-success')
      card.removeClass('border-warning')
      card.removeClass('border-secondary')
      card.addClass('border-secondary')
    }

  })
})
