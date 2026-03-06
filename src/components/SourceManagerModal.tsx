import { Dialog, Switch, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

interface Source {
  key: string;
  name: string;
}

interface SourceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SourceManagerModal: React.FC<SourceManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [enabledKeys, setEnabledKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (isOpen) {
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
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  const handleToggle = (key: string) => {
    setEnabledKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleToggleAll = () => {
    if (enabledKeys.length === sources.length) {
      // 已经全部选中，则全部取消
      setEnabledKeys([]);
    } else {
      // 否则全部选中
      setEnabledKeys(sources.map((s) => s.key));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/user/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabledKeys }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title
                  as='h3'
                  className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center'
                >
                  视频源管理
                  {sources.length > 0 && (
                    <button
                      onClick={handleToggleAll}
                      className='text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                    >
                      {enabledKeys.length === sources.length ? '全部取消' : '全部选择'}
                    </button>
                  )}
                </Dialog.Title>

                <div className='mt-4'>
                  {error && (
                    <div className='mb-4 text-sm text-red-500 bg-red-100/50 dark:bg-red-500/10 p-3 rounded-md'>
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className='flex justify-center items-center py-8'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
                    </div>
                  ) : sources.length === 0 ? (
                    <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                      暂无可用的视频源
                    </div>
                  ) : (
                    <div className='max-h-[400px] overflow-y-auto pr-2 space-y-3'>
                      {sources.map((source) => (
                        <div
                          key={source.key}
                          className='flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer select-none'
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

                <div className='mt-6 flex justify-end gap-3'>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50'
                    onClick={onClose}
                    disabled={saving || loading}
                  >
                    取消
                  </button>
                  <button
                    type='button'
                    className='inline-flex items-center justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 min-w-[80px]'
                    onClick={handleSave}
                    disabled={saving || loading}
                  >
                    {saving ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    ) : (
                      '保存'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SourceManagerModal;
