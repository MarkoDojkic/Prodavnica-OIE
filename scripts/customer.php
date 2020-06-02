<?php
	session_start();
	switch($_POST["function_id"]){
		case "1": getCustName(); break;
		case "2": logout($_POST["save"]); break;
		case "3": getCart(); break;
		case "4": dropProduct($_POST["product_id"]); break;
		case "5": updateProductAmount($_POST["product_id"]); break;
		case "6": emptyCart(); break;
		case "7": getCheckoutInfo(); break;
		case "8": makeOrder(); break;
		case "9": getCustData(); break;
		case "10": changeCustData(); break;
		case "11": getOrders(); break;
		case "12": addNewPayment(); break;
	}

	function getCustName(){
		if($_SESSION["current_user_id"]==null){
			echo "\n!" . "index.php";
			session_destroy();
			return;
		}
		require("database_connection.php");
		$query = sprintf("SELECT customerName FROM customer WHERE customer_id='%s'", mysqli_real_escape_string($conn,$_SESSION['current_user_id']));
		$data = $conn->query($query);
		echo $data->fetch_assoc()['customerName'];
		echo "\n!" . $_SESSION["lastURL"];
	}

	function logout($save){
		if($save=="true"){
			require("database_connection.php");
			$query = sprintf("UPDATE session SET `status` = 'saved' WHERE sessionUser=%s AND sessionType='customer';",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
			$conn->query($query) or die("Грешка приликом промене статуса сесије!" . $query);
			$conn->close();
			$_SESSION["lastURL"] = substr($_POST["lastURL"],strpos($_POST["lastURL"],'/c')+1);
			echo $_SESSION["lastURL"];
			session_write_close();
		}
		else {
			require("database_connection.php");
			$query = sprintf("DELETE FROM session WHERE sessionUser=%s AND sessionType='customer';",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
			$conn->query($query) or die("Грешка приликом уклањања сесије!" . $query);
			$conn->close();
			session_destroy();
		}
		
		echo "FINISHED";
	}

	function getCart(){
		require("database_connection.php");
		$output = array();
		if($_SESSION["cart"]==null) $_SESSION["cart"] = array();
		foreach($_SESSION["cart"] as $product){
			$query = sprintf("SELECT product.name AS name, product.type AS product_type, product.imageURL AS image_url, product.price AS price, product.currentSupply AS supply FROM product WHERE product.product_id=%s;",mysqli_real_escape_string($conn,$product[0]));
			$data = $conn->query($query) or die($query);
			while($red = $data->fetch_assoc()){
				$output += array ( 
				$product[0] => array (
				"Слика:" => $red["image_url"],
				"Назив:" => $red["name"],
				"Врста:" => $red["product_type"],
				"Јединична цена:" => $red["price"],
				"Поручена количина:" => $product[1]));
			}
		}
		echo json_encode($output);
		$conn->close();
	}

	function dropProduct($product_id){
		foreach($_SESSION["cart"] as $product){
			if($product[0]==$product_id)
				$position=array_search($product,$_SESSION["cart"]);
		}
		if($position!=null) { 
			unset($_SESSION["cart"][$position]);
			echo "Производ број " . $product_id . " је избачен из корпе!";	
		}
	}

	function updateProductAmount($product_id){
		foreach($_SESSION["cart"] as $product){
			if($product[0]==$product_id)
				$position=array_search($product,$_SESSION["cart"]);
		}
		$_SESSION["cart"][$position][1] = $_POST["newAmount"];
		echo $_SESSION["cart"][$position][1];
		echo $_POST["newAmount"];
	}

	function emptyCart(){
		$_SESSION["cart"] = array();
		echo "Испразнили сте корпу!";
	}

	function getCheckoutInfo(){
		require("database_connection.php");
		$output = array();
		$query = sprintf("SELECT paymentAddress, paymentType FROM customerPaymentData WHERE customer_id=%s;", mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		$data = $conn->query($query) or die($query);
		$i = 0;
		while($red = $data->fetch_assoc()){
			$output += array ( $i => array(
				"Адреса плаћања:" => $red["paymentAddress"],
				"Тип плаћања:" => $red["paymentType"]
			));
			$i++;
		}

		$query = sprintf("SELECT pak FROM customer WHERE customer_id=%s;", mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		$data = $conn->query($query);
		$output += array("ПАК:" => $data->fetch_assoc()['pak'], "paymentOptions:" => $i);
		echo json_encode($output);
		$conn->close();
	}

	function makeOrder(){
		require("database_connection.php");
		
		$query = sprintf("SELECT password_hash FROM customer WHERE customer_id = '%s'",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$data = $conn->query($query) or die($query);
		
		if(!password_verify($_POST["confirmPass"],$data->fetch_assoc()['password_hash'])){
			echo "Неисправна лозинка! Није могуће потврдити наруџбу!";
			return;
		}
		
		if($_POST["paymentAddress"]==0) $payment = 0;
		else {
			$query = sprintf("SELECT customerPaymentData_id AS id FROM customerPaymentData WHERE paymentAddress='%s'",mysqli_real_escape_string($conn,$_POST["paymentAddress"]));
			$data = $conn->query($query) or die("Грешка приликом налажења начина плаћања!" . $query);
			$payment = $data->fetch_assoc()['id'];
		}
		
		$query = sprintf("INSERT INTO `order` (lastEditBy,customer_id,payVia) VALUES ('2_%s',%s,%s)",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$payment));
		$conn->query($query) or die("Грешка приликом додавања наруџбе!" . $query);
		
		$query = sprintf("SELECT order_id AS id FROM `order` WHERE payVia='%s' AND customer_id=%s and lastEditBy = '2_%s'",mysqli_real_escape_string($conn,$payment),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		$data = $conn->query($query) or die("Грешка приликом налажења наруџбе!" . $query);
		$order = $data->fetch_assoc()['id'];
		
		foreach($_POST["orderedProducts"] as $product){
			$query = sprintf("INSERT INTO order_product (lastEditBy,order_id,product_id,amount) VALUES (%s,%s,%s,%s)",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$order),mysqli_real_escape_string($conn,$product[0]),mysqli_real_escape_string($conn,$product[1]));
			$conn->query($query) or die("Грешка приликом додавања порученог производа!" . $query);
			$query = sprintf("UPDATE product SET currentSupply=currentSupply-%s, lastEditBy = '2_%s' WHERE product_id=%s",mysqli_real_escape_string($conn,$product[1]),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$product[0]));
			$conn->query($query) or die("Грешка приликом измене количине порученог производа!" . $query);
		}
		echo "Поруџбина послата!";
		emptyCart();
		$conn->close();
	}

	function getCustData(){
		require("database_connection.php");
		$query = sprintf("SELECT * FROM customer WHERE customer_id=%s;",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		$data = $conn->query($query);
		$output;
		while($red = $data->fetch_assoc()){
			$isPremium = $red["isPremium"] == 1 ? "ДА" : "НЕ";
			$isES = $red["isEmailSubscribed"] == 1 ? "ДА" : "НЕ";
			$output = array ( 
			"Име и презиме:" => $red["customerName"],
			"Е-мајл адреса:" => $red["email"],
			"Број телефона:" => $red["contactNumber"],
			"ПАК:" => $red["pak"],
			"Има ВИП статус:" => $isPremium,
			"Претплаћен на новости:" => $isES,);
		}
		$query = sprintf("SELECT customerPaymentData_id AS id, paymentType, paymentAddress FROM customerPaymentData WHERE customer_id=%s;",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		$data = $conn->query($query);
		$paymentIDs = array();
		$i = 0;
		while($red = $data->fetch_assoc()){
			$paymentIDs[$i] = $red["id"];
			$output += array ($paymentIDs[$i] => array(  
			"Врста плаћања:" => $red["paymentType"],
			"Адреса плаћања:" => substr($red["paymentAddress"],0,12) . "****"));
			$i++;
		}
		$output += array("payment_ids"=>$paymentIDs);
		echo json_encode($output);
		$conn->close();
	}

	function changeCustData(){
		require("database_connection.php");

		if($_POST['wantsToBeSubscribed']) $subscripted = 1;
		else $subscripted = 0;
		$query = sprintf("SELECT password_hash FROM customer WHERE customer_id = '%s'",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$data = $conn->query($query) or die($query);
		
		if(!password_verify($_POST["confirmPass"],$data->fetch_assoc()['password_hash'])){
			echo "Неисправна лозинка! Неуспела промена података корисника!";
			return;
		}

		$query = sprintf("UPDATE customer SET customerName = '%s', contactNumber = '%s', email = '%s', pak = '%s', isEmailSubscribed = '%s', lastEditBy = '2_%s' WHERE customer_id = '%s'",
						 mysqli_real_escape_string($conn,$_POST['nameSurname']),
						 mysqli_real_escape_string($conn,$_POST['phone']),
						 mysqli_real_escape_string($conn,$_POST['email']),
						 mysqli_real_escape_string($conn,$_POST['pak']),
						 mysqli_real_escape_string($conn,$subscripted),
						 mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),
						 mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$conn->query($query) or die($query);
		if($_POST["newPass"]!=null){
			$query = sprintf("UPDATE customer SET password_hash='%s' WHERE customer_id = '%s'",mysqli_real_escape_string($conn,password_hash($_POST['newPass'],PASSWORD_DEFAULT)),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
			
			$conn->query($query) or die("Грешка приликом промене лозинке!");
		}

		$conn->close();
	}

	function getOrders(){
		require("database_connection.php");
		
		$query = sprintf("SELECT `order`.order_id AS id, `order`.`status` AS `status`, employee.employeeName AS empName, customer.customerName AS custName,customerPaymentData.paymentType AS pT, customerPaymentData.paymentAddress as pA
							FROM `order`
							LEFT JOIN employee ON `order`.employee_id = employee.employee_id
							LEFT JOIN customerPaymentData ON `order`.payVia = customerPaymentData.customerPaymentData_id
							INNER JOIN customer ON `order`.customer_id = customer.customer_id
							WHERE `order`.customer_id = '%s';",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		$data = $conn->query($query) or die($query);
		$output = array();
		while($red = $data->fetch_assoc()){
			$output += array ( 
			$red["id"] => array (
			"Обрађивач:" => $red["empName"],
			"Купац:" => $red["custName"],
			"Статус:" => strtoupper($red["status"]),
			"Начин плаћања:" => array ($red["pT"],substr($red["pA"],0,6) . "****")));
		}
		echo json_encode($output);
		$conn->close();
	}

	function addNewPayment(){
		require( "database_connection.php" );
		
		$query = sprintf("SELECT password_hash FROM customer WHERE customer_id = '%s'",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$data = $conn->query($query) or die($query);
		
		if(!password_verify($_POST["confirmPass"],$data->fetch_assoc()['password_hash'])){
			echo "Неисправна лозинка! Неуспело додавање новог начина плаћања!";
			return;
		}

		$query = sprintf("INSERT INTO customerPaymentData (lastEditBy,customer_id,paymentAddress,paymentType) VALUES ('2_%s',%s,'%s','%s')", mysqli_real_escape_string($conn, $_SESSION["current_user_id"]),mysqli_real_escape_string($conn, $_SESSION["current_user_id"]), mysqli_real_escape_string($conn, $_POST["newPaymentAddress"]),mysqli_real_escape_string($conn, $_POST["newPaymentType"]));
  		$conn->query( $query ) or die("Грешка приликом додавања новог начина плаћања!" . $query);
		echo $_SESSION["current_user_id"];
		$conn->close();
	}
?>