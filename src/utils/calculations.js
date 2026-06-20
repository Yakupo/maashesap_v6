import { getHolidayInfo } from './holidays';

export function calcHourlyRate(monthlySalary, dailyWorkHours) {
  const s = Number(monthlySalary), h = Number(dailyWorkHours);
  if (!s || !h) return 0;
  return s / (30 * h);
}

export function calcOvertimePay(dateStr, hours, status, settings) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const hourlyRate = calcHourlyRate(settings.monthlySalary, settings.dailyWorkHours);
  let multiplier;
  if (status === 'bayram_mesai') multiplier = Number(settings.holidayMultiplier) || 2;
  else if (day === 6) multiplier = Number(settings.saturdayMultiplier) || 1.5;
  else if (day === 0) multiplier = Number(settings.sundayMultiplier) || 2;
  else multiplier = Number(settings.weekdayMultiplier) || 1.5;
  return Number(hours) * hourlyRate * multiplier;
}

export function calcMonthSummary(year, month, attendance, settings) {
  let totalOvertimeHours = 0, totalOvertimePay = 0, totalDeductions = 0;
  const salary = Number(settings.monthlySalary) || 0;
  const dailyRate = salary / 30;
  Object.entries(attendance).forEach(([dateStr, record]) => {
    const d = new Date(dateStr);
    if (d.getFullYear() === year && d.getMonth() === month) {
      if (record.status === 'mesaide' || record.status === 'bayram_mesai') {
        totalOvertimeHours += Number(record.overtimeHours) || 0;
        totalOvertimePay += calcOvertimePay(dateStr, record.overtimeHours || 0, record.status, settings);
      } else if (record.status === 'devamsiz') {
        totalDeductions += dailyRate;
      }
    }
  });
  return { totalOvertimeHours, totalOvertimePay, monthlySalary: salary, deductions: totalDeductions, netSalary: salary + totalOvertimePay - totalDeductions };
}

export function calcYearlySummary(year, attendance, settings) {
  let totalOvertimeHours = 0, totalOvertimePay = 0, totalAbsenceDays = 0, totalDeductions = 0;
  const salary = Number(settings.monthlySalary) || 0;
  const dailyRate = salary / 30;
  Object.entries(attendance).forEach(([dateStr, record]) => {
    const d = new Date(dateStr);
    if (d.getFullYear() === year) {
      if (record.status === 'mesaide' || record.status === 'bayram_mesai') {
        totalOvertimeHours += Number(record.overtimeHours) || 0;
        totalOvertimePay += calcOvertimePay(dateStr, record.overtimeHours || 0, record.status, settings);
      } else if (record.status === 'devamsiz') {
        totalAbsenceDays++;
        totalDeductions += dailyRate;
      }
    }
  });
  return { totalOvertimeHours, totalOvertimePay, totalAbsenceDays, totalDeductions };
}

export function calcYearlyAbsenceDays(year, attendance) {
  let count = 0;
  Object.entries(attendance).forEach(([dateStr, record]) => {
    const d = new Date(dateStr);
    if (d.getFullYear() === year && record.status === 'devamsiz') count++;
  });
  return count;
}

export function calcYearsWorked(startDate) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(0, (now - start) / (1000 * 60 * 60 * 24 * 365.25));
}

export function calcTenureDetailed(startDate) {
  if (!startDate) return { years: 0, months: 0, days: 0 };
  const start = new Date(startDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

export function calcSeverancePay(monthlySalary, startDate, severanceCap) {
  if (!startDate) return 0;
  const tenure = calcTenureDetailed(startDate);
  const base = Math.min(Number(monthlySalary) || 0, Number(severanceCap) || Number(monthlySalary) || 0);
  const yearsPart = base * tenure.years;
  const monthsPart = (base / 12) * tenure.months;
  const daysPart = (base / 360) * tenure.days;
  return yearsPart + monthsPart + daysPart;
}

export function calcNoticePay(monthlySalary, startDate) {
  const years = calcYearsWorked(startDate);
  let weeks = 2;
  if (years >= 6) weeks = 8;
  else if (years >= 3) weeks = 6;
  else if (years >= 1.5) weeks = 4;
  return (Number(monthlySalary) / 4) * weeks;
}

export function parseBirthDate(str) {
  if (!str) return null;
  const parts = str.split('.');
  if (parts.length !== 3) return null;
  const d = new Date(parts[2] + '-' + parts[1].padStart(2,'0') + '-' + parts[0].padStart(2,'0'));
  return isNaN(d) ? null : d;
}

export function calcAge(birthDateStr) {
  const birth = parseBirthDate(birthDateStr);
  if (!birth) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function calcAnnualLeaveDays(birthDateStr, startDate) {
  const age = calcAge(birthDateStr);
  const years = calcYearsWorked(startDate);
  if (age >= 50) return 21;
  if (years >= 5) return 21;
  return 14;
}

export function calcYearlyOvertimeHours(year, attendance) {
  let total = 0;
  Object.entries(attendance).forEach(([dateStr, record]) => {
    const d = new Date(dateStr);
    if (d.getFullYear() === year && (record.status === 'mesaide' || record.status === 'bayram_mesai')) {
      total += Number(record.overtimeHours) || 0;
    }
  });
  return total;
}

export function calcLeaveStartDate(startDate, mode, absenceDays) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  const currentYear = now.getFullYear();
  const leaveStart = new Date(start);
  leaveStart.setFullYear(currentYear);
  if (leaveStart < now) leaveStart.setFullYear(currentYear + 1);
  if (mode === 'degisken' && absenceDays > 0) leaveStart.setDate(leaveStart.getDate() + absenceDays);
  return leaveStart;
}
