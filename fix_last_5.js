const fs = require('fs');
let code = fs.readFileSync('src/app/settings/components/SystemSettings.tsx', 'utf8');

// 1 & 2: Fix showAlert usage
code = code.replace(
  /showAlert\('success', `已\$\{enabled \? '启用' : '禁用'\}成人组权限`\);/g,
  `showSuccess(\`已\${enabled ? '启用' : '禁用'}成人组权限\`, showAlert);`
);
code = code.replace(
  /showAlert\('error', '操作失败'\);/g,
  `showError('操作失败', showAlert);`
);

// 3: Remove userGroups select block in AddUser form
// It looks like:
//               <div>
//                 <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
//                   用户组（可选）
//                 </label>
//                 <select ...>
//                   <option value=''>无用户组（无限制）</option>
//                   {userGroups.map((group) => ( ... ))}
//                 </select>
//               </div>
code = code.replace(
  /              <div>\r?\n                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>\r?\n                  用户组（可选）\r?\n                <\/label>\r?\n                <select[\s\S]*?\{userGroups\.map\(\(group\) => \([\s\S]*?<\/select>\r?\n              <\/div>/,
  ''
);

// 4: Remove handleConfigureUserGroup button in User List
// It looks like:
//                             {/* 配置用户组按钮 */}
//                             {(role === 'owner' ||
//                               (role === 'admin' &&
//                                 (user.role === 'user' ||
//                                   user.username === currentUsername))) && (
//                                 <button
//                                   onClick={() => handleConfigureUserGroup(user)}
//                                   className={buttonStyles.roundedPrimary}
//                                 >
//                                   配置
//                                 </button>
//                               )}
code = code.replace(
  /                            \{\/\* 配置用户组按钮 \*\/\}[\s\S]*?<button[\s\S]*?handleConfigureUserGroup\(user\)[\s\S]*?<\/button>\r?\n                              \}\)/,
  ''
);

fs.writeFileSync('src/app/settings/components/SystemSettings.tsx', code);
