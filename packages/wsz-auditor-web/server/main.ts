import express from 'express';
import { resolve } from 'path';
import { renderPage, initRenderer } from './renderer';

const app = express();
const PORT = process.env.PORT || 3000;

// 静态资源服务
app.use(express.static(resolve(__dirname, '../public')));

// 初始化渲染器
initRenderer();

/**
 * 获取审计数据（示例）
 */
// async function getAuditData(projectPath) {
//   try {
//     // 创建工作目录
//     const workDir = await createWorkDir();
//     // 解析项目
//     const packageJsonObj = await parseProject(projectPath);
//     // 生成 lock 文件
//     await generateLock(workDir, packageJsonObj);
//     // 执行审计
//     const normalizedAuditRes = await audit(workDir, packageJsonObj);

//     return {
//       auditResult: normalizedAuditRes,
//       packageInfo: packageJsonObj,
//     };
//   } catch (error) {
//     console.error('Audit error:', error);
//     return {
//       auditResult: { vulnerabilities: {}, summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 } },
//       packageInfo: { name: 'Unknown', version: '0.0.0' },
//     };
//   }
// }

export interface RenderContext {
  url: string;
  title: string;
  state: Record<keyof any, any>;
}

// SSR 路由
app.get('/home', async (req, res) => {
  const projectPath = process.env.AUDIT_PROJECT_PATH || '../../test/local-4';
  const data = {};

  const context: RenderContext = {
    url: req.url,
    title: 'NPM 依赖安全审计分析',
    state: data,
  };

  await renderPage(req, res, context);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
