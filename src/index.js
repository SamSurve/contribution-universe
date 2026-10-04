import fs from 'fs/promises';
import { fetchContributions } from './fetcher.js';
import { renderGalaxyTheme } from './themes/galaxy.js';

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is missing in environment variables.");
  }
  
  const userName = "SamSurve";
  console.log(`Fetching contribution data for ${userName}...`);
  const calendarData = await fetchContributions(userName, token);
  
  console.log("Generating galaxy theme SVG...");
  const svgContent = renderGalaxyTheme(calendarData);
  
  await fs.writeFile("universe.svg", svgContent, "utf8");
  console.log("Successfully generated universe.svg!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
