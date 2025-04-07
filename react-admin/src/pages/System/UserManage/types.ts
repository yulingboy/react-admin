export interface UserType {
  userId: number;
  userName: string;
  nickName: string;
  email: string;
  phonenumber: string;
  sex: string;
  status: string;
  deptId: number;
  remark: string;
  createTime: string;
  userType: string;
  loginDate: string | null;
  loginIp: string;
  avatar: string | null;
}

export interface UserFormData {
  userId?: number;
  userName: string;
  nickName: string;
  email: string;
  phonenumber: string;
  sex: string;
  status: string;
  userType: string;
  password?: string;
  remark?: string;
}

export interface OptionType {
  label: string;
  value: string;
}

export const sexOptions: OptionType[] = [
  { label: '男', value: '1' },
  { label: '女', value: '0' }
];

export const statusOptions: OptionType[] = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
];

export const userTypeOptions: OptionType[] = [
  { label: '管理员', value: '00' },
  { label: '编辑', value: '01' },
  { label: '普通用户', value: '02' }
];

export const userTypeMap: Record<string, string> = {
  '00': '管理员',
  '01': '编辑',
  '02': '普通用户'
};

export const deptMap: Record<number, string> = {
  103: '研发部门',
  104: '市场部门'
};
