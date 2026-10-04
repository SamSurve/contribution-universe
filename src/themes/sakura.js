export function renderSakuraTheme(calendarData) {
  const { weeks } = calendarData;

  let maxCount = 0;
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      maxCount = Math.max(maxCount, day.contributionCount);
    }
  }

  const palette = ['#ffd9e6', '#f6a8c0', '#ef6f9d', '#d82f68', '#9f194d', '#5a0b2d'];

  const getLevel = (count) => {
    if (count <= 0 || maxCount === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;
    return 5;
  };

  const cell = 17;
  const gap = 5;
  const step = cell + gap;
  const gridX = 405;
  const gridY = 128;
  const gridWidth = 53 * step;
  const width = 1600;
  const height = 520;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Deterministic decorative detail so the artwork stays stable between workflow runs.
  const pseudo = (n) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  let blossoms = '';
  for (let i = 0; i < 115; i++) {
    const x = 40 + pseudo(i + 11) * 355;
    const y = 58 + pseudo(i + 37) * 235;
    const s = 0.45 + pseudo(i + 71) * 0.9;
    const r = (pseudo(i + 101) * 70) - 35;
    blossoms += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + r.toFixed(1) + ') scale(' + s.toFixed(2) + ')">' +
      '<circle cx="0" cy="-7" r="5" fill="#ff75a8"/>' +
      '<circle cx="7" cy="0" r="5" fill="#f85693"/>' +
      '<circle cx="0" cy="7" r="5" fill="#ff9abb"/>' +
      '<circle cx="-7" cy="0" r="5" fill="#ef4f8d"/>' +
      '<circle cx="0" cy="0" r="3" fill="#c51d5b"/>' +
      '</g>';
  }

  let petals = '';
  for (let i = 0; i < 22; i++) {
    const x = 200 + pseudo(i + 501) * 1330;
    const y = 50 + pseudo(i + 551) * 400;
    const dx = -100 - pseudo(i + 601) * 180;
    const dy = 160 + pseudo(i + 651) * 180;
    const dur = 9 + pseudo(i + 701) * 8;
    const delay = -(pseudo(i + 751) * 14);
    petals += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" opacity="0.75">' +
      '<path d="M0,0 C9,-12 22,-7 20,5 C18,15 7,19 0,11 C-7,19 -18,15 -20,5 C-22,-7 -9,-12 0,0 Z" fill="#f45d97">' +
      '<animateTransform attributeName="transform" type="translate" from="0 0" to="' + dx.toFixed(1) + ' ' + dy.toFixed(1) + '" dur="' + dur.toFixed(1) + 's" begin="' + delay.toFixed(1) + 's" repeatCount="indefinite"/>' +
      '</path></g>';
  }

  let cells = '';
  weeks.forEach((week, xIndex) => {
    week.contributionDays.forEach((day) => {
      const count = day.contributionCount;
      const date = new Date(day.date + 'T00:00:00Z');
      const row = date.getUTCDay();
      const x = gridX + xIndex * step;
      const y = gridY + row * step;
      const level = getLevel(count);
      const glow = level >= 4 ? ' filter="url(#cellGlow)"' : '';
      cells += '<rect x="' + x + '" y="' + y + '" width="' + cell + '" height="' + cell + '" rx="4" fill="' + palette[level] + '"' + glow + '>' +
        '<title>' + day.date + ': ' + count + ' contribution' + (count === 1 ? '' : 's') + '</title>' +
        (level >= 4 ? '<animate attributeName="opacity" values="0.88;1;0.88" dur="2.8s" repeatCount="indefinite"/>' : '') +
        '</rect>';
    });
  });

  let monthLabels = '';
  let previousMonth = -1;
  let lastLabelX = -100;

  weeks.forEach((week, xIndex) => {
    if (!week.contributionDays.length) return;
    const first = new Date(week.contributionDays[0].date + 'T00:00:00Z');
    const month = first.getUTCMonth();
    const x = gridX + xIndex * step;
    if (month !== previousMonth && x - lastLabelX > 55) {
      monthLabels += '<text x="' + x + '" y="101" fill="#401323" font-size="18" font-weight="700" font-family="Georgia, serif">' + monthNames[month] + '</text>';
      lastLabelX = x;
    }
    previousMonth = month;
  });

  const legendX = width - 355;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Sakura themed GitHub contribution calendar">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fffdfd"/>
      <stop offset="0.45" stop-color="#ffeef5"/>
      <stop offset="1" stop-color="#fff8fb"/>
    </linearGradient>

    <linearGradient id="innerPink" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff79ad"/>
      <stop offset="0.5" stop-color="#ffd1df"/>
      <stop offset="1" stop-color="#ff79ad"/>
      <animate attributeName="x1" values="0;1;0" dur="7s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="1;0;1" dur="7s" repeatCount="indefinite"/>
    </linearGradient>

    <linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8a6bd"/>
      <stop offset="1" stop-color="#ffdce8"/>
    </linearGradient>

    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd2df" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#fff8fb" stop-opacity="0.2"/>
    </linearGradient>

    <radialGradient id="sun">
      <stop offset="0" stop-color="#fff7fb" stop-opacity="1"/>
      <stop offset="1" stop-color="#ffcfdf" stop-opacity="0"/>
    </radialGradient>

    <filter id="pinkGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>

    <filter id="cellGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <clipPath id="frameClip">
      <rect x="16" y="26" width="${width - 32}" height="430" rx="28"/>
    </clipPath>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <rect x="16" y="26" width="${width - 32}" height="430" rx="28" fill="url(#bg)" stroke="#171016" stroke-width="7"/>

  <rect x="23" y="33" width="${width - 46}" height="416" rx="22" fill="none" stroke="url(#innerPink)" stroke-width="5" filter="url(#pinkGlow)"/>

  <g clip-path="url(#frameClip)">
    <circle cx="245" cy="165" r="105" fill="url(#sun)"/>

    <!-- soft distant mountain layers -->
    <path d="M0 350 L120 275 L195 330 L285 235 L390 330 L500 255 L590 335 L705 250 L840 340 L965 265 L1110 345 L1230 265 L1370 340 L1510 260 L1600 335 L1600 456 L0 456 Z" fill="url(#mountain)" opacity="0.58"/>
    <path d="M0 387 L120 330 L205 365 L305 300 L400 370 L520 318 L640 382 L760 310 L875 378 L1000 325 L1130 380 L1250 315 L1390 380 L1510 320 L1600 370 L1600 456 L0 456 Z" fill="#f5bfd0" opacity="0.6"/>

    <!-- water reflection -->
    <rect x="0" y="385" width="${width}" height="72" fill="url(#water)"/>
    <path d="M70 402 Q250 392 430 405 T780 400 T1120 406 T1510 402" fill="none" stroke="#f59ab8" stroke-width="3" opacity="0.5"/>
    <path d="M115 425 Q260 416 430 428 T780 423 T1100 430" fill="none" stroke="#ffc2d5" stroke-width="5" opacity="0.6"/>

    <!-- Japanese pagoda -->
    <g transform="translate(125 258)" fill="#471323" opacity="0.96">
      <rect x="50" y="82" width="72" height="72" rx="2"/>
      <rect x="61" y="112" width="15" height="42" fill="#f7c7d6"/>
      <rect x="96" y="112" width="15" height="42" fill="#f7c7d6"/>
      <polygon points="20,82 152,82 135,69 37,69"/>
      <rect x="64" y="54" width="44" height="22"/>
      <polygon points="31,54 145,54 126,42 49,42"/>
      <rect x="76" y="29" width="20" height="18"/>
      <polygon points="42,29 128,29 111,18 59,18"/>
      <rect x="83" y="6" width="6" height="18"/>
      <polygon points="80,7 93,7 86,0"/>
    </g>

    <!-- bridge -->
    <path d="M40 399 Q145 343 255 395 Q340 431 435 392" fill="none" stroke="#4a1825" stroke-width="6"/>
    <path d="M68 401 Q162 357 254 402" fill="none" stroke="#6a2538" stroke-width="3"/>

    <!-- main sakura tree -->
    <g fill="none" stroke="#25151a" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 450 C78 356 56 256 102 155 C125 106 145 75 178 42" stroke-width="34"/>
      <path d="M98 154 C170 105 260 75 440 83" stroke-width="16"/>
      <path d="M128 116 C210 60 300 48 470 48" stroke-width="10"/>
      <path d="M105 205 C175 160 260 154 360 176" stroke-width="11"/>
      <path d="M73 287 C155 248 245 275 350 315" stroke-width="13"/>
      <path d="M155 246 C235 215 295 218 390 244" stroke-width="8"/>
    </g>

    <g opacity="0.98">
      ${blossoms}
    </g>

    ${petals}

    <!-- Graph panel -->
    <rect x="382" y="66" width="1160" height="333" rx="20" fill="#fffafb" fill-opacity="0.56"/>
    <g>
      ${monthLabels}
      <text x="367" y="178" text-anchor="end" fill="#401323" font-size="18" font-weight="700" font-family="Georgia, serif">Mon</text>
      <text x="367" y="222" text-anchor="end" fill="#401323" font-size="18" font-weight="700" font-family="Georgia, serif">Wed</text>
      <text x="367" y="266" text-anchor="end" fill="#401323" font-size="18" font-weight="700" font-family="Georgia, serif">Fri</text>
      ${cells}
    </g>

    <!-- Legend -->
    <g transform="translate(${legendX} 402)">
      <text x="-18" y="18" text-anchor="end" fill="#401323" font-size="17" font-weight="700" font-family="Georgia, serif">Less</text>
      <rect x="0" y="3" width="18" height="18" rx="4" fill="${palette[0]}"/>
      <rect x="26" y="3" width="18" height="18" rx="4" fill="${palette[1]}"/>
      <rect x="52" y="3" width="18" height="18" rx="4" fill="${palette[2]}"/>
      <rect x="78" y="3" width="18" height="18" rx="4" fill="${palette[3]}"/>
      <rect x="104" y="3" width="18" height="18" rx="4" fill="${palette[4]}"/>
      <rect x="130" y="3" width="18" height="18" rx="4" fill="${palette[5]}"/>
      <text x="165" y="18" fill="#401323" font-size="17" font-weight="700" font-family="Georgia, serif">More</text>
    </g>

    <!-- border shimmer -->
    <rect x="23" y="33" width="${width - 46}" height="416" rx="22" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-dasharray="120 1800">
      <animate attributeName="stroke-dashoffset" from="0" to="-1920" dur="8s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>`;
}
