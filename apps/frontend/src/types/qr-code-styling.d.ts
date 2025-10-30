declare module "qr-code-styling" {
  // Minimal declaration to satisfy TypeScript for the external library.
  // The library exposes a class that is constructed with an options object and
  // has `update`, `append`, `getRawData`, and `getElement` methods among others.
  interface QRCodeStylingOptions {
    width?: number | string;
    height?: number | string;
    data?: string;
    image?: string | null;
    dotsOptions?: Record<string, any>;
    cornersSquareOptions?: Record<string, any>;
    cornersDotOptions?: Record<string, any>;
    backgroundOptions?: Record<string, any>;
    imageOptions?: Record<string, any>;
    qrOptions?: Record<string, any>;
    margin?: number;
    type?: string;
    // allow other keys
    [key: string]: any;
  }

  class QRCodeStyling {
    constructor(options?: QRCodeStylingOptions);
    update(options: Partial<QRCodeStylingOptions>): void;
    append(parent: HTMLElement | string): void;
    getRawData(type?: string): Promise<Blob>;
    getElement(): HTMLElement;
    // allow any other method access
    [key: string]: any;
  }

  export default QRCodeStyling;
}
