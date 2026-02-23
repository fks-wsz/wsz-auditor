// Re-export types from parent audit module
// Additional types for web application
export interface ServerContext {
  url: string;
  title: string;
  state: {
    auditResult: any;
    packageInfo: any;
  };
}
