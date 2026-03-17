import React from 'react';
import { KundliData } from '@/lib/vedic-astrology';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  data: KundliData;
}

const PlanetTable: React.FC<Props> = ({ data }) => (
  <div className="w-full max-w-md overflow-auto">
    <Table>
      <TableHeader>
        <TableRow className="border-border">
          <TableHead className="text-cosmic-gold font-display text-xs">Planet</TableHead>
          <TableHead className="text-cosmic-gold font-display text-xs">Sign</TableHead>
          <TableHead className="text-cosmic-gold font-display text-xs">Degree</TableHead>
          <TableHead className="text-cosmic-gold font-display text-xs">House</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.planets.map((p) => (
          <TableRow key={p.name} className="border-border/50">
            <TableCell className="font-display text-sm">
              {p.symbol} {p.name} {p.isRetrograde && <span className="text-destructive text-xs">(R)</span>}
            </TableCell>
            <TableCell className="text-sm">{p.sign}</TableCell>
            <TableCell className="text-sm font-mono">{p.degree.toFixed(2)}°</TableCell>
            <TableCell className="text-sm font-mono">{p.house}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default PlanetTable;
