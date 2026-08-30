export type Spot = {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  physicalSize: string;
  /** Short, surface-specific guidance shown while a placement is inspected. */
  description?: string;
  /** Material the sticker is expected to attach to. */
  surface?: string;
  /** Matches a placement to the perspective of the photographed object. */
  rotation?: number;
};

export type Listing = {
  slug: string;
  title: string;
  city: string;
  country: string;
  category: "Laptop" | "PC" | "Car" | "Toolbox" | "Skateboard" | "Helmet";
  visual: "laptop" | "pc" | "car" | "toolbox" | "skateboard" | "helmet";
  totalSpots: number;
  visibility: "High" | "Medium";
  use: string;
  spots: Spot[];
  local?: boolean;
  photoMediaId?: string;
  startingPrice?: number;
  bookingDuration?: string;
};

const laptopSpots: Spot[] = [
  { id: "A", name: "Upper-left lid", x: .28, y: .29, width: .17, height: .15, physicalSize: '3 × 2"', surface: "Smooth aluminum lid", description: "A flat lid area clear of the hinge, edge radius, and display hardware.", rotation: 1 },
  { id: "B", name: "Upper-right lid", x: .59, y: .30, width: .17, height: .14, physicalSize: '3 × 2"', surface: "Smooth aluminum lid", description: "A compact landscape placement on the upper half of the closed display lid.", rotation: 1 },
  { id: "C", name: "Center lid", x: .44, y: .47, width: .19, height: .17, physicalSize: '4 × 3"', surface: "Smooth aluminum lid", description: "The largest uninterrupted central panel, suited to a primary brand mark.", rotation: 1 },
  { id: "D", name: "Lower lid strip", x: .38, y: .67, width: .25, height: .10, physicalSize: '6 × 1.5"', surface: "Smooth aluminum lid", description: "A wide low-profile strip above the hinge with safe edge clearance.", rotation: 1 },
  { id: "E", name: "Lower-right lid", x: .69, y: .57, width: .12, height: .12, physicalSize: '2 × 2"', surface: "Smooth aluminum lid", description: "A small square decal area positioned away from the curved lid edge.", rotation: 1 },
  { id: "F", name: "Lower-left lid", x: .31, y: .55, width: .12, height: .12, physicalSize: '2 × 2"', surface: "Smooth aluminum lid", description: "A small square decal area kept fully inside the visible lid panel.", rotation: 1 },
];

const pcSpots: Spot[] = [
  { id: "A", name: "Upper-left side glass", x: .27, y: .28, width: .14, height: .15, physicalSize: '3 × 3"', surface: "Tempered-glass side panel", description: "Removable vinyl applied to the outside of the flat glass window.", rotation: -1 },
  { id: "B", name: "Upper-right side glass", x: .48, y: .29, width: .14, height: .13, physicalSize: '3 × 2"', surface: "Tempered-glass side panel", description: "A landscape glass placement that stays inside the case frame.", rotation: -1 },
  { id: "C", name: "Center side glass", x: .39, y: .46, width: .16, height: .14, physicalSize: '3 × 3"', surface: "Tempered-glass side panel", description: "A central removable decal on the flat viewing window.", rotation: -1 },
  { id: "D", name: "Lower side-glass strip", x: .29, y: .64, width: .28, height: .09, physicalSize: '5 × 1.5"', surface: "Tempered-glass side panel", description: "A wide strip above the case feet, clear of seams and ventilation.", rotation: -1 },
];

const carSpots: Spot[] = [
  { id: "A", name: "Front door panel", x: .23, y: .56, width: .17, height: .12, physicalSize: '14 × 8"', surface: "Painted exterior door", description: "Low-tack automotive vinyl on the flat painted section below the window line.", rotation: 1 },
  { id: "B", name: "Rear door panel", x: .41, y: .55, width: .15, height: .12, physicalSize: '12 × 8"', surface: "Painted exterior door", description: "A removable door decal kept clear of the handle, glass, and panel gaps.", rotation: 1 },
  { id: "C", name: "Lower rear quarter", x: .69, y: .53, width: .11, height: .07, physicalSize: '7 × 4"', surface: "Painted rear quarter", description: "A compact automotive-vinyl zone below the tail lamp, clear of the wheel arch and panel gaps.", rotation: 1 },
  { id: "D", name: "Rear bumper band", x: .82, y: .62, width: .12, height: .07, physicalSize: '10 × 3"', surface: "Smooth painted bumper", description: "A narrow removable-vinyl band clear of lights, exhaust, sensors, and plate areas.", rotation: -1 },
];

const toolboxSpots: Spot[] = [
  { id: "A", name: "Upper-left case panel", x: .20, y: .40, width: .17, height: .12, physicalSize: '4 × 3"', surface: "Flat hard-case shell", description: "A flat recessed panel that avoids the handle, ribs, latches, and hinges." },
  { id: "B", name: "Upper-right case panel", x: .40, y: .40, width: .15, height: .12, physicalSize: '4 × 3"', surface: "Flat hard-case shell", description: "A compact hard-shell placement inside the molded reinforcement ribs." },
  { id: "C", name: "Lower-left case panel", x: .20, y: .56, width: .17, height: .12, physicalSize: '4 × 3"', surface: "Flat hard-case shell", description: "A lower face panel with clearance from the raised outer frame." },
  { id: "D", name: "Lower-right case panel", x: .40, y: .56, width: .15, height: .12, physicalSize: '4 × 3"', surface: "Flat hard-case shell", description: "A lower-right panel reserved for durable removable vinyl." },
];

const skateboardSpots: Spot[] = [
  { id: "A", name: "Underside nose", x: .78, y: .27, width: .12, height: .08, physicalSize: '3 × 2"', surface: "Smooth deck underside", description: "A small decal on the smooth underside; the textured grip deck is intentionally excluded.", rotation: -25 },
  { id: "B", name: "Underside center", x: .48, y: .46, width: .13, height: .08, physicalSize: '3 × 2"', surface: "Smooth deck underside", description: "A central underside placement clear of the truck, wheels, and deck edges.", rotation: -25 },
  { id: "C", name: "Underside tail", x: .23, y: .70, width: .12, height: .08, physicalSize: '3 × 2"', surface: "Smooth deck underside", description: "A tail-side decal with enough clearance for wear and wheel movement.", rotation: -25 },
];

const helmetSpots: Spot[] = [
  { id: "A", name: "Upper rear shell", x: .58, y: .22, width: .13, height: .07, physicalSize: '3 × 1.5"', surface: "Smooth helmet shell", description: "Flexible helmet-safe vinyl on the upper dome, above the visor hardware and away from crown vents.", rotation: 7 },
  { id: "B", name: "Rear side shell", x: .68, y: .39, width: .11, height: .09, physicalSize: '2.5 × 2"', surface: "Smooth helmet shell", description: "A compact flexible decal behind the visor hardware and clear of shell seams.", rotation: -6 },
  { id: "C", name: "Lower rear shell", x: .65, y: .54, width: .12, height: .08, physicalSize: '3 × 1.5"', surface: "Smooth helmet shell", description: "A low rear-side placement that avoids vents and the helmet base trim.", rotation: -6 },
  { id: "D", name: "Chin-bar side", x: .34, y: .63, width: .11, height: .07, physicalSize: '2.5 × 1.5"', surface: "Smooth chin-bar shell", description: "A small flexible decal kept away from the visor opening and air intake.", rotation: -7 },
];

export const listings: Listing[] = [
  { slug: "macbook-pro-m2-montreal", title: "Silver Laptop", city: "Montreal", country: "CA", category: "Laptop", visual: "laptop", totalSpots: laptopSpots.length, visibility: "High", use: "Work, school, cafés", spots: laptopSpots },
  { slug: "custom-gaming-pc-toronto", title: "Custom Gaming PC", city: "Toronto", country: "CA", category: "PC", visual: "pc", totalSpots: pcSpots.length, visibility: "High", use: "Gaming events, streams", spots: pcSpots },
  { slug: "bmw-330i-montreal", title: "Graphite Sedan", city: "Montreal", country: "CA", category: "Car", visual: "car", totalSpots: carSpots.length, visibility: "High", use: "City driving, commuting", spots: carSpots },
  { slug: "pro-toolbox-calgary", title: "Pro Toolbox", city: "Calgary", country: "CA", category: "Toolbox", visual: "toolbox", totalSpots: toolboxSpots.length, visibility: "Medium", use: "Job sites, workshops", spots: toolboxSpots },
  { slug: "street-deck-montreal", title: "Street Skateboard", city: "Montreal", country: "CA", category: "Skateboard", visual: "skateboard", totalSpots: skateboardSpots.length, visibility: "Medium", use: "Campus, skate parks", spots: skateboardSpots },
  { slug: "rider-helmet-ottawa", title: "Rider Helmet", city: "Ottawa", country: "CA", category: "Helmet", visual: "helmet", totalSpots: helmetSpots.length, visibility: "High", use: "Daily rides, meetups", spots: helmetSpots },
];

export type Broker = {
  token: string;
  name: string;
  image: string;
  rarity: "Commun" | "Semi-Rare" | "Rare" | "Ultra-Rare" | "Legendary";
  character: string;
  status: "Available" | "Staked";
};

export const brokers: Broker[] = [
  { token: "0001", name: "Broker #0001", image: "/isekai/0001.png", rarity: "Commun", character: "Auburn Waves Broker", status: "Available" },
  { token: "0002", name: "Broker #0002", image: "/isekai/0002.png", rarity: "Commun", character: "Frog Broker", status: "Available" },
  { token: "0003", name: "Broker #0003", image: "/isekai/0003.png", rarity: "Commun", character: "Hijab Broker", status: "Available" },
  { token: "0010", name: "Broker #0010", image: "/isekai/0010.png", rarity: "Commun", character: "Bunny Broker", status: "Available" },
  { token: "0016", name: "Broker #0016", image: "/isekai/0016.png", rarity: "Semi-Rare", character: "Origami Broker", status: "Available" },
  { token: "0028", name: "Broker #0028", image: "/isekai/0028.png", rarity: "Semi-Rare", character: "Gorilla Broker", status: "Available" },
  { token: "0034", name: "Broker #0034", image: "/isekai/0034.png", rarity: "Rare", character: "Moon-Elf Broker", status: "Staked" },
  { token: "0040", name: "Broker #0040", image: "/isekai/0040.png", rarity: "Legendary", character: "Rosegold Chevalier", status: "Available" },
  { token: "0243", name: "Broker #0243", image: "/isekai/0243.png", rarity: "Ultra-Rare", character: "Plasma Android", status: "Available" },
  { token: "0339", name: "Broker #0339", image: "/isekai/0339.png", rarity: "Rare", character: "Crystal Golem", status: "Available" },
  { token: "0524", name: "Broker #0524", image: "/isekai/0524.png", rarity: "Ultra-Rare", character: "Hydrothermal Shark", status: "Available" },
  { token: "2033", name: "Broker #2033", image: "/isekai/2033.png", rarity: "Legendary", character: "Copper Dragon Knight", status: "Available" },
];
