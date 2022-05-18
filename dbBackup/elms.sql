-- elms database backup
-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 28, 2022 at 05:54 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `elms_new`
--

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `userId` int(11) NOT NULL,
  `employeeId` varchar(50) DEFAULT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `middleName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `userName` varchar(100) DEFAULT NULL,
  `email` text DEFAULT NULL,
  `password` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `cityName` varchar(100) DEFAULT NULL,
  `stateName` varchar(100) DEFAULT NULL,
  `countryName` varchar(100) DEFAULT NULL,
  `zipCode` varchar(50) DEFAULT NULL,
  `phoneNumber` varchar(50) DEFAULT NULL,
  `dateOfBirth` varchar(50) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `dateOfJoining` varchar(50) DEFAULT NULL,
  `profileImage` text DEFAULT NULL,
  `bloodGroup` varchar(20) DEFAULT NULL,
  `maritalStatus` varchar(20) DEFAULT NULL COMMENT 'single, married',
  `role` varchar(20) DEFAULT 'employee' COMMENT 'employee, admin',
  `status` tinyint(1) DEFAULT 1 COMMENT '0-Inactive, 1-Active, 2-Blocked',
  `lastLoginDateTime` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `employeeId` (`employeeId`),
  ADD UNIQUE KEY `email` (`email`) USING HASH;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
