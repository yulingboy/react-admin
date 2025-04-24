/**
 * 树结构工具类
 * 提供树形数据处理的常用方法
 */

/**
 * 树节点接口
 */
export interface TreeNode {
  id: string | number;
  parentId: string | number | null;
  children?: TreeNode[];
  [key: string]: any;
}

/**
 * 列表转树结构
 * @param list 列表数据
 * @param options 配置项
 * @returns 树结构数据
 */
export function listToTree<T extends TreeNode>(
  list: T[],
  options: {
    idKey?: string;
    parentIdKey?: string;
    childrenKey?: string;
    rootParentId?: string | number | null;
  } = {},
): T[] {
  const {
    idKey = 'id',
    parentIdKey = 'parentId',
    childrenKey = 'children',
    rootParentId = null,
  } = options;

  const nodeMap = new Map<string | number, T & { [childrenKey: string]: T[] }>();
  const result: T[] = [];

  // 初始化节点映射
  list.forEach((node) => {
    nodeMap.set(node[idKey], {
      ...node,
      [childrenKey]: [],
    });
  });

  // 构建树结构
  nodeMap.forEach((node) => {
    const parentId = node[parentIdKey];
    
    if (parentId === rootParentId) {
      // 根节点
      result.push(node);
    } else {
      // 子节点
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        parentNode[childrenKey].push(node);
      }
    }
  });

  return result;
}

/**
 * 树结构转列表
 * @param tree 树结构数据
 * @param options 配置项
 * @returns 列表数据
 */
export function treeToList<T extends TreeNode>(
  tree: T[],
  options: {
    childrenKey?: string;
    parentIdKey?: string;
    keepChildren?: boolean;
  } = {},
): T[] {
  const { childrenKey = 'children', parentIdKey = 'parentId', keepChildren = false } = options;
  const result: T[] = [];

  const flatten = (nodes: T[], parentId: string | number | null = null) => {
    nodes.forEach((node) => {
      // 保存当前节点的parentId
      const currentParentId = node[parentIdKey];
      
      // 更新parentId (如果需要)
      if (parentId !== null) {
        (node as Record<string, any>)[parentIdKey] = parentId;
      }
      
      const children = node[childrenKey] as T[];
      
      // 复制一个不包含children的节点
      const nodeWithoutChildren = { ...node };
      if (!keepChildren) {
        delete nodeWithoutChildren[childrenKey];
      }
      
      result.push(nodeWithoutChildren as T);
      
      // 递归处理子节点
      if (children && children.length > 0) {
        flatten(children, node.id);
      }
      
      // 恢复原来的parentId
      (node as Record<string, any>)[parentIdKey] = currentParentId;
    });
  };

  flatten(tree);
  return result;
}

/**
 * 根据ID查找节点
 * @param tree 树结构数据
 * @param id 节点ID
 * @param options 配置项
 * @returns 节点数据
 */
export function findNodeById<T extends TreeNode>(
  tree: T[],
  id: string | number,
  options: {
    idKey?: string;
    childrenKey?: string;
  } = {},
): T | null {
  const { idKey = 'id', childrenKey = 'children' } = options;

  for (const node of tree) {
    if (node[idKey] === id) {
      return node;
    }

    if (node[childrenKey] && node[childrenKey].length) {
      const found = findNodeById(node[childrenKey], id, options);
      if (found) {
        return found as T;
      }
    }
  }

  return null;
}

/**
 * 查找节点的所有父节点
 * @param tree 树结构数据
 * @param id 节点ID
 * @param options 配置项
 * @returns 父节点列表 (从上到下排序)
 */
export function findParents<T extends TreeNode>(
  tree: T[],
  id: string | number,
  options: {
    idKey?: string;
    childrenKey?: string;
  } = {},
): T[] {
  const { idKey = 'id', childrenKey = 'children' } = options;
  const parents: T[] = [];

  const findParent = (nodes: T[], targetId: string | number, path: T[] = []): boolean => {
    for (const node of nodes) {
      // 当前路径
      const currentPath = [...path, node];
      
      // 找到目标节点
      if (node[idKey] === targetId) {
        // 返回不包含自身的父节点列表
        parents.push(...path);
        return true;
      }
      
      // 递归查找子节点
      if (node[childrenKey] && node[childrenKey].length) {
        if (findParent(node[childrenKey], targetId, currentPath)) {
          return true;
        }
      }
    }
    
    return false;
  };

  findParent(tree, id);
  return parents;
}

/**
 * 过滤树节点
 * @param tree 树结构数据
 * @param predicate 过滤条件
 * @param options 配置项
 * @returns 过滤后的树结构
 */
export function filterTree<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
  options: {
    childrenKey?: string;
  } = {},
): T[] {
  const { childrenKey = 'children' } = options;

  return tree
    .filter((node) => {
      // 递归过滤子节点
      if (node[childrenKey] && node[childrenKey].length) {
        const filteredChildren = filterTree(node[childrenKey], predicate, options);
        return { ...node, [childrenKey]: filteredChildren };
      }
      
      // 如果子节点有匹配的或当前节点匹配，则保留
      return node[childrenKey]?.length > 0 || predicate(node);
    })
    .map((node) => ({ ...node }));
}