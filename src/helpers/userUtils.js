// Dungeon visualization feature for digital garden with BSP dungeon generation
/**
 * Shuffles an array in place using the Fisher-Yates algorithm
 * @param {Array} a - The array to shuffle
 * @returns {Array} - The shuffled array (same reference as input)
 */
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

/**
 * Splits an array into chunks of the specified size
 * @param {Array} arr - The array to split
 * @param {number} chunkSize - The size of each chunk
 * @returns {Array} - Array of chunks
 */
function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

/**
 * Generates a dungeon grid using Binary Space Partitioning (BSP) algorithm
 * BSP recursively divides the space into smaller sections and creates rooms within them
 * 
 * @param {number} width - Width of the dungeon grid
 * @param {number} height - Height of the dungeon grid
 * @param {number} minRoomSize - Minimum size of rooms (default: 3)
 * @param {number} maxDepth - Maximum recursion depth (default: 5)
 * @returns {Array<Array<number>>} - 2D grid where 1 represents dungeon cells and 0 represents walls
 */
function generateBSPDungeon(width, height, minRoomSize = 3, maxDepth = 5) {
  // Initialize grid with all cells as non-dungeon (0)
  let grid = Array(height).fill().map(() => Array(width).fill(0));
  
  /**
   * Recursively splits a space and creates rooms
   * @param {number} x - X coordinate of the space
   * @param {number} y - Y coordinate of the space
   * @param {number} w - Width of the space
   * @param {number} h - Height of the space
   * @param {number} depth - Current recursion depth
   * @returns {Object} - Room information including position and center
   */
  function splitSpace(x, y, w, h, depth) {
    // Stop recursion if we've reached max depth or the space is too small
    if (depth >= maxDepth || w <= minRoomSize * 2 || h <= minRoomSize * 2) {
      // Create a room in this space
      const roomWidth = Math.max(Math.floor(w * 0.7), minRoomSize);
      const roomHeight = Math.max(Math.floor(h * 0.7), minRoomSize);
      const roomX = x + Math.floor((w - roomWidth) / 2);
      const roomY = y + Math.floor((h - roomHeight) / 2);
      
      // Mark room cells as dungeon (1)
      for (let i = roomY; i < roomY + roomHeight; i++) {
        for (let j = roomX; j < roomX + roomWidth; j++) {
          if (i >= 0 && i < height && j >= 0 && j < width) {
            grid[i][j] = 1;
          }
        }
      }
      
      return {
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
        centerX: roomX + Math.floor(roomWidth / 2),
        centerY: roomY + Math.floor(roomHeight / 2)
      };
    }
    
    // Decide whether to split horizontally or vertically
    const splitHorizontally = Math.random() > 0.5;
    
    if (splitHorizontally) {
      // Split horizontally
      const splitPoint = Math.floor(h / 2) + Math.floor(Math.random() * (h / 4)) - Math.floor(h / 8);
      const room1 = splitSpace(x, y, w, splitPoint, depth + 1);
      const room2 = splitSpace(x, y + splitPoint, w, h - splitPoint, depth + 1);
      
      // Connect rooms with a corridor
      createCorridor(room1.centerX, room1.centerY, room2.centerX, room2.centerY);
      
      return {
        x: x,
        y: y,
        width: w,
        height: h,
        centerX: Math.floor((room1.centerX + room2.centerX) / 2),
        centerY: Math.floor((room1.centerY + room2.centerY) / 2)
      };
    } else {
      // Split vertically
      const splitPoint = Math.floor(w / 2) + Math.floor(Math.random() * (w / 4)) - Math.floor(w / 8);
      const room1 = splitSpace(x, y, splitPoint, h, depth + 1);
      const room2 = splitSpace(x + splitPoint, y, w - splitPoint, h, depth + 1);
      
      // Connect rooms with a corridor
      createCorridor(room1.centerX, room1.centerY, room2.centerX, room2.centerY);
      
      return {
        x: x,
        y: y,
        width: w,
        height: h,
        centerX: Math.floor((room1.centerX + room2.centerX) / 2),
        centerY: Math.floor((room1.centerY + room2.centerY) / 2)
      };
    }
  }
  
  /**
   * Creates a corridor between two points in the dungeon
   * @param {number} x1 - Starting X coordinate
   * @param {number} y1 - Starting Y coordinate
   * @param {number} x2 - Ending X coordinate
   * @param {number} y2 - Ending Y coordinate
   */
  function createCorridor(x1, y1, x2, y2) {
    // First go horizontally, then vertically
    let currentX = x1;
    let currentY = y1;
    
    // Horizontal corridor
    while (currentX !== x2) {
      if (currentX < x2) currentX++;
      else currentX--;
      
      if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
        grid[currentY][currentX] = 1;
      }
    }
    
    // Vertical corridor
    while (currentY !== y2) {
      if (currentY < y2) currentY++;
      else currentY--;
      
      if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
        grid[currentY][currentX] = 1;
      }
    }
  }
  
  // Start the recursive splitting
  splitSpace(0, 0, width, height, 0);
  
  return grid;
}

/**
 * Defines the types of notes and their visual representation in the dungeon
 */
const noteLabels = {
  "tree-1": { label: "Scroll", count: 0, icon: "tree-1" },
  "tree-2": { label: "Tome", count: 0, icon: "tree-2" },
  "tree-3": { label: "Grimoire", count: 0, icon: "tree-3" },
  withered: {
    label: "Ruin",
    plural: "Ruins",
    count: 0,
    icon: "withered",
  },
  signpost: { label: "Signpost", count: 0, icon: "signpost" },
  stone: { label: "Artifact", count: 0, icon: "stone" },
  chest: { label: "Treasure", count: 0, icon: "chest" }
};

/**
 * Finds all valid dungeon cells (cells with value 1) in the grid
 * @param {Array<Array<number>>} dungeonGrid - 2D grid representing the dungeon
 * @returns {Array<{x: number, y: number}>} - Array of cell coordinates
 */
function findDungeonCells(dungeonGrid) {
  const dungeonCells = [];
  for (let y = 0; y < dungeonGrid.length; y++) {
    for (let x = 0; x < dungeonGrid[y].length; x++) {
      if (dungeonGrid[y][x] === 1) {
        dungeonCells.push({ x, y });
      }
    }
  }
  return dungeonCells;
}

/**
 * Distributes icons randomly among dungeon cells
 * @param {Array} dungeonItems - Array of items to place in the dungeon
 * @param {Array<{x: number, y: number}>} dungeonCells - Array of valid cell coordinates
 * @returns {Object} - Map of cell coordinates to icons
 */
function distributeIconsInDungeon(dungeonItems, dungeonCells) {
  // Shuffle the dungeon cells to randomize icon placement
  const shuffledCells = shuffle([...dungeonCells]);
  
  // Create an object to store icon positions (using an object instead of Map for template compatibility)
  const iconPositions = {};
  
  // Check if we have any items to place
  if (!dungeonItems || dungeonItems.length === 0) {
    return iconPositions;
  }
  
  // Determine how many icons we can place (minimum of icons or available cells)
  const itemCount = Math.min(dungeonItems.length, shuffledCells.length);
  
  // Assign positions to icons
  for (let i = 0; i < itemCount; i++) {
    const cell = shuffledCells[i];
    // Use the cell coordinates as the key in the format "y-x"
    const key = `${cell.y}-${cell.x}`;
    iconPositions[key] = dungeonItems[i];
  }
  
  return iconPositions;
}

/**
 * Generates the dungeon data including grid, icons, and legend
 * @param {Object} data - The site data object
 * @returns {Object} - Dungeon visualization data
 */
function dungeonData(data) {
  const itemCounts = JSON.parse(JSON.stringify(noteLabels));
  const dungeonItems = data.collections.note ? data.collections.note.map((n) => {
    let v = parseInt(n.data.noteIcon);
    let height = 2;
    if (!v) {
      v = n.data.noteIcon || "tree-1"; // Default to tree-1 if no icon specified
    } else {
      height = v;
      v = `tree-${v}`;
    }
    itemCounts[v] ? itemCounts[v].count++ : null;
    return [v, n.url, n.data.title || n.fileSlug, height];
  }) : [];
  
  // Generate a larger dungeon grid using BSP
  const gridSize = Math.max(20, Math.ceil(Math.sqrt(dungeonItems.length || 1) * 2)); // Larger grid
  const dungeonGrid = generateBSPDungeon(gridSize, gridSize);
  
  // Find all dungeon cells
  const dungeonCells = findDungeonCells(dungeonGrid);
  
  // Distribute icons among dungeon cells
  const iconPositions = distributeIconsInDungeon(dungeonItems, dungeonCells);
  
  // Convert iconPositions to an array for easier template iteration
  const iconPositionsArray = Object.keys(iconPositions).map(key => {
    const [y, x] = key.split('-').map(Number);
    return {
      y: y,
      x: x,
      icon: iconPositions[key]
    };
  });
  
  // Sort legends by count (most frequent first)
  let legends = Object.values(itemCounts).filter((c) => c.count > 0);
  legends.sort((a, b) => b.count - a.count);
  
  // Create a modified grid with icons embedded
  const gridWithIcons = JSON.parse(JSON.stringify(dungeonGrid));
  iconPositionsArray.forEach(pos => {
    if (gridWithIcons[pos.y] && gridWithIcons[pos.y][pos.x] === 1) {
      gridWithIcons[pos.y][pos.x] = {
        isDungeon: true,
        icon: pos.icon
      };
    }
  });
  
  // Convert remaining dungeon cells (with value 1) to objects
  for (let y = 0; y < gridWithIcons.length; y++) {
    for (let x = 0; x < gridWithIcons[y].length; x++) {
      if (gridWithIcons[y][x] === 1) {
        gridWithIcons[y][x] = {
          isDungeon: true,
          icon: null
        };
      } else if (gridWithIcons[y][x] === 0) {
        gridWithIcons[y][x] = {
          isDungeon: false,
          icon: null
        };
      }
    }
  }
  
  return {
    dungeonGrid: dungeonGrid,
    gridWithIcons: gridWithIcons,
    iconPositions: iconPositions,
    iconPositionsArray: iconPositionsArray,
    dungeonItems: dungeonItems,
    legends,
  };
}

/**
 * Computes user-specific data for the site
 * @param {Object} data - The site data object
 * @returns {Object} - Computed user data
 */
function userComputed(data) {
  return {
    dungeon: dungeonData(data),
  };
}

exports.userComputed = userComputed;
