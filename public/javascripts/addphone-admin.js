

$(document).ready(()=>{
  brand = $('#brand').val()
  model = $('#model').val()
  variant = $('#variant').val()
  changeTitle()

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

  $("[id^=freq]").on('change',function(){
    card = $(this).parent().parent().parent()
    modCard(card, $(this).val());
  })

  $("[id^=tech]").on('change',function(){
    card = $(this).parent().parent().parent()
    modCard(card, $(this).val());
  })
})

function modCard(card, value){
  if (value == 'true') {
    card.removeClass('border-success')
    card.removeClass('border-danger')
    card.removeClass('border-secondary')
    card.addClass('border-success')

    card.find(".card-header").removeClass("bg-success")
    card.find(".card-header").removeClass("bg-danger")
    card.find(".card-header").removeClass("bg-secondary")
    card.find(".card-header").removeClass("text-white")
    card.find(".card-header").addClass("bg-success")
    card.find(".card-header").addClass("text-white")
  }
  if (value == 'false') {
    card.removeClass('border-success')
    card.removeClass('border-danger')
    card.removeClass('border-secondary')
    card.addClass('border-danger')

    card.find(".card-header").removeClass("bg-success")
    card.find(".card-header").removeClass("bg-danger")
    card.find(".card-header").removeClass("bg-secondary")
    card.find(".card-header").removeClass("text-white")
    card.find(".card-header").addClass("bg-danger")
    card.find(".card-header").addClass("text-white")
  }
  if (value == 'unknown') {
    card.removeClass('border-success')
    card.removeClass('border-danger')
    card.removeClass('border-secondary')
    card.addClass('border-secondary')

    card.find(".card-header").removeClass("bg-success")
    card.find(".card-header").removeClass("bg-danger")
    card.find(".card-header").removeClass("bg-secondary")
    card.find(".card-header").removeClass("text-white")
    card.find(".card-header").addClass("bg-secondary")
    card.find(".card-header").addClass("text-white")
  }
}
