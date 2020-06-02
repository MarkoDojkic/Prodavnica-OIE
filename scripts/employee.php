<?php
	session_start();

	switch($_POST["function_id"]){
		case "1": getEmpName(); break;
		case "2": getEmpData(); break;
		case "3": getCustData(); break;
		case "4": getOrderData(); break;
		case "5": getProductData($_POST["order_id"]); break;
		case "6": takeOrder($_POST["order_id"]); break;
		case "7": changeOrderStatus($_POST["order_id"]); break;
		case "8": logout($_POST["save"]); break;
	}

	function getEmpName(){
		if($_SESSION["current_user_id"]==null){
			echo "\n!" . "index.php";
			session_destroy();
			return;
		}
		require("database_connection.php");
		$query = sprintf("SELECT employeeName,isAdmin FROM employee WHERE employee_id='%s';", mysqli_real_escape_string($conn,$_SESSION['current_user_id']));
		$data = $conn->query($query);
		while($red = $data->fetch_assoc()){
			echo $red['employeeName'];
			echo "\nisAdmin=" . $red['isAdmin'];
			echo "!" . $_SESSION["lastURL"];
		}
	}

	function getEmpData(){
		require("database_connection.php");
		$query = sprintf("SELECT * FROM employee WHERE employee_id='%s';",mysqli_real_escape_string($conn,$_SESSION['current_user_id']));
		$data = $conn->query($query);
		while($red = $data->fetch_assoc()){
			echo "Име и презиме:" . $red["employeeName"] . "&";
			echo "Е-мајл адреса:" . $red["email"] . "&";
			if($red["isAdmin"] == 1) echo "Јесте админ: ДА&";
			else echo "Јесте админ: НЕ&";
			echo "Укупан број продаја:" . $red["totalSales"] . "&";
		}
	}

	function getOrderData(){
		require("database_connection.php");
		
		$query = sprintf("SELECT `order`.order_id AS id, `order`.`status` AS `status`, employee.employeeName AS empName, customer.customerName AS custName,customerPaymentData.paymentType AS pT, customerPaymentData.paymentAddress as pA
							FROM `order`
							LEFT JOIN employee ON `order`.employee_id = employee.employee_id
							LEFT JOIN customerPaymentData ON `order`.payVia = customerPaymentData.customerPaymentData_id
							INNER JOIN customer ON `order`.customer_id = customer.customer_id
							WHERE `order`.employee_id = %s OR ISNULL(`order`.employee_id);", mysqli_real_escape_string($conn,$_SESSION['current_user_id']));
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

	function getProductData($order_id){ //FIXED FOR ORDER BY IN FUTURE ORDER BY COULD BE SUCCESFULLY IMPLEMENTED!!!
		require("database_connection.php");
		$ukupnaCena = 0;
		$query = sprintf("SELECT order_product_id AS id, product.`name` AS prName, product.type AS prType, product.price AS prPrice, order_product.amount AS prAmount, 
								(order_product.amount * product.price) AS totalCost
							FROM order_product
							INNER JOIN product ON order_product.product_id = product.product_id
							WHERE order_product.order_id = %s ORDER BY prPrice;",$order_id,$order_id);
		$data = $conn->query($query) or die($query);
		$output = array();
		while($red = $data->fetch_assoc()){
			array_push($output, (array (
					"Назив:" => $red["prName"],
					"Врста:" => $red["prType"],
					"Јединична цена:" => $red["prPrice"],
					"Поручена количина:" => $red["prAmount"],
					"Укупна цена:" => $red["totalCost"]
				)));
		}
		foreach($output as $product){
			$ukupnaCena += $product["Јединична цена:"]*$product["Поручена количина:"];
		}
		array_push($output, array ("totalOrderCost" => $ukupnaCena));
		echo json_encode($output);
		$conn->close();
	}

	function takeOrder($order_id){
		require("database_connection.php");
		
		$query = sprintf("SELECT password_hash FROM employee WHERE employee_id = '%s'",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$data = $conn->query($query) or die($query);
		
		if(!password_verify($_POST["confirmPass"],$data->fetch_assoc()['password_hash'])){
			echo "Неисправна лозинка! Није могуће преузети поруџбину!";
			return;
		}
		
		$query = sprintf("UPDATE `order` SET `order`.employee_id=%s, `order`.lastEditBy = '1_%s' WHERE `order`.order_id = %s;",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$order_id));
		$conn->query($query) or die($query);
		$query = sprintf("UPDATE employee SET employee.totalSales=employee.totalSales+1, employee.lastEditBy = '1_%s' WHERE employee.employee_id = %s;",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		$conn->query($query) or die($query);
		$conn->close();
	}

	function changeOrderStatus($order_id){
		require("database_connection.php");
		
		$query = sprintf("SELECT password_hash FROM employee WHERE employee_id = '%s'",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
		
		$data = $conn->query($query) or die($query);
		
		if(!password_verify($_POST["confirmPass"],$data->fetch_assoc()['password_hash'])){
			echo "Неисправна лозинка! Није могуће променити статус поруџбине!";
			return;
		}
		
		$query = sprintf("UPDATE `order` SET `order`.`status`='%s', `order`.lastEditBy = '1_%s' WHERE `order`.order_id = %s;",mysqli_real_escape_string($conn,strtolower($_POST["new_status"])),mysqli_real_escape_string($conn,$_SESSION["current_user_id"]),mysqli_real_escape_string($conn,$order_id));
		$data = $conn->query($query) or die($query);
		$conn->close();
	}

	function logout($save){
		if($save=="true"){
			require("database_connection.php");
			$query = sprintf("UPDATE session SET `status` = 'saved' WHERE sessionUser=%s AND sessionType='employee';",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
			$conn->query($query) or die("Грешка приликом промене статуса сесије!" . $query);
			$conn->close();
			$_SESSION["lastURL"] = substr($_POST["lastURL"],strpos($_POST["lastURL"],'/e')+1);
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