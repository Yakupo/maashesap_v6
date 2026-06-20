import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, addMonths, subMonths
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { useStore } from './utils/useStore';
import { calcMonthSummary, calcYearlyAbsenceDays, calcYearlyOvertimeHours } from './utils/calculations';
import { isHolidayDate } from './utils/holidays';
import { exportToCSV } from './utils/csvExport';
import DayModal from './components/DayModal';
import SettingsModal from './components/SettingsModal';
import HolidayManager from './components/HolidayManager';
import AdBanner from './components/AdBanner';

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function fmt(n) {
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function getMondayIndex(date) {
  const d = getDay(date);
  return d === 0 ? 6 : d - 1;
}

export default function App() {
  const { settings, attendance, saveSettings, saveDay, deleteDay } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHolidays, setShowHolidays] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const firstDayOffset = getMondayIndex(days[0]);
  const summary = calcMonthSummary(year, month, attendance, settings);
  
  // Yıllık özet
  const yearlyAbsenceDays = calcYearlyAbsenceDays(year, attendance);
  const yearlyOvertimeHours = calcYearlyOvertimeHours(year, attendance);

  function dateKey(date) { return format(date, 'yyyy-MM-dd'); }
  function getDayRecord(date) { return attendance[dateKey(date)]; }
  function isWeekend(date) { const d = getDay(date); return d === 0 || d === 6; }

  function handleSaveDay(record) { saveDay(dateKey(selectedDate), record); setSelectedDate(null); }
  function handleDeleteDay() { deleteDay(dateKey(selectedDate)); setSelectedDate(null); }

  function handleResetMonth() {
    days.forEach(date => {
      const key = dateKey(date);
      if (attendance[key]) deleteDay(key);
    });
    setShowResetConfirm(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-4 px-2">

      <AdBanner />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between">
          <div className="text-lg font-bold">📊 Mesai Takip</div>
          <button onClick={() => setShowSettings(true)} className="text-2xl hover:scale-110 transition">⚙️</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xl font-bold">‹</button>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              {format(currentDate, 'MMMM yyyy', { locale: tr }).replace(/^\w/, c => c.toUpperCase())}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xl font-bold">›</button>
            <button onClick={() => setShowHolidays(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-1 text-base" title="Tatil Yönetimi">🟢</button>
            <button onClick={() => setShowSettings(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-base">⚙️</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-semibold py-1 ${i >= 5 ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(date => {
              const key = dateKey(date);
              const record = getDayRecord(date);
              const isToday = isSameDay(date, today);
              const weekend = isWeekend(date);
              const holiday = isHolidayDate(key);

              let numColor = 'text-gray-700 dark:text-gray-200';
              if (holiday) numColor = 'text-green-600 font-bold';
              else if (weekend) numColor = 'text-red-500';

              let bgColor = record ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-blue-50 dark:bg-gray-700/50';
              if (holiday) bgColor = record ? 'bg-green-200 dark:bg-green-900/40' : 'bg-green-50 dark:bg-green-900/20';

              return (
                <button key={key} onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center rounded-xl py-1.5 text-xs transition-all
                    ${isToday ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                    ${bgColor} hover:brightness-95`}>
                  <span className={`font-semibold text-sm leading-none ${numColor}`}>
                    {format(date, 'd')}
                  </span>
                  {record && (
                    <span className={`text-[10px] mt-0.5 font-medium ${
                      record.status === 'bayram_mesai' ? 'text-green-700 dark:text-green-400' :
                      record.status === 'mesaide' ? 'text-blue-600 dark:text-blue-400' :
                      record.status === 'izinli' ? 'text-orange-500' : 'text-red-500'}`}>
                      {record.status === 'mesaide' || record.status === 'bayram_mesai'
                        ? `${record.overtimeHours}s`
                        : record.status === 'izinli' ? 'İzin' : 'Dev.'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-3 mt-3 text-[10px] text-gray-400 justify-center">
            <span><span className="text-red-400">■</span> Hafta sonu</span>
            <span><span className="text-green-500">■</span> Resmi tatil</span>
            <span><span className="text-yellow-400">■</span> Bugün</span>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: 'Aylık Maaş', value: `₺${fmt(summary.monthlySalary)}`, color: 'text-gray-800 dark:text-gray-100' },
            { label: 'Mesai Ücreti', value: `+₺${fmt(summary.totalOvertimePay)}`, color: 'text-green-500' },
            { label: 'Kesintiler', value: `-₺${fmt(summary.deductions)}`, color: 'text-red-500' },
            { label: 'Net Ücret', value: `₺${fmt(summary.netSalary)}`, color: 'text-blue-600 dark:text-blue-400' },
          ].map(card => (
            <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{card.label}</div>
              <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm text-center mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Toplam Mesai: <strong className="text-gray-700 dark:text-gray-200">{summary.totalOvertimeHours} saat</strong>
          </span>
        </div>

        <div className="bg-blue-50 dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm mb-3">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">📊 {year} Yıllık Özet</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Mesai Saati:</span><strong className="text-green-600 dark:text-green-400">{yearlyOvertimeHours} saat</strong></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Devamsızlık:</span><strong className="text-red-600 dark:text-red-400">{yearlyAbsenceDays} gün</strong></div>
          </div>
        </div>








      </div>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-1">Ay Sıfırlansın mı?</div>
              <div className="text-sm text-gray-500">
                {format(currentDate, 'MMMM yyyy', { locale: tr })} ayına ait tüm girişler silinecek.
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold">
                İptal
              </button>
              <button onClick={handleResetMonth}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600">
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <DayModal date={selectedDate} record={getDayRecord(selectedDate)}
          onSave={handleSaveDay} onDelete={handleDeleteDay} onClose={() => setSelectedDate(null)} />
      )}
      {showSettings && (
        <SettingsModal settings={settings} attendance={attendance} onSave={saveSettings} onClose={() => setShowSettings(false)} />
      )}
      {showHolidays && (
        <HolidayManager onClose={() => setShowHolidays(false)} />
      )}

      {/* Reset Confirm Modal */}
      <div className="w-full max-w-sm mt-2">
        <AdBanner />
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(attendance, settings)}
            className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-500 text-sm font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-all mt-2"
          >
            📊 CSV İndir
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 py-3 rounded-2xl border-2 border-red-200 text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-2"
          >
            🗑️ Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
