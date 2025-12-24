import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ThemeSelector() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      const current = localStorage.getItem('theme') || 'dark';
      if (current === 'system') {
        applyTheme('system');
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: 'system' } }));
      }
    };
    media.addEventListener('change', onSystemChange);

    const onStorage = (e) => {
      if (e.key === 'theme') {
        const next = e.newValue || 'dark';
        setTheme(next);
        applyTheme(next);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      media.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (newTheme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.remove('light', 'dark');
      root.classList.add(prefersDark ? 'dark' : 'light');
    }
    
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentThemeObj = themes.find(t => t.value === theme);
  const CurrentIcon = currentThemeObj?.icon || Moon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 w-full justify-start gap-3"
        >
          <Palette className="w-4 h-4" />
          <span>{currentThemeObj?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 min-w-[160px]">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => changeTheme(themeOption.value)}
              className={`text-slate-300 hover:bg-slate-700 cursor-pointer flex items-center gap-3 ${
                theme === themeOption.value ? 'bg-slate-700/50' : ''
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{themeOption.label}</span>
              {theme === themeOption.value && (
                <span className="ml-auto text-blue-400">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
