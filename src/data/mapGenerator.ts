// Map generator for Gurk III style RPG world

export const TILE_IDS = {
  GRASS: 0,
  FOREST: 1,
  DENSE_FOREST: 2,
  MOUNTAIN: 3,
  SHALLOW_WATER: 4,
  DEEP_WATER: 5,
  ROAD: 6,
  BRIDGE: 7,
  SAND: 8,
  CAVE_ENTRANCE: 9,
  CAVE_FLOOR: 10,
  CAVE_WALL: 11,
  CAVE_CRYSTAL: 12,
  CAVE_EXIT: 13,
  CASTLE_FLOOR: 14,
  CASTLE_WALL: 15,
  CASTLE_CARPET: 16,
  CASTLE_GATE: 17,
  VOID_WALL: 18,
  VOID_FLOOR: 19
} as const;

export function isTileWalkable(tileId: number, canSailWater = true): boolean {
  // Solid tiles that block player movement
  if (tileId === TILE_IDS.DENSE_FOREST) return false;
  if (tileId === TILE_IDS.MOUNTAIN) return false;
  if (tileId === TILE_IDS.DEEP_WATER && !canSailWater) return false;
  if (tileId === TILE_IDS.CAVE_WALL) return false;
  if (tileId === TILE_IDS.CASTLE_WALL) return false;
  if (tileId === TILE_IDS.VOID_WALL) return false;
  return true;
}

// Generate the Gigantic Overworld (90 x 75 tiles)
export function generateOverworldMap(width = 90, height = 75): number[][] {
  const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(TILE_IDS.GRASS));

  // 1. Boundary mountains / ocean
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        grid[y][x] = TILE_IDS.MOUNTAIN;
      }
    }
  }

  // 2. Mountain Ranges
  // Western Great Range (x ~ 10..18, y ~ 12..50)
  for (let y = 10; y < 55; y++) {
    for (let x = 8; x <= 18; x++) {
      // Natural jaggedness
      const noise = Math.sin(y * 0.4) * 2;
      if (x < 14 + noise) {
        grid[y][x] = TILE_IDS.MOUNTAIN;
      }
    }
  }

  // Northern Alpine Barrier (y ~ 1..10, x ~ 20..80)
  for (let y = 1; y < 11; y++) {
    for (let x = 20; x < 85; x++) {
      if (y < 8 || (x + y * 3) % 4 === 0) {
        grid[y][x] = TILE_IDS.MOUNTAIN;
      }
    }
  }

  // Eastern Crags (x ~ 78..88, y ~ 30..65)
  for (let y = 30; y < 65; y++) {
    for (let x = 76; x < 88; x++) {
      if (x > 80 + Math.sin(y * 0.3) * 3) {
        grid[y][x] = TILE_IDS.MOUNTAIN;
      }
    }
  }

  // 3. Winding River System & Lake of Axioms
  // Lake of Axioms in the center-east (x: 42..60, y: 34..48)
  for (let y = 34; y <= 48; y++) {
    for (let x = 42; x <= 60; x++) {
      const dx = (x - 51) / 9;
      const dy = (y - 41) / 7;
      if (dx * dx + dy * dy < 1) {
        grid[y][x] = TILE_IDS.DEEP_WATER;
      } else if (dx * dx + dy * dy < 1.35) {
        grid[y][x] = TILE_IDS.SAND;
      }
    }
  }

  // Northern River flowing from mountain glacier down into the lake
  let curRiverX = 48;
  for (let y = 11; y < 35; y++) {
    curRiverX += Math.round(Math.sin(y * 0.5) * 1.2);
    curRiverX = Math.max(30, Math.min(65, curRiverX));
    grid[y][curRiverX] = TILE_IDS.DEEP_WATER;
    grid[y][curRiverX + 1] = TILE_IDS.DEEP_WATER;
    // Riverbanks
    if (grid[y][curRiverX - 1] === TILE_IDS.GRASS) grid[y][curRiverX - 1] = TILE_IDS.SHALLOW_WATER;
    if (grid[y][curRiverX + 2] === TILE_IDS.GRASS) grid[y][curRiverX + 2] = TILE_IDS.SHALLOW_WATER;
  }

  // Southern River flowing from lake to southern sea
  let southRiverX = 52;
  for (let y = 49; y < height - 1; y++) {
    southRiverX += Math.round(Math.cos(y * 0.4) * 1.1);
    southRiverX = Math.max(35, Math.min(70, southRiverX));
    grid[y][southRiverX] = TILE_IDS.DEEP_WATER;
    grid[y][southRiverX + 1] = TILE_IDS.DEEP_WATER;
  }

  // Bridges over Rivers
  // Northern Bridge
  grid[22][48] = TILE_IDS.BRIDGE;
  grid[22][49] = TILE_IDS.BRIDGE;
  // Southern Bridge
  grid[58][southRiverX] = TILE_IDS.BRIDGE;
  grid[58][southRiverX + 1] = TILE_IDS.BRIDGE;

  // 4. Forests & Pine Groves
  for (let y = 12; y < height - 5; y++) {
    for (let x = 5; x < width - 5; x++) {
      if (grid[y][x] === TILE_IDS.GRASS) {
        // Clustered forests using trigonometric patterns
        const forestNoise = Math.sin(x * 0.18) * Math.cos(y * 0.16);
        if (forestNoise > 0.45) {
          grid[y][x] = TILE_IDS.FOREST;
        } else if (forestNoise > 0.7) {
          grid[y][x] = TILE_IDS.DENSE_FOREST;
        }
      }
    }
  }

  // 5. Cobblestone Roads connecting Village, Cave, Castle, and Bridges
  // Main East-West Highway
  for (let x = 22; x <= 68; x++) {
    const yRoad = 58;
    if (grid[yRoad][x] !== TILE_IDS.DEEP_WATER && grid[yRoad][x] !== TILE_IDS.BRIDGE) {
      grid[yRoad][x] = TILE_IDS.ROAD;
    }
  }

  // Road from Arithmia Village north to Whispering Cave
  for (let y = 32; y <= 58; y++) {
    const xRoad = 22;
    if (grid[y][xRoad] !== TILE_IDS.DEEP_WATER) {
      grid[y][xRoad] = TILE_IDS.ROAD;
    }
  }

  // Spur road to Cave entrance at (16, 32)
  for (let x = 16; x <= 22; x++) {
    grid[32][x] = TILE_IDS.ROAD;
  }

  // Cave Entrance tile set into Western mountain wall
  grid[32][15] = TILE_IDS.CAVE_ENTRANCE;
  grid[31][15] = TILE_IDS.MOUNTAIN;
  grid[33][15] = TILE_IDS.MOUNTAIN;
  grid[32][14] = TILE_IDS.MOUNTAIN;

  // Road to Royal Citadel (x: 68, y: 26..58)
  for (let y = 26; y <= 58; y++) {
    grid[y][68] = TILE_IDS.ROAD;
  }

  // Citadel Exterior Walls & Gate at (68, 25)
  for (let cy = 18; cy <= 25; cy++) {
    for (let cx = 63; cx <= 75; cx++) {
      if (cy === 18 || cy === 25 || cx === 63 || cx === 75) {
        grid[cy][cx] = TILE_IDS.CASTLE_WALL;
      } else {
        grid[cy][cx] = TILE_IDS.CASTLE_FLOOR;
      }
    }
  }
  // Castle Gate Entrance
  grid[25][68] = TILE_IDS.CASTLE_GATE;
  grid[26][68] = TILE_IDS.ROAD;

  // Road from northern bridge up towards Fractured Peaks and Null Sanctum
  for (let y = 12; y <= 22; y++) {
    grid[y][48] = TILE_IDS.ROAD;
  }

  // Fractured Peaks mountain ascent at (18, 12)
  grid[12][18] = TILE_IDS.ROAD;
  grid[11][18] = TILE_IDS.ROAD;
  grid[10][18] = TILE_IDS.VOID_FLOOR; // portal to Fractured Peaks

  // Null Sanctum Void Gate in far northern crater at (48, 8)
  grid[8][48] = TILE_IDS.VOID_WALL;
  grid[7][48] = TILE_IDS.VOID_FLOOR; // portal to Sanctum

  return grid;
}

// Generate the Whispering Caves Dungeon Labyrinth (56 x 46 tiles)
export function generateCaveMap(width = 56, height = 46): number[][] {
  // Start with solid cave walls
  const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(TILE_IDS.CAVE_WALL));

  // Cellular / room carver
  const rooms = [
    { x: 4, y: 32, w: 10, h: 8 },  // Entrance Chamber
    { x: 18, y: 30, w: 12, h: 10 }, // Crystal Cavern
    { x: 10, y: 18, w: 12, h: 8 },  // Stalactite Hollow
    { x: 26, y: 16, w: 14, h: 10 }, // Subterranean Lake Chamber
    { x: 38, y: 26, w: 12, h: 12 }, // Echo Chamber
    { x: 36, y: 6, w: 16, h: 12 },  // Throne of Euclid (Boss Lair)
    { x: 6, y: 6, w: 8, h: 8 }      // Hidden Vault
  ];

  // Carve rooms
  rooms.forEach((r) => {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
          grid[y][x] = TILE_IDS.CAVE_FLOOR;
        }
      }
    }
  });

  // Carve corridors between adjacent rooms
  const connectRooms = (r1: typeof rooms[0], r2: typeof rooms[0]) => {
    let cx = Math.floor(r1.x + r1.w / 2);
    let cy = Math.floor(r1.y + r1.h / 2);
    const tx = Math.floor(r2.x + r2.w / 2);
    const ty = Math.floor(r2.y + r2.h / 2);

    while (cx !== tx) {
      grid[cy][cx] = TILE_IDS.CAVE_FLOOR;
      grid[cy + 1][cx] = TILE_IDS.CAVE_FLOOR;
      cx += cx < tx ? 1 : -1;
    }
    while (cy !== ty) {
      grid[cy][cx] = TILE_IDS.CAVE_FLOOR;
      grid[cy][cx + 1] = TILE_IDS.CAVE_FLOOR;
      cy += cy < ty ? 1 : -1;
    }
  };

  connectRooms(rooms[0], rooms[1]);
  connectRooms(rooms[1], rooms[3]);
  connectRooms(rooms[1], rooms[2]);
  connectRooms(rooms[2], rooms[6]);
  connectRooms(rooms[3], rooms[4]);
  connectRooms(rooms[3], rooms[5]);

  // Entrance ladder at (8, 36) in Entrance Chamber (Steps leading back up to overworld)
  grid[36][8] = TILE_IDS.CAVE_EXIT;

  // Add glowing crystal clusters in rooms
  const crystalSpots = [
    [22, 34], [25, 33], [24, 36],
    [30, 20], [32, 21], [35, 18],
    [42, 30], [44, 32],
    [40, 10], [48, 10], [44, 8]
  ];
  crystalSpots.forEach(([x, y]) => {
    if (grid[y] && grid[y][x] === TILE_IDS.CAVE_FLOOR) {
      grid[y][x] = TILE_IDS.CAVE_CRYSTAL;
    }
  });

  // Underground pool in chamber 3
  for (let y = 19; y <= 22; y++) {
    for (let x = 28; x <= 34; x++) {
      grid[y][x] = TILE_IDS.SHALLOW_WATER;
    }
  }
  // Stepping stones across the pool
  grid[20][31] = TILE_IDS.CAVE_FLOOR;
  grid[21][31] = TILE_IDS.CAVE_FLOOR;

  return grid;
}

// Generate Royal Citadel Interior Map (48 x 38 tiles)
export function generateCitadelMap(width = 48, height = 38): number[][] {
  const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(TILE_IDS.CASTLE_WALL));

  // Courtyard & Grand Hall (x: 6..42, y: 8..34)
  for (let y = 8; y <= 34; y++) {
    for (let x = 6; x <= 42; x++) {
      grid[y][x] = TILE_IDS.CASTLE_FLOOR;
    }
  }

  // Velvet Royal Carpet down the center aisle (x: 23..25, y: 10..34)
  for (let y = 10; y <= 34; y++) {
    for (let x = 23; x <= 25; x++) {
      grid[y][x] = TILE_IDS.CASTLE_CARPET;
    }
  }

  // Stone columns / pillars in the hall
  for (let y = 14; y <= 30; y += 4) {
    grid[y][15] = TILE_IDS.CASTLE_WALL;
    grid[y][33] = TILE_IDS.CASTLE_WALL;
  }

  // Throne Room Platform (x: 20..28, y: 9..12)
  for (let y = 9; y <= 12; y++) {
    for (let x = 20; x <= 28; x++) {
      grid[y][x] = TILE_IDS.CASTLE_CARPET;
    }
  }

  // Entrance gate back to overworld at (24, 34)
  grid[34][24] = TILE_IDS.CASTLE_GATE;

  // Side rooms (Royal Archives Lady Hypatia on the right, Armory on left)
  // Left Armory (x: 7..14, y: 16..26)
  // Right Archive (x: 34..41, y: 16..26)

  return grid;
}

// Generate Fractured Peaks Sky Map (44 x 40 tiles)
export function generatePeaksMap(width = 44, height = 40): number[][] {
  // Mostly void abyss
  const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(TILE_IDS.VOID_WALL));

  // Floating Islands
  const islands = [
    { cx: 8, cy: 32, r: 6 },   // Start Island
    { cx: 20, cy: 26, r: 7 },  // Lower Bridge Island
    { cx: 34, cy: 30, r: 6 },  // Eastern Crag
    { cx: 22, cy: 12, r: 8 },  // Central Obelisk Island
    { cx: 36, cy: 10, r: 6 }   // Summit Platform
  ];

  islands.forEach((isl) => {
    for (let y = isl.cy - isl.r; y <= isl.cy + isl.r; y++) {
      for (let x = isl.cx - isl.r; x <= isl.cx + isl.r; x++) {
        if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
          if (Math.hypot(x - isl.cx, y - isl.cy) <= isl.r) {
            grid[y][x] = TILE_IDS.VOID_FLOOR;
          }
        }
      }
    }
  });

  // Narrow Runic Bridges connecting islands
  const bridge = (x1: number, y1: number, x2: number, y2: number) => {
    let x = x1;
    let y = y1;
    while (x !== x2) {
      grid[y][x] = TILE_IDS.BRIDGE;
      x += x < x2 ? 1 : -1;
    }
    while (y !== y2) {
      grid[y][x] = TILE_IDS.BRIDGE;
      y += y < y2 ? 1 : -1;
    }
  };

  bridge(8, 32, 20, 26);
  bridge(20, 26, 34, 30);
  bridge(20, 26, 22, 12);
  bridge(22, 12, 36, 10);

  // Descent ladder / portal back to Overworld
  grid[34][8] = TILE_IDS.ROAD;

  return grid;
}

// Generate The Null Sanctum Map (36 x 36 tiles)
export function generateSanctumMap(width = 36, height = 36): number[][] {
  const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(TILE_IDS.VOID_WALL));

  // Obsidian Arena in center (cx: 18, cy: 18, r: 14)
  for (let y = 4; y <= 32; y++) {
    for (let x = 4; x <= 32; x++) {
      const dist = Math.hypot(x - 18, y - 18);
      if (dist <= 13) {
        grid[y][x] = TILE_IDS.CASTLE_FLOOR;
      }
    }
  }

  // Obsidian Pillars around perimeter
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
    const px = Math.round(18 + Math.cos(angle) * 11);
    const py = Math.round(18 + Math.sin(angle) * 11);
    grid[py][px] = TILE_IDS.CASTLE_WALL;
  }

  // Throne of Division by Zero in center
  grid[18][18] = TILE_IDS.CASTLE_CARPET;

  // Entrance rift from Peaks
  grid[30][18] = TILE_IDS.VOID_FLOOR;

  return grid;
}
