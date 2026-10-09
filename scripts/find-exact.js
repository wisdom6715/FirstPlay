async function findExact() {
  const chunks = [
    '/_next/static/chunks/098d27pds3xtc.js',
    '/_next/static/chunks/29isdv0uvinhq.js',
    '/_next/static/chunks/1846y_c3hp91u.js',
    '/_next/static/chunks/25h4kfs965x85.js',
    '/_next/static/chunks/2kb9zmi6ppapp.js',
    '/_next/static/chunks/38g0rdi_e035x.js',
    '/_next/static/chunks/1zvyndef4tv2p.js'
  ];
  for (const c of chunks) {
    const text = await fetch('https://lagoslife.app' + c).then(r => r.text());
    if (text.includes("Couldn't load the game")) {
      console.log("MATCH 1 in", c);
      const idx = text.indexOf("Couldn't load the game");
      console.log(text.slice(Math.max(0, idx - 500), idx + 500));
    }
    if (text.includes("Reconnecting to Lagos")) {
      console.log("MATCH 2 in", c);
      const idx = text.indexOf("Reconnecting to Lagos");
      console.log(text.slice(Math.max(0, idx - 500), idx + 500));
    }
  }
}
findExact();
