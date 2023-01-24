// Get nowpayments API status
document.getElementById('crypto').addEventListener('click', function (e) {
  console.log('Yes we re goood to go222 ');
})


var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("https://api.nowpayments.io/v1/status", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => {
  if (error) {
    document.getElementById('buyWithCrypto').addEventListener('click', function (e) {
      console.log('Yes we re goood to go ');
    })
  }});
//.catch(error => console.log('error', error));

document.getElementById('submit').addEventListener('click', function (e){
    
    //show spinner
    let spinner = document.querySelector('#loader');
    spinner.className = "spinner-border spinner-border-sm";
  
    });
    //fadeout alart
    setTimeout(function() {
      $('#Alart' && '#Alart2').fadeOut('fast');
    }, 2000); 

  // handling paypal button

  

