async function run() {
  const page = await fetch('https://lagoslife.app').then(r => r.text());
  const scriptSrcs = [...page.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
  for (const src of scriptSrcs) {
    const full = 'https://lagoslife.app' + src;
    try {
      const text = await fetch(full).then(r => r.text());
      if (text.includes("Couldn't load") || text.includes("interfering with the page") || text.includes("Reconnecting to Lagos")) {
        console.log("MATCH in LagosLife chunk:", src);
      }
    } catch(e){}
  }
  console.log("Done searching LagosLife chunks.");
}
run();
