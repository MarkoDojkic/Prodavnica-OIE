window.onload = function (){
	$.ajax({
		type: "POST",
		url: "Scripts/customer.php",
		data: {"function_id":"1"},
		success: function(response){
			document.querySelector("#logout").innerHTML = response.substring(0,response.indexOf('\n'));
		}
	})
	
	getProductData();
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

function getProductData(){
	document.querySelector(".mainContent").innerHTML = '';
	$.ajax({
			type: "POST",
			url: "Scripts/shop.php",
			data: {"function_id":"1"},
			success: function(response){
				if(response=="index.php") window.location.replace(response);
				
				var jsonData = JSON.parse(response);
				var product_id = 1;
				var i=0;
				var hide = '';
				
				do{
					document.querySelector(".mainContent").innerHTML += '<div class="productRow" id="row_'+i+'"></div>'
					for(var j = 0; j < 3; j++){
						if(product_id > Object.keys(jsonData).length) return;
						if(getParameterByName("filter") != null && !jsonData[product_id]["name"].includes(getParameterByName("filter"))) {
							product_id++;
							j--;
							continue;
						}
						document.querySelector("#row_"+i).innerHTML += '<article '+hide+' class="productInfo"><div><img alt="'+jsonData[product_id]["product_type"]+'" src="images/products/'+jsonData[product_id]["image_url"]+'"></div><p class="price">'+jsonData[product_id]["price"]+' RSD</p><p class="productContent">'+jsonData[product_id]["name"]+'</p><input type="button" name="buy_'+product_id+'" value="Купи" class="buyButton" onclick="buyProduct('+product_id+')"><div hidden id="supply_"'+product_id+' class="productContent">Количина на залихама: '+jsonData[product_id]["supply"]+'</div></article>';
						product_id++;
					}
					i++;
				} while(i < Math.ceil(Object.keys(jsonData).length/3));
			}
		});
}

function buyProduct(product_id){
	$.ajax({
			type: "POST",
			url: "Scripts/shop.php",
			data: {"function_id":"3","product_id":product_id},
			success: function(response){
				alert(response);
			}
		});
}

function logout(){
	var save = confirm("Да ли желите да сачувате где сте стали (сесију)?");
	
	$.ajax({
			type: "POST",
			url: "Scripts/shop.php",
			data: {"function_id":"2","save":save, "lastURL":window.location.href},
			success: function(response){
				if(response.includes("FINISHED"))
					window.location.replace("index.php");
			}
		})
}