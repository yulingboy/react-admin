import React, { useState } from 'react';

interface FormState {
  title: string;
  description: string;
  owner: string;
  approver: string;
  dateRange: string;
  type: string;
  priority: string;
  notifications: string[];
}

const BasicForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    owner: '',
    approver: '',
    dateRange: '',
    type: 'private',
    priority: 'medium',
    notifications: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormState(prev => ({
        ...prev,
        notifications: [...prev.notifications, value]
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(item => item !== value)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formState);
    // 在这里处理表单提交逻辑
    alert('表单已提交');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">基础表单</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                标题
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formState.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="请输入标题"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                描述
              </label>
              <textarea
                name="description"
                id="description"
                value={formState.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="请输入描述信息"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                  负责人
                </label>
                <input
                  type="text"
                  name="owner"
                  id="owner"
                  value={formState.owner}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入负责人"
                  required
                />
              </div>

              <div>
                <label htmlFor="approver" className="block text-sm font-medium text-gray-700">
                  审批人
                </label>
                <input
                  type="text"
                  name="approver"
                  id="approver"
                  value={formState.approver}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入审批人"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                有效日期
              </label>
              <input
                type="date"
                name="dateRange"
                id="dateRange"
                value={formState.dateRange}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                表单类型
              </label>
              <select
                name="type"
                id="type"
                value={formState.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="private">私密</option>
                <option value="public">公开</option>
                <option value="internal">内部</option>
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">优先级</span>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="priority-high"
                    name="priority"
                    value="high"
                    checked={formState.priority === 'high'}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="priority-high" className="ml-2 block text-sm text-gray-700">
                    高
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="priority-medium"
                    name="priority"
                    value="medium"
                    checked={formState.priority === 'medium'}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="priority-medium" className="ml-2 block text-sm text-gray-700">
                    中
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="priority-low"
                    name="priority"
                    value="low"
                    checked={formState.priority === 'low'}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="priority-low" className="ml-2 block text-sm text-gray-700">
                    低
                  </label>
                </div>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">通知</span>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notify-email"
                    name="notifications"
                    value="email"
                    checked={formState.notifications.includes('email')}
                    onChange={handleCheckboxChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="notify-email" className="ml-2 block text-sm text-gray-700">
                    邮件
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notify-sms"
                    name="notifications"
                    value="sms"
                    checked={formState.notifications.includes('sms')}
                    onChange={handleCheckboxChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="notify-sms" className="ml-2 block text-sm text-gray-700">
                    短信
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notify-wx"
                    name="notifications"
                    value="wechat"
                    checked={formState.notifications.includes('wechat')}
                    onChange={handleCheckboxChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="notify-wx" className="ml-2 block text-sm text-gray-700">
                    微信
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-5">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicForm;
