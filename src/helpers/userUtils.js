// Dungeon visualization feature for digital garden with BSP dungeon generation
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

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

// BSP (Binary Space Partitioning) algorithm for dungeon generation
function generateBSPDungeon(width, height, minRoomSize = 3, maxDepth = 5) {
  // Initialize grid with all cells as non-dungeon (0)
  let grid = Array(height).fill().map(() => Array(width).fill(0));
  
  // Recursive function to split spaces
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
  
  // Function to create a corridor between two points
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

function dungeonData(data) {
  const itemCounts = JSON.parse(JSON.stringify(noteLabels));
  const dungeonItems = data.collections.note.map((n) => {
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
  });
  
  // Generate a larger dungeon grid using BSP
  const gridSize = Math.max(20, Math.ceil(Math.sqrt(dungeonItems.length) * 2)); // Larger grid
  const dungeonGrid = generateBSPDungeon(gridSize, gridSize);
  
  let legends = Object.values(itemCounts).filter((c) => c.count > 0);
  legends.sort((a, b) => b.count - a.count);
  
  return {
    dungeonGrid: dungeonGrid,
    legends,
  };
}

function userComputed(data) {
  return {
    dungeon: dungeonData(data),
  };
}

exports.userComputed = userComputed;

