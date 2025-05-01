create policy "Allow everyone read currencies"
on "public"."currencies"
as permissive
for select
to public
using (true);


create policy "Allow everyone read payment methods"
on "public"."payment_methods"
as permissive
for select
to public
using (true);


create policy "Authenticated users can insert payments"
on "public"."payments"
as permissive
for insert
to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Authenticated users can select their own payments"
on "public"."payments"
as permissive
for select
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Authenticated users can update their own payments"
on "public"."payments"
as permissive
for update
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



