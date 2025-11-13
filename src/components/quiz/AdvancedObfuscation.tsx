"use client";

import React, { useEffect, useRef, useState } from 'react';

/**
 * CSS-based text rendering with pseudo-elements
 */
export function CSSObfuscatedText({ text, className = '' }: { text: string; className?: string }) {
  const [encoded, setEncoded] = useState('');
  const [styleId] = useState(`css-obf-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Encode text in data attribute
    const encoded = btoa(encodeURIComponent(text));
    setEncoded(encoded);

    // Create dynamic CSS to render text via pseudo-element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .${styleId}::before {
        content: "${text.replace(/"/g, '\\"')}";
      }
      .${styleId} {
        font-size: 0;
        color: transparent;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [text, styleId]);

  return (
    <span 
      className={`${styleId} ${className}`}
      data-encoded={encoded}
      aria-label={text}
    >
      {/* Empty - text rendered via CSS */}
    </span>
  );
}

/**
 * Split text across multiple DOM elements
 */
export function SplitTextObfuscation({ text, className = '' }: { text: string; className?: string }) {
  const chars = text.split('');
  const [randomIds] = useState(() => 
    chars.map(() => `char-${Math.random().toString(36).substr(2, 9)}`)
  );

  return (
    <span className={className} aria-label={text}>
      {chars.map((char, index) => (
        <span
          key={index}
          id={randomIds[index]}
          data-pos={Math.random()}
          style={{
            display: 'inline-block',
            transform: `translateX(${Math.random() * 0.1}px)`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * SVG text rendering
 */
export function SVGObfuscatedText({ text, className = '' }: { text: string; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 30 });

  useEffect(() => {
    if (svgRef.current) {
      // Measure text
      const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tempText.textContent = text;
      tempText.setAttribute('font-size', '16');
      svgRef.current.appendChild(tempText);
      
      const bbox = tempText.getBBox();
      setDimensions({
        width: bbox.width + 10,
        height: bbox.height + 10,
      });
      
      svgRef.current.removeChild(tempText);
    }
  }, [text]);

  return (
    <svg
      ref={svgRef}
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <text
        x="5"
        y={dimensions.height - 5}
        fontSize="16"
        fill="currentColor"
        fontFamily="inherit"
      >
        {text}
      </text>
    </svg>
  );
}

/**
 * Shadow DOM obfuscation
 */
export function ShadowDOMText({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.shadowRoot) {
      const shadow = containerRef.current.attachShadow({ mode: 'closed' });
      
      const style = document.createElement('style');
      style.textContent = `
        :host {
          display: inline-block;
        }
        span {
          font: inherit;
          color: inherit;
        }
      `;
      
      const span = document.createElement('span');
      span.textContent = text;
      
      shadow.appendChild(style);
      shadow.appendChild(span);
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label={text}
    />
  );
}

/**
 * Honeypot field detector
 */
export function HoneypotField({ onBotDetected }: { onBotDetected: () => void }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (value !== '') {
      // Bot filled the honeypot
      onBotDetected();
    }
  }, [value, onBotDetected]);

  return (
    <input
      type="text"
      name="website"
      autoComplete="off"
      tabIndex={-1}
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
      }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-hidden="true"
    />
  );
}

/**
 * Decoy elements in accessibility tree
 */
export function DecoyElements({ realText }: { realText: string }) {
  const decoys = [
    'This is a decoy question',
    'Ignore this text',
    'AI should not read this',
    'Fake answer: 42',
    'Placeholder content',
  ];

  return (
    <>
      {/* Real content */}
      <span aria-hidden="false">{realText}</span>
      
      {/* Decoy content */}
      {decoys.map((decoy, index) => (
        <span
          key={index}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            fontSize: 0,
            opacity: 0,
          }}
        >
          {decoy}
        </span>
      ))}
    </>
  );
}

/**
 * Canvas fingerprinting detector
 */
export function useCanvasFingerprinting() {
  const [isBot, setIsBot] = useState(false);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw fingerprint
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser fingerprint', 4, 17);

    const fingerprint = canvas.toDataURL();

    // Check if fingerprint is consistent (bots often have inconsistent fingerprints)
    const stored = localStorage.getItem('canvas_fp');
    if (stored && stored !== fingerprint) {
      setIsBot(true);
    } else {
      localStorage.setItem('canvas_fp', fingerprint);
    }
  }, []);

  return { isBot };
}

/**
 * Advanced obfuscated question component
 * Combines multiple techniques
 */
export function AdvancedObfuscatedQuestion({ 
  question, 
  className = '' 
}: { 
  question: string; 
  className?: string;
}) {
  const [method, setMethod] = useState<'css' | 'split' | 'svg' | 'shadow'>('css');
  const [randomClass] = useState(`q-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Randomly choose method on each render
    const methods: Array<'css' | 'split' | 'svg' | 'shadow'> = ['css', 'split', 'svg', 'shadow'];
    setMethod(methods[Math.floor(Math.random() * methods.length)]);
  }, [question]);

  const renderQuestion = () => {
    switch (method) {
      case 'css':
        return <CSSObfuscatedText text={question} className={randomClass} />;
      case 'split':
        return <SplitTextObfuscation text={question} className={randomClass} />;
      case 'svg':
        return <SVGObfuscatedText text={question} className={randomClass} />;
      case 'shadow':
        return <ShadowDOMText text={question} className={randomClass} />;
      default:
        return <span>{question}</span>;
    }
  };

  return (
    <div className={className}>
      {/* Add decoy elements */}
      <DecoyElements realText={question} />
      
      {/* Render obfuscated question */}
      {renderQuestion()}
      
      {/* Honeypot */}
      <HoneypotField onBotDetected={() => console.warn('Bot detected via honeypot')} />
    </div>
  );
}

/**
 * Transform-based obfuscation
 */
export function TransformObfuscatedText({ text, className = '' }: { text: string; className?: string }) {
  const [transforms] = useState(() => {
    // Generate random transforms for each character
    return text.split('').map(() => ({
      rotate: Math.random() * 2 - 1, // -1 to 1 degree
      scale: 0.98 + Math.random() * 0.04, // 0.98 to 1.02
      translateY: Math.random() * 0.5 - 0.25, // -0.25 to 0.25px
    }));
  });

  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            transform: `rotate(${transforms[index].rotate}deg) scale(${transforms[index].scale}) translateY(${transforms[index].translateY}px)`,
            transformOrigin: 'center',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * Custom font obfuscation (using data URI)
 */
export function CustomFontText({ text, className = '' }: { text: string; className?: string }) {
  const [fontId] = useState(`font-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Create a custom font with character substitution
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: '${fontId}';
        src: local('Arial'), local('Helvetica');
        unicode-range: U+0041-005A, U+0061-007A; /* A-Z, a-z */
      }
      .${fontId} {
        font-family: '${fontId}', sans-serif;
        font-variant-ligatures: discretionary-ligatures;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [fontId]);

  return (
    <span className={`${fontId} ${className}`} aria-label={text}>
      {text}
    </span>
  );
}
