var pricesBEM = Array(3);

window.onload = function (){
	$.ajax({
			type: "GET",
			url: "https://api.coinlore.net/api/ticker/?id=90",
			success: function(response){
				pricesBEM[0]=response[0]["price_usd"];
			}
		})
	$.ajax({
			type: "GET",
			url: "https://api.coinlore.net/api/ticker/?id=80",
			success: function(response){
				pricesBEM[1]=response[0]["price_usd"];
			}
		})
	$.ajax({
			type: "GET",
			url: "https://api.coinlore.net/api/ticker/?id=28",
			success: function(response){
				pricesBEM[2]=response[0]["price_usd"];
				$.ajax({
					type: "GET",
					url: "https://free.currconv.com/api/v7/convert?q=USD_RSD&compact=ultra&apiKey=8c5f98f6a02de20e88b1",
					success: function(response){
						if(response["USD_RSD"]!=null){ //u slučaju da server nije dostupan ili isteka API ključa
							pricesBEM[0] = Math.round(pricesBEM[0]*response["USD_RSD"]);
							pricesBEM[1] = Math.round(pricesBEM[1]*response["USD_RSD"]);
							pricesBEM[2] = Math.round(pricesBEM[2]*response["USD_RSD"]);
						}
						else {
							pricesBEM[0] = Math.round(pricesBEM[0]*response["USD_RSD"]);
							pricesBEM[1] = Math.round(pricesBEM[1]*response["USD_RSD"]);
							pricesBEM[2] = Math.round(pricesBEM[2]*response["USD_RSD"]);
						}
					}
				})
			}
		})
	
	$.ajax({
		type: "POST",
		url: "Scripts/customer.php",
		data: {"function_id":"1"},
		success: function(response){
			document.querySelector("#logout").innerHTML = response.substring(0,response.indexOf('\n'));
			if(document.querySelector("#logout").innerHTML == '' || document.referrer.includes("index.php"))
				window.location.replace(response.substring(response.indexOf("!")+1));
		}
	})

	if(getParameterByName('cart')){
		document.querySelector(".mainContent").innerHTML = 'Садржај ваше корпе је:<br><br><div id="cart"></div><br><br>';
		$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"3"},
			success: function(response){
				var jsonData = JSON.parse(response);

				document.querySelector("#cart").innerHTML = "<table class='t_products'><thead><th>Слика:</th><th>Назив:</th><th>Врста:</th><th>Јединична цена:</th><th>Поручена количина:</th><th>Укупна цена:</th><th></th></tr></thead><tbody>";
				if(jsonData.length == 0) document.querySelector(".t_products > tbody").innerHTML = '<tr id="empty_cart"><td colspan="7">КОРПА ЈЕ ПРАЗНА!</td></tr>'
				for(var i = 0; i < Object.keys(jsonData).length; i++){
					var product_type;

					switch(jsonData[Object.keys(jsonData)[i]]["Врста:"]){
							case "solarPanel": product_type = "Соларни панел"; break;
							case "battery": product_type = "Акумулатор"; break;
							case "windTurbine": product_type = "Ветрогенератор"; break;
							case "electricVehicle": product_type = "Електрично возило"; break;
							case "controller": product_type = "Контролер пуњења акумулатора"; break;
							case "inverter": product_type = "Инвертер DC/AC"; break;
						}
					
					document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_" + Object.keys(jsonData)[i] + ">";
					
					document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += '<td><img alt="'+jsonData[Object.keys(jsonData)[i]][1]+'" src="images/products/'+jsonData[Object.keys(jsonData)[i]]["Слика:"]+'">';
					document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + jsonData[Object.keys(jsonData)[i]]["Назив:"] + "</td>";
					document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + product_type + "</td>";
					document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += '<td id="tr_p_price_' + Object.keys(jsonData)[i] + '">' + jsonData[Object.keys(jsonData)[i]]["Јединична цена:"] + '</td>';
					document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += '<td><input type="number" id="tr_p_amount_' + Object.keys(jsonData)[i]+'" value="'+jsonData[Object.keys(jsonData)[i]]["Поручена количина:"]+'" onchange="updateAmount('+Object.keys(jsonData)[i]+')" min="1"></td>';
					document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += '<td id="tr_p_total_' + Object.keys(jsonData)[i]+ '">' + jsonData[Object.keys(jsonData)[i]]["Јединична цена:"] * document.querySelector("#tr_p_amount_"+Object.keys(jsonData)[i]).value + '</td>';
					document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += '<td><button type="button" class="dropProduct" onclick="dropProduct(' + Object.keys(jsonData)[i] + ');"></button><div hidden id="tr_p_id_' + Object.keys(jsonData)[i]+ '">'+Object.keys(jsonData)[i]+'</div></td>';
					
					document.querySelector(".t_products > tbody").innerHTML += "</tr>";
				}
			}
		})
		
		document.querySelector(".mainContent").innerHTML += '<div id="cartBtns"><button type="button" id="checkOutBtn" onclick="checkout();">Наставите са плаћањем</button><button type="button" id="emptyCartBtn" onclick="dropCart();">Изпразните корпу</button></div><br><br><div id="checkout"></div>';
	}
	
	if(getParameterByName('orders')){
		document.querySelector(".mainContent").innerHTML = 'Листинг поруџбина<br><br><div id="table_1"></div><br><br><div id="table_2"></div><br><br>';
		$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"11"},
			success: function(response){
				var jsonData = JSON.parse(response);
				var keys = ["Обрађивач:", "Купац:"];
				var status = '';
				var payVia = '';
				document.querySelector("#table_1").innerHTML = "<table class='t_orders'><thead><th>Обрађивач:</th><th>Купац:</th><th>Начин плаћања:</th><th>Статус:</th></tr></thead><tbody>";
								
				for(var i = 0; i < Object.keys(jsonData).length; i++){ //Object.keys(jsonData) stores order ids
					document.querySelector(".t_orders > tbody").innerHTML += "<tr id=tr_o_" + Object.keys(jsonData)[i] + ">";
					for(var j = 0; j < keys.length; j++){
						document.querySelector("#tr_o_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + jsonData[Object.keys(jsonData)[i]][keys[j]] + "</td>";
					}
					switch(jsonData[Object.keys(jsonData)[i]]["Статус:"]){
						case "ORDERED": status = 'НАРУЧЕНО'; break;
						case "SHIPPED": status = 'ПОСЛАТО'; break;
						case "CANCELED": status = 'ОТКАЗАНО'; break;
						case "DELIVERED": status = 'ИСПОРУЧЕНО'; break;
						case "RETURNED": status = 'ВРАЋЕНО'; break;	
					} 
					if(jsonData[Object.keys(jsonData)[i]]["Начин плаћања:"][0]==null) payVia = "Кешом"
					else payVia = jsonData[Object.keys(jsonData)[i]]["Начин плаћања:"][0] + " ("+jsonData[Object.keys(jsonData)[i]]["Начин плаћања:"][1]+")";
					document.querySelector("#tr_o_" + Object.keys(jsonData)[i]).innerHTML += '<td>' + payVia + '</td>';
					document.querySelector("#tr_o_" + Object.keys(jsonData)[i]).innerHTML += '<td>' + status + '<button type="button" class="getProducts" onclick="getOrderProducts(' + Object.keys(jsonData)[i] + ');"></button></td>';
					document.querySelector(".t_orders > tbody").innerHTML += "</tr>";
				}
			}
		})
	}
	
	if(getParameterByName('custData')){
		document.querySelector(".mainContent").innerHTML = '<br><br><div id="table_1"></div><div id="table_2"></div><br><br>';
		$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"9"},
			success: function(response){
				var jsonData = JSON.parse(response);
				var keys = ["Име и презиме:","Е-мајл адреса:","Број телефона:","ПАК:"];
				document.querySelector("#table_1").innerHTML = "<table class='t_data'><thead><tr><th colspan=2>Подаци о кориснику</th></tr></thead><tbody>";
				document.querySelector("#table_2").innerHTML = "<table class='t_paymentData'>Подаци о начинима плаћања корисника<br><br><thead><tr><th>Врста плаћања</th><th>Адреса плаћања</th><th></th></tr></thead><tbody>";
				
					for(var j = 0; j < keys.length; j++){
						
						var input_textbox = '<input required="" type="text" value="' +  jsonData[keys[j]] + '" id="customer_' + j + '"></div>';
						document.querySelector(".t_data > tbody").innerHTML += "<tr id=tr_d_" + j + "><td>" + keys[j] + "</td><td>" + input_textbox + "</td>";
					}
					
					document.querySelector(".t_data > tbody").innerHTML += '<tr id=tr_d_6><td>Нова лозинка:</td><td><input required="" type="password" id="customer_6"></td>';
				
					var input_dropdown  = '<select id="customer_5" name="customer_5" style="width:100%"><option value="Да"';
					if(jsonData["Претплаћен на новости:"]=="ДА") input_dropdown += ' selected>Да</option><option value="Не">Не</option></select></div>';
					else input_dropdown += '>Да</option><option value="Не" selected>Не</option></select></div>';
				
					document.querySelector(".t_data > tbody").innerHTML += '<tr id=tr_d_4><td>Има ВИП статус:</td><td>' + jsonData["Има ВИП статус:"] + '</td>';
				
					document.querySelector(".t_data > tbody").innerHTML += '<tr id=tr_d_4><td>Претплаћен на новости:</td><td>' + input_dropdown + '</td>';
				
					document.querySelector("#table_1").innerHTML += '<br><div class="input"><button type="button" id="customers_7" 		onclick="updateCustomer();">Промени податке</button></div><br><br>';
				
					for(var k = 0; k < jsonData["payment_ids"].length; k++){
						document.querySelector(".t_paymentData > tbody").innerHTML += '<tr id=tr_pd_'+jsonData["payment_ids"][k]+'><td>'+jsonData[jsonData["payment_ids"][k]]["Врста плаћања:"]+'</td><td>'+jsonData[jsonData["payment_ids"][k]]["Адреса плаћања:"]+'</td><td><button type="button" class="deletePayment" onclick="deletePayment(' + jsonData["payment_ids"][k] + ');"></button></td></tr>';
					}
				
					document.querySelector(".t_paymentData > tbody").innerHTML += '<tr id=tr_pd_0><td><select id="newPaymentType"><option value="MasterCard" selected="">MasterCard</option><option value="Visa">Visa</option><option value="American Express" >American Express</option><option value="Bitcoin">Bitcoin</option><option value="Ethereum">Ethereum</option><option value="Monero">Monero</option></select></td><td><input type="text" id="newPaymentAddress" name="newPaymentAddress" onchange="checkNewPaymentAddress()"></td><td><button type="button" class="addPayment" onclick="addNewPayment();"></button></td></tr>';
				}
		})
	}
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function logout(){
	var save = confirm("Да ли желите да сачувате где сте стали (сесију)?");
	
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"2","save":save, "lastURL":window.location.href},
			success: function(response){
				if(response.includes("FINISHED"))
					window.location.replace("index.php");
			}
		})
}

function dropProduct(product_id){
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"4","product_id":product_id},
			success: function(response){
				alert(response);
				window.location.replace(window.location);
			}
		})
}

function updateAmount(product_id){
	var totalCost = parseInt(document.querySelector("#tr_p_price_"+product_id).innerHTML)*parseInt(document.querySelector("#tr_p_amount_"+product_id).value)
	document.querySelector("#tr_p_total_"+product_id).innerHTML = totalCost;
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"5","product_id":product_id, "newAmount":parseInt(document.querySelector("#tr_p_amount_"+product_id).value)},
			success: function(response){}
		})
}

function dropCart(){
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"6"},
			success: function(response){
				alert(response);
				window.location.replace(window.location);
			}
		})
}

function checkout(){
	if(document.querySelector("#cart").innerHTML==null||document.querySelector("#empty_cart")!=null) {
		alert("Нисте додали ниједан производ у корпу!");
		return;
	}
	document.querySelector("#checkout").innerHTML = "";
	document.querySelector("#cart").style.pointerEvents = "none";
	document.querySelector("#cartBtns").style.pointerEvents = "none";
	var prices = document.querySelectorAll("td[id^='tr_p_total_']");
	var totalCost = 0;
	for(var i=0; i<prices.length;i++){
		totalCost += parseInt(prices[i].innerHTML);
	}
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"7"},
			success: function(response){
				var jsonData = JSON.parse(response);
				document.querySelector("#checkout").innerHTML += 'Информације о поруџбини:<br><br><br>';
				document.querySelector("#checkout").innerHTML += 'Име и презиме: '+document.querySelector("#logout").innerHTML+'<br><br>';
				document.querySelector("#checkout").innerHTML += 'ПАК (Поштански адресни код) за доставу: '+jsonData["ПАК:"]+'<br><br>';
				document.querySelector("#checkout").innerHTML += 'Изаберите начин плаћања:<br><br>';
				document.querySelector("#checkout").innerHTML += '<div class="input">';
				for(var i = 0; i < jsonData["paymentOptions:"]; i++){
					document.querySelector(".input").innerHTML += jsonData[i]["Тип плаћања:"]+' ('+jsonData[i]["Адреса плаћања:"]+')</label>&nbsp&nbsp<input type="radio" value="'+jsonData[i]["Тип плаћања:"]+','+jsonData[i]["Адреса плаћања:"]+'" class="radio1" name="paymentType" onclick="changePaymentType('+totalCost+');"><br>'
				}
				document.querySelector(".input").innerHTML += 'Кешом &nbsp&nbsp<input type="radio" value="кешом" class="radio1" name="paymentType" onclick="changePaymentType('+totalCost+');"><br>'
				document.querySelector("#checkout").innerHTML += '</div><br>';
				document.querySelector("#checkout").innerHTML += 'Изабрани начин плаћања: <span id="pT">НИЈЕ ИЗАБРАНО</span><br><br>';
				document.querySelector("#checkout").innerHTML += 'Укупно за плаћање: <span id="totalCost">?</span><br><br>';
				document.querySelector("#checkout").innerHTML += 'ХВАЛА ШТО КУПУЈЕТЕ СА НАМА!<br><br>';
				document.querySelector("#checkout").innerHTML += '<div id="checkOutBtns"><button type="button" id="confirmOrder" onclick="confirmOrder();">Потврда поруџбине</button><button type="button" id="revokeCheckout" onclick="revokeCheckout();">Повратак на корпу</button></div><br><br><div id="checkout"></div>';
			}
		})
}

function changePaymentType(totalCost){
	document.querySelector("#pT").innerHTML = document.querySelector("input[type='radio']:checked").value.split(',')[0];
	
	switch(document.querySelector("#pT").innerHTML){
		case "Bitcoin": totalCost = (totalCost/pricesBEM[0]).toFixed(6) + " BTC"; break;
		case "Ethereum": totalCost = (totalCost/pricesBEM[1]).toFixed(6) + " ETH"; break;
		case "Monero": totalCost = (totalCost/pricesBEM[2]).toFixed(6) + " XMR"; break;
		default: totalCost += " RSD"; break;
	}
	document.querySelector("#totalCost").innerHTML = totalCost;
}

function revokeCheckout(){
	document.querySelector("#checkout").innerHTML = "";
	document.querySelector("#cart").style.pointerEvents = "";
	document.querySelector("#cartBtns").style.pointerEvents = "";
}

function confirmOrder(){
	if(document.querySelector("input[type='radio']:checked")==null) { alert("Нисте изабрали начин плаћања!"); return; }
	var payVia;
	if(document.querySelector("input[type='radio']:checked").value == "кешом") payVia = 0;
	else payVia = document.querySelector("input[type='radio']:checked").value.split(',')[1];
	var orderedProducts = Array(document.querySelectorAll("div[id^='tr_p_id_']").length);
	for(var i = 0; i < document.querySelectorAll("div[id^='tr_p_id_']").length; i++){
		var row_id = document.querySelectorAll("div[id^='tr_p_id_']")[i].innerHTML;
		orderedProducts[i] = Array(2);
		orderedProducts[i][0] = row_id;
		orderedProducts[i][1] = document.querySelector("#tr_p_amount_"+row_id).value
	}
	
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {"function_id":"8","paymentAddress":payVia,"orderedProducts":orderedProducts,"confirmPass" : window.prompt("Унесите лозинку за потврду:")},
			success: function(response){
				alert(response);
				window.location.replace(window.location);
			}
		})
}

function updateCustomer(){
	var errors = [true,true,true,true,true];
	
	if (RegExp("^([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-z]{1,15})\\s(([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-z]){1,15}\\s?){1,3}$").test(document.querySelector("#customer_0").value) && document.querySelector("#customer_0").value !== ""){
    	document.querySelector("#customer_0").style.border = "2px solid green";
		errors[0] = false;
    }
	else {
		document.querySelector("#customer_0").style.border = "2px solid red";
    	errors[0] = true;
	}
	
	if (RegExp("^(([^<>()\\[\\]\\\.,;:\\s@\\вЂќ]+(\.[^<>()\\[\\]\\\.,;:\\s@\\вЂќ]+)*)|(\\вЂќ.+\\вЂќ))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$").test(document.querySelector("#customer_1").value) && document.querySelector("#customer_1").value !== ""){
    	document.querySelector("#customer_1").style.border = "2px solid green";
		errors[1] = false;
    }
	else {
		document.querySelector("#customer_1").style.border = "2px solid red";
    	errors[1] = true;
	}
	
	if (RegExp("^(\\+381|0)[0-9]{2}[0-9]{7}$").test(document.querySelector("#customer_2").value) && document.querySelector("#customer_2").value !== ""){
    	document.querySelector("#customer_2").style.border = "2px solid green";
		errors[2] = false;
    }
	else {
		document.querySelector("#customer_2").style.border = "2px solid red";
    	errors[2] = true;
	}
	
	if (RegExp("^\\d{6}$").test(document.querySelector("#customer_3").value) && document.querySelector("#customer_3").value !== ""){
    	document.querySelector("#customer_3").style.border = "2px solid green";
		errors[3] = false;
    }
	else {
		document.querySelector("#customer_3").style.border = "2px solid red";
    	errors[3] = true;
	}
	if ((RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$").test(document.querySelector("#customer_6").value) && document.querySelector("#customer_6").value !== "") || document.querySelector("#customer_6").value === ""){
		document.querySelector("#customer_6").style.border = "2px solid green";
		errors[4] = false;
    }
    else {
		document.querySelector("#customer_6").style.border = "2px solid red";
		errors[4] = true;
    }
	
	if(!errors[0] && !errors[1] && !errors[2] && !errors[3] && !errors[4]){
	
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {
				"function_id" : "10",
				"nameSurname" : document.querySelector("#customer_0").value,
				"email" : document.querySelector("#customer_1").value,
				"phone" : document.querySelector("#customer_2").value,
				"pak" : document.querySelector("#customer_3").value,
				"wantsToBeSubscribed" : document.querySelector("#customer_5").value == "Да" ? 1 : 0,
				"newPass" : document.querySelector("#customer_6").value,
				"confirmPass" : window.prompt("Унесите лозинку за потврду:")
			},
			success: function(response){
				if(!$.trim(response)) { alert("Подаци за кориника " + response + " су промењени!"); window.location.replace(window.location); }
				else alert(response);
			}
		})
	}
}

function getOrderProducts(order_id){
	$.ajax({
			type: "POST",
			url: "Scripts/employee.php",
			data: {"function_id":"5","order_id":order_id},
			success: function(response){
				var jsonData = JSON.parse(response);
				var keys = ["Назив:", "Врста:", "Јединична цена:", "Поручена количина:", "Укупна цена:"];
				var pType = ''; 		
				
				document.querySelector("#table_2").innerHTML = "Листинг поручених производа и укупна цена за проуџбину број: "+order_id+"<br><br><table class='t_products'><thead><th>Назив:</th><th>Врста:</th><th>Јединична цена:</th><th>Поручена количина:</th><th>Укупна цена:</th></tr></thead><tbody>";
				
				
				for(var i = 0; i < Object.keys(jsonData).length-1; i++){ //Object.keys(jsonData) stores order ids *-1 beacuse of totalOrderCost
					document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_" + Object.keys(jsonData)[i] + ">";
					for(var j = 0; j < keys.length; j++){
						switch(jsonData[Object.keys(jsonData)[i]]["Врста:"]){
							case "solarPanel": pType = 'Соларни панел'; break;
							case "battery": pType = 'Акумулатор'; break;
							case "windTurbine": pType = 'Ветрогенератор'; break;
							case "electricVehicle": pType = 'Електрично возило'; break;
							case "controller": pType = 'Контролер пуњења акумулатора'; break;
							case "inverter": pType = 'Инвертер DC/AC'; break;
						}
						if(j==1) document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + pType + "</td>";
						else if(j==2 || j==4) document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + jsonData[Object.keys(jsonData)[i]][keys[j]] + " RSD</td>";
						else document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + jsonData[Object.keys(jsonData)[i]][keys[j]] + "</td>";
					}
					document.querySelector(".t_products > tbody").innerHTML += "</tr>";
				}
				
				if(document.querySelector("#tr_o_"+order_id).innerText.includes("Bitcoin")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[-1]["totalOrderCost"]/pricesBEM[0]).toFixed(6)+" BTC)</td></tr>";
				else if(document.querySelector("#tr_o_"+order_id).innerText.includes("Ethereum")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[-1]["totalOrderCost"]/pricesBEM[1]).toFixed(6)+" ETH)</td></tr>";
				else if(document.querySelector("#tr_o_"+order_id).innerText.includes("Monero")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[-1]["totalOrderCost"]/pricesBEM[2]).toFixed(6)+" XMR)</td></tr>";
				else document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=4>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td></tr>";
			}
		})
}

function checkNewPaymentAddress(){
	var isCorrect;
		
	switch (document.querySelector("#newPaymentType").value) {
	  case "MasterCard":
	    isCorrect = (RegExp("^(2|5)[1-5][0-9]{14}$").test(document.querySelector("#newPaymentAddress").value));
	    break;
	  case "Visa":
	    isCorrect = (RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?)$").test(document.querySelector("#newPaymentAddress").value));
	    break;
	  case "American Express":
	    isCorrect = (RegExp("^(?:3[47][0-9]{13})$").test(document.querySelector("#newPaymentAddress").value));
	    break;
	  case "Bitcoin":
	    isCorrect = (RegExp("^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$").test(document.querySelector("#newPaymentAddress").value));
	    break;
	  case "Ethereum":
	    isCorrect = (RegExp("^0x[a-fA-F0-9]{40}$").test(document.querySelector("#newPaymentAddress").value));
	    break;
	  case "Monero":
	    isCorrect = (RegExp("^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$").test(document.querySelector("#newPaymentAddress").value));
	    break;
	  default:
	    isCorrect = false;
	}
	
	if(isCorrect) document.querySelector("#newPaymentAddress").style.border = "2px solid green";
	else document.querySelector("#newPaymentAddress").style.border = "2px solid red";
	
	return isCorrect;
}

function addNewPayment(){
	if(!checkNewPaymentAddress()){
		alert("Нисте исправно попунили адресу за плаћање! Адреса се уноси без размака!");
		return;
	}
	
	$.ajax({
			type: "POST",
			url: "Scripts/customer.php",
			data: {
				"function_id" : "12",
				"newPaymentAddress" : document.querySelector("#newPaymentAddress").value,
				"newPaymentType" : document.querySelector("#newPaymentType").value,
				"confirmPass" : window.prompt("Унесите лозинку за потврду:")
			},
			success: function(response){
				if(!$.trim(response)) { alert("Додат је нов начин плаћања за корисника "+response+"!"); window.location.replace(window.location); }
				else alert(response);
			}
		})
}
