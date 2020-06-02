var isAdmin,pricesBEM = Array(3);

window.onload = function (){
	var ajaxQueue = $({});

	  $.ajaxQueue = function(ajaxOpts) {

		var oldComplete = ajaxOpts.complete;

		ajaxQueue.queue(function(next) {

		  ajaxOpts.complete = function() {
			if (oldComplete) oldComplete.apply(this, arguments);

			next();
		  };

		  $.ajax(ajaxOpts);
		});
	  };
	
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
							pricesBEM[0] = Math.round(102*response["USD_RSD"]);
							pricesBEM[1] = Math.round(102*response["USD_RSD"]);
							pricesBEM[2] = Math.round(102*response["USD_RSD"]);
						}
					}
				})
			}
		})
	
	$.ajax({
		type: "POST",
		url: "Scripts/employee.php",
		data: {"function_id":"1"},
		success: function(response){
			document.querySelector("#logout").innerHTML = response.substring(0,response.indexOf('\n'));
			isAdmin = response.charAt(response.indexOf('=')+1);
			if(document.querySelector("#logout").innerHTML == '' || document.referrer.includes("index.php"))
				(response.substring(response.indexOf("!")+1)=="employee.html" ? window.location.replace(response.substring(response.indexOf("!")+1)+"?employeeData=true") : window.location.replace(response.substring(response.indexOf("!")+1)));
			else if(document.referrer.includes("admin.html")) window.location.replace("?employeeData=true");
		}
	})
	
	if(getParameterByName('employeeData')){
		document.querySelector(".mainContent").innerHTML = "<table class='t_data'><thead><tr><th colspan=2>Подаци о запосленом</th></tr></thead><tbody>";
		$.ajax({
			type: "POST",
			url: "Scripts/employee.php",
			data: {"function_id":"2"},
			success: function(response){
				var baseData = response.split('&');
				for(var i = 0; i < 4; i++){
					document.querySelector(".t_data > tbody").innerHTML += '<tr id=tr_d_'+i+'><td>'+baseData[i].split(':')[0]+'</td><td>' + baseData[i].split(':')[1] + '</td>';
				}
			}
		})
	}
	
	if(getParameterByName('ordersData')){
		document.querySelector(".mainContent").innerHTML = 'Листинг свих доступних поруџбина<br><br><div id="table_1"></div><br><br><div id="table_2"></div><br><br>';
		$.ajax({
			type: "POST",
			url: "Scripts/employee.php",
			data: {"function_id":"4"},
			success: function(response){
				var jsonData = JSON.parse(response);
				var keys = ["Обрађивач:", "Купац:"];
				document.querySelector("#table_1").innerHTML = "<table class='t_orders'><thead><th>Обрађивач:</th><th>Купац:</th><th>Начин плаћања:</th><th>Статус:</th></tr></thead><tbody>";
				for(var i = 0; i <= Object.keys(jsonData).length-1; i++){ //Object.keys(jsonData) stores order ids
					document.querySelector(".t_orders > tbody").innerHTML += "<tr id=tr_" + Object.keys(jsonData)[i] + ">";
					for(var j = 0; j < keys.length; j++){
						document.querySelector("#tr_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + jsonData[Object.keys(jsonData)[i]][keys[j]] + "</td>";
					}
					
					var takeOrderBtn = '';
					var status='';
					var payVia='';
					switch(jsonData[Object.keys(jsonData)[i]]["Статус:"]){
						case "ORDERED": status = '<option value="ORDERED" selected="">НАРУЧЕНО</option><option value="SHIPPED">ПОСЛАТО</option><option value="CANCELED">ОТКАЗАНО</option><option value="DELIVERED">ИСПОРУЧЕНО</option><option value="RETURNED">ВРАЋЕНО</option></select>'; break;
						case "SHIPPED": status = '<option value="ORDERED">НАРУЧЕНО</option><option value="SHIPPED" selected="">ПОСЛАТО</option><option value="CANCELED">ОТКАЗАНО</option><option value="DELIVERED">ИСПОРУЧЕНО</option><option value="RETURNED">ВРАЋЕНО</option></select>'; break;
						case "CANCELED": status = '<option value="ORDERED" >НАРУЧЕНО</option><option value="SHIPPED">ПОСЛАТО</option><option value="CANCELED" selected="">ОТКАЗАНО</option><option value="DELIVERED">ИСПОРУЧЕНО</option><option value="RETURNED">ВРАЋЕНО</option></select>'; break;
						case "DELIVERED": status = '<option value="ORDERED">НАРУЧЕНО</option><option value="SHIPPED">ПОСЛАТО</option><option value="CANCELED">ОТКАЗАНО</option><option value="DELIVERED" selected="">ИСПОРУЧЕНО</option><option value="RETURNED">ВРАЋЕНО</option></select>'; break;
						case "RETURNED": status = '<option value="ORDERED">НАРУЧЕНО</option><option value="SHIPPED">ПОСЛАТО</option><option value="CANCELED">ОТКАЗАНО</option><option value="DELIVERED">ИСПОРУЧЕНО</option><option value="RETURNED" selected="">ВРАЋЕНО</option></select>'; break;	
					} 
									
					
					if(jsonData[Object.keys(jsonData)[i]][keys[0]]==null) takeOrderBtn = '<button type="button" class="takeOrder" onclick="takeOrder(' + Object.keys(jsonData)[i] + ');"></button>';
					
					if(jsonData[Object.keys(jsonData)[i]]["Начин плаћања:"][0]==null) payVia = "Кешом"
					else payVia = jsonData[Object.keys(jsonData)[i]]["Начин плаћања:"][0] + " ("+jsonData[Object.keys(jsonData)[i]]["Начин плаћања:"][1]+")"
					document.querySelector("#tr_" + Object.keys(jsonData)[i]).innerHTML += '<td>' + payVia + '</td>';
					document.querySelector("#tr_" + Object.keys(jsonData)[i]).innerHTML += '<td><select id="status_' + Object.keys(jsonData)[i] + '" name="status_'+Object.keys(jsonData)[i]+'" onchange="changeOrderStatus('+Object.keys(jsonData)[i]+');">' + status + '<button type="button" class="getProducts" onclick="getOrderProducts(' + Object.keys(jsonData)[i] + ');"></button>' + takeOrderBtn + "</td>"; 
					document.querySelector(".t_orders > tbody").innerHTML += "</tr>";
				}
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

function checkAdmin(){
	if(isAdmin==1)
		window.location.replace("admin.html");
	else
		alert("Немате приступ админ панелу!");
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
						if(j==1) document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += "<td>" +pType+ "</td>";
						else document.querySelector("#tr_p_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + jsonData[Object.keys(jsonData)[i]][keys[j]] + "</td>";
					}
					document.querySelector(".t_products > tbody").innerHTML += "</tr>";
				}
				if(document.querySelector("#tr_"+order_id).innerText.includes("Bitcoin")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[-1]["totalOrderCost"]/pricesBEM[0]).toFixed(6)+" BTC)</td></tr>";
				else if(document.querySelector("#tr_"+order_id).innerText.includes("Ethereum")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[-1]["totalOrderCost"]/pricesBEM[1]).toFixed(6)+" ETH)</td></tr>";
				else if(document.querySelector("#tr_"+order_id).innerText.includes("Monero")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[-1]["totalOrderCost"]/pricesBEM[2]).toFixed(6)+" XMR)</td></tr>";
				else document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=4>Укупно за наплату:</td><td>"+jsonData[-1]["totalOrderCost"]+" RSD</td></tr>";
			}
		})
}

function takeOrder(order_id){
	$.ajax({
			type: "POST",
			url: "Scripts/employee.php",
			data: {"function_id":"6","order_id":order_id,"confirmPass" : window.prompt("Унесите лозинку за потврду:")},
			success: function(response){
				if(response==""){
					alert("Успешно сте преузели поруџбину број: " + order_id);
					window.location.replace(window.location);
				}
			}
		})
}

function changeOrderStatus(order_id){
	$.ajax({
			type: "POST",
			url: "Scripts/employee.php",
			data: {"function_id":"7","order_id":order_id,"new_status":document.querySelector("#status_"+order_id).options[document.querySelector("#status_"+order_id).selectedIndex].value,"confirmPass" : window.prompt("Унесите лозинку за потврду:")},
			success: function(response){
				if(response=="")
					alert("Успешно сте променили статус за поруџбину број: " + order_id);
			}
		})
}

function logout(){
	var save = confirm("Да ли желите да сачувате где сте стали (сесију)?");
	
	$.ajax({
			type: "POST",
			url: "Scripts/employee.php",
			data: {"function_id":"8","save":save, "lastURL":window.location.href},
			success: function(response){
				if(response.includes("FINISHED"))
					window.location.replace("index.php");
			}
		})
}