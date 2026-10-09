async function inspectChunk() {
  const res = await fetch('https://lagoslife.app/_next/static/chunks/098d27pds3xtc.js');
  const text = await res.text();
  const idx = text.indexOf("Couldn't load the game");
  if (idx !== -1) {
    console.log("=== CONTEXT OF COULDNT LOAD THE GAME ===");
    console.log(text.slice(Math.max(0, idx - 400), idx + 600));
  } else {
    console.log("Not in 098d27pds3xtc.js");
  }

  const idx2 = text.indexOf("Reconnecting to Lagos");
  if (idx2 !== -1) {
    console.log("=== CONTEXT OF RECONNECTING TO LAGOS ===");
    console.log(text.slice(Math.max(0, idx2 - 400), idx2 + 600));
  }
}
inspectChunk();
