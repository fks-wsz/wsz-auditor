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
    title: 'Project Security Auditor',
    description:
      'Audit dependency security issues in local or remote frontend or nodejs projects, including direct and indirect dependencies, return formatted audit report results, and generate markdown format audit report files for direct use',
    inputSchema: z.object({
      targetPath: z.string().describe('Path of the project to be audited, can be relative path, absolute path or github repository URL'),
      options: z
        .object({
          renderReport: z
            .object({
              path: z.string().describe('Absolute output path for the audit report'),
            })
            .nullable()
            .describe('Render options for the audit report, if null the report will not be generated'),
        })
        .optional()
        .describe('Audit options'),
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
