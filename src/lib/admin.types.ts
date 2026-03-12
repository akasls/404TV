export interface AdminConfig {
  ConfigSubscribtion: {
    URL: string;
    AutoUpdate: boolean;
    LastCheck: string;
  };
  ConfigFile: string;
  SiteConfig: {
    SiteName: string;
    Announcement: string;
    SearchDownstreamMaxPage: number;
    SiteInterfaceCacheTime: number;
    DoubanProxyType: string;
    DoubanProxy: string;
    DoubanImageProxyType: string;
    DoubanImageProxy: string;
    DisableYellowFilter: boolean;
    FluidSearch: boolean;
    ChannelOrder?: string[];
    GuestAccess?: boolean;
  };
  UserConfig: {
    Users: {
      username: string;
      role: 'user' | 'admin' | 'owner';
      banned?: boolean;
      enabledApis?: string[]; // 优先级高于 isAdult限制
      userDisabledApis?: string[]; // 用户自行禁用的列表
      isAdultEnabled?: boolean; // 是否启用了成人模式
    }[];
  };
  SourceConfig: {
    key: string;
    name: string;
    api: string;
    detail?: string;
    from: 'config' | 'custom';
    disabled?: boolean;
    group?: 'view' | 'adult'; // 源分组
  }[];
  CustomFilters: {
    name: string;
    url: string;
    categories: {
      name: string;
      url: string;
    }[];
  }[];
}

export interface AdminConfigResult {
  Role: 'owner' | 'admin';
  Config: AdminConfig;
}
