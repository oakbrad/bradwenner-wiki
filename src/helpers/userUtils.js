// Dungeon visualization feature for digital garden
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

function getPositions(items) {
  let minInRow = Math.floor(Math.sqrt(items.length));
  let maxInRow = Math.ceil(Math.sqrt(items.length));
  if (minInRow < maxInRow) {
    items = items.concat(
      Array(Math.pow(maxInRow, 2) - items.length).fill([0, "", ""])
    );
  }
  items = shuffle([...items]);
  let levels = sliceIntoChunks(items, maxInRow);
  return levels;
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
  let legends = Object.values(itemCounts).filter((c) => c.count > 0);
  legends.sort((a, b) => b.count - a.count);
  return {
    items: getPositions(dungeonItems),
    legends,
  };
}

function userComputed(data) {
  return {
    dungeon: dungeonData(data),
  };
}

exports.userComputed = userComputed;

