/**
 * Text Protection Utilities
 * Advanced techniques to prevent AI from reading quiz content
 */

/**
 * Add invisible characters to text to break AI parsing
 */
export function addInvisibleCharacters(text: string): string {
  const invisibleChars = [
    '\u200B', // Zero-width space
    '\u200C', // Zero-width non-joiner
    '\u200D', // Zero-width joiner
    '\uFEFF', // Zero-width no-break space
  ];

  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    // Add random invisible character between letters
    if (i < text.length - 1 && Math.random() < 0.3) {
      result += invisibleChars[Math.floor(Math.random() * invisibleChars.length)];
    }
  }
  return result;
}

/**
 * Encode text using homoglyphs (visually similar characters)
 */
export function encodeWithHomoglyphs(text: string): string {
  const homoglyphMap: Record<string, string[]> = {
    'a': ['а', 'ɑ', 'α'], // Cyrillic a, Latin alpha, Greek alpha
    'e': ['е', 'е', 'ℯ'], // Cyrillic e, Latin e, script e
    'o': ['о', 'ο', '০'], // Cyrillic o, Greek omicron, Bengali zero
    'p': ['р', 'ρ', 'ⲣ'], // Cyrillic r, Greek rho, Coptic ro
    'c': ['с', 'ϲ', 'ⅽ'], // Cyrillic s, Greek lunate sigma, Roman numeral
    'i': ['і', 'ı', 'ɪ'], // Cyrillic i, Turkish i, small capital i
    'j': ['ј', 'ϳ', 'ⅉ'], // Cyrillic j, Greek yot, double-struck j
    'x': ['х', 'χ', '×'], // Cyrillic h, Greek chi, multiplication
    'y': ['у', 'ү', 'ỿ'], // Cyrillic u, Cyrillic straight u, Latin y with loop
    's': ['ѕ', 'ꜱ', 'ʂ'], // Cyrillic dze, small capital s, s with hook
  };

  let result = '';
  for (const char of text.toLowerCase()) {
    if (homoglyphMap[char] && Math.random() < 0.4) {
      // 40% chance to replace with homoglyph
      const homoglyphs = homoglyphMap[char];
      result += homoglyphs[Math.floor(Math.random() * homoglyphs.length)];
    } else {
      result += text[result.length]; // Keep original case
    }
  }
  return result;
}

/**
 * Split text into fragments with decoy content
 */
export function fragmentText(text: string): Array<{ real: boolean; content: string }> {
  const words = text.split(' ');
  const fragments: Array<{ real: boolean; content: string }> = [];

  // Add decoy words
  const decoyWords = [
    'ignore', 'hidden', 'invisible', 'fake', 'decoy', 'false',
    'placeholder', 'dummy', 'test', 'sample', 'example'
  ];

  words.forEach((word, index) => {
    // Add real word
    fragments.push({ real: true, content: word });

    // Occasionally add decoy
    if (Math.random() < 0.2 && index < words.length - 1) {
      fragments.push({
        real: false,
        content: decoyWords[Math.floor(Math.random() * decoyWords.length)]
      });
    }
  });

  return fragments;
}

/**
 * Generate CSS that hides text from AI but shows to humans
 */
export function generateProtectionCSS(): string {
  return `
    /* Prevent text selection by AI tools */
    .ai-protected {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    /* Hide from screen readers that AI might use */
    .ai-protected::before {
      content: attr(data-decoy);
      position: absolute;
      left: -9999px;
      font-size: 0;
      opacity: 0;
    }

    /* Prevent copying */
    .ai-protected {
      -webkit-touch-callout: none;
      pointer-events: none;
    }

    /* Make clickable for answers but not copyable */
    .ai-protected-clickable {
      pointer-events: auto;
      cursor: pointer;
    }

    /* Hide decoy content visually but keep in DOM */
    .decoy-text {
      position: absolute;
      left: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      font-size: 0;
      opacity: 0;
    }

    /* Reverse text technique */
    .reversed-text {
      display: inline-block;
      direction: rtl;
      unicode-bidi: bidi-override;
    }
  `;
}

/**
 * Scramble text order with CSS to reorder
 */
export function scrambleTextWithCSS(text: string): {
  scrambled: Array<{ char: string; order: number }>;
  css: string;
} {
  const chars = text.split('');
  const scrambled = chars.map((char, index) => ({
    char,
    order: index,
  }));

  // Shuffle the array
  for (let i = scrambled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
  }

  // Generate CSS to reorder
  const css = scrambled
    .map((item, index) => {
      return `.scrambled-${Date.now()} > span:nth-child(${index + 1}) { order: ${item.order}; }`;
    })
    .join('\n');

  return { scrambled, css };
}

/**
 * Convert text to image data URL (most effective against AI)
 */
export function textToImageDataURL(
  text: string,
  options: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    padding?: number;
    maxWidth?: number;
  } = {}
): string {
  const {
    fontSize = 16,
    fontFamily = 'system-ui, sans-serif',
    color = '#000000',
    backgroundColor = 'transparent',
    padding = 10,
    maxWidth = 600,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.font = `${fontSize}px ${fontFamily}`;

  // Word wrap
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);

  // Set canvas size
  const lineHeight = fontSize * 1.5;
  canvas.width = maxWidth + padding * 2;
  canvas.height = lines.length * lineHeight + padding * 2;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';

  lines.forEach((line, index) => {
    ctx.fillText(line.trim(), padding, padding + index * lineHeight);
  });

  // Add subtle noise to prevent OCR
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < 0.005) {
      // Very subtle noise
      const noise = Math.random() * 3 - 1.5;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
}

/**
 * Detect if AI is trying to read the page
 */
export function detectAIReading(): boolean {
  // Check for common AI scraping indicators
  const indicators = [
    // Check for headless browser
    !navigator.plugins || navigator.plugins.length === 0,
    // Check for automation
    (window as any).navigator?.webdriver === true,
    // Check for missing properties
    !navigator.languages || navigator.languages.length === 0,
    // Check for unusual screen size
    screen.width === 0 || screen.height === 0,
  ];

  return indicators.filter(Boolean).length >= 2;
}

/**
 * Apply all protection techniques to text
 */
export function protectText(text: string, method: 'aggressive' | 'moderate' | 'light' = 'moderate'): string {
  switch (method) {
    case 'aggressive':
      // Use all techniques
      let protected = addInvisibleCharacters(text);
      protected = encodeWithHomoglyphs(protected);
      return protected;

    case 'moderate':
      // Use invisible characters only
      return addInvisibleCharacters(text);

    case 'light':
      // Minimal protection
      return text;

    default:
      return text;
  }
}
