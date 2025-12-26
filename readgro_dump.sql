-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: caboose.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `railway`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `railway` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `railway`;

--
-- Table structure for table `admin_details`
--

DROP TABLE IF EXISTS `admin_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_details`
--

LOCK TABLES `admin_details` WRITE;
/*!40000 ALTER TABLE `admin_details` DISABLE KEYS */;
INSERT INTO `admin_details` VALUES (1,'satyadattakallepalli@gmail.com','$2b$10$FtfaqBZ9AreEa8kca8OJceNpOZ7i8PrOT38jJVnyWN07oAHk7JPBu','satya datta kallepalli','6304586548');
/*!40000 ALTER TABLE `admin_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `course_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `instructor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `course_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `course_price` decimal(10,2) DEFAULT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `commission` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (28,'Python Fullstack','2025-11-01 09:05:21','Master full-stack web development using Python with Flask or Django on the backend and HTML, CSS, Bootstrap, and JavaScript on the frontend. Build and deploy dynamic, database-driven web applications from scratch to production.','Arbaz Khan','https://res.cloudinary.com/djset9wsw/image/upload/v1761987921/avatars/sfxx0wrbvmhunmgc1emw.jpg',4999.00,3499.00,1000.00);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp`
--

DROP TABLE IF EXISTS `emp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp`
--

LOCK TABLES `emp` WRITE;
/*!40000 ALTER TABLE `emp` DISABLE KEYS */;
/*!40000 ALTER TABLE `emp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_courses`
--

DROP TABLE IF EXISTS `package_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_courses` (
  `map_id` int NOT NULL AUTO_INCREMENT,
  `package_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`map_id`),
  UNIQUE KEY `package_id` (`package_id`,`course_id`),
  KEY `fk_course` (`course_id`),
  CONSTRAINT `fk_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_courses`
--

LOCK TABLES `package_courses` WRITE;
/*!40000 ALTER TABLE `package_courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `package_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `package_id` int NOT NULL AUTO_INCREMENT,
  `package_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `package_price` decimal(10,2) NOT NULL,
  `created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `package_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `commission` int DEFAULT NULL,
  `discount_price` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`package_id`),
  UNIQUE KEY `unique_package_name` (`package_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Initial package','Package Contains AI related Courses',399.00,'2025-03-16 02:33:53','1742213895522-th (1).jpg',201,'300'),(2,'EXPERT PACKAGE','Add the Learnings to Beginner',600.00,'2025-03-16 03:01:36','1742094096994.jpg',400,NULL),(3,'Pro Package','Package With  More Courses',2000.00,'2025-03-17 17:41:49','1742233308998.jpg',1200,'1800'),(4,'Starter Package','5 courses',499.00,'2025-05-16 04:46:03','https://readgrobucketforimages.s3.amazonaws.com/1747370760885.jpg',50,'399');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricevalidater`
--

DROP TABLE IF EXISTS `pricevalidater`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricevalidater` (
  `price` int DEFAULT NULL,
  `price_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`price_id`),
  CONSTRAINT `pricevalidater_chk_1` CHECK ((`price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricevalidater`
--

LOCK TABLES `pricevalidater` WRITE;
/*!40000 ALTER TABLE `pricevalidater` DISABLE KEYS */;
INSERT INTO `pricevalidater` VALUES (10,1);
/*!40000 ALTER TABLE `pricevalidater` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `topic_id` int NOT NULL AUTO_INCREMENT,
  `topic_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `video_url` varchar(2083) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`topic_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `topics_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES (18,' Development Environment Setup','https://youtu.be/CWQmwf-AixQ?si=lJQhuLtkRwdP4MKQ',28),(21,' Install Sublime Text','https://youtu.be/dIkbxVZl_pk',28),(26,' Vs code setup','https://youtu.be/ggZFmJnUddI',28),(34,' HTML','https://youtu.be/V2MtPvwo7F8',28),(36,' Env - Setup','https://youtu.be/OS-9XXkZ9ho',28),(40,' First webpage','https://youtu.be/_XP1jhgyhx8',28),(43,'Heading and Comments','https://youtu.be/uk_DaSpsEaI',28),(47,'Paragraph','https://youtu.be/ofKfHMClnvo',28),(51,'Style ','https://youtu.be/nEeWZJlzziY',28),(55,'Text formation','https://youtu.be/ChswEfLjQlc',28),(59,'Quotation','https://youtu.be/Kr36xIFYvrg',28),(61,'Links ','https://youtu.be/sCPf7T_Y78g',28),(67,'IMG ','https://youtu.be/G6OAtwY_b5Q',28),(72,' Lists','https://youtu.be/wpMkeBrN9Ro',28),(85,'Table','https://youtu.be/Ah_QEqxp9U8',28),(86,'HTML Forms','https://youtu.be/r7rFe52TsGY',28),(87,'HTML Project','https://youtu.be/SkVoBk_Mt0o',28),(91,'CSS Basics and Comments','https://youtu.be/zVNe5g0TkT4',28),(93,'CSS Colors','https://youtu.be/h_egSihrW7s',28),(95,'CSS Background','https://youtu.be/sgzMnj9mODg',28),(97,'CSS Box Model','https://youtu.be/nlm4SW7B6Hk',28),(99,'CSS Outline','https://youtu.be/4c5Q5JKsKlo',28),(101,'CSS Links','https://youtu.be/x7cJB31Abmg',28),(103,'CSS Position','https://youtu.be/MaIJH1JGROc',28),(105,'CSS Display','https://youtu.be/ts1vy4NP6Ug',28),(106,'CSS Navbar','https://youtu.be/oLvsPnR5Rpc',28),(107,'CSS Dropdown','https://youtu.be/MUIpD4Bm4iQ',28),(108,'CSS Height','https://youtu.be/QkYCfq3uVIU',28),(109,'CSS Float','https://youtu.be/BUdIB9QInXk',28),(110,'CSS Overflow','https://youtu.be/uOmpMILICjc',28),(111,'CSS Icons','https://youtu.be/z4hwcMXyAXE',28),(112,'CSS Image Gallery','https://youtu.be/TkG2GPqdxCA',28),(113,'CSS Forms','https://youtu.be/4pW0dKOE5qY',28),(114,'CSS Project','https://youtu.be/VuI8rIZ9lSE',28),(115,'BOOTSTRAP','https://youtu.be/ONBTHoxQyv8',28),(116,'120 seconds of python','https://youtu.be/fWxmFzlAXFc',28),(117,'Python one sort','https://youtu.be/U2p1M1OsuxM',28),(118,'Flask env','https://youtu.be/KFLJcGH09FA',28),(119,'Dynamic flask app','https://youtu.be/hceEv27XM4k',28),(120,'Render template','https://youtu.be/4h6d74qWKOw',28),(121,'Todo list app','https://youtu.be/Avk7AiM_smM',28),(122,'Flask CCTV','https://youtu.be/BD5EUQXzvk8',28),(123,'Flask meme website','https://youtu.be/hP1WfL7_f-w',28),(124,'First Django Project','https://youtu.be/-NQO75MvkS8',28),(125,'Password Generator 1','https://youtu.be/HnbNxO3DTU8',28),(126,'Password Generator 2','https://youtu.be/L8qqkaUJ6Cw',28),(127,'Password Generator 3','https://youtu.be/X43jdR5kxs8',28),(128,'Weather app','https://youtu.be/jcM_7lI9sSQ',28),(129,'Django blog 1','https://youtu.be/5D1Fb2qzeFE',28),(130,'Django blog 2','https://youtu.be/OW5LLYqg9AM',28),(131,'Django blog 3','https://youtu.be/ssqf1SYTefo',28);
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `courseid` int DEFAULT NULL,
  `Email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Pincode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `GeneratedReferralCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferrerId` int DEFAULT NULL,
  `refferCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `Phone` (`Phone`),
  UNIQUE KEY `GeneratedReferralCode` (`GeneratedReferralCode`),
  KEY `PackageId` (`courseid`),
  KEY `ReferrerId` (`ReferrerId`),
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`ReferrerId`) REFERENCES `user` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Gnaneswar',28,'pillignaneswar@gmail.com','9989653692',NULL,'kakinada','533005','RDGWD3SA',NULL,NULL,'$2b$10$bTv7t7mJnPKH3IKtXn0ty.LoBz6e/KmrGVxqHqNe4sNQ.fQF.8x3.','2025-11-09 05:56:16'),(2,'KSD',28,'ksd@gmail.com','6304586548',NULL,'kakinada','533005','RDGWE377',NULL,'RDGWD3SA','$2b$10$ATneAQG1XEaucSKF.wwlDuH5cMsmGAunQapdHd6/thLGdn1PJS6XO','2025-11-09 05:57:43'),(3,'Divya Sri',28,'saisuryapavannarala@gmail.com','7661838064',NULL,'kakinada','533002','RDGWFBTW',NULL,'RDGWD3SA','$2b$10$yz5MK2gNvZmIO58NDKDfmOIi6ofvxDSt84cwS4tIOwT6YkgIC8MMa','2025-11-23 08:06:16'),(4,'Akhila',28,'akhiszindagi@gmail.com','6281422991',NULL,'anaparthi','533442','RDGWIK2S',NULL,'RDGWD3SA','$2b$10$/deADIlAjaor3WBrf6g8PuOvWbd9bsegcf/sSNlIz6RWn1fp6zidq','2025-11-23 08:13:57'),(5,'lakshmi sree',28,'lakshmisreekalla630@gmail.com','6304091468',NULL,'vizag','567342','RDGWLHJP',NULL,'RDGWD3SA','$2b$10$DMzAXAU7jx7Ahhr6nFlYSe9EnycbK2Q3laA1Xvq3kSy8bXIyFwfcG','2025-11-23 11:08:28'),(6,'lakshmi sree',28,'srid94988@gmail.com','9299906559',NULL,'vizag','546378','RDGWQJWV',NULL,'RDGWD3SA','$2b$10$yCBRXaPL06.YQum.sVrIseggBZGgqQvsMqkErnQiXvnzJvyLtdVdy','2025-11-23 11:51:16'),(7,'Dipankar patil',28,'dipankarpatil84886@gmail.com','7447807034',NULL,'Maharastra','674836','RDGWHO3O',NULL,'RDGWD3SA','$2b$10$ZYDwufhDJwtdNxxWrtr81ulnFPlV8tB0h84TGnDnFTer.rPnIlruO','2025-11-25 17:19:29'),(8,'Bunny',28,'bunnyroyals24@gmail.com','9391357589',NULL,'kakinada','533005','RDGW20LY',NULL,'RDGWD3SA','$2b$10$7gGiAPKxWRzwgDORkr1lLuZI2ej1uzcZNqGAPzBCLpJ5hY/ccAa2S','2025-11-25 17:25:07'),(9,'Vamshi ',28,'vmudiraj230@gmail.com','8247593561',NULL,'hyderabad ','675456','RDGWYWWK',NULL,'RDGWD3SA','$2b$10$8BSBm4TMpNhA4NaoMo0sx.BTUHgYpMglX8iGP0ZizhHcq19crgZDO','2025-11-29 17:54:26'),(10,'Sneha Latha Reddy',28,'pinnintisnehalathareddy@gmail.com','8328313933',NULL,'Palavalasa village, Visakhapatnam ','530031','RDGWC6N4',NULL,'RDGWD3SA','$2b$10$IhEcO5EOf4Xzj8CyYCMYnuxMOz5xb3udWC1tvml2N4PaMXHddWHam','2025-12-02 14:05:49'),(11,'Poricha Likhil',28,'mrmadrocky@gmail.com','7997879547',NULL,'Rajahmundry ','536794','RDGWPWI6',NULL,'RDGWD3SA','$2b$10$IQXHH5c6rQldozt5nP7ejOdSfzYwERc.9LswusK5QqmrgfsjNIAfi','2025-12-03 15:23:39'),(12,'V. Venkata Harsha Vardhan',28,'gatigantiharshavardhan@gmail.com','9392431676',NULL,'westgodavari','534326','RDGWJ50X',NULL,'RDGWD3SA','$2b$10$OGaiLth8MI7nxSNFTlH19u/7wIvDGZPfwcfq54xYLmk/PEjq6R.gC','2025-12-05 15:48:08'),(13,'keerthan',28,'keerthanchenumala@gmail.com','9014850213',NULL,'hyderabad','500001','RDGWQ77Z',NULL,'RDGWD3SA','$2b$10$L/avrFbA44.PzidjTAc/DOXHIKFaucLUqV6an2CjzyLQsFn8hypv.','2025-12-08 15:58:27'),(14,'neha',28,'nehadayma2007@gmail.com','8209975078',NULL,'rajasthan','655473','RDGWWTXS',NULL,'RDGWD3SA','$2b$10$DOgtrOf.hKEpR5FlnB8v1ehFXv5M9xyr1TypSSaOgx7e/9yXvuVUi','2025-12-08 16:11:28'),(15,'Prajwala Reddy',28,'contact.prajju@gmail.com','9493776405',NULL,'kadapa','516330','RDGWGL70',NULL,'RDGWD3SA','$2b$10$1ccgaxuCDBj4aBTPVAP6fun00h3OrL5GWsi6eYjIXWQDwEnZsAY.q','2025-12-13 16:42:11'),(16,'Shekh Imran Khan ',28,'shekhimrankhan348@gmail.com','7247377585',NULL,'Bhopal,MP','462016','RDGWA95M',NULL,'RDGWD3SA','$2b$10$kotf4Lob3gcyLq2XElVblu5TmweHNUlWo6BsCKARPHG3eaeR5DSby','2025-12-13 17:16:37'),(18,'ravi kiran',28,'ravi@gmail.com','8309743599',NULL,'kakinada','533005','RDGWERPU',NULL,'RDGWD3SA','$2b$10$lNuci42.bRfNPjG5gvEYSO6EtO1AcczEkWFhs0xOBIedkN4c43/wO','2025-12-17 15:09:50'),(19,'Karlz',28,'karlzzkirzz@gmail.com','8848360489',NULL,'kerla','453627','RDGWFVL3',NULL,'RDGWD3SA','$2b$10$xtmRT5uhB1QcKDx1NCxxQ.Ewv7WozUUp83ierhFUzl6SWg7nMbDOO','2025-12-17 15:14:34'),(20,'Chandan',28,'mylapillichandan@gmail.com','9581696167',NULL,'vishakapatnam','553627','RDGWL2W2',NULL,'RDGWD3SA','$2b$10$VlNXlLmALGOV2DYafC7g7O18A7W1COLAnzfWGfjo6s2e0gVK2DCqK','2025-12-18 10:40:55');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_bank_details`
--

DROP TABLE IF EXISTS `user_bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_bank_details` (
  `ubdid` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `account_holder_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ifsc_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `account_number` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `upi_id` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fund_account_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`ubdid`),
  UNIQUE KEY `unique_user_id` (`user_id`),
  UNIQUE KEY `unique_user_account` (`user_id`,`account_number`(100)),
  CONSTRAINT `user_bank_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_bank_details`
--

LOCK TABLES `user_bank_details` WRITE;
/*!40000 ALTER TABLE `user_bank_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet`
--

DROP TABLE IF EXISTS `wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet` (
  `wallet_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `last_updated` datetime DEFAULT NULL,
  PRIMARY KEY (`wallet_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `wallet_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet`
--

LOCK TABLES `wallet` WRITE;
/*!40000 ALTER TABLE `wallet` DISABLE KEYS */;
INSERT INTO `wallet` VALUES (1,1,18000.00,'2025-12-18 10:40:56'),(2,2,0.00,NULL),(3,3,0.00,NULL),(4,4,0.00,NULL),(5,5,0.00,NULL),(6,6,0.00,NULL),(7,7,0.00,NULL),(8,8,0.00,NULL),(9,9,0.00,NULL),(10,10,0.00,NULL),(11,11,0.00,NULL),(12,12,0.00,NULL),(13,13,0.00,NULL),(14,14,0.00,NULL),(15,15,0.00,NULL),(16,16,0.00,NULL),(17,18,0.00,NULL),(18,19,0.00,NULL),(19,20,0.00,NULL);
/*!40000 ALTER TABLE `wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallettransactions`
--

DROP TABLE IF EXISTS `wallettransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallettransactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `transaction_type` enum('credit','debit') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `reffer_id` int DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `wallet_id` (`wallet_id`),
  KEY `fk_wallettransactions_user_id` (`user_id`),
  CONSTRAINT `fk_wallettransactions_user_id` FOREIGN KEY (`user_id`) REFERENCES `wallet` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wallettransactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`wallet_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallettransactions`
--

LOCK TABLES `wallettransactions` WRITE;
/*!40000 ALTER TABLE `wallettransactions` DISABLE KEYS */;
INSERT INTO `wallettransactions` VALUES (1,1,1000.00,'credit','Referral commission for user 1','2025-11-09 05:57:44',2,1),(2,1,1000.00,'credit','Referral commission for user 1','2025-11-23 08:06:17',3,1),(3,1,1000.00,'credit','Referral commission for user 1','2025-11-23 08:13:58',4,1),(4,1,1000.00,'credit','Referral commission for user 1','2025-11-23 11:08:29',5,1),(5,1,1000.00,'credit','Referral commission for user 1','2025-11-23 11:51:17',6,1),(6,1,1000.00,'credit','Referral commission for user 1','2025-11-25 17:19:30',7,1),(7,1,1000.00,'credit','Referral commission for user 1','2025-11-25 17:25:09',8,1),(8,1,1000.00,'credit','Referral commission for user 1','2025-11-29 17:54:27',9,1),(9,1,1000.00,'credit','Referral commission for user 1','2025-12-02 14:05:50',10,1),(10,1,1000.00,'credit','Referral commission for user 1','2025-12-03 15:23:40',11,1),(11,1,1000.00,'credit','Referral commission for user 1','2025-12-05 15:48:09',12,1),(12,1,1000.00,'credit','Referral commission for user 1','2025-12-08 15:58:28',13,1),(13,1,1000.00,'credit','Referral commission for user 1','2025-12-08 16:11:29',14,1),(14,1,1000.00,'credit','Referral commission for user 1','2025-12-13 16:42:12',15,1),(15,1,1000.00,'credit','Referral commission for user 1','2025-12-13 17:16:39',16,1),(16,1,1000.00,'credit','Referral commission for user 1','2025-12-17 15:09:51',18,1),(17,1,1000.00,'credit','Referral commission for user 1','2025-12-17 15:14:35',19,1),(18,1,1000.00,'credit','Referral commission for user 1','2025-12-18 10:40:56',20,1);
/*!40000 ALTER TABLE `wallettransactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webheroimages`
--

DROP TABLE IF EXISTS `webheroimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webheroimages` (
  `id` int NOT NULL,
  `image1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image3` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webheroimages`
--

LOCK TABLES `webheroimages` WRITE;
/*!40000 ALTER TABLE `webheroimages` DISABLE KEYS */;
INSERT INTO `webheroimages` VALUES (1,'1742138429215.jpg','1742138429215.jpg','1742138429216.jpg');
/*!40000 ALTER TABLE `webheroimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawal_requests`
--

DROP TABLE IF EXISTS `withdrawal_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawal_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawal_requests`
--

LOCK TABLES `withdrawal_requests` WRITE;
/*!40000 ALTER TABLE `withdrawal_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `withdrawal_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'railway'
--

--
-- Dumping routines for database 'railway'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-24 22:06:09
