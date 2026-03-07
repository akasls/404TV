'use client';

import { Check, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LocalSettings() {
  const [defaultAggregateSearch, setDefaultAggregateSearch] = useState(true);
  const [doubanProxyUrl, setDoubanProxyUrl] = useState('');
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [fluidSearch, setFluidSearch] = useState(true);
  const [liveDirectConnect, setLiveDirectConnect] = useState(false);
  const [doubanDataSource, setDoubanDataSource] = useState('cmliussss-cdn-tencent');
  const [doubanImageProxyType, setDoubanImageProxyType] = useState('cmliussss-cdn-tencent');
  const [doubanImageProxyUrl, setDoubanImageProxyUrl] = useState('');
  const [isDoubanDropdownOpen, setIsDoubanDropdownOpen] = useState(false);
  const [isDoubanImageProxyDropdownOpen, setIsDoubanImageProxyDropdownOpen] = useState(false);

  const doubanDataSourceOptions = [
    { value: 'direct', label: '直连（服务器直接请求豆瓣）' },
    { value: 'cors-proxy-zwei', label: 'Cors Proxy By Zwei' },
    { value: 'cmliussss-cdn-tencent', label: '豆瓣 CDN By CMLiussss（腾讯云）' },
    { value: 'cmliussss-cdn-ali', label: '豆瓣 CDN By CMLiussss（阿里云）' },
    { value: 'custom', label: '自定义代理' },
  ];

  const doubanImageProxyTypeOptions = [
    { value: 'direct', label: '直连（浏览器直接请求豆瓣）' },
    { value: 'server', label: '服务器代理（由服务器代理请求豆瓣）' },
    { value: 'img3', label: '豆瓣官方精品 CDN（阿里云）' },
    { value: 'cmliussss-cdn-tencent', label: '豆瓣 CDN By CMLiussss（腾讯云）' },
    { value: 'cmliussss-cdn-ali', label: '豆瓣 CDN By CMLiussss（阿里云）' },
    { value: 'custom', label: '自定义代理' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAggregateSearch = localStorage.getItem('defaultAggregateSearch');
      if (savedAggregateSearch !== null) setDefaultAggregateSearch(JSON.parse(savedAggregateSearch));

      const savedDoubanDataSource = localStorage.getItem('doubanDataSource');
      const defaultDoubanProxyType = (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY_TYPE || 'cmliussss-cdn-tencent';
      setDoubanDataSource(savedDoubanDataSource !== null ? savedDoubanDataSource : defaultDoubanProxyType);

      const savedDoubanProxyUrl = localStorage.getItem('doubanProxyUrl');
      const defaultDoubanProxy = (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY || '';
      setDoubanProxyUrl(savedDoubanProxyUrl !== null ? savedDoubanProxyUrl : defaultDoubanProxy);

      const savedDoubanImageProxyType = localStorage.getItem('doubanImageProxyType');
      const defaultDoubanImageProxyType = (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY_TYPE || 'cmliussss-cdn-tencent';
      setDoubanImageProxyType(savedDoubanImageProxyType !== null ? savedDoubanImageProxyType : defaultDoubanImageProxyType);

      const savedDoubanImageProxyUrl = localStorage.getItem('doubanImageProxyUrl');
      const defaultDoubanImageProxyUrl = (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY || '';
      setDoubanImageProxyUrl(savedDoubanImageProxyUrl !== null ? savedDoubanImageProxyUrl : defaultDoubanImageProxyUrl);

      const savedEnableOptimization = localStorage.getItem('enableOptimization');
      if (savedEnableOptimization !== null) setEnableOptimization(JSON.parse(savedEnableOptimization));

      const savedFluidSearch = localStorage.getItem('fluidSearch');
      const defaultFluidSearch = (window as any).RUNTIME_CONFIG?.FLUID_SEARCH !== false;
      setFluidSearch(savedFluidSearch !== null ? JSON.parse(savedFluidSearch) : defaultFluidSearch);

      const savedLiveDirectConnect = localStorage.getItem('liveDirectConnect');
      if (savedLiveDirectConnect !== null) setLiveDirectConnect(JSON.parse(savedLiveDirectConnect));
    }
  }, []);

  const handleResetSettings = () => {
    const defaultDoubanProxyType = (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY_TYPE || 'cmliussss-cdn-tencent';
    const defaultDoubanProxy = (window as any).RUNTIME_CONFIG?.DOUBAN_PROXY || '';
    const defaultDoubanImageProxyType = (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY_TYPE || 'cmliussss-cdn-tencent';
    const defaultDoubanImageProxyUrl = (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY || '';
    const defaultFluidSearch = (window as any).RUNTIME_CONFIG?.FLUID_SEARCH !== false;

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

  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700'>
        <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
          <SettingsIcon className='w-6 h-6 text-green-500' />
          本地设置
        </h3>
        <button
          onClick={handleResetSettings}
          className='px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors'
        >
          恢复默认
        </button>
      </div>

      <div className='space-y-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-700'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>聚合搜索</h4>
              <p className='text-xs text-gray-500 mt-1'>默认开启多源并行搜索，加快搜片速度。</p>
            </div>
            <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={defaultAggregateSearch}
                onChange={(e) => {
                  setDefaultAggregateSearch(e.target.checked);
                  localStorage.setItem('defaultAggregateSearch', JSON.stringify(e.target.checked));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className='flex items-start justify-between gap-4'>
            <div>
              <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>流式搜索加载</h4>
              <p className='text-xs text-gray-500 mt-1'>搜索时一边加载一边渲染，极速展示前序结果。</p>
            </div>
            <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={fluidSearch}
                onChange={(e) => {
                  setFluidSearch(e.target.checked);
                  localStorage.setItem('fluidSearch', JSON.stringify(e.target.checked));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className='flex items-start justify-between gap-4'>
            <div>
              <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>解析优选</h4>
              <p className='text-xs text-gray-500 mt-1'>自动测速并跳转最快的播放线路。</p>
            </div>
            <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={enableOptimization}
                onChange={(e) => {
                  setEnableOptimization(e.target.checked);
                  localStorage.setItem('enableOptimization', JSON.stringify(e.target.checked));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className='flex items-start justify-between gap-4'>
            <div>
              <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>IPTV 直连</h4>
              <p className='text-xs text-gray-500 mt-1'>开启时需使用 Allow CORS 等浏览器跨域插件。</p>
            </div>
            <label className='relative inline-flex flex-shrink-0 cursor-pointer pt-1'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={liveDirectConnect}
                onChange={(e) => {
                  setLiveDirectConnect(e.target.checked);
                  localStorage.setItem('liveDirectConnect', JSON.stringify(e.target.checked));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='relative'>
            <label className='block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1'>豆瓣数据代理</label>
            <p className='text-xs text-gray-500 mb-2'>配置获取豆瓣元数据的方式，突破官方请求频率限制。</p>
            <div className='relative' data-dropdown='douban-datasource'>
              <button
                type='button'
                onClick={() => setIsDoubanDropdownOpen(!isDoubanDropdownOpen)}
                className='w-full sm:w-[80%] flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-green-500 transition-colors'
              >
                {doubanDataSourceOptions.find((o) => o.value === doubanDataSource)?.label}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDoubanDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDoubanDropdownOpen && (
                <div className='absolute z-10 w-full sm:w-[80%] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden'>
                  {doubanDataSourceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDoubanDataSource(option.value);
                        localStorage.setItem('doubanDataSource', option.value);
                        setIsDoubanDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${doubanDataSource === option.value ? 'text-green-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {option.label}
                      {doubanDataSource === option.value && <Check className='w-4 h-4' />}
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
                  localStorage.setItem('doubanProxyUrl', e.target.value);
                }}
                className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-green-500 focus:outline-none'
              />
            </div>
          )}

          <div className='relative pt-2'>
            <label className='block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1'>豆瓣图片代理</label>
            <p className='text-xs text-gray-500 mb-2'>由于豆瓣图片防盗链限制，需配置图片反代才可正常加载海报。</p>
            <div className='relative' data-dropdown='douban-image-proxy'>
              <button
                type='button'
                onClick={() => setIsDoubanImageProxyDropdownOpen(!isDoubanImageProxyDropdownOpen)}
                className='w-full sm:w-[80%] flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-green-500 transition-colors'
              >
                {doubanImageProxyTypeOptions.find((o) => o.value === doubanImageProxyType)?.label}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDoubanImageProxyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDoubanImageProxyDropdownOpen && (
                <div className='absolute z-10 w-full sm:w-[80%] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden'>
                  {doubanImageProxyTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDoubanImageProxyType(option.value);
                        localStorage.setItem('doubanImageProxyType', option.value);
                        setIsDoubanImageProxyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${doubanImageProxyType === option.value ? 'text-green-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {option.label}
                      {doubanImageProxyType === option.value && <Check className='w-4 h-4' />}
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
                placeholder='https://proxy.example.com/fetch?url='
                value={doubanImageProxyUrl}
                onChange={(e) => {
                  setDoubanImageProxyUrl(e.target.value);
                  localStorage.setItem('doubanImageProxyUrl', e.target.value);
                }}
                className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-green-500 focus:outline-none'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
