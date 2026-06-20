const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Electron API'ları gerekirse burada eklenebilir
});
