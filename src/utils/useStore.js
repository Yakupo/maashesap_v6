import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  currency: 'TRY',
  monthlySalary: '',
  weekdayMultiplier: '',
  saturdayMultiplier: '',
  sundayMultiplier: '',
  holidayMultiplier: '',
  dailyWorkHours: '',
  startDate: '',
  theme: 'light',
  language: 'tr',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useStore() {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...load('mesai_settings', {}),
  }));

  const [attendance, setAttendance] = useState(() => load('mesai_attendance', {}));

  useEffect(() => {
    localStorage.setItem('mesai_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mesai_attendance', JSON.stringify(attendance));
  }, [attendance]);

  function saveSettings(newSettings) {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }

  function saveDay(dateStr, record) {
    setAttendance(prev => ({ ...prev, [dateStr]: record }));
  }

  function deleteDay(dateStr) {
    setAttendance(prev => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  }

  return { settings, attendance, saveSettings, saveDay, deleteDay };
}
