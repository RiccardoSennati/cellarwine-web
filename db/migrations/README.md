# Migrations SQL per CellarWine Web

## Ordine di esecuzione

Esegui le migrations nell'ordine seguente:

1. **001_init.sql** - Crea le tabelle base (`wines`, `tastings`, `movements`)
2. **002_rls.sql** - Abilita Row Level Security e crea le policies
3. **003_update_wine_schema.sql** - Aggiorna lo schema `wines` con nuovi campi (grapes jsonb, country, region, abv, story, notes, label_image_path)
4. **004_labels_storage.sql** - Crea bucket Storage "labels" e configura policies RLS automaticamente

## Come applicare

### Via Supabase Dashboard (consigliato)
1. Vai su Supabase Dashboard > SQL Editor
2. Copia e incolla il contenuto di ogni file nell'ordine indicato
3. Esegui ogni query

### Via Supabase CLI
```bash
supabase db push
```

## Note importanti

- **003_update_wine_schema.sql**: Usa `DO $$ BEGIN ... END $$` per gestire colonne esistenti in modo sicuro
- **grapes**: Ora è JSONB array `[{ name: "Sangiovese", percent: 80 }, ...]` oppure `[{ name: "Merlot" }]` se senza percentuali
- **country**: Ora è required con constraint enum
- **wine_type**: Aggiornato con nuovi valori (orange, champagne, liquor)
- **Storage**: La migration `004_labels_storage.sql` crea automaticamente il bucket "labels" e le policies RLS. Il path dei file è nel formato `{user_id}/{wine_id}/{timestamp}.{ext}` per garantire l'isolamento tra utenti.

## Verifica

Dopo aver applicato le migrations, verifica che:
- Le colonne esistano nella tabella `wines`
- Le constraints siano attive
- Le policies RLS permettano SELECT/INSERT/UPDATE/DELETE solo per `user_id = auth.uid()`
- Il bucket Storage "labels" esista (se applicato)
