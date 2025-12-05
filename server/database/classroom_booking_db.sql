CREATE DATABASE  IF NOT EXISTS `booking_classroom_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `booking_classroom_db`;
-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: localhost    Database: booking_classroom_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `professor_id` int NOT NULL,
  `class_id` int NOT NULL,
  `start_time` int NOT NULL,
  `end_time` int NOT NULL,
  `subject_id` int DEFAULT NULL,
  `purpose` enum('Lecture','Workshop','Meeting','Seminar','Group Study','Exam','Training Session','Special Event','Tutoring','Club Activity') DEFAULT NULL,
  `booking_type` enum('current_book','reservation','past') NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `professor_id` (`professor_id`),
  KEY `class_id` (`class_id`),
  KEY `bookings_ibfk_4_idx` (`start_time`),
  KEY `bookings_ibfk_5_idx` (`end_time`),
  KEY `bookings_ibfk_6_idx` (`subject_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `professors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`start_time`) REFERENCES `timeslots` (`id`),
  CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`end_time`) REFERENCES `timeslots` (`id`),
  CONSTRAINT `bookings_ibfk_6` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (5,1,11,5,1,5,1,'Lecture','past','2025-12-05','2025-12-05 08:49:17'),(6,2,11,6,8,11,18,'Lecture','past','2025-12-05','2025-12-05 08:49:17');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_schedules`
--

DROP TABLE IF EXISTS `class_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professor_id` int NOT NULL,
  `room_id` int NOT NULL,
  `class_id` int NOT NULL,
  `subject_id` int DEFAULT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time_id` int NOT NULL,
  `end_time_id` int NOT NULL,
  `purpose` enum('Lecture','Workshop','Meeting','Seminar','Group Study','Exam','Training Session','Special Event','Tutoring','Club Activity') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `professor_id` (`professor_id`),
  KEY `room_id` (`room_id`),
  KEY `class_id` (`class_id`),
  KEY `subject_id` (`subject_id`),
  KEY `start_time_id` (`start_time_id`),
  KEY `end_time_id` (`end_time_id`),
  CONSTRAINT `class_schedules_ibfk_1` FOREIGN KEY (`professor_id`) REFERENCES `professors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_schedules_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_schedules_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_schedules_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `class_schedules_ibfk_5` FOREIGN KEY (`start_time_id`) REFERENCES `timeslots` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `class_schedules_ibfk_6` FOREIGN KEY (`end_time_id`) REFERENCES `timeslots` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_schedules`
--

LOCK TABLES `class_schedules` WRITE;
/*!40000 ALTER TABLE `class_schedules` DISABLE KEYS */;
INSERT INTO `class_schedules` VALUES (64,11,1,5,1,'Monday',3,5,'Lecture','2025-12-03 08:27:50','2025-12-04 15:38:39'),(70,7,1,1,7,'Wednesday',13,18,'Lecture','2025-12-04 13:43:37','2025-12-04 16:13:51'),(73,11,1,1,6,'Monday',14,15,'Lecture','2025-12-04 17:04:03','2025-12-04 17:29:37'),(74,11,4,1,11,'Thursday',21,24,'Lecture','2025-12-04 17:09:44','2025-12-04 17:10:09'),(75,11,4,1,NULL,'Monday',18,20,'Lecture','2025-12-04 17:14:09','2025-12-04 17:14:09'),(76,11,2,1,NULL,'Thursday',2,7,'Lecture','2025-12-04 17:22:57','2025-12-04 17:22:57'),(77,11,1,4,3,'Thursday',7,11,'Lecture','2025-12-04 17:23:42','2025-12-05 09:01:09'),(78,7,5,6,10,'Thursday',6,10,'Lecture','2025-12-04 18:37:57','2025-12-04 18:38:13'),(79,7,4,1,14,'Thursday',2,5,'Lecture','2025-12-04 18:39:00','2025-12-04 18:39:00'),(80,11,1,5,1,'Friday',1,5,'Lecture','2025-12-05 10:18:53','2025-12-05 10:19:03'),(82,11,2,6,18,'Friday',8,11,'Lecture','2025-12-04 23:20:40','2025-12-04 23:20:40'),(83,7,1,7,6,'Friday',5,11,'Lecture','2025-12-04 23:21:35','2025-12-04 23:21:35'),(85,7,6,6,5,'Monday',5,11,'Lecture','2025-12-05 08:56:35','2025-12-05 08:56:35');
/*!40000 ALTER TABLE `class_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_name` (`class_name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'1A'),(2,'1B'),(3,'1C'),(4,'2A'),(5,'2B'),(6,'2C'),(7,'3A'),(8,'3B'),(9,'3C'),(10,'4A'),(11,'4B'),(12,'4C');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cron_log`
--

DROP TABLE IF EXISTS `cron_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cron_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `executed` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cron_log`
--

LOCK TABLES `cron_log` WRITE;
/*!40000 ALTER TABLE `cron_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `cron_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `occupancy_history`
--

DROP TABLE IF EXISTS `occupancy_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `occupancy_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `user_id` int NOT NULL,
  `time_in` datetime NOT NULL,
  `time_out` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `occupancy_history_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `occupancy_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `occupancy_history`
--

LOCK TABLES `occupancy_history` WRITE;
/*!40000 ALTER TABLE `occupancy_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `occupancy_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professors`
--

DROP TABLE IF EXISTS `professors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` varchar(45) DEFAULT NULL,
  `professor_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_id_UNIQUE` (`school_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professors`
--

LOCK TABLES `professors` WRITE;
/*!40000 ALTER TABLE `professors` DISABLE KEYS */;
INSERT INTO `professors` VALUES (1,'197779','Rogie Mar A. Bolon'),(2,'12761289','Marites O. Olesco'),(3,'22433768','Kim Arvin P. Leocadio'),(4,'95742293','Alwin M. Lunas'),(5,'33488626','Zendy D. Mañago'),(6,'36291626','Fernan D. Dematera'),(7,'49779078','Melody Mae P. Montas'),(8,'84841523','Edgardo U. Aragon'),(9,'94426115','Laurence Albert D. Ayo'),(10,'87512340','Peejay N. Gealone'),(11,'82141747','Rolando P. Dacillo'),(12,'76867660','Garry V. Hilutin'),(13,'73382822','Vincent D. Diaz'),(14,'85461015','Ricardo C. Cleofe'),(15,'73131162','Fe D. Ataiza');
/*!40000 ALTER TABLE `professors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) NOT NULL,
  `capacity` int NOT NULL,
  `whiteboard` tinyint(1) NOT NULL DEFAULT '0',
  `tv` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'201',60,1,0),(2,'202',80,1,1),(3,'203',60,1,1),(4,'204',60,1,0),(5,'205',80,0,0),(6,'206',60,0,0),(7,'207',60,1,1),(8,'208',60,1,0);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code_UNIQUE` (`course_code`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'Math 10','Basic Engineering Mathematics'),(2,'Chem 11','Chemistry for Engineers (Lec)'),(3,'Math 14','Differential Equations'),(4,'EE 323','EE Laws, Codes and Professional Ethics'),(5,'EE 322L','Electrical Apparatus and Devices (Lab)'),(6,'EE 322','Electrical Apparatus and Devices (Lec)'),(7,'EE 211L','Electrical Circuits 1 (Lab)'),(8,'EE 211','Electrical Circuits 1 (Lec)'),(9,'EE 321','Electrical Machines 2 (Lec)'),(10,'Math 13','Engineering Data Analysis'),(11,'BES 14','Engineering Mechanics'),(12,'EE 325','Feedback and Control Systems'),(13,'EE 326','Introduction to Nuclear Engineering'),(14,'EE 313L','Logic Circuits and Switching Theory (Lab)'),(15,'EE 421L','Power Systems Analysis (Lab)'),(16,'EE 421','Power Systems Analysis (Lec)'),(17,'EE 310','Research Methods'),(18,'BES 21','Technopreneurship');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timeslots`
--

DROP TABLE IF EXISTS `timeslots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeslots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timeslots`
--

LOCK TABLES `timeslots` WRITE;
/*!40000 ALTER TABLE `timeslots` DISABLE KEYS */;
INSERT INTO `timeslots` VALUES (1,'07:00:00'),(2,'07:30:00'),(3,'08:00:00'),(4,'08:30:00'),(5,'09:00:00'),(6,'09:30:00'),(7,'10:00:00'),(8,'10:30:00'),(9,'11:00:00'),(10,'11:30:00'),(11,'12:00:00'),(12,'12:30:00'),(13,'13:00:00'),(14,'13:30:00'),(15,'14:00:00'),(16,'14:30:00'),(17,'15:00:00'),(18,'15:30:00'),(19,'16:00:00'),(20,'16:30:00'),(21,'17:00:00'),(22,'17:30:00'),(23,'18:00:00'),(24,'18:30:00'),(25,'19:00:00');
/*!40000 ALTER TABLE `timeslots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `middle_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `department` varchar(60) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_type` int DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `reset_code` int DEFAULT NULL,
  `booking_color` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `schoolId_UNIQUE` (`school_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `professors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'admin','Admin','',NULL,NULL,NULL,'admin',0,NULL,NULL,''),(7,7,'melodyMae@gmail.com',NULL,NULL,NULL,NULL,NULL,'$2b$10$wyY01zyAfzBxRJ19NhH2D.X4XKiZSW/hiwMD4O.zQ7jzOONSlMfJS',1,NULL,NULL,'#4ecdc4'),(9,11,'rolandoDacillo@gmail.com',NULL,NULL,NULL,NULL,NULL,'$2b$10$L4dJBG9.20KOoAlLknAeMebaHXkzvTfE97pqv8dWkIjcZb6wGamru',1,NULL,NULL,'#8854d0');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-05 17:04:53
