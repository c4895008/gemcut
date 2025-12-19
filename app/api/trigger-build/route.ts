/**
 * 触发全量构建 API
 * CMS Webhook 调用此 API，自动触发 GitHub Actions 进行全量构建
 *
 * 使用方式：
 * POST /api/trigger-build
 * Body: { secret, type?, path? }
 *
 * 环境变量：
 * - REVALIDATION_SECRET: 验证密钥
 * - GITHUB_TOKEN: GitHub Personal Access Token
 * - GITHUB_REPO: 仓库名称 (格式: owner/repo)
 */

import { type NextRequest, NextResponse } from 'next/server';

interface TriggerBuildBody {
  /** 验证密钥 */
  secret: string;
  /** 内容类型（可选，仅用于日志） */
  type?: string;
  /** 内容路径（可选，仅用于日志） */
  path?: string;
}

interface TriggerBuildResponse {
  success: boolean;
  message?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<TriggerBuildResponse>> {
  try {
    const body: TriggerBuildBody = await request.json();
    const { secret, type = 'unknown', path = 'unknown' } = body;

    // 1. 验证密钥
    if (secret !== process.env.REVALIDATION_SECRET) {
      console.warn('[TriggerBuild] Invalid secret attempt');
      return NextResponse.json(
        { success: false, message: 'Invalid secret' },
        { status: 401 }
      );
    }

    // 2. 检查 GitHub 配置（从环境变量读取）
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO || 'c4895008/gemcut';

    if (!githubToken) {
      console.error('[TriggerBuild] GITHUB_TOKEN not set');
      return NextResponse.json(
        { success: false, message: 'GitHub token not configured' },
        { status: 500 }
      );
    }
    // 3. 触发 GitHub Actions（使用 workflow_dispatch 直接触发工作流）
    const workflowFile = 'deploy.yml';
    const branch = 'main';

    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/actions/workflows/${workflowFile}/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: branch,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[TriggerBuild] GitHub API error:', response.status, error);
      return NextResponse.json(
        { success: false, message: `GitHub API error: ${response.status}` },
        { status: 500 }
      );
    }

    console.log(`[TriggerBuild] Success: type=${type}, path=${path}`);

    return NextResponse.json({
      success: true,
      message: 'Build triggered successfully. It will take about 5-8 minutes.',
    });
  } catch (error) {
    console.error('[TriggerBuild] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET 请求用于健康检查
 */
export async function GET(): Promise<NextResponse> {
  const githubRepo = process.env.GITHUB_REPO || 'c4895008/gemcut';
  const hasToken = !!process.env.GITHUB_TOKEN;

  return NextResponse.json({
    status: 'ok',
    message: 'Trigger Build API is running',
    config: {
      githubRepo,
      githubToken: hasToken ? 'configured' : 'not configured',
    },
  });
}
