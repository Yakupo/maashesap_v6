import { useState } from 'react';
import { loadCustomHolidays, saveCustomHolidays } from '../utils/holidays';

export default function HolidayManager({ onClose }) {
  const [holidays, setHolidays] = useState(loadCustomHolidays);
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [isArefe, setIsArefe] = useState(false);

  function handleAdd() {
    if (!newDate || !newName) return;
    const updated = [...holidays, { date: newDate, name: newName, isArefe }];
    setHolidays(updated);
    saveCustomHolidays(updated);
    setNewDate(''); setNewName(''); setIsArefe(false);
  }

  function handleDelete(date) {
    const updated = holidays.filter(h => h.date !== date);
    setHolidays(updated);
    saveCustomHolidays(updated);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100 text-lg">
            <span>🟢</span><span>Tatil & Bayram Yönetimi</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <p className="text-xs text-gray-400">23 Nisan, 19 Mayıs, 30 Ağustos, 29 Ekim gibi sabit tatiller otomatik tanınır. Dini bayramları buradan ekle.</p>

          {/* Yeni ekle */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-200">Yeni Tatil Ekle</div>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input type="text" placeholder="Tatil adı (ör: Ramazan Bayramı 1. Gün)" value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={isArefe} onChange={e => setIsArefe(e.target.checked)} className="w-4 h-4 accent-green-500" />
              Arefe günü (yarım gün tatil)
            </label>
            <button onClick={handleAdd}
              className="w-full py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-40"
              disabled={!newDate || !newName}>
              + Ekle
            </button>
          </div>

          {/* Liste */}
          {holidays.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-sm text-gray-700 dark:text-gray-200">Eklenen Tatiller</div>
              {holidays.sort((a, b) => a.date.localeCompare(b.date)).map(h => (
                <div key={h.date} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{h.name}</div>
                    <div className="text-xs text-gray-400">{h.date} {h.isArefe ? '· Arefe' : ''}</div>
                  </div>
                  <button onClick={() => handleDelete(h.date)} className="text-red-400 hover:text-red-600 text-lg font-bold px-2">×</button>
                </div>
              ))}
            </div>
          )}

          {holidays.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">Henüz özel tatil eklenmedi</div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
