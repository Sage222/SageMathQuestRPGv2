import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Enemy, NPC, PlayerStats, TreasureChest, WeatherType, Zone, ZonePortal } from '../types/game';
import { sound } from '../utils/audio';
import { isTileWalkable, TILE_IDS } from '../data/mapGenerator';
import { 
  Compass, 
  MapPin, 
  Eye, 
  Footprints, 
  Sparkles, 
  Flame, 
  Maximize2, 
  Minimize2,
  CloudRain,
  CloudLightning,
  Sun,
  Snowflake,
  CloudFog,
  Waves,
  Ship
} from 'lucide-react';

interface WorldCanvasProps {
  currentZone: Zone;
  player: PlayerStats;
  playerPos: { x: number; y: number };
  onMovePlayerPos: (newPos: { x: number; y: number }) => void;
  onInteractNPC: (npc: NPC) => void;
  onEngageEnemy: (enemy: Enemy) => void;
  onOpenChest: (chest: TreasureChest) => void;
  onEnterPortal: (portal: ZonePortal) => void;
  onFastTravelOpen: () => void;
}

const TILE_SIZE = 36;
const VIEW_COLS = 23; // Viewport visible columns
const VIEW_ROWS = 17; // Viewport visible rows

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  len: number;
}

interface SnowflakeItem {
  x: number;
  y: number;
  radius: number;
  speed: number;
  sway: number;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  currentZone,
  player,
  playerPos,
  onMovePlayerPos,
  onInteractNPC,
  onEngageEnemy,
  onOpenChest,
  onEnterPortal,
  onFastTravelOpen
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerFacing, setPlayerFacing] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [walkFrame, setWalkFrame] = useState(0);

  // Weather System
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [lightningActive, setLightningActive] = useState(false);
  const [minimapZoom, setMinimapZoom] = useState<'fit' | 'close'>('fit');

  // Fog of war exploration matrix
  const [explored, setExplored] = useState<{ [zoneId: string]: boolean[][] }>({});
  const [showFullMap, setShowFullMap] = useState(false);

  // Nearby prompt state
  const [nearbyPrompt, setNearbyPrompt] = useState<{
    type: 'npc' | 'enemy' | 'chest' | 'portal';
    name: string;
    actionText: string;
    entity: any;
  } | null>(null);

  // Wilderness step counter for random battle encounters
  const [stepsSinceLastBattle, setStepsSinceLastBattle] = useState(0);

  // Check if player is currently on a water tile (Boat mode)
  const currentTileId = currentZone.mapGrid[playerPos.y]?.[playerPos.x] ?? TILE_IDS.GRASS;
  const isPlayerInBoat = currentTileId === TILE_IDS.DEEP_WATER || currentTileId === TILE_IDS.SHALLOW_WATER;

  // Particle systems for weather
  const rainDropsRef = useRef<RainDrop[]>([]);
  const snowFlakesRef = useRef<SnowflakeItem[]>([]);

  // Initialize rain drops
  useEffect(() => {
    rainDropsRef.current = Array.from({ length: 90 }, () => ({
      x: Math.random() * (VIEW_COLS * TILE_SIZE),
      y: Math.random() * (VIEW_ROWS * TILE_SIZE),
      speed: 12 + Math.random() * 8,
      len: 12 + Math.random() * 8
    }));

    snowFlakesRef.current = Array.from({ length: 70 }, () => ({
      x: Math.random() * (VIEW_COLS * TILE_SIZE),
      y: Math.random() * (VIEW_ROWS * TILE_SIZE),
      radius: 1.5 + Math.random() * 2,
      speed: 1.2 + Math.random() * 1.5,
      sway: Math.random() * Math.PI * 2
    }));
  }, []);

  // Natural weather cycle in overworld
  useEffect(() => {
    if (currentZone.type === 'cave') {
      setWeather('clear'); // Caves have no rain/sun
      return;
    }

    // Default northern regions to snow or mist
    if (playerPos.y < 16) {
      setWeather('snow');
    }

    const interval = setInterval(() => {
      if (currentZone.type === 'cave') return;
      const weathers: WeatherType[] = ['clear', 'rain', 'thunderstorm', 'snow', 'mist'];
      const nextW = weathers[Math.floor(Math.random() * weathers.length)];
      setWeather(nextW);
    }, 75000); // changes every 75s

    return () => clearInterval(interval);
  }, [currentZone.type, playerPos.y]);

  // Thunderstorm periodic lightning strikes
  useEffect(() => {
    if (weather !== 'thunderstorm' || currentZone.type === 'cave') return;

    const thunderInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        setLightningActive(true);
        sound.playThunder();
        setTimeout(() => setLightningActive(false), 120);
      }
    }, 9000);

    return () => clearInterval(thunderInterval);
  }, [weather, currentZone.type]);

  // Cycle weather manually
  const cycleWeather = () => {
    sound.playClick();
    const cycle: WeatherType[] = ['clear', 'rain', 'thunderstorm', 'snow', 'mist'];
    const nextIdx = (cycle.indexOf(weather) + 1) % cycle.length;
    setWeather(cycle[nextIdx]);
  };

  // Mark explored area around player
  useEffect(() => {
    setExplored((prev) => {
      const zoneGrid = prev[currentZone.id] || 
        Array.from({ length: currentZone.height }, () => Array(currentZone.width).fill(false));

      const radius = currentZone.type === 'cave' ? 6 : 10;
      let modified = false;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ex = playerPos.x + dx;
          const ey = playerPos.y + dy;
          if (ex >= 0 && ex < currentZone.width && ey >= 0 && ey < currentZone.height) {
            if (dx * dx + dy * dy <= radius * radius) {
              if (!zoneGrid[ey][ex]) {
                zoneGrid[ey][ex] = true;
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        return { ...prev, [currentZone.id]: [...zoneGrid] };
      }
      return prev;
    });
  }, [currentZone.id, currentZone.width, currentZone.height, currentZone.type, playerPos.x, playerPos.y]);

  // Check nearby interactive entities
  const updateNearbyPrompt = useCallback((x: number, y: number) => {
    // 1. Check Portals (within 1.2 tile)
    for (const portal of currentZone.portals) {
      const dist = Math.hypot(portal.x - x, portal.y - y);
      if (dist <= 1.2) {
        setNearbyPrompt({
          type: 'portal',
          name: portal.name,
          actionText: `Enter ${portal.name}`,
          entity: portal
        });
        return;
      }
    }

    // 2. Check NPCs (within 1.6 tiles)
    for (const npc of currentZone.npcs) {
      const dist = Math.hypot(npc.x - x, npc.y - y);
      if (dist <= 1.6) {
        setNearbyPrompt({
          type: 'npc',
          name: npc.name,
          actionText: `Speak with ${npc.name}`,
          entity: npc
        });
        return;
      }
    }

    // 3. Check Chests (within 1.4 tiles)
    for (const chest of currentZone.chests) {
      if (!chest.opened) {
        const dist = Math.hypot(chest.x - x, chest.y - y);
        if (dist <= 1.4) {
          setNearbyPrompt({
            type: 'chest',
            name: 'Ancient Equation Chest',
            actionText: 'Unlock Treasure',
            entity: chest
          });
          return;
        }
      }
    }

    // 4. Check Roaming Enemies
    for (const enemy of currentZone.enemies) {
      const ex = enemy.isBoss ? (currentZone.type === 'cave' ? 44 : 24) : 26;
      const ey = enemy.isBoss ? (currentZone.type === 'cave' ? 12 : 12) : 28;
      if (Math.hypot(ex - x, ey - y) <= 1.4) {
        setNearbyPrompt({
          type: 'enemy',
          name: enemy.name,
          actionText: `Attack ${enemy.name}!`,
          entity: enemy
        });
        return;
      }
    }

    setNearbyPrompt(null);
  }, [currentZone]);

  // Movement handler with water sailing & collision
  const handleMove = useCallback((dx: number, dy: number) => {
    const targetX = playerPos.x + dx;
    const targetY = playerPos.y + dy;

    // Bounds check
    if (targetX < 0 || targetX >= currentZone.width || targetY < 0 || targetY >= currentZone.height) {
      return;
    }

    // Tile Collision Check (Water is permitted because player transforms into a boat!)
    const targetTileId = currentZone.mapGrid[targetY]?.[targetX] ?? TILE_IDS.GRASS;
    const canSail = currentZone.type === 'overworld'; // Overworld rivers & lakes are fully sailable

    if (!isTileWalkable(targetTileId, canSail)) {
      sound.playClick();
      return;
    }

    // Play water splash when entering water from land
    const currentIsWater = currentTileId === TILE_IDS.DEEP_WATER || currentTileId === TILE_IDS.SHALLOW_WATER;
    const targetIsWater = targetTileId === TILE_IDS.DEEP_WATER || targetTileId === TILE_IDS.SHALLOW_WATER;
    if (!currentIsWater && targetIsWater) {
      sound.playSplash();
    } else if (currentIsWater && !targetIsWater) {
      sound.playClick(); // Disembarking onto land
    }

    // Set Facing
    if (dx > 0) setPlayerFacing('right');
    else if (dx < 0) setPlayerFacing('left');
    else if (dy > 0) setPlayerFacing('down');
    else if (dy < 0) setPlayerFacing('up');

    setWalkFrame((f) => (f + 1) % 4);
    onMovePlayerPos({ x: targetX, y: targetY });
    updateNearbyPrompt(targetX, targetY);

    // Direct Portal Auto-Entry Check (Stepping directly onto cave entrance, ladder, gate)
    for (const portal of currentZone.portals) {
      if (portal.x === targetX && portal.y === targetY) {
        sound.playSpell('buff');
        onEnterPortal(portal);
        return;
      }
    }

    // Random Wilderness Encounter (tall grass, forests, deep caves)
    if (targetTileId === TILE_IDS.FOREST || targetTileId === TILE_IDS.CAVE_FLOOR || (currentZone.type === 'overworld' && targetTileId === TILE_IDS.GRASS && targetY < 45)) {
      const nextSteps = stepsSinceLastBattle + 1;
      setStepsSinceLastBattle(nextSteps);

      if (nextSteps > 15 && Math.random() < 0.12) {
        setStepsSinceLastBattle(0);
        const randomEnemy = currentZone.enemies[Math.floor(Math.random() * currentZone.enemies.length)];
        if (randomEnemy) {
          sound.playSpell('lightning');
          onEngageEnemy(randomEnemy);
          return;
        }
      }
    }
  }, [currentTileId, currentZone, onEnterPortal, onEngageEnemy, onMovePlayerPos, playerPos.x, playerPos.y, stepsSinceLastBattle, updateNearbyPrompt]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove(1, 0);
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        if (nearbyPrompt) {
          e.preventDefault();
          executeInteraction(nearbyPrompt);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setShowFullMap((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, nearbyPrompt]);

  const executeInteraction = (prompt: NonNullable<typeof nearbyPrompt>) => {
    sound.playClick();
    if (prompt.type === 'npc') {
      onInteractNPC(prompt.entity);
    } else if (prompt.type === 'chest') {
      onOpenChest(prompt.entity);
    } else if (prompt.type === 'portal') {
      onEnterPortal(prompt.entity);
    } else if (prompt.type === 'enemy') {
      onEngageEnemy(prompt.entity);
    }
  };

  // Canvas click to move
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const cameraX = Math.max(0, Math.min(currentZone.width - VIEW_COLS, playerPos.x - Math.floor(VIEW_COLS / 2)));
    const cameraY = Math.max(0, Math.min(currentZone.height - VIEW_ROWS, playerPos.y - Math.floor(VIEW_ROWS / 2)));

    const clickedTileX = cameraX + Math.floor((clickX * scaleX) / TILE_SIZE);
    const clickedTileY = cameraY + Math.floor((clickY * scaleY) / TILE_SIZE);

    const dx = Math.sign(clickedTileX - playerPos.x);
    const dy = Math.sign(clickedTileY - playerPos.y);

    if (dx !== 0 || dy !== 0) {
      sound.playClick();
      handleMove(dx, dy);
    }
  };

  // -------------------------------------------------------------
  // RENDER MINIMAP (Dedicated high-fidelity mini canvas)
  // -------------------------------------------------------------
  useEffect(() => {
    const miniCanvas = minimapCanvasRef.current;
    if (!miniCanvas) return;
    const ctx = miniCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);

    const currentExplored = explored[currentZone.id];
    const cameraX = Math.max(0, Math.min(currentZone.width - VIEW_COLS, playerPos.x - Math.floor(VIEW_COLS / 2)));
    const cameraY = Math.max(0, Math.min(currentZone.height - VIEW_ROWS, playerPos.y - Math.floor(VIEW_ROWS / 2)));

    const scaleX = miniCanvas.width / currentZone.width;
    const scaleY = miniCanvas.height / currentZone.height;

    // Draw miniature terrain
    for (let y = 0; y < currentZone.height; y++) {
      for (let x = 0; x < currentZone.width; x++) {
        const isExp = currentExplored?.[y]?.[x];
        const tileId = currentZone.mapGrid[y]?.[x] ?? TILE_IDS.GRASS;

        if (!isExp) {
          ctx.fillStyle = '#090d16'; // unexplored fog
        } else {
          switch (tileId) {
            case TILE_IDS.DEEP_WATER:
              ctx.fillStyle = '#0284c7';
              break;
            case TILE_IDS.SHALLOW_WATER:
              ctx.fillStyle = '#38bdf8';
              break;
            case TILE_IDS.MOUNTAIN:
              ctx.fillStyle = '#64748b';
              break;
            case TILE_IDS.FOREST:
            case TILE_IDS.DENSE_FOREST:
              ctx.fillStyle = '#064e3b';
              break;
            case TILE_IDS.ROAD:
            case TILE_IDS.BRIDGE:
              ctx.fillStyle = '#94a3b8';
              break;
            case TILE_IDS.SAND:
              ctx.fillStyle = '#eab308';
              break;
            case TILE_IDS.CAVE_WALL:
              ctx.fillStyle = '#020617';
              break;
            case TILE_IDS.CAVE_FLOOR:
            case TILE_IDS.CAVE_CRYSTAL:
              ctx.fillStyle = '#312e81';
              break;
            case TILE_IDS.CASTLE_WALL:
              ctx.fillStyle = '#334155';
              break;
            case TILE_IDS.CASTLE_FLOOR:
            case TILE_IDS.CASTLE_CARPET:
              ctx.fillStyle = '#991b1b';
              break;
            default:
              ctx.fillStyle = '#16a34a';
              break;
          }
        }
        ctx.fillRect(x * scaleX, y * scaleY, scaleX + 0.4, scaleY + 0.4);
      }
    }

    // Draw Viewport Camera Frustum Outline
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cameraX * scaleX, cameraY * scaleY, VIEW_COLS * scaleX, VIEW_ROWS * scaleY);

    // Draw Portals on minimap
    currentZone.portals.forEach((p) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.x * scaleX, p.y * scaleY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Chests on minimap
    currentZone.chests.filter(c => !c.opened).forEach((c) => {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(c.x * scaleX - 1.5, c.y * scaleY - 1.5, 3, 3);
    });

    // Draw Player marker
    const px = playerPos.x * scaleX;
    const py = playerPos.y * scaleY;

    // Pulsing halo
    ctx.strokeStyle = isPlayerInBoat ? '#38bdf8' : '#4ade80';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isPlayerInBoat ? '#38bdf8' : '#22c55e';
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

  }, [currentZone, playerPos, explored, isPlayerInBoat]);

  // -------------------------------------------------------------
  // MAIN VIEWPORT RENDER LOOP (With Boat & Weather Particles)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cameraX = Math.max(0, Math.min(currentZone.width - VIEW_COLS, playerPos.x - Math.floor(VIEW_COLS / 2)));
      const cameraY = Math.max(0, Math.min(currentZone.height - VIEW_ROWS, playerPos.y - Math.floor(VIEW_ROWS / 2)));

      const currentExplored = explored[currentZone.id];

      // 1. Draw Visible Tiles
      for (let r = 0; r < VIEW_ROWS; r++) {
        for (let c = 0; c < VIEW_COLS; c++) {
          const mapX = cameraX + c;
          const mapY = cameraY + r;

          const screenX = c * TILE_SIZE;
          const screenY = r * TILE_SIZE;

          if (mapX >= 0 && mapX < currentZone.width && mapY >= 0 && mapY < currentZone.height) {
            const tileId = currentZone.mapGrid[mapY]?.[mapX] ?? TILE_IDS.GRASS;
            const isExploredTile = currentExplored?.[mapY]?.[mapX];

            switch (tileId) {
              case TILE_IDS.GRASS:
                ctx.fillStyle = (mapX + mapY) % 2 === 0 ? '#15803d' : '#166534';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                break;

              case TILE_IDS.FOREST:
                ctx.fillStyle = '#14532d';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#064e3b';
                ctx.beginPath();
                ctx.arc(screenX + 18, screenY + 16, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#022c22';
                ctx.beginPath();
                ctx.arc(screenX + 18, screenY + 14, 8, 0, Math.PI * 2);
                ctx.fill();
                break;

              case TILE_IDS.DENSE_FOREST:
                ctx.fillStyle = '#022c22';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#064e3b';
                ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                break;

              case TILE_IDS.MOUNTAIN:
                ctx.fillStyle = '#334155';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#64748b';
                ctx.beginPath();
                ctx.moveTo(screenX + 4, screenY + TILE_SIZE - 2);
                ctx.lineTo(screenX + 18, screenY + 6);
                ctx.lineTo(screenX + TILE_SIZE - 4, screenY + TILE_SIZE - 2);
                ctx.closePath();
                ctx.fill();
                // Snow peak
                ctx.fillStyle = '#f1f5f9';
                ctx.beginPath();
                ctx.moveTo(screenX + 14, screenY + 12);
                ctx.lineTo(screenX + 18, screenY + 6);
                ctx.lineTo(screenX + 22, screenY + 12);
                ctx.closePath();
                ctx.fill();
                break;

              case TILE_IDS.DEEP_WATER:
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Subtle animated ripple
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(screenX + 18, screenY + 18, 7, 0, Math.PI);
                ctx.stroke();
                break;

              case TILE_IDS.SHALLOW_WATER:
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                break;

              case TILE_IDS.SAND:
                ctx.fillStyle = '#ca8a04';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                break;

              case TILE_IDS.ROAD:
                ctx.fillStyle = '#475569';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#334155';
                ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                break;

              case TILE_IDS.BRIDGE:
                ctx.fillStyle = '#0284c7'; // water beneath
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#78350f'; // wood planks
                ctx.fillRect(screenX + 2, screenY, TILE_SIZE - 4, TILE_SIZE);
                ctx.fillStyle = '#92400e';
                ctx.fillRect(screenX + 4, screenY + 6, TILE_SIZE - 8, 4);
                ctx.fillRect(screenX + 4, screenY + 18, TILE_SIZE - 8, 4);
                ctx.fillRect(screenX + 4, screenY + 28, TILE_SIZE - 8, 4);
                break;

              case TILE_IDS.CAVE_ENTRANCE:
                ctx.fillStyle = '#334155';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#020617';
                ctx.beginPath();
                ctx.arc(screenX + 18, screenY + 18, 12, Math.PI, 0, false);
                ctx.lineTo(screenX + 30, screenY + TILE_SIZE);
                ctx.lineTo(screenX + 6, screenY + TILE_SIZE);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#cbd5e1';
                ctx.font = 'bold 9px "Plus Jakarta Sans"';
                ctx.textAlign = 'center';
                ctx.fillText('CAVE', screenX + 18, screenY + 10);
                break;

              case TILE_IDS.CAVE_FLOOR:
                ctx.fillStyle = (mapX + mapY) % 2 === 0 ? '#1e1b4b' : '#0f172a';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                break;

              case TILE_IDS.CAVE_WALL:
                ctx.fillStyle = '#020617';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#1e293b';
                ctx.strokeRect(screenX + 1, screenY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                break;

              case TILE_IDS.CAVE_CRYSTAL:
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.moveTo(screenX + 18, screenY + 6);
                ctx.lineTo(screenX + 24, screenY + 24);
                ctx.lineTo(screenX + 18, screenY + 30);
                ctx.lineTo(screenX + 12, screenY + 24);
                ctx.closePath();
                ctx.fill();
                break;

              case TILE_IDS.CAVE_EXIT:
                ctx.fillStyle = '#1e1b4b';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#b45309';
                ctx.fillRect(screenX + 10, screenY + 4, 3, TILE_SIZE - 8);
                ctx.fillRect(screenX + 23, screenY + 4, 3, TILE_SIZE - 8);
                for (let ly = 8; ly < TILE_SIZE - 8; ly += 6) {
                  ctx.fillRect(screenX + 10, screenY + ly, 16, 2);
                }
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 8px "Plus Jakarta Sans"';
                ctx.textAlign = 'center';
                ctx.fillText('UP', screenX + 18, screenY + 32);
                break;

              case TILE_IDS.CASTLE_FLOOR:
                ctx.fillStyle = (mapX + mapY) % 2 === 0 ? '#334155' : '#1e293b';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                break;

              case TILE_IDS.CASTLE_WALL:
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#475569';
                ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                break;

              case TILE_IDS.CASTLE_CARPET:
                ctx.fillStyle = '#881337';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(screenX, screenY, TILE_SIZE, 1.5);
                ctx.fillRect(screenX, screenY + TILE_SIZE - 1.5, TILE_SIZE, 1.5);
                break;

              case TILE_IDS.CASTLE_GATE:
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#d97706';
                ctx.fillRect(screenX + 6, screenY + 4, 24, 4);
                ctx.fillStyle = '#f59e0b';
                ctx.font = 'bold 9px "Plus Jakarta Sans"';
                ctx.textAlign = 'center';
                ctx.fillText('GATE', screenX + 18, screenY + 22);
                break;

              case TILE_IDS.VOID_FLOOR:
                ctx.fillStyle = '#312e81';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                break;

              case TILE_IDS.VOID_WALL:
              default:
                ctx.fillStyle = '#020617';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                break;
            }

            // Fog of war shroud
            if (!isExploredTile) {
              ctx.fillStyle = '#000000';
              ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      }

      // 2. Draw Portals
      currentZone.portals.forEach((portal) => {
        const screenX = (portal.x - cameraX) * TILE_SIZE;
        const screenY = (portal.y - cameraY) * TILE_SIZE;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE && screenY <= canvas.height) {
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(screenX + 18, screenY + 18, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(screenX + 18, screenY + 18, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "Plus Jakarta Sans"';
          ctx.textAlign = 'center';
          ctx.fillText(portal.name, screenX + 18, screenY - 4);
        }
      });

      // 3. Draw Chests
      currentZone.chests.forEach((chest) => {
        const screenX = (chest.x - cameraX) * TILE_SIZE;
        const screenY = (chest.y - cameraY) * TILE_SIZE;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE && screenY <= canvas.height) {
          if (chest.opened) {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(screenX + 8, screenY + 12, 20, 16);
          } else {
            ctx.fillStyle = '#d97706';
            ctx.fillRect(screenX + 8, screenY + 10, 20, 18);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(screenX + 16, screenY + 16, 4, 6);
            ctx.strokeStyle = '#fbbf24';
            ctx.strokeRect(screenX + 7, screenY + 9, 22, 20);
          }
        }
      });

      // 4. Draw NPCs
      currentZone.npcs.forEach((npc) => {
        const screenX = (npc.x - cameraX) * TILE_SIZE;
        const screenY = (npc.y - cameraY) * TILE_SIZE;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE && screenY <= canvas.height) {
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(screenX + 12, screenY + 14, 12, 16);
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(screenX + 18, screenY + 11, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px "Plus Jakarta Sans"';
          ctx.textAlign = 'center';
          ctx.fillText(npc.name, screenX + 18, screenY - 4);
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 14px serif';
          ctx.fillText('!', screenX + 18, screenY - 14);
        }
      });

      // 5. Draw Enemies
      currentZone.enemies.forEach((enemy) => {
        const ex = enemy.isBoss ? (currentZone.type === 'cave' ? 44 : 24) : 26;
        const ey = enemy.isBoss ? (currentZone.type === 'cave' ? 12 : 12) : 28;

        const screenX = (ex - cameraX) * TILE_SIZE;
        const screenY = (ey - cameraY) * TILE_SIZE;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE && screenY <= canvas.height) {
          ctx.fillStyle = enemy.isBoss ? '#dc2626' : '#ea580c';
          ctx.beginPath();
          ctx.arc(screenX + 18, screenY + 18, enemy.isBoss ? 15 : 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(screenX + 13, screenY + 15, 3, 3);
          ctx.fillRect(screenX + 21, screenY + 15, 3, 3);
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 9px "Plus Jakarta Sans"';
          ctx.textAlign = 'center';
          ctx.fillText(`${enemy.name} (L${enemy.level})`, screenX + 18, screenY - 4);
        }
      });

      // 6. Draw Player: BOAT OR WIZARD ROBES
      const playerScreenX = (playerPos.x - cameraX) * TILE_SIZE;
      const playerScreenY = (playerPos.y - cameraY) * TILE_SIZE;

      if (isPlayerInBoat) {
        // ==========================================
        // BOAT TRANSFORMATION (Sailing Vessel)
        // ==========================================
        // Water wake ripples behind boat
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(playerScreenX + 18, playerScreenY + 28, 14, 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.beginPath();
        ctx.ellipse(playerScreenX + 18, playerScreenY + 31, 19, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Wooden Boat Hull
        ctx.fillStyle = '#78350f'; // mahogany hull
        ctx.beginPath();
        ctx.moveTo(playerScreenX + 6, playerScreenY + 20);
        ctx.quadraticCurveTo(playerScreenX + 18, playerScreenY + 32, playerScreenX + 30, playerScreenY + 20);
        ctx.lineTo(playerScreenX + 26, playerScreenY + 16);
        ctx.lineTo(playerScreenX + 10, playerScreenY + 16);
        ctx.closePath();
        ctx.fill();

        // Gunwale edge trim
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Wooden Mast in center
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(playerScreenX + 18, playerScreenY + 22);
        ctx.lineTo(playerScreenX + 18, playerScreenY + 4);
        ctx.stroke();

        // Triangular White Canvas Sail
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(playerScreenX + 18, playerScreenY + 6);
        ctx.lineTo(playerScreenX + 30, playerScreenY + 18);
        ctx.lineTo(playerScreenX + 18, playerScreenY + 19);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Top Pennant Flag
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(playerScreenX + 18, playerScreenY + 4);
        ctx.lineTo(playerScreenX + 12, playerScreenY + 7);
        ctx.lineTo(playerScreenX + 18, playerScreenY + 9);
        ctx.closePath();
        ctx.fill();

        // Boat Nameplate
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(`⛵ S.S. Axiom (L${player.level})`, playerScreenX + 18, playerScreenY - 8);

      } else {
        // ==========================================
        // LAND WIZARD HERO (Arithmancer)
        // ==========================================
        // Soft Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(playerScreenX + 18, playerScreenY + 31, 10, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Robe
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(playerScreenX + 11, playerScreenY + 14, 14, 16);
        // Gold sash
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(playerScreenX + 11, playerScreenY + 21, 14, 3);

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(playerScreenX + 18, playerScreenY + 11, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Wizard Pointed Hat
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(playerScreenX + 9, playerScreenY + 9);
        ctx.lineTo(playerScreenX + 27, playerScreenY + 9);
        ctx.lineTo(playerScreenX + 18, playerScreenY - 5);
        ctx.closePath();
        ctx.fill();

        // Staff with glowing blue orb
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playerScreenX + 28, playerScreenY + 8);
        ctx.lineTo(playerScreenX + 28, playerScreenY + 31);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(playerScreenX + 28, playerScreenY + 7, 4, 0, Math.PI * 2);
        ctx.fill();

        // Player Name
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(`Arithmancer (L${player.level})`, playerScreenX + 18, playerScreenY - 8);
      }

      // 7. Cave Darkness & Torch Gradient
      if (currentZone.type === 'cave') {
        const radial = ctx.createRadialGradient(
          playerScreenX + 18, playerScreenY + 18, 40,
          playerScreenX + 18, playerScreenY + 18, 220
        );
        radial.addColorStop(0, 'rgba(0, 0, 0, 0)');
        radial.addColorStop(0.5, 'rgba(5, 5, 20, 0.4)');
        radial.addColorStop(1, 'rgba(2, 6, 23, 0.95)');

        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 8. DYNAMIC WEATHER PARTICLES OVERLAY (Overworld, Peaks, Castle)
      if (currentZone.type !== 'cave') {
        // A. RAIN / THUNDERSTORM
        if (weather === 'rain' || weather === 'thunderstorm') {
          // Storm sky tint
          ctx.fillStyle = weather === 'thunderstorm' 
            ? 'rgba(15, 23, 42, 0.35)' 
            : 'rgba(30, 41, 59, 0.2)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Raindrops
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          rainDropsRef.current.forEach((drop) => {
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - 3, drop.y + drop.len);

            drop.y += drop.speed;
            drop.x -= 1;
            if (drop.y > canvas.height) {
              drop.y = -10;
              drop.x = Math.random() * canvas.width;
            }
          });
          ctx.stroke();

          // Thunderstorm lightning flash
          if (lightningActive) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }

        // B. SNOW PARTICLES
        else if (weather === 'snow') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          snowFlakesRef.current.forEach((flake) => {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fill();

            flake.y += flake.speed;
            flake.x += Math.sin(flake.sway) * 0.8;
            flake.sway += 0.05;

            if (flake.y > canvas.height) {
              flake.y = -5;
              flake.x = Math.random() * canvas.width;
            }
          });
        }

        // C. MIST / FOG
        else if (weather === 'mist') {
          ctx.fillStyle = 'rgba(224, 242, 254, 0.15)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Drifting fog band
          const fogTime = Date.now() * 0.0005;
          const fogOffset = (Math.sin(fogTime) * 30);
          ctx.fillStyle = 'rgba(241, 245, 249, 0.1)';
          ctx.fillRect(0, 100 + fogOffset, canvas.width, 140);
        }

        // D. CLEAR / SUNNY SUNBEAMS
        else if (weather === 'clear') {
          // Warm subtle ambient sunlight
          ctx.fillStyle = 'rgba(251, 191, 36, 0.04)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentZone, playerPos, playerFacing, walkFrame, player.level, explored, isPlayerInBoat, weather, lightningActive]);

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
      
      {/* ZONE HEADER BAR WITH WEATHER STATUS */}
      <div className="w-full flex items-center justify-between px-6 py-3 bg-slate-900 border border-slate-800 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-cinzel leading-none">{currentZone.name}</h2>
              {isPlayerInBoat ? (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">
                  <Ship className="w-3 h-3" /> Sailing Boat
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-mono-numbers">
                  {currentZone.width}x{currentZone.height}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">{currentZone.ambientDescription}</span>
          </div>
        </div>

        {/* WEATHER & ATLAS QUICK CONTROLS */}
        <div className="flex items-center gap-2">
          {/* Weather Toggle Button */}
          {currentZone.type !== 'cave' && (
            <button
              onClick={cycleWeather}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Click to change weather"
            >
              {weather === 'rain' && <CloudRain className="w-3.5 h-3.5 text-sky-400" />}
              {weather === 'thunderstorm' && <CloudLightning className="w-3.5 h-3.5 text-amber-400" />}
              {weather === 'snow' && <Snowflake className="w-3.5 h-3.5 text-cyan-300" />}
              {weather === 'mist' && <CloudFog className="w-3.5 h-3.5 text-slate-300" />}
              {weather === 'clear' && <Sun className="w-3.5 h-3.5 text-amber-300" />}
              <span className="capitalize">{weather}</span>
            </button>
          )}

          <button
            onClick={() => setShowFullMap(!showFullMap)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              showFullMap 
                ? 'bg-amber-500 text-slate-950 border-amber-400' 
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            {showFullMap ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{showFullMap ? 'Close Atlas' : 'Charted Map (M)'}</span>
          </button>

          <button
            onClick={onFastTravelOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Fast Travel</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT CANVAS CONTAINER (Gurk III Retro Scrolling Camera) */}
      <div className="relative w-full aspect-[23/17] max-h-[620px] bg-slate-950 border-x border-b border-slate-800 rounded-b-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        
        <canvas
          ref={canvasRef}
          width={VIEW_COLS * TILE_SIZE}
          height={VIEW_ROWS * TILE_SIZE}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* INTERACTION POPUP */}
        {nearbyPrompt && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-amber-500 text-slate-100 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce z-10 backdrop-blur-md">
            <div>
              <div className="text-xs text-amber-400 font-semibold">{nearbyPrompt.name}</div>
              <div className="text-sm font-bold">{nearbyPrompt.actionText}</div>
            </div>
            <button
              onClick={() => executeInteraction(nearbyPrompt)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Interact [Space]
            </button>
          </div>
        )}

        {/* CONTROLS OVERLAY */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800/80 rounded-lg px-3 py-2 text-[11px] text-slate-400 backdrop-blur-sm pointer-events-none hidden sm:block">
          <div><strong className="text-slate-200">Move:</strong> WASD / Arrow Keys or Click Map</div>
          <div><strong className="text-slate-200">Mode:</strong> {isPlayerInBoat ? '⛵ Sailing on Water' : '🚶 Walking on Land'}</div>
          <div><strong className="text-slate-200">Coords:</strong> ({playerPos.x}, {playerPos.y})</div>
        </div>

        {/* HIGH-FIDELITY INTERACTIVE MINI MAP (Gurk III Feature) */}
        <div className="absolute top-4 right-4 bg-slate-950/95 border border-slate-700/80 rounded-xl p-2.5 backdrop-blur-md shadow-2xl z-20">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-cinzel">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Mini Map
            </span>
            <span className="font-mono-numbers text-amber-300">{playerPos.x},{playerPos.y}</span>
          </div>

          {/* Real-time Miniature Map Canvas */}
          <div className="w-36 h-28 bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden shadow-inner">
            <canvas
              ref={minimapCanvasRef}
              width={144}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 font-mono-numbers">
            <span>{isPlayerInBoat ? '⛵ Water' : '🌲 Land'}</span>
            <span className="text-amber-400 capitalize">{weather}</span>
          </div>
        </div>

        {/* FULL ATLAS OVERLAY VIEW (Press M / Click Full Map) */}
        {showFullMap && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 p-6 flex flex-col backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-cinzel text-slate-100">
                  Full Charted Atlas: {currentZone.name} ({currentZone.width} × {currentZone.height})
                </h3>
              </div>
              <button
                onClick={() => setShowFullMap(false)}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Close Atlas
              </button>
            </div>

            <div className="flex-1 mt-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
              <div 
                className="relative bg-slate-950 border border-slate-800 rounded-lg shadow-inner overflow-hidden"
                style={{ width: `${currentZone.width * 6}px`, height: `${currentZone.height * 6}px`, maxWidth: '100%', maxHeight: '100%' }}
              >
                {/* Portals */}
                {currentZone.portals.map((p, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-sky-400 shadow-sm"
                    style={{ left: `${(p.x / currentZone.width) * 100}%`, top: `${(p.y / currentZone.height) * 100}%` }}
                    title={p.name}
                  />
                ))}
                {/* Player blip */}
                <div
                  className={`absolute w-3.5 h-3.5 rounded-full border border-white shadow-lg -translate-x-1/2 -translate-y-1/2 animate-bounce flex items-center justify-center text-[8px] ${
                    isPlayerInBoat ? 'bg-sky-400' : 'bg-emerald-400'
                  }`}
                  style={{ left: `${(playerPos.x / currentZone.width) * 100}%`, top: `${(playerPos.y / currentZone.height) * 100}%` }}
                >
                  {isPlayerInBoat ? '⛵' : '●'}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-slate-400">
              {isPlayerInBoat ? '⛵ Sailing on Lake/River' : '● Walking on Land'} · Blue Dots = Cave/Castle Entrances · WASD to navigate
            </div>
          </div>
        )}

        {/* MOBILE VIRTUAL D-PAD */}
        <div className="absolute bottom-4 left-4 grid grid-cols-3 gap-1 md:hidden bg-slate-950/80 p-2 rounded-xl border border-slate-800">
          <div />
          <button
            onClick={() => handleMove(0, -1)}
            className="w-10 h-10 bg-slate-900 text-slate-200 font-bold rounded-lg border border-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-sm"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => handleMove(-1, 0)}
            className="w-10 h-10 bg-slate-900 text-slate-200 font-bold rounded-lg border border-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-sm"
          >
            ◀
          </button>
          <button
            onClick={() => nearbyPrompt && executeInteraction(nearbyPrompt)}
            className="w-10 h-10 bg-amber-500 text-slate-950 font-bold rounded-lg active:bg-amber-600 flex items-center justify-center text-xs"
          >
            ACT
          </button>
          <button
            onClick={() => handleMove(1, 0)}
            className="w-10 h-10 bg-slate-900 text-slate-200 font-bold rounded-lg border border-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-sm"
          >
            ▶
          </button>
          <div />
          <button
            onClick={() => handleMove(0, 1)}
            className="w-10 h-10 bg-slate-900 text-slate-200 font-bold rounded-lg border border-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-sm"
          >
            ▼
          </button>
          <div />
        </div>

      </div>

    </div>
  );
};
