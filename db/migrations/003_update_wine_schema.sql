-- Migration: 003_update_wine_schema.sql
-- Description: Aggiorna schema wines con nuovi campi e struttura per uvaggi
-- Created: 2024

-- ============================================================================
-- ALTER TABLE wines: nuovi campi e modifiche
-- ============================================================================

-- Rinomina e aggiorna campi esistenti
-- Nota: Se i campi già esistono, alcune query potrebbero fallire, ma è ok con IF NOT EXISTS

-- Aggiorna wine_type: modifica valori possibili (ora required)
-- Se il campo esiste già, aggiungiamo constraint check
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'wine_type'
  ) THEN
    ALTER TABLE wines ADD COLUMN wine_type TEXT;
  END IF;
END $$;

-- Aggiungi constraint per wine_type (se non esiste già)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wines_wine_type_check'
  ) THEN
    ALTER TABLE wines 
    ADD CONSTRAINT wines_wine_type_check 
    CHECK (wine_type IS NULL OR wine_type IN ('red', 'white', 'rosé', 'orange', 'sparkling', 'champagne', 'liquor'));
  END IF;
END $$;

-- Country: ora required, aggiungi constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'country'
  ) THEN
    ALTER TABLE wines ADD COLUMN country TEXT;
  END IF;
END $$;

-- Modifica producer a NOT NULL se possibile (fai manualmente se ci sono dati esistenti)
-- ALTER TABLE wines ALTER COLUMN producer SET NOT NULL; -- Decommentare se sicuro

-- Aggiungi/modifica region (ora dinamica basata su country)
-- Region rimane TEXT (già presente)

-- Uvaggi: jsonb array [{ name: "Sangiovese", percent: 80 }, ...]
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'grapes'
  ) THEN
    ALTER TABLE wines ADD COLUMN grapes JSONB DEFAULT '[]'::jsonb;
  ELSE
    -- Se esiste già, assicurati che sia jsonb
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'wines' 
      AND column_name = 'grapes' 
      AND data_type != 'jsonb'
    ) THEN
      -- Converti a jsonb se non lo è già
      ALTER TABLE wines ALTER COLUMN grapes TYPE JSONB USING grapes::jsonb;
    END IF;
  END IF;
END $$;

-- Grado alcolico: abv (alcohol by volume)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'abv'
  ) THEN
    ALTER TABLE wines ADD COLUMN abv NUMERIC(4, 1) CHECK (abv >= 0 AND abv <= 20);
  END IF;
END $$;

-- Posizione: location (già esiste, ma assicuriamoci)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'location'
  ) THEN
    ALTER TABLE wines ADD COLUMN location TEXT;
  END IF;
END $$;

-- Label image path: cambia da label_image_url a label_image_path (o mantieni url)
-- Manteniamo label_image_url per compatibilità, aggiungiamo path se serve
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'label_image_path'
  ) THEN
    -- Se label_image_url esiste, copiamo i dati in label_image_path, poi possiamo deprecare url
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'wines' AND column_name = 'label_image_url'
    ) THEN
      ALTER TABLE wines ADD COLUMN label_image_path TEXT;
      -- Opzionale: copia da url a path se necessario
      -- UPDATE wines SET label_image_path = label_image_url WHERE label_image_url IS NOT NULL;
    ELSE
      ALTER TABLE wines ADD COLUMN label_image_path TEXT;
    END IF;
  END IF;
END $$;

-- Storia: story (nuovo campo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'story'
  ) THEN
    ALTER TABLE wines ADD COLUMN story TEXT;
  END IF;
END $$;

-- Notes: già esiste, assicuriamoci
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wines' AND column_name = 'notes'
  ) THEN
    ALTER TABLE wines ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Rinomina price se necessario (già esiste come DECIMAL)
-- Aggiungi constraint se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wines_price_check'
  ) THEN
    ALTER TABLE wines 
    ADD CONSTRAINT wines_price_check 
    CHECK (price IS NULL OR price >= 0);
  END IF;
END $$;

-- Quantità: assicura constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wines_quantity_check'
  ) THEN
    ALTER TABLE wines 
    ADD CONSTRAINT wines_quantity_check 
    CHECK (quantity >= 0);
  END IF;
END $$;

-- Vintage: constraint range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wines_vintage_check'
  ) THEN
    ALTER TABLE wines 
    ADD CONSTRAINT wines_vintage_check 
    CHECK (vintage IS NULL OR (vintage >= 1900 AND vintage <= EXTRACT(YEAR FROM NOW()) + 1));
  END IF;
END $$;

-- ============================================================================
-- INDEXES per performance
-- ============================================================================

-- Index su grapes per ricerca (jsonb GIN index)
CREATE INDEX IF NOT EXISTS idx_wines_grapes_gin ON wines USING GIN (grapes);

-- Index su country e type (per filtri comuni)
CREATE INDEX IF NOT EXISTS idx_wines_country_type ON wines(country, wine_type) 
WHERE country IS NOT NULL AND wine_type IS NOT NULL;

-- Index su region
CREATE INDEX IF NOT EXISTS idx_wines_region ON wines(region) 
WHERE region IS NOT NULL;

-- Index su producer (ora required)
CREATE INDEX IF NOT EXISTS idx_wines_producer ON wines(producer) 
WHERE producer IS NOT NULL;

