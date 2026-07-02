-- ═══════════════════════════════════════════════════════
--  Vape & Tea House POS — Supabase schema
--  Run this once in Supabase Dashboard → SQL Editor.
-- ═══════════════════════════════════════════════════════

-- ── Categories ──
create table if not exists categories (
    id serial primary key,
    name text not null,
    description text
);

-- ── Users (custom login table — NOT Supabase Auth) ──
create table if not exists users (
    id serial primary key,
    username text unique not null,
    password text not null,          -- ⚠ stored in plain text, see README security note
    name text not null,
    role text not null check (role in ('admin','manager','staff','warehouse','cashier')),
    created timestamptz default now()
);

-- ── Products ──
create table if not exists products (
    id serial primary key,
    name text not null,
    description text,
    category_id integer references categories(id) on delete set null,
    price_usd numeric(10,2) not null default 0,
    price_khr numeric(12,0) not null default 0,
    stock integer not null default 0,
    image text,               -- base64 data URL (small demo images) or a Supabase Storage URL
    barcode text,
    created timestamptz default now()
);

-- ── Customers ──
create table if not exists customers (
    id serial primary key,
    name text not null,
    phone text,
    email text,
    address text,
    debt_balance numeric(10,2) not null default 0,
    created timestamptz default now()
);

-- ── Sales (one row per checkout OR per debt payment) ──
create table if not exists sales (
    id serial primary key,
    items jsonb not null default '[]',
    total_usd numeric(10,2) default 0,
    total_khr numeric(12,0) default 0,
    subtotal_usd numeric(10,2) default 0,
    subtotal_khr numeric(12,0) default 0,
    tax numeric default 0,
    discount numeric default 0,
    payment text,
    customer_id integer references customers(id) on delete set null,
    debt_amount numeric(10,2) default 0,
    is_payment boolean not null default false,
    payment_amount numeric(10,2),
    payment_method text,
    user_id integer references users(id) on delete set null,
    user_name text,
    date timestamptz default now()
);

-- ── Settings (single row, id is always 1) ──
create table if not exists settings (
    id integer primary key default 1,
    language text default 'en',
    currency text default 'usd',
    theme text default 'light',
    telegram_bot_token text default '',
    telegram_chat_id text default '',
    auto_send_report boolean default true,
    last_report_date text default '',
    constraint settings_single_row check (id = 1)
);

-- ═══════════════════════════════════════════════════════
--  Seed data (matches the app's original demo defaults)
-- ═══════════════════════════════════════════════════════

insert into categories (id, name, description) values
    (1, 'E-Liquids', 'Vape juices and e-liquids'),
    (2, 'Devices', 'Vape mods, pods, and kits'),
    (3, 'Tea Leaves', 'Loose leaf teas'),
    (4, 'Tea Bags', 'Convenient tea bags'),
    (5, 'Accessories', 'Vape and tea accessories')
on conflict (id) do nothing;
select setval('categories_id_seq', (select max(id) from categories));

insert into users (id, username, password, name, role) values
    (1, 'admin', 'admin123', 'Super Admin', 'admin'),
    (2, 'manager', 'manager123', 'John Manager', 'manager'),
    (3, 'staff', 'staff123', 'Jane Staff', 'staff'),
    (4, 'warehouse', 'warehouse123', 'Mike Warehouse', 'warehouse'),
    (5, 'cashier', 'cashier123', 'Lisa Cashier', 'cashier')
on conflict (id) do nothing;
select setval('users_id_seq', (select max(id) from users));

insert into products (id, name, description, category_id, price_usd, price_khr, stock, barcode) values
    (1, 'Strawberry Ice E-Liquid', 'Sweet strawberry with a cool menthol finish', 1, 12.99, 52500, 45, 'VAPE001'),
    (2, 'Mango Tango E-Liquid', 'Ripe mango flavor with a tropical twist', 1, 14.99, 60500, 32, 'VAPE002'),
    (3, 'Vape Pod Kit X', 'Compact pod system with 1000mAh battery', 2, 39.99, 161500, 18, 'VAPE003'),
    (4, 'Green Tea Leaves - Premium', 'High-quality green tea from Japan', 3, 8.99, 36300, 60, 'TEA001'),
    (5, 'Earl Grey Tea Bags', 'Classic Earl Grey in convenient tea bags', 4, 6.99, 28200, 80, 'TEA002'),
    (6, 'Chamomile Tea Bags', 'Calming chamomile for relaxation', 4, 5.99, 24200, 55, 'TEA003'),
    (7, 'Vape Coils - Pack of 5', 'Replacement coils for pod systems', 5, 9.99, 40300, 40, 'VAPE004'),
    (8, 'Tea Infuser Bottle', 'Glass bottle with built-in tea infuser', 5, 15.99, 64600, 25, 'TEA004')
on conflict (id) do nothing;
select setval('products_id_seq', (select max(id) from products));

insert into customers (id, name, phone, email, address, debt_balance) values
    (1, 'Sokha Tea', '012345678', 'sokha@example.com', 'Phnom Penh', 0),
    (2, 'Vannak Vape', '098765432', 'vannak@example.com', 'Siem Reap', 0)
on conflict (id) do nothing;
select setval('customers_id_seq', (select max(id) from customers));

insert into settings (id, language, currency, theme, auto_send_report)
values (1, 'en', 'usd', 'light', true)
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════
--  Row Level Security
--
--  This app authenticates with its own `users` table rather
--  than Supabase Auth, so it connects with the public anon
--  key and RLS is left OFF (default) so the anon key can
--  read/write. This is fine for an internal single-location
--  POS, but anyone with the anon key can query these tables
--  directly. Before wider deployment, consider:
--    1. Moving to Supabase Auth + RLS policies, or
--    2. Putting all writes behind a server-side function
--       (Supabase Edge Function) that checks the request,
--       and only ever calling that from the client.
-- ═══════════════════════════════════════════════════════
