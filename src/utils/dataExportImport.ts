// Utility for exporting and importing localStorage data
export const DataExportImport = {
  // Export all localStorage data to a JSON file
  exportData: () => {
    const data: Record<string, any> = {};
    const keys = [
      'driversData',
      'containersData',
      'binsData',
      'balesData',
      'pickupRequestsData'
    ];
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          console.error(`Failed to parse ${key}:`, e);
        }
      }
    });
    
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data
    };
    
    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hhdonations-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Data exported successfully');
    return exportData;
  },
  
  // Import data from a JSON file
  importData: (jsonData: string | object) => {
    try {
      const importData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (!importData.data) {
        throw new Error('Invalid import file format');
      }
      
      // Store each data type in localStorage
      Object.entries(importData.data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`Imported ${key}`);
      });
      
      // Trigger a page reload to refresh all contexts
      window.location.reload();
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  },
  
  // Create file input for importing
  createImportUI: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (DataExportImport.importData(content)) {
            alert('Data imported successfully! The page will reload.');
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  },
  
  // Get current data statistics
  getDataStats: () => {
    const keys = [
      'driversData',
      'containersData', 
      'binsData',
      'balesData',
      'pickupRequestsData'
    ];
    
    const stats: Record<string, number> = {};
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const data = JSON.parse(value);
          stats[key] = Array.isArray(data) ? data.length : 0;
        } catch (e) {
          stats[key] = 0;
        }
      } else {
        stats[key] = 0;
      }
    });
    
    return stats;
  }
};

// Make it available globally for console access
(window as any).DataExportImport = DataExportImport;