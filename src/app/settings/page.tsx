'use client';

import { KeyRound, MonitorPlay, Settings as SettingsIcon, Shield, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAuthInfoFromBrowserCookie } from '@/lib/auth';

import PageLayout from '@/components/PageLayout';

// Subcomponents
import LocalSettings from './components/LocalSettings';
import SourceManager from './components/SourceManager';
import SystemSettings from './components/SystemSettings';
import UserInfo from './components/UserInfo';

interface AuthInfo {
  username?: string;
  role?: 'owner' | 'admin' | 'user';
}

type TabType = 'user' | 'sources' | 'local' | 'system';

export default function SettingsPage() {
  const router = useRouter();
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

      const type = (window as any).RUNTIME_CONFIG?.STORAGE_TYPE || 'localstorage';
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
      console.error('注销请求失败:', error);
    }
    window.location.href = '/';
  };

  const showAdminPanel = authInfo?.role === 'owner' || authInfo?.role === 'admin';

  if (!mounted) return null;

  return (
    <PageLayout activePath='/settings'>
      <div className='max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Header Title */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='flex items-center gap-3 text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              <UserIcon className='w-8 h-8 text-green-500' />
              个人中心
            </h1>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              管理您的账号信息、应用偏好以及观看体验设置。
            </p>
          </div>
          <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            className='md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            title='切换主题'
          >
            <svg className='w-5 h-5 dark:hidden' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' /></svg>
            <svg className='w-5 h-5 hidden dark:block' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* 左侧菜单 */}
          <div className='lg:col-span-1 space-y-2'>
            <nav className='flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide'>
              <button
                onClick={() => setActiveTab('user')}
                className={`flex-shrink-0 w-full lg:w-auto px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'user'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
              >
                <UserIcon className='w-5 h-5' />
                用户信息
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                className={`flex-shrink-0 w-full lg:w-auto px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'sources'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
              >
                <MonitorPlay className='w-5 h-5' />
                视频源管理
              </button>

              <button
                onClick={() => setActiveTab('local')}
                className={`flex-shrink-0 w-full lg:w-auto px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'local'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
              >
                <SettingsIcon className='w-5 h-5' />
                应用本地设置
              </button>

              {showAdminPanel && (
                <button
                  onClick={() => setActiveTab('system')}
                  className={`flex-shrink-0 w-full lg:w-auto px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'system'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                  <Shield className='w-5 h-5' />
                  系统管理设置
                </button>
              )}
            </nav>
          </div>

          {/* 右侧内容区域 */}
          <div className='lg:col-span-3 min-h-[500px]'>
            {activeTab === 'user' && (
              <UserInfo authInfo={authInfo} storageType={storageType} onLogout={handleLogout} />
            )}
            {activeTab === 'sources' && (
              <SourceManager />
            )}
            {activeTab === 'local' && (
              <LocalSettings />
            )}
            {activeTab === 'system' && showAdminPanel && (
              <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4'>
                <SystemSettings />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
