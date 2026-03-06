declare module 'medium-zoom' {
  interface ZoomOptions {
    margin?: number;
    background?: string;
    scrollOffset?: number;
    container?: string | HTMLElement;
    template?: string | HTMLTemplateElement;
  }

  interface Zoom {
    attach(...selectors: (string | HTMLElement | NodeList | HTMLElement[])[]): Zoom;
    detach(...selectors: (string | HTMLElement | NodeList | HTMLElement[])[]): Zoom;
    update(options: ZoomOptions): Zoom;
    close(): Promise<Zoom>;
    open({ target }?: { target?: HTMLElement }): Promise<Zoom>;
    toggle({ target }?: { target?: HTMLElement }): Promise<Zoom>;
    on(type: string, listener: () => void, options?: boolean | AddEventListenerOptions): Zoom;
    off(type: string, listener: () => void, options?: boolean | EventListenerOptions): Zoom;
    getZoomedImage(): HTMLElement | null;
  }

  export default function mediumZoom(selector?: string | HTMLElement | NodeList | HTMLElement[], options?: ZoomOptions): Zoom;
}
