---
title: D&D Dungeon Generator
---

# D&D Dungeon Generator

This tool generates procedural D&D-style dungeon layouts with rooms connected by hallways using the Binary Space Partitioning (BSP) algorithm.

<div id="controls">
  <div style="margin-bottom: 10px;">
    <label for="width">Width:</label>
    <input type="number" id="width" value="50" min="10" max="100" style="width: 60px;">
    
    <label for="height">Height:</label>
    <input type="number" id="height" value="30" min="10" max="100" style="width: 60px;">
  </div>
  
  <div style="margin-bottom: 10px;">
    <label for="minRoomSize">Min Room Size:</label>
    <input type="number" id="minRoomSize" value="3" min="2" max="10" style="width: 60px;">
    
    <label for="maxRoomSize">Max Room Size:</label>
    <input type="number" id="maxRoomSize" value="8" min="3" max="20" style="width: 60px;">
  </div>
  
  <div style="margin-bottom: 10px;">
    <label for="minSplitSize">Min Split Size:</label>
    <input type="number" id="minSplitSize" value="8" min="5" max="20" style="width: 60px;">
    
    <label for="maxIterations">Max Iterations:</label>
    <input type="number" id="maxIterations" value="10" min="5" max="50" style="width: 60px;">
  </div>
  
  <div style="margin-bottom: 10px;">
    <label for="displayMode">Display Mode:</label>
    <select id="displayMode">
      <option value="svg">SVG (Vector)</option>
      <option value="html">HTML (Grid)</option>
      <option value="ascii">ASCII (Text)</option>
    </select>
    
    <label for="cellSize">Cell Size:</label>
    <input type="number" id="cellSize" value="10" min="5" max="30" style="width: 60px;">
  </div>
  
  <button id="generateBtn" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; cursor: pointer; margin-right: 10px;">Generate Dungeon</button>
  <button id="downloadBtn" style="padding: 8px 16px; background-color: #008CBA; color: white; border: none; cursor: pointer;">Download</button>
</div>

<div id="dungeonOutput" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; overflow: auto; max-height: 600px;"></div>

<script src="bsp-dungeon-generator.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const dungeonOutput = document.getElementById('dungeonOutput');
  
  let currentDungeon = null;
  
  generateBtn.addEventListener('click', function() {
    const width = parseInt(document.getElementById('width').value);
    const height = parseInt(document.getElementById('height').value);
    const minRoomSize = parseInt(document.getElementById('minRoomSize').value);
    const maxRoomSize = parseInt(document.getElementById('maxRoomSize').value);
    const minSplitSize = parseInt(document.getElementById('minSplitSize').value);
    const maxIterations = parseInt(document.getElementById('maxIterations').value);
    const displayMode = document.getElementById('displayMode').value;
    const cellSize = parseInt(document.getElementById('cellSize').value);
    
    // Create and generate the dungeon
    currentDungeon = new BSPDungeon(width, height, minRoomSize, maxRoomSize, minSplitSize, maxIterations);
    currentDungeon.generate();
    
    // Display the dungeon based on selected mode
    if (displayMode === 'svg') {
      dungeonOutput.innerHTML = currentDungeon.getDungeonSVG(cellSize);
    } else if (displayMode === 'html') {
      dungeonOutput.innerHTML = currentDungeon.getDungeonHTML(cellSize);
    } else if (displayMode === 'ascii') {
      dungeonOutput.innerHTML = `<pre>${currentDungeon.printDungeon()}</pre>`;
    }
  });
  
  downloadBtn.addEventListener('click', function() {
    if (!currentDungeon) {
      alert('Please generate a dungeon first!');
      return;
    }
    
    const displayMode = document.getElementById('displayMode').value;
    let content = '';
    let filename = 'dungeon';
    let type = '';
    
    if (displayMode === 'svg') {
      content = currentDungeon.getDungeonSVG(parseInt(document.getElementById('cellSize').value));
      filename += '.svg';
      type = 'image/svg+xml';
    } else if (displayMode === 'html') {
      content = `<!DOCTYPE html><html><head><title>Dungeon</title></head><body>${currentDungeon.getDungeonHTML(parseInt(document.getElementById('cellSize').value))}</body></html>`;
      filename += '.html';
      type = 'text/html';
    } else if (displayMode === 'ascii') {
      content = currentDungeon.printDungeon();
      filename += '.txt';
      type = 'text/plain';
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  });
  
  // Generate a dungeon on page load
  generateBtn.click();
});
</script>

## How It Works

This dungeon generator uses the Binary Space Partitioning (BSP) algorithm to create D&D-style dungeon layouts. Here's how it works:

1. **Binary Space Partitioning**: The algorithm starts with a rectangular area and recursively divides it into smaller sections, either horizontally or vertically.

2. **Room Placement**: Within each leaf section, a room of random size is placed.

3. **Corridor Generation**: Rooms are connected with L-shaped corridors to ensure the dungeon is fully traversable.

4. **Door Placement**: Doors are added where corridors meet rooms.

## Legend

- `#` - Wall
- `.` - Floor
- `+` - Door

## Customization Options

- **Width/Height**: The overall dimensions of the dungeon.
- **Min/Max Room Size**: Controls the size range of generated rooms.
- **Min Split Size**: Minimum size of a region that can be split further.
- **Max Iterations**: Controls how many times the algorithm will attempt to split regions.
- **Display Mode**: Choose between SVG (vector graphics), HTML (grid), or ASCII (text) representation.
- **Cell Size**: Controls the size of each cell in the visual display.

## Using the Generated Dungeons

These procedurally generated dungeons can be used for:

- D&D campaign planning
- Inspiration for dungeon layouts
- Random encounter maps
- One-shot adventures

You can download the generated dungeon in your preferred format and use it in your game preparations.

## Technical Details

The generator uses a JavaScript implementation of the BSP algorithm. The code is available in the `bsp-dungeon-generator.js` file if you want to examine or modify it.

The algorithm ensures that:
- Rooms don't overlap
- All rooms are connected
- The dungeon has a coherent layout with distinct rooms and corridors

