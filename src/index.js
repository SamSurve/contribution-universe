import fs from 'fs/promises';
import { fetchContributions } from './fetcher.js';
import { renderSakuraTheme } from './themes/sakura.js';

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is missing in environment variables.');

  const userName = process.env.GITHUB_USERNAME || 'SamSurve';
  const year = process.env.CONTRIBUTION_YEAR || null;

  console.log(`Fetching contribution data for ${userName}${year ? ` for ${year}` : ' (rolling GitHub calendar)'}...`);
  const calendarData = await fetchContributions(userName, token, year);

  console.log('Generating live Sakura contribution universe SVG...');
  const svgContent = renderSakuraTheme(calendarData);

  await fs.writeFile('universe.svg', svgContent, 'utf8');
  console.log('Successfully generated universe.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
