-- Migration: 001_init.sql
-- Description: Crea le tabelle wines, tastings, movements con indici e foreign keys
-- Created: 2024

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: wines
-- Description: Tabella principale per i vini/bottiglie nella cantina
-- ============================================================================
CREATE TABLE IF NOT EXISTS wines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informazioni base
  name TEXT NOT NULL,
  producer TEXT,
  vintage INTEGER,
  wine_type TEXT, -- 'red', 'white', 'rosé', 'sparkling', 'dessert', 'fortified'
  
  -- Origine
  region TEXT,
  country TEXT,
  appellation TEXT, -- DOC, DOCG, IGT, etc.
  
  -- Quantità e prezzo
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  
  -- Conservazione
  location TEXT, -- Posizione fisica nella cantina
  cellar_location TEXT, -- Sezione/cantina specifica
  
  -- Stato e qualità
  readiness_status TEXT, -- 'ready', 'aging', 'peak', 'past_peak'
  drink_from INTEGER, -- Anno da cui è consigliabile bere
  drink_until INTEGER, -- Anno entro cui consumare
  
  -- Note e metadati
  notes TEXT,
  label_image_url TEXT, -- URL immagine etichetta
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: tastings
-- Description: Registro delle degustazioni dei vini
-- ============================================================================
CREATE TABLE IF NOT EXISTS tastings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  
  -- Data e contesto
  tasting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  occasion TEXT, -- 'dinner', 'tasting', 'casual', etc.
  location TEXT, -- Dove è avvenuta la degustazione
  
  -- Valutazione
  rating DECIMAL(3, 1) CHECK (rating >= 0 AND rating <= 100), -- 0-100 scale
  overall_notes TEXT,
  
  -- Aspetto visivo
  color TEXT, -- 'ruby', 'garnet', 'golden', etc.
  intensity TEXT, -- 'pale', 'medium', 'deep'
  appearance_notes TEXT,
  
  -- Profumi (multi-select come text array)
  aromatic_families TEXT[], -- ['fruity', 'floral', 'spicy', 'earthy', 'woody', etc.]
  aroma_notes TEXT,
  aroma_intensity TEXT, -- 'light', 'medium', 'pronounced'
  
  -- Gusto
  textures TEXT[], -- ['smooth', 'tannic', 'creamy', 'crisp', 'velvety', etc.]
  sweetness TEXT, -- 'dry', 'off-dry', 'sweet'
  acidity TEXT, -- 'low', 'medium', 'high'
  tannins TEXT, -- 'low', 'medium', 'high', 'firm'
  body TEXT, -- 'light', 'medium', 'full'
  finish TEXT, -- 'short', 'medium', 'long'
  taste_notes TEXT,
  
  -- Difetti (multi-select)
  faults TEXT[], -- ['corked', 'oxidized', 'reduced', 'volatile', etc.]
  
  -- Metadati
  serving_temperature TEXT,
  decanting_time INTEGER, -- minuti di decantazione
  food_pairing TEXT[], -- Cibi abbinati
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: movements
-- Description: Movimenti di bottiglie (entrate, uscite, trasferimenti)
-- ============================================================================
CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  
  -- Tipo di movimento
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'consumed', 'gift', 'sold')),
  
  -- Quantità
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- Posizioni
  from_location TEXT, -- Posizione di origine (per transfer/out)
  to_location TEXT, -- Posizione di destinazione (per transfer/in)
  
  -- Dettagli
  price DECIMAL(10, 2), -- Prezzo per movimento (se diverso dal prezzo del vino)
  currency TEXT DEFAULT 'EUR',
  source TEXT, -- Provenienza (negozio, produttore, etc.)
  destination TEXT, -- Destinazione (amico, ristorante, etc.)
  
  -- Note
  notes TEXT,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes per wines
CREATE INDEX IF NOT EXISTS idx_wines_user_id ON wines(user_id);
CREATE INDEX IF NOT EXISTS idx_wines_user_id_created_at ON wines(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wines_user_id_readiness ON wines(user_id, readiness_status);
CREATE INDEX IF NOT EXISTS idx_wines_producer ON wines(producer) WHERE producer IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wines_vintage ON wines(vintage) WHERE vintage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wines_wine_type ON wines(wine_type) WHERE wine_type IS NOT NULL;

-- Indexes per tastings
CREATE INDEX IF NOT EXISTS idx_tastings_user_id ON tastings(user_id);
CREATE INDEX IF NOT EXISTS idx_tastings_wine_id ON tastings(wine_id);
CREATE INDEX IF NOT EXISTS idx_tastings_user_id_tasting_date ON tastings(user_id, tasting_date DESC);
CREATE INDEX IF NOT EXISTS idx_tastings_user_id_rating ON tastings(user_id, rating DESC) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tastings_wine_id_tasting_date ON tastings(wine_id, tasting_date DESC);

-- Indexes per movements
CREATE INDEX IF NOT EXISTS idx_movements_user_id ON movements(user_id);
CREATE INDEX IF NOT EXISTS idx_movements_wine_id ON movements(wine_id);
CREATE INDEX IF NOT EXISTS idx_movements_user_id_movement_date ON movements(user_id, movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_movements_user_id_type ON movements(user_id, movement_type);
CREATE INDEX IF NOT EXISTS idx_movements_wine_id_movement_date ON movements(wine_id, movement_date DESC);

-- ============================================================================
-- TRIGGERS per updated_at
-- ============================================================================

-- Function per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers per wines
CREATE TRIGGER update_wines_updated_at
  BEFORE UPDATE ON wines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers per tastings
CREATE TRIGGER update_tastings_updated_at
  BEFORE UPDATE ON tastings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers per movements
CREATE TRIGGER update_movements_updated_at
  BEFORE UPDATE ON movements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

