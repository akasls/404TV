const fs = require('fs');

let code = fs.readFileSync('src/app/settings/components/SystemSettings.tsx', 'utf8');

// 1. Remove handleConfigureUserGroup
code = code.replace(/  const handleConfigureUserGroup = \([\s\S]*?  \};\r?\n/, '');

// 2. Remove user.tags display
code = code.replace(/                            <span className='text-sm text-gray-900 dark:text-gray-100'>\r?\n                              \{user\.tags && user\.tags\.length > 0\r?\n                                \? user\.tags\.join\(\', \'\)\r?\n                                : \'无用户组\'\}\r?\n                            <\/span>/g, '');

// 3. Remove configure user group button
code = code.replace(/                            \{\/\* 配置用户组按钮 \*\/\}[\s\S]*?                              \}\)/g, '');

// 4. Remove userGroups.map from AddUser
code = code.replace(/                  <option value=''>无用户组（无限制）<\/option>\r?\n                  \{userGroups\.map\(\(group\) => \([\s\S]*?                    <\/option>\r?\n                  \}\)\}\r?\n/g, '');


fs.writeFileSync('src/app/settings/components/SystemSettings.tsx', code);
