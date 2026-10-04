export function renderGalaxyTheme(calendarData) {
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
    if (count === 0) return '#1e293b'; // Empty cells: slightly more visible dark navy
    if (maxCount === 0) return '#1d4ed8'; // deep blue
    const ratio = count / maxCount;
    if (ratio <= 0.2) return '#1d4ed8'; // deep blue
    if (ratio <= 0.4) return '#3b82f6'; // electric blue
    if (ratio <= 0.6) return '#22d3ee'; // cyan
    if (ratio <= 0.8) return '#c084fc'; // purple
    return '#e9d5ff'; // lavender
  };

  // Increased cell size and gap for much larger, readable grid
  const cellWidth = 15;
  const cellGap = 5;
  const cellTotal = cellWidth + cellGap;
  
  const width = 53 * cellTotal + 90; // 53 weeks + padding
  const height = 7 * cellTotal + 90; // 7 days + top/bottom padding

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Very dark black/navy background -->
      <linearGradient id="space-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#02040a" />
        <stop offset="100%" stop-color="#060913" />
      </linearGradient>
      
      <!-- Gradient for the elegant border -->
      <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1d4ed8" />
        <stop offset="50%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#c084fc" />
      </linearGradient>

      <!-- Glow for border -->
      <filter id="border-glow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <!-- Stronger tasteful glow for active cells -->
      <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur1" />
        <feGaussianBlur stdDeviation="5" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Clip path to keep sweep inside border radius -->
      <clipPath id="box-clip">
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="10" />
      </clipPath>
    </defs>

    <!-- Outer Glow for the Box -->
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="url(#border-gradient)" stroke-width="1.5" rx="10" filter="url(#border-glow)" opacity="0.4" />
    
    <!-- The Dark Box -->
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="url(#space-bg)" stroke="url(#border-gradient)" stroke-width="1.5" rx="10" />

    <!-- Subtle moving light sweep along the top border -->
    <g clip-path="url(#box-clip)">
      <rect y="0" width="250" height="3" fill="#22d3ee" filter="url(#strong-glow)" opacity="0.8">
        <animate attributeName="x" from="-300" to="${width + 100}" dur="6s" repeatCount="indefinite" />
      </rect>
    </g>
    
    <!-- Sparse, slowly twinkling background stars -->
    <g opacity="0.3">
`;

  // Add sparse animated background stars
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.5;
    const duration = 6 + Math.random() * 6;
    const delay = Math.random() * 5;
    svg += `
      <circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff">
        <animate attributeName="opacity" values="0.05;0.4;0.05" dur="${duration}s" begin="${delay}s" repeatCount="indefinite" />
      </circle>
    `;
  }

  svg += `
    </g>
    <!-- Grid Group -->
    <g transform="translate(50, 50)">
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

      // Animated pulse for highly active days
      let animatePulse = '';
      if (count > maxCount * 0.6) {
        const pulseDur = 2.5 + Math.random() * 2;
        animatePulse = `<animate attributeName="opacity" values="0.85;1;0.85" dur="${pulseDur}s" repeatCount="indefinite" />`;
      }

      gridCells += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" fill="${color}" rx="3" ry="3" ${isActivity ? 'filter="url(#strong-glow)"' : ''}>${animatePulse}</rect>`;
    });
  });

  // Render the real grid cells
  svg += gridCells;

  // Weekday labels
  const weekdays = ['Mon', 'Wed', 'Fri'];
  const weekdayOffsets = [1, 3, 5]; 
  weekdays.forEach((day, i) => {
    const y = weekdayOffsets[i] * cellTotal + 12;
    svg += `<text x="-15" y="${y}" fill="#8b949e" font-size="12" font-weight="500" font-family="sans-serif" text-anchor="end">${day}</text>`;
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
    svg += `<text x="${label.x}" y="-15" fill="#8b949e" font-size="12" font-weight="500" font-family="sans-serif">${label.text}</text>`;
  });

  svg += `</g>`;

  // Legend
  svg += `<g transform="translate(${width - 220}, ${height - 30})">
    <text x="-15" y="12" fill="#8b949e" font-size="12" font-weight="500" font-family="sans-serif" text-anchor="end">Less</text>
    <rect x="0" y="0" width="${cellWidth}" height="${cellWidth}" fill="#1e293b" rx="3" ry="3" />
    <rect x="25" y="0" width="${cellWidth}" height="${cellWidth}" fill="#1d4ed8" rx="3" ry="3" filter="url(#strong-glow)"/>
    <rect x="50" y="0" width="${cellWidth}" height="${cellWidth}" fill="#3b82f6" rx="3" ry="3" filter="url(#strong-glow)"/>
    <rect x="75" y="0" width="${cellWidth}" height="${cellWidth}" fill="#22d3ee" rx="3" ry="3" filter="url(#strong-glow)"/>
    <rect x="100" y="0" width="${cellWidth}" height="${cellWidth}" fill="#c084fc" rx="3" ry="3" filter="url(#strong-glow)"/>
    <rect x="125" y="0" width="${cellWidth}" height="${cellWidth}" fill="#e9d5ff" rx="3" ry="3" filter="url(#strong-glow)"/>
    <text x="150" y="12" fill="#8b949e" font-size="12" font-weight="500" font-family="sans-serif">More</text>
  </g>`;

  svg += `</svg>`;
  return svg;
}
