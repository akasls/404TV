/* eslint-disable no-console*/

import { NextRequest, NextResponse } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  // 不支持 localstorage 模式
  if (storageType === 'localstorage') {
    return NextResponse.json(
      {
        error: '不支持本地存储模式修改密码',
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 获取认证信息
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 验证新密码及原密码
    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json({ error: '当前密码不得为空' }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: '新密码不得为空' }, { status: 400 });
    }

    const username = authInfo.username;

    // 验证当前密码
    if (username === process.env.USERNAME) {
      // 站长密码验证
      if (currentPassword !== process.env.PASSWORD) {
        return NextResponse.json({ error: '当前密码不正确' }, { status: 401 });
      }
    } else {
      // 普通用户密码验证
      const pass = await db.verifyUser(username, currentPassword);
      if (!pass) {
        return NextResponse.json({ error: '当前密码不正确' }, { status: 401 });
      }
    }

    // 修改密码
    await db.changePassword(username, newPassword);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json(
      {
        error: '修改密码失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
