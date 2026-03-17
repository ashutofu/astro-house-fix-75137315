import React, { useState } from 'react';
import BirthDetailsForm, { BirthFormData } from '@/components/BirthDetailsForm';
import NorthIndianChart from '@/components/NorthIndianChart';
import PlanetTable from '@/components/PlanetTable';
import { calculateKundli, KundliData, ZODIAC_SIGNS } from '@/lib/vedic-astrology';

const Index = () => {
  const [kundli, setKundli] = useState<KundliData | null>(null);

  const handleGenerate = (birth: BirthFormData) => {
    const data = calculateKundli(birth);
    setKundli(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Starfield dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-cosmic-gold/30 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            <span className="text-cosmic-gold">✦</span> Vedic Kundli Chart
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-body">
            North Indian birth chart with sidereal zodiac (Lahiri ayanamsa)
          </p>
        </header>

        {/* Form */}
        <section className="flex justify-center mb-10 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <BirthDetailsForm onSubmit={handleGenerate} />
        </section>

        {/* Results */}
        {kundli && (
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Ascendant info */}
            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-body">Ascendant (Lagna)</span>
              <p className="text-xl font-display font-bold text-cosmic-gold mt-1">
                {kundli.ascendantSign} — {kundli.ascendantDegree.toFixed(2)}°
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Chart */}
              <div className="flex justify-center">
                <NorthIndianChart data={kundli} />
              </div>

              {/* Planet table */}
              <div className="flex justify-center">
                <PlanetTable data={kundli} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
