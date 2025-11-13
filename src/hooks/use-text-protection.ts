"use client";

import { useEffect, useState } from 'react';
import { detectAIReading } from '@/lib/text-protection';

export function useTextProtection() {
  const [isAIDetected, setIsAIDetected] = useState(false);
  const [protectionLevel, setProtectionLevel] = useState<'aggressive' | 'moderate' | 'light'>('moderate');

  useEffect(() => {
    // Detect if AI is trying to read the page
    const aiDetected = detectAIReading();
    setIsAIDetected(aiDetected);

    if (aiDetected) {
      setProtectionLevel('aggressive');
    }

    // Apply global protections
    applyGlobalProtections();

    // Monitor for AI reading attempts
    const interval = setInterval(() => {
      const detected = detectAIReading();
      if (detected && !isAIDetected) {
        setIsAIDetected(true);
        setProtectionLevel('aggressive');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAIDetected]);

  return {
    isAIDetected,
    protectionLevel,
  };
}

function applyGlobalProtections() {
  // Disable text selection on quiz content
  const style = document.createElement('style');
  style.textContent = `
    .quiz-content {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-touch-callout: none;
    }

    /* Prevent AI from reading via pseudo-elements */
    .quiz-content::before,
    .quiz-content::after {
      content: '';
    }

    /* Disable drag and drop */
    .quiz-content {
      -webkit-user-drag: none;
      user-drag: none;
    }

    /* Prevent screenshot via canvas */
    .quiz-content canvas {
      pointer-events: none;
    }

    /* Hide from accessibility APIs that AI might use */
    .quiz-content[aria-hidden="true"] {
      speak: none;
    }
  `;
  document.head.appendChild(style);

  // Override copy event
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      e.preventDefault();
      // Copy garbage instead
      e.clipboardData?.setData('text/plain', '🚫 Copying is disabled during the quiz');
    }
  });

  // Override cut event
  document.addEventListener('cut', (e) => {
    e.preventDefault();
  });

  // Disable drag events
  document.addEventListener('dragstart', (e) => {
    if ((e.target as HTMLElement).closest('.quiz-content')) {
      e.preventDefault();
    }
  });

  // Prevent AI from using getSelection
  const originalGetSelection = window.getSelection;
  window.getSelection = function() {
    const selection = originalGetSelection.call(this);
    if (selection && document.querySelector('.quiz-content')?.contains(selection.anchorNode)) {
      // Return empty selection for quiz content
      return null;
    }
    return selection;
  };

  // Prevent AI from reading innerHTML
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (originalInnerHTML) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      get: function() {
        if (this.classList.contains('quiz-content') || this.closest('.quiz-content')) {
          return ''; // Return empty for quiz content
        }
        return originalInnerHTML.get?.call(this);
      },
      set: originalInnerHTML.set,
    });
  }

  // Prevent AI from reading textContent
  const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  if (originalTextContent) {
    Object.defineProperty(Node.prototype, 'textContent', {
      get: function() {
        if (this instanceof Element && (this.classList.contains('quiz-content') || this.closest('.quiz-content'))) {
          return ''; // Return empty for quiz content
        }
        return originalTextContent.get?.call(this);
      },
      set: originalTextContent.set,
    });
  }

  // Prevent AI from reading innerText
  const originalInnerText = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText');
  if (originalInnerText) {
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      get: function() {
        if (this.classList.contains('quiz-content') || this.closest('.quiz-content')) {
          return ''; // Return empty for quiz content
        }
        return originalInnerText.get?.call(this);
      },
      set: originalInnerText.set,
    });
  }

  // Monitor for AI trying to access DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-ai-read') {
        // AI is trying to mark elements as read
        (mutation.target as Element).removeAttribute('data-ai-read');
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['data-ai-read', 'data-read', 'data-processed'],
  });
}
