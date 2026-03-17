// Vedic Astrology calculation engine
// Uses astronomia for planetary positions, then applies Lahiri ayanamsa for sidereal zodiac

import * as astronomia from 'astronomia';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

export interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number; // sidereal longitude 0-360
  sign: ZodiacSign;
  signIndex: number; // 0-11
  degree: number; // degree within sign 0-30
  house: number; // 1-12
  isRetrograde?: boolean;
}

export interface KundliData {
  ascendantSign: ZodiacSign;
  ascendantIndex: number;
  ascendantDegree: number;
  planets: PlanetPosition[];
  houses: HouseData[];
}

export interface HouseData {
  houseNumber: number;
  sign: ZodiacSign;
  signIndex: number;
  planets: PlanetPosition[];
}

// Lahiri ayanamsa calculation (approximate)
function getLahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000
  // Lahiri ayanamsa formula
  const ayanamsa = 23.856111 + 0.0139722 * (jd - 2451545.0) / 365.25;
  return ayanamsa;
}

// Convert calendar date to Julian Day
function dateToJD(year: number, month: number, day: number, hour: number = 0, minute: number = 0): number {
  // Handle January/February
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = day + (hour + minute / 60) / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + B - 1524.5;
}

// Calculate sidereal longitude from tropical
function toSidereal(tropicalLongitude: number, ayanamsa: number): number {
  let sidereal = tropicalLongitude - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  if (sidereal >= 360) sidereal -= 360;
  return sidereal;
}

// Get zodiac sign from longitude
function getSignFromLongitude(longitude: number): { sign: ZodiacSign; signIndex: number; degree: number } {
  const signIndex = Math.floor(longitude / 30) % 12;
  const degree = longitude % 30;
  return { sign: ZODIAC_SIGNS[signIndex], signIndex, degree };
}

// Calculate ascendant (Lagna) - simplified calculation
function calculateAscendant(jd: number, latitude: number, longitude: number, ayanamsa: number): number {
  // Local Sidereal Time
  const T = (jd - 2451545.0) / 36525.0;
  // Greenwich Mean Sidereal Time in degrees
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  GMST = ((GMST % 360) + 360) % 360;
  
  // Local Sidereal Time
  const LST = ((GMST + longitude) % 360 + 360) % 360;
  const LSTrad = LST * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  
  // Obliquity of the ecliptic
  const obliquity = 23.4393 - 0.013 * T;
  const oblRad = obliquity * Math.PI / 180;
  
  // Ascendant calculation
  const ascRad = Math.atan2(
    Math.cos(LSTrad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(LSTrad))
  );
  
  let ascDeg = (ascRad * 180 / Math.PI + 360) % 360;
  
  // Convert to sidereal
  ascDeg = toSidereal(ascDeg, ayanamsa);
  
  return ascDeg;
}

// Simplified planetary longitude calculations using mean elements
// For a production app, use Swiss Ephemeris or similar
function calculatePlanetaryPositions(jd: number, ayanamsa: number): Omit<PlanetPosition, 'house'>[] {
  const T = (jd - 2451545.0) / 36525.0;
  const d = jd - 2451545.0;
  
  const planets: Omit<PlanetPosition, 'house'>[] = [];
  
  // Sun - mean longitude
  const sunL = (280.4664567 + 360.0076983 * T + 0.0003032 * T * T) % 360;
  const sunM = (357.5291092 + 35999.0502909 * T) % 360;
  const sunMrad = sunM * Math.PI / 180;
  const sunEq = sunL + 1.9146 * Math.sin(sunMrad) + 0.02 * Math.sin(2 * sunMrad);
  const sunSid = toSidereal(((sunEq % 360) + 360) % 360, ayanamsa);
  const sunSign = getSignFromLongitude(sunSid);
  planets.push({ name: 'Sun', symbol: '☉', longitude: sunSid, ...sunSign });
  
  // Moon
  const moonL0 = 218.3165 + 481267.8813 * T;
  const moonM = 134.963 + 477198.8676 * T;
  const moonD = 297.8502 + 445267.1115 * T;
  const moonF = 93.272 + 483202.0175 * T;
  const moonMrad2 = moonM * Math.PI / 180;
  const moonDrad = moonD * Math.PI / 180;
  const moonFrad = moonF * Math.PI / 180;
  const moonLon = moonL0 + 6.289 * Math.sin(moonMrad2) - 1.274 * Math.sin(2 * moonDrad - moonMrad2) 
    + 0.658 * Math.sin(2 * moonDrad) + 0.214 * Math.sin(2 * moonMrad2) - 0.186 * Math.sin(sunMrad);
  const moonSid = toSidereal(((moonLon % 360) + 360) % 360, ayanamsa);
  const moonSign = getSignFromLongitude(moonSid);
  planets.push({ name: 'Moon', symbol: '☽', longitude: moonSid, ...moonSign });
  
  // Mars
  const marsL = (355.433 + 191.4042 * d / 365.25) % 360;
  const marsM = (19.373 + 0.524071 * d) % 360;
  const marsMrad = marsM * Math.PI / 180;
  const marsLon = marsL + 10.691 * Math.sin(marsMrad) + 0.623 * Math.sin(2 * marsMrad);
  const marsSid = toSidereal(((marsLon % 360) + 360) % 360, ayanamsa);
  const marsSign = getSignFromLongitude(marsSid);
  planets.push({ name: 'Mars', symbol: '♂', longitude: marsSid, ...marsSign });
  
  // Mercury
  const mercL = (252.251 + 149472.6746 * T) % 360;
  const mercM = (174.795 + 4.09233 * d) % 360;
  const mercMrad = mercM * Math.PI / 180;
  const mercElong = mercL - sunL;
  const mercLon = sunEq + 22.46 * Math.sin(mercMrad) + 2.88 * Math.sin(2 * mercMrad);
  const mercSid = toSidereal(((mercLon % 360) + 360) % 360, ayanamsa);
  const mercSign = getSignFromLongitude(mercSid);
  planets.push({ name: 'Mercury', symbol: '☿', longitude: mercSid, ...mercSign });
  
  // Jupiter
  const jupL = (34.351 + 3034.9057 * T) % 360;
  const jupM = (20.020 + 0.083091 * d) % 360;
  const jupMrad = jupM * Math.PI / 180;
  const jupLon = jupL + 5.555 * Math.sin(jupMrad) + 0.168 * Math.sin(2 * jupMrad);
  const jupSid = toSidereal(((jupLon % 360) + 360) % 360, ayanamsa);
  const jupSign = getSignFromLongitude(jupSid);
  planets.push({ name: 'Jupiter', symbol: '♃', longitude: jupSid, ...jupSign });
  
  // Venus
  const venL = (181.979 + 58517.8157 * T) % 360;
  const venM = (50.416 + 1.602168 * d) % 360;
  const venMrad = venM * Math.PI / 180;
  const venLon = sunEq + 46.0 * Math.sin(venMrad) * 0.1 + 0.78 * Math.sin(2 * venMrad);
  const venSid = toSidereal(((venLon % 360) + 360) % 360, ayanamsa);
  const venSign = getSignFromLongitude(venSid);
  planets.push({ name: 'Venus', symbol: '♀', longitude: venSid, ...venSign });
  
  // Saturn
  const satL = (50.077 + 1222.1138 * T) % 360;
  const satM = (317.021 + 0.033371 * d) % 360;
  const satMrad = satM * Math.PI / 180;
  const satLon = satL + 6.406 * Math.sin(satMrad) + 0.418 * Math.sin(2 * satMrad);
  const satSid = toSidereal(((satLon % 360) + 360) % 360, ayanamsa);
  const satSign = getSignFromLongitude(satSid);
  planets.push({ name: 'Saturn', symbol: '♄', longitude: satSid, ...satSign });
  
  // Rahu (Mean North Node) - always retrograde
  const rahuLon = (125.0445 - 1934.1363 * T) % 360;
  const rahuSid = toSidereal(((rahuLon % 360) + 360) % 360, ayanamsa);
  const rahuSign = getSignFromLongitude(rahuSid);
  planets.push({ name: 'Rahu', symbol: '☊', longitude: rahuSid, ...rahuSign, isRetrograde: true });
  
  // Ketu (South Node) - opposite of Rahu
  const ketuSid = (rahuSid + 180) % 360;
  const ketuSign = getSignFromLongitude(ketuSid);
  planets.push({ name: 'Ketu', symbol: '☋', longitude: ketuSid, ...ketuSign, isRetrograde: true });
  
  return planets;
}

// CORE LOGIC: Assign planets to houses based on ascendant
// House 1 = Ascendant sign, House 2 = next sign, etc.
function assignHouses(ascendantIndex: number, planets: Omit<PlanetPosition, 'house'>[]): PlanetPosition[] {
  return planets.map(p => {
    // House = how many signs from ascendant + 1
    let house = ((p.signIndex - ascendantIndex + 12) % 12) + 1;
    return { ...p, house };
  });
}

// Build house data
function buildHouses(ascendantIndex: number, planets: PlanetPosition[]): HouseData[] {
  const houses: HouseData[] = [];
  for (let i = 0; i < 12; i++) {
    const signIndex = (ascendantIndex + i) % 12;
    const houseNumber = i + 1;
    houses.push({
      houseNumber,
      sign: ZODIAC_SIGNS[signIndex],
      signIndex,
      planets: planets.filter(p => p.house === houseNumber),
    });
  }
  return houses;
}

export interface BirthDetails {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number; // offset in hours from UTC
}

export function calculateKundli(birth: BirthDetails): KundliData {
  // Convert local time to UTC
  const utcHour = birth.hour - birth.timezone;
  const utcMinute = birth.minute;
  
  const jd = dateToJD(birth.year, birth.month, birth.day, utcHour, utcMinute);
  const ayanamsa = getLahiriAyanamsa(jd);
  
  // Calculate ascendant
  const ascLongitude = calculateAscendant(jd, birth.latitude, birth.longitude, ayanamsa);
  const ascSign = getSignFromLongitude(ascLongitude);
  
  // Calculate planets
  const rawPlanets = calculatePlanetaryPositions(jd, ayanamsa);
  
  // Assign houses: Ascendant sign = House 1
  const planets = assignHouses(ascSign.signIndex, rawPlanets);
  
  // Build house structure
  const houses = buildHouses(ascSign.signIndex, planets);
  
  return {
    ascendantSign: ascSign.sign,
    ascendantIndex: ascSign.signIndex,
    ascendantDegree: ascSign.degree,
    planets,
    houses,
  };
}
