begin;
drop
  publication if exists supabase_realtime;
create publication supabase_realtime;
commit;
alter
  publication supabase_realtime 
  add table orders;
alter
  publication supabase_realtime 
  add table internal_settings;
