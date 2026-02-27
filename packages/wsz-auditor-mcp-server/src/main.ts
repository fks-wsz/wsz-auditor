import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { auditPackage } from 'wsz-auditor-core';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create server instance
const server = new McpServer({
  name: 'project-auditor',
  version: '1.0.0',
});

server.registerTool(
  'audit-package',
  {
    title: '项目安全审查工具',
    description:
      '审查本地或远程的前端或nodejs项目中的依赖安全问题，包含直接依赖和间接依赖，返回格式化后的审查报告结果，并生成可直接使用的markdown格式审查报告文件',
    inputSchema: z.object({
      targetPath: z.string().describe('要审查项目的路径，可以是相对路径或绝对路径或github仓库地址'),
      options: z
        .object({
          renderReport: z
            .object({
              path: z.string().describe('审查报告的输出路径'),
            })
            .nullable()
            .describe('审查报告的渲染选项，如果为null则不生成审查报告'),
          showLoading: z.boolean().describe('是否在审查过程中显示加载状态, 用户通过cli调用推荐开启'),
        })
        .optional()
        .describe('审查选项'),
    }),
  },
  async ({ targetPath, options }) => {
    // @ts-ignore
    const normalizedAuditResult = await auditPackage(targetPath, options);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(normalizedAuditResult, null, 2),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
server.connect(transport);
