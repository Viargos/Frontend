export const THEME_BACKGROUND_STORAGE_KEY = 'viargos-theme-background';
export const THEME_BACKGROUND_AUTO_ROTATE_STORAGE_KEY = 'viargos-theme-background-auto-rotate';

export const THEME_BACKGROUNDS = [
  {
    description: 'A dark spectrum with vivid color.',
    id: 'black-rainbow',
    name: 'Midnight spectrum',
    overlayOpacity: 0.28,
    src: '/assets/images/background/black_rainbow.png',
  },
  {
    description: 'A monochrome background with strong contrast.',
    id: 'black-white',
    name: 'Monochrome',
    overlayOpacity: 0.2,
    src: '/assets/images/background/black_white.png',
  },
  {
    description: 'A calm blue background inspired by open skies.',
    id: 'blue',
    name: 'Ocean blue',
    overlayOpacity: 0.18,
    src: '/assets/images/background/blue.png',
  },
  {
    description: 'A fresh green background inspired by nature.',
    id: 'green',
    name: 'Forest green',
    overlayOpacity: 0.2,
    src: '/assets/images/background/green.png',
  },
  {
    description: 'A rich purple background with a dreamy feel.',
    id: 'purple',
    name: 'Twilight purple',
    overlayOpacity: 0.22,
    src: '/assets/images/background/purple.png',
  },
  {
    description: 'A warm red background with a bold finish.',
    id: 'red',
    name: 'Sunset red',
    overlayOpacity: 0.24,
    src: '/assets/images/background/red.png',
  },
  {
    backgroundPresentation: {
      backgroundPosition: 'top left',
      backgroundRepeat: 'repeat',
      backgroundSize: '900px 900px',
    },
    description: 'Viargos travel icons on a deep navy background.',
    id: 'viargos-theme',
    name: 'Viargos travel',
    overlayOpacity: 0.12,
    src: '/assets/images/background/viargos_theme.png',
  },
  {
    description: 'A bright monochrome background with soft contrast.',
    id: 'white-black',
    name: 'Soft monochrome',
    overlayOpacity: 0.16,
    src: '/assets/images/background/white_black.png',
  },
] as const;

export type ThemeBackgroundId = typeof THEME_BACKGROUNDS[number]['id'];
export type ThemeBackgroundOption = typeof THEME_BACKGROUNDS[number];

export function getThemeBackground(backgroundId: string | null) {
  return THEME_BACKGROUNDS.find(background => background.id === backgroundId) ?? null;
}
