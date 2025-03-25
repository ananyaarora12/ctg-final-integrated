'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AccessibilityWidget with ssr: false
const AccessibilityWidget = dynamic(
  () => import('./AccessibilityWidget'),
  { ssr: false }
);

export default function AccessibilityWidgetWrapper() {
  const [mounted, setMounted] = useState(false);

  // Only show the widget after the component is mounted on the client
  useEffect(() => {
    setMounted(true);
    
    // Ensure text-to-speech doesn't auto-start by clearing any previous saved settings
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility_textToSpeech', 'false');
      
      // If speech synthesis is active, cancel it
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return <AccessibilityWidget />;
} 