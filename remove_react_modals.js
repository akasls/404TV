const fs = require('fs');
let code = fs.readFileSync('src/app/settings/components/SystemSettings.tsx', 'utf8');

// remove everything from {/* 添加用户组弹窗 */} to just before {/* 删除用户确认弹窗 */}
code = code.replace(/      \{\/\* 添加用户组弹窗 \*\/\}[\s\S]*?(?=      \{\/\* 删除用户确认弹窗 \*\/\}|\{\/\* 删除用户确认弹窗 \*\/\}|      \{\/\* 通用弹窗组件 \*\/})/, '');

// remove everything from {/* 批量设置用户组弹窗 */} to just before {/* 通用弹窗组件 */}
code = code.replace(/      \{\/\* 批量设置用户组弹窗 \*\/\}[\s\S]*?(?=      \{\/\* 通用弹窗组件 \*\/})/, '');

// Remove batch button
code = code.replace(/            \{\/\* 批量操作按钮 \*\/\}[\s\S]*?            <button\n              onClick=\{\(\) => \{/g, `            <button\n              onClick={() => {`);


// some handlers
code = code.replace(/  const handleAddUserGroup = async \(\) => \{[\s\S]*?  \};\n/g, '');
code = code.replace(/  const handleStartEditUserGroup = \(group: any\) => \{[\s\S]*?  \};\n/g, '');
code = code.replace(/  const handleEditUserGroup = async \(\) => \{[\s\S]*?  \};\n/g, '');
code = code.replace(/  const handleDeleteUserGroup = \(name: string\) => \{[\s\S]*?  \};\n/g, '');
code = code.replace(/  const handleConfirmDeleteUserGroup = async \(\) => \{[\s\S]*?  \};\n/g, '');
code = code.replace(/  const handleBatchSetUserGroup = async \(groupName: string\) => \{[\s\S]*?  \};\n/g, '');

// Also remove `showAddUserGroupForm` states
code = code.replace(/  const \[showAddUserGroupForm, setShowAddUserGroupForm\] = useState\(false\);\n/, '');
code = code.replace(/  const \[newUserGroup, setNewUserGroup\] = useState<\{[\s\S]*?  \}>\(\{ name: '', enabledApis: \[\] \}\);\n/, '');
code = code.replace(/  const \[showEditUserGroupForm, setShowEditUserGroupForm\] = useState\(false\);\n/, '');
code = code.replace(/  const \[editingUserGroup, setEditingUserGroup\] = useState<\{[\s\S]*?  \} \| null>\(null\);/, '');

// unused userGroups
code = code.replace(/  const userGroups = config\?\.UserConfig\?\.Tags \|\| \[\];\n/, '');

// fix TS syntax if I removed something extra
// Actually, earlier in step 219 I used rewrite_settings.js which removed `handleSaveUserGroups` and others.
// The new script specifically targets what's still left causing errors.

fs.writeFileSync('src/app/settings/components/SystemSettings.tsx', code);
