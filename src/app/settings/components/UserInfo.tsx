'use client';

import { Database, Lock,User as UserIcon } from 'lucide-react';
import { useState } from 'react';

interface AuthInfo {
  username?: string;
  role?: 'owner' | 'admin' | 'user';
}

interface UserInfoProps {
  authInfo: AuthInfo | null;
  storageType: string;
  onLogout: () => void;
}

export default function UserInfo({
  authInfo,
  storageType,
  onLogout,
}: UserInfoProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getRoleText = (role?: string) => {
    switch (role) {
      case 'owner':
        return '站长';
      case 'admin':
        return '管理员';
      case 'user':
        return '用户';
      default:
        return '游客';
    }
  };

  const handleSubmitChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setPasswordError(
        !currentPassword
          ? '原密码不得为空'
          : newPassword
            ? '两次输入的新密码不一致'
            : '新密码不得为空'
      );
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.error || '修改密码失败');
        return;
      }
      onLogout();
    } catch {
      setPasswordError('网络错误，请稍后重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  const showChangePassword = storageType !== 'localstorage';

  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 relative overflow-hidden'>
      <div className='absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none' />

      <div className='flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700'>
        <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
          <UserIcon className='w-5 h-5 text-green-500' />
          用户信息
        </h3>
      </div>

      <div className='flex flex-col items-center pb-8 border-b border-gray-100 dark:border-gray-700/50 relative z-10'>
        <div className='w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg mb-4 text-4xl font-bold uppercase ring-4 ring-white dark:ring-gray-800'>
          {authInfo?.username?.[0] || 'U'}
        </div>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
          {authInfo?.username || '未登录'}
        </h2>
        <div className='mt-2 flex gap-2'>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(authInfo?.role || 'user') === 'owner'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                : (authInfo?.role || 'user') === 'admin'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}
          >
            {getRoleText(authInfo?.role || 'user')}
          </span>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'>
            <Database className='w-3 h-3 mr-1' />
            {storageType === 'localstorage' ? '本地' : storageType}
          </span>
        </div>
      </div>

      {showChangePassword && (
        <div className='pt-8'>
          <h4 className='text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4'>
            <Lock className='w-5 h-5 text-gray-500' />
            修改密码
          </h4>

          <div className='max-w-md bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-4'>
            <div>
              <label className='block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider'>
                当前密码
              </label>
              <input
                type='password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow'
                placeholder='验证当前密码以继续操作'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider'>
                新密码
              </label>
              <input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow'
                placeholder='请输入新密码'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider'>
                确认新密码
              </label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow'
                placeholder='请再次输入新密码'
              />
            </div>
            {passwordError && (
              <p className='text-xs text-red-500 font-medium'>
                {passwordError}
              </p>
            )}
            <div className='flex items-center gap-3 pt-2'>
              <button
                onClick={handleSubmitChangePassword}
                disabled={passwordLoading}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold text-white transition-all ${passwordLoading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 shadow-sm hover:shadow active:scale-[0.98]'
                  }`}
              >
                {passwordLoading ? '提交中...' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
