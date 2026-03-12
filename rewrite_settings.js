const fs = require('fs');
let code = fs.readFileSync('src/app/settings/components/SystemSettings.tsx', 'utf8');

// ==== 1. Replace UserConfig variables ====
code = code.replace(
  /  const \[showConfigureUserGroupModal, setShowConfigureUserGroupModal\] =[\s\S]*?  const \[deletingUserGroup, setDeletingUserGroup\] = useState<\{[\s\S]*?  \} \| null>\(null\);/g,
  ''
);

code = code.replace(/  const \[selectedUserGroups, setSelectedUserGroups\] = useState<string\[\]>\(\[\]\);\n/, '');
code = code.replace(/  const \[showBatchUserGroupModal, setShowBatchUserGroupModal\] = useState\(false\);\n  const \[selectedUserGroup, setSelectedUserGroup\] = useState<string>\(''\);\n/, '');
code = code.replace(/  const \[showDeleteUserGroupModal, setShowDeleteUserGroupModal\] =\n    useState\(false\);\n/, '');

// Add isAdultEnabled to selectedUser type
code = code.replace(
  /    role: 'user' \| 'admin' \| 'owner';\n    enabledApis\?: string\[\];\n    tags\?: string\[\];\n/,
  `    role: 'user' | 'admin' | 'owner';\n    enabledApis?: string[];\n    isAdultEnabled?: boolean;\n`
);

// Replace UserConfig Actions
code = code.replace(
  /  \/\/ 获取用户组列表\n  const userGroups = config\?\.UserConfig\?\.Tags \|\| \[\];[\s\S]*?  const handleSaveUserGroups = async \(\) => \{[\s\S]*?  \};\n/g,
  `  const handleToggleAdultEnabled = async (username: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleAdultEnable', username, isAdultEnabled: enabled }),
      });
      if (!response.ok) throw new Error('Toggle failed');
      await refreshConfig();
      showAlert('success', \`已\${enabled ? '启用' : '禁用'}成人组权限\`,);
    } catch (e) {
      showAlert('error', '操作失败');
    }
  };
`
);

// Remove "用户组管理" section
code = code.replace(/      \{\/\* 用户组管理 \*\/\}[\s\S]*?\{\/\* 用户列表 \*\/\}/g, '{/* 用户列表 */}');

// Remove 批量设置用户组按钮
code = code.replace(/            \{\/\* 批量操作按钮 \*\/\}[\s\S]*?            <button\n              onClick=\{\(\) => \{/g, `            <button\n              onClick={() => {`);

// Replace user group table headers and columns
code = code.replace(
  /                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell'>\n                  用户组\n                <\/th>/,
  `                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell'>\n                  成人组权限\n                </th>`
);

// user.tags mapping to adult toggle
code = code.replace(
  /            <td className='px-6 py-4 whitespace-nowrap hidden lg:table-cell'>\n              <div className='flex flex-wrap gap-1'>\n                \{user\.tags\?\.map\(\(tag\) => \(\n                  <span key=\{tag\} className=\{badgeStyles\.primary\}>\n                    \{tag\}\n                  <\/span>\n                \)\)\}\n                \{\(\!user\.tags \|\| user\.tags\.length === 0\) && \(\n                  <span className='text-xs text-gray-500'>无用户组<\/span>\n                \)\}\n              <\/div>\n            <\/td>/,
  `            <td className='px-6 py-4 whitespace-nowrap hidden lg:table-cell'>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={user.isAdultEnabled || false}
                  onChange={(e) => handleToggleAdultEnabled(user.username, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-500"></div>
              </label>
            </td>`
);

// remove tags from add user
code = code.replace(
  /              <div>\n                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>\n                  用户组（可选）\n                <\/label>\n                <select[\s\S]*?<\/select>\n              <\/div>\n/,
  ''
);

// remove High Level Settings Button and Modals
code = code.replace(/                <button\n                  onClick=\{\(\) => \{[\s\S]*?高级设置\n                <\/button>/, '');
code = code.replace(/      \{\/\* 编辑用户组弹窗 \*\/\}[\s\S]*?      \{\/\* 删除用户确认弹窗 \*\/\}/g, '{/* 删除用户确认弹窗 */}');

// ==== 2. Replace VideoSourceConfig variables ====
code = code.replace(
  /    api: string;\n    detail: string;\n    from: 'custom';\n/g,
  `    api: string;\n    detail: string;\n    from: 'custom';\n    group?: 'view' | 'adult';\n`
);
code = code.replace(
  /    api: string;\n    detail\?: string;\n    disabled\?: boolean;\n    from: 'config' \| 'custom';\n/g,
  `    api: string;\n    detail?: string;\n    disabled?: boolean;\n    from: 'config' | 'custom';\n    group?: 'view' | 'adult';\n`
);

code = code.replace(
  /  const \[newSource, setNewSource\] = useState<\{[\s\S]*?  \}>\(\{/g,
  `  const [newSource, setNewSource] = useState<{
    name: string;
    api: string;
    detail: string;
    group: 'view' | 'adult';
  }>({`
);
code = code.replace(
  /    name: '',\n    api: '',\n    detail: '',\n  \}\);/g,
  `    name: '',\n    api: '',\n    detail: '',\n    group: 'view',\n  });`
);

code = code.replace(
  /  const \[editingSource, setEditingSource\] = useState<\{[\s\S]*?  \} \| null>\(null\);/g,
  `  const [editingSource, setEditingSource] = useState<{
    key: string;
    name: string;
    api: string;
    detail: string;
    group: 'view' | 'adult';
  } | null>(null);`
);

// VideoSource table display 'group'
code = code.replace(
  /                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell'>\n                  接口地址\n                <\/th>/,
  `                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell'>\n                  接口地址\n                </th>\n                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>\n                  分组\n                </th>`
);

code = code.replace(
  /                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell'>\n                    \{source\.api\?\.length > 40/,
  `                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <span className={\`px-2 py-1 rounded-full text-xs \${source.group === 'adult' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}\`}>
                      {source.group === 'adult' ? '成人组' : '观影组'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell'>\n                    {source.api?.length > 40`
);

// Add group option to Add Source modal
const groupSelectInput = `
                  {/* 分组选择 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      分组
                    </label>
                    <select
                      value={newSource.group}
                      onChange={(e) =>
                        setNewSource({ ...newSource, group: e.target.value as 'view' | 'adult' })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    >
                      <option value="view">观影组</option>
                      <option value="adult">成人组</option>
                    </select>
                  </div>`;

code = code.replace(
  /                  \{\/\* 接口详情 *\/\}\n                  <div>\n                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>\n                      接口详情（可选）/g,
  `${groupSelectInput}\n                  {/* 接口详情 */}\n                  <div>\n                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>\n                      接口详情（可选）`
);

// Add group option to Edit Source modal
const editGroupSelectInput = `
                  {/* 分组选择 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      分组
                    </label>
                    <select
                      value={editingSource.group}
                      onChange={(e) =>
                        setEditingSource({ ...editingSource, group: e.target.value as 'view' | 'adult' })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    >
                      <option value="view">观影组</option>
                      <option value="adult">成人组</option>
                    </select>
                  </div>`;

code = code.replace(
  /                  \{\/\* 接口详情 *\/\}\n                  <div>\n                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>\n                      接口详情/g,
  `${editGroupSelectInput}\n                  {/* 接口详情 */}\n                  <div>\n                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>\n                      接口详情`
);

// When Edit modal is opened, pass group correctly
code = code.replace(
  /                        setEditingSource\(\{\n                          key: source\.key,\n                          name: source\.name,\n                          api: source\.api \|\| '',\n                          detail: source\.detail \|\| '',\n                        \}\)\n/g,
  `                        setEditingSource({
                          key: source.key,
                          name: source.name,
                          api: source.api || '',
                          detail: source.detail || '',
                          group: source.group || 'view',
                        })\n`
);

// newUser variable replacement for submit
code = code.replace(/    userGroup: '',\n/g, '');
code = code.replace(/        newUser\.userGroup\n/g, '');

fs.writeFileSync('src/app/settings/components/SystemSettings.tsx', code);
