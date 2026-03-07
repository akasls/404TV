/* eslint-disable no-console,@typescript-eslint/no-explicit-any */
'use client';

import {
  Check,
  ChevronDown,
  Database,
  KeyRound,
  LogOut,
  MonitorPlay,
  Settings as SettingsIcon,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAuthInfoFromBrowserCookie } from '@/lib/auth';

import PageLayout from '@/components/PageLayout';
import SourceManagerModal from '@/components/SourceManagerModal';

interface AuthInfo {
  username?: string;
  role?: 'owner' | 'admin' | 'user';
}

export default function SettingsPage() {
  const router = useRouter();
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [storageType, setStorageType] = useState<string>('localstorage');
  const [mounted, setMounted] = useState(false);

  // Modals state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSourceManagerOpen, setIsSourceManagerOpen] = useState(false);

  // Settings states
  const [defaultAggregateSearch, setDefaultAggregateSearch] = useState(true);
  const [doubanProxyUrl, setDoubanProxyUrl] = useState('');
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [fluidSearch, setFluidSearch] = useState(true);
  const [liveDirectConnect, setLiveDirectConnect] = useState(false);
  const [doubanDataSource, setDoubanDataSource] = useState(
    'cmliussss-cdn-tencent'
  );
  const [doubanImageProxyType, setDoubanImageProxyType] = useState(
    'cmliussss-cdn-tencent'
  );
  const [doubanImageProxyUrl, setDoubanImageProxyUrl] = useState('');
  const [isDoubanDropdownOpen, setIsDoubanDropdownOpen] = useState(false);
  const [isDoubanImageProxyDropdownOpen, setIsDoubanImageProxyDropdownOpen] =
    useState(false);

  // Change password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const doubanDataSourceOptions = [
    { value: 'direct', label: '直连（服务器直接请求豆瓣）' },
    { value: 'cors-proxy-zwei', label: 'Cors Proxy By Zwei' },
    {
      value: 'cmliussss-cdn-tencent',
      label: '豆瓣 CDN By CMLiussss（腾讯云）',
    },
    { value: 'cmliussss-cdn-ali', label: '豆瓣 CDN By CMLiussss（阿里云）' },
    { value: 'custom', label: '自定义代理' },
  ];

  const doubanImageProxyTypeOptions = [
    { value: 'direct', label: '直连（浏览器直接请求豆瓣）' },
    { value: 'server', label: '服务器代理（由服务器代理请求豆瓣）' },
    { value: 'img3', label: '豆瓣官方精品 CDN（阿里云）' },
    {
      value: 'cmliussss-cdn-tencent',
      label: '豆瓣 CDN By CMLiussss（腾讯云）',
    },
    { value: 'cmliussss-cdn-ali', label: '豆瓣 CDN By CMLiussss（阿里云）' },
    { value: 'custom', label: '自定义代理' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = getAuthInfoFromBrowserCookie();
      setAuthInfo(auth);

      const type =
        (window as any).RUNTIME_CONFIG?.STORAGE_TYPE || 'localstorage';
      setStorageType(type);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAggregateSearch = localStorage.getItem(
        'defaultAggregateSearch'
      );
      if (savedAggregateSearch !== null)
        setDefaultAggregateSearch(JSON.parse(savedAggregateSearch));

      const savedDoubanDataSource = localStorage.getItem('doubanDataSource');
      const defaultDoubanProxyType =
        (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY_TYPE ||
        'cmliussss-cdn-tencent';
      setDoubanDataSource(
        savedDoubanDataSource !== null
          ? savedDoubanDataSource
          : defaultDoubanProxyType
      );

      const savedDoubanProxyUrl = localStorage.getItem('doubanProxyUrl');
      const defaultDoubanProxy =
        (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY || '';
      setDoubanProxyUrl(
        savedDoubanProxyUrl !== null ? savedDoubanProxyUrl : defaultDoubanProxy
      );

      const savedDoubanImageProxyType = localStorage.getItem(
        'doubanImageProxyType'
      );
      const defaultDoubanImageProxyType =
        (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY_TYPE ||
        'cmliussss-cdn-tencent';
      setDoubanImageProxyType(
        savedDoubanImageProxyType !== null
          ? savedDoubanImageProxyType
          : defaultDoubanImageProxyType
      );

      const savedDoubanImageProxyUrl = localStorage.getItem(
        'doubanImageProxyUrl'
      );
      const defaultDoubanImageProxyUrl =
        (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY || '';
      setDoubanImageProxyUrl(
        savedDoubanImageProxyUrl !== null
          ? savedDoubanImageProxyUrl
          : defaultDoubanImageProxyUrl
      );

      const savedEnableOptimization =
        localStorage.getItem('enableOptimization');
      if (savedEnableOptimization !== null)
        setEnableOptimization(JSON.parse(savedEnableOptimization));

      const savedFluidSearch = localStorage.getItem('fluidSearch');
      const defaultFluidSearch =
        (window as any).RUNTIME_CONFIG?.FLUID_SEARCH !== false;
      setFluidSearch(
        savedFluidSearch !== null
          ? JSON.parse(savedFluidSearch)
          : defaultFluidSearch
      );

      const savedLiveDirectConnect = localStorage.getItem('liveDirectConnect');
      if (savedLiveDirectConnect !== null)
        setLiveDirectConnect(JSON.parse(savedLiveDirectConnect));
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

  const handleSubmitChangePassword = async () => {
    setPasswordError('');
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError(newPassword ? '两次输入的密码不一致' : '新密码不得为空');
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.error || '修改密码失败');
        return;
      }
      setIsChangePasswordOpen(false);
      await handleLogout();
    } catch {
      setPasswordError('网络错误，请稍后重试');
    } finally {
      setPasswordLoading(false);
    }
  };

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

  const handleResetSettings = () => {
    const defaultDoubanProxyType =
      (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY_TYPE ||
      'cmliussss-cdn-tencent';
    const defaultDoubanProxy =
      (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY || '';
    const defaultDoubanImageProxyType =
      (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY_TYPE ||
      'cmliussss-cdn-tencent';
    const defaultDoubanImageProxyUrl =
      (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY || '';
    const defaultFluidSearch =
      (window as any).RUNTIME_CONFIG?.FLUID_SEARCH !== false;

    setDefaultAggregateSearch(true);
    setEnableOptimization(true);
    setFluidSearch(defaultFluidSearch);
    setLiveDirectConnect(false);
    setDoubanProxyUrl(defaultDoubanProxy);
    setDoubanDataSource(defaultDoubanProxyType);
    setDoubanImageProxyType(defaultDoubanImageProxyType);
    setDoubanImageProxyUrl(defaultDoubanImageProxyUrl);

    if (typeof window !== 'undefined') {
      localStorage.setItem('defaultAggregateSearch', JSON.stringify(true));
      localStorage.setItem('enableOptimization', JSON.stringify(true));
      localStorage.setItem('fluidSearch', JSON.stringify(defaultFluidSearch));
      localStorage.setItem('liveDirectConnect', JSON.stringify(false));
      localStorage.setItem('doubanProxyUrl', defaultDoubanProxy);
      localStorage.setItem('doubanDataSource', defaultDoubanProxyType);
      localStorage.setItem('doubanImageProxyType', defaultDoubanImageProxyType);
      localStorage.setItem('doubanImageProxyUrl', defaultDoubanImageProxyUrl);
    }
  };

  const showAdminPanel =
    authInfo?.role === 'owner' || authInfo?.role === 'admin';
  const showChangePassword =
    authInfo?.role !== 'owner' && storageType !== 'localstorage';

  if (!mounted) return null;

  return (
    <PageLayout activePath='/settings'>
      <div className='max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Header Title */}
        <div className='mb-8'>
          <h1 className='flex items-center gap-3 text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
            <UserIcon className='w-8 h-8 text-green-500' />
            个人中心
          </h1>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
            管理您的账号信息、应用偏好以及观看体验设置。
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* 左侧菜单 */}
          <div className='col-span-1 space-y-4'>
            {/* 账户卡片 */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none' />
              <div className='flex flex-col items-center pb-4 border-b border-gray-100 dark:border-gray-700/50 relative z-10'>
                <div className='w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg mb-4 text-3xl font-bold uppercase ring-4 ring-white dark:ring-gray-800'>
                  {authInfo?.username?.[0] || 'U'}
                </div>
                <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                  {authInfo?.username || '未登录'}
                </h2>
                <div className='mt-2 flex gap-2'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (authInfo?.role || 'user') === 'owner'
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

              {/* 操作菜单 */}
              <div className='pt-4 space-y-2 relative z-10'>
                {showAdminPanel && (
                  <button
                    onClick={() => router.push('/admin')}
                    className='w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/30 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-all'
                  >
                    <Shield className='w-4 h-4' /> 管理面板
                  </button>
                )}

                <button
                  onClick={() => setIsSourceManagerOpen(true)}
                  className='w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/30 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-all'
                >
                  <MonitorPlay className='w-4 h-4' /> 视频源管理
                </button>

                {showChangePassword && (
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className='w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/30 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-all'
                  >
                    <KeyRound className='w-4 h-4' /> 修改密码
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className='w-full mt-4 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all'
                >
                  <LogOut className='w-4 h-4' /> 退出登录
                </button>
              </div>
            </div>
          </div>

          {/* 右侧设置区域 */}
          <div className='col-span-1 md:col-span-2 space-y-6'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8'>
              <div className='flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700'>
                <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
                  <SettingsIcon className='w-6 h-6 text-green-500' />
                  应用本地设置
                </h3>
                <button
                  onClick={handleResetSettings}
                  className='px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors'
                >
                  恢复默认
                </button>
              </div>

              {/* 配置表单 */}
              <div className='space-y-8'>
                {/* 偏好设置 Toggle组 */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-700'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        聚合搜索
                      </h4>
                      <p className='text-xs text-gray-500 mt-1'>
                        默认开启多源并行搜索，加快搜片速度。
                      </p>
                    </div>
                    <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={defaultAggregateSearch}
                        onChange={(e) => {
                          setDefaultAggregateSearch(e.target.checked);
                          localStorage.setItem(
                            'defaultAggregateSearch',
                            JSON.stringify(e.target.checked)
                          );
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        流式搜索加载
                      </h4>
                      <p className='text-xs text-gray-500 mt-1'>
                        搜索时一边加载一边渲染，极速展示前序结果。
                      </p>
                    </div>
                    <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={fluidSearch}
                        onChange={(e) => {
                          setFluidSearch(e.target.checked);
                          localStorage.setItem(
                            'fluidSearch',
                            JSON.stringify(e.target.checked)
                          );
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        解析优选
                      </h4>
                      <p className='text-xs text-gray-500 mt-1'>
                        自动测速并跳转最快的播放线路。
                      </p>
                    </div>
                    <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={enableOptimization}
                        onChange={(e) => {
                          setEnableOptimization(e.target.checked);
                          localStorage.setItem(
                            'enableOptimization',
                            JSON.stringify(e.target.checked)
                          );
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        IPTV 直连
                      </h4>
                      <p className='text-xs text-gray-500 mt-1'>
                        开启时需使用 Allow CORS 等浏览器跨域插件。
                      </p>
                    </div>
                    <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={liveDirectConnect}
                        onChange={(e) => {
                          setLiveDirectConnect(e.target.checked);
                          localStorage.setItem(
                            'liveDirectConnect',
                            JSON.stringify(e.target.checked)
                          );
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                {/* API & Proxy 设置 */}
                <div className='space-y-6'>
                  {/* 豆瓣数据源 */}
                  <div className='relative'>
                    <label className='block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1'>
                      豆瓣数据代理
                    </label>
                    <p className='text-xs text-gray-500 mb-2'>
                      配置获取豆瓣元数据的方式，突破官方请求频率限制。
                    </p>
                    <div className='relative' data-dropdown='douban-datasource'>
                      <button
                        type='button'
                        onClick={() =>
                          setIsDoubanDropdownOpen(!isDoubanDropdownOpen)
                        }
                        className='w-full sm:w-[80%] flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-green-500 transition-colors'
                      >
                        {
                          doubanDataSourceOptions.find(
                            (o) => o.value === doubanDataSource
                          )?.label
                        }
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform ${
                            isDoubanDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isDoubanDropdownOpen && (
                        <div className='absolute z-10 w-full sm:w-[80%] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden'>
                          {doubanDataSourceOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setDoubanDataSource(option.value);
                                localStorage.setItem(
                                  'doubanDataSource',
                                  option.value
                                );
                                setIsDoubanDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                doubanDataSource === option.value
                                  ? 'text-green-600 font-semibold'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {option.label}
                              {doubanDataSource === option.value && (
                                <Check className='w-4 h-4' />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {doubanDataSource === 'custom' && (
                    <div className='w-full sm:w-[80%]'>
                      <input
                        type='text'
                        placeholder='https://proxy.example.com/fetch?url='
                        value={doubanProxyUrl}
                        onChange={(e) => {
                          setDoubanProxyUrl(e.target.value);
                          localStorage.setItem(
                            'doubanProxyUrl',
                            e.target.value
                          );
                        }}
                        className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-green-500 focus:outline-none'
                      />
                    </div>
                  )}

                  {/* 豆瓣图片代理 */}
                  <div className='relative pt-2'>
                    <label className='block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1'>
                      豆瓣图片代理
                    </label>
                    <p className='text-xs text-gray-500 mb-2'>
                      由于豆瓣图片防盗链限制，需配置图片反代才可正常加载海报。
                    </p>
                    <div
                      className='relative'
                      data-dropdown='douban-image-proxy'
                    >
                      <button
                        type='button'
                        onClick={() =>
                          setIsDoubanImageProxyDropdownOpen(
                            !isDoubanImageProxyDropdownOpen
                          )
                        }
                        className='w-full sm:w-[80%] flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-green-500 transition-colors'
                      >
                        {
                          doubanImageProxyTypeOptions.find(
                            (o) => o.value === doubanImageProxyType
                          )?.label
                        }
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform ${
                            isDoubanImageProxyDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isDoubanImageProxyDropdownOpen && (
                        <div className='absolute z-10 w-full sm:w-[80%] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden'>
                          {doubanImageProxyTypeOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setDoubanImageProxyType(option.value);
                                localStorage.setItem(
                                  'doubanImageProxyType',
                                  option.value
                                );
                                setIsDoubanImageProxyDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                doubanImageProxyType === option.value
                                  ? 'text-green-600 font-semibold'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {option.label}
                              {doubanImageProxyType === option.value && (
                                <Check className='w-4 h-4' />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {doubanImageProxyType === 'custom' && (
                    <div className='w-full sm:w-[80%]'>
                      <input
                        type='text'
                        placeholder='配置自定义图片代理接口'
                        value={doubanImageProxyUrl}
                        onChange={(e) => {
                          setDoubanImageProxyUrl(e.target.value);
                          localStorage.setItem(
                            'doubanImageProxyUrl',
                            e.target.value
                          );
                        }}
                        className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-green-500 focus:outline-none'
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {isChangePasswordOpen && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center'>
          <div className='w-[90%] max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold flex items-center gap-2'>
                <KeyRound className='text-green-500' /> 修改密码
              </h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className='p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors'
              >
                <X />
              </button>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium mb-1 block'>新密码</label>
                <input
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  className='w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all'
                />
              </div>
              <div>
                <label className='text-sm font-medium mb-1 block'>
                  确认密码
                </label>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  className='w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all'
                />
              </div>
              {passwordError && (
                <p className='text-red-500 text-sm'>{passwordError}</p>
              )}
              <button
                disabled={passwordLoading}
                onClick={handleSubmitChangePassword}
                className='w-full py-2.5 mt-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50'
              >
                {passwordLoading ? '提交中...' : '确认修改并重新登录'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 视频源管理器 */}
      <SourceManagerModal
        isOpen={isSourceManagerOpen}
        onClose={() => setIsSourceManagerOpen(false)}
      />
    </PageLayout>
  );
}
