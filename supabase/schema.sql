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
