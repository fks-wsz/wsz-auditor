import express from 'express';
import { auditPackage } from 'wsz-auditor-core';
import { asyncHandler } from '../utils/async-handler';

const router = express.Router();

router.get(
  '/audit-stream',
  asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 关键：禁用 Nginx 缓冲
    res.flushHeaders();

    const sendEvent = (type: 'progress' | 'done', data: object) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const target = req.query.url as string;
    await auditPackage(target, {
      onInit() {
        sendEvent('progress', { step: 'init', message: '初始化审计中' });
      },
      onParseProject() {
        sendEvent('progress', { step: 'parseProject', message: '解析项目中' });
      },
      onAudit() {
        sendEvent('progress', { step: 'audit', message: '审计中' });
      },
      onFinish(auditResult) {
        sendEvent('progress', { step: 'finish', message: '审计完成' });
        sendEvent('done', { result: auditResult });
      },
    });
    // 客户端断开时清理资源并终止连接
    req.on('close', () => {
      res.end();
    });
  }),
);

export default router;
