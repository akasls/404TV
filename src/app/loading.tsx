import React from 'react';

import PageLayout from '@/components/PageLayout';

export default function Loading() {
  return (
    <PageLayout activePath='/'>
      <div className="flex-1 flex flex-col items-center justify-center bg-transparent mt-[20vh]">
        {/* 动画影院图标 */}
        <div className="relative mb-8">
          <div className="relative mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <div className="text-white text-4xl">🎬</div>
            {/* 旋转光环 */}
            <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl opacity-20 animate-spin"></div>
          </div>

          {/* 浮动粒子效果 */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            <div
              className="absolute top-4 right-4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div
              className="absolute bottom-3 left-6 w-1 h-1 bg-lime-400 rounded-full animate-bounce"
              style={{ animationDelay: '1s' }}
            ></div>
          </div>
        </div>

        {/* 加载提示文字 */}
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
            404TV
          </h1>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium animate-pulse">加载中...</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
