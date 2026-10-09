async function findSite() {
  const sites = [
    'https://deadshot.io',
    'https://smashkarts.io',
    'https://shellshock.io',
    'https://play2048.co',
    'https://slither.io',
    'https://krunker.io',
    'https://ev.io',
    'https://slopegame.online',
    'https://paper-io.com',
    'https://subwaysurfers.online',
    'https://venge.io'
  ];
  for (const s of sites) {
    try {
      const html = await fetch(s).then(r => r.text());
      if (html.includes("Couldn't load the game") || html.includes("interfering with the page") || html.includes("privacy blocker")) {
        console.log("MATCH SITE HTML:", s);
      }
      // search scripts on the site
      const scripts = [...html.matchAll(/src="([^"]+\.js[^"]*)"/g)].map(m => m[1]);
      for (const sc of scripts.slice(0, 10)) {
        const u = sc.startsWith('http') ? sc : new URL(sc, s).href;
        try {
          const t = await fetch(u).then(r => r.text());
          if (t.includes("Couldn't load the game") || t.includes("interfering with the page")) {
            console.log("MATCH SITE SCRIPT:", s, u);
          }
        } catch(e){}
      }
    } catch(e){}
  }
  console.log("Search complete.");
}
findSite();
