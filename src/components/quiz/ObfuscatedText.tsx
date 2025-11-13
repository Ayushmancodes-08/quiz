"use client";

import React, { useEffect, useRef, useState } from 'react';

interface ObfuscatedTextProps {
  text: string;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * ObfuscatedText Component
 * Renders text in a way that's visible to humans but unreadable to AI
 * 
 * Techniques used:
 * 1. Canvas rendering (AI can't read canvas text)
 * 2. Character splitting with random spans
 * 3. CSS-based visual obfuscation
 * 4. Zero-width characters
 * 5. Reversed text with CSS transform
 */
export function ObfuscatedText({ text, className = '', as = 'span' }: ObfuscatedTextProps) {
  const [method, setMethod] = useState<'canvas' | 'split' | 'css'>('canvas');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const Component = as;

  useEffect(() => {
    // Randomly choose obfuscation method
    const methods: Array<'canvas' | 'split' | 'css'> = ['canvas', 'split', 'css'];
    setMethod(methods[Math.floor(Math.random() * methods.length)]);
  }, [text]);

  // Method 1: Canvas rendering (most effective against AI)
  useEffect(() => {
    if (method === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get computed styles
      const computedStyle = window.getComputedStyle(canvas);
      const fontSize = parseInt(computedStyle.fontSize) || 16;
      const fontFamily = computedStyle.fontFamily || 'inherit';
      const color = computedStyle.color || '#000000';

      // Set font
      ctx.font = `${fontSize}px ${fontFamily}`;
      
      // Measure text
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.5; // Approximate height

      // Set canvas size
      canvas.width = textWidth;
      canvas.height = textHeight;

      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, textHeight / 2);
    }
  }, [text, method]);

  // Method 2: Character splitting with random attributes
  const renderSplitText = () => {
    const chars = text.split('');
    return chars.map((char, index) => (
      <span
        key={index}
        data-char={Math.random().toString(36)}
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
      >
        {char}
        {/* Add invisible zero-width characters */}
        {index < chars.length - 1 && (
          <>
            <span style={{ fontSize: 0, position: 'absolute' }}>
              {String.fromCharCode(8203)} {/* Zero-width space */}
            </span>
          </>
        )}
      </span>
    ));
  };

  // Method 3: CSS-based obfuscation with reversed text
  const renderCSSObfuscated = () => {
    // Reverse the text
    const reversed = text.split('').reverse().join('');
    
    return (
      <span
        style={{
          display: 'inline-block',
          direction: 'rtl',
          unicodeBidi: 'bidi-override',
        }}
        data-content={btoa(text)} // Base64 encoded (not for display)
      >
        {reversed}
      </span>
    );
  };

  if (method === 'canvas') {
    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
        aria-label={text}
      />
    );
  }

  if (method === 'split') {
    return (
      <Component className={className} aria-label={text}>
        {renderSplitText()}
      </Component>
    );
  }

  return (
    <Component className={className} aria-label={text}>
      {renderCSSObfuscated()}
    </Component>
  );
}

/**
 * ObfuscatedQuestion Component
 * Specialized component for quiz questions with maximum obfuscation
 */
export function ObfuscatedQuestion({ 
  question, 
  className = '' 
}: { 
  question: string; 
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<string>('');

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Render text to canvas with anti-AI techniques
      const fontSize = 18;
      const fontFamily = 'system-ui, -apple-system, sans-serif';
      const padding = 20;
      const lineHeight = fontSize * 1.6;

      ctx.font = `${fontSize}px ${fontFamily}`;
      
      // Word wrap
      const words = question.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      const maxWidth = 600;

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
      canvas.width = maxWidth + padding * 2;
      canvas.height = lines.length * lineHeight + padding * 2;

      // Clear and set background
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = 'currentColor';
      ctx.textBaseline = 'top';

      lines.forEach((line, index) => {
        ctx.fillText(line.trim(), padding, padding + index * lineHeight);
      });

      // Add subtle noise to prevent OCR
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Add minimal noise (1-2 pixel variation)
        if (Math.random() < 0.01) {
          const noise = Math.random() * 4 - 2;
          data[i] = Math.max(0, Math.min(255, data[i] + noise));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
      }
      
      ctx.putImageData(imageData, 0, 0);

      // Convert to data URL
      setImageData(canvas.toDataURL());
    }
  }, [question]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      {imageData && (
        <img
          src={imageData}
          alt="Question"
          className="max-w-full h-auto"
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
      )}
    </div>
  );
}

/**
 * ObfuscatedChoice Component
 * For answer choices with obfuscation
 */
export function ObfuscatedChoice({ 
  text, 
  className = '' 
}: { 
  text: string; 
  className?: string;
}) {
  return (
    <ObfuscatedText 
      text={text} 
      className={className}
      as="span"
    />
  );
}
