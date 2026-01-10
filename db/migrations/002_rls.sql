-- Migration: 002_rls.sql
-- Description: Abilita Row Level Security (RLS) e crea policies per tutte le tabelle
-- Created: 2024

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: wines
-- ============================================================================

-- Policy: SELECT - Utenti possono vedere solo i propri vini
CREATE POLICY "Users can view their own wines"
  ON wines
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: INSERT - Utenti possono inserire solo vini con il proprio user_id
CREATE POLICY "Users can insert their own wines"
  ON wines
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE - Utenti possono aggiornare solo i propri vini
CREATE POLICY "Users can update their own wines"
  ON wines
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE - Utenti possono eliminare solo i propri vini
CREATE POLICY "Users can delete their own wines"
  ON wines
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- POLICIES: tastings
-- ============================================================================

-- Policy: SELECT - Utenti possono vedere solo le proprie degustazioni
CREATE POLICY "Users can view their own tastings"
  ON tastings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: INSERT - Utenti possono inserire solo degustazioni con il proprio user_id
CREATE POLICY "Users can insert their own tastings"
  ON tastings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE - Utenti possono aggiornare solo le proprie degustazioni
CREATE POLICY "Users can update their own tastings"
  ON tastings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE - Utenti possono eliminare solo le proprie degustazioni
CREATE POLICY "Users can delete their own tastings"
  ON tastings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- POLICIES: movements
-- ============================================================================

-- Policy: SELECT - Utenti possono vedere solo i propri movimenti
CREATE POLICY "Users can view their own movements"
  ON movements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: INSERT - Utenti possono inserire solo movimenti con il proprio user_id
CREATE POLICY "Users can insert their own movements"
  ON movements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE - Utenti possono aggiornare solo i propri movimenti
CREATE POLICY "Users can update their own movements"
  ON movements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE - Utenti possono eliminare solo i propri movimenti
CREATE POLICY "Users can delete their own movements"
  ON movements
  FOR DELETE
  USING (auth.uid() = user_id);

