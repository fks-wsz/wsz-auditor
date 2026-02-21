class Loading {
  private static readonly frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private static nextFrameIndex = 0;
  private static message: string = '加载中';
  private static isRendering: boolean = false;
  private static interval: NodeJS.Timeout | null = null;

  static start(initialMessage?: string) {
    if (this.isRendering) return;
    this.isRendering = true;
    this.message = initialMessage || this.message;
    this.renderLoop();
  }

  static updateMessage(nextMessage: string) {
    this.message = nextMessage;
  }

  private static renderLoop() {
    this.interval = setInterval(() => {
      if (this.isRendering) {
        this.renderFrame();
      }
    }, 100);
  }

  static stop() {
    if (!this.isRendering) return;
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    this.isRendering = false;
    this.nextFrameIndex = 0;
    this.message = '加载中';
    process.stdout.write('\r\x1b[K'); // 清除当前行
  }

  private static renderFrame(message?: string) {
    this.message = message || this.message;
    this.nextFrameIndex = this.nextFrameIndex % this.frames.length;
    process.stdout.write(`\r${this.frames[this.nextFrameIndex++]} ${this.message}...`);
  }
}

export default Loading;
