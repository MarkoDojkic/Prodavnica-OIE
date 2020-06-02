<?php
	require("database_connection.php");
	//session_start();

	if($_POST['loginAs']=='customer'){
		$query = sprintf("SELECT customer_id,password_hash FROM customer WHERE email='%s';",mysqli_real_escape_string($conn,$_POST['email']));
		$data = $conn->query($query);
		while($red = $data->fetch_assoc()){
			$user = $red['customer_id'];
			$pass = $red['password_hash'];
		}
	}
	else if($_POST['loginAs']=='employee'){
		$query = sprintf("SELECT employee_id,password_hash FROM employee WHERE email='%s';", mysqli_real_escape_string($conn,$_POST['email']));
		$data = $conn->query($query);
		while($red = $data->fetch_assoc()){
			$user = $red['employee_id'];
			$pass = $red['password_hash'];
		}
	}
	else {
		echo "Нисте изабрали опцију ”Улогуј ме као”!";
		return;
	}
	
	if($pass === null)
		echo "Налог није пронађен!";
	else if(!password_verify($_POST['password'],$pass))
		echo "Погрешна лозинка!";
	else {
		$query = sprintf("SELECT sessionName, `status` AS sessionStatus FROM `session` WHERE sessionUser=%s AND sessionType='%s';",mysqli_real_escape_string($conn,$user),mysqli_real_escape_string($conn,$_POST['loginAs']));
		$data = $conn->query($query);
		while($red = $data->fetch_assoc()){
			$sessionName = $red['sessionName'];
			$sessionStatus = $red['sessionStatus'];
		}
		
		if($sessionStatus == 'active')
			echo "Корисник је већ улогован!";
		else if($sessionStatus == 'saved') {
			$query = sprintf("UPDATE session SET `status` = 'active' WHERE sessionUser=%s AND sessionType='%s';",mysqli_real_escape_string($conn,$user),mysqli_real_escape_string($conn,$_POST['loginAs']));
			$conn->query($query) or die("Грешка приликом промене статуса сесије!");
			session_id($sessionName);
			session_start();
			echo "Пронађена је сачивана сесија! Успешно сте се улоговали!\n";
		}
		else {
			session_start();
			$query = sprintf("INSERT INTO session (sessionUser,sessionName,status,sessionType)
						VALUES (%s,'%s','active','%s')",
						mysqli_real_escape_string($conn,$user),mysqli_real_escape_string($conn,session_id()),mysqli_real_escape_string($conn,$_POST['loginAs']));
			$conn->query($query) or die("Грешка приликом уношења сесије!");
			$_SESSION["current_user_id"] = $user;
			echo "Успешно сте се улоговали!";
		}		
	}
	$conn->close();
?>