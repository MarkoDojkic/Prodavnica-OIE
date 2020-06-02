<?php
	session_start();
	switch($_POST["function_id"]){
		case "1": getProducts(); break;
		case "2": logout($_POST["save"]); break;
		case "3": addToCart($_POST["product_id"]); break;
	}

	function getProducts(){
		require("database_connection.php");
		if($_SESSION["current_user_id"]==null){
			echo "index.php";
			session_destroy();
			return;
		}
		$query = sprintf("SELECT product.product_id AS id, product.name AS name, product.type AS product_type, product.imageURL AS image_url, product.price AS price, product.currentSupply AS supply FROM product;");
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
		echo json_encode($output);
		$conn->close();
	}

	function logout($save){
		if($save=="true"){
			require("database_connection.php");
			$query = sprintf("UPDATE session SET `status` = 'saved' WHERE sessionUser=%s AND sessionType='customer';",mysqli_real_escape_string($conn,$_SESSION["current_user_id"]));
			$conn->query($query) or die("Грешка приликом промене статуса сесије!" . $query);
			$conn->close();
			$_SESSION["lastURL"] = substr($_POST["lastURL"],strpos($_POST["lastURL"],'/s')+1);
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

	function addToCart($product_id){
		if($_SESSION["cart"]==null || sizeof($_SESSION["cart"])==0){
			$_SESSION["cart"] = array();
			$_SESSION["cart"][sizeof($_SESSION["cart"])] = array($product_id,1);
			echo "Креирали сте нову корпу!\n";
			echo "Број производа у корипи:" . sizeof($_SESSION["cart"]);
			echo "\nКоличина производа " . $_SESSION["cart"][sizeof($_SESSION["cart"])-1][0] . " у корипи: " . $_SESSION["cart"][sizeof($_SESSION["cart"])-1][1];
			return;
		}
		
		foreach($_SESSION["cart"] as $p){
			if($p==null) break;
			if($p[0] == $product_id){
				$_SESSION["cart"][sizeof($_SESSION["cart"])-1][1]++;
				echo "*Број производа у корипи:" . sizeof($_SESSION["cart"]);
				echo "\nКоличина производа " . $_SESSION["cart"][sizeof($_SESSION["cart"])-1][0] . " у корипи: " . $_SESSION["cart"][sizeof($_SESSION["cart"])-1][1];
				return;
			}
		}
		
		$_SESSION["cart"][sizeof($_SESSION["cart"])] = array($product_id,1);
		echo "Број производа у корипи:" . sizeof($_SESSION["cart"]);
		echo "\nКоличина производа " . $_SESSION["cart"][sizeof($_SESSION["cart"])-1][0] . " у корипи: " . $_SESSION["cart"][sizeof($_SESSION["cart"])-1][1];
	}
?>