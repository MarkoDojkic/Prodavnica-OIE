<?php
	session_start();

	switch($_POST["function_id"]){
		case "1": getEmpName(); break;
		case "2": getCustData(); break;
		case "3": changeCustData(); break;
		case "4": getOrderData(); break;
		case "5": getNumOfColumns($_POST["table_name"]); break;
		case "6": getProducts(); break;
		case "7": updateProduct($_POST["product_id"]); break;
		case "8": addProduct(); break;
		case "9": uploadImage(); break;
		case "10": logout($_POST["save"]); break;
	}

	function getEmpName(){
		if($_SESSION["current_user_id"]==null){
			echo "\n!" . "index.php";
			session_destroy();
			return;
		}
		require("database_connection.php");
		$query = "SELECT employeeName FROM employee WHERE employee_id=" . $_SESSION['current_user_id'] . ";";
		$data = $conn->query($query);
		echo $data->fetch_assoc()['employeeName'];
		$conn->close();
	}

	function getCustData(){
		require("database_connection.php");
		$query = sprintf("SELECT * FROM customer;");
		$data = $conn->query($query);
		$output = array();
		while($red = $data->fetch_assoc()){
			$isPremium = $red["isPremium"] == 1 ? "ДА" : "НЕ";
			$isES = $red["isEmailSubscribed"] == 1 ? "ДА" : "НЕ";
			$output += array ( 
			$red["customer_id"] => array (
			"Име и презиме:" => $red["customerName"],
			"Е-мајл адреса:" => $red["email"],
			"Број телефона:" => $red["contactNumber"],
			"ПАК:" => $red["pak"],
			"Има ВИП статус:" => $isPremium,
			"Претплаћен на новости:" => $isES));
		}
		echo json_encode($output);
		$conn->close();
	}

	function changeCustData(){
		require("database_connection.php");
		
		$query = sprintf("SELECT password_hash FROM employee WHERE employee_id = '%s'",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$data = $conn->query($query) or die($query);
		
		if(!password_verify($_POST["confirmPass"],$data->fetch_assoc()['password_hash'])){
			echo "Неисправна лозинка! Није могуће променити податке корисника!";
			return;
		}

		if($_POST['wantsToBeSubscribed']) $subscripted = 1;
		else $subscripted = 0;
		if($_POST['isVip']) $isVip = 1;
		else $isVip = 0;

		$query = sprintf("UPDATE customer SET customerName = '%s', contactNumber = '%s', email = '%s', pak = '%s', isPremium = '%s', isEmailSubscribed = '%s', lastEditBy = '0_%s' WHERE customer_id = '%s'",
						 mysqli_real_escape_string($conn,$_POST['nameSurname']),
						 mysqli_real_escape_string($conn,$_POST['phone']),
						 mysqli_real_escape_string($conn,$_POST['email']),
						 mysqli_real_escape_string($conn,$_POST['pak']),
						 mysqli_real_escape_string($conn,$isVip),
						 mysqli_real_escape_string($conn,$subscripted),
						 mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),
						mysqli_real_escape_string($conn,$_POST['customer_id']));
		
		$conn->query($query) or die($query);

		$conn->close();
	}

	function getOrderData(){
		require("database_connection.php");
		
		$query = sprintf("SELECT `order`.order_id AS id, `order`.`status` AS `status`, employee.employeeName AS empName, customer.customerName AS custName,customerPaymentData.paymentType AS pT, customerPaymentData.paymentAddress as pA
							FROM `order`
							LEFT JOIN employee ON `order`.employee_id = employee.employee_id
							LEFT JOIN customerPaymentData ON `order`.payVia = customerPaymentData.customerPaymentData_id
							INNER JOIN customer ON `order`.customer_id = customer.customer_id;");
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

	function getNumOfColumns($table_name){
		require("database_connection.php");
		$query = sprintf("SELECT COUNT(*) AS rows_num FROM `%s`;", mysqli_real_escape_string($conn,$table_name));	
		$data = $conn->query($query) or die($query);
		echo $data->fetch_assoc()['rows_num'];
		$conn->close();
	}

	function getProducts(){
		require("database_connection.php");
		
		$query = sprintf("SELECT product.product_id AS id, product.name AS name, product.type AS product_type, product.imageURL AS image_url, product.price AS price, product.currentSupply AS supply 
						FROM product ORDER BY product.price;");
		$data = $conn->query($query) or die($query);
		$output = array();
		while($red = $data->fetch_assoc()){
			$output += array ( 
			$red["id"] => array (
			"name" => $red["name"],
			"product_type" => $red["product_type"],
			"image_url" => $red["image_url"],
			"price" => $red["price"],
			"supply" => $red["supply"]));
		}
		echo $output;
		echo json_encode($output);
		$conn->close();
	}

	function updateProduct(){
		require("database_connection.php");
		
		$query = sprintf("SELECT password_hash FROM employee WHERE employee_id = '%s'",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$data = $conn->query($query) or die($query);
		
		if(!password_verify($_POST["confirmPass"],$data->fetch_assoc()['password_hash'])){
			echo "Неисправна лозинка! Није могуће променити податке производа!";
			return;
		}
		
		$query = sprintf("UPDATE product SET `name` = '%s', type = '%s', currentSupply = '%s', price = '%s',lastEditBy = '0_%s' WHERE product_id = '%s';",
						 mysqli_real_escape_string($conn,$_POST['name']),
						 mysqli_real_escape_string($conn,$_POST['type']),
						 mysqli_real_escape_string($conn,$_POST['supply']),
						 mysqli_real_escape_string($conn,$_POST['price']),
						 mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),
						 mysqli_real_escape_string($conn,$_POST['product_id']));
		
		$conn->query($query) or die($query);

		$conn->close();
	}

	function addProduct(){
		require("database_connection.php");
		
		move_uploaded_file($_FILES["file_to_upload"]["newImage"],"/images/products/");
		
		$query = sprintf("INSERT INTO product (`name`,type,currentSupply,imageURL,price,lastEditBy) VALUES ('%s','%s',%s,'%s',%s,'0_%s');",
						 mysqli_real_escape_string($conn,$_POST['name']),
						 mysqli_real_escape_string($conn,$_POST['type']),
						 mysqli_real_escape_string($conn,$_POST['supply']),
						 mysqli_real_escape_string($conn,$_POST['image']),
						 mysqli_real_escape_string($conn,$_POST['price']),
						 mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$conn->query($query) or die($query);

		$conn->close();
	}

	function uploadImage(){
		move_uploaded_file($_FILES["file"]["tmp_name"],"/images/products/". $_POST["imageName"] . ".png");
	}

	function logout($save){
		if($save=="true"){
			require("database_connection.php");
			$query = sprintf("UPDATE session SET `status` = 'saved' WHERE sessionUser=%s AND sessionType='employee';",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
			$conn->query($query) or die("Грешка приликом промене статуса сесије!" . $query);
			$conn->close();
			$_SESSION["lastURL"] = substr($_POST["lastURL"],strpos($_POST["lastURL"],'/a')+1);
			echo $_SESSION["lastURL"];
			session_write_close();
		}
		else {
			require("database_connection.php");
			$query = sprintf("DELETE FROM session WHERE sessionUser=%s AND sessionType='employee';",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
			$conn->query($query) or die("Грешка приликом уклањања сесије!");
			$conn->close();
			session_destroy();
		}
		
		echo "FINISHED";
	}
?>
