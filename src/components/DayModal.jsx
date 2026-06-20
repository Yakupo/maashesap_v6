import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getHolidayInfo } from '../utils/holidays';

export default function DayModal({ date, record, onSave, onDelete, onClose }) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const holidayInfo = getHolidayInfo(dateStr);

  const STATUS_OPTIONS = [
    { value: 'mesaide', label: 'Mesaide' },
    { value: 'izinli', label: 'İzinli' },
    { value: 'devamsiz', label: 'Devamsız' },
    ...(holidayInfo.isHoliday ? [{ value: 'bayram_mesai', label: '🟢 Bayram Mesaisi (x2)' }] : []),
  ];

  const [status, setStatus] = useState(record?.status || 'mesaide');
  const [hours, setHours] = useState(record?.overtimeHours ?? 7.5);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const dateLabel = format(date, 'd MMMM yyyy', { locale: tr });

  function handleSave() {
    onSave({ status, overtimeHours: parseFloat(hours) || 0 });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-lg">
            <span>🕐</span>
            <span>{dateLabel}</span>
            {holidayInfo.isHoliday && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{holidayInfo.name}</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Durum</label>
            <div className="relative">
              <button
                onClick={() => setShowStatusPicker(!showStatusPicker)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-left flex justify-between items-center bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <span>{STATUS_OPTIONS.find(o => o.value === status)?.label}</span>
                <span className="text-gray-400">▾</span>
              </button>

              {showStatusPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setStatus(opt.value); setShowStatusPicker(false); }}
                      className="w-full px-4 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0 text-gray-800 dark:text-gray-100"
                    >
                      <span>{opt.label}</span>
                      {status === opt.value && <span className="text-teal-500">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(status === 'mesaide' || status === 'bayram_mesai') && (
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Mesai Saati</label>
              <input
                type="number" step="0.5" min="0" max="24"
                value={hours}
                onChange={e => setHours(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          {record && (
            <button onClick={onDelete} className="flex-1 py-3 rounded-xl border-2 border-red-400 text-red-500 font-semibold hover:bg-red-50">
              Sil
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">
            İptal
          </button>
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
