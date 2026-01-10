-- Migration: 004_labels_storage.sql
-- Description: Crea bucket Storage per etichette e configura policies RLS

-- Crea il bucket "labels" se non esiste
-- Il bucket è pubblico per permettere l'accesso diretto alle immagini via Next.js Image
-- Le policies RLS garantiscono che solo l'utente proprietario possa modificare/eliminare
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'labels',
  'labels',
  true, -- Public bucket (permette accesso diretto alle immagini)
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Rimuovi le policies esistenti se ci sono (per evitare duplicati)
DROP POLICY IF EXISTS "Users can view their own wine labels" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own wine labels" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own wine labels" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own wine labels" ON storage.objects;

-- Policy per SELECT (lettura) - gli utenti possono vedere solo le proprie etichette
-- Il path del file è nel formato: {user_id}/{wine_id}/{timestamp}.{ext}
-- Verifichiamo che il primo elemento del path sia l'user_id dell'utente autenticato
CREATE POLICY "Users can view their own wine labels"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'labels' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy per INSERT (upload) - gli utenti possono caricare solo nelle proprie cartelle
-- Verifichiamo solo che l'user_id nel path corrisponda all'utente autenticato
-- La verifica che il wine appartenga all'utente viene fatta lato applicazione
CREATE POLICY "Users can upload their own wine labels"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'labels' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy per UPDATE - gli utenti possono aggiornare solo le proprie etichette
CREATE POLICY "Users can update their own wine labels"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'labels' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'labels' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy per DELETE - gli utenti possono eliminare solo le proprie etichette
CREATE POLICY "Users can delete their own wine labels"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'labels' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);
