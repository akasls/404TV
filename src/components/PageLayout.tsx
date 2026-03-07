import MobileBottomNav from './MobileBottomNav';
import TopNav from './TopNav';

interface PageLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const PageLayout = ({ children, activePath = '/' }: PageLayoutProps) => {
  return (
    <div className='w-full min-h-screen'>
      {/* 主要布局容器 */}
      <div className='flex flex-col w-full min-h-screen md:min-h-auto'>
        {/* 顶部导航 - 桌面端显示，移动端隐藏 */}
        <TopNav activePath={activePath} />

        {/* 主内容区域 */}
        <div className='relative min-w-0 flex-1 transition-all duration-300'>
          {/* 主内容 */}
          <main
            className='flex-1 md:min-h-0 mb-14 md:mb-0 mt-4 md:mt-20 mx-auto w-full max-w-[1600px] px-2 md:px-6'
            style={{
              paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))',
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <div className='md:hidden'>
        <MobileBottomNav activePath={activePath} />
      </div>
    </div>
  );
};

export default PageLayout;
