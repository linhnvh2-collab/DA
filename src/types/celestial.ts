export type CosmicScaleLevel = 
  | 'earth_moon'
  | 'solar_system'
  | 'stellar_neighborhood'
  | 'milky_way'
  | 'local_group'
  | 'observable_universe';

export type CelestialType = 
  | 'star'
  | 'planet'
  | 'dwarf_planet'
  | 'moon'
  | 'nebula'
  | 'galaxy'
  | 'black_hole'
  | 'cluster'
  | 'cosmic_structure';

export type InteractionMode = 
  | 'navigate'          // Standard exploration & camera
  | 'drag_body'         // Directly grab & move planets / celestial bodies
  | 'asteroid_cannon'   // Aim and shoot meteoroids/asteroids at planets
  | 'gravity_well';     // Visualize Einstein spacetime curvature & slingshots

export interface InternalLayer {
  name: string;
  nameVi: string;
  thicknessKm: number;
  description: string;
  color: string;
}

export interface CelestialBody {
  id: string;
  name: string;
  nameVi: string;
  type: CelestialType;
  typeLabelVi: string;
  scaleLevel: CosmicScaleLevel;
  parentBodyId?: string;
  
  // Real scientific metrics
  diameterKm: number;
  massKg: string; // Scientific notation string e.g. "5.972 × 10²⁴ kg"
  distanceFromParentKm?: number;
  distanceAU?: number;
  distanceLightYears?: number;
  surfaceTempC: string;
  orbitalPeriodDays?: number;
  rotationPeriodHours?: number;
  gravityMPerS2: number;
  moonsCount?: number;
  atmosphereSummaryVi: string;
  
  // 3D Visual parameters
  visualRadius: number; // In visualization units
  scientificRadius: number; // Scaled for scientific mode
  orbitRadiusVisual: number;
  orbitRadiusScientific: number;
  orbitInclinationDeg: number;
  orbitSpeed: number; // visual angular velocity
  rotationSpeed: number; // visual spin
  axialTiltDeg: number;
  colorHex: string;
  glowColorHex?: string;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  hasAtmosphereGlow?: boolean;
  hasClouds?: boolean;
  
  // Detailed overview & science
  descriptionVi: string;
  funFactsVi: string[];
  scientificHighlightsVi: string[];
  internalLayers?: InternalLayer[];
  moonsList?: Array<{ name: string; nameVi: string; diameterKm: number; discoveryYear?: string }>;
  
  // Camera focus offset
  camDistance: number;
}

export interface CollisionEvent {
  id: string;
  body1Name: string;
  body2Name: string;
  energyJoules: string;
  consequenceVi: string;
  timestamp: string;
}

export interface TourStep {
  stepNumber: number;
  titleVi: string;
  targetId: string;
  scaleLevel: CosmicScaleLevel;
  narrativeVi: string;
  scientificFactVi: string;
}

export interface QuizQuestion {
  id: number;
  questionVi: string;
  optionsVi: string[];
  correctIndex: number;
  explanationVi: string;
}

export type GraphicsQuality = 'low' | 'medium' | 'high';
export type ScaleMode = 'visual' | 'scientific';
