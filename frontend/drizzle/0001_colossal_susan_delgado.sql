CREATE TABLE `analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`achievements` text,
	`play_time` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `learning_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`current_level` integer DEFAULT 1 NOT NULL,
	`total_score` integer DEFAULT 0 NOT NULL,
	`achievements` text,
	`offline_sync` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject` text NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`correct_answer` integer NOT NULL,
	`difficulty` integer NOT NULL,
	`anti_cheat_flags` text
);
