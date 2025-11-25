-- Add isAdmin column to User table
-- This migration is safe and preserves existing data

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Grant admin access to specified email addresses
UPDATE "User" SET "isAdmin" = true WHERE email IN ('mceeloh@gmail.com', 'sydten.co@gmail.com');
