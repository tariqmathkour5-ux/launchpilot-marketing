CREATE TABLE `users` (
`id` int AUTO_INCREMENT NOT NULL,
`openId` varchar(64) NOT NULL,
`name` text,
`email` varchar(320),
`loginMethod` varchar(64),
`role` enum('user','admin') NOT NULL DEFAULT 'user',
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `users_id` PRIMARY KEY(`id`),
CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

CREATE TABLE `categories` (
`id` int AUTO_INCREMENT NOT NULL,
`name` varchar(255) NOT NULL,
`slug` varchar(255) NOT NULL,
`description` text,
`icon` varchar(255),
`color` varchar(7),
`displayOrder` int NOT NULL DEFAULT 0,
`isActive` boolean NOT NULL DEFAULT true,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `categories_id` PRIMARY KEY(`id`),
CONSTRAINT `categories_name_unique` UNIQUE(`name`),
CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `tools` (
`id` int AUTO_INCREMENT NOT NULL,
`name` varchar(255) NOT NULL,
`slug` varchar(255) NOT NULL,
`description` text NOT NULL,
`longDescription` text,
`website` varchar(2048) NOT NULL,
`logo` varchar(2048),
`categoryId` int NOT NULL,
`pricingModel` enum('free','freemium','paid','enterprise','open_source') NOT NULL,
`tags` json NOT NULL DEFAULT (json_array()),
`isVerified` boolean NOT NULL DEFAULT false,
`rating` decimal(3,2) DEFAULT '0',
`reviewCount` int NOT NULL DEFAULT 0,
`monthlyUsers` int,
`features` json NOT NULL DEFAULT (json_array()),
`integrations` json NOT NULL DEFAULT (json_array()),
`apiAvailable` boolean NOT NULL DEFAULT false,
`freeTrialDays` int,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `tools_id` PRIMARY KEY(`id`),
CONSTRAINT `tools_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `blog_posts` (
`id` int AUTO_INCREMENT NOT NULL,
`title` varchar(255) NOT NULL,
`slug` varchar(255) NOT NULL,
`excerpt` text,
`content` text NOT NULL,
`featuredImage` varchar(2048),
`authorId` int NOT NULL,
`tags` json NOT NULL DEFAULT (json_array()),
`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
`publishedAt` timestamp,
`viewCount` int NOT NULL DEFAULT 0,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `contact_messages` (
`id` int AUTO_INCREMENT NOT NULL,
`name` varchar(255) NOT NULL,
`email` varchar(320) NOT NULL,
`subject` varchar(255) NOT NULL,
`message` text NOT NULL,
`status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
`isSpam` boolean NOT NULL DEFAULT false,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
