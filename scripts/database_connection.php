<?php
	$servername = "localhost"; //ili "127.0.0.1"
    $user = "markodojkic";
    $password = "Singidunum201682";
	$database = "prodavnicaOIE";
	global $conn;
    $conn = new mysqli($servername,$user,$password,$database);
    if($conn->connect_error){
        die("Не можемо да се повежемо са базом!" . $conn->connect_error);
    }
?>