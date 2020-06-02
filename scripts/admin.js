var pricesBEM = Array(3);

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
		url: "Scripts/admin.php",
		data: {"function_id":"1"},
		success: function(response){
			document.querySelector("#logout").innerHTML = response;
			if(document.querySelector("#logout").innerHTML == '' && document.referrer.includes("index.php"))
				window.location.replace(response.substring(response.indexOf("!")+1));
			else if(document.referrer.includes("employee.html") && window.location.href.indexOf("?") == -1) window.location.replace("?customersData=true");
		}
	})

	if(getParameterByName('customersData')){
		getNumOfColumns("customer"); // to resolve NaN on first call
		document.querySelector(".mainContent").innerHTML = '<div id="table_1"></div>';
		$.ajax({
			type: "POST",
			url: "Scripts/admin.php",
			data: {"function_id":"2"},
			success: function(response){
				var jsonData = JSON.parse(response);
				var keys = ["Име и презиме:","Е-мајл адреса:","Број телефона:","ПАК:","Има ВИП статус:","Претплаћен на новости:"];
				document.querySelector("#table_1").innerHTML = "<table class='t_orders'><thead><th>Име и презиме:</th><th>Е-мајл адреса:</th><th>Број телефона:</th><th>ПАК:</th><th>Има ВИП статус:</th><th>Претплаћен на новости:</th><th></th></tr></thead><tbody>";
				for(var i = 1; i <= parseInt(document.querySelector("#numOfColumns").value); i++){
					document.querySelector(".t_orders > tbody").innerHTML += "<tr id=tr_o_" + i + ">";
					for(var j = 0; j < keys.length; j++){
						var input_textbox = '<input required="" type="text" value="' +  jsonData[i][keys[j]] + '" id="customer' + i + '_' + j + '"></div>';
						var input_dropdown = '<select id="customer' + i + '_' + j + '" name="customer' + i + '_' + j + '"><option value="Да"';
						
						if(jsonData[i][keys[j]]=="ДА") input_dropdown += ' selected>Да</option><option value="Не">Не</option></select></div>';
						else input_dropdown += '>Да</option><option value="Не" selected>Не</option></select></div>';
						
						j < 4 ? document.querySelector("#tr_o_" + i).innerHTML += '<td>' + input_textbox + '</td>' : document.querySelector("#tr_o_" + i).innerHTML += '<td>' + input_dropdown + '</td>';
					}
					document.querySelector(".t_orders > tbody").innerHTML += '<td><button type="button" id="customer_' + i + '_6" 		onclick="updateCustomer(' + i + ');">Промени податке</button></td></tr>';
				}
			}
		})
	}
	
	if(getParameterByName('ordersData')){
		document.querySelector(".mainContent").innerHTML = '<div id="table_1"></div><br><br><div id="table_2"></div><br><br>';
		$.ajax({
			type: "POST",
			url: "Scripts/admin.php",
			data: {"function_id":"4"},
			success: function(response){
				var jsonData = JSON.parse(response);
				var keys = ["Обрађивач:", "Купац:"];
				var status = '';
				var payVia = '';
				document.querySelector("#table_1").innerHTML = "Листинг свих поруџбина<br><br><table class='t_orders'><thead><th>Обрађивач:</th><th>Купац:</th><th>Начин плаћања:</th><th>Статус:</th></tr></thead><tbody>"
								
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
					document.querySelector("#tr_o_" + Object.keys(jsonData)[i]).innerHTML += "<td>" + status+ '<button type="button" class="getProducts" onclick="getOrderProducts(' + Object.keys(jsonData)[i] + ');"></button>' + "</td>";
					document.querySelector(".t_orders > tbody").innerHTML += "</tr>";
				}
			}
		})
	}
	
	if(getParameterByName('productsData')){
		document.querySelector(".mainContent").innerHTML = '';
		$.ajax({
			type: "POST",
			url: "Scripts/admin.php",
			data: {"function_id":"6"},
			success: function(response){
				var jsonData = JSON.parse(response);
				var product_id = 1;
				var i;
				
				if(Object.keys(jsonData).length == 0){
					document.querySelector(".mainContent").innerHTML += '<div class="productRow" id="row_0"></div>'
					document.querySelector("#row_0").innerHTML += '<article class="productInfo"><div><label for="newFile_'+product_id+'"><img alt="image_of_unknownProduct_'+product_id+'" onclick="addImage('+product_id+')" id="newImage_'+product_id+'" src="images/plus.png"></label><input type="file" id="newFile_'+product_id+'" style="display: none;"></div><p class="price">Цена (RSD):<input type="text" id="newPrice_'+product_id+'"></p><p class="productContent">Назив:<input type="text" id="newName_'+product_id+'" value="test"></p><p class="productContent">Количина на залихама: <input type="text" id="newSupply_'+product_id+'"></p><p class="productContent">Врста производа:<select id="newType_'+product_id+'" name="newType_'+product_id+'" style="width: 100%;"><option value="solarPanel" selected>Соларни панел</option><option value="battery">Акумулатор</option><option value="windTurbine">Ветрогенератор</option><option value="electricVehicle">Електрично возило</option><option value="controller">Контролер пуњења акумулатора</option><option value="inverter">Инвертер DC/AC</option></select></div></p><input type="button" onclick="updateProduct('+product_id+',8)" value="Додај" class="buyButton"></article>';
					return;
				}

				for(i = 0; i < Math.ceil((Object.keys(jsonData).length+1)/3); i++){
					document.querySelector(".mainContent").innerHTML += '<div class="productRow" id="row_'+i+'"></div>'
					for(var j = 0; j < 3; j++){
						if(product_id > Object.keys(jsonData).length) break;

						var input_dropdown = '<select id="newType_'+product_id+'" name="newType_'+product_id+'" style="width: 100%;">';
						
						switch(jsonData[product_id]["product_type"]){
							case "solarPanel": input_dropdown += '<option value="solarPanel" selected>Соларни панел</option><option value="battery">Акумулатор</option><option value="windTurbine">Ветрогенератор</option><option value="electricVehicle">Електрично возило</option><option value="controller">Контролер пуњења акумулатора</option><option value="inverter">Инвертер DC/AC</option></select></div>'; break;
							case "battery": input_dropdown += '<option value="solarPanel">Соларни панел</option><option value="battery" selected>Акумулатор</option><option value="windTurbine">Ветрогенератор</option><option value="electricVehicle">Електрично возило</option><option value="controller">Контролер пуњења акумулатора</option><option value="inverter">Инвертер DC/AC</option></select></div>'; break;
							case "windTurbine": input_dropdown += '<option value="solarPanel">Соларни панел</option><option value="battery">Акумулатор</option><option value="windTurbine" selected>Ветрогенератор</option><option value="electricVehicle">Електрично возило</option><option value="controller">Контролер пуњења акумулатора</option><option value="inverter">Инвертер DC/AC</option></select></div>'; break;
							case "electricVehicle": input_dropdown += '<option value="solarPanel">Соларни панел</option><option value="battery">Акумулатор</option><option value="windTurbine">Ветрогенератор</option><option value="electricVehicle" selected>Електрично возило</option><option value="controller">Контролер пуњења акумулатора</option><option value="inverter">Инвертер DC/AC</option></select></div>'; break;
							case "controller": input_dropdown += '<option value="solarPanel">Соларни панел</option><option value="battery">Акумулатор</option><option value="windTurbine">Ветрогенератор</option><option value="electricVehicle">Електрично возило</option><option value="controller" selected>Контролер пуњења акумулатора</option><option value="inverter">Инвертер DC/AC</option></select></div>'; break;
							case "inverter": input_dropdown += '<option value="solarPanel">Соларни панел</option><option value="battery">Акумулатор</option><option value="windTurbine">Ветрогенератор</option><option value="electricVehicle">Електрично возило</option><option value="controller">Контролер пуњења акумулатора</option><option value="inverter" selected>Инвертер DC/AC</option></select></div>'; break;
						}
						
						document.querySelector("#row_"+i).innerHTML += '<article class="productInfo"><div><label for="newFile_'+product_id+'"><img alt="image_of_'+jsonData[product_id]["product_type"]+'" onclick="addImage('+product_id+')" id="newImage_'+product_id+'" src="images/products/'+jsonData[product_id]["image_url"]+'"></label><input type="file" id="newFile_'+product_id+'" style="display: none;"></div><p class="price">Цена (RSD):<input type="text" id="newPrice_'+product_id+'" value="'+jsonData[product_id]["price"]+'"></p><p class="productContent">Назив:<input type="text" id="newName_'+product_id+'" value="'+jsonData[product_id]["name"]+'"></p><p class="productContent">Количина на залихама: <input type="text" id="newSupply_'+product_id+'" value="'+jsonData[product_id]["supply"]+'"></p><p class="productContent">Врста производа:'+input_dropdown+'</p><input type="button" onclick="updateProduct('+product_id+',7)" value="Измени" class="buyButton">';
						product_id++;
					}
				}
				document.querySelector("#row_"+(i-1)).innerHTML += '<article class="productInfo"><div><label for="newFile_'+product_id+'"><img alt="image_of_unknownProduct_'+product_id+'" onclick="addImage('+product_id+')" id="newImage_'+product_id+'" src="images/plus.png"></label><input type="file" id="newFile_'+product_id+'" style="display: none;"></div><p class="price">Цена (RSD):<input type="text" id="newPrice_'+product_id+'"></p><p class="productContent">Назив:<input type="text" id="newName_'+product_id+'" value="test"></p><p class="productContent">Количина на залихама: <input type="text" id="newSupply_'+product_id+'"></p><p class="productContent">Врста производа:<select id="newType_'+product_id+'" name="newType_'+product_id+'" style="width: 100%;"><option value="solarPanel" selected>Соларни панел</option><option value="battery">Акумулатор</option><option value="windTurbine">Ветрогенератор</option><option value="electricVehicle">Електрично возило</option><option value="controller">Контролер пуњења акумулатора</option><option value="inverter">Инвертер DC/AC</option></select></div></p><input type="button" onclick="updateProduct('+product_id+',8)" value="Додај" class="buyButton">';
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

function updateCustomer(customer_id){
	
	var errors = [true,true,true,true];
	
	if (RegExp("^([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-z]{1,15})\\s(([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-z]){1,15}\\s?){1,3}$").test(document.querySelector("#customer" + customer_id + "_0").value) && document.querySelector("#customer" + customer_id + "_0").value !== ""){
    	document.querySelector("#customer" + customer_id + "_0").style.border = "2px solid green";
		errors[0] = false;
    }
	else {
		document.querySelector("#customer" + customer_id + "_0").style.border = "2px solid red";
    	errors[0] = true;
	}
	
	if (RegExp("^(([^<>()\\[\\]\\\.,;:\\s@\\вЂќ]+(\.[^<>()\\[\\]\\\.,;:\\s@\\вЂќ]+)*)|(\\вЂќ.+\\вЂќ))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$").test(document.querySelector("#customer" + customer_id + "_1").value) && document.querySelector("#customer" + customer_id + "_1").value !== ""){
    	document.querySelector("#customer" + customer_id + "_1").style.border = "2px solid green";
		errors[1] = false;
    }
	else {
		document.querySelector("#customer" + customer_id + "_1").style.border = "2px solid red";
    	errors[1] = true;
	}
	
	if (RegExp("^(\\+381|0)[0-9]{2}[0-9]{7}$").test(document.querySelector("#customer" + customer_id + "_2").value) && document.querySelector("#customer" + customer_id + "_2").value !== ""){
    	document.querySelector("#customer" + customer_id + "_2").style.border = "2px solid green";
		errors[2] = false;
    }
	else {
		document.querySelector("#customer" + customer_id + "_2").style.border = "2px solid red";
    	errors[2] = true;
	}
	
	if (RegExp("^\\d{6}$").test(document.querySelector("#customer" + customer_id + "_3").value) && document.querySelector("#customer" + customer_id + "_3").value !== ""){
    	document.querySelector("#customer" + customer_id + "_3").style.border = "2px solid green";
		errors[3] = false;
    }
	else {
		document.querySelector("#customer" + customer_id + "_3").style.border = "2px solid red";
    	errors[3] = true;
	}
	
	if(!errors[0] && !errors[1] && !errors[2] && !errors[3]){
	
	$.ajax({
			type: "POST",
			url: "Scripts/admin.php",
			data: {
				"function_id" : "3",
				"nameSurname" : document.querySelector("#customer" + customer_id + "_0").value,
				"email" : document.querySelector("#customer" + customer_id + "_1").value,
				"phone" : document.querySelector("#customer" + customer_id + "_2").value,
				"pak" : document.querySelector("#customer" + customer_id + "_3").value,
				"isVip" : document.querySelector("#customer" + customer_id + "_4").value == "Да" ? 1 : 0,
				"wantsToBeSubscribed" : document.querySelector("#customer" + customer_id + "_5").value == "Да" ? 1 : 0,
				"customer_id" : customer_id,
				"confirmPass" : window.prompt("Унесите лозинку за потврду:")
			},
			success: function(response){
				if(!$.trim(response)) alert("Подаци за кориника " + customer_id + " су промењени!");
				else alert(response);
			}
		})
	}
}

function getNumOfColumns(table_name){
	$.ajax({
			type: "POST",
			url: "Scripts/admin.php",
			data: {"function_id":"5", "table_name":table_name},
			success: function(response){
				document.querySelector("#numOfColumns").value = response;
			}
		})
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
				if(document.querySelector("#tr_o_"+order_id).innerText.includes("Bitcoin")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[Object.keys(jsonData).length-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[Object.keys(jsonData).length-1]["totalOrderCost"]/pricesBEM[0]).toFixed(6)+" BTC)</td></tr>";
				else if(document.querySelector("#tr_o_"+order_id).innerText.includes("Ethereum")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[Object.keys(jsonData).length-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[Object.keys(jsonData).length-1]["totalOrderCost"]/pricesBEM[1]).toFixed(6)+" ETH)</td></tr>";
				else if(document.querySelector("#tr_o_"+order_id).innerText.includes("Monero")) document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=3>Укупно за наплату:</td><td>"+jsonData[Object.keys(jsonData).length-1]["totalOrderCost"]+" RSD</td><td>("+(jsonData[Object.keys(jsonData).length-1]["totalOrderCost"]/pricesBEM[2]).toFixed(6)+" XMR)</td></tr>";
				else document.querySelector(".t_products > tbody").innerHTML += "<tr id=tr_p_sum><td colspan=4>Укупно за наплату:</td><td>"+jsonData[Object.keys(jsonData).length-1]["totalOrderCost"]+" RSD</td></tr>";
			}
		})
}

function updateProduct(product_id,function_id){
	uploadFile(product_id);
	$.ajax({
			type: "POST",
			url: "Scripts/admin.php",
			data: {"function_id":function_id,"product_id":product_id,"price":document.querySelector("#newPrice_"+product_id).value,"name":document.querySelector("#newName_"+product_id).value,"image":"product_"+product_id+".png","supply":document.querySelector("#newSupply_"+product_id).value,"type":document.querySelector("#newType_"+product_id).options[document.querySelector("#newType_"+product_id).selectedIndex].value,"confirmPass" : window.prompt("Унесите лозинку за потврду:")},
			success: function(response){
				if(response=="")
					alert("Успешно сте променили/додали производ број: " + product_id);
				window.location.href = window.location.href;
			}
		})
}

function uploadFile(product_id){
	var imageBag = new FormData();

    imageBag.append('file', document.querySelector("#newFile_"+product_id).files[0]); // append selected file to the bag named 'file'
	imageBag.append("function_id","9");
	imageBag.append("imageName",("product_"+product_id));
    $.ajax({
        type: 'post',
        url: "Scripts/admin.php",
        processData: false,
        contentType: false,
        data: imageBag,
        success: function (response) {
            alert("Слика је успешно послата на сервер!");
        }
    });
}

function addImage(product_id){
	document.querySelector("#newFile_"+product_id).onchange = function(){
		var reader = new FileReader();
		reader.addEventListener("load", function(){
		document.querySelector("#newImage_"+product_id).src = reader.result;
	},false);
	
		if (this.files[0]) {
			reader.readAsDataURL(this.files[0]);
		  }
	}
}

function logout(){
	var save = confirm("Да ли желите да сачувате где сте стали (сесију)?");
	
	$.ajax({
			type: "POST",
			url: "Scripts/admin.php",
			data: {"function_id":"10","save":save, "lastURL":window.location.href},
			success: function(response){
				if(response.includes("FINISHED"))
					window.location.replace("index.php");
			}
		})
}