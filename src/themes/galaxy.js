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
      <!-- Deep space background -->
      <linearGradient id="space-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#02040a" />
        <stop offset="50%" stop-color="#090f1d" />
        <stop offset="100%" stop-color="#02040a" />
      </linearGradient>
      
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

      <!-- Massive blur for nebula effect -->
      <filter id="nebula-blur" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="15" result="blur" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#space-bg)" rx="10" />
    
    <!-- Subtle background stars -->
    <g opacity="0.4">
`;

  // Add subtle animated background stars
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.5;
    const duration = 4 + Math.random() * 6;
    const delay = Math.random() * 5;
    svg += `
      <circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff">
        <animate attributeName="opacity" values="0.1;0.6;0.1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite" />
      </circle>
    `;
  }

  svg += `
    </g>
    <!-- Grid Group -->
    <g transform="translate(50, 50)">
  `;

  let gridCells = '';
  let nebulas = '';

  weeks.forEach((week, xIndex) => {
    const x = xIndex * cellTotal;
    
    week.contributionDays.forEach((day) => {
      const dateObj = new Date(day.date);
      const count = day.contributionCount;
      const color = getColor(count);
      const isActivity = count > 0;
      const y = dateObj.getUTCDay() * cellTotal;
      
      // Dynamic Nebula generation ONLY behind highly active regions
      if (count > maxCount * 0.3) {
        const nebulaColor = count > maxCount * 0.6 ? '#c084fc' : '#3b82f6'; // purple or electric blue nebula
        nebulas += `<circle cx="${x + cellWidth/2}" cy="${y + cellWidth/2}" r="${cellWidth * 2.5}" fill="${nebulaColor}" opacity="0.25" filter="url(#nebula-blur)" />`;
      }

      // Animated pulse for highly active days
      let animatePulse = '';
      if (count > maxCount * 0.6) {
        const pulseDur = 2.5 + Math.random() * 2;
        animatePulse = `<animate attributeName="opacity" values="0.85;1;0.85" dur="${pulseDur}s" repeatCount="indefinite" />`;
      }

      gridCells += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" fill="${color}" rx="3" ry="3" ${isActivity ? 'filter="url(#strong-glow)"' : ''}>${animatePulse}</rect>`;
    });
  });

  // Render Nebulas BEHIND the grid cells
  svg += nebulas;
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
