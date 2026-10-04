export default async function handler(req, res) {
  const { GITHUB_TOKEN } = process.env;
  if (!GITHUB_TOKEN) {
    return res.status(500).send("Missing GITHUB_TOKEN in environment variables");
  }

  const query = `
    query($userName:String!) {
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables: { userName: "SamSurve" } })
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    const calendar = json.data.user.contributionsCollection.contributionCalendar;
    const weeks = calendar.weeks;

    let maxCount = 0;
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        if (day.contributionCount > maxCount) {
          maxCount = day.contributionCount;
        }
      }
    }

    const getColor = (count) => {
      if (count === 0) return '#0a0f1c'; 
      if (maxCount === 0) return '#1e3a8a';
      const ratio = count / maxCount;
      if (ratio <= 0.2) return '#1e3a8a'; 
      if (ratio <= 0.4) return '#2563eb'; 
      if (ratio <= 0.6) return '#06b6d4'; 
      if (ratio <= 0.8) return '#9333ea'; 
      return '#e9d5ff'; 
    };

    const cellWidth = 10;
    const cellGap = 4;
    const cellTotal = cellWidth + cellGap;
    
    const width = 53 * cellTotal + 60; 
    const height = 7 * cellTotal + 60; 

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1e293b" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="1"/>
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#bg-glow)" rx="10" ry="10" />
      
      ${Array.from({length: 40}).map(() => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 1.5;
        const o = Math.random() * 0.5 + 0.1;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o}" />`;
      }).join('')}

      <g transform="translate(40, 40)">`;

    const weekdays = ['Mon', 'Wed', 'Fri'];
    const weekdayOffsets = [1, 3, 5]; 
    weekdays.forEach((day, i) => {
      const y = weekdayOffsets[i] * cellTotal + 9;
      svg += `<text x="-10" y="${y}" fill="#64748b" font-size="10" font-family="sans-serif" text-anchor="end">${day}</text>`;
    });

    const monthLabels = [];
    let currentMonth = -1;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    weeks.forEach((week, xIndex) => {
      const x = xIndex * cellTotal;
      
      week.contributionDays.forEach((day) => {
        const dateObj = new Date(day.date);
        const month = dateObj.getUTCMonth();
        
        if (month !== currentMonth) {
          monthLabels.push({ text: monthNames[month], x });
          currentMonth = month;
        }

        const y = dateObj.getUTCDay() * cellTotal; 
        const color = getColor(day.contributionCount);
        const isActivity = day.contributionCount > 0;
        
        svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellWidth}" fill="${color}" rx="2" ry="2" ${isActivity ? 'filter="url(#glow)"' : ''} />`;
      });
    });

    // Remove overlapping month labels (if two months are too close, though rare)
    let lastLabelX = -100;
    monthLabels.forEach((label) => {
      if (label.x - lastLabelX > 20) {
        svg += `<text x="${label.x}" y="-10" fill="#64748b" font-size="10" font-family="sans-serif">${label.text}</text>`;
        lastLabelX = label.x;
      }
    });

    svg += `</g>`;

    svg += `<g transform="translate(${width - 150}, ${height - 20})">
      <text x="-10" y="9" fill="#64748b" font-size="10" font-family="sans-serif" text-anchor="end">Less</text>
      <rect x="0" y="0" width="${cellWidth}" height="${cellWidth}" fill="#0a0f1c" rx="2" ry="2" />
      <rect x="14" y="0" width="${cellWidth}" height="${cellWidth}" fill="#1e3a8a" rx="2" ry="2" filter="url(#glow)"/>
      <rect x="28" y="0" width="${cellWidth}" height="${cellWidth}" fill="#2563eb" rx="2" ry="2" filter="url(#glow)"/>
      <rect x="42" y="0" width="${cellWidth}" height="${cellWidth}" fill="#06b6d4" rx="2" ry="2" filter="url(#glow)"/>
      <rect x="56" y="0" width="${cellWidth}" height="${cellWidth}" fill="#9333ea" rx="2" ry="2" filter="url(#glow)"/>
      <rect x="70" y="0" width="${cellWidth}" height="${cellWidth}" fill="#e9d5ff" rx="2" ry="2" filter="url(#glow)"/>
      <text x="86" y="9" fill="#64748b" font-size="10" font-family="sans-serif">More</text>
    </g>`;

    svg += `</svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=3600"); 
    res.status(200).send(svg);

  } catch (error) {
    res.status(500).send("Error generating SVG: " + error.message);
  }
}
