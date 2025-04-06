import React, { useState } from 'react';

interface TaskItem {
  id: number;
  name: string;
  description: string;
  owner: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
}

interface ProjectForm {
  name: string;
  description: string;
  client: string;
  manager: string;
  startDate: string;
  endDate: string;
  budget: string;
  priority: 'low' | 'medium' | 'high';
}

const AdvancedForm: React.FC = () => {
  const [project, setProject] = useState<ProjectForm>({
    name: '',
    description: '',
    client: '',
    manager: '',
    startDate: '',
    endDate: '',
    budget: '',
    priority: 'medium'
  });

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, name: '需求分析', description: '收集并分析用户需求', owner: '张三', status: 'done' },
    { id: 2, name: '系统设计', description: '设计系统架构和数据模型', owner: '李四', status: 'processing' },
    { id: 3, name: '前端开发', description: '实现用户界面和交互逻辑', owner: '王五', status: 'pending' },
    { id: 4, name: '后端开发', description: '实现业务逻辑和数据处理', owner: '赵六', status: 'pending' }
  ]);

  const [newTask, setNewTask] = useState<Omit<TaskItem, 'id'>>({
    name: '',
    description: '',
    owner: '',
    status: 'pending'
  });

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const addTask = () => {
    if (!newTask.name.trim() || !newTask.owner.trim()) {
      alert('任务名称和负责人不能为空');
      return;
    }

    const newId = Math.max(0, ...tasks.map(t => t.id)) + 1;
    setTasks([...tasks, { ...newTask, id: newId }]);
    setNewTask({ name: '', description: '', owner: '', status: 'pending' });
  };

  const updateTaskStatus = (id: number, status: TaskItem['status']) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, status } : task)));
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ project, tasks });
    alert('表单已提交');
  };

  const getStatusColor = (status: TaskItem['status']) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TaskItem['status']) => {
    switch (status) {
      case 'done':
        return '已完成';
      case 'processing':
        return '处理中';
      case 'pending':
        return '等待中';
      case 'failed':
        return '已失败';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">高级表单</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="text-lg font-medium">项目信息</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 grid grid-cols-1 gap-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  项目名称
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={project.name}
                  onChange={handleProjectChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入项目名称"
                  required
                />
              </div>

              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                  客户
                </label>
                <input
                  type="text"
                  name="client"
                  id="client"
                  value={project.client}
                  onChange={handleProjectChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入客户名称"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                项目描述
              </label>
              <textarea
                name="description"
                id="description"
                value={project.description}
                onChange={handleProjectChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="请输入项目描述"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                  项目经理
                </label>
                <input
                  type="text"
                  name="manager"
                  id="manager"
                  value={project.manager}
                  onChange={handleProjectChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入项目经理"
                  required
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  预算（元）
                </label>
                <input
                  type="text"
                  name="budget"
                  id="budget"
                  value={project.budget}
                  onChange={handleProjectChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入项目预算"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  开始日期
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={project.startDate}
                  onChange={handleProjectChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  结束日期
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={project.endDate}
                  onChange={handleProjectChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                优先级
              </label>
              <select
                name="priority"
                id="priority"
                value={project.priority}
                onChange={handleProjectChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>

          <div className="p-5 border-t border-b bg-gray-50">
            <h2 className="text-lg font-medium">任务列表</h2>
          </div>

          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">负责人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.owner}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={e => updateTaskStatus(task.id, e.target.value as TaskItem['status'])}
                          className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(task.status)}`}
                        >
                          <option value="pending">等待中</option>
                          <option value="processing">处理中</option>
                          <option value="done">已完成</option>
                          <option value="failed">已失败</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button type="button" onClick={() => removeTask(task.id)} className="text-red-600 hover:text-red-900">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="task-name" className="block text-sm font-medium text-gray-700">
                  任务名称
                </label>
                <input
                  type="text"
                  id="task-name"
                  name="name"
                  value={newTask.name}
                  onChange={handleNewTaskChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="任务名称"
                />
              </div>

              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">
                  任务描述
                </label>
                <input
                  type="text"
                  id="task-description"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="任务描述"
                />
              </div>

              <div>
                <label htmlFor="task-owner" className="block text-sm font-medium text-gray-700">
                  负责人
                </label>
                <input
                  type="text"
                  id="task-owner"
                  name="owner"
                  value={newTask.owner}
                  onChange={handleNewTaskChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="负责人"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addTask}
                  className="block w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  添加任务
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 border-t bg-gray-50 flex justify-end space-x-3">
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

export default AdvancedForm;
