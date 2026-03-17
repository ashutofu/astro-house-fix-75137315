import React from 'react';
import { KundliData, ZODIAC_SYMBOLS, ZODIAC_SIGNS } from '@/lib/vedic-astrology';

interface Props {
  data: KundliData;
}

// North Indian chart: fixed house positions in diamond layout
// House positions in the diamond (clock-wise from top):
//   Top center = House 1 (Ascendant)
// The layout is a 4x4 grid of triangular cells forming a diamond

const HOUSE_POSITIONS: Record<number, { row: number; col: number; className: string }> = {
  1:  { row: 0, col: 1, className: 'col-span-2 row-span-1' },
  2:  { row: 0, col: 0, className: '' },
  3:  { row: 1, col: 0, className: '' },
  4:  { row: 2, col: 0, className: 'col-span-2' },
  5:  { row: 2, col: 0, className: '' },
  6:  { row: 1, col: 0, className: '' },
  7:  { row: 2, col: 1, className: 'col-span-2' },
  8:  { row: 2, col: 3, className: '' },
  9:  { row: 1, col: 3, className: '' },
  10: { row: 0, col: 2, className: 'col-span-2' },
  11: { row: 0, col: 3, className: '' },
  12: { row: 1, col: 3, className: '' },
};

const NorthIndianChart: React.FC<Props> = ({ data }) => {
  const { houses, ascendantIndex } = data;

  // Render planets in a house cell
  const renderHousePlanets = (houseNum: number) => {
    const house = houses[houseNum - 1];
    if (!house) return null;
    
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 p-1">
        <span className="text-[10px] text-muted-foreground font-body opacity-70">
          {ZODIAC_SYMBOLS[house.signIndex]} {ZODIAC_SIGNS[house.signIndex].slice(0, 3)}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-1">
          {house.planets.map((p) => (
            <span
              key={p.name}
              className="text-xs font-display font-semibold text-cosmic-gold"
              title={`${p.name} ${p.degree.toFixed(1)}° ${p.sign}${p.isRetrograde ? ' (R)' : ''}`}
            >
              {p.symbol}
              {p.isRetrograde && <span className="text-[8px] text-destructive align-super">R</span>}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // North Indian chart is a diamond inside a square
  // The standard layout uses a 4×4 grid with specific cells merged
  // We'll use SVG-like approach with absolute positioning inside a square

  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto">
      {/* Outer border */}
      <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Outer square */}
        <rect x="2" y="2" width="396" height="396" fill="none" 
          stroke="hsl(var(--cosmic-gold))" strokeWidth="2" rx="4" />
        
        {/* Inner diamond */}
        <polygon points="200,2 398,200 200,398 2,200" 
          fill="none" stroke="hsl(var(--cosmic-gold))" strokeWidth="1.5" />
        
        {/* Vertical & horizontal center lines */}
        <line x1="200" y1="2" x2="200" y2="398" stroke="hsl(var(--border))" strokeWidth="0.5" />
        <line x1="2" y1="200" x2="398" y2="200" stroke="hsl(var(--border))" strokeWidth="0.5" />
        
        {/* Cross diagonals for corner houses */}
        {/* Top-left corner */}
        <line x1="2" y1="2" x2="200" y2="200" stroke="hsl(var(--border))" strokeWidth="0.5" />
        {/* Top-right corner */}
        <line x1="398" y1="2" x2="200" y2="200" stroke="hsl(var(--border))" strokeWidth="0.5" />
        {/* Bottom-left corner */}
        <line x1="2" y1="398" x2="200" y2="200" stroke="hsl(var(--border))" strokeWidth="0.5" />
        {/* Bottom-right corner */}
        <line x1="398" y1="398" x2="200" y2="200" stroke="hsl(var(--border))" strokeWidth="0.5" />
      </svg>

      {/* House overlays with planet data */}
      {/* House 1 - Top center diamond */}
      <HouseCell x={25} y={5} w={50} h={45} houseNum={1} isAscendant>
        {renderHousePlanets(1)}
      </HouseCell>
      
      {/* House 2 - Top-left triangle (upper) */}
      <HouseCell x={2} y={2} w={25} h={25} houseNum={2}>
        {renderHousePlanets(2)}
      </HouseCell>
      
      {/* House 3 - Left-top triangle */}
      <HouseCell x={2} y={26} w={25} h={25} houseNum={3}>
        {renderHousePlanets(3)}
      </HouseCell>
      
      {/* House 4 - Left center diamond */}
      <HouseCell x={2} y={28} w={50} h={45} houseNum={4}>
        {renderHousePlanets(4)}
      </HouseCell>
      
      {/* House 5 - Bottom-left triangle (lower) */}
      <HouseCell x={2} y={52} w={25} h={25} houseNum={5}>
        {renderHousePlanets(5)}
      </HouseCell>
      
      {/* House 6 - Bottom-left triangle (right) */}
      <HouseCell x={25} y={52} w={25} h={25} houseNum={6}>
        {renderHousePlanets(6)}
      </HouseCell>
      
      {/* House 7 - Bottom center diamond */}
      <HouseCell x={25} y={50} w={50} h={45} houseNum={7}>
        {renderHousePlanets(7)}
      </HouseCell>
      
      {/* House 8 - Bottom-right triangle */}
      <HouseCell x={52} y={52} w={25} h={25} houseNum={8}>
        {renderHousePlanets(8)}
      </HouseCell>
      
      {/* House 9 - Right-bottom triangle */}
      <HouseCell x={52} y={26} w={25} h={25} houseNum={9}>
        {renderHousePlanets(9)}
      </HouseCell>
      
      {/* House 10 - Right center diamond */}
      <HouseCell x={50} y={28} w={50} h={45} houseNum={10}>
        {renderHousePlanets(10)}
      </HouseCell>
      
      {/* House 11 - Top-right triangle (upper) */}
      <HouseCell x={52} y={2} w={25} h={25} houseNum={11}>
        {renderHousePlanets(11)}
      </HouseCell>
      
      {/* House 12 - Top-left-right triangle */}
      <HouseCell x={25} y={2} w={25} h={25} houseNum={12}>
        {renderHousePlanets(12)}
      </HouseCell>
    </div>
  );
};

interface HouseCellProps {
  x: number; y: number; w: number; h: number;
  houseNum: number;
  isAscendant?: boolean;
  children: React.ReactNode;
}

const HouseCell: React.FC<HouseCellProps> = ({ x, y, w, h, houseNum, isAscendant, children }) => (
  <div
    className="absolute flex flex-col items-center justify-center overflow-hidden"
    style={{
      left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`,
    }}
  >
    <span className={`text-[9px] font-body ${isAscendant ? 'text-cosmic-gold font-bold' : 'text-muted-foreground opacity-50'}`}>
      {isAscendant ? 'Asc' : houseNum}
    </span>
    {children}
  </div>
);

export default NorthIndianChart;
