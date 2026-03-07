'use client';

import { Switch } from '@headlessui/react';
import { MonitorPlay } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Source {
  key: string;
  name: string;
}

export default function SourceManager() {
  const [sources, setSources] = useState<Source[]>([]);
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

  const handleToggleAll = () => {
    let newKeys: string[];
    if (enabledKeys.length === sources.length) {
      newKeys = [];
    } else {
      newKeys = sources.map((s) => s.key);
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
        </h3>
        {sources.length > 0 && !loading && (
          <button
            onClick={handleToggleAll}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${enabledKeys.length === sources.length
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
              }`}
          >
            {enabledKeys.length === sources.length ? '全部停用' : '全部启用'}
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
        ) : sources.length === 0 ? (
          <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
            暂无可用的视频源
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {sources.map((source) => (
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
