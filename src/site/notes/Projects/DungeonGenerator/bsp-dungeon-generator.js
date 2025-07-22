/**
 * BSP Dungeon Generator
 * 
 * This script implements a Binary Space Partitioning (BSP) algorithm
 * to generate D&D-style dungeon layouts with rooms connected by hallways.
 */

class BSPDungeon {
  constructor(width, height, minRoomSize = 3, maxRoomSize = null, minSplitSize = 8, maxIterations = 10) {
    this.width = width;
    this.height = height;
    this.minRoomSize = minRoomSize;
    this.maxRoomSize = maxRoomSize || Math.floor(Math.min(width, height) / 3);
    this.minSplitSize = minSplitSize;
    this.maxIterations = maxIterations;
    this.map = Array(height).fill().map(() => Array(width).fill('#')); // # = wall
    this.rooms = [];
    this.corridors = [];
    this.doors = [];
  }

  generate() {
    // Start with the entire dungeon as one region
    const regions = [{ x: 0, y: 0, width: this.width, height: this.height }];
    
    // Split regions recursively
    for (let i = 0; i < this.maxIterations; i++) {
      if (regions.length === 0) break;
      
      // Get a region to split
      const regionIndex = Math.floor(Math.random() * regions.length);
      const region = regions[regionIndex];
      regions.splice(regionIndex, 1);
      
      // Try to split the region
      if (this.splitRegion(region, regions)) {
        // Region was split, continue
      } else {
        // Region was too small to split, place a room
        this.createRoom(region);
      }
    }
    
    // Create remaining rooms
    regions.forEach(region => this.createRoom(region));
    
    // Connect rooms with corridors
    this.connectRooms();
    
    // Add doors where corridors meet rooms
    this.addDoors();
    
    return this.map;
  }
  
  splitRegion(region, regions) {
    // Decide split direction (horizontal or vertical)
    // If region is wider than tall, prefer vertical split
    // If region is taller than wide, prefer horizontal split
    let splitHorizontally;
    if (region.width > region.height * 1.25) {
      splitHorizontally = false; // vertical split for wide regions
    } else if (region.height > region.width * 1.25) {
      splitHorizontally = true; // horizontal split for tall regions
    } else {
      splitHorizontally = Math.random() > 0.5; // random otherwise
    }
    
    // Check if region is too small to split
    if (splitHorizontally) {
      if (region.height < this.minSplitSize * 2) {
        return false;
      }
    } else {
      if (region.width < this.minSplitSize * 2) {
        return false;
      }
    }
    
    // Determine split position (with some randomness)
    let splitPos;
    if (splitHorizontally) {
      // Ensure each sub-region has at least minSplitSize height
      const minY = region.y + this.minSplitSize;
      const maxY = region.y + region.height - this.minSplitSize;
      
      if (minY >= maxY) return false;
      
      // Random position between min and max
      splitPos = minY + Math.floor(Math.random() * (maxY - minY));
      
      // Create two new regions
      regions.push({
        x: region.x,
        y: region.y,
        width: region.width,
        height: splitPos - region.y
      });
      
      regions.push({
        x: region.x,
        y: splitPos,
        width: region.width,
        height: region.y + region.height - splitPos
      });
    } else {
      // Ensure each sub-region has at least minSplitSize width
      const minX = region.x + this.minSplitSize;
      const maxX = region.x + region.width - this.minSplitSize;
      
      if (minX >= maxX) return false;
      
      // Random position between min and max
      splitPos = minX + Math.floor(Math.random() * (maxX - minX));
      
      // Create two new regions
      regions.push({
        x: region.x,
        y: region.y,
        width: splitPos - region.x,
        height: region.height
      });
      
      regions.push({
        x: splitPos,
        y: region.y,
        width: region.x + region.width - splitPos,
        height: region.height
      });
    }
    
    return true;
  }
  
  createRoom(region) {
    // Create a room of random size within the region
    // But ensure it's not too small or too large
    const minWidth = Math.min(this.minRoomSize, region.width - 2);
    const minHeight = Math.min(this.minRoomSize, region.height - 2);
    
    const maxWidth = Math.min(this.maxRoomSize, region.width - 2);
    const maxHeight = Math.min(this.maxRoomSize, region.height - 2);
    
    // If region is too small for a proper room, skip it
    if (maxWidth < minWidth || maxHeight < minHeight) {
      return;
    }
    
    const roomWidth = minWidth + Math.floor(Math.random() * (maxWidth - minWidth + 1));
    const roomHeight = minHeight + Math.floor(Math.random() * (maxHeight - minHeight + 1));
    
    // Position the room randomly within the region, but not at the very edge
    const roomX = region.x + 1 + Math.floor((region.width - roomWidth - 2) * Math.random());
    const roomY = region.y + 1 + Math.floor((region.height - roomHeight - 2) * Math.random());
    
    // Add room to list
    const room = {
      x: roomX,
      y: roomY,
      width: roomWidth,
      height: roomHeight,
      centerX: roomX + Math.floor(roomWidth / 2),
      centerY: roomY + Math.floor(roomHeight / 2),
      region: region
    };
    this.rooms.push(room);
    
    // Carve out the room in the map
    for (let y = roomY; y < roomY + roomHeight; y++) {
      for (let x = roomX; x < roomX + roomWidth; x++) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          this.map[y][x] = '.'; // . = floor
        }
      }
    }
  }
  
  connectRooms() {
    // If we have no rooms, we can't connect anything
    if (this.rooms.length <= 1) return;
    
    // Create a list of all rooms that need to be connected
    const roomsToConnect = [...this.rooms];
    const connectedRooms = [roomsToConnect.pop()]; // Start with one room
    
    // Connect each room to the closest room that's already connected
    while (roomsToConnect.length > 0) {
      let closestDistance = Infinity;
      let closestPair = null;
      
      // Find the closest pair of rooms (one connected, one not)
      for (const roomA of connectedRooms) {
        for (const roomB of roomsToConnect) {
          const distance = this.getDistance(roomA, roomB);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestPair = [roomA, roomB];
          }
        }
      }
      
      // Connect the closest pair
      if (closestPair) {
        this.createCorridor(closestPair[0], closestPair[1]);
        connectedRooms.push(closestPair[1]);
        roomsToConnect.splice(roomsToConnect.indexOf(closestPair[1]), 1);
      } else {
        // If we can't find a pair to connect, break out
        break;
      }
    }
    
    // Add some extra corridors for loops (about 15% of the number of rooms)
    const extraCorridors = Math.max(1, Math.floor(this.rooms.length * 0.15));
    for (let i = 0; i < extraCorridors; i++) {
      const roomA = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const roomB = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      
      // Don't connect a room to itself
      if (roomA !== roomB) {
        this.createCorridor(roomA, roomB);
      }
    }
  }
  
  getDistance(roomA, roomB) {
    // Manhattan distance between room centers
    return Math.abs(roomA.centerX - roomB.centerX) + Math.abs(roomA.centerY - roomB.centerY);
  }
  
  createCorridor(roomA, roomB) {
    // Create an L-shaped corridor between room centers
    const startX = roomA.centerX;
    const startY = roomA.centerY;
    const endX = roomB.centerX;
    const endY = roomB.centerY;
    
    // Decide whether to go horizontal first or vertical first
    const horizontalFirst = Math.random() > 0.5;
    
    if (horizontalFirst) {
      // First horizontal, then vertical
      this.drawHorizontalCorridor(startX, endX, startY);
      this.drawVerticalCorridor(startY, endY, endX);
    } else {
      // First vertical, then horizontal
      this.drawVerticalCorridor(startY, endY, startX);
      this.drawHorizontalCorridor(startX, endX, endY);
    }
    
    // Add this corridor to the list
    this.corridors.push({
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      horizontalFirst: horizontalFirst
    });
  }
  
  drawHorizontalCorridor(x1, x2, y) {
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    
    for (let x = startX; x <= endX; x++) {
      if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
        this.map[y][x] = '.';
      }
    }
  }
  
  drawVerticalCorridor(y1, y2, x) {
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);
    
    for (let y = startY; y <= endY; y++) {
      if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
        this.map[y][x] = '.';
      }
    }
  }
  
  addDoors() {
    // Find potential door locations (where corridors meet rooms)
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        // If this is a floor tile
        if (this.map[y][x] === '.') {
          // Check if it's a potential door location
          if (this.isPotentialDoor(x, y)) {
            this.map[y][x] = '+'; // + = door
            this.doors.push({ x, y });
          }
        }
      }
    }
  }
  
  isPotentialDoor(x, y) {
    // A potential door location is where a corridor meets a room
    // This is a simplification - we're looking for floor tiles with walls on opposite sides
    
    // Check horizontal doorway (walls above and below)
    if (this.map[y-1][x] === '#' && this.map[y+1][x] === '#' && 
        this.map[y][x-1] === '.' && this.map[y][x+1] === '.') {
      return true;
    }
    
    // Check vertical doorway (walls to left and right)
    if (this.map[y][x-1] === '#' && this.map[y][x+1] === '#' && 
        this.map[y-1][x] === '.' && this.map[y+1][x] === '.') {
      return true;
    }
    
    return false;
  }
  
  // Helper to print the dungeon as ASCII
  printDungeon() {
    return this.map.map(row => row.join('')).join('\n');
  }
  
  // Helper to get the dungeon as HTML
  getDungeonHTML(cellSize = 20) {
    let html = `<div style="font-family: monospace; line-height: 1; letter-spacing: ${cellSize/2}px">`;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.map[y][x];
        let cellChar = cell;
        let cellColor = '';
        
        switch (cell) {
          case '#': // Wall
            cellColor = 'background-color: #666; color: #666;';
            break;
          case '.': // Floor
            cellColor = 'background-color: #fff; color: #fff;';
            break;
          case '+': // Door
            cellColor = 'background-color: #a52; color: #a52;';
            break;
          default:
            cellColor = '';
        }
        
        html += `<span style="display: inline-block; width: ${cellSize}px; height: ${cellSize}px; ${cellColor}">${cellChar}</span>`;
      }
      html += '<br>';
    }
    
    html += '</div>';
    return html;
  }
  
  // Helper to get the dungeon as SVG
  getDungeonSVG(cellSize = 10) {
    const width = this.width * cellSize;
    const height = this.height * cellSize;
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svg += `<rect width="${width}" height="${height}" fill="#000" />`;
    
    // Draw cells
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.map[y][x];
        let cellColor = '';
        
        switch (cell) {
          case '#': // Wall
            cellColor = '#666';
            break;
          case '.': // Floor
            cellColor = '#fff';
            break;
          case '+': // Door
            cellColor = '#a52';
            break;
          default:
            continue; // Skip unknown cells
        }
        
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${cellColor}" />`;
      }
    }
    
    svg += '</svg>';
    return svg;
  }
}

// Example usage:
// const dungeon = new BSPDungeon(50, 30, 3, 8, 8, 10);
// dungeon.generate();
// console.log(dungeon.printDungeon());
// document.body.innerHTML = dungeon.getDungeonHTML();
// document.body.innerHTML = dungeon.getDungeonSVG();

