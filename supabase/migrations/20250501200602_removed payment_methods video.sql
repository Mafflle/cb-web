drop policy "Allow everyone read payment methods" on "public"."payment_methods";

revoke delete on table "public"."payment_methods" from "anon";

revoke insert on table "public"."payment_methods" from "anon";

revoke references on table "public"."payment_methods" from "anon";

revoke select on table "public"."payment_methods" from "anon";

revoke trigger on table "public"."payment_methods" from "anon";

revoke truncate on table "public"."payment_methods" from "anon";

revoke update on table "public"."payment_methods" from "anon";

revoke delete on table "public"."payment_methods" from "authenticated";

revoke insert on table "public"."payment_methods" from "authenticated";

revoke references on table "public"."payment_methods" from "authenticated";

revoke select on table "public"."payment_methods" from "authenticated";

revoke trigger on table "public"."payment_methods" from "authenticated";

revoke truncate on table "public"."payment_methods" from "authenticated";

revoke update on table "public"."payment_methods" from "authenticated";

revoke delete on table "public"."payment_methods" from "service_role";

revoke insert on table "public"."payment_methods" from "service_role";

revoke references on table "public"."payment_methods" from "service_role";

revoke select on table "public"."payment_methods" from "service_role";

revoke trigger on table "public"."payment_methods" from "service_role";

revoke truncate on table "public"."payment_methods" from "service_role";

revoke update on table "public"."payment_methods" from "service_role";

alter table "public"."currencies" drop constraint "currencies_payment_method_id_fkey";

alter table "public"."payments" drop constraint "payments_payment_method_id_fkey";

alter table "public"."payment_methods" drop constraint "payment_methods_pkey";

drop index if exists "public"."payment_methods_pkey";

drop table "public"."payment_methods";

alter table "public"."currencies" drop column "payment_method_id";

alter table "public"."payments" drop column "payment_method_id";


