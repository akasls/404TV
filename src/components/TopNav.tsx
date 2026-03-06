/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Filter, Heart, Home, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

// Logo
const Logo = () => {
  const { siteName } = useSite();
  return (
    <Link
      href='/'
      className='flex items-center justify-center select-none hover:opacity-80 transition-opacity duration-200'
    >
      <span className='text-2xl font-bold text-green-600 tracking-tight'>
        {siteName}
      </span>
    </Link>
  );
};

interface TopNavProps {
  activePath?: string;
}

const TopNav = ({ activePath = '/' }: TopNavProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [active, setActive] = useState(activePath);

  useEffect(() => {
    // 优先使用传入的 activePath
    if (activePath) {
      setActive(activePath);
    } else {
      // 否则使用当前路径
      const getCurrentFullPath = () => {
        const queryString = searchParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      };
      const fullPath = getCurrentFullPath();
      setActive(fullPath);
    }
  }, [activePath, pathname, searchParams]);

  const handleSearchClick = () => {
    router.push('/search');
  };

  const navItems = [
    { icon: Home, label: '首页', href: '/' },
    { icon: Heart, label: '收藏', href: '/favorites' },
    { icon: Search, label: '搜索', href: '/search', onClick: handleSearchClick },
    { icon: Filter, label: '筛选', href: '/douban' },
  ];

  return (
    <header className='hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-[100] shadow-sm items-center px-6 justify-between transition-colors duration-300 dark:bg-gray-900/80 dark:border-gray-700/50'>
      {/* 左侧 Logo 和 导航链接 */}
      <div className='flex items-center gap-8 h-full'>
        <Logo />
        <nav className='flex h-full items-center gap-2'>
          {navItems.map((item) => {
            // 检查当前路径是否匹配
            let isActive = false;

            // 首页要精确匹配
            if (item.href === '/') {
              isActive = active === '/';
            }
            // 筛选页面 /douban
            else if (item.href === '/douban') {
              isActive = active.startsWith('/douban');
            }
            // 搜索、收藏页面
            else {
              isActive = active.startsWith(item.href);
            }

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                    setActive(item.href);
                  } else {
                    setActive(item.href);
                  }
                }}
                className={`group flex items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 h-10 ${isActive
                    ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                    : 'text-gray-700 hover:bg-gray-100/50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-green-400'
                  } gap-2`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-400'
                    }`}
                />
                <span className='whitespace-nowrap'>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 右侧 功能按钮 (原先在 PageLayout top-right 绝对定位的那部分) */}
      <div className='flex items-center gap-4'>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
};

export default TopNav;
