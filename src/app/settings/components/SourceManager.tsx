'use client';

import { Switch } from '@headlessui/react';
import { MonitorPlay } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Source {
  key: string;
  name: string;
  group: 'view' | 'adult';
}

import { useMode } from '@/components/ModeProvider';

export default function SourceManager() {
  const { isAdultMode, setIsAdultMode } = useMode();
  const [sources, setSources] = useState<Source[]>([]);
  const [isAdultEnabled, setIsAdultEnabled] = useState(false);
  const [enabledKeys, setEnabledKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetch('/api/user/sources')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.error) {
          setError(data.error);
        } else {
          setSources(data.allSources || []);
          setEnabledKeys(data.userEnabledKeys || []);
          setIsAdultEnabled(data.isAdultEnabled || false);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || '获取视频源失败');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveEnabledKeys = async (newKeys: string[]) => {
    try {
      await fetch('/api/user/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabledKeys: newKeys }),
      });
    } catch (err: any) {
      setError(err.message || '保存失败');
    }
  };

  const handleToggle = (key: string) => {
    let newKeys: string[];
    if (enabledKeys.includes(key)) {
      newKeys = enabledKeys.filter((k) => k !== key);
    } else {
      newKeys = [...enabledKeys, key];
    }
    setEnabledKeys(newKeys);
    saveEnabledKeys(newKeys);
  };

  // 当前模式下可见的源
  const visibleSources = sources.filter(
    (s) => isAdultMode ? s.group === 'adult' : s.group !== 'adult'
  );

  const handleToggleAll = () => {
    const visibleKeys = visibleSources.map((s) => s.key);
    const allVisibleEnabled = visibleKeys.every((k) => enabledKeys.includes(k));

    let newKeys: string[];
    if (allVisibleEnabled) {
      newKeys = enabledKeys.filter((k) => !visibleKeys.includes(k));
    } else {
      newKeys = Array.from(new Set([...enabledKeys, ...visibleKeys]));
    }
    setEnabledKeys(newKeys);
    saveEnabledKeys(newKeys);
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700'>
        <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2'>
          <MonitorPlay className='w-6 h-6 text-green-500' />
          视频源管理
          {isAdultEnabled && (
            <div className="ml-4 flex items-center">
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 mr-2">模式:</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setIsAdultMode(false)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${!isAdultMode ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  观影
                </button>
                <button
                  onClick={() => setIsAdultMode(true)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${isAdultMode ? 'bg-pink-500 text-white shadow dark:bg-pink-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  成人
                </button>
              </div>
            </div>
          )}
        </h3>
        {visibleSources.length > 0 && !loading && (
          <button
            onClick={handleToggleAll}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${visibleSources.every(s => enabledKeys.includes(s.key))
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
              }`}
          >
            {visibleSources.every(s => enabledKeys.includes(s.key)) ? '全部停用' : '全部启用'}
          </button>
        )}
      </div>

      <div className='space-y-4'>
        {error && (
          <div className='mb-4 text-sm text-red-500 bg-red-100/50 dark:bg-red-500/10 p-3 rounded-md'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
          </div>
        ) : visibleSources.length === 0 ? (
          <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
            暂无可用的视频源
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {visibleSources.map((source) => (
              <div
                key={source.key}
                className='flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer select-none'
                onClick={() => handleToggle(source.key)}
              >
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {source.name}
                </span>
                <Switch
                  checked={enabledKeys.includes(source.key)}
                  onChange={() => handleToggle(source.key)}
                  className={`${enabledKeys.includes(source.key)
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                >
                  <span className='sr-only'>启/停 {source.name}</span>
                  <span
                    className={`${enabledKeys.includes(source.key)
                      ? 'translate-x-6'
                      : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
