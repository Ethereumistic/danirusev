# Stripe Pricing Security Mitigation Plan

This document outlines the step-by-step plan to migrate the checkout process from a client-side pricing model to a secure, server-side validated model.

## 1. Context & Vulnerability
Currently, the `app/api/create-payment-intent/route.ts` and `app/(frontend)/checkout/actions.ts` trust the `price` field sent from the frontend. A malicious user can modify the JSON payload in their browser to set the price to €1.00 for any item.

## 2. Server-Side Data Source
The source of truth for all pricing is the Supabase database (synced via Payload CMS):
- **Table**: `public.products`
- **Base Price**: `price` column.
- **Physical Variants**: Prices calculated as `base_price + price_modifier` (stored in `products_variants` or similar join table).
- **Experience Add-ons**: Prices stored in `products_additional_items` (or the corresponding relational table for the array field).

## 3. Implementation Steps

### Phase 1: Frontend Data Transformation
Modify the `CheckoutForm` and `cart-store` logic to send only the essential identifiers instead of calculated prices.
- **Physical Products**: Send `id` and `variantSku`.
- **Experience Products**: Send `id` and `selectedAddonIds` (or names).
- **Remove**: Stop sending the `price` field entirely to avoid any ambiguity on the server.

### Phase 2: Backend Validation Logic (`api/create-payment-intent/route.ts`)
The API route must be refactored to perform the following:

1.  **Extract IDs**: Collect all unique Product IDs from the incoming `cartItems`.
2.  **Fetch Truth**: Query Supabase for the records in bulk:
    ```sql
    SELECT id, price, product_type FROM public.products WHERE id = ANY($1)
    ```
3.  **Calculate Per-Item Price**:
    - **For Physical Products**:
        - Fetch the variant modifier from the database using the `variantSku`.
        - `finalPrice = base_price + price_modifier`.
    - **For Experience Products**:
        - Fetch the allowed `additional_items` for that product ID from the database.
        - Loop through the user's `selectedAddonIds`.
        - `finalPrice = base_price + SUM(addon_price)`.
4.  **Security Check**: Ensure the product exists and is active (`_status = 'published'`).
5.  **Calculate Total**: Multiply `finalPrice` by `quantity` on the server.

### Phase 3: Stripe Integration Update
- Use the **server-calculated total** for the `amount` field in `stripe.paymentIntents.create`.
- **Do not** pass the frontend total variable into Stripe.

### Phase 4: Order Confirmation & Webhooks
- Update the Stripe Webhook (`app/api/webhooks/stripe/route.ts`) to ensure that when it verifies a successful payment, it compares the amount against the expected server-calculated price one last time before fulfilling the order.

## 4. Security Benefits
- **Integrity**: Users cannot manipulate prices.
- **Consistency**: If a price is updated in Payload CMS, the checkout process reflects it immediately without needing frontend changes.
- **Auditability**: All price calculations happen in a controlled, logged server environment.

## 5. Next Steps
1. Update `app/api/create-payment-intent/route.ts` with the new validation logic.
2. Clean up `app/(frontend)/checkout/actions.ts` to remove the commented-out (and vulnerable) sections.
3. Test with a test card to ensure the "totalAmount" in Stripe matches the database + addons sum exactly.

## Table definitions:

# Products
create table public.products (
  id serial not null,
  title character varying null,
  slug character varying null,
  product_type public.enum_products_product_type null default 'physical'::enum_products_product_type,
  price numeric null,
  compare_at_price numeric null,
  stock numeric null default 0,
  low_stock_threshold numeric null default 5,
  subtitle character varying null,
  duration character varying null,
  tech_specs_car_model character varying null,
  tech_specs_horse_power numeric null,
  tech_specs_tires_burned character varying null,
  visuals_icon_name character varying null,
  visuals_theme_color public.enum_products_visuals_theme_color null default 'main'::enum_products_visuals_theme_color,
  visuals_pattern public.enum_products_visuals_pattern null default 'none'::enum_products_visuals_pattern,
  description character varying null,
  updated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  _status public.enum_products_status null default 'draft'::enum_products_status,
  tab_names_program character varying null,
  tab_names_included character varying null,
  tab_names_additional character varying null,
  constraint products_pkey primary key (id)
) TABLESPACE pg_default;

create unique INDEX IF not exists products_slug_idx on public.products using btree (slug) TABLESPACE pg_default;

create index IF not exists products_updated_at_idx on public.products using btree (updated_at) TABLESPACE pg_default;

create index IF not exists products_created_at_idx on public.products using btree (created_at) TABLESPACE pg_default;

create index IF not exists products__status_idx on public.products using btree (_status) TABLESPACE pg_default;

# Products additional items

create table public.products_additional_items (
  _order integer not null,
  _parent_id integer not null,
  id character varying not null,
  name character varying null,
  price numeric null,
  description character varying null,
  icon character varying null,
  type public.enum_products_additional_items_type null default 'standard'::enum_products_additional_items_type,
  google_maps_url character varying null,
  constraint products_additional_items_pkey primary key (id),
  constraint products_additional_items_parent_id_fk foreign KEY (_parent_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists products_additional_items_order_idx on public.products_additional_items using btree (_order) TABLESPACE pg_default;

create index IF not exists products_additional_items_parent_id_idx on public.products_additional_items using btree (_parent_id) TABLESPACE pg_default;