-- ZVV Kreditorenworkflow Dashboard - Initial Schema
-- Erstellt alle Tabellen und Views für das Kreditorenworkflow System

-- Konto (Account)
create table account (
  id uuid primary key default gen_random_uuid(),
  konto_nr text not null unique,
  name text not null,
  currency char(3) not null default 'CHF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Objektkredit (OK)
create table object_credit (
  id uuid primary key default gen_random_uuid(),
  ok_nr text not null unique,
  account_id uuid not null references account(id) on delete restrict,
  title text not null,
  budget_total numeric(18,2) not null default 0,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Import Batch (Auditing)
create table import_batch (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_file_name text,
  source_file_hash text,
  imported_at timestamptz not null default now()
);

-- Einzelbuchung (Booking)
create table booking (
  id bigserial primary key,
  ok_id uuid not null references object_credit(id) on delete restrict,
  account_id uuid not null references account(id) on delete restrict,
  import_batch_id uuid references import_batch(id) on delete set null,

  booking_date date not null,
  beleg_nr text,
  text_long text,
  gegenkonto text,
  amount numeric(18,2) not null,  -- Aufwand = negativ speichern
  currency char(3) not null default 'CHF',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint booking_ok_account_match
    check (account_id = (select oc.account_id from object_credit oc where oc.id = ok_id))
);

-- Aggregations-View für OK-Übersicht
create or replace view v_ok_overview as
select
  oc.id as ok_id,
  oc.ok_nr,
  oc.title,
  oc.budget_total,
  coalesce(sum(b.amount), 0) as spent,
  oc.budget_total - coalesce(sum(b.amount), 0) as available,
  count(b.id) as booking_count,
  min(b.booking_date) as first_booking,
  max(b.booking_date) as last_booking,
  oc.account_id,
  a.konto_nr,
  a.name as account_name
from object_credit oc
left join account a on a.id = oc.account_id
left join booking b on b.ok_id = oc.id
group by oc.id, oc.ok_nr, oc.title, oc.budget_total, oc.account_id, a.konto_nr, a.name;

-- View für Account-Übersicht
create or replace view v_account_overview as
select
  a.id as account_id,
  a.konto_nr,
  a.name as account_name,
  count(oc.id) as ok_count,
  sum(oc.budget_total) as total_budget,
  sum(coalesce(b.spent, 0)) as total_spent,
  sum(oc.budget_total) - sum(coalesce(b.spent, 0)) as total_available
from account a
left join object_credit oc on oc.account_id = a.id
left join v_ok_overview b on b.ok_id = oc.id
group by a.id, a.konto_nr, a.name;

-- Indizes für Performance
create index idx_booking_ok_id on booking(ok_id);
create index idx_booking_account_id on booking(account_id);
create index idx_booking_date on booking(booking_date);
create index idx_booking_amount on booking(amount);
create index idx_object_credit_account_id on object_credit(account_id);

-- RLS (Row Level Security) Policies
alter table account enable row level security;
alter table object_credit enable row level security;
alter table booking enable row level security;
alter table import_batch enable row level security;

-- Beispiel-Policy: Alle können lesen (für Demo)
create policy "Allow read access to all users" on account for select using (true);
create policy "Allow read access to all users" on object_credit for select using (true);
create policy "Allow read access to all users" on booking for select using (true);
create policy "Allow read access to all users" on import_batch for select using (true);

-- Beispiel-Daten für Demo
insert into account (konto_nr, name, currency) values
('3911000000', 'Vergütung Informatikdienstleistungen', 'CHF'),
('3912000000', 'Vergütung Beratungsdienstleistungen', 'CHF'),
('3913000000', 'Vergütung Wartungsdienstleistungen', 'CHF');

-- Beispiel-Objektkredite
insert into object_credit (ok_nr, account_id, title, budget_total, start_date, end_date)
select 
  '15982',
  a.id,
  'IT-Services Projekt Alpha',
  500000.00,
  '2024-01-01',
  '2024-12-31'
from account a where a.konto_nr = '3911000000';

insert into object_credit (ok_nr, account_id, title, budget_total, start_date, end_date)
select 
  '15983',
  a.id,
  'IT-Services Projekt Beta',
  300000.00,
  '2024-01-01',
  '2024-12-31'
from account a where a.konto_nr = '3911000000';

-- Beispiel-Buchungen
insert into booking (ok_id, account_id, booking_date, beleg_nr, text_long, gegenkonto, amount, currency)
select 
  oc.id,
  oc.account_id,
  '2024-03-13',
  '133292',
  '2988 KANTON ZUERICH, Pauschale Grundversorgung',
  '2005500100 K',
  -55758.25,
  'CHF'
from object_credit oc where oc.ok_nr = '15982';

insert into booking (ok_id, account_id, booking_date, beleg_nr, text_long, gegenkonto, amount, currency)
select 
  oc.id,
  oc.account_id,
  '2024-03-14',
  '133293',
  '2999 KANTON ZUERICH, Software-Lizenz',
  '2005500100 K',
  -25000.00,
  'CHF'
from object_credit oc where oc.ok_nr = '15982';

insert into booking (ok_id, account_id, booking_date, beleg_nr, text_long, gegenkonto, amount, currency)
select 
  oc.id,
  oc.account_id,
  '2024-03-15',
  '133294',
  '3000 KANTON ZUERICH, Hardware-Ersatz',
  '2005500100 K',
  -15000.00,
  'CHF'
from object_credit oc where oc.ok_nr = '15982';
