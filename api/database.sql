-- ============================================================================
-- NSTU BUS TRACKER DATABASE SCHEMA (PHP + MySQL)
-- Database Name: nstu_bus_tracker
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `nstu_bus_tracker` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nstu_bus_tracker`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('super_admin', 'transport_admin', 'driver', 'student') NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `department` VARCHAR(100) DEFAULT NULL,
    `student_id` VARCHAR(50) DEFAULT NULL,
    `license_number` VARCHAR(50) DEFAULT NULL,
    `avatar` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ROUTES TABLE
CREATE TABLE IF NOT EXISTS `routes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `route_name` VARCHAR(100) NOT NULL,
    `start_location` VARCHAR(100) NOT NULL,
    `end_location` VARCHAR(100) NOT NULL,
    `distance_km` DECIMAL(5,2) NOT NULL,
    `estimated_minutes` INT NOT NULL,
    `total_stops` INT NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. BUSES TABLE
CREATE TABLE IF NOT EXISTS `buses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bus_number` VARCHAR(50) NOT NULL UNIQUE,
    `registration_number` VARCHAR(50) NOT NULL,
    `capacity` INT NOT NULL,
    `driver_id` INT DEFAULT NULL,
    `route_id` INT DEFAULT NULL,
    `status` ENUM('active', 'in_transit', 'maintenance', 'inactive') DEFAULT 'active',
    `current_lat` DECIMAL(10,8) DEFAULT 22.79250000,
    `current_lng` DECIMAL(11,8) DEFAULT 91.10020000,
    `speed_kmh` INT DEFAULT 0,
    `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. BUS STOPS TABLE
CREATE TABLE IF NOT EXISTS `bus_stops` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `route_id` INT NOT NULL,
    `stop_name` VARCHAR(100) NOT NULL,
    `stop_order` INT NOT NULL,
    `arrival_time` TIME DEFAULT NULL,
    `lat` DECIMAL(10,8) NOT NULL,
    `lng` DECIMAL(11,8) NOT NULL,
    FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS `schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bus_id` INT NOT NULL,
    `route_id` INT NOT NULL,
    `departure_time` TIME NOT NULL,
    `arrival_time` TIME NOT NULL,
    `shift` ENUM('morning', 'afternoon', 'evening') NOT NULL,
    `day_type` ENUM('regular', 'weekend', 'exam') DEFAULT 'regular',
    `status` ENUM('scheduled', 'in_transit', 'completed', 'cancelled') DEFAULT 'scheduled',
    FOREIGN KEY (`bus_id`) REFERENCES `buses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS `attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `bus_id` INT NOT NULL,
    `stop_name` VARCHAR(100) NOT NULL,
    `scan_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('present', 'absent', 'late') DEFAULT 'present',
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`bus_id`) REFERENCES `buses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `subject` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('pending', 'in_investigation', 'resolved', 'dismissed') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('delay', 'maintenance', 'announcement', 'emergency') NOT NULL,
    `target_role` ENUM('all', 'student', 'driver', 'transport_admin') DEFAULT 'all',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SEED INITIAL DEMO DATA (Default Password for demo users: "password")
-- Password Hash using bcrypt: $2y$10$e0MYzXyjpJS7Pd0RVvHwHe1g.wJq.08Mh7x79j61oTz8pX6hXfQ9S
-- ============================================================================

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `department`, `student_id`, `license_number`) VALUES
(1, 'Dr. Abdullah Al-Mamun', 'admin@nstu.edu.bd', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1g.wJq.08Mh7x79j61oTz8pX6hXfQ9S', 'super_admin', '+880 1711-000001', 'Administration', NULL, NULL),
(2, 'Md. Rafiqul Islam', 'transport@nstu.edu.bd', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1g.wJq.08Mh7x79j61oTz8pX6hXfQ9S', 'transport_admin', '+880 1711-000002', 'Transport Dept', NULL, NULL),
(3, 'Md. Karim Uddin', 'driver@nstu.edu.bd', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1g.wJq.08Mh7x79j61oTz8pX6hXfQ9S', 'driver', '+880 1711-000003', 'Transport Dept', NULL, 'DL-2022-0045'),
(4, 'Nafisa Rahman', 'student@nstu.edu.bd', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1g.wJq.08Mh7x79j61oTz8pX6hXfQ9S', 'student', '+880 1711-000004', 'CSE Dept', 'CSE-2020-001', NULL);

INSERT INTO `routes` (`id`, `route_name`, `start_location`, `end_location`, `distance_km`, `estimated_minutes`, `total_stops`) VALUES
(1, 'Route A - Sonapur Express', 'NSTU Main Gate', 'Maijdee Court', 12.50, 25, 4),
(2, 'Route B - Chowmuhani Shuttle', 'NSTU Campus', 'Chowmuhani Square', 18.00, 35, 6);

INSERT INTO `buses` (`id`, `bus_number`, `registration_number`, `capacity`, `driver_id`, `route_id`, `status`, `current_lat`, `current_lng`, `speed_kmh`) VALUES
(1, 'NSTU-01', 'DHAKA-METRO-11-2024', 52, 3, 1, 'in_transit', 22.81200000, 91.09800000, 44),
(2, 'NSTU-02', 'DHAKA-METRO-11-2025', 52, NULL, 2, 'active', 22.86400000, 91.09700000, 0);

INSERT INTO `notifications` (`id`, `title`, `message`, `type`, `target_role`) VALUES
(1, 'Route A Traffic Delay', 'Bus NSTU-01 delayed by 10 mins due to Sonapur road repair.', 'delay', 'all'),
(2, 'Emergency Maintenance Notice', 'Bus NSTU-03 undergoing scheduled engine maintenance.', 'maintenance', 'all');
