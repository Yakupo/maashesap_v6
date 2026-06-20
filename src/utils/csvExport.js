export function exportToCSV(attendance, settings) {
  let csv = 'Mesai Takip Sistemi - CSV Raporu\n';
  csv += `Tarih,${new Date().toLocaleDateString('tr-TR')}\n`;
  csv += `Aylık Maaş,${settings.monthlySalary || '-'}\n`;
  csv += '\n';

  csv += 'Tarih,Durum,Mesai Saati\n';
  
  const sortedDates = Object.keys(attendance).sort();
  sortedDates.forEach(dateStr => {
    const record = attendance[dateStr];
    let status = record.status;
    if (status === 'mesaide') status = 'Mesaide';
    else if (status === 'izinli') status = 'İzinli';
    else if (status === 'devamsiz') status = 'Devamsız';
    else if (status === 'bayram_mesai') status = 'Bayram Mesaisi';
    
    const hours = record.overtimeHours || '-';
    csv += `${dateStr},${status},${hours}\n`;
  });

  csv += '\nÖzet,\n';
  csv += `Toplam Kayıt,${Object.keys(attendance).length}\n`;
  
  let totalHours = 0;
  let totalAbsence = 0;
  Object.values(attendance).forEach(record => {
    if (record.status === 'mesaide' || record.status === 'bayram_mesai') {
      totalHours += Number(record.overtimeHours) || 0;
    } else if (record.status === 'devamsiz') {
      totalAbsence++;
    }
  });
  
  csv += `Toplam Mesai Saati,${totalHours}\n`;
  csv += `Toplam Devamsızlık Günü,${totalAbsence}\n`;

  // CSV'yi indir
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `mesai_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
