var nameSurname,password,phone,email,pak,paymentAddress,loginAs,errors;

window.onload = function () {
  document.cookie = "PHPSESSID=; expires=Thu, 18 Dec 2013 12:00:00 UTC;path=/;";
  nameSurname = document.querySelector("#nameSurname");
  password = document.querySelector("#password");
  phone = document.querySelector("#phone");
  email = document.querySelector("#email");
  pak = document.querySelector("#pak");
  paymentAddress = document.querySelector("#paymentAddress");
  errors = [true,true,true,true,true,true];
};

function resetArrow(){
	$(".loginMenu").css({display: 'none'});
	$("#login").addClass("upArrow");
	$("#login").removeClass("downArrow");
}

function showLogin(){
	$(".loginMenu").css({display: 'block'});
	$("#login").removeClass("upArrow");
	$("#login").addClass("downArrow");
}

function showRegistrationMenu(){
	$("#registrationMenu").css({display: 'block'});
		$("html").css({overflow: 'hidden'});
}
function hideRegistrationMenu(){
	$("#registrationMenu").css({display: 'none'});
	$("html").css({overflow: 'auto'});
}

function checkNS() {
  if (RegExp("^([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-z]{1,15})\\s(([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-z]){1,15}\\s?){1,3}$").test(nameSurname.value) && nameSurname.value !== ""){
    nameSurname.style.border = "2px solid green";
	errors[0] = false;
  }
  else {
	alert("Формат поља 'Име и презиме': <1-15 карактера>_<1-15 карактера+_>(1-3 пута)!");
	nameSurname.style.border = "2px solid red";
    errors[0] = true;
  }
}

function checkPass() {
  if (RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$").test(password.value) && password.value !== ""){
    password.style.border = "2px solid green";
	errors[1] = false;
  }
  else {
	alert("Формат поља 'Лозинка': минимум 8 карактера и барем 1 велико, 1 мало слово и 1 број!");
	password.style.border = "2px solid red";
    errors[1] = true;
  }
}


function checkPhone() {
  if (RegExp("^(\\+381|0)[0-9]{2}[0-9]{7}$").test(phone.value) && phone.value !== ""){
    phone.style.border = "2px solid green";
	errors[2] = false;
  }
  else {
	alert("Формат поља 'Телефон': број телефона Републике Србије (+381 или 0 на почетку) без цртица!");
    phone.style.border = "2px solid red";
    errors[2] = true;
  }
}


function checkEmail() {
  if (RegExp("^(([^<>()\\[\\]\\\.,;:\\s@\\вЂќ]+(\.[^<>()\\[\\]\\\.,;:\\s@\\вЂќ]+)*)|(\\вЂќ.+\\вЂќ))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$").test(email.value) && email.value !== ""){
    email.style.border = "2px solid green";
	errors[3] = false;
  }
  else {
	alert("Формат поња 'Е-мејл': <...>@<...>.<??>!");
    email.style.border = "2px solid red";
    errors[3] = true;
  }
}

function checkPAK() {
  if (RegExp("^\\d{6}$").test(pak.value) && pak.value !== ""){
    pak.style.border = "2px solid green";
	errors[4] = false;
  }
  else {
	alert("Формат поња 'ПАК': 6-цифрени број!");
    pak.style.border = "2px solid red";
    errors[4] = true;
  }
}

function checkPaymentAddress(){
	var isCorrect;
	if(paymentAddress.value === ""){
		alert("Нисте попунили адресу за плаћање!");
		paymentAddress.style.border = "2px solid red";
		errors[5] = true;
		return;
	}
		
	if(document.querySelector("input[type='radio']:checked")!=null){
		switch(document.querySelector("input[type='radio']:checked").value){
			case "MasterCard": isCorrect = (RegExp("^(2|5)[1-5][0-9]{14}$").test(paymentAddress.value)); break;
			case "Visa": isCorrect = (RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?)$").test(paymentAddress.value)); break;
			case "American Express": isCorrect = (RegExp("^(?:3[47][0-9]{13})$").test(paymentAddress.value)); break;
			case "Bitcoin": isCorrect = (RegExp("^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$").test(paymentAddress.value)); break;
			case "Ethereum": isCorrect = (RegExp("^0x[a-fA-F0-9]{40}$").test(paymentAddress.value)); break;
			case "Monero": isCorrect = (RegExp("^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$").test(paymentAddress.value)); break;
			default: isCorrect = false;
		}
	}
	
	if(isCorrect){
		paymentAddress.style.border = "2px solid green";
		errors[5] = false;
	}
	else {
		alert("Нисте исправно попунили адресу за плаћање! Адреса се уноси без размака!");
		paymentAddress.style.border = "2px solid red";
		errors[5] = true;
	}
}

function submitForm() {
	
  checkNS();
  checkPass();
  checkPhone();
  checkEmail();
  checkPAK();
  checkPaymentAddress();
	
  for(var i = 0; i < errors.length; i++){
	if(errors[i])
		return;
  }
	
  var subscription = "";
  if(document.querySelector("input[type='checkbox']:checked") === null) subscription = "&wantsToBeSubscribed=false";

  $.ajax({
	  type: "POST",
	  data: $("#registration").serialize() + subscription,
	  url: "Scripts/registration.php",
	  success: function(response){
		  alert("Успешно сте се регистровали!");
		  hideRegistrationMenu();
	  },
	  error: function(response){
		  alert(response);
	  }
  });
}

function resetForm(){
	nameSurname.style.border = "none";
	password.style.border = "none";
	phone.style.border = "none";
	email.style.border = "none";
	pak.style.border = "none";
	paymentAddress.style.border = "none";
	document.querySelector("#registration").reset();
}

function login(){
	document.querySelector("input[type='radio']:checked")==null ? loginAs = '' : loginAs = document.querySelector("input[type='radio']:checked").value;
	$.ajax({
	  type: "POST",
	  data: "email=" + document.querySelector("#email_login").value + "&password=" + document.querySelector("#password_login").value + "&loginAs=" + loginAs,
	  url: "Scripts/login.php",
	  success: function(response){
		  document.querySelector("#response").innerHTML = response;
		  if(response.includes("Успешно сте се улоговали!") && loginAs=="customer")
		  	window.location.replace("customer.html");
		  else if(response.includes("Успешно сте се улоговали!") && loginAs=="employee")
		  	window.location.replace("employee.html");
	  },
	  error: function(response){
		  alert(response);
	  }
  });
}