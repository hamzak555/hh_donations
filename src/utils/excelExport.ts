import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';

// @ts-ignore
window.XLSX = XLSX;

// Brand colors
const brandColors = {
  darkGreen: '0B503C',  // Remove # for Excel color format
  white: 'FFFFFF',
  lightGray: 'F3F4F6',
  gray: '6B7280'
};

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  dataFormat?: string;
}

interface ExcelReportConfig {
  filename: string;
  sheetName: string;
  title: string;
  subtitle?: string;
  dateRange?: { from: Date; to: Date };
  columns: ExcelColumn[];
  data: any[];
  summary?: { label: string; value: any }[];
  additionalSheets?: {
    name: string;
    title: string;
    columns: ExcelColumn[];
    data: any[];
    summary?: { label: string; value: any }[];
    additionalTables?: {
      title: string;
      columns: ExcelColumn[];
      data: any[];
    }[];
  }[];
}

// Format value based on type
const formatValue = (value: any, dataFormat?: string): any => {
  if (value === null || value === undefined) return '';
  
  switch (dataFormat) {
    case 'currency':
      return typeof value === 'number' ? value : 0;
    case 'number':
      return typeof value === 'number' ? value : 0;
    case 'percentage':
      return typeof value === 'number' ? value : 0;
    case 'date':
      return value instanceof Date ? formatDate(value, 'MMM dd, yyyy') : value;
    case 'weight':
      return typeof value === 'number' ? value : 0;
    default:
      return value;
  }
};

// Get cell format based on dataFormat type
const getCellFormat = (dataFormat?: string): any => {
  switch (dataFormat) {
    case 'currency':
      return { numFmt: '$#,##0.00' };
    case 'number':
      return { numFmt: '#,##0' };
    case 'percentage':
      return { numFmt: '0.00%' };
    case 'weight':
      return { numFmt: '#,##0 "kg"' };
    case 'weight_no_decimal':
      return { numFmt: '#,##0 "kg"' };
    case 'currency_no_decimal':
      return { numFmt: '$#,##0' };
    default:
      return {};
  }
};

export const generateExcelReport = async (config: ExcelReportConfig) => {
  const wb = XLSX.utils.book_new();
  
  // Process sheet
  const processSheet = (
    sheetName: string,
    title: string,
    subtitle: string | undefined,
    columns: ExcelColumn[],
    data: any[],
    summary: { label: string; value: any }[] | undefined,
    isMainSheet: boolean = true,
    dateRange?: { from: Date; to: Date },
    additionalTables?: { title: string; columns: ExcelColumn[]; data: any[] }[]
  ) => {
    const wsData: any[][] = [];
    const styles: any = {};
    let currentRow = 0;
    
    if (isMainSheet) {
      // Row 1: Company Name (merge cells A1:D1)
      wsData.push(['H&H Donations', '', '', '']);
      styles[`A${currentRow + 1}`] = {
        font: { bold: true, sz: 20, color: { rgb: brandColors.darkGreen } },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: 'F0FDF4' } },
        border: {
          bottom: { style: 'medium', color: { rgb: brandColors.darkGreen } }
        }
      };
      // Apply same style to merged cells
      styles[`B${currentRow + 1}`] = styles[`A${currentRow + 1}`];
      styles[`C${currentRow + 1}`] = styles[`A${currentRow + 1}`];
      styles[`D${currentRow + 1}`] = styles[`A${currentRow + 1}`];
      currentRow++;
      
      // Row 2: Report Title
      wsData.push([title, '', '', '']);
      styles[`A${currentRow + 1}`] = {
        font: { bold: true, sz: 16, color: { rgb: brandColors.darkGreen } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
      styles[`B${currentRow + 1}`] = styles[`A${currentRow + 1}`];
      styles[`C${currentRow + 1}`] = styles[`A${currentRow + 1}`];
      styles[`D${currentRow + 1}`] = styles[`A${currentRow + 1}`];
      currentRow++;
      
      // Row 3: Date Range
      if (config.dateRange) {
        const dateRangeText = `Report Period: ${formatDate(config.dateRange.from, 'MMM dd, yyyy')} - ${formatDate(config.dateRange.to, 'MMM dd, yyyy')}`;
        wsData.push([dateRangeText, '', '', '']);
        styles[`A${currentRow + 1}`] = {
          font: { sz: 12, color: { rgb: brandColors.gray } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
        styles[`B${currentRow + 1}`] = styles[`A${currentRow + 1}`];
        styles[`C${currentRow + 1}`] = styles[`A${currentRow + 1}`];
        styles[`D${currentRow + 1}`] = styles[`A${currentRow + 1}`];
        currentRow++;
      }
      
      // Empty row
      wsData.push([]);
      currentRow++;
    } else {
      // For additional sheets
      wsData.push([title]);
      styles[`A${currentRow + 1}`] = {
        font: { bold: true, sz: 16, color: { rgb: brandColors.darkGreen } },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
      currentRow++;
      
      // Add date range for additional sheets if provided
      if (dateRange) {
        const dateRangeText = `Report Period: ${formatDate(dateRange.from, 'MMM dd, yyyy')} - ${formatDate(dateRange.to, 'MMM dd, yyyy')}`;
        wsData.push([dateRangeText]);
        styles[`A${currentRow + 1}`] = {
          font: { sz: 12, color: { rgb: brandColors.gray } },
          alignment: { horizontal: 'left', vertical: 'center' }
        };
        currentRow++;
      }
      
      wsData.push([]);
      currentRow++;
    }
    
    // Add summary section if provided
    if (summary && summary.length > 0) {
      wsData.push(['Key Metrics']);
      styles[`A${currentRow + 1}`] = {
        font: { bold: true, sz: 14, color: { rgb: brandColors.darkGreen } },
        fill: { fgColor: { rgb: brandColors.lightGray } },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
      currentRow++;
      
      summary.forEach((item, index) => {
        wsData.push([item.label, item.value]);
        // Style label cell
        styles[`A${currentRow + 1}`] = {
          font: { bold: true, color: { rgb: brandColors.darkGreen } },
          fill: { fgColor: { rgb: brandColors.lightGray } },
          alignment: { horizontal: 'right', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } }
          }
        };
        // Style value cell
        styles[`B${currentRow + 1}`] = {
          font: { bold: true, sz: 12, color: { rgb: brandColors.darkGreen } },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } }
          }
        };
        currentRow++;
      });
      
      // Empty row after summary
      wsData.push([]);
      currentRow++;
    }
    
    // Add headers with dark green background and white text
    const headers = columns.map(col => col.header);
    wsData.push(headers);
    const headerRow = currentRow + 1;
    
    // Style each header cell
    columns.forEach((col, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: colIndex });
      styles[cellAddress] = {
        font: { bold: true, color: { rgb: brandColors.white }, sz: 12 },
        fill: { fgColor: { rgb: brandColors.darkGreen } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'medium', color: { rgb: '000000' } },
          bottom: { style: 'medium', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    });
    currentRow++;
    
    // Add data with alternating row colors
    data.forEach((row, rowIndex) => {
      const rowData = columns.map(col => {
        const value = row[col.key];
        return formatValue(value, col.dataFormat);
      });
      wsData.push(rowData);
      
      // Check if this is a totals row
      const isTotalsRow = row.baleNumber === 'TOTAL' || row.number === 'TOTAL' || row.location === 'TOTAL' || row.quality === 'TOTAL';
      
      // Style data cells
      columns.forEach((col, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: colIndex });
        const baseStyle = {
          font: isTotalsRow ? { sz: 11, bold: true } : { sz: 11 },
          fill: isTotalsRow 
            ? { fgColor: { rgb: brandColors.lightGray } }
            : (rowIndex % 2 === 0 ? { fgColor: { rgb: 'FFFFFF' } } : { fgColor: { rgb: 'F9FAFB' } }),
          border: isTotalsRow 
            ? {
                top: { style: 'medium', color: { rgb: brandColors.darkGreen } },
                bottom: { style: 'medium', color: { rgb: brandColors.darkGreen } },
                left: { style: 'medium', color: { rgb: brandColors.darkGreen } },
                right: { style: 'medium', color: { rgb: brandColors.darkGreen } }
              }
            : {
                top: { style: 'thin', color: { rgb: 'E5E7EB' } },
                bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
                left: { style: 'thin', color: { rgb: 'E5E7EB' } },
                right: { style: 'thin', color: { rgb: 'E5E7EB' } }
              },
          alignment: { horizontal: col.dataFormat === 'currency' || col.dataFormat === 'number' ? 'right' : 'left', vertical: 'center' }
        };
        
        // Add number format if needed
        const cellFormat = getCellFormat(col.dataFormat);
        styles[cellAddress] = { ...baseStyle, ...cellFormat };
      });
      
      currentRow++;
    });
    
    // Process additional tables if provided
    if (additionalTables && additionalTables.length > 0) {
      additionalTables.forEach((table, tableIndex) => {
        // Add spacing between tables
        wsData.push([]);
        currentRow++;
        wsData.push([]);
        currentRow++;
        
        // Add table title
        wsData.push([table.title]);
        styles[`A${currentRow + 1}`] = {
          font: { bold: true, sz: 14, color: { rgb: brandColors.darkGreen } },
          alignment: { horizontal: 'left', vertical: 'center' }
        };
        currentRow++;
        wsData.push([]);
        currentRow++;
        
        // Add table headers
        const tableHeaders = table.columns.map(col => col.header);
        wsData.push(tableHeaders);
        const tableHeaderRow = currentRow + 1;
        
        // Style table header cells
        table.columns.forEach((col, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: colIndex });
          styles[cellAddress] = {
            font: { bold: true, color: { rgb: brandColors.white }, sz: 12 },
            fill: { fgColor: { rgb: brandColors.darkGreen } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'medium', color: { rgb: '000000' } },
              bottom: { style: 'medium', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            }
          };
        });
        currentRow++;
        
        // Add table data
        table.data.forEach((row, rowIndex) => {
          const rowData = table.columns.map(col => {
            const value = row[col.key];
            return formatValue(value, col.dataFormat);
          });
          wsData.push(rowData);
          
          // Check if this is a totals row
          const isTotalsRow = row.quality === 'TOTAL';
          
          // Style table data cells
          table.columns.forEach((col, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: colIndex });
            const baseStyle = {
              font: isTotalsRow ? { sz: 11, bold: true } : { sz: 11 },
              fill: isTotalsRow 
                ? { fgColor: { rgb: brandColors.lightGray } }
                : (rowIndex % 2 === 0 ? { fgColor: { rgb: 'FFFFFF' } } : { fgColor: { rgb: 'F9FAFB' } }),
              border: isTotalsRow 
                ? {
                    top: { style: 'medium', color: { rgb: brandColors.darkGreen } },
                    bottom: { style: 'medium', color: { rgb: brandColors.darkGreen } },
                    left: { style: 'medium', color: { rgb: brandColors.darkGreen } },
                    right: { style: 'medium', color: { rgb: brandColors.darkGreen } }
                  }
                : {
                    top: { style: 'thin', color: { rgb: 'E5E7EB' } },
                    bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
                    left: { style: 'thin', color: { rgb: 'E5E7EB' } },
                    right: { style: 'thin', color: { rgb: 'E5E7EB' } }
                  },
              alignment: { horizontal: col.dataFormat === 'currency' || col.dataFormat === 'number' || col.dataFormat === 'weight_no_decimal' ? 'right' : 'left', vertical: 'center' }
            };
            
            // Add number format if needed
            const cellFormat = getCellFormat(col.dataFormat);
            styles[cellAddress] = { ...baseStyle, ...cellFormat };
          });
          
          currentRow++;
        });
      });
    }
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Apply all styles
    Object.keys(styles).forEach(cell => {
      if (!ws[cell]) ws[cell] = {};
      ws[cell].s = styles[cell];
    });
    
    // Set column widths
    const colWidths: any[] = [];
    columns.forEach((col, index) => {
      colWidths.push({ wch: col.width || 15 });
    });
    ws['!cols'] = colWidths;
    
    // Set row heights for better readability
    const rowHeights: any[] = [];
    for (let i = 0; i <= currentRow; i++) {
      if (i === 0 && isMainSheet) {
        rowHeights.push({ hpx: 35 }); // Company name row
      } else if (i === 1 && isMainSheet) {
        rowHeights.push({ hpx: 25 }); // Title row
      } else if (i === headerRow - 1) {
        rowHeights.push({ hpx: 25 }); // Header row
      } else {
        rowHeights.push({ hpx: 20 }); // Data rows
      }
    }
    ws['!rows'] = rowHeights;
    
    // Add merges for header rows if main sheet
    if (isMainSheet) {
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: Math.min(3, columns.length - 1) } }, // Company name
        { s: { r: 1, c: 0 }, e: { r: 1, c: Math.min(3, columns.length - 1) } }, // Title
      ];
      if (config.dateRange) {
        ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: Math.min(3, columns.length - 1) } }); // Date range
      }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };
  
  // Process main sheet
  processSheet(
    config.sheetName,
    config.title,
    config.subtitle,
    config.columns,
    config.data,
    config.summary,
    true
  );
  
  // Process additional sheets if any
  if (config.additionalSheets) {
    config.additionalSheets.forEach(sheet => {
      processSheet(
        sheet.name,
        sheet.title,
        undefined,
        sheet.columns,
        sheet.data,
        sheet.summary,
        false,
        config.dateRange,
        sheet.additionalTables
      );
    });
  }
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // Save file
  const filename = `${config.filename}_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  saveAs(blob, filename);
};

// Specific export functions for Financial and Operational reports
export const exportFinancialReport = async (
  dateRange: { from: Date; to: Date },
  salesData: any,
  balesData: any[],
  containersData: any,
  unsoldBalesData: any[],
  containers: any[] = []
) => {
  const config: ExcelReportConfig = {
    filename: 'HH_Financial_Report',
    sheetName: 'Financial Overview',
    title: 'Financial Report',
    dateRange,
    columns: [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20, dataFormat: 'currency' },
      { header: 'Count', key: 'count', width: 15, dataFormat: 'number' },
      { header: 'Average', key: 'average', width: 20, dataFormat: 'currency' }
    ],
    data: [
      { metric: 'Total Revenue', value: salesData.totalSales, count: salesData.count, average: salesData.totalSales / Math.max(salesData.count, 1) },
      { metric: 'Total Weight Sold (kg)', value: salesData.totalWeight, count: salesData.count, average: salesData.totalWeight / Math.max(salesData.count, 1) },
      { metric: 'Average Price per kg', value: salesData.avgPricePerKg, count: null, average: salesData.avgPricePerKg },
      { metric: 'Unsold Bales', value: salesData.unsoldWeight, count: salesData.unsoldCount, average: salesData.unsoldWeight / Math.max(salesData.unsoldCount, 1) },
      { metric: 'Containers Shipped', value: null, count: containersData.shippedCount, average: null },
      { metric: 'Containers in Warehouse', value: null, count: containersData.unshippedCount, average: null }
    ],
    summary: [
      { label: 'Total Revenue:', value: `$${salesData.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
      { label: 'Bales Sold:', value: salesData.count },
      { label: 'Unsold Inventory:', value: salesData.unsoldCount },
      { label: 'Avg Price/kg:', value: `$${salesData.avgPricePerKg.toFixed(2)}` }
    ],
    additionalSheets: [
      {
        name: 'Sold Bales',
        title: 'SOLD BALES',
        columns: [
          { header: 'Bale #', key: 'baleNumber', width: 15 },
          { header: 'Quality', key: 'contents', width: 15 },
          { header: 'Weight (kg)', key: 'weight', width: 15, dataFormat: 'weight_no_decimal' },
          { header: 'Sale Price', key: 'salePrice', width: 15, dataFormat: 'currency_no_decimal' },
          { header: 'Price/kg', key: 'pricePerKg', width: 15, dataFormat: 'currency' },
          { header: 'Date Sold', key: 'soldDate', width: 20, dataFormat: 'date' },
          { header: 'Sold Location', key: 'soldLocation', width: 25 },
          { header: 'Container', key: 'containerDisplay', width: 20 },
          { header: 'Method of Payment', key: 'paymentMethod', width: 20 }
        ],
        data: (() => {
          const mappedData = balesData.map(bale => {
            // Look up container destination for sold location
            let soldLocation = 'Warehouse';
            if (bale.containerNumber && containers.length > 0) {
              const container = containers.find(c => c.containerNumber === bale.containerNumber);
              if (container?.destination) {
                soldLocation = container.destination;
              }
            }
            
            return {
              ...bale,
              baleNumber: bale.number || bale.baleNumber || '',
              pricePerKg: bale.weight > 0 ? bale.salePrice / bale.weight : 0,
              soldDate: bale.soldDate ? new Date(bale.soldDate) : null,
              soldLocation: soldLocation,
              containerDisplay: bale.containerNumber || 'Warehouse',
              paymentMethod: bale.paymentMethod || ''
            };
          });
          
          // Add totals row
          const totalWeight = mappedData.reduce((sum, bale) => sum + (bale.weight || 0), 0);
          const totalSalePrice = mappedData.reduce((sum, bale) => sum + (bale.salePrice || 0), 0);
          const avgPricePerKg = totalWeight > 0 ? totalSalePrice / totalWeight : 0;
          
          mappedData.push({
            baleNumber: 'TOTAL',
            contents: '',
            weight: totalWeight,
            salePrice: totalSalePrice,
            pricePerKg: avgPricePerKg,
            soldDate: null,
            soldLocation: '',
            containerDisplay: '',
            paymentMethod: ''
          });
          
          return mappedData;
        })()
      },
      {
        name: 'Unsold Bales',
        title: 'UNSOLD BALES BY DESTINATION',
        columns: [],
        data: [],
        additionalTables: (() => {
          // First, map all unsold bales with their destinations
          const mappedData = unsoldBalesData.map(bale => {
            // Determine destination based on container's destination
            let destination = 'In Warehouse';
            if (bale.containerNumber && containers.length > 0) {
              const container = containers.find(c => c.containerNumber === bale.containerNumber);
              if (container && container.destination) {
                // Show the container's destination regardless of shipped status
                destination = container.destination;
              }
            }
            
            return {
              ...bale,
              baleNumber: bale.number || bale.baleNumber || '',
              dateCreated: bale.createdDate ? new Date(bale.createdDate) : (bale.dateCreated ? new Date(bale.dateCreated) : (bale.createdAt ? new Date(bale.createdAt) : (bale.date ? new Date(bale.date) : null))),
              containerDisplay: bale.containerNumber || 'Warehouse',
              destination: destination
            };
          });
          
          // Group bales by destination
          const balesByDestination: { [key: string]: any[] } = {};
          mappedData.forEach(bale => {
            const dest = bale.destination || 'In Warehouse';
            if (!balesByDestination[dest]) {
              balesByDestination[dest] = [];
            }
            balesByDestination[dest].push(bale);
          });
          
          // Create a table for each destination
          const tables: any[] = [];
          const sortedDestinations = Object.keys(balesByDestination).sort();
          
          sortedDestinations.forEach(destination => {
            const destinationBales = balesByDestination[destination];
            
            // Calculate total for this destination
            const totalWeight = destinationBales.reduce((sum, bale) => sum + (bale.weight || 0), 0);
            
            // Add totals row
            const balesWithTotal = [...destinationBales, {
              baleNumber: 'TOTAL',
              contents: '',
              weight: totalWeight,
              dateCreated: null,
              containerDisplay: '',
              destination: ''
            }];
            
            tables.push({
              title: `Unsold Bales - ${destination}`,
              columns: [
                { header: 'Bale #', key: 'baleNumber', width: 15 },
                { header: 'Quality', key: 'contents', width: 15 },
                { header: 'Weight (kg)', key: 'weight', width: 15, dataFormat: 'weight_no_decimal' },
                { header: 'Date Created', key: 'dateCreated', width: 20, dataFormat: 'date' },
                { header: 'Container', key: 'containerDisplay', width: 20 }
              ],
              data: balesWithTotal
            });
          });
          
          return tables;
        })()
      },
      {
        name: 'Sales by Type',
        title: 'Sales Breakdown by Quality Type',
        columns: [
          { header: 'Quality Type', key: 'quality', width: 20 },
          { header: 'Units Sold', key: 'count', width: 15, dataFormat: 'number' },
          { header: 'Total Weight (kg)', key: 'totalWeight', width: 20, dataFormat: 'weight_no_decimal' },
          { header: 'Avg Weight per Bale', key: 'avgWeight', width: 20, dataFormat: 'weight_no_decimal' },
          { header: 'Revenue', key: 'revenue', width: 20, dataFormat: 'currency_no_decimal' },
          { header: 'Avg Price', key: 'avgPrice', width: 20, dataFormat: 'currency' }
        ],
        data: (() => {
          // Calculate detailed metrics by quality type for sold bales
          const soldByQuality: { [key: string]: { count: number; totalWeight: number; revenue: number } } = {};
          
          balesData.forEach(bale => {
            const quality = bale.contents || 'Unknown';
            if (!soldByQuality[quality]) {
              soldByQuality[quality] = { count: 0, totalWeight: 0, revenue: 0 };
            }
            soldByQuality[quality].count += 1;
            soldByQuality[quality].totalWeight += bale.weight || 0;
            soldByQuality[quality].revenue += bale.salePrice || 0;
          });
          
          const mappedData = Object.entries(soldByQuality).map(([quality, data]) => ({
            quality,
            count: data.count,
            totalWeight: data.totalWeight,
            avgWeight: data.count > 0 ? data.totalWeight / data.count : 0,
            revenue: data.revenue,
            avgPrice: data.count > 0 ? data.revenue / data.count : 0
          }));
          
          // Add totals row for sold bales
          const totalCount = mappedData.reduce((sum, item) => sum + item.count, 0);
          const totalWeight = mappedData.reduce((sum, item) => sum + item.totalWeight, 0);
          const totalRevenue = mappedData.reduce((sum, item) => sum + item.revenue, 0);
          const avgWeight = totalCount > 0 ? totalWeight / totalCount : 0;
          const avgPrice = totalCount > 0 ? totalRevenue / totalCount : 0;
          
          mappedData.push({
            quality: 'TOTAL',
            count: totalCount,
            totalWeight: totalWeight,
            avgWeight: avgWeight,
            revenue: totalRevenue,
            avgPrice: avgPrice
          });
          
          return mappedData;
        })(),
        additionalTables: [
          {
            title: 'Unsold Inventory by Quality Type',
            columns: [
              { header: 'Quality Type', key: 'quality', width: 20 },
              { header: 'Units Unsold', key: 'count', width: 15, dataFormat: 'number' },
              { header: 'Total Weight (kg)', key: 'totalWeight', width: 20, dataFormat: 'weight_no_decimal' },
              { header: 'Avg Weight per Bale', key: 'avgWeight', width: 20, dataFormat: 'weight_no_decimal' }
            ],
            data: (() => {
              // Calculate unsold inventory by quality type
              const unsoldByQuality: { [key: string]: { count: number; totalWeight: number } } = {};
              
              unsoldBalesData.forEach(bale => {
                const quality = bale.contents || 'Unknown';
                if (!unsoldByQuality[quality]) {
                  unsoldByQuality[quality] = { count: 0, totalWeight: 0 };
                }
                unsoldByQuality[quality].count += 1;
                unsoldByQuality[quality].totalWeight += bale.weight || 0;
              });
              
              const mappedData = Object.entries(unsoldByQuality).map(([quality, data]) => ({
                quality,
                count: data.count,
                totalWeight: data.totalWeight,
                avgWeight: data.count > 0 ? data.totalWeight / data.count : 0
              }));
              
              // Add totals row for unsold bales
              const totalCount = mappedData.reduce((sum, item) => sum + item.count, 0);
              const totalWeight = mappedData.reduce((sum, item) => sum + item.totalWeight, 0);
              const avgWeight = totalCount > 0 ? totalWeight / totalCount : 0;
              
              mappedData.push({
                quality: 'TOTAL',
                count: totalCount,
                totalWeight: totalWeight,
                avgWeight: avgWeight
              });
              
              return mappedData;
            })()
          }
        ]
      },
      {
        name: 'Sales by Location',
        title: 'Sales Breakdown by Destination',
        columns: [
          { header: 'Location', key: 'location', width: 25 },
          { header: 'Bales Sold', key: 'balesCount', width: 15, dataFormat: 'number' },
          { header: 'Total Weight (kg)', key: 'totalWeight', width: 18, dataFormat: 'weight_no_decimal' },
          { header: 'Avg Weight per Bale', key: 'avgWeight', width: 18, dataFormat: 'weight_no_decimal' },
          { header: 'Avg Price/kg', key: 'avgPricePerKg', width: 15, dataFormat: 'currency' },
          { header: 'Avg Sale Amount', key: 'avgSaleAmount', width: 18, dataFormat: 'currency_no_decimal' },
          { header: 'Total Sales', key: 'amount', width: 18, dataFormat: 'currency_no_decimal' }
        ],
        data: (() => {
          // Calculate detailed metrics by location using container destinations
          const locationMetrics: { [key: string]: { balesCount: number; totalWeight: number; totalAmount: number } } = {};
          
          balesData.forEach(bale => {
            let location = 'Warehouse';
            if (bale.containerNumber && containers.length > 0) {
              const container = containers.find(c => c.containerNumber === bale.containerNumber);
              if (container?.destination) {
                location = container.destination;
              }
            }
            
            if (!locationMetrics[location]) {
              locationMetrics[location] = { balesCount: 0, totalWeight: 0, totalAmount: 0 };
            }
            
            locationMetrics[location].balesCount += 1;
            locationMetrics[location].totalWeight += bale.weight || 0;
            locationMetrics[location].totalAmount += bale.salePrice || 0;
          });
          
          const mappedData = Object.entries(locationMetrics).map(([location, metrics]) => ({
            location,
            balesCount: metrics.balesCount,
            totalWeight: metrics.totalWeight,
            avgWeight: metrics.balesCount > 0 ? metrics.totalWeight / metrics.balesCount : 0,
            avgPricePerKg: metrics.totalWeight > 0 ? metrics.totalAmount / metrics.totalWeight : 0,
            avgSaleAmount: metrics.balesCount > 0 ? metrics.totalAmount / metrics.balesCount : 0,
            amount: metrics.totalAmount
          }));
          
          // Add totals row
          const totalBales = mappedData.reduce((sum, item) => sum + item.balesCount, 0);
          const totalWeight = mappedData.reduce((sum, item) => sum + item.totalWeight, 0);
          const totalAmount = mappedData.reduce((sum, item) => sum + item.amount, 0);
          const overallAvgWeight = totalBales > 0 ? totalWeight / totalBales : 0;
          const overallAvgPricePerKg = totalWeight > 0 ? totalAmount / totalWeight : 0;
          const overallAvgSaleAmount = totalBales > 0 ? totalAmount / totalBales : 0;
          
          mappedData.push({
            location: 'TOTAL',
            balesCount: totalBales,
            totalWeight: totalWeight,
            avgWeight: overallAvgWeight,
            avgPricePerKg: overallAvgPricePerKg,
            avgSaleAmount: overallAvgSaleAmount,
            amount: totalAmount
          });
          
          return mappedData;
        })()
      }
    ]
  };
  
  await generateExcelReport(config);
};

export const exportOperationalReport = async (
  dateRange: { from: Date; to: Date },
  binMetrics: any,
  pickupMetrics: any,
  driverAssignments: any[],
  pickupsPerDriver: any[],
  partnerMetrics: any,
  pickupRequests: any[]
) => {
  const config: ExcelReportConfig = {
    filename: 'HH_Operational_Report',
    sheetName: 'Operational Overview',
    title: 'Operational Report',
    dateRange,
    columns: [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20, dataFormat: 'number' },
      { header: 'Percentage', key: 'percentage', width: 20, dataFormat: 'percentage' }
    ],
    data: [
      { metric: 'Total Bins', value: binMetrics.total, percentage: 1 },
      { metric: 'Active Bins', value: binMetrics.active, percentage: binMetrics.active / Math.max(binMetrics.total, 1) },
      { metric: 'Available Bins', value: binMetrics.available, percentage: binMetrics.available / Math.max(binMetrics.total, 1) },
      { metric: 'Full Bins', value: binMetrics.full, percentage: binMetrics.full / Math.max(binMetrics.total, 1) },
      { metric: 'Total Pickup Requests', value: pickupMetrics.total, percentage: 1 },
      { metric: 'Completed Pickups', value: pickupMetrics.pickedUp, percentage: pickupMetrics.pickedUp / Math.max(pickupMetrics.total, 1) },
      { metric: 'Pending Pickups', value: pickupMetrics.pending, percentage: pickupMetrics.pending / Math.max(pickupMetrics.total, 1) },
      { metric: 'Active Partners', value: partnerMetrics.approved, percentage: partnerMetrics.approved / Math.max(partnerMetrics.approved + partnerMetrics.pending + partnerMetrics.rejected, 1) }
    ],
    summary: [
      { label: 'Bin Utilization:', value: `${Math.round((binMetrics.active / Math.max(binMetrics.total, 1)) * 100)}%` },
      { label: 'Pickup Completion Rate:', value: `${Math.round((pickupMetrics.pickedUp / Math.max(pickupMetrics.total, 1)) * 100)}%` },
      { label: 'Active Drivers:', value: driverAssignments.length },
      { label: 'Total Partners:', value: partnerMetrics.approved + partnerMetrics.pending }
    ],
    additionalSheets: [
      {
        name: 'Driver Performance',
        title: 'Driver Assignments and Performance',
        columns: [
          { header: 'Driver Name', key: 'driver', width: 25 },
          { header: 'Assigned Bins', key: 'bins', width: 15, dataFormat: 'number' },
          { header: 'Completed Pickups', key: 'pickups', width: 20, dataFormat: 'number' }
        ],
        data: driverAssignments.map(assignment => {
          const driverPickups = pickupsPerDriver.find(p => p.driver === assignment.driver);
          return {
            driver: assignment.driver,
            bins: assignment.bins,
            pickups: driverPickups?.pickups || 0
          };
        })
      },
      {
        name: 'Pickup Requests',
        title: 'Detailed Pickup Requests',
        columns: [
          { header: 'Request ID', key: 'id', width: 30 },
          { header: 'Date', key: 'date', width: 20, dataFormat: 'date' },
          { header: 'Partner', key: 'partnerName', width: 25 },
          { header: 'Location', key: 'address', width: 40 },
          { header: 'Type', key: 'clothingType', width: 20 },
          { header: 'Bags', key: 'numberOfBags', width: 10, dataFormat: 'number' },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Driver', key: 'assignedDriver', width: 20 }
        ],
        data: pickupRequests.map(request => ({
          ...request,
          date: request.date ? new Date(request.date) : null
        }))
      },
      {
        name: 'Partner Applications',
        title: 'Partner Application Status',
        columns: [
          { header: 'Status', key: 'status', width: 20 },
          { header: 'Count', key: 'count', width: 15, dataFormat: 'number' },
          { header: 'Percentage', key: 'percentage', width: 20, dataFormat: 'percentage' }
        ],
        data: [
          { status: 'Approved', count: partnerMetrics.approved, percentage: partnerMetrics.approved / Math.max(partnerMetrics.approved + partnerMetrics.pending + partnerMetrics.rejected + partnerMetrics.archived, 1) },
          { status: 'Pending', count: partnerMetrics.pending, percentage: partnerMetrics.pending / Math.max(partnerMetrics.approved + partnerMetrics.pending + partnerMetrics.rejected + partnerMetrics.archived, 1) },
          { status: 'Rejected', count: partnerMetrics.rejected, percentage: partnerMetrics.rejected / Math.max(partnerMetrics.approved + partnerMetrics.pending + partnerMetrics.rejected + partnerMetrics.archived, 1) },
          { status: 'Archived', count: partnerMetrics.archived, percentage: partnerMetrics.archived / Math.max(partnerMetrics.approved + partnerMetrics.pending + partnerMetrics.rejected + partnerMetrics.archived, 1) }
        ]
      }
    ]
  };
  
  await generateExcelReport(config);
};