import { MenuItem } from './menu-data';

export type WeatherMode = 'sunny' | 'rainy' | 'cold';

// ─── Greeting text (time-based) ─────────────────────────────────────────────
export function getGreetingText(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '☀️ Good Morning! Fresh breakfast & snacks for you';
  if (hour < 17) return '🌤️ Good Afternoon! Afternoon cravings & meals';
  return '🌙 Good Evening! Time for authentic Puneri Bhel & Chaat';
}

// ─── Recommendation panel title ──────────────────────────────────────────────
export function getRecommendationTitle(weather: WeatherMode): string {
  const hour = new Date().getHours();
  if (weather === 'rainy') return 'Rainy Day Crispy Bhaji & Hot Chai 🌧️';
  if (weather === 'cold') return 'Winter Warmers & Hot Sambar ❄️';
  if (hour < 12) return 'Breakfast Specials & South Indian 🍳';
  if (hour < 17) return 'Lunch Time Favourites & Meals 🍽️';
  return 'Evening Bhel & Street Food Special 🥣';
}

// ─── Recommendation subtitle ─────────────────────────────────────────────────
export function getRecommendationSubtitle(weather: WeatherMode, temp: number): string {
  const t = temp.toFixed(0);
  const hour = new Date().getHours();
  if (weather === 'rainy') return "It's rainy outside — hot Kanda Bhaji & Chai await!";
  if (weather === 'cold') return `${t}°C outside — warm your soul with hot Misal & Coffee`;
  if (hour < 12) return 'Start your morning with hot Pohe, Idli & filter Coffee';
  if (hour < 17) return `${t}°C • Wholesome Veg Thali, Dosas & Grilled Sandwiches`;
  return `${t}°C • Authentic SPDP, Shev Puri, Bhel & Thick Cold Coffee`;
}

// ─── Smart recommendations ───────────────────────────────────────────────────
export function getRecommendations(
  menu: MenuItem[],
  weather: WeatherMode,
): MenuItem[] {
  const hour = new Date().getHours();

  if (weather === 'rainy' || weather === 'cold') {
    return menu
      .filter((item) =>
        ['Breakfast & Snacks', 'Hot & Cold Drinks', 'Maggi & Fries'].includes(item.category),
      )
      .slice(0, 5);
  }

  if (hour < 12) {
    return menu
      .filter((item) =>
        ['Breakfast & Snacks', 'South Indian', 'Hot & Cold Drinks'].includes(item.category),
      )
      .slice(0, 5);
  }
  if (hour < 17) {
    return menu
      .filter((item) =>
        ['Meals', 'South Indian', 'Sandwich', 'Pizza', 'Burger'].includes(item.category),
      )
      .slice(0, 5);
  }
  return menu
    .filter((item) =>
      ['Bhel & Chaat', 'Sandwich', 'Hot & Cold Drinks', 'Pizza', 'Burger'].includes(item.category),
    )
    .slice(0, 5);
}

// ─── Culinary quotes ─────────────────────────────────────────────────────────
export const QUOTES = [
  { text: 'पुण्याची शान, सुदामाची चव — भेळ आणि चाट ची खरी मजा!', author: 'सुदामा भेळ पुणे' },
  { text: 'One cannot think well, love well, sleep well, if one has not dined well.', author: 'Virginia Woolf' },
  { text: 'People who love to eat are always the best people.', author: 'Julia Child' },
  { text: 'Good food is the foundation of genuine happiness.', author: 'Auguste Escoffier' },
];
