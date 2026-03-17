import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  currentPlace: string;
  onSelect: (lat: number, lng: number, timezone: number, name: string) => void;
}

// Estimate timezone from longitude (rough but works without external API)
function estimateTimezone(lng: number): number {
  return Math.round((lng / 15) * 2) / 2;
}

const PlaceSearch: React.FC<Props> = ({ currentPlace, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setResults(
        data.map((r: any) => ({
          name: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search();
    }
  };

  const handleSelect = (place: PlaceResult) => {
    const tz = estimateTimezone(place.lng);
    onSelect(place.lat, place.lng, tz, place.name.split(',').slice(0, 2).join(','));
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 bg-cosmic-surface border-border text-foreground font-body text-sm h-10"
        >
          <MapPin className="h-3.5 w-3.5 text-cosmic-gold shrink-0" />
          <span className="truncate">{currentPlace || 'Search place...'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-cosmic-gold">Search Birth Place</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Mumbai, Delhi, London..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-cosmic-surface border-border"
            autoFocus
          />
          <Button type="button" size="icon" onClick={search} disabled={loading}
            className="bg-cosmic-gold text-background hover:bg-cosmic-gold/90 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-1 mt-2">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2 rounded text-sm hover:bg-cosmic-surface transition-colors text-foreground"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cosmic-gold shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{r.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground ml-5">
                  {r.lat.toFixed(4)}°, {r.lng.toFixed(4)}°
                </span>
              </button>
            ))}
          </div>
        )}
        {!loading && results.length === 0 && query && (
          <p className="text-xs text-muted-foreground text-center py-4">Press Enter or click search</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlaceSearch;
