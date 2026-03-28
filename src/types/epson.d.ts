declare namespace epson {
  class ePOSDevice {
    connect(
      address: string,
      port: number,
      callback: (resultConnect: string) => void,
    ): void;
    createDevice(
      deviceId: string,
      deviceType: number,
      options: Record<string, unknown>,
      callback: (deviceObj: ePOSPrint, retcode: string) => void,
    ): void;
    disconnect(): void;

    DEVICE_TYPE_PRINTER: number;
  }

  class ePOSPrint {
    addTextAlign(align: number): void;
    addTextStyle(reverse: boolean, ul: boolean, em: boolean, color: number): void;
    addTextSize(width: number, height: number): void;
    addText(data: string): void;
    addFeedLine(lines: number): void;
    addCut(type: number): void;
    addSymbol(
      data: string,
      type: number,
      level: number,
      width: number,
      height: number,
      size: number,
    ): void;
    send(): void;

    onreceive: ((res: { success: boolean; code: string; status: number }) => void) | null;
    onerror: ((err: { status: number; responseText: string }) => void) | null;

    ALIGN_CENTER: number;
    ALIGN_LEFT: number;
    ALIGN_RIGHT: number;
    CUT_FEED: number;
    COLOR_1: number;
    TRUE: boolean;
    FALSE: boolean;
    SYMBOL_QRCODE_MODEL_2: number;
    LEVEL_DEFAULT: number;
  }
}
