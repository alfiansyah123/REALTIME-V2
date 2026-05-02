-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 03 Jan 2026 pada 16.55
-- Versi server: 8.0.37-cll-lve
-- Versi PHP: 8.1.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ccpxengi_report`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `conversions`
--

CREATE TABLE `conversions` (
  `id` int NOT NULL,
  `click_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sub_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Unknown',
  `network` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'IMONETIZEIT',
  `country` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'US',
  `country_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'United States',
  `traffic_type` enum('WAP','WEB','APP','BOT') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'WEB',
  `earning` decimal(10,4) DEFAULT '0.0000',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `conversions`
--

INSERT INTO `conversions` (`id`, `click_id`, `sub_id`, `network`, `country`, `country_name`, `traffic_type`, `earning`, `ip_address`, `user_agent`, `created_at`) VALUES
(51, 'honda', 'honda', 'Lospollos', 'US', 'US', 'WEB', 2.4000, '46.21.30.243', '', '2026-01-02 16:48:33'),
(56, 'SHERLY', 'SHERLY', 'Lospollos', 'US', 'US', 'WEB', 2.4000, '46.21.30.243', '', '2026-01-02 17:52:33'),
(61, 'Hartoyo99', 'Hartoyo99', 'Trafee', 'RO', 'RO', 'WAP', 1.6000, '36.50.142.197', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 09:29:49');

-- --------------------------------------------------------

--
-- Struktur dari tabel `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` int NOT NULL,
  `date` date NOT NULL,
  `smartlink` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `network` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'IMONETIZEIT',
  `visits` int DEFAULT '0',
  `unique_visits` int DEFAULT '0',
  `clicks` int DEFAULT '0',
  `leads` int DEFAULT '0',
  `payout` decimal(10,4) DEFAULT '0.0000',
  `epc` decimal(10,4) DEFAULT '0.0000',
  `cr` decimal(5,2) DEFAULT '0.00',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `daily_reports`
--

INSERT INTO `daily_reports` (`id`, `date`, `smartlink`, `network`, `visits`, `unique_visits`, `clicks`, `leads`, `payout`, `epc`, `cr`, `updated_at`) VALUES
(4, '2026-01-03', 'COKK', 'Unknown', 0, 0, 0, 1, 12.0000, 0.0000, 0.00, '2026-01-03 09:09:33'),
(5, '2026-01-03', 'Hartoyo99', 'Unknown', 0, 0, 0, 2, 3.2000, 0.0000, 0.00, '2026-01-03 09:23:38'),
(7, '2026-01-03', 'Hartoyo99', 'Trafee', 0, 0, 0, 4, 6.4000, 0.0000, 0.00, '2026-01-03 09:49:18');

-- --------------------------------------------------------

--
-- Struktur dari tabel `link`
--

CREATE TABLE `link` (
  `id` int NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetUrl` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `trackerId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `network` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ogImage` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ogTitle` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ogDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `clickCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `useLandingPage` tinyint(1) NOT NULL DEFAULT '0',
  `leadCount` int DEFAULT '0',
  `totalPayout` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tracker`
--

CREATE TABLE `tracker` (
  `id` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `team` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `targetUrl` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `domainId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', '$2y$10$1xNL6eugTEptbeYSiIZLCO6QMHSFvJLrott6rYHv/KJgRgNKxsawC', '2025-12-20 22:35:21');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `conversions`
--
ALTER TABLE `conversions`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_report` (`date`,`smartlink`,`network`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `conversions`
--
ALTER TABLE `conversions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT untuk tabel `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
