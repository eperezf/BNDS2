$(document).ready(()=>{
})

function setModal(id, brand, model, variant){
  console.log(id);
  $('#deleteButton').attr('href','/admin/smartphones/delete/'+id)
  $('#phoneName').text(brand + " " + model + " " + variant)
}
