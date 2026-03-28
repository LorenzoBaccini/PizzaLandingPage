-- Tabella slot disabilitati
-- Eseguire nell'SQL Editor di Supabase (Dashboard → SQL Editor → New query)

CREATE TABLE disabled_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, time_slot)
);

-- RLS: lettura pubblica, scrittura solo utenti autenticati
ALTER TABLE disabled_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chiunque può leggere"
  ON disabled_slots FOR SELECT
  USING (true);

CREATE POLICY "Solo admin può inserire"
  ON disabled_slots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo admin può eliminare"
  ON disabled_slots FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Tabella ordini
-- ============================================================

CREATE TABLE orders (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  items         JSONB       NOT NULL,
  is_delivery   BOOLEAN     NOT NULL DEFAULT false,
  phone         TEXT        NOT NULL,
  address       TEXT,
  civic_number  TEXT,
  intercom      TEXT,
  comune        TEXT,
  payment       TEXT,
  subtotal      NUMERIC(8,2) NOT NULL,
  delivery_fee  NUMERIC(8,2) NOT NULL DEFAULT 0,
  total         NUMERIC(8,2) NOT NULL,
  time_slot     TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'printed', 'done'))
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "auth_select_orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_update_orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');
