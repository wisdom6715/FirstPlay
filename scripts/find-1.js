async function find1() {
  const page = await fetch('https://lagoslife.app').then(r => r.text());
  const scriptSrcs = [...page.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
  for (const src of scriptSrcs) {
    const text = await fetch('https://lagoslife.app' + src).then(r => r.text());
    if (text.includes("interfering with the page") || text.includes("privacy blocker") || text.includes("Disable your extensions")) {
      console.log("MATCH 1 found in:", src);
      const idx = text.indexOf("interfering with the page");
      console.log(text.slice(Math.max(0, idx - 400), idx + 600));
      return;
    }
  }
}
find1();
