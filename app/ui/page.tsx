"use client";

import { useState } from "react";
import {
  GlassBackground,
  GlassCard,
  GlassButton,
  GlassChip,
  GlassInput,
  GlassTextarea,
  SectionHeader,
  Badge,
} from "@/components/glass";

export default function UIPage() {
  const [selectedChip, setSelectedChip] = useState<string>("italia");
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <GlassBackground>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Black Glass Design System
          </h1>
          <p className="text-[var(--text-secondary)]">
            Componenti UI riusabili in stile minimal elegante
          </p>
        </div>

        {/* Buttons Section */}
        <GlassCard className="mb-8">
          <SectionHeader
            title="Buttons"
            subtitle="Varianti e dimensioni disponibili"
          />
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                Varianti
              </h3>
              <div className="flex flex-wrap gap-3">
                <GlassButton variant="primary">Primary</GlassButton>
                <GlassButton variant="secondary">Secondary</GlassButton>
                <GlassButton variant="destructive">Destructive</GlassButton>
                <GlassButton variant="primary" disabled>
                  Disabled
                </GlassButton>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                Dimensioni
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <GlassButton size="sm">Small</GlassButton>
                <GlassButton size="md">Medium</GlassButton>
                <GlassButton size="lg">Large</GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Chips Section */}
        <GlassCard className="mb-8">
          <SectionHeader
            title="Chips"
            subtitle="Selezione multipla o singola"
          />
          <div className="flex flex-wrap gap-3">
            <GlassChip
              selected={selectedChip === "italia"}
              onClick={() => setSelectedChip("italia")}
            >
              Italia
            </GlassChip>
            <GlassChip
              selected={selectedChip === "francia"}
              onClick={() => setSelectedChip("francia")}
            >
              Francia
            </GlassChip>
            <GlassChip
              selected={selectedChip === "spagna"}
              onClick={() => setSelectedChip("spagna")}
            >
              Spagna
            </GlassChip>
            <GlassChip
              selected={selectedChip === "portogallo"}
              onClick={() => setSelectedChip("portogallo")}
            >
              Portogallo
            </GlassChip>
          </div>
        </GlassCard>

        {/* Form Inputs Section */}
        <GlassCard className="mb-8">
          <SectionHeader
            title="Form Inputs"
            subtitle="Campi di input e textarea"
          />
          <div className="space-y-6">
            <GlassInput
              label="Nome vino"
              placeholder="Inserisci il nome del vino"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <GlassInput
              label="Anno"
              type="number"
              placeholder="2020"
            />
            <GlassInput
              label="Input con errore"
              error="Questo campo è obbligatorio"
              placeholder="Campo con errore"
            />
            <GlassInput
              label="Input disabilitato"
              disabled
              placeholder="Non modificabile"
            />
            <GlassTextarea
              label="Note"
              placeholder="Aggiungi note sul vino..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
            <GlassTextarea
              label="Textarea con errore"
              error="Il testo è troppo lungo"
              placeholder="Campo con errore"
            />
          </div>
        </GlassCard>

        {/* Badges Section */}
        <GlassCard className="mb-8">
          <SectionHeader
            title="Badges"
            subtitle="Indicatori di stato e rating"
          />
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                Varianti
              </h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="readiness">Pronto</Badge>
                <Badge variant="readiness">Invecchiamento</Badge>
                <Badge variant="rating">4.5</Badge>
                <Badge variant="rating">92/100</Badge>
                <Badge variant="default">Default</Badge>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Cards Section */}
        <GlassCard className="mb-8">
          <SectionHeader
            title="Cards"
            subtitle="Contenitori con glassmorphism"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard variant="default">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Card Default
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Questa è una card con variante default. Ha un background
                glassmorphism leggero.
              </p>
            </GlassCard>
            <GlassCard variant="elevated">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Card Elevated
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Questa è una card con variante elevated. Ha un background
                glassmorphism più pronunciato.
              </p>
            </GlassCard>
          </div>
        </GlassCard>

        {/* Combined Example */}
        <GlassCard variant="elevated">
          <SectionHeader
            title="Esempio Combinato"
            subtitle="Utilizzo di più componenti insieme"
            action={
              <GlassButton size="sm" variant="primary">
                Azione
              </GlassButton>
            }
          />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="readiness">Pronto</Badge>
              <Badge variant="rating">⭐ 4.8</Badge>
            </div>
            <p className="text-[var(--text-secondary)]">
              Questo è un esempio di come i componenti possono essere combinati
              per creare interfacce complesse mantenendo la coerenza del design
              system.
            </p>
            <div className="flex gap-3 pt-2">
              <GlassButton variant="primary">Salva</GlassButton>
              <GlassButton variant="secondary">Annulla</GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </GlassBackground>
  );
}

