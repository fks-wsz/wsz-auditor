import { createApp } from '../shared/app';

export default (context: any) => {
  const { app } = createApp(context);
  return app;
};
