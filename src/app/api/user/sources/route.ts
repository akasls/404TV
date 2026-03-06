import { NextRequest, NextResponse } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';
import { getConfig, setCachedConfig } from '@/lib/config';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getConfig();

    // 获取所有启用的源
    const allSources = config.SourceConfig.filter((s) => !s.disabled).map(s => ({
      key: s.key,
      name: s.name,
      api: s.api,
      detail: s.detail,
    }));

    const userConfig = config.UserConfig.Users.find((u) => u.username === authInfo.username);
    let userEnabledKeys: string[] = [];

    if (userConfig) {
      if (userConfig.enabledApis && userConfig.enabledApis.length > 0) {
        // 如果用户有自己的配置，则使用用的专属配置
        userEnabledKeys = userConfig.enabledApis;
      } else if (userConfig.tags && userConfig.tags.length > 0 && config.UserConfig.Tags) {
        // 如果没有则尝试使用用户的标签组配置
        const enabledApisFromTags = new Set<string>();
        userConfig.tags.forEach(tagName => {
          const tagConfig = config.UserConfig.Tags?.find(t => t.name === tagName);
          if (tagConfig && tagConfig.enabledApis) {
            tagConfig.enabledApis.forEach(apiKey => enabledApisFromTags.add(apiKey));
          }
        });
        userEnabledKeys = Array.from(enabledApisFromTags);
      } else {
        // 否则默认拥有全部启用的源权限
        userEnabledKeys = allSources.map(s => s.key);
      }
    } else {
      userEnabledKeys = allSources.map(s => s.key);
    }

    // 过滤掉已经在 admin 端被 disabled 或删除的源 key
    const allSourceKeys = new Set(allSources.map(s => s.key));
    userEnabledKeys = userEnabledKeys.filter(k => allSourceKeys.has(k));

    return NextResponse.json({
      allSources,
      userEnabledKeys,
    });
  } catch (error) {
    console.error('获取用户视频源设置失败:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabledKeys } = await request.json();

    if (!Array.isArray(enabledKeys)) {
      return NextResponse.json({ error: '无效的数据格式' }, { status: 400 });
    }

    const config = await getConfig();
    const userIndex = config.UserConfig.Users.findIndex((u) => u.username === authInfo.username);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 更新用户的 enabledApis
    config.UserConfig.Users[userIndex].enabledApis = enabledKeys;

    // 保存并更新缓存
    await db.saveAdminConfig(config);
    setCachedConfig(config);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新用户视频源设置失败:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
