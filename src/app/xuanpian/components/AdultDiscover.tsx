'use client';

import { useEffect, useRef, useState } from 'react';

import { DoubanItem } from '@/lib/types';

import CapsuleSwitch from '@/components/CapsuleSwitch';
import DoubanCardSkeleton from '@/components/DoubanCardSkeleton';
import VideoCard from '@/components/VideoCard';

interface Source {
  key: string;
  name: string;
  api: string;
  group: 'view' | 'adult';
}

interface Category {
  type_id: number;
  type_pid?: number;
  type_name: string;
}

const ensureValidUrl = (urlStr: string) => {
  if (urlStr.startsWith('//')) return 'http:' + urlStr;
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) return 'http://' + urlStr;
  return urlStr;
};

export default function AdultDiscover() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<number>(0);
  const [selectedSecondaryId, setSelectedSecondaryId] = useState<number>(0);
  // selectedCategoryId 依然代表最终用于网络请求的 ID (通常是最深的一级)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingSources, setLoadingSources] = useState(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // 1. 获取用户启用的成人源
  useEffect(() => {
    let active = true;
    fetch('/api/user/sources')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const enabledKeys = data.userEnabledKeys || [];
        // 只筛选出启用的、且 group 为 adult 的源
        const adultSources = (data.allSources || []).filter(
          (s: Source) => s.group === 'adult' && enabledKeys.includes(s.key)
        );
        setSources(adultSources);
        if (adultSources.length > 0) {
          setSelectedSource(adultSources[0]);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoadingSources(false);
      });
    return () => { active = false; };
  }, []);

  // 2. 当选择了源时，获取分类
  useEffect(() => {
    if (!selectedSource) return;
    let active = true;
    setLoading(true);
    setVideos([]);
    setCategories([]);
    setSelectedPrimaryId(0);
    setSelectedSecondaryId(0);
    setSelectedCategoryId(null);
    setCurrentPage(1);
    setHasMore(true);

    const targetUrl = new URL(ensureValidUrl(selectedSource.api));
    targetUrl.searchParams.set('ac', 'videolist');
    targetUrl.searchParams.set('pg', '1');

    fetch(`/api/videolist?url=${encodeURIComponent(targetUrl.toString())}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.code === 200) {
          const fetchedCategories = data.categories || [];
          setCategories(fetchedCategories);
          setSelectedPrimaryId(0);
          setSelectedSecondaryId(0);
          setSelectedCategoryId(0);
          setVideos(data.list || []);
          setHasMore(data.page < data.pagecount);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });
      
    return () => { active = false; };
  }, [selectedSource]);

  // 3. 当分类改变时，重新获取数据
  useEffect(() => {
    if (!selectedSource || selectedCategoryId === null || selectedCategoryId === undefined) return;
    
    // 如果是初始加载完成自动设置了 selectedCategoryId，或者初次挂载，不要触发，上面那个 useEffect 已经拉了第一页
    // 这里只处理后续改变类型的加载
    if (currentPage === 1 && videos.length > 0) return;
    if (currentPage === 1 && loading) return; // 正在上面加载

    let active = true;
    setLoading(true);
    setVideos([]);
    setCurrentPage(1);
    setHasMore(true);

    const targetUrl = new URL(ensureValidUrl(selectedSource.api));
    targetUrl.searchParams.set('ac', 'videolist');
    targetUrl.searchParams.set('pg', '1');
    if (selectedCategoryId !== 0) {
      targetUrl.searchParams.set('t', selectedCategoryId.toString());
    }

    fetch(`/api/videolist?url=${encodeURIComponent(targetUrl.toString())}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.code === 200) {
          setVideos(data.list || []);
          setHasMore(data.page < data.pagecount);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });
      
    return () => { active = false; };
  }, [selectedCategoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. 处理加载更多
  useEffect(() => {
    if (currentPage === 1) return;
    if (!selectedSource || selectedCategoryId === null) return;

    let active = true;
    setIsLoadingMore(true);

    const targetUrl = new URL(ensureValidUrl(selectedSource.api));
    targetUrl.searchParams.set('ac', 'videolist');
    targetUrl.searchParams.set('pg', currentPage.toString());
    if (selectedCategoryId !== 0) {
      targetUrl.searchParams.set('t', selectedCategoryId.toString());
    }

    fetch(`/api/videolist?url=${encodeURIComponent(targetUrl.toString())}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.code === 200) {
          setVideos((prev) => {
            const existingIds = new Set(prev.map(v => v.vod_id?.toString() || v.id));
            const newVids = (data.list || []).filter((v: any) => !existingIds.has(v.vod_id?.toString() || v.id));
            return [...prev, ...newVids];
          });
          setHasMore(data.page < data.pagecount);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (active) setIsLoadingMore(false);
      });
      
    return () => { active = false; };
  }, [currentPage, selectedSource, selectedCategoryId]);

  // 设置滚动监听
  useEffect(() => {
    if (!hasMore || isLoadingMore || loading) return;
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        setCurrentPage((prev) => prev + 1);
      }
    }, { threshold: 0.1 });

    observer.observe(loadingRef.current);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loading]);

  const skeletonData = Array.from({ length: 24 }, (_, index) => index);

  const isFlatList = categories.length > 0 && categories.every(c => !c.type_pid || c.type_pid === 0);
  const primaryCategories = isFlatList ? [] : categories.filter((c) => !c.type_pid || c.type_pid === 0);
  const secondaryCategories = isFlatList ? categories : categories.filter((c) => c.type_pid === selectedPrimaryId);

  return (
    <div className='px-4 sm:px-10 py-4 overflow-visible mt-2 sm:mt-0'>
      <div className='mb-6 sm:mb-8 bg-white/60 dark:bg-gray-800/40 rounded-2xl p-4 sm:p-6 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-5'>
          <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>视频源</span>
          <div className='flex flex-wrap gap-2'>
            {loadingSources ? (
              <div className='flex items-center gap-2 px-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-green-500'></div>
                <span className='text-sm text-gray-500'>加载中...</span>
              </div>
            ) : sources.length === 0 ? (
              <span className='text-sm text-gray-500'>暂无启用的成人视频源</span>
            ) : (
              sources.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSelectedSource(s)}
                  className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors font-medium border ${
                    selectedSource?.key === s.key
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800/50'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {s.name}
                </button>
              ))
            )}
          </div>
        </div>

        {primaryCategories.length > 0 && (
          <div className='flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-5 border-t border-gray-100 dark:border-gray-700/50 pt-4'>
            <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
              频道
            </span>
            <div className='overflow-x-auto pb-1 sm:pb-0 whitespace-nowrap scrollbar-hide flex-1'>
              <CapsuleSwitch
                options={[
                  { label: '全部', value: '0' },
                  ...primaryCategories.map(c => ({ label: c.type_name, value: String(c.type_id) }))
                ]}
                active={String(selectedPrimaryId)}
                onChange={(val) => {
                  const id = Number(val);
                  setSelectedPrimaryId(id);
                  setSelectedSecondaryId(id);
                  if (selectedCategoryId !== id) {
                    setVideos([]);
                    setSelectedCategoryId(id);
                  }
                }}
              />
            </div>
          </div>
        )}

        {secondaryCategories.length > 0 && (
          <div className={`pt-4 ${primaryCategories.length > 0 ? '' : 'border-t border-gray-100 dark:border-gray-700/50'}`}>
             <div className='flex items-center gap-2'>
               <span className='text-xs sm:text-sm font-medium text-gray-400 min-w-[48px]'>分类</span>
               <div className='flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide'>
                 <div className='inline-flex gap-1 sm:gap-2'>
                   <button
                     onClick={() => {
                       setSelectedSecondaryId(selectedPrimaryId);
                       if (selectedCategoryId !== selectedPrimaryId) {
                         setVideos([]);
                         setSelectedCategoryId(selectedPrimaryId);
                       }
                     }}
                     className={`px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full transition-colors font-medium whitespace-nowrap ${
                       selectedSecondaryId === selectedPrimaryId
                         ? 'bg-green-100/60 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold'
                         : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                     }`}
                   >
                     全部
                   </button>
                   {secondaryCategories.map((cat) => (
                     <button
                       key={cat.type_id}
                       onClick={() => {
                         setSelectedSecondaryId(cat.type_id);
                         if (selectedCategoryId !== cat.type_id) {
                           setVideos([]);
                           setSelectedCategoryId(cat.type_id);
                         }
                       }}
                       className={`px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full transition-colors font-medium whitespace-nowrap ${
                         selectedSecondaryId === cat.type_id
                           ? 'bg-green-100/60 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold'
                           : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                       }`}
                     >
                       {cat.type_name}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className='w-full mt-4 overflow-visible'>
        <div className='justify-start grid grid-cols-3 gap-x-2 gap-y-12 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-x-8 sm:gap-y-20'>
          {loading
            ? skeletonData.map((index) => <DoubanCardSkeleton key={index} />)
            : videos.map((item, index) => (
                <div key={`${item.id}-${index}`} className='w-full'>
                  <VideoCard
                    from='search'
                    source={selectedSource?.key || 'unknown'}
                    title={item.vod_name || item.title}
                    poster={item.vod_pic || item.poster}
                    id={item.vod_id?.toString() || item.id}
                    rate={item.vod_remarks || item.rate}
                    year={item.vod_year || item.year}
                  />
                </div>
              ))}
        </div>

        {hasMore && !loading && videos.length > 0 && (
          <div
            ref={(el) => {
              if (el) loadingRef.current = el;
            }}
            className='flex justify-center mt-12 py-8'
          >
            {isLoadingMore && (
              <div className='flex items-center gap-2'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-green-500'></div>
                <span className='text-gray-600'>加载中...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && videos.length > 0 && (
          <div className='text-center text-gray-500 py-8'>已加载全部内容</div>
        )}

        {!loading && videos.length === 0 && selectedSource && (
          <div className='text-center flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400'>
            <div className='mb-4 text-gray-300 dark:text-gray-600'>
              <svg className='w-16 h-16 mx-auto' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
              </svg>
            </div>
            <p className='text-lg mb-2'>空空如也</p>
            <p className='text-sm opacity-70'>没有找到相关视频内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
