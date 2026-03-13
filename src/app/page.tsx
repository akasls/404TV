/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, no-console */

'use client';

import { Cat, ChevronRight, Film, Heart, MonitorPlay, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

import {
  clearAllFavorites,
  getAllFavorites,
  getAllPlayRecords,
  subscribeToDataUpdates,
} from '@/lib/db.client';

import ContinueWatching from '@/components/ContinueWatching';
import { useMode } from '@/components/ModeProvider';
import PageLayout from '@/components/PageLayout';
import ScrollableRow from '@/components/ScrollableRow';
import { useSite } from '@/components/SiteProvider';
import VideoCard from '@/components/VideoCard';
import SourceManager from '@/components/SourceManager';
import CapsuleSwitch from '@/components/CapsuleSwitch';

type FavoriteItem = {
  id: string;
  source: string;
  title: string;
  poster: string;
  episodes: number;
  source_name: string;
  currentEpisode?: number;
  search_title?: string;
  origin?: 'vod' | 'live';
};

function HomeClient() {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const { announcement } = useSite();
  const { isAdultMode, setIsAdultMode } = useMode();

  // 处理收藏数据更新的函数
  const updateFavoriteItems = async (allFavorites: Record<string, any>) => {
    const allPlayRecords = await getAllPlayRecords();

    // 根据保存时间排序（从近到远）
    const sorted = Object.entries(allFavorites)
      .sort(([, a], [, b]) => b.save_time - a.save_time)
      .map(([key, fav]) => {
        const plusIndex = key.indexOf('+');
        const source = key.slice(0, plusIndex);
        const id = key.slice(plusIndex + 1);

        // 查找对应的播放记录，获取当前集数
        const playRecord = allPlayRecords[key];
        const currentEpisode = playRecord?.index;

        return {
          id,
          source,
          title: fav.title,
          year: fav.year,
          poster: fav.cover,
          episodes: fav.total_episodes,
          source_name: fav.source_name,
          currentEpisode,
          search_title: fav?.search_title,
          origin: fav?.origin,
        } as FavoriteItem;
      });
    setFavoriteItems(sorted);
  };

  useEffect(() => {
    const loadFavorites = async () => {
      const allFavorites = await getAllFavorites();
      await updateFavoriteItems(allFavorites);
    };

    if (!isAdultMode) {
      loadFavorites();
    }

    // 监听收藏更新事件
    const unsubscribe = subscribeToDataUpdates(
      'favoritesUpdated',
      (newFavorites: Record<string, any>) => {
        if (!isAdultMode) {
          updateFavoriteItems(newFavorites);
        }
      }
    );

    return unsubscribe;
  }, [isAdultMode]);

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const handleCloseAnnouncement = (announcement: string) => {
    setShowAnnouncement(false);
    localStorage.setItem('hasSeenAnnouncement', announcement); // 记录已查看弹窗
  };

  return (
    <PageLayout>
      <div className='px-2 sm:px-10 py-4 sm:py-8 overflow-visible relative pt-14'>
        {/* Floating Capsule for Mode Switch */}
        <div className='absolute top-2 left-1/2 transform -translate-x-1/2 z-10'>
          <CapsuleSwitch
            options={[
              { label: '观影模式', value: 'standard' },
              { label: '成人模式', value: 'adult' },
            ]}
            active={isAdultMode ? 'adult' : 'standard'}
            onChange={(val) => setIsAdultMode(val === 'adult')}
            className='shadow-md'
          />
        </div>

        <div className='max-w-[95%] mx-auto mt-4'>
          {/* 首页视图 */}
          <>
            {/* 继续观看 */}
            <ContinueWatching />

            {!isAdultMode && (
              <>
                {/* 我的收藏 */}
                <section className='mb-8'>
                  <div className='mb-4 flex items-center justify-between'>
                    <h2 className='text-xl sm:text-2xl font-bold flex items-center text-gray-900 dark:text-white drop-shadow-sm'>
                      <Heart className='w-6 h-6 mr-2 text-green-500' />
                      我的收藏
                    </h2>
                    {favoriteItems.length > 0 && (
                      <button
                        className='text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        onClick={async () => {
                          await clearAllFavorites();
                          setFavoriteItems([]);
                        }}
                      >
                        清空
                      </button>
                    )}
                  </div>
                  {favoriteItems.length > 0 ? (
                    <ScrollableRow>
                      {favoriteItems.map((item) => (
                        <div
                          key={item.id + item.source}
                          className='min-w-[96px] w-24 sm:min-w-[180px] sm:w-44'
                        >
                          <VideoCard
                            query={item.search_title}
                            {...item}
                            from='favorite'
                            type={item.episodes > 1 ? 'tv' : ''}
                          />
                        </div>
                      ))}
                    </ScrollableRow>
                  ) : (
                    <div className='text-gray-500 py-4 text-sm'>
                      暂无收藏
                    </div>
                  )}
                </section>
              </>
            )}

            {/* 视频源组件 - 在两种模式下都显示 */}
            <section className='mt-8 mb-8 relative w-full'>
              <SourceManager />
            </section>
          </>
        </div>
      </div>
      {announcement && showAnnouncement && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm dark:bg-black/70 p-4 transition-opacity duration-300 ${
            showAnnouncement ? '' : 'opacity-0 pointer-events-none'
          }`}
          onTouchStart={(e) => {
            // 如果点击的是背景区域，阻止触摸事件冒泡，防止背景滚动
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
          onTouchMove={(e) => {
            // 如果触摸的是背景区域，阻止触摸移动，防止背景滚动
            if (e.target === e.currentTarget) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onTouchEnd={(e) => {
            // 如果触摸的是背景区域，阻止触摸结束事件，防止背景滚动
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
          style={{
            touchAction: 'none', // 禁用所有触摸操作
          }}
        >
          <div
            className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 transform transition-all duration-300 hover:shadow-2xl'
            onTouchMove={(e) => {
              // 允许公告内容区域正常滚动，阻止事件冒泡到外层
              e.stopPropagation();
            }}
            style={{
              touchAction: 'auto', // 允许内容区域的正常触摸操作
            }}
          >
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-2xl font-bold tracking-tight text-gray-800 dark:text-white border-b border-green-500 pb-1'>
                提示
              </h3>
              <button
                onClick={() => handleCloseAnnouncement(announcement)}
                className='text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white transition-colors'
                aria-label='关闭'
              ></button>
            </div>
            <div className='mb-6'>
              <div className='relative overflow-hidden rounded-lg mb-4 bg-green-50 dark:bg-green-900/20'>
                <div className='absolute inset-y-0 left-0 w-1.5 bg-green-500 dark:bg-green-400'></div>
                <p className='ml-4 text-gray-600 dark:text-gray-300 leading-relaxed'>
                  {announcement}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCloseAnnouncement(announcement)}
              className='w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 text-white font-medium shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-300 transform hover:-translate-y-0.5'
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
