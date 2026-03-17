import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface BirthFormData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number;
}

interface Props {
  onSubmit: (data: BirthFormData) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BirthDetailsForm: React.FC<Props> = ({ onSubmit }) => {
  const [form, setForm] = useState<BirthFormData>({
    year: 1990, month: 1, day: 15,
    hour: 6, minute: 0,
    latitude: 28.6139, longitude: 77.2090, // Delhi
    timezone: 5.5, // IST
  });

  const update = (field: keyof BirthFormData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Year</Label>
          <Input type="number" value={form.year} onChange={e => update('year', e.target.value)} 
            className="bg-cosmic-surface border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Month</Label>
          <Select value={String(form.month)} onValueChange={v => update('month', parseInt(v))}>
            <SelectTrigger className="bg-cosmic-surface border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Day</Label>
          <Input type="number" min={1} max={31} value={form.day} onChange={e => update('day', e.target.value)}
            className="bg-cosmic-surface border-border" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Hour (24h)</Label>
          <Input type="number" min={0} max={23} value={form.hour} onChange={e => update('hour', e.target.value)}
            className="bg-cosmic-surface border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Minute</Label>
          <Input type="number" min={0} max={59} value={form.minute} onChange={e => update('minute', e.target.value)}
            className="bg-cosmic-surface border-border" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Latitude</Label>
          <Input type="number" step="0.0001" value={form.latitude} onChange={e => update('latitude', e.target.value)}
            className="bg-cosmic-surface border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Longitude</Label>
          <Input type="number" step="0.0001" value={form.longitude} onChange={e => update('longitude', e.target.value)}
            className="bg-cosmic-surface border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Timezone (±h)</Label>
          <Input type="number" step="0.5" value={form.timezone} onChange={e => update('timezone', e.target.value)}
            className="bg-cosmic-surface border-border" />
        </div>
      </div>

      <Button type="submit" className="w-full bg-cosmic-gold text-background hover:bg-cosmic-gold/90 font-display">
        Generate Kundli
      </Button>
    </form>
  );
};

export default BirthDetailsForm;
