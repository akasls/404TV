/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

import { getConfig } from '@/lib/config';

import { GlobalErrorIndicator } from '../components/GlobalErrorIndicator';
import { SiteProvider } from '../components/SiteProvider';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });
export const dynamic = 'force-dynamic';

// 动态生成 metadata，支持配置更新后的标题变化
export async function generateMetadata(): Promise<Metadata> {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';
  const config = await getConfig();
  let siteName = process.env.NEXT_PUBLIC_SITE_NAME || '404TV';
  if (storageType !== 'localstorage') {
    siteName = config.SiteConfig.SiteName;
  }

  return {
    title: siteName,
    description: '影视聚合',
    manifest: '/manifest.json?v=2',
  };
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e6f3fb' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  let siteName = process.env.NEXT_PUBLIC_SITE_NAME || '404TV';
  let announcement =
    process.env.ANNOUNCEMENT ||
    '本网站仅提供影视信息搜索服务，所有内容均来自第三方网站。本站不存储任何视频资源，不对任何内容的准确性、合法性、完整性负责。';

  let doubanProxyType =
    process.env.NEXT_PUBLIC_DOUBAN_PROXY_TYPE || 'cmliussss-cdn-tencent';
  let doubanProxy = process.env.NEXT_PUBLIC_DOUBAN_PROXY || '';
  let doubanImageProxyType =
    process.env.NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE || 'cmliussss-cdn-tencent';
  let doubanImageProxy = process.env.NEXT_PUBLIC_DOUBAN_IMAGE_PROXY || '';
  let disableYellowFilter =
    process.env.NEXT_PUBLIC_DISABLE_YELLOW_FILTER === 'true';
  let fluidSearch = process.env.NEXT_PUBLIC_FLUID_SEARCH !== 'false';
  let customFilters = [] as {
    name: string;
    url: string;
    categories: {
      name: string;
      url: string;
    }[];
  }[];
  let channelOrder: string[] = ['movie', 'tv', 'anime', 'show'];
  if (storageType !== 'localstorage') {
    const config = await getConfig();
    siteName = config.SiteConfig.SiteName;
    announcement = config.SiteConfig.Announcement;

    doubanProxyType = config.SiteConfig.DoubanProxyType;
    doubanProxy = config.SiteConfig.DoubanProxy;
    doubanImageProxyType = config.SiteConfig.DoubanImageProxyType;
    doubanImageProxy = config.SiteConfig.DoubanImageProxy;
    disableYellowFilter = config.SiteConfig.DisableYellowFilter;
    customFilters = config.CustomFilters.map((filter) => ({
      name: filter.name,
      url: filter.url,
      categories: filter.categories || [],
    }));
    fluidSearch = config.SiteConfig.FluidSearch;
    if (
      config.SiteConfig.ChannelOrder &&
      config.SiteConfig.ChannelOrder.length > 0
    ) {
      channelOrder = config.SiteConfig.ChannelOrder;
    }

    // 将用户如果起了重名的自定义频道，自动替换掉原本的系统保留字段
    const defaultMappings: Record<string, string> = {
      movie: '电影',
      tv: '电视剧',
      minitv: '短剧',
      anime: '动漫',
      show: '综艺',
    };
    channelOrder = channelOrder.map((c) => {
      const sysLabel = defaultMappings[c];
      if (sysLabel && customFilters.some((f) => f.name === sysLabel)) {
        return sysLabel; // convert sys ID to custom filter name
      }
      return c;
    });

    // 自动将未出现在排序列表中的自定义筛选频道追加到末尾
    customFilters.forEach((cf) => {
      if (!channelOrder.includes(cf.name)) {
        channelOrder.push(cf.name);
      }
    });
  }

  // 将运行时配置注入到全局 window 对象，供客户端在运行时读取
  const runtimeConfig = {
    STORAGE_TYPE: process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage',
    DOUBAN_PROXY_TYPE: doubanProxyType,
    DOUBAN_PROXY: doubanProxy,
    DOUBAN_IMAGE_PROXY_TYPE: doubanImageProxyType,
    DOUBAN_IMAGE_PROXY: doubanImageProxy,
    DISABLE_YELLOW_FILTER: disableYellowFilter,
    CUSTOM_FILTERS: customFilters,
    FLUID_SEARCH: fluidSearch,
    CHANNEL_ORDER: channelOrder,
  };

  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, viewport-fit=cover'
        />
        <link rel='apple-touch-icon' href='/icons/icon-192x192.png?v=2' />
        {/* 将配置序列化后直接写入脚本，浏览器端可通过 window.RUNTIME_CONFIG 获取 */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};`,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-200`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <SiteProvider siteName={siteName} announcement={announcement}>
            {children}
            <GlobalErrorIndicator />
          </SiteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
