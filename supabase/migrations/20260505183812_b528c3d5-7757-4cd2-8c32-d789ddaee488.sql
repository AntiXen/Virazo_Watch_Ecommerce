
-- ============== ROLES ==============
create type public.app_role as enum ('admin','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First signup becomes admin, rest customer
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare _role app_role;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));

  if (select count(*) from public.user_roles where role='admin') = 0 then
    _role := 'admin';
  else
    _role := 'customer';
  end if;
  insert into public.user_roles (user_id, role) values (new.id, _role);
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Profiles policies
create policy "users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "admins view all profiles" on public.profiles for select using (public.has_role(auth.uid(),'admin'));
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- Roles policies
create policy "users view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============== CATALOG ==============
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  created_at timestamptz not null default now()
);
alter table public.brands enable row level security;
create policy "public read brands" on public.brands for select using (true);
create policy "admin manage brands" on public.brands for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select using (true);
create policy "admin manage categories" on public.categories for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  price numeric(10,2) not null default 0,
  discount_price numeric(10,2),
  stock int not null default 0,
  low_stock_threshold int not null default 5,
  rating numeric(3,2) default 0,
  reviews_count int default 0,
  warranty text,
  specs jsonb default '[]'::jsonb,
  images text[] default '{}',
  tags text[] default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "public read active products" on public.products for select using (is_active = true or public.has_role(auth.uid(),'admin'));
create policy "admin manage products" on public.products for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text,
  price_delta numeric(10,2) default 0,
  stock int not null default 0
);
alter table public.product_variants enable row level security;
create policy "public read variants" on public.product_variants for select using (true);
create policy "admin manage variants" on public.product_variants for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.inventory_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  change int not null,
  reason text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
alter table public.inventory_log enable row level security;
create policy "admin read inv log" on public.inventory_log for select using (public.has_role(auth.uid(),'admin'));
create policy "admin write inv log" on public.inventory_log for insert with check (public.has_role(auth.uid(),'admin'));

-- ============== ORDERS ==============
create type public.order_status as enum ('pending','processing','delivered','cancelled');
create type public.payment_status as enum ('unpaid','paid','refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('LX-' || to_char(now(),'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  address text not null,
  city text not null,
  notes text,
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status order_status not null default 'pending',
  payment_method text not null default 'cod',
  payment_status payment_status not null default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "anyone create order" on public.orders for insert with check (true);
create policy "owner read order" on public.orders for select using (auth.uid() = user_id);
create policy "admin read all orders" on public.orders for select using (public.has_role(auth.uid(),'admin'));
create policy "admin update orders" on public.orders for update using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete orders" on public.orders for delete using (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null,
  quantity int not null
);
alter table public.order_items enable row level security;
create policy "anyone insert order items" on public.order_items for insert with check (true);
create policy "owner read items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin')))
);
create policy "admin manage items" on public.order_items for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============== REVIEWS ==============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  location text,
  rating int not null check (rating between 1 and 5),
  text text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "public read approved reviews" on public.reviews for select using (approved = true or public.has_role(auth.uid(),'admin'));
create policy "anyone submit review" on public.reviews for insert with check (true);
create policy "admin manage reviews" on public.reviews for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============== BANNERS / DEALS ==============
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  link_url text,
  cta_label text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.banners enable row level security;
create policy "public read active banners" on public.banners for select using (is_active = true or public.has_role(auth.uid(),'admin'));
create policy "admin manage banners" on public.banners for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  title text not null,
  subtitle text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  is_active boolean not null default true
);
alter table public.deals enable row level security;
create policy "public read active deals" on public.deals for select using (is_active = true or public.has_role(auth.uid(),'admin'));
create policy "admin manage deals" on public.deals for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============== CONTENT (key/value JSONB) ==============
create table public.content_blocks (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.content_blocks enable row level security;
create policy "public read content" on public.content_blocks for select using (true);
create policy "admin manage content" on public.content_blocks for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============== STORAGE BUCKETS ==============
insert into storage.buckets (id, name, public) values
  ('products','products', true),
  ('banners','banners', true),
  ('brands','brands', true)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects for select using (bucket_id in ('products','banners','brands'));
create policy "admin upload images" on storage.objects for insert with check (
  bucket_id in ('products','banners','brands') and public.has_role(auth.uid(),'admin')
);
create policy "admin update images" on storage.objects for update using (
  bucket_id in ('products','banners','brands') and public.has_role(auth.uid(),'admin')
);
create policy "admin delete images" on storage.objects for delete using (
  bucket_id in ('products','banners','brands') and public.has_role(auth.uid(),'admin')
);
