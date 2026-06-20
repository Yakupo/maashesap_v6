import { useState } from 'react';
import { calcHourlyRate, calcNoticePay, calcSeverancePay, calcYearsWorked, calcAge, calcAnnualLeaveDays, calcLeaveStartDate, calcYearlyAbsenceDays, calcYearlyOvertimeHours, calcTenureDetailed } from '../utils/calculations';

const CURRENCY_OPTIONS = [{ value: 'TRY', label: 'Turk Lirasi (₺)' }, { value: 'USD', label: 'Dolar ($)' }, { value: 'EUR', label: 'Euro (€)' }];
const THEME_OPTIONS = [{ value: 'light', label: 'Acik Tema' }, { value: 'dark', label: 'Koyu Tema' }];

function Field({ label, children }) {
  return <div><label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</label>{children}</div>;
}
function NInput({ value, onChange, step, min, placeholder }) {
  return <input type="number" step={step} min={min} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />;
}
function TInput({ value, onChange, placeholder }) {
  return <input type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />;
}
function DInput({ value, onChange }) {
  return <input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />;
}
function Select({ value, onChange, options }) {
  return <select value={value} onChange={e => onChange(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}
function InfoCard({ label, value, sub }) {
  return <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-3"><div className="text-xs text-gray-500 dark:text-gray-400">{label}</div><div className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{value}</div>{sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}</div>;
}
function Section({ icon, title, children }) {
  return <div><div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold mb-3 text-sm">{icon} {title}</div><div className="space-y-3">{children}</div></div>;
}
function fmt(n) { return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0); }
function fmtDate(d) { if (!d) return '-'; return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

export default function SettingsModal({ settings, attendance, onSave, onClose }) {
  const [form, setForm] = useState({ ...settings });
  
  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })); }

  const currentYear = new Date().getFullYear();
  const hourly = calcHourlyRate(form.monthlySalary, form.dailyWorkHours);
  const daily = hourly * Number(form.dailyWorkHours || 0);
  const weekly = daily * 5;
  const yearly = Number(form.monthlySalary || 0) * 12;
  const years = calcYearsWorked(form.startDate);
  const severance = calcSeverancePay(form.monthlySalary, form.startDate, form.severanceCap);
  const notice = calcNoticePay(form.monthlySalary, form.startDate);
  const absenceDays = calcYearlyAbsenceDays(currentYear, attendance || {});
  const yearlyOvertimeHours = calcYearlyOvertimeHours(currentYear, attendance || {});
  const tenure = calcTenureDetailed(form.startDate);
  const age = calcAge(form.birthDate);
  const leaveDays = calcAnnualLeaveDays(form.birthDate, form.startDate);
  const leaveStart = calcLeaveStartDate(form.startDate, form.leaveMode || 'basit', absenceDays);
  const leaveEnd = leaveStart ? new Date(leaveStart.getTime() + (leaveDays - 1) * 86400000) : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-lg">⚙️ Ayarlar</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-6">

          <Section icon="💰" title="Maaş ve Mesai">
            <Field label="Para Birimi"><Select value={form.currency || 'TRY'} onChange={v => set('currency', v)} options={CURRENCY_OPTIONS} /></Field>
            <Field label="Aylık Maaş (Brüt)"><NInput value={form.monthlySalary || ''} onChange={v => set('monthlySalary', v)} min="0" placeholder="0" /></Field>
            <Field label="Hafta İçi Mesai Katsayısı"><NInput value={form.weekdayMultiplier || ''} onChange={v => set('weekdayMultiplier', v)} step="0.1" min="1" placeholder="1.5" /></Field>
            <Field label="Cumartesi Mesai Katsayısı"><NInput value={form.saturdayMultiplier || ''} onChange={v => set('saturdayMultiplier', v)} step="0.1" min="1" placeholder="1.5" /></Field>
            <Field label="Pazar Mesai Katsayısı"><NInput value={form.sundayMultiplier || ''} onChange={v => set('sundayMultiplier', v)} step="0.1" min="1" placeholder="2.0" /></Field>
            <Field label="Bayram Mesai Katsayısı"><NInput value={form.holidayMultiplier || ''} onChange={v => set('holidayMultiplier', v)} step="0.1" min="1" placeholder="2.0" /></Field>
            <Field label="Günlük Çalışma Saati"><NInput value={form.dailyWorkHours || ''} onChange={v => set('dailyWorkHours', v)} step="0.5" min="1" placeholder="7.5" /></Field>
          </Section>

          <Section icon="🧮" title="Maaş Hesaplamaları">
            <div className="grid grid-cols-2 gap-2">
              <InfoCard label="Saatlik Ücret" value={'₺' + fmt(hourly)} />
              <InfoCard label="Günlük Ücret" value={'₺' + fmt(daily)} />
              <InfoCard label="Haftalık Ücret" value={'₺' + fmt(weekly)} />
              <InfoCard label="Yıllık Ücret" value={'₺' + fmt(yearly)} />
            </div>
          </Section>

          <Section icon="📋" title="Kıdem ve İhbar Tazminatı">
            <Field label="İşe Başlangıç Tarihi"><DInput value={form.startDate} onChange={v => set('startDate', v)} /></Field>
            <Field label="Kıdem Tazminatı Tavanı (Brüt)"><NInput value={form.severanceCap || ''} onChange={v => set('severanceCap', v)} min="0" placeholder="Tavan tutarı girin" /></Field>
            {form.startDate && (
              <div className="text-xs text-gray-400 text-center bg-gray-50 dark:bg-gray-700 rounded-lg py-2">
                Çalışma süresi: <strong>{tenure.years} yıl {tenure.months} ay {tenure.days} gün</strong>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <InfoCard label="Kıdem Tazminatı" value={'₺' + fmt(severance)} sub={form.severanceCap ? 'Tavan: ₺' + fmt(form.severanceCap) : 'Tavan girilmedi'} />
              <InfoCard label="İhbar Tazminatı" value={'₺' + fmt(notice)} />
            </div>
          </Section>

          <Section icon="🏖️" title="Yıllık İzin">
            <Field label="Doğum Tarihi (gg.mm.yyyy)"><TInput value={form.birthDate || ''} onChange={v => set('birthDate', v)} placeholder="01.01.1990" /></Field>
            {form.birthDate && age > 0 && (
              <div className="text-xs text-gray-400 text-center bg-gray-50 dark:bg-gray-700 rounded-lg py-2">
                Yaş: <strong>{age}</strong>{age >= 50 ? ' · 50 üzeri → 21 gün hak' : ''}
              </div>
            )}
            <Field label="İzin Başlangıç Modu">
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'basit', label: '📅 Basit', sub: 'Giriş + 1 yıl' }, { value: 'degisken', label: '📅 Değişken', sub: '+ Devamsızlık günleri' }].map(opt => (
                  <button key={opt.value} onClick={() => set('leaveMode', opt.value)}
                    className={'p-3 rounded-xl border-2 text-left transition-all ' + ((form.leaveMode || 'basit') === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-600')}>
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">{opt.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </Field>
            <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Yıllık izin hakkı</span><strong className="text-gray-800 dark:text-gray-100">{leaveDays} gün</strong></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{currentYear} devamsızlık</span><strong className="text-red-500">{absenceDays} gün</strong></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{currentYear} toplam mesai</span><strong className="text-green-600 dark:text-green-400">{yearlyOvertimeHours} saat</strong></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">İzin başlangıcı</span><strong className="text-blue-600 dark:text-blue-400">{fmtDate(leaveStart)}</strong></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">İzin bitişi</span><strong className="text-blue-600 dark:text-blue-400">{fmtDate(leaveEnd)}</strong></div>
            </div>
          </Section>

          <Section icon="🎨" title="Görünüm">
            <Field label="Tema"><Select value={form.theme || 'light'} onChange={v => set('theme', v)} options={THEME_OPTIONS} /></Field>
          </Section>

        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold">İptal</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Kaydet</button>
        </div>
      </div>
    </div>
  );
}
