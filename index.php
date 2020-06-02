  <?php
	require("Scripts/database_connection.php");

	$query = "CREATE TABLE IF NOT EXISTS `customer` (
  `customer_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastEdit_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `lastEditBy` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `customerName` varchar(64) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password_hash` varchar(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `contactNumber` varchar(13) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(32) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `pak` int(6) NOT NULL,
  `isPremium` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `isEmailSubscribed` tinyint(1) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`customer_id`) USING BTREE,
  UNIQUE KEY `uq_email_password` (`email`,`password_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";
	$conn->query($query) or die($query);

	$query = "CREATE TABLE IF NOT EXISTS `customerPaymentData` (
  `customerPaymentData_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastEdit_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `lastEditBy` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `customer_id` int(10) unsigned NOT NULL,
  `paymentAddress` varchar(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `paymentType` enum('MasterCard','Visa','American Express','Bitcoin','Ethereum','Monero') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`customerPaymentData_id`) USING BTREE,
  UNIQUE KEY `uq_payment_address_payment_type` (`paymentAddress`,`paymentType`) USING BTREE,
  KEY `fk_customerPaymentData_customer_id_customer_customer_id` (`customer_id`),
  CONSTRAINT `fk_customerPaymentData_customer_id_customer_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";
	$conn->query($query) or die($query);

	$query = "CREATE TABLE IF NOT EXISTS `employee` (
  `employee_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastEdit_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `lastEditBy` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(64) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `employeeName` varchar(32) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password_hash` varchar(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `isAdmin` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `totalSales` int(10) NOT NULL DEFAULT '0',
  PRIMARY KEY (`employee_id`) USING BTREE,
  UNIQUE KEY `uq_email_password` (`email`,`password_hash`),
  UNIQUE KEY `uq_employeeName_password` (`employeeName`,`password_hash`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
";
	$conn->query($query) or die($query);

	$query = "CREATE TABLE IF NOT EXISTS `order` (
  `order_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastEdit_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `lastEditBy` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `employee_id` int(10) unsigned DEFAULT NULL,
  `customer_id` int(10) unsigned NOT NULL,
  `status` enum('ordered','shipped','canceled','delivered','returned') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'ordered',
  `payVia` int(10) unsigned NOT NULL,
  PRIMARY KEY (`order_id`) USING BTREE,
  KEY `fk_order_employee_id_employee_employee_id` (`employee_id`),
  KEY `fk_order_customer_id_customer_customer_id` (`customer_id`),
  CONSTRAINT `fk_order_customer_id_customer_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_order_employee_id_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
";
	$conn->query($query) or die($query);

	$query = "CREATE TABLE IF NOT EXISTS `product` (
  `product_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastEdit_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `lastEditBy` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(64) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `type` enum('solarPanel','battery','windTurbine','electricVehicle','controller','inverter','other') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `currentSupply` int(10) unsigned NOT NULL,
  `imageURL` varchar(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `uq_name_type` (`name`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";
	$conn->query($query) or die($query);

	$query = "CREATE TABLE IF NOT EXISTS `order_product` (
  `order_product_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastEdit_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `lastEditBy` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `order_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `amount` int(5) unsigned NOT NULL,
  PRIMARY KEY (`order_product_id`) USING BTREE,
  UNIQUE KEY `uq_order_product_product_id_order_product_order_id` (`product_id`,`order_id`) USING BTREE,
  KEY `fk_order_product_product_id_product_product_id` (`product_id`) USING BTREE,
  KEY `fk_order_product_order_id_order_order_id` (`order_id`),
  CONSTRAINT `fk_order_product_order_id_order_order_id` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_order_product_product_id_product_product_id` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";
	$conn->query($query) or die($query);

	$query = "CREATE TABLE IF NOT EXISTS `session` (
					  `session_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
					  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
					  `lastEdit_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
					  `lastEditBy` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
					  `sessionUser` int(10) unsigned NOT NULL,
					  `sessionName` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
					  `status` enum('active','saved') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'active',
					  `sessionType` enum('customer','employee') COLLATE utf8_unicode_ci DEFAULT 'customer',
					  PRIMARY KEY (`session_id`) USING BTREE,
					  UNIQUE KEY `uq_session_sessionUser_sessionType_sessionName` (`sessionUser`,`sessionType`,`sessionName`) USING BTREE
					)AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";
	$conn->query($query) or die($query);

	$query = "INSERT INTO `customer` VALUES (1, '2020-05-18 16:34:22', '2020-05-19 19:15:25', '0_1', 'Марко Дојкић', '$2y$10\$qA334Wn1kQ1cdEP4iOZe4.mXfLMi3spppTAcLEYWpOYh8aeWzNrKG', '+381641244875', 'marko.dojkic.18@singimail.rs', 478236, 1, 1);
INSERT INTO `customer` VALUES (2, '2020-05-18 16:36:48', '2020-05-20 09:52:40', '2_2', 'Lidija Veljić', '$2y$10\$ybmZ4LPxQva38ACXO.B7Ne10oET/KeYA0T0sKSr3OZH5pjTmpk18q', '0652231487', 'lidija.veljic@gmail.com', 102478, 1, 1);
INSERT INTO `customer` VALUES (3, '2020-05-18 16:56:33', '2020-05-19 19:15:33', '0_1', 'Petra Šljokić', '$2y$10$8N62q6B8USQVQgvSBzmtaeiwNOXf663QW5WLto.PRe6AvFByfco6G', '+381661630875', 'petraa35@yahoo.com', 652014, 0, 1);
INSERT INTO `customer` VALUES (4, '2020-05-18 17:22:51', '2020-05-19 19:46:28', '2_4', 'Јовица Петрушић', '$2y$10\$xvAF919m7M/Fwj1lvhJr2uLn0QHXswd.BcCNFxeXugTgyuVPXgr8q', '0632140014', 'jovica1987@hotmail.com', 111444, 0, 1);

INSERT INTO `employee` VALUES (1, '2020-05-18 16:43:14', NULL, NULL, 'mdojkic@markodojkic.rs', 'Марко Дојкић', '$2y$10\$7yQMag3xAzFa8ogaCG4RlOJEXArXlxVHasB/AxLa7RNrtNNF0lGg2', 1, 0);
INSERT INTO `employee` VALUES (2, '2020-05-18 16:44:13', NULL, NULL, 'mpekic@markodojkic.rs', 'Milan Pekić', '$2y$10$763GUYuueZXM63YD5Xa/RuoSV3hsb5KtJPiLphbogmmwEcTcWsPT.', 0, 0);

INSERT INTO `customerPaymentData` VALUES (1, '2020-05-18 16:50:06', NULL, NULL, 1, '1Gjmpikp51Bf2eKzzReVqVHfuvbhaayhE', 'Bitcoin');
INSERT INTO `customerPaymentData` VALUES (2, '2020-05-18 16:50:47', NULL, NULL, 1, '5108858976435611', 'MasterCard');
INSERT INTO `customerPaymentData` VALUES (3, '2020-05-18 16:51:05', NULL, NULL, 2, '4716430562137576', 'Visa');
INSERT INTO `customerPaymentData` VALUES (4, '2020-05-18 16:57:14', NULL, NULL, 3, '374811401623861', 'American Express');
INSERT INTO `customerPaymentData` VALUES (5, '2020-05-18 18:25:15', '2020-05-18 18:26:38', '3', 3, '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A\n', 'Monero');
INSERT INTO `customerPaymentData` VALUES (6, '2020-05-18 18:26:15', NULL, NULL, 3, '5500 0000 0000 0004', 'MasterCard');
INSERT INTO `customerPaymentData` VALUES (7, '2020-05-20 09:50:47', NULL, '2_2', 2, '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', 'Ethereum');

INSERT INTO `product` VALUES (1, '2020-05-18 18:43:38', '2020-05-20 10:22:44', '2_1', 'Поликристални 12V/230W', 'solarPanel', 498, 'product_1.png', 18000.00);
INSERT INTO `product` VALUES (2, '2020-05-18 19:07:23', '2020-05-20 10:22:44', '2_1', 'Поликристални 12V/150W', 'solarPanel', 298, 'product_2.png', 11000.00);
INSERT INTO `product` VALUES (3, '2020-05-18 19:07:59', '2020-05-19 12:41:48', '1', 'Поликристални 12V/75W', 'solarPanel', 80, 'product_3.png', 6000.00);
INSERT INTO `product` VALUES (4, '2020-05-19 12:44:48', NULL, '1', 'Аморфни 12V/4W', 'solarPanel', 50, 'product_4.png', 6000.00);
INSERT INTO `product` VALUES (5, '2020-05-19 12:47:15', '2020-05-19 12:49:08', '1', 'Аморфни 12V/36W', 'solarPanel', 20, 'product_5.png', 3000.00);
INSERT INTO `product` VALUES (6, '2020-05-19 12:49:44', NULL, '1', 'Аморфни 12V/12W', 'solarPanel', 35, 'product_6.png', 1800.00);
INSERT INTO `product` VALUES (7, '2020-05-19 12:49:44', '2020-05-19 18:31:59', '3', 'Монокристални 24V/150W', 'solarPanel', 28, 'product_7.png', 9500.00);
INSERT INTO `product` VALUES (8, '2020-05-19 12:51:27', '2020-05-19 12:52:12', '1', 'Монокристални 24V/350W', 'solarPanel', 600, 'product_8.png', 15500.00);
INSERT INTO `product` VALUES (9, '2020-05-19 12:52:48', NULL, '1', 'Монокристални ZPV 12V/250W', 'solarPanel', 30, 'product_9.png', 16200.00);
INSERT INTO `product` VALUES (10, '2020-05-19 12:56:33', NULL, '1', 'Монокристални ZPV 12V/125W', 'solarPanel', 8, 'product_10.png', 10000.00);
INSERT INTO `product` VALUES (11, '2020-05-19 12:59:05', '2020-05-20 10:11:35', '', 'Ветрогенератор 12V/500W', 'windTurbine', 20, 'product_11.png', 45000.00);
INSERT INTO `product` VALUES (12, '2020-05-19 13:08:19', '2020-05-19 18:31:59', '3', 'Ветрогенератор 24V/1000W', 'windTurbine', 22, 'product_12.png', 85000.00);
INSERT INTO `product` VALUES (13, '2020-05-19 13:09:22', '2020-05-20 10:17:26', '2_2', 'Ветрогенератор 36V/1500W', 'windTurbine', 51, 'product_13.png', 63780.00);
INSERT INTO `product` VALUES (14, '2020-05-19 13:09:43', NULL, '1', 'Ветрогенератор 12V/100W', 'windTurbine', 3, 'product_14.png', 12300.00);
INSERT INTO `product` VALUES (15, '2020-05-19 13:27:19', NULL, '1', 'PWM 12/24V 10A USB', 'controller', 15, 'product_15.png', 3000.00);
INSERT INTO `product` VALUES (16, '2020-05-19 13:27:39', NULL, '1', 'PWM 12/24V 20A USB', 'controller', 12, 'product_16.png', 4500.00);
INSERT INTO `product` VALUES (17, '2020-05-19 13:28:10', '2020-05-19 18:39:40', '4', 'PWM 12/24V 30', 'controller', 9, 'product_17.png', 5500.00);
INSERT INTO `product` VALUES (18, '2020-05-19 13:28:42', '2020-05-20 10:22:44', '2_1', 'MPPT 12/24V 30A', 'controller', 7, 'product_18.png', 12100.00);
INSERT INTO `product` VALUES (19, '2020-05-19 13:30:10', '2020-05-19 18:31:59', '3', 'MPPT 12/24/48V 60A', 'controller', 2, 'product_19.png', 25000.00);
INSERT INTO `product` VALUES (20, '2020-05-19 13:31:26', NULL, '1', 'MPPT 12/24/48V 30A', 'controller', 2, 'product_20.png', 18350.00);
INSERT INTO `product` VALUES (21, '2020-05-19 13:32:06', NULL, '1', 'MPPT 12/24V 10A', 'controller', 7, 'product_21.png', 9500.00);
INSERT INTO `product` VALUES (22, '2020-05-19 13:33:14', NULL, '1', 'MPPT 12/24/36/48V 60A', 'controller', 6, 'product_22.png', 35000.00);
INSERT INTO `product` VALUES (23, '2020-05-19 13:34:23', NULL, '1', 'Инвертор 12V/24V/220V 1500W', 'inverter', 6, 'product_23.png', 12500.00);
INSERT INTO `product` VALUES (24, '2020-05-19 13:34:44', '2020-05-19 18:31:59', '3', 'Инвертор 12V/24V/220V 2500W', 'inverter', 2, 'product_24.png', 22300.00);
INSERT INTO `product` VALUES (25, '2020-05-19 13:35:27', '2020-05-19 13:35:34', '1', 'Инвертор On-Grid 48/220/380V 15000W', 'inverter', 18, 'product_25.png', 50200.00);
INSERT INTO `product` VALUES (26, '2020-05-19 13:36:04', '2020-05-19 18:39:40', '4', 'Инвертор 12V/24V/220V 500W', 'inverter', 5, 'product_26.png', 11200.00);
INSERT INTO `product` VALUES (27, '2020-05-19 13:36:44', NULL, '1', 'Инвертор On-Grid 48/380V 5000W', 'inverter', 3, 'product_27.png', 45000.00);
INSERT INTO `product` VALUES (28, '2020-05-19 13:39:04', '2020-05-19 13:39:23', '1', 'Инвертор 12V/24V/220V 1200W', 'inverter', 3, 'product_28.png', 15000.00);
INSERT INTO `product` VALUES (29, '2020-05-19 13:39:45', '2020-05-19 13:39:59', '1', 'Инвертор 12V/24V/220V 1000W', 'inverter', 6, 'product_29.png', 13000.00);
INSERT INTO `product` VALUES (30, '2020-05-19 13:45:10', '2020-05-19 18:31:59', '3', 'Аутомобил Tesla model S', 'electricVehicle', 149, 'product_30.png', 8000000.00);
INSERT INTO `product` VALUES (31, '2020-05-19 13:46:25', '2020-05-20 10:17:26', '2_2', 'Аутомобил Tesla model 3', 'electricVehicle', 303, 'product_31.png', 3500000.00);
INSERT INTO `product` VALUES (32, '2020-05-19 13:48:15', '2020-05-20 10:22:44', '2_1', 'Аутомобил Tesla model X', 'electricVehicle', 59, 'product_32.png', 7500000.00);
INSERT INTO `product` VALUES (33, '2020-05-19 13:50:05', '2020-05-19 18:39:40', '4', 'Аутомобил Zhidou D2', 'electricVehicle', 29, 'product_33.png', 120000.00);
INSERT INTO `product` VALUES (34, '2020-05-19 13:51:22', NULL, '1', 'Аутомобил Zhidou Cenntro', 'electricVehicle', 3, 'product_34.png', 145000.00);
INSERT INTO `product` VALUES (35, '2020-05-19 13:54:54', '2020-05-20 10:18:55', '2_2', 'Бицикл Scooter CSS-53Q', 'electricVehicle', 8, 'product_35.png', 122990.00);
INSERT INTO `product` VALUES (36, '2020-05-19 13:55:55', NULL, '1', 'Бицикл E-PRIME Experience', 'electricVehicle', 30, 'product_36.png', 339790.00);
INSERT INTO `product` VALUES (37, '2020-05-19 13:58:06', NULL, '1', 'Оловни AGM 50Ah', 'battery', 300, 'product_37.png', 6000.00);
INSERT INTO `product` VALUES (38, '2020-05-19 13:58:31', NULL, '1', 'Оловни AGM 70Ah', 'battery', 600, 'product_38.png', 7500.00);
INSERT INTO `product` VALUES (39, '2020-05-19 13:58:54', NULL, '1', 'Оловни AGM 100Ah', 'battery', 300, 'product_39.png', 9200.00);
INSERT INTO `product` VALUES (40, '2020-05-19 13:59:20', '2020-05-19 18:39:40', '4', 'Оловни GEL 70Ah', 'battery', 29, 'product_40.png', 9200.00);
INSERT INTO `product` VALUES (41, '2020-05-19 13:59:41', '2020-05-20 10:22:44', '2_1', 'Оловни GEL 120Ah', 'battery', 57, 'product_41.png', 15000.00);
INSERT INTO `product` VALUES (42, '2020-05-19 14:03:22', NULL, '1', 'Никл-кадмијумски 1.2V 50Ah', 'battery', 3000, 'product_42.png', 4500.00);
INSERT INTO `product` VALUES (43, '2020-05-19 14:03:49', NULL, '1', 'Никл-кадмијумски 1.2V 100Ah', 'battery', 600, 'product_43.png', 9200.00);
INSERT INTO `product` VALUES (44, '2020-05-19 14:05:34', NULL, '1', 'Никл-метал-хидридни 1.2V 4.5Ah', 'battery', 150000, 'product_44.png', 250.00);
INSERT INTO `product` VALUES (45, '2020-05-19 14:06:06', NULL, '1', 'Никл-метал-хидридни 1.2V 10Ah', 'battery', 35000, 'product_45.png', 1200.00);
INSERT INTO `product` VALUES (46, '2020-05-19 14:09:32', '2020-05-19 18:31:59', '3', 'Никл-гвоздени 12V 50Ah', 'battery', 148, 'product_46.png', 45000.00);
INSERT INTO `product` VALUES (47, '2020-05-19 14:10:36', NULL, '1', 'Никл-гвоздени 48V 500Ah', 'battery', 30, 'product_47.png', 95000.00);
INSERT INTO `product` VALUES (48, '2020-05-19 14:12:11', NULL, '1', 'Литијумски U-POWER UE-12Li125BL 12V 125Ah', 'battery', 60, 'product_48.png', 115000.00);
INSERT INTO `product` VALUES (49, '2020-05-19 14:13:04', NULL, '1', 'Литијумски PowerBrick 12V 7.5Ah', 'battery', 150, 'product_49.png', 15320.00);
INSERT INTO `product` VALUES (50, '2020-05-19 14:13:56', NULL, '1', 'Литијумски 12V 160Ah', 'battery', 30, 'product_50.png', 436000.00);

INSERT INTO `order` VALUES (1, '2020-05-18 19:48:30', '2020-05-19 19:11:43', '1_1', 1, 2, 'delivered', 3);
INSERT INTO `order` VALUES (2, '2020-05-19 11:50:40', '2020-05-19 19:11:49', '1_1', 1, 3, 'shipped', 5);
INSERT INTO `order` VALUES (3, '2020-05-19 18:31:59', '2020-05-19 18:36:39', '1_2', 2, 3, 'shipped', 4);
INSERT INTO `order` VALUES (4, '2020-05-19 18:39:40', '2020-05-19 19:11:58', '1_1', 1, 4, 'delivered', 0);
INSERT INTO `order` VALUES (5, '2020-05-20 10:17:26', '2020-05-20 10:23:34', '1_2', 2, 2, 'shipped', 7);
INSERT INTO `order` VALUES (6, '2020-05-20 10:18:55', '2020-05-20 10:25:42', '1_1', 1, 2, 'returned', 7);
INSERT INTO `order` VALUES (7, '2020-05-20 10:22:44', '2020-05-20 10:25:37', '1_1', 1, 1, 'canceled', 1);

INSERT INTO `order_product` VALUES (1, '2020-05-18 19:48:30', NULL, '2', 1, 1, 4);
INSERT INTO `order_product` VALUES (2, '2020-05-18 19:48:30', NULL, '2', 1, 3, 3);
INSERT INTO `order_product` VALUES (3, '2020-05-19 11:50:40', NULL, '3', 2, 2, 3);
INSERT INTO `order_product` VALUES (4, '2020-05-19 18:31:59', NULL, '3', 3, 7, 1);
INSERT INTO `order_product` VALUES (5, '2020-05-19 18:31:59', NULL, '3', 3, 12, 1);
INSERT INTO `order_product` VALUES (6, '2020-05-19 18:31:59', NULL, '3', 3, 19, 1);
INSERT INTO `order_product` VALUES (7, '2020-05-19 18:31:59', NULL, '3', 3, 24, 1);
INSERT INTO `order_product` VALUES (8, '2020-05-19 18:31:59', NULL, '3', 3, 30, 1);
INSERT INTO `order_product` VALUES (9, '2020-05-19 18:31:59', NULL, '3', 3, 46, 2);
INSERT INTO `order_product` VALUES (10, '2020-05-19 18:39:40', NULL, '4', 4, 1, 1);
INSERT INTO `order_product` VALUES (11, '2020-05-19 18:39:40', NULL, '4', 4, 2, 1);
INSERT INTO `order_product` VALUES (12, '2020-05-19 18:39:40', NULL, '4', 4, 17, 1);
INSERT INTO `order_product` VALUES (13, '2020-05-19 18:39:40', NULL, '4', 4, 26, 1);
INSERT INTO `order_product` VALUES (14, '2020-05-19 18:39:40', NULL, '4', 4, 33, 1);
INSERT INTO `order_product` VALUES (15, '2020-05-19 18:39:40', NULL, '4', 4, 40, 1);
INSERT INTO `order_product` VALUES (16, '2020-05-20 09:53:22', NULL, '2', 4, 11, 1);
INSERT INTO `order_product` VALUES (17, '2020-05-20 09:53:22', NULL, '2', 4, 31, 2);
INSERT INTO `order_product` VALUES (18, '2020-05-20 09:56:30', NULL, '2', 4, 13, 1);
INSERT INTO `order_product` VALUES (24, '2020-05-20 10:17:26', NULL, '2', 5, 13, 4);
INSERT INTO `order_product` VALUES (25, '2020-05-20 10:17:26', NULL, '2', 5, 31, 2);
INSERT INTO `order_product` VALUES (26, '2020-05-20 10:18:55', NULL, '2', 6, 35, 4);
INSERT INTO `order_product` VALUES (27, '2020-05-20 10:22:44', NULL, '1', 7, 1, 1);
INSERT INTO `order_product` VALUES (28, '2020-05-20 10:22:44', NULL, '1', 7, 2, 1);
INSERT INTO `order_product` VALUES (29, '2020-05-20 10:22:44', NULL, '1', 7, 18, 1);
INSERT INTO `order_product` VALUES (30, '2020-05-20 10:22:44', NULL, '1', 7, 32, 1);
INSERT INTO `order_product` VALUES (31, '2020-05-20 10:22:44', NULL, '1', 7, 41, 3);";
	$conn->multi_query($query);
	//Napomena tabela session se ne popunjava demo podacima!
	$conn->close();
  ?>
  <!doctype html>
  <html>
	  <head>
		  <meta charset="UTF-8">
		  <title>ОИЕ продавница - Почетна страница</title>
		  <meta name="viewport" content="width=device-width, initial-scale=1">
		  <link href="scripts/index.css" rel="stylesheet" type="text/css">
		  <script src="scripts/index.js" type="text/javascript"></script>
		  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
		  <script>var __adobewebfontsappname__="dreamweaver"</script><script src="https://use.edgefonts.net/montserrat:n4:default;source-sans-pro:n2:default.js" type="text/javascript"></script>
	  </head>

	  <body>
		  <div id="mainWrapper">
			<div id="registrationMenu">
				<form id="registration">
					<div class="close-container" onclick="hideRegistrationMenu();	">
					  <div class="leftright"></div>
					  <div class="rightleft"></div>
					</div>
					<div class="input">
						<label for="nameSurname" class="label">Име и презиме:</label>
						<input type="text" id="nameSurname" name="nameSurname" onchange="checkNS()">
					</div>
					<div class="input">
						<label for="password" class="label">Лозинка:</label>
						<input type="password" id="password" name="password" onchange="checkPass()">
					</div>
					<div class="input">
						<label for="phone" class="label">Телефон:</label>
						<input type="text" id="phone" name="phone" onchange="checkPhone()">
					</div>
					<div class="input">
						<label for="email" class="label">Е-мејл:</label>
						<input type="text" id="email" name="email" onchange="checkEmail()">
					</div>
					<div class="input">
						<label for="pak" class="label">ПАК (Поштански адресни код):</label>
						<input type="text" id="pak" name="pak" onchange="checkPAK()">
					</div>
					<div class="input">
						<label for="paymentAddress" class="label">Број кредитне картице/адреса новчаника крипто валуте:</label>
						<input type="text" id="paymentAddress" name="paymentAddress" onchange="checkPaymentAddress()">
					</div>
					<div class="input">
						<label for="paymentType" class="label">Врста кредитне картице/крипто валуте:</label><br>
						MasterCard <input type="radio" value="MasterCard" class="radio1" name="paymentType">
						Visa <input type="radio" value="Visa" class="radio1" name="paymentType">
						American Express <input type="radio" value="American Express" class="radio1" name="paymentType">
						Bitcoin <input type="radio" value="Bitcoin" class="radio1" name="paymentType">
						Ethereum <input type="radio" value="Ethereum" class="radio1" name="paymentType">
						Monero <input type="radio" value="Monero" class="radio1" name="paymentType">
					</div>
					<div class="input">
						Желим да се претплатим на новости <input type="checkbox" value="true" class="wantsToBeSubscribed" name="wantsToBeSubscribed">
					</div>
					<div class="input">
						<button type="button" onclick="submitForm()">Региструји се</button>
						<button type="button" onclick="resetForm()">Врати форму на почетно стање</button>
					</div>
				</form>
			</div> 
			<header> 
			  <div id="logoPlaceholder">
				<div id="logo"></div>
				<p>ОИЕ продавница</p>
			  </div>

			  <div id="headerLinks">
				  <a href="index.html" title="homepage">Почетна страница</a>
				  <a href="#" id="login" onMouseOver="showLogin();" class="upArrow">Улогујте се </a>
				  <div class="loginMenu" onMouseOver="showLogin();" onMouseOut="resetArrow();">
					  <div class="input">
						<label for="email_login" class="label">Email:</label>
						<input required="" type="text" id="email_login" name="email_login">
					  </div>
					  <div class="input">
						<label for="password_login" class="label">Password:</label>
						<input required="" type="password" id="password_login" name="password_login">
					  </div>
					  <div class="input">
						<label for="loginAs" class="label">Улогуј ме као:</label></br> Корисника<input type="radio" value="customer" class="radio1" name="loginAs"> Запосленог<input type="radio" value="employee" class="radio1" name="loginAs">
					  </div>
					  <div id="response"></div>
					  <button type="button" id="loginBtn" onClick="login();">Login</button>
				  </div>
				  <a href="#" id="registrationButton" onClick="showRegistrationMenu();">Региструјте се</a>
			  </div>
			</header>
			<section id="offer"> 
			  <h2>Добродошли у продавницу обновљивих извора енергије - БЕСПЛАТНА ДОСТАВА</h2>
			  <p>НУДИМО СПЕЦИЈАЛНЕ ПОПУСТЕ ТОКОМ ЛЕТЊИХ МЕСЕЦИ (ЈУН, ЈУЛ, АВГУСТ) НА СОЛАРНУ ОПРЕМУ</p>
			</section>
			<div id="content">
			  <img src="images/lockShop.png" alt="lockedShop">
			</div>
			<footer> 
			  <div>
				<p>Овај пројекат је направљен у сврхе 2.-ог колоквијума из предмета „Веб програмирање” на Универзитету Сингидунум</p>
			  </div>
			  <div>
				<p>© 2020 Марко Дојкић 2018/201682 - Студент смера Софтверско и информационо инжењерство.</p>
			  </div>
			</footer>
		  </div>
	  </body>
  </html>