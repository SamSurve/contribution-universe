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
    if (count === 0) return '#080d17'; // very dark navy (empty)
    if (maxCount === 0) return '#1e3a8a';
    const ratio = count / maxCount;
    if (ratio <= 0.2) return '#1e3a8a'; // dark blue
    if (ratio <= 0.4) return '#2563eb'; // electric blue
    if (ratio <= 0.6) return '#06b6d4'; // cyan
    if (ratio <= 0.8) return '#9333ea'; // purple
    return '#e9d5ff'; // lavender/white
  };

  const cellWidth = 10;
  const cellGap = 4;
  const cellTotal = cellWidth + cellGap;
  
  const width = 53 * cellTotal + 60; // 53 weeks max + 60px padding
  const height = 7 * cellTotal + 70; // 7 days + 40px top padding + 30px bottom

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Deep space background -->
      <linearGradient id="space-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#02040a" />
        <stop offset="50%" stop-color="#050a15" />
        <stop offset="100%" stop-color="#02040a" />
      </linearGradient>
      
      <!-- Glow filter -->
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#space-bg)" rx="10" />
    
    <!-- Moving Stars/Nebula Animation -->
    <g opacity="0.6">
`;

  // Add animated background stars
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.5;
    const duration = 3 + Math.random() * 5;
    const delay = Math.random() * 5;
    svg += `
      <circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff">
        <animate attributeName="opacity" values="0.1;0.8;0.1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite" />
      </circle>
    `;
  }

  svg += `
    </g>
    <!-- Grid Group -->
    <g transform="translate(40, 40)">
  `;

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayOffsets = [0, 1, 2, 3, 4, 5, 6]; 
  weekdays.forEach((day, i) => {
    const y = weekdayOffsets[i] * cellTotal + 9;
    svg += `<text x="-10" y="${y}" fill="#8b949e" font-size="10" font-family="sans-serif" text-anchor="end">${day}</text>`;
  });

  const monthLabels = [];
  let currentMonth = -1;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let lastMonthX = -100;

  weeks.forEach((week, xIndex) => {
    const x = xIndex * cellTotal;
    
    // Check the first day of the week to see if we entered a new month
    if (week.contributionDays.length > 0) {
      const firstDayDate = new Date(week.contributionDays[0].date);
      const month = firstDayDate.getUTCMonth();
      
      if (month !== currentMonth) {
        if (x - lastMonthX > 20) { // Prevent overlapping text
          monthLabels.push({ text: monthNames[month], x });
          lastMonthX = x;
        }
        currentMonth = month;
      }
    }

    week.contributionDays.forEach((day) => {
      const dateObj = new Date(day.date);
      const count = day.contributionCount;
      const color = getColor(count);
      const isActivity = count > 0;
      const y = dateObj.getUTCDay() * cellTotal;
      
      // Animated pulse for highly active days
      let animatePulse = '';
      if (count > maxCount * 0.6) {
        // High contribution, add slight pulsing animation to the opacity
        const pulseDur = 2 + Math.random() * 2;
        animatePulse = `<animate attributeName="opacity" values="0.8;1;0.8" dur="${pulseDur}s" repeatCount="indefinite" />`;
      }

      svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" fill="${color}" rx="2" ry="2" ${isActivity ? 'filter="url(#glow)"' : ''}>${animatePulse}</rect>`;
    });
  });

  // Render Month labels
  monthLabels.forEach((label) => {
    svg += `<text x="${label.x}" y="-10" fill="#64748b" font-size="10" font-family="sans-serif">${label.text}</text>`;
  });

  svg += `</g>`;

  // Legend
  svg += `<g transform="translate(${width - 160}, ${height - 25})">
    <text x="-10" y="9" fill="#64748b" font-size="10" font-family="sans-serif" text-anchor="end">Less</text>
    <rect x="0" y="0" width="${cellWidth}" height="${cellWidth}" fill="#080d17" rx="2" ry="2" />
    <rect x="14" y="0" width="${cellWidth}" height="${cellWidth}" fill="#1e3a8a" rx="2" ry="2" filter="url(#glow)"/>
    <rect x="28" y="0" width="${cellWidth}" height="${cellWidth}" fill="#2563eb" rx="2" ry="2" filter="url(#glow)"/>
    <rect x="42" y="0" width="${cellWidth}" height="${cellWidth}" fill="#06b6d4" rx="2" ry="2" filter="url(#glow)"/>
    <rect x="56" y="0" width="${cellWidth}" height="${cellWidth}" fill="#9333ea" rx="2" ry="2" filter="url(#glow)"/>
    <rect x="70" y="0" width="${cellWidth}" height="${cellWidth}" fill="#e9d5ff" rx="2" ry="2" filter="url(#glow)"/>
    <text x="86" y="9" fill="#64748b" font-size="10" font-family="sans-serif">More</text>
  </g>`;

  svg += `</svg>`;
  return svg;
}
