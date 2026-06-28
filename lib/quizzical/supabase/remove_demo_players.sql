-- Remove all test/demo players. Leaderboard only shows real Clerk users (user_id like 'user_%').
delete from public.user_xp_events where user_id not like 'user_%';
delete from public.user_discoveries where user_id not like 'user_%';
delete from public.user_progress where user_id not like 'user_%';

-- Confirm: should return 0 rows until real players earn XP
select username, xp, level, country_code
from public.user_progress
where user_id like 'user_%'
order by xp desc;
