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

    // 1. 获取全局所有启用的源
    const globalSources = config.SourceConfig.filter((s) => !s.disabled).map(
      (s) => ({
        key: s.key,
        name: s.name,
        api: s.api,
        detail: s.detail,
      })
    );

    const userConfig = config.UserConfig.Users.find(
      (u) => u.username === authInfo.username
    );

    // 2. 计算管理员赋予该用户的"许可范围" (permitted keys)
    let permittedKeys: string[] = [];
    if (
      userConfig &&
      userConfig.tags &&
      userConfig.tags.length > 0 &&
      config.UserConfig.Tags
    ) {
      const tagApis = new Set<string>();
      userConfig.tags.forEach((tagName) => {
        const tagConfig = config.UserConfig.Tags?.find(
          (t) => t.name === tagName
        );
        if (tagConfig && tagConfig.enabledApis) {
          tagConfig.enabledApis.forEach((k) => tagApis.add(k));
        }
      });
      permittedKeys = Array.from(tagApis);
    } else {
      // 如果没有任何 tags 限制，默认全量开放
      permittedKeys = globalSources.map((s) => s.key);
    }

    // 3. 用户实际能看到的 sources 面板只能是 permitted 的子集
    const allSources = globalSources.filter((s) =>
      permittedKeys.includes(s.key)
    );

    // 4. 用户自己手工开关的状态（必须被 permitted 约束）
    let userEnabledKeys: string[] = [];
    if (
      userConfig &&
      userConfig.enabledApis &&
      userConfig.enabledApis.length > 0
    ) {
      userEnabledKeys = userConfig.enabledApis.filter((k) =>
        permittedKeys.includes(k)
      );
    } else {
      userEnabledKeys = permittedKeys; // 如果没改设过，默认也是全部许可的源
    }

    return NextResponse.json({
      allSources, // 传给前端列表：仅为该用户允许接触的源
      userEnabledKeys, // 用户开启的源
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('获取用户视频源设置失败:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
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
    const userIndex = config.UserConfig.Users.findIndex(
      (u) => u.username === authInfo.username
    );

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
    // eslint-disable-next-line no-console
    console.error('更新用户视频源设置失败:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
