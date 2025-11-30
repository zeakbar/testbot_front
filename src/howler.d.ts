declare module 'howler' {
  export interface HowlOptions {
    src?: string | string[];
    volume?: number;
    html5?: boolean;
    loop?: boolean;
    preload?: boolean | string;
    autoplay?: boolean;
    mute?: boolean;
    sprite?: Record<string, number[]>;
    rate?: number;
    pool?: number;
    format?: string | string[];
    xhrWithCredentials?: boolean;
    onload?: () => void;
    onloaderror?: (id: number, error: unknown) => void;
    onplay?: () => void;
    onend?: () => void;
    onpause?: () => void;
    onstop?: () => void;
    onmute?: () => void;
    onunmute?: () => void;
    onvolume?: () => void;
    onrate?: () => void;
    onseek?: () => void;
    onfade?: () => void;
  }

  export class Howl {
    constructor(options: HowlOptions);
    play(spriteOrId?: string | number): number;
    pause(id?: number): Howl;
    stop(id?: number): Howl;
    mute(muted?: boolean, id?: number): Howl;
    volume(vol?: number, id?: number): Howl | number;
    rate(rate?: number, id?: number): Howl | number;
    seek(seek?: number, id?: number): Howl | number;
    loop(loop?: boolean, id?: number): Howl | boolean;
    fade(from: number, to: number, duration: number, id?: number): Howl;
  }

  export class Howler {
    mute(muted?: boolean): Howler;
    volume(vol?: number): Howler | number;
    stop(): Howler;
  }
}
