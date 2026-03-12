const fs = require('fs');
let code = fs.readFileSync('src/app/settings/components/SystemSettings.tsx', 'utf8');

// 1. Add back selectedUsers
code = code.replace(
  /  const \[showDeleteUserModal, setShowDeleteUserModal\] = useState\(false\);/,
  `  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());\n  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);`
);

// 2. Remove userGroups definition
code = code.replace(
  /  \/\/ 获取用户组列表\r?\n  const userGroups = config\?\.UserConfig\?\.Tags \|\| \[\];\r?\n/,
  ''
);

// 3. Remove handleUserGroupAction
code = code.replace(
  /  \/\/ 处理用户组相关操作\r?\n  const handleUserGroupAction = async \([\s\S]*?          \}\r?\n        \}\r?\n      \} catch \(err\) \{\r?\n        \/\//,
  `//`
);
// It's safer to just remove it to the end of the block.
code = code.replace(
  /  \/\/ 处理用户组相关操作[\s\S]*?    \}\);\r?\n  \};\r?\n/,
  ''
);

// 4. Remove handleSaveUserGroups and replace with toggle action
code = code.replace(
  /  const handleSaveUserGroups = async \(\) => \{[\s\S]*?  \};\r?\n/,
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

// 5. Remove '批量操作按钮' check inside `{selectedUsers.size > 0 && (` because it used `setShowBatchUserGroupModal` earlier but I removed that. So let's just make sure there are no syntax errors inside the `{/* 用户列表 */}` header part.
code = code.replace(
  /            \{\/\* 批量操作按钮 \*\/\}[\s\S]*?            <button\r?\n              onClick=\{\(\) => \{/g,
  `            <button\n              onClick={() => {`
);

fs.writeFileSync('src/app/settings/components/SystemSettings.tsx', code);
