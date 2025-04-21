import { useState } from 'react';
import { message, UploadFile } from 'antd';
import { parseExcel, parseCsv } from '@/utils/file-parser';
import { 
  parseImportFile, 
  mapImportData, 
  importBills 
} from '@/modules/finance/api/bill-import-api';
import { 
  ImportDataType, 
  MappingConfigType, 
  ImportResult 
} from '@/modules/finance/types';

/**
 * 账单导入自定义钩子
 */
export const useBillImport = () => {
  // 导入文件
  const [importFile, setImportFile] = useState<UploadFile | null>(null);
  // 导入数据
  const [importData, setImportData] = useState<ImportDataType | null>(null);
  // 字段映射配置
  const [mappingConfig, setMappingConfig] = useState<MappingConfigType>({});
  // 导入预览数据
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  // 总记录数
  const [totalCount, setTotalCount] = useState<number>(0);
  // 加载状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 导入结果
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  /**
   * 处理文件上传
   * @param file 上传的文件
   */
  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setImportFile({
        uid: '1',
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file as any,
      });

      // 根据文件类型解析数据
      let parsedData: any[] = [];
      if (file.name.endsWith('.csv')) {
        // 解析CSV文件
        parsedData = await parseCsv(file);
      } else {
        // 解析Excel文件
        parsedData = await parseExcel(file);
      }

      if (!parsedData || parsedData.length === 0) {
        message.error('文件解析失败或文件为空');
        return;
      }

      // 调用后端API进行文件解析
      const formData = new FormData();
      formData.append('file', file);
      const result = await parseImportFile(formData);

      // 设置导入数据
      setImportData(result);
      setTotalCount(result.data.length);

      // 尝试自动映射字段
      autoMapFields(result.headers);

      message.success('文件解析成功');
    } catch (error) {
      console.error('文件上传失败', error);
      message.error('文件解析失败，请检查文件格式');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 尝试自动映射字段（基于字段名称的相似性）
   * @param headers 导入文件的列头
   */
  const autoMapFields = (headers: string[]) => {
    const fieldKeywords: Record<string, string[]> = {
      type: ['类型', '账单类型', 'type', '交易类型'],
      amount: ['金额', '金额(元)', 'amount', '交易金额'],
      billDate: ['日期', '账单日期', 'date', '交易日期', '时间'],
      accountName: ['账户', '账户名称', 'account', '支付账户'],
      targetAccountName: ['转入账户', '目标账户', 'target', '收款账户'],
      categoryName: ['分类', '账单分类', 'category'],
      tagNames: ['标签', '账单标签', 'tags', 'tag'],
      description: ['描述', '备注', 'description', 'remark', 'note', '详情'],
    };

    const mapping: MappingConfigType = {};

    // 遍历所有列头，尝试匹配
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      // 查找最匹配的字段
      Object.entries(fieldKeywords).forEach(([field, keywords]) => {
        const isMatch = keywords.some(keyword => 
          lowerHeader.includes(keyword.toLowerCase())
        );
        
        if (isMatch && !mapping[field]) {
          mapping[field] = header;
        }
      });
    });

    setMappingConfig(mapping);
  };

  /**
   * 处理字段映射变更
   * @param field 系统字段
   * @param column 导入文件列
   */
  const handleMappingChange = (field: string, column: string) => {
    if (!field) {
      // 移除映射
      const newMapping = { ...mappingConfig };
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === column) {
          delete newMapping[key];
        }
      });
      setMappingConfig(newMapping);
    } else {
      // 添加/更新映射
      setMappingConfig(prev => ({
        ...prev,
        [field]: column,
      }));
    }
  };

  /**
   * 准备导入预览数据
   */
  const preparePreviewData = async () => {
    if (!importData || !mappingConfig) return;

    try {
      setIsLoading(true);
      
      // 调用后端API获取映射后的预览数据
      const result = await mapImportData({
        data: importData.data.slice(0, 5), // 只预览前5条
        mappingConfig,
      });
      
      setPreviewData(result.data);
      setTotalCount(importData.data.length);
    } catch (error) {
      console.error('准备预览数据失败', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理导入确认
   */
  const handleImportConfirm = async () => {
    if (!importData || !mappingConfig) {
      message.error('导入数据或映射配置不完整');
      return;
    }

    try {
      setIsLoading(true);
      
      // 调用后端API执行导入
      const result = await importBills({
        data: importData.data,
        mappingConfig,
      });
      
      setImportResult(result);
      
      if (result.failed === 0) {
        message.success(`成功导入${result.success}条账单数据`);
      } else {
        message.warning(`成功导入${result.success}条数据，${result.failed}条数据导入失败`);
      }
    } catch (error) {
      console.error('账单导入失败', error);
      message.error('账单导入失败');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 重置导入状态
   */
  const resetImport = () => {
    setImportFile(null);
    setImportData(null);
    setMappingConfig({});
    setPreviewData(null);
    setTotalCount(0);
    setImportResult(null);
  };

  return {
    importFile,
    importData,
    mappingConfig,
    isLoading,
    importResult,
    previewData,
    totalCount,
    handleFileUpload,
    handleMappingChange,
    preparePreviewData,
    handleImportConfirm,
    resetImport,
  };
};