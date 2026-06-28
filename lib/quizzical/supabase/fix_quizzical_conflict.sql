-- =============================================================================
-- FIX: "quizzical is not a view" error
-- Run this FIRST, then run setup_leaderboard.sql (or the main script below)
-- =============================================================================

-- Your project has an old TABLE named "quizzical". The app uses "user_progress".
-- This drops the empty legacy table so setup can complete.
drop table if exists public.quizzical cascade;
