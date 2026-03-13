'use client';

import {
  LogOut,
  MonitorPlay,
  Settings as SettingsIcon,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { getAuthInfoFromBrowserCookie } from '@/lib/auth';

import PageLayout from '@/components/PageLayout';

// Subcomponents
import LocalSettings from './components/LocalSettings';
import SystemSettings from './components/SystemSettings';
import UserInfo from './components/UserInfo';

interface AuthInfo {
  username?: string;
  role?: 'owner' | 'admin' | 'user';
}

type TabType = 'user' | 'local' | 'system';

export default function SettingsPage() {
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [storageType, setStorageType] = useState<string>('localstorage');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('user');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = getAuthInfoFromBrowserCookie();
      setAuthInfo(auth);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const type =
        (window as any).RUNTIME_CONFIG?.STORAGE_TYPE || 'localstorage';
      setStorageType(type);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('注销请求失败:', error);
    }
    window.location.href = '/';
  };

  const showAdminPanel =
    authInfo?.role === 'owner' || authInfo?.role === 'admin';

  if (!mounted) return null;

  return (
    <PageLayout activePath='/settings'>
      <div className='max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Header Title */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              <UserIcon className='w-6 h-6 sm:w-8 sm:h-8 text-green-500' />
              个人中心
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            {showAdminPanel && (
              <button
                onClick={() => setActiveTab(activeTab === 'system' ? 'user' : 'system')}
                className={`p-2 rounded-full transition-colors ${activeTab === 'system' ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                title={activeTab === 'system' ? '返回个人中心' : '管理员设置'}
              >
                <Shield className='w-5 h-5' />
              </button>
            )}
            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className='md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
              title='切换主题'
            >
              <svg
                className='w-5 h-5 dark:hidden'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                />
              </svg>
              <svg
                className='w-5 h-5 hidden dark:block'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className='p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors'
              title='退出登录'
            >
              <LogOut className='w-5 h-5' />
            </button>
          </div>
        </div>

        <div className='flex flex-col space-y-6'>
          {/* 下部内容区域 */}
          <div className='min-h-[500px]'>
            {activeTab === 'user' && (
              <UserInfo
                authInfo={authInfo}
                storageType={storageType}
                onLogout={handleLogout}
              />
            )}
            {activeTab === 'local' && <LocalSettings />}
            {activeTab === 'system' && showAdminPanel && <SystemSettings />}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
