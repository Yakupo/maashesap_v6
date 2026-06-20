// Sabit milli tatiller (her yıl aynı gün)
const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: 'Yılbaşı' },
  { month: 4, day: 23, name: '23 Nisan Ulusal Egemenlik' },
  { month: 5, day: 1, name: '1 Mayıs Emek Bayramı' },
  { month: 5, day: 19, name: '19 Mayıs Atatürk\'ü Anma' },
  { month: 7, day: 15, name: '15 Temmuz Demokrasi Bayramı' },
  { month: 8, day: 30, name: '30 Ağustos Zafer Bayramı' },
  { month: 10, day: 29, name: '29 Ekim Cumhuriyet Bayramı' },
];

// localStorage'dan özel (dini) tatilleri yükle
export function loadCustomHolidays() {
  try {
    return JSON.parse(localStorage.getItem('mesai_holidays') || '[]');
  } catch {
    return [];
  }
}

export function saveCustomHolidays(list) {
  localStorage.setItem('mesai_holidays', JSON.stringify(list));
}

// dateStr: 'YYYY-MM-DD' → { isHoliday, isArefe, name }
export function getHolidayInfo(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Sabit tatil kontrolü
  const fixed = FIXED_HOLIDAYS.find(h => h.month === month && h.day === day);
  if (fixed) return { isHoliday: true, isArefe: false, name: fixed.name };

  // Özel tatil kontrolü
  const custom = loadCustomHolidays();
  const found = custom.find(h => h.date === dateStr);
  if (found) return { isHoliday: true, isArefe: found.isArefe || false, name: found.name };

  return { isHoliday: false, isArefe: false, name: null };
}

export function isHolidayDate(dateStr) {
  return getHolidayInfo(dateStr).isHoliday;
}
