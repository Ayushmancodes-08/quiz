"use client";

import { useEffect, useState, useCallback } from 'react';
import { generateKey, generateSessionKey } from '@/lib/encryption';

export function useAdvancedObfuscation(quizId: string, userId: string) {
  const [sessionKey, setSessionKey] = useState<string>('');
  const [encryptionKeys, setEncryptionKeys] = useState<string[]>([]);
  const [randomizedIds, setRandomizedIds] = useState<Map<string, string>>(new Map());
  const [isBot, setIsBot] = useState(false);

  useEffect(() => {
    // Generate session-specific keys
    const timestamp = Date.now();
    const sessKey = generateSessionKey(userId, quizId, timestamp);
    setSessionKey(sessKey);

    // Generate multiple encryption keys
    const keys = [
      generateKey(),
      generateKey(),
      generateKey(),
    ];
    setEncryptionKeys(keys);

    // Randomize all element IDs
    randomizeElementIds();

    // Detect bots
    detectBot();
  }, [quizId, userId]);

  const randomizeElementIds = useCallback(() => {
    const elements = document.querySelectorAll('[id]');
    const newIds = new Map<string, string>();

    elements.forEach((element) => {
      const oldId = element.id;
      const newId = `el-${Math.random().toString(36).substr(2, 12)}`;
      newIds.set(oldId, newId);
      element.id = newId;
    });

    setRandomizedIds(newIds);
  }, []);

  const detectBot = useCallback(() => {
    // Multiple bot detection methods
    const checks = [
      !navigator.plugins || navigator.plugins.length === 0,
      (window as any).navigator?.webdriver === true,
      !navigator.languages || navigator.languages.length === 0,
    ];

    setIsBot(checks.filter(Boolean).length >= 2);
  }, []);

  return {
    sessionKey,
    encryptionKeys,
    randomizedIds,
    isBot,
    randomizeElementIds,
  };
}
