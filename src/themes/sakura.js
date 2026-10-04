export function renderSakuraTheme(calendarData) {
  const { weeks } = calendarData;
  
  // Find max contributions for scaling
  let maxCount = 0;
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > maxCount) {
        maxCount = day.contributionCount;
      }
    }
  }

  const getColor = (count) => {
    if (count === 0) return '#fff1f5'; // very pale pink (empty)
    if (maxCount === 0) return '#f9a8d4'; // fallback
    const ratio = count / maxCount;
    if (ratio <= 0.2) return '#f9a8d4'; // light pink
    if (ratio <= 0.4) return '#f472b6'; // medium pink
    if (ratio <= 0.6) return '#ec4899'; // hot pink
    if (ratio <= 0.8) return '#d946ef'; // magenta
    return '#831843'; // deep burgundy
  };

  const cellWidth = 14;
  const cellGap = 4;
  const cellTotal = cellWidth + cellGap;
  
  const gridWidth = 53 * cellTotal; 
  const width = gridWidth + 380; // Extra padding on the left for the tree
  const height = 7 * cellTotal + 130; 

  // Tree Blossoms Generation
  let treeBlossoms = '';
  const branchPoints = [
    // Top sweeping branch
    [50, 80], [100, 50], [150, 35], [200, 30], [250, 35], [300, 40], [350, 10], [400, 0],
    // Middle branch
    [70, 130], [120, 115], [180, 110], [220, 120], [250, 130], [280, 85], [320, 70],
    // Lower branch
    [40, 215], [100, 215], [150, 230], [200, 240], [250, 250], [20, 150], [280, 270],
    // Extra clusters for dense canopy effect on the left
    [10, 50], [30, 90], [50, 160], [20, 260], [80, 200]
  ];
  
  branchPoints.forEach(pt => {
    const numClusters = 12 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numClusters; i++) {
      const x = pt[0] + (Math.random() - 0.5) * 80;
      const y = pt[1] + (Math.random() - 0.5) * 80;
      const scale = 0.4 + Math.random() * 0.8;
      const rot = Math.random() * 360;
      treeBlossoms += `<use href="#cluster" x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y}) scale(${scale})" />`;
    }
  });

  // Floating Petals Generation
  let floatingPetals = '';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * (height - 50);
    const scale = 0.3 + Math.random() * 0.7;
    const dur = 10 + Math.random() * 15;
    const delay = -(Math.random() * 20); // start off-sync immediately
    
    floatingPetals += `
      <g>
        <animateTransform attributeName="transform" type="translate" from="${x},${y}" to="${x - 200},${y + 300}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
        <g transform="scale(${scale})">
          <use href="#petal" fill="#f472b6" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${dur/2}s" repeatCount="indefinite" />
          </use>
        </g>
      </g>
    `;
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Background Gradient -->
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffe4e6" />
        <stop offset="50%" stop-color="#fff1f2" />
        <stop offset="100%" stop-color="#fbcfe8" />
      </linearGradient>

      <!-- Animated Inner Border Glow -->
      <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f472b6">
          <animate attributeName="stop-color" values="#f472b6;#ec4899;#f472b6" dur="6s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stop-color="#fbcfe8" />
        <stop offset="100%" stop-color="#fda4af">
          <animate attributeName="stop-color" values="#fda4af;#f472b6;#fda4af" dur="6s" repeatCount="indefinite" />
        </stop>
      </linearGradient>

      <!-- Glow Filters -->
      <filter id="border-glow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <!-- Breathing Cell Glow for high activity -->
      <filter id="cell-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <!-- Atmospheric blur for background elements -->
      <filter id="atmosphere-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      
      <filter id="atmosphere-blur-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" />
      </filter>

      <!-- Sakura Petal & Cluster Templates -->
      <g id="petal">
        <path d="M0,0 C6,-6 12,-3 12,6 C12,15 6,18 0,12 C-6,18 -12,15 -12,6 C-12,-3 -6,-6 0,0 Z" />
      </g>
      <g id="cluster">
        <use href="#petal" x="0" y="0" fill="#f472b6" transform="rotate(15)" opacity="0.9"/>
        <use href="#petal" x="10" y="-6" fill="#ec4899" transform="rotate(75) scale(0.8)" opacity="0.8"/>
        <use href="#petal" x="-10" y="3" fill="#f9a8d4" transform="rotate(-30) scale(1.2)" opacity="0.9"/>
        <use href="#petal" x="6" y="10" fill="#fda4af" transform="rotate(120) scale(0.7)" opacity="0.9"/>
        <circle cx="2" cy="3" r="2.5" fill="#be185d" opacity="0.8" />
      </g>
    </defs>

    <!-- Thick black rounded outer border -->
    <rect x="5" y="5" width="${width - 10}" height="${height - 10}" fill="url(#bg-grad)" stroke="#171717" stroke-width="6" rx="20" />
    
    <!-- Thin pink inner border/glow -->
    <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="url(#border-gradient)" stroke-width="2" rx="16" filter="url(#border-glow)" opacity="0.8" />
    
    <!-- Distant Mountains / Pink Atmosphere -->
    <path d="M 0,260 Q 150,200 300,240 T 600,220 T 900,280 L 0,280 Z" fill="#fda4af" opacity="0.4" filter="url(#atmosphere-blur)" />
    <path d="M 0,220 Q 200,160 400,200 T 800,180 T 1100,270 L 0,270 Z" fill="#e11d48" opacity="0.15" filter="url(#atmosphere-blur)" />

    <!-- Japanese Pagoda Silhouette (Softly blurred in background) -->
    <g transform="translate(100, 160) scale(0.7)" opacity="0.4" fill="#831843" filter="url(#atmosphere-blur-soft)">
      <polygon points="50,0 65,25 35,25" />
      <polygon points="20,25 80,25 75,35 25,35" />
      <rect x="38" y="35" width="24" height="20" />
      <polygon points="5,55 95,55 85,70 15,70" />
      <rect x="32" y="70" width="36" height="25" />
      <polygon points="-10,95 110,95 100,110 0,110" />
      <rect x="25" y="110" width="50" height="35" />
    </g>

    <!-- Sun / Soft glowing orb -->
    <circle cx="200" cy="120" r="60" fill="#fff1f2" opacity="0.6" filter="url(#atmosphere-blur)" />

    <!-- Main Tree Trunk and Branches -->
    <g fill="none" stroke="#2c1a1d" stroke-linecap="round">
      <path d="M -10,320 C 50,260 40,150 80,80" stroke-width="28" />
      <path d="M 80,80 C 140,30 220,20 330,30" stroke-width="14" />
      <path d="M 160,35 C 220,10 300,15 380,5" stroke-width="8" />
      <path d="M 60,150 C 120,110 200,100 280,120" stroke-width="10" />
      <path d="M 140,120 C 180,85 240,90 310,75" stroke-width="5" />
      <path d="M 30,220 C 90,210 170,230 280,250" stroke-width="12" />
    </g>

    <!-- Render Tree Blossoms -->
    ${treeBlossoms}

    <!-- Render Floating Petals -->
    ${floatingPetals}

    <!-- Grid Group (Shifted right for composition) -->
    <g transform="translate(340, 65)">
  `;

  let gridCells = '';

  weeks.forEach((week, xIndex) => {
    const x = xIndex * cellTotal;
    
    week.contributionDays.forEach((day) => {
      const dateObj = new Date(day.date);
      const count = day.contributionCount;
      const color = getColor(count);
      const isActivity = count > 0;
      const y = dateObj.getUTCDay() * cellTotal;

      // Soft breathing glow for high activity
      let animatePulse = '';
      let filterAttr = '';
      if (count > maxCount * 0.6) {
        const pulseDur = 3 + Math.random() * 2;
        animatePulse = `<animate attributeName="opacity" values="0.75;1;0.75" dur="${pulseDur}s" repeatCount="indefinite" />`;
        filterAttr = 'filter="url(#cell-glow)"';
      }

      gridCells += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" fill="${color}" rx="3" ry="3" ${filterAttr}>${animatePulse}</rect>`;
    });
  });

  svg += gridCells;

  // Weekday labels
  const weekdays = ['Mon', 'Wed', 'Fri'];
  const weekdayOffsets = [1, 3, 5]; 
  weekdays.forEach((day, i) => {
    const y = weekdayOffsets[i] * cellTotal + 11;
    svg += `<text x="-12" y="${y}" fill="#831843" font-size="11" font-weight="600" font-family="sans-serif" text-anchor="end">${day}</text>`;
  });

  // Month labels
  const monthLabels = [];
  let currentMonth = -1;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let lastMonthX = -100;

  weeks.forEach((week, xIndex) => {
    const x = xIndex * cellTotal;
    if (week.contributionDays.length > 0) {
      const firstDayDate = new Date(week.contributionDays[0].date);
      const month = firstDayDate.getUTCMonth();
      
      if (month !== currentMonth) {
        if (x - lastMonthX > 30) { 
          monthLabels.push({ text: monthNames[month], x });
          lastMonthX = x;
        }
        currentMonth = month;
      }
    }
  });

  monthLabels.forEach((label) => {
    svg += `<text x="${label.x}" y="-12" fill="#831843" font-size="11" font-weight="600" font-family="sans-serif">${label.text}</text>`;
  });

  svg += `</g>`;

  // Legend (bottom right placement matching reference)
  svg += `<g transform="translate(${width - 200}, ${height - 40})">
    <text x="-12" y="11" fill="#831843" font-size="11" font-weight="600" font-family="sans-serif" text-anchor="end">Less</text>
    <rect x="0" y="0" width="${cellWidth}" height="${cellWidth}" fill="#fff1f5" rx="3" ry="3" />
    <rect x="22" y="0" width="${cellWidth}" height="${cellWidth}" fill="#f9a8d4" rx="3" ry="3" />
    <rect x="44" y="0" width="${cellWidth}" height="${cellWidth}" fill="#f472b6" rx="3" ry="3" filter="url(#cell-glow)"/>
    <rect x="66" y="0" width="${cellWidth}" height="${cellWidth}" fill="#ec4899" rx="3" ry="3" filter="url(#cell-glow)"/>
    <rect x="88" y="0" width="${cellWidth}" height="${cellWidth}" fill="#d946ef" rx="3" ry="3" filter="url(#cell-glow)"/>
    <rect x="110" y="0" width="${cellWidth}" height="${cellWidth}" fill="#831843" rx="3" ry="3" filter="url(#cell-glow)"/>
    <text x="134" y="11" fill="#831843" font-size="11" font-weight="600" font-family="sans-serif">More</text>
  </g>`;

  svg += `</svg>`;
  return svg;
}
