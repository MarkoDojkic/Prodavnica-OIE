<?php
	require("database_connection.php");

	if($_POST['wantsToBeSubscribed']) $subscripted = 1;
	else $subscripted = 0;

	$query = sprintf("INSERT INTO customer (customerName, password_hash, contactNumber, email, pak, isEmailSubscribed)
					VALUES ('%s','%s','%s','%s','%s','%s')",
					 mysqli_real_escape_string($conn,$_POST['nameSurname']),
					 mysqli_real_escape_string($conn,password_hash($_POST['password'],PASSWORD_DEFAULT)),
					 mysqli_real_escape_string($conn,$_POST['phone']),
					 mysqli_real_escape_string($conn,$_POST['email']),
					 mysqli_real_escape_string($conn,$_POST['pak']),
					 mysqli_real_escape_string($conn,$subscripted));
	$conn->query($query) or die("Грешка приликом додавања новог корисника!");

	$query = sprintf("SELECT customer_id FROM customer WHERE email='%s';", mysqli_real_escape_string($conn,$_POST['email']));
	$data = $conn->query($query);
	$customer_id = $data->fetch_assoc()['customer_id'];

	$query = sprintf("INSERT INTO customerPaymentData (customer_id, paymentAddress, paymentType)
					VALUES('%s','%s','%s')",
					mysqli_real_escape_string($conn,$_POST['$customer_id']),
					mysqli_real_escape_string($conn,$_POST['paymentAddress']),
					mysqli_real_escape_string($conn,$_POST['paymentType']));
	$conn->query($query) or die("Грешка приликом додавања начина плаћања новог корисника!" . $query);

    $conn->close();
?>

