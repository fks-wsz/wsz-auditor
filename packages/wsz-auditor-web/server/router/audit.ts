import express from 'express';
import { auditPackage } from 'wsz-auditor-core';
import { asyncHandler } from '../utils/async-handler';
import { BaseError } from 'wsz-auditor-shared';

const router = express.Router();

router.get(
  '/audit-stream',
  asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Critical: disable Nginx buffering
    res.flushHeaders();

    const sendEvent = (type: 'progress' | 'done' | 'error', data: object) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const target = req.query.url as string;
    console.log(process.cwd());
    try {
      await auditPackage(target, {
        onInit() {
          sendEvent('progress', { step: 'init', message: 'Initial audit...' });
        },
        onParseProject() {
          sendEvent('progress', { step: 'parseProject', message: 'Analyze the project...' });
        },
        onAudit() {
          sendEvent('progress', { step: 'audit', message: 'During the audit...' });
        },
        onFinish(auditResult) {
          sendEvent('progress', { step: 'finish', message: 'Audit completed' });
          sendEvent('done', { result: auditResult });
        },
      });
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof BaseError) {
        message = err.getFormattedMessage();
      } else if (err instanceof Error) {
        message = err.message;
      }
      sendEvent('error', { message });
      res.end();
    }
    // Clean up resources and terminate connection when client disconnects
    req.on('close', () => {
      res.end();
    });
  }),
);

export default router;
