-- MySQL dump 10.16  Distrib 10.2.8-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: database_pbl6
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_booking`
--

DROP TABLE IF EXISTS `tbl_booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_booking` (
  `bookingId` int(11) NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `address` varchar(255) NOT NULL,
  `bookingDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `numAdults` int(11) NOT NULL,
  `numChildren` int(11) NOT NULL,
  `totalPrice` decimal(12,2) NOT NULL DEFAULT 0.00,
  `bookingStatus` enum('pending','confirmed','canceled','paid') NOT NULL DEFAULT 'pending',
  `receiveEmail` tinyint(4) NOT NULL DEFAULT 1,
  `tourId` int(11) DEFAULT NULL,
  `dateId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`bookingId`),
  KEY `FK_3835761ec018c7dd2e49d5f9440` (`tourId`),
  KEY `FK_74ae5a29b0116e2e991554606a5` (`dateId`),
  KEY `FK_ed1693cae6b1b419661c238c8cb` (`userId`),
  CONSTRAINT `FK_3835761ec018c7dd2e49d5f9440` FOREIGN KEY (`tourId`) REFERENCES `tbl_tour` (`tourId`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_74ae5a29b0116e2e991554606a5` FOREIGN KEY (`dateId`) REFERENCES `tbl_start_end_date` (`dateId`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_ed1693cae6b1b419661c238c8cb` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`userId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_booking`
--

LOCK TABLES `tbl_booking` WRITE;
/*!40000 ALTER TABLE `tbl_booking` DISABLE KEYS */;
INSERT INTO `tbl_booking` VALUES (1,'Nguyễn Văn A','A@gmail.com','08981652347','','2025-09-17 06:42:12.518889',5,2,20000000.00,'pending',1,1,NULL,1),(2,'Nguyễn Văn A','A@gmail.com','08981652347','','2025-09-17 06:43:03.904768',5,2,20000000.00,'paid',0,1,1,1);
/*!40000 ALTER TABLE `tbl_booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_checkout`
--

DROP TABLE IF EXISTS `tbl_checkout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_checkout` (
  `checkoutId` int(11) NOT NULL AUTO_INCREMENT,
  `bookingId` int(11) NOT NULL,
  `paymentMethod` varchar(255) NOT NULL,
  `paymentDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paymentStatus` varchar(255) NOT NULL,
  `transactionId` varchar(255) NOT NULL,
  PRIMARY KEY (`checkoutId`),
  KEY `FK_746eb56ccaca6bb4078fb1bbd63` (`bookingId`),
  CONSTRAINT `FK_746eb56ccaca6bb4078fb1bbd63` FOREIGN KEY (`bookingId`) REFERENCES `tbl_booking` (`bookingId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_checkout`
--

LOCK TABLES `tbl_checkout` WRITE;
/*!40000 ALTER TABLE `tbl_checkout` DISABLE KEYS */;
INSERT INTO `tbl_checkout` VALUES (1,1,'CASH','2025-09-17 06:57:00.689702',20000000.00,'SUCCESS',''),(2,1,'BANKING','2025-09-17 06:58:35.855024',22000000.00,'SUCCESS','28963121254785292');
/*!40000 ALTER TABLE `tbl_checkout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_coupons`
--

DROP TABLE IF EXISTS `tbl_coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_coupons` (
  `couponId` int(11) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `codeCoupon` varchar(10) NOT NULL,
  `discount` double NOT NULL,
  `status` enum('y','n') NOT NULL DEFAULT 'y',
  `startDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `endDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`couponId`),
  UNIQUE KEY `IDX_a7341a8c0bd8edd20078f2298b` (`codeCoupon`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_coupons`
--

LOCK TABLES `tbl_coupons` WRITE;
/*!40000 ALTER TABLE `tbl_coupons` DISABLE KEYS */;
INSERT INTO `tbl_coupons` VALUES (1,'Ngày đại săn sales','SALE2025',20,'y','2025-10-09 10:36:14.178409','2025-10-09 10:36:14.187449'),(2,'săn sale đi tour cùng tôi','SALETOUR',25,'n','2025-10-09 10:36:14.178409','2025-10-09 10:36:14.187449');
/*!40000 ALTER TABLE `tbl_coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_favourite`
--

DROP TABLE IF EXISTS `tbl_favourite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_favourite` (
  `favouriteId` int(11) NOT NULL AUTO_INCREMENT,
  `statusFavourite` tinyint(4) NOT NULL DEFAULT 1,
  `userId` int(11) DEFAULT NULL,
  `tourId` int(11) DEFAULT NULL,
  PRIMARY KEY (`favouriteId`),
  KEY `FK_7e9f230f6f075d0c08e38c47fbb` (`userId`),
  KEY `FK_6ab16a4511d5e24356757ce2796` (`tourId`),
  CONSTRAINT `FK_6ab16a4511d5e24356757ce2796` FOREIGN KEY (`tourId`) REFERENCES `tbl_tour` (`tourId`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_7e9f230f6f075d0c08e38c47fbb` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`userId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_favourite`
--

LOCK TABLES `tbl_favourite` WRITE;
/*!40000 ALTER TABLE `tbl_favourite` DISABLE KEYS */;
INSERT INTO `tbl_favourite` VALUES (1,0,1,1);
/*!40000 ALTER TABLE `tbl_favourite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_images`
--

DROP TABLE IF EXISTS `tbl_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_images` (
  `imageId` int(11) NOT NULL AUTO_INCREMENT,
  `tourId` int(11) NOT NULL,
  `imageURL` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `uploadDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`imageId`),
  KEY `FK_253f522915394c87f8e63968413` (`tourId`),
  CONSTRAINT `FK_253f522915394c87f8e63968413` FOREIGN KEY (`tourId`) REFERENCES `tbl_tour` (`tourId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_images`
--

LOCK TABLES `tbl_images` WRITE;
/*!40000 ALTER TABLE `tbl_images` DISABLE KEYS */;
INSERT INTO `tbl_images` VALUES (1,1,'https://inkhytieuhmheuhxtbzi.supabase.co/storage/v1/object/public/image_pbl6/Tour%20Da%20Nang%20-%20Hoi%20An/ivivu-chua-cau-hoi-an-1-750x460.gif','khám phá đà nẵng ','2025-10-14 08:23:55.568535'),(2,1,'https://inkhytieuhmheuhxtbzi.supabase.co/storage/v1/object/public/image_pbl6/Tour%20Da%20Nang%20-%20Hoi%20An/ivivu-chua-cau-hoi-an-750x460.gif','','2025-10-14 08:23:55.568948'),(4,1,'https://inkhytieuhmheuhxtbzi.supabase.co/storage/v1/object/public/image_pbl6/Tour%20Da%20Nang%20-%20Hoi%20An/ivivu-lang-da-my-nghe-non-nuoc-930x520.gif','khám phá đà nẵng','2025-10-14 08:23:55.569347'),(5,1,'https://inkhytieuhmheuhxtbzi.supabase.co/storage/v1/object/public/image_pbl6/Tour%20Da%20Nang%20-%20Hoi%20An/ivivu-nha-co-phung-hung-hoi-an-930x520.jpg','khám phá đà nẵng','2025-10-14 08:23:55.569615'),(6,1,'https://inkhytieuhmheuhxtbzi.supabase.co/storage/v1/object/public/image_pbl6/Tour%20Da%20Nang%20-%20Hoi%20An/lang-da-my-nghe-non-nuoc-4-750x460.jpg','khám phá đà nẵng','2025-10-14 08:23:55.569850'),(7,1,'https://inkhytieuhmheuhxtbzi.supabase.co/storage/v1/object/public/image_pbl6/Tour%20Da%20Nang%20-%20Hoi%20An/lang-da-my-nghe-non-nuoc-4-750x460.jpg','khám phá hội an','2025-10-14 08:23:55.573598');
/*!40000 ALTER TABLE `tbl_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_invoice`
--

DROP TABLE IF EXISTS `tbl_invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_invoice` (
  `invoiceId` int(11) NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `dateIssued` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `bookingId` int(11) DEFAULT NULL,
  PRIMARY KEY (`invoiceId`),
  KEY `FK_c090aaf05fe211267f517f8efb2` (`bookingId`),
  CONSTRAINT `FK_c090aaf05fe211267f517f8efb2` FOREIGN KEY (`bookingId`) REFERENCES `tbl_booking` (`bookingId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_invoice`
--

LOCK TABLES `tbl_invoice` WRITE;
/*!40000 ALTER TABLE `tbl_invoice` DISABLE KEYS */;
INSERT INTO `tbl_invoice` VALUES (1,25000000.00,'2025-09-17 07:02:33.192419',1);
/*!40000 ALTER TABLE `tbl_invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_promotion`
--

DROP TABLE IF EXISTS `tbl_promotion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_promotion` (
  `promotionId` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `discount` double NOT NULL,
  `status` enum('y','n') NOT NULL DEFAULT 'y',
  `startDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `endDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`promotionId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_promotion`
--

LOCK TABLES `tbl_promotion` WRITE;
/*!40000 ALTER TABLE `tbl_promotion` DISABLE KEYS */;
INSERT INTO `tbl_promotion` VALUES (1,'Giảm giá 20% cho tour',20,'y','2025-10-09 10:36:13.937903','2025-10-09 10:36:13.947832'),(2,'Giảm giá 10% cho tour những ngày lễ',10,'y','2025-10-09 10:36:13.937903','2025-10-09 10:36:13.947832');
/*!40000 ALTER TABLE `tbl_promotion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_refresh_token`
--

DROP TABLE IF EXISTS `tbl_refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_refresh_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `refreshToken` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_refresh_token`
--

LOCK TABLES `tbl_refresh_token` WRITE;
/*!40000 ALTER TABLE `tbl_refresh_token` DISABLE KEYS */;
INSERT INTO `tbl_refresh_token` VALUES (1,0,'$2b$10$qVRcaNd5xl62cCtkT4ia8.8uKT6CkEB49IL3m0X8lXgJ5oN1351kO','2025-10-16 17:37:43','2025-10-09 10:37:43.335774'),(2,0,'$2b$10$C6Oao0pr1yiTunz6rtQKtOsDJhRCl39xrOZMnw3zFAbVi57OTwSzu','2025-10-16 17:37:55','2025-10-09 10:37:55.494834'),(3,0,'$2b$10$dh1mO4R8sEokYT8XJjo7COX.6gh/f0bsf6Hm6Cde.Fw3BgElE/py.','2025-10-16 17:41:04','2025-10-09 10:41:04.350223'),(4,0,'$2b$10$fPA5lFDQGLmESi.E3myt6.EpeNuec7hDqh4gbu428K.F20yul.Ava','2025-10-16 17:47:31','2025-10-09 10:47:31.247596'),(5,0,'$2b$10$iXaFUvDN56O4G/SBQ9QwUeG3hPpuVf0HIQ8uI/w3MfyhYXH0Psj6O','2025-10-16 17:52:14','2025-10-09 10:52:14.177569'),(6,0,'$2b$10$Ynq0zZatgaDM03fjEqXQVuEO556WPRdBXb6eUAQ8tihcx/bAcpGPu','2025-10-18 20:30:06','2025-10-11 13:30:06.323748'),(7,0,'$2b$10$gvqr0ehYiDIh/mIida7LROFqFX.E5fnf8yBxidi8IqYraCp745O1q','2025-10-18 20:52:31','2025-10-11 13:52:31.543297'),(8,0,'$2b$10$zKKi50wuVoaaXSeXfaBS0.sH2Y5MUDg8uQVSQ2KD4so11KfLfYTa2','2025-10-18 21:11:41','2025-10-11 14:11:41.450953'),(9,1,'$2b$10$d4y701fk6Awr9IFuCXAMFe2Xn.chhd9/dxq6IuVTNntA9wZ5OHIhi','2025-10-18 23:46:39','2025-10-11 16:46:39.474477'),(10,1,'$2b$10$.fptkwT3nnoMRsGgCiqmAevMJr89JW.ZL0y6z8Am.wgLD3EXGsxSm','2025-10-18 23:46:39','2025-10-11 16:46:39.476916'),(11,0,'$2b$10$Lq6NY9Hg.kz5TncyweZ3l.icox9sztEeWbNxrzSZqgOkY1ZIOnMyy','2025-10-19 00:17:39','2025-10-11 17:17:39.961372'),(12,0,'$2b$10$gsTEBmgD8lgRPQIymwow1.i58dxjAZnHfXce6uGd0XJjDl8o7BTNG','2025-10-21 09:05:44','2025-10-14 02:05:44.882448'),(13,1,'$2b$10$Dd13hGmiBFijWJOBZHCVd.dT0T19RcynttbhbV6oYsl2HTtMLfNfq','2025-10-21 10:54:05','2025-10-14 03:54:05.264031'),(14,1,'$2b$10$hzK2sNDM2QTLIgokQVHihesRpcTu6Gdo.uNCtDnCEhJHo2BRaK.DG','2025-10-21 10:54:05','2025-10-14 03:54:05.264486'),(15,0,'$2b$10$gxHY0BFDCabECNr1dTp9He/hZjiMFvG0ECNpOfELC0izVyhR.5D/i','2025-10-21 10:54:14','2025-10-14 03:54:14.962970'),(16,1,'$2b$10$qsc9VMmfcBdGb8Vob7nxQOM4QJvGJjRKuJmzpogASG6LQDbOTi4qy','2025-10-21 12:36:40','2025-10-14 05:36:40.283394'),(17,1,'$2b$10$J9btoMeLS49tKYdvshaFd.AC6DWqdYdVtqTjkC5s7IPxzFF0ixrIq','2025-10-21 12:36:40','2025-10-14 05:36:40.284037'),(18,0,'$2b$10$P.Il20M93Mp/wy4T6D1/UudatxJIB14u0NwiLcVCPcDrtK3YP32ka','2025-10-21 12:36:46','2025-10-14 05:36:46.862220'),(19,0,'$2b$10$ea8hf3E6z/Zux/OsdDJziuJ6HWHXTCpY1UhID6XQqE71bFTw8pnsu','2025-10-21 12:51:06','2025-10-14 05:51:06.793348'),(20,1,'$2b$10$36dYx2lnw37q4swjRFo/s.H1lCFeiQGBU2wi6gYW6ELMr49w.xM16','2025-10-21 14:05:03','2025-10-14 07:05:03.590091'),(21,1,'$2b$10$wiRqn40mJI2DdhBhOaSCceOKOUZs7o77S38WMQ3sIFYX2B4AOvGJ2','2025-10-21 14:05:03','2025-10-14 07:05:03.591420'),(22,0,'$2b$10$Qfhv.Ny8ASDuMbeYMyzvyumEIzrSfR4iZUDdQMahVzY0Ze4/bk/lO','2025-10-21 14:09:21','2025-10-14 07:09:21.601695'),(23,1,'$2b$10$ZLHh.6E6EXKTyCUJTm3VG.IX0SkXcK3JXjZKakhtJHR.i4VJ2hZFe','2025-10-21 15:18:16','2025-10-14 08:18:16.304524'),(24,1,'$2b$10$qi1XSJ2G/hYpHbwAq36oM.ScjzX1bn61rHr1jH8oLgcZV23XQcIQ6','2025-10-21 15:18:16','2025-10-14 08:18:16.305373'),(25,0,'$2b$10$BXF342bMlcXQBCz6nsBDD.wQwOlkLJ.vjz1uKpTmn4CSXYb/6Idhy','2025-10-21 17:24:43','2025-10-14 10:24:43.537720'),(26,1,'$2b$10$SdaGbX.9mmz63wiAY5B0devw.Kz2fPhU.YBTP0Pb9SKN/vIIUVcw.','2025-10-22 23:13:10','2025-10-15 16:13:10.797621'),(27,1,'$2b$10$TfHqvr.sp0TMWrnwYbZMLen2MEAMTXb7DH5HO4hOUL0BqF6E5TMfm','2025-10-22 23:13:10','2025-10-15 16:13:10.798175'),(28,0,'$2b$10$PzbujM9bI2u35rEap3QptOpbaheJgMOln9PU6IOSPP0tgH6wNpe6W','2025-10-22 23:13:34','2025-10-15 16:13:34.760247'),(29,0,'$2b$10$qKGIeFCqRiP19uNt9FjspuClPNNixjiarsq2Xs8QMnCRAqXxgdVNi','2025-10-23 00:03:13','2025-10-15 17:03:13.706475'),(30,0,'$2b$10$0snX4Ur8/s5uqRpPJPDrn.KqyAWACk3qX44.PAUhO.GxQJmxMx4Te','2025-10-23 00:26:38','2025-10-15 17:26:38.107655'),(31,0,'$2b$10$CWXtS2yaWL/KveMWLqmw5us22t3KbHsVHEH2jKtim5ZhWQbtNv23S','2025-10-23 00:26:38','2025-10-15 17:26:38.979802'),(32,0,'$2b$10$mI.2kcAKgCoY9gvrD7Y2Pu2XFRfiAlS2Hx/98DqXFWCUh7f/yru2.','2025-10-23 00:26:39','2025-10-15 17:26:39.901567'),(33,0,'$2b$10$fsFBgeMbhGLxVpSk9I/aHervyeO.Bzs0iQqJw7LuXx94u0yJ9X8EO','2025-10-23 00:26:56','2025-10-15 17:26:56.515605'),(34,0,'$2b$10$ndEuMUB9TVzPy3.v5d8ytu0U22UnhnfDj31k8w3WsnEj4WS/BA.4K','2025-10-23 00:27:04','2025-10-15 17:27:04.309181'),(35,0,'$2b$10$RI/LKGPL3rkioeB.J84Uv.Uz3DdiNo3upNk142PhJk1sHzX5Wa0rq','2025-10-23 00:28:23','2025-10-15 17:28:23.841722'),(36,1,'$2b$10$wiS8X5ptILThFSejlbnicuGPwqFxCWvck6GdGtMdD3sIk/RtUHhC.','2025-10-23 14:00:33','2025-10-16 07:00:33.461807'),(37,1,'$2b$10$LWFH80FbklhM3jlUOYy1POzWhsIyJEJNCmzb8yGn8d6Jwsuwo1W3K','2025-10-23 14:00:33','2025-10-16 07:00:33.464416'),(38,0,'$2b$10$AAAUaswiq/9qD3IRVdlcXukiiwgK/fLGXjY6vfwek6fqiKxzHMvjm','2025-10-23 14:00:52','2025-10-16 07:00:52.427285'),(39,0,'$2b$10$8oNb0/VvPbkuvgmeGpcfDus6VjAvaQQ4Smu84mBwPtWXZ5B.r6giW','2025-10-23 14:24:13','2025-10-16 07:24:13.676681');
/*!40000 ALTER TABLE `tbl_refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_reviews`
--

DROP TABLE IF EXISTS `tbl_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_reviews` (
  `reviewId` int(11) NOT NULL AUTO_INCREMENT,
  `rating` float NOT NULL,
  `comment` text DEFAULT NULL,
  `timestamp` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `tourId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`reviewId`),
  KEY `FK_a2f93ed88ff88ffc090d73b0488` (`userId`),
  KEY `idx_tbl_reviews_tourId` (`tourId`),
  CONSTRAINT `FK_20b32fc6d862b66de523e236f07` FOREIGN KEY (`tourId`) REFERENCES `tbl_tour` (`tourId`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_a2f93ed88ff88ffc090d73b0488` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`userId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_reviews`
--

LOCK TABLES `tbl_reviews` WRITE;
/*!40000 ALTER TABLE `tbl_reviews` DISABLE KEYS */;
INSERT INTO `tbl_reviews` VALUES (1,5,'','2025-09-16 15:01:27.255903',1,1),(2,3,'chuyến đi thật thú vị','2025-09-16 15:03:39.080494',1,1),(3,4,'chuyến đi thật thú vị','2025-09-16 15:04:36.578544',1,1);
/*!40000 ALTER TABLE `tbl_reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_reviews_after_insert`
AFTER INSERT ON `tbl_reviews`
FOR EACH ROW
BEGIN
  CALL `sp_update_tour_reviews_str`(NEW.`tourId`);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_reviews_after_update`
AFTER UPDATE ON `tbl_reviews`
FOR EACH ROW
BEGIN
  CALL `sp_update_tour_reviews_str`(NEW.`tourId`);
  IF NEW.`tourId` <> OLD.`tourId` THEN
    CALL `sp_update_tour_reviews_str`(OLD.`tourId`);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_reviews_after_delete`
AFTER DELETE ON `tbl_reviews`
FOR EACH ROW
BEGIN
  CALL `sp_update_tour_reviews_str`(OLD.`tourId`);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tbl_start_end_date`
--

DROP TABLE IF EXISTS `tbl_start_end_date`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_start_end_date` (
  `dateId` int(11) NOT NULL AUTO_INCREMENT,
  `priceAdult` decimal(12,2) NOT NULL DEFAULT 0.00,
  `priceChildren` decimal(12,2) NOT NULL DEFAULT 0.00,
  `quantity` int(11) NOT NULL,
  `availability` tinyint(4) NOT NULL DEFAULT 1,
  `tourId` int(11) DEFAULT NULL,
  `startDate` date NOT NULL DEFAULT current_timestamp(6),
  `endDate` date NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`dateId`),
  KEY `FK_6db466965d63fbeb1cca77b75fe` (`tourId`),
  CONSTRAINT `FK_6db466965d63fbeb1cca77b75fe` FOREIGN KEY (`tourId`) REFERENCES `tbl_tour` (`tourId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_start_end_date`
--

LOCK TABLES `tbl_start_end_date` WRITE;
/*!40000 ALTER TABLE `tbl_start_end_date` DISABLE KEYS */;
INSERT INTO `tbl_start_end_date` VALUES (1,2500000.00,500000.00,8,1,1,'2025-10-20','2025-10-20'),(2,2000000.00,500000.00,8,1,1,'2025-10-29','2025-10-29'),(3,2000000.00,500000.00,8,1,2,'2025-10-29','2025-10-31');
/*!40000 ALTER TABLE `tbl_start_end_date` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_timeline`
--

DROP TABLE IF EXISTS `tbl_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_timeline` (
  `timeLineId` int(11) NOT NULL AUTO_INCREMENT,
  `tl_title` varchar(255) NOT NULL,
  `tl_description` text NOT NULL,
  `tourId` int(11) DEFAULT NULL,
  PRIMARY KEY (`timeLineId`),
  KEY `FK_bd93d17b1b126f8e1d281684671` (`tourId`),
  CONSTRAINT `FK_bd93d17b1b126f8e1d281684671` FOREIGN KEY (`tourId`) REFERENCES `tbl_tour` (`tourId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_timeline`
--

LOCK TABLES `tbl_timeline` WRITE;
/*!40000 ALTER TABLE `tbl_timeline` DISABLE KEYS */;
INSERT INTO `tbl_timeline` VALUES (1,'ngày 1 : khởi hành','khời hành tử hà nội đến đà nẵng',2),(2,'ngày 2 : khám phá đà nẵng','<div>khám phá thành phố đà nẵng, bà nà hill</div> ',2),(3,'ngày 3 : khám phá hội an','khám phá thành phố hội an',2),(5,'Chương trình tour','\n<div class=\"tourSchedule\">\n  <p style=\"text-align: justify;\">15h30: Xe &amp; hướng dẫn viên đón Quý khách tại điểm hẹn, khởi hành đi tham quan:</p>\n  <p style=\"text-align: justify;\"><strong>Ngũ Hành Sơn</strong> - Cụm danh thắng Ngũ Hành Sơn với năm ngọn núi Kim, Mộc, Thủy, Hỏa, Thổ. Tại ngọn Thủy Sơn đoàn sẽ có dịp khám phá các hang động huyền bí, những kiệt tác của thiên nhiên kết hợp với nền văn hóa Phật giáo lâu đời. Đoàn viếng chùa Tam Thai, chùa Linh&nbsp; Ứng, tháp 7 tầng.</p>\n  <p style=\"text-align: center;\"><img title=\"\" class=\"\" data-src=\"//cdn2.ivivu.com/2022/11/09/16/ivivu-ngu-hanh-son.gif\" alt=\"\" width=\"710\" height=\"410\" src=\"//cdn2.ivivu.com/2022/11/09/16/ivivu-ngu-hanh-son.gif\"></p>\n  <p style=\"text-align: center;\"><em> Ngũ Hành Sơn, điểm tham quan các hang động như động Huyền Không và chùa Tam Thai.</em></p>\n  <p style=\"text-align: justify;\">Quý khách tận mắt chiêm ngưỡng các kiệt tác điêu khắc đá tinh xảo được tạo ra từ bàn tay tài hoa của các nghệ nhân <strong>làng đá Non Nước</strong> dưới chân núi.</p>\n  <p style=\"text-align: justify;\"><img title=\"\" class=\"\" data-src=\"//cdn2.ivivu.com/2020/07/16/09/ivivu-lang-da-my-nghe-non-nuoc.gif\" alt=\"\" width=\"710\" height=\"410\" src=\"//cdn2.ivivu.com/2020/07/16/09/ivivu-lang-da-my-nghe-non-nuoc.gif\"></p>\n  <p style=\"text-align: center;\"><em>Làng Đá Non Nước, làng nghề truyền thống nổi tiếng với nghệ thuật điêu khắc đá.</em></p>\n  <p style=\"text-align: justify;\">Khởi hành vào <strong>Hội An</strong>.&nbsp;Dùng bữa chiều với các món đặc sản phố cổ: cao lầu, hoành thánh, cơm gà, bánh bao, bánh vạc, mì quảng… Tham quan phố cổ Hội An với:</p>\n  <p><strong>Nhà cổ Phùng Hưng</strong>: với tuổi thọ hơn 100 năm tuổi, nhà cổ Phùng Hưng có kết cấu độc đáo với phần gác cao bằng gỗ và các hành lang rộng bao quanh, thể hiện sự phát triển về kiến trúc và sự giao lưu giữa phong cách kiến trúc Á Đông tại Hội An trong các thế kỷ trước đây.</p>\n  <p style=\"text-align: center;\"><img title=\"\" class=\"\" data-src=\"//cdn2.ivivu.com/2024/05/10/14/ivivu-nha-co-phung-hung-hoi-an.jpg\" alt=\"\" width=\"710\" height=\"410\" src=\"//cdn2.ivivu.com/2024/05/10/14/ivivu-nha-co-phung-hung-hoi-an.jpg\"></p>\n  <p style=\"text-align: center;\"><em>Nhà cổ Phùng Hưng, điểm tham quan văn hóa đặc sắc tại Hội An.</em></p>\n  <p style=\"text-align: justify;\"><strong>Hội quán Phước Kiến</strong>: công trình kiến trúc được xây dựng từ những năm 1697, thờ Thiên Hậu Thánh Mẫu và các vị thần bảo vệ sông nước, tiền của, con cái…</p>\n  <p style=\"text-align: center;\"><img title=\"\" class=\"\" data-src=\"//cdn2.ivivu.com/2017/09/22/14/tour-da-nang-3n2d-kham-pha-da-nang-hoi-quan-phuc-kien.jpg\" alt=\"\" width=\"710\" height=\"410\" src=\"//cdn2.ivivu.com/2017/09/22/14/tour-da-nang-3n2d-kham-pha-da-nang-hoi-quan-phuc-kien.jpg\"></p>\n  <p style=\"text-align: center;\"><em>Hội Quán Phước Kiến, mái ngói đỏ, cổng vòm uốn lượn, và các chi tiết trang trí tinh xảo.</em></p>\n  <p style=\"text-align: justify;\"><strong>Chùa Cầu Nhật Bản:</strong> ngôi chùa nằm trên chiếc cầu bắc ngang qua con lạch nhỏ trong khu đô thị cổ Hội An. Chiếc cầu này được các thương nhân người Nhật xây dựng vào đầu thế kỷ 17. Đây là công trình kiến trúc duy nhất được coi là gốc tích Nhật Bản còn sót lại.</p>\n  <p style=\"text-align: center;\"><img title=\"\" class=\"\" data-src=\"//cdn2.ivivu.com/2021/05/05/16/ivivu-hoi-an.jpg\" alt=\"\" src=\"//cdn2.ivivu.com/2021/05/05/16/ivivu-hoi-an.jpg\"></p>\n  <p style=\"text-align: center;\"><em>Chùa Cầu Hội An, nổi bật với kiến trúc độc đáo, mang đậm nét văn hóa Nhật Bản và Việt Nam.</em></p>\n  <p style=\"text-align: justify;\">Tản bộ dọc theo sông Hoài, ngắm cảnh phố Hội về đêm với đèn lồng treo dọc trên hàng hiên ở những con phố nhỏ chắc chắn sẽ là hình ảnh không thể quên về một phố cổ yên bình của miền Trung.</p>\n  <p>21h00: Quay về Đà Nẵng trên một trong những cung đường đẹp nhất thành phố với các resort cao cấp chạy dọc hai bên.</p>\n  <p>Về đến Đà Nẵng. Kết thúc chương trình. Hướng dẫn viên chia tay Quý khách.</p>\n</div>',1);
/*!40000 ALTER TABLE `tbl_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_tour`
--

DROP TABLE IF EXISTS `tbl_tour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_tour` (
  `tourId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `itinerary` varchar(255) DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  `reviews` varchar(255) DEFAULT NULL,
  `domain` enum('mb','mt','mn','mdnb','mtnb') DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `countComplete` int(11) NOT NULL DEFAULT 0,
  `address` varchar(255) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`tourId`),
  KEY `FK_347c258204554ff3a788cb24457` (`userId`),
  CONSTRAINT `FK_347c258204554ff3a788cb24457` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`userId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_tour`
--

LOCK TABLES `tbl_tour` WRITE;
/*!40000 ALTER TABLE `tbl_tour` DISABLE KEYS */;
INSERT INTO `tbl_tour` VALUES (1,'Tour Đà Nẵng Trong Ngày: Ngũ Hành Sơn - Phố Cổ Hội An','- Làng đá Non Nước: Tìm hiểu làng nghề điêu khắc đá truyền thống.\n\n- Check-in Chùa Cầu: Biểu tượng văn hóa độc đáo giữa lòng phố cổ.\n\n- Thưởng thức đặc sản Hội An: Cao lầu, mì Quảng, bánh mì trứ danh.\n\n- Dạo Phố Cổ Hội An: Ngắm kiến trúc cổ, đèn lồng và không gian yên bình.\n\n- Khám phá Ngũ Hành Sơn: Leo núi, tham quan động Huyền Không và chùa Tam Thai.','https://inkhytieuhmheuhxtbzi.supabase.co/storage/v1/object/public/image_pbl6/destination3.jpg','Đà Nẵng',NULL,'Trong ngày','4.0/5 | 3 đánh giá','mt',10,2,'Đà Nẵng, Việt Nam',1),(2,'Tour Đà Nẵng 3N2Đ: Chùa Quan Thế Âm - Phố Cổ Hội An - Bà Nà - Cố Đô Huế','- Dạo Phố cổ Hội An: Lung linh đèn lồng, khám phá Chùa Cầu, Nhà cổ, Hội quán Phúc Kiến.','https://ttkpdajlofmmucpddzhz.supabase.co/storage/v1/object/public/image_pbl6/1758185881337_o2j4rq_hoian.jpg','hội an ',NULL,'3 ngày 2 đêm','0.0/5 | 0 đánh giá','mt',30,2,'hội an , đà nẵng, việt nam',NULL);
/*!40000 ALTER TABLE `tbl_tour` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_tour_promotion`
--

DROP TABLE IF EXISTS `tbl_tour_promotion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_tour_promotion` (
  `tourPromotionId` int(11) NOT NULL AUTO_INCREMENT,
  `dateId` int(11) DEFAULT NULL,
  `promotionId` int(11) DEFAULT NULL,
  PRIMARY KEY (`tourPromotionId`),
  KEY `FK_7a40b911e876bc5b11e5134969e` (`dateId`),
  KEY `FK_84989e3ddf90ca86b73c868d0ec` (`promotionId`),
  CONSTRAINT `FK_7a40b911e876bc5b11e5134969e` FOREIGN KEY (`dateId`) REFERENCES `tbl_start_end_date` (`dateId`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_84989e3ddf90ca86b73c868d0ec` FOREIGN KEY (`promotionId`) REFERENCES `tbl_promotion` (`promotionId`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_tour_promotion`
--

LOCK TABLES `tbl_tour_promotion` WRITE;
/*!40000 ALTER TABLE `tbl_tour_promotion` DISABLE KEYS */;
INSERT INTO `tbl_tour_promotion` VALUES (1,1,1),(2,2,1),(5,2,2);
/*!40000 ALTER TABLE `tbl_tour_promotion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_users`
--

DROP TABLE IF EXISTS `tbl_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `google_id` varchar(50) DEFAULT NULL,
  `fullName` varchar(100) NOT NULL,
  `userName` varchar(50) NOT NULL,
  `passWord` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL,
  `isActive` enum('y','n') NOT NULL DEFAULT 'y',
  `createDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updateDate` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `activation_token` varchar(255) DEFAULT NULL,
  `role` enum('admin','user','supplier') NOT NULL DEFAULT 'user',
  `birthDay` timestamp(6) NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`userId`),
  UNIQUE KEY `IDX_f1900d79e561b84790ea073262` (`userName`),
  UNIQUE KEY `IDX_d74ab662f9d3964f78b3416d5d` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_users`
--

LOCK TABLES `tbl_users` WRITE;
/*!40000 ALTER TABLE `tbl_users` DISABLE KEYS */;
INSERT INTO `tbl_users` VALUES (1,NULL,'Nguyễn Văn A','Anguyen','$2b$10$A2WsUXfsPqj6kHesRWiyB.pQvdtqg8rrshMIUrWnBaffFPA5vlTve','A@gmail.com',NULL,'08986321475','Hòa hải , Ngũ Hành Sơn',NULL,'y','2025-09-16 14:23:43.746770','2025-09-16 14:40:21.000000',NULL,'user','2025-10-09 10:36:14.159638'),(4,NULL,'DonalTrump','TrumpDonal','$2b$10$rJo2ivd91bc0J0vVEkA/puVHE4kEzEur9r3DUFHggQ6sP4.MAZXeS','Trump@gmail.com','https://ttkpdajlofmmucpddzhz.supabase.co/storage/v1/object/public/image_pbl6/1758184735969_jx4col_trump1.png','08963125796','mĩ',NULL,'y','2025-09-18 08:38:59.989777','2025-09-21 07:39:44.000000',NULL,'admin','2025-10-09 10:36:14.159638'),(5,NULL,'Hoàng Ngọc','hoangngoc','$2b$10$CuMAlKiqhQwi7wLiHikKJ.Bp18JyzpFz3R6.vP./ISasd7XCEJUhy','dbhngoc1307@gmail.com',NULL,'0987654321','123 Đường ABC, Quận 1',NULL,'n','2025-10-09 09:57:53.210978','2025-10-09 09:57:53.210978',NULL,'user','2025-10-09 10:36:14.159638');
/*!40000 ALTER TABLE `tbl_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'database_pbl6'
--

--
-- Dumping routines for database 'database_pbl6'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_tour_reviews_str` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_tour_reviews_str`(IN p_tour_id INT)
BEGIN
  DECLARE v_avg   DECIMAL(3,1);
  DECLARE v_count INT;

  SELECT ROUND(AVG(`rating`), 1), COUNT(*)
    INTO v_avg, v_count
  FROM `tbl_reviews`
  WHERE `tourId` = p_tour_id;

  SET v_avg   = COALESCE(v_avg, 0.0);
  SET v_count = COALESCE(v_count, 0);

  UPDATE `tbl_tour`
  SET `reviews` = CONCAT(v_avg, '/5 | ', v_count, ' đánh giá')
  WHERE `tourId` = p_tour_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-16 14:26:41
