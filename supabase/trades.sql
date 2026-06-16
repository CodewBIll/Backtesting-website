create extension if not exists pgcrypto;

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  trade_date date not null,
  pair text not null,
  direction text check (direction in ('LONG', 'SHORT')) not null,
  entry_price numeric not null,
  exit_price numeric not null,
  stop_loss numeric not null,
  take_profit numeric not null,
  pnl numeric not null,
  rr numeric not null,
  result text check (result in ('WIN', 'LOSS', 'BREAKEVEN')) not null,
  technical_analysis text[] default '{}',
  reason text not null,
  screenshot_url text,
  notes text
);

grant usage on schema public to anon, authenticated;
grant select, insert on public.trades to anon, authenticated;

alter table public.trades enable row level security;

drop policy if exists "public can read trades" on public.trades;
create policy "public can read trades"
on public.trades
for select
to anon, authenticated
using (true);

drop policy if exists "public can insert trades" on public.trades;
create policy "public can insert trades"
on public.trades
for insert
to anon, authenticated
with check (true);

insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', true)
on conflict (id) do nothing;

drop policy if exists "public can view trade screenshots" on storage.objects;
create policy "public can view trade screenshots"
on storage.objects
for select
to public
using (bucket_id = 'trade-screenshots');

drop policy if exists "anon can upload trade screenshots" on storage.objects;
create policy "anon can upload trade screenshots"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'trade-screenshots');
