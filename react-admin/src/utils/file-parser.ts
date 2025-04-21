/**
 * 文件解析工具
 * 用于解析各种格式的文件，支持Excel和CSV格式
 */
import * as XLSX from 'xlsx';

/**
 * 解析Excel文件
 * @param file 要解析的Excel文件
 * @returns 解析后的数据数组
 */
export const parseExcel = async (file: File): Promise<any[]> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // 使用xlsx库解析Excel文件
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 获取第一个工作表
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // 转换为JSON格式，设置raw: false以便自动处理日期格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: '', // 默认值为空字符串
            blankrows: false // 忽略空行
          });
          
          resolve(jsonData);
        } catch (error) {
          console.error('解析Excel文件失败', error);
          reject(new Error('Excel文件解析失败，请检查文件格式'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Excel解析错误:', error);
    throw new Error('Excel文件解析失败');
  }
};

/**
 * 解析CSV文件
 * @param file 要解析的CSV文件
 * @returns 解析后的数据数组
 */
export const parseCsv = async (file: File): Promise<any[]> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // 使用xlsx库解析CSV文件
          const csvContent = e.target?.result as string;
          const workbook = XLSX.read(csvContent, { type: 'string' });
          
          // 获取第一个工作表
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // 转换为JSON格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: '', // 默认值为空字符串
            blankrows: false // 忽略空行
          });
          
          resolve(jsonData);
        } catch (error) {
          console.error('解析CSV文件失败', error);
          reject(new Error('CSV文件解析失败，请检查文件格式'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('CSV解析错误:', error);
    throw new Error('CSV文件解析失败');
  }
};

/**
 * 自动检测并解析文件
 * @param file 要解析的文件
 * @returns 解析后的数据数组
 */
export const parseFile = async (file: File): Promise<any[]> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return parseCsv(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file);
  } else {
    throw new Error('不支持的文件格式，请上传CSV或Excel文件');
  }
};

/**
 * 获取文件列头信息
 * @param file 要解析的文件
 * @returns 文件的列头数组
 */
export const getFileHeaders = async (file: File): Promise<string[]> => {
  try {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        try {
          let workbook;
          if (file.name.toLowerCase().endsWith('.csv')) {
            // CSV文件
            const csvContent = e.target?.result as string;
            workbook = XLSX.read(csvContent, { type: 'string' });
          } else {
            // Excel文件
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            workbook = XLSX.read(data, { type: 'array' });
          }
          
          // 获取第一个工作表
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // 获取工作表范围
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          
          // 仅获取第一行作为表头
          const headers = [];
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
            const cell = worksheet[cellAddress];
            headers.push(cell && cell.v ? String(cell.v) : `列${col + 1}`);
          }
          
          resolve(headers);
        } catch (error) {
          console.error('获取文件列头失败', error);
          reject(new Error('获取文件列头失败'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  } catch (error) {
    console.error('获取文件列头错误:', error);
    throw new Error('获取文件列头失败');
  }
};