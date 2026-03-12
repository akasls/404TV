const fs = require('fs');

let code = fs.readFileSync('src/app/settings/components/SystemSettings.tsx', 'utf8');

// 1. Remove duplicate showAddUserForm
code = code.replace(/  const \[showAddUserForm, setShowAddUserForm\] = useState\(false\);\n  const \[showChangePasswordForm, setShowChangePasswordForm\] = useState\(false\);\n/g, (match, offset, str) => {
  if (offset > 0 && str.indexOf(match) === offset) {
    // Keep first occurence
    return match;
  }
  return '';
});

// 1.5 Actually just replace the whole block of state definitions
code = code.replace(/  const \[showConfigureApisModal, setShowConfigureApisModal\] = useState\(false\);[\s\S]*?  const \[deletingUser, setDeletingUser\] = useState<string \| null>\(null\);/, `  const [deletingUser, setDeletingUser] = useState<string | null>(null);`);

// 2. Remove duplicate selectAllUsers
const duplicateSelectStr = `  // 当前登录用户名
  const currentUsername = getAuthInfoFromBrowserCookie()?.username || null;

  // 使用 useMemo 计算全选状态，避免每次渲染都重新计算
  const selectAllUsers = useMemo(() => {
    const selectableUserCount =
      config?.UserConfig?.Users?.filter(
        (user) =>
          role === 'owner' ||
          (role === 'admin' &&
            (user.role === 'user' || user.username === currentUsername))
      ).length || 0;
    return selectedUsers.size === selectableUserCount && selectedUsers.size > 0;
  }, [selectedUsers.size, config?.UserConfig?.Users, role, currentUsername]);`;

const selectIndex1 = code.indexOf(duplicateSelectStr);
const selectIndex2 = code.indexOf(duplicateSelectStr, selectIndex1 + 1);
if (selectIndex2 > -1) {
  code = code.substring(0, selectIndex2) + code.substring(selectIndex2 + duplicateSelectStr.length);
}

// remove unused handleConfigureUserApis and handleSaveUserApis
code = code.replace(/  const handleConfigureUserApis = \(user: \{[\s\S]*?setShowConfigureApisModal\(true\);\n  };\n/, '');
code = code.replace(/  const handleSaveUserApis = async \(\) => \{[\s\S]*?\};\n/, '');

// Remove 批量设置用户组 button and spacer
code = code.replace(/              <>\n                <div className='flex items-center space-x-3'>\n                  <span className='text-sm text-gray-600 dark:text-gray-400'>\n                    已选择 \{selectedUsers\.size\} 个用户\n                  <\/span>\n                  <button\n                    onClick=\{.*?\}\n                    className=\{buttonStyles\.primary\}\n                  >\n                    批量设置用户组\n                  <\/button>\n                <\/div>\n                <div className='w-px h-6 bg-gray-300 dark:bg-gray-600'><\/div>\n              <\/>/, `              <div className='flex items-center space-x-3'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  已选择 {selectedUsers.size} 个用户
                </span>
              </div>`);

// Remove 用户组管理 block completely
code = code.replace(/      \{\/\* 用户组管理 \*\/\}[\s\S]*?\{\/\* 用户列表 \*\/\}/, `{/* 用户列表 */}`);

// Remove field input "用户组（可选）"
code = code.replace(/              <div>\n                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>\n                  用户组（可选）\n                <\/label>\n                <select[\s\S]*?<\/select>\n              <\/div>\n/, '');

// Remove `userGroup` from `newUser` state usage and reset
code = code.replace(/newUser\.userGroup/g, `''`);

fs.writeFileSync('src/app/settings/components/SystemSettings.tsx', code);
