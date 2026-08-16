import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'base');
  const [responseSpeed, setResponseSpeed] = useState(() => localStorage.getItem('responseSpeed') || 'normal');
  const [contrast, setContrast] = useState(() => localStorage.getItem('contrast') || 'system');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'default');

  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('notif_sound') !== 'false');
  const [desktopNotifEnabled, setDesktopNotifEnabled] = useState(() => localStorage.getItem('notif_desktop') === 'true');
  const [responseAlertsEnabled, setResponseAlertsEnabled] = useState(() => localStorage.getItem('notif_response_alerts') !== 'false');
  const [taskReminderEnabled, setTaskReminderEnabled] = useState(() => localStorage.getItem('notif_task_reminder') !== 'false');
  const [emailNotifEnabled, setEmailNotifEnabled] = useState(() => localStorage.getItem('notif_email') === 'true');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('responseSpeed', responseSpeed);
  }, [responseSpeed]);

  useEffect(() => {
    localStorage.setItem('contrast', contrast);
    const root = window.document.documentElement;
    root.classList.remove('contrast-standard', 'contrast-high');

    const applyContrast = (value) => {
      if (value === 'high') {
        root.classList.add('contrast-high');
      } else if (value === 'standard') {
        root.classList.add('contrast-standard');
      }
      // 'system' -> no extra class, follows prefers-contrast media query in CSS
    };

    if (contrast === 'system') {
      const mql = window.matchMedia('(prefers-contrast: more)');
      applyContrast(mql.matches ? 'high' : 'standard');
      const handler = (e) => applyContrast(e.matches ? 'high' : 'standard');
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      applyContrast(contrast);
    }
  }, [contrast]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    const root = window.document.documentElement;
    if (accentColor === 'default') {
      root.style.removeProperty('--primary');
    } else {
      root.style.setProperty('--primary', accentColor);
    }
  }, [accentColor, theme]);

  useEffect(() => { localStorage.setItem('notif_sound', soundEnabled); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem('notif_desktop', desktopNotifEnabled); }, [desktopNotifEnabled]);
  useEffect(() => { localStorage.setItem('notif_response_alerts', responseAlertsEnabled); }, [responseAlertsEnabled]);
  useEffect(() => { localStorage.setItem('notif_task_reminder', taskReminderEnabled); }, [taskReminderEnabled]);
  useEffect(() => { localStorage.setItem('notif_email', emailNotifEnabled); }, [emailNotifEnabled]);
  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    responseSpeed,
    setResponseSpeed,
    contrast,
    setContrast,
    accentColor,
    setAccentColor,
    soundEnabled, setSoundEnabled,
    desktopNotifEnabled, setDesktopNotifEnabled,
    responseAlertsEnabled, setResponseAlertsEnabled,
    taskReminderEnabled, setTaskReminderEnabled,
    emailNotifEnabled, setEmailNotifEnabled,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
