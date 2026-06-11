"use client";

import { AlertCircle, Music, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSpotifyMetadata } from "@/app/_actions/spotify";

type SpotifyPlayerProps = {
  uri: string;
  autoplay?: boolean;
};

let apiPromise: Promise<any> | null = null;

function loadSpotifyIframeApi(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject("Window is undefined");
  }
  if ((window as any).SpotifyIframeApi) {
    return Promise.resolve((window as any).SpotifyIframeApi);
  }
  if (apiPromise) {
    return apiPromise;
  }
  apiPromise = new Promise((resolve) => {
    const prevReady = (window as any).onSpotifyIframeApiReady;
    (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
      (window as any).SpotifyIframeApi = IFrameAPI;
      if (prevReady) {
        prevReady(IFrameAPI);
      }
      resolve(IFrameAPI);
    };

    const existingScript = document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]');
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
  });
  return apiPromise;
}

export function SpotifyPlayer({ uri, autoplay = true }: SpotifyPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    title: string;
    artist: string;
    thumbnailUrl: string;
    spotifyUrl?: string;
  } | null>(null);

  // Fetch Spotify metadata via Server Action
  useEffect(() => {
    if (!uri) {
      return;
    }
    let active = true;

    getSpotifyMetadata(uri)
      .then((data) => {
        if (!active) {
          return;
        }
        if (data) {
          setMetadata({
            title: data.title,
            artist: data.artist,
            thumbnailUrl: data.thumbnailUrl,
            spotifyUrl: data.spotifyUrl
          });
        } else {
          fetchOembed();
        }
      })
      .catch((err) => {
        console.error("Server action getSpotifyMetadata failed, falling back:", err);
        if (active) {
          fetchOembed();
        }
      });

    function fetchOembed() {
      let cleanUrl = uri;
      if (uri.startsWith("spotify:")) {
        const parts = uri.split(":");
        if (parts.length >= 3) {
          cleanUrl = `https://open.spotify.com/${parts[1]}/${parts[2]}`;
        }
      }

      fetch(`https://open.spotify.com/oembed?url=${cleanUrl}`)
        .then((res) => res.json())
        .then((data) => {
          if (!active) {
            return;
          }
          const titleStr = data.title || "Spotify Music";
          let title = titleStr;
          let artist = "Artist";

          if (titleStr.includes(" - song by ")) {
            const parts = titleStr.split(" - song by ");
            title = parts[0];
            artist = parts[1];
          } else if (titleStr.includes(" by ")) {
            const parts = titleStr.split(" by ");
            title = parts[0];
            artist = parts[1];
          } else if (titleStr.includes(" | ")) {
            const parts = titleStr.split(" | ");
            title = parts[0];
            artist = parts[1];
          }

          setMetadata({
            title: title.trim(),
            artist: artist.trim(),
            thumbnailUrl: data.thumbnail_url || "",
            spotifyUrl: cleanUrl
          });
        })
        .catch((err) => {
          console.error("Error fetching oembed metadata:", err);
          if (active) {
            setMetadata({
              title: "Spotify Music",
              artist: "Đang phát",
              thumbnailUrl: "",
              spotifyUrl: cleanUrl
            });
          }
        });
    }

    return () => {
      active = false;
    };
  }, [uri]);

  // Load IFrame API and create controller
  useEffect(() => {
    if (!uri) {
      return;
    }

    let active = true;
    let cleanupListeners: (() => void) | null = null;

    loadSpotifyIframeApi()
      .then((IFrameAPI) => {
        if (!(active && containerRef.current)) {
          return;
        }

        containerRef.current.innerHTML = "";
        const embedEl = document.createElement("div");
        containerRef.current.appendChild(embedEl);

        IFrameAPI.createController(
          embedEl,
          {
            uri,
            width: 100,
            height: 100
          },
          (controller: any) => {
            if (!active) {
              return;
            }
            controllerRef.current = controller;
            setIsReady(true);

            controller.addListener("playback_update", (e: any) => {
              if (active) {
                setIsPlaying(!e.data.isPaused);
              }
            });

            if (autoplay) {
              let played = false;
              const startPlayback = () => {
                if (played) {
                  return;
                }
                played = true;
                try {
                  controller.play();
                  setIsPlaying(true);
                } catch (err) {
                  console.error("Spotify autoplay error:", err);
                }
                removeListeners();
              };

              const removeListeners = () => {
                document.removeEventListener("click", startPlayback);
                document.removeEventListener("touchstart", startPlayback);
                document.removeEventListener("keydown", startPlayback);
              };

              document.addEventListener("click", startPlayback);
              document.addEventListener("touchstart", startPlayback);
              document.addEventListener("keydown", startPlayback);

              cleanupListeners = removeListeners;
            }
          }
        );
      })
      .catch((err) => {
        console.error("Failed to load Spotify IFrame API:", err);
        setError("Không thể tải nhạc");
      });

    return () => {
      active = false;
      if (cleanupListeners) {
        cleanupListeners();
      }
      if (controllerRef.current) {
        controllerRef.current = null;
      }
    };
  }, [uri, autoplay]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!controllerRef.current) {
      return;
    }
    if (isPlaying) {
      controllerRef.current.pause();
      setIsPlaying(false);
    } else {
      controllerRef.current.play();
      setIsPlaying(true);
    }
  };

  if (error) {
    return (
      <div className='flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-destructive text-xs backdrop-blur-md'>
        <AlertCircle className='h-4 w-4 shrink-0' />
        <span>{error}</span>
      </div>
    );
  }

  const songTitle = metadata?.title || "Spotify Music";
  const artistName = metadata?.artist || "Đang phát";
  const coverUrl = metadata?.thumbnailUrl;

  return (
    <div className='relative z-50 flex items-center'>
      <style>{`
        @keyframes equalizer-bar-1 {
          0% { height: 4px; }
          100% { height: 14px; }
        }
        @keyframes equalizer-bar-2 {
          0% { height: 6px; }
          100% { height: 16px; }
        }
        @keyframes equalizer-bar-3 {
          0% { height: 3px; }
          100% { height: 12px; }
        }
      `}</style>

      <div className='pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0' ref={containerRef} />

      {/* Premium Vinyl Player Widget Container */}
      <div
        className='group flex items-center gap-2.5 rounded-full border border-white/10 bg-black/60 p-1.5 pr-2.5 shadow-2xl backdrop-blur-md transition-all duration-500 ease-out hover:bg-black/80 hover:pr-4 dark:bg-black/75'
        title={`${songTitle} - ${artistName}`}
      >
        {/* Vinyl Disc Container */}
        <div
          className='group/vinyl relative flex h-11 w-11 cursor-pointer select-none items-center justify-center rounded-full shadow-lg'
          onClick={togglePlay}
        >
          <div
            className='absolute inset-0 rounded-full border border-neutral-800 bg-neutral-900 transition-transform duration-500'
            style={{
              backgroundImage:
                "radial-gradient(circle, #262626 2px, transparent 3px), radial-gradient(circle, #171717 10%, #0a0a0a 30%, #171717 60%, #030303 90%)",
              animation: isPlaying ? "spin 5s linear infinite" : "none"
            }}
          >
            {/* Grooves visual effect */}
            <div className='absolute inset-1 rounded-full border border-neutral-800/20' />
            <div className='absolute inset-2 rounded-full border border-neutral-700/10' />
            <div className='absolute inset-3 rounded-full border border-neutral-800/20' />

            {/* Album Cover Center Label */}
            <div className='absolute inset-[10px] flex items-center justify-center overflow-hidden rounded-full border border-black/40 bg-neutral-800'>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt='Album Art' className='h-full w-full object-cover' src={coverUrl} />
              ) : (
                <Music className='h-3.5 w-3.5 text-neutral-400' />
              )}
            </div>

            {/* Spindle Spindle Hole */}
            <div className='absolute inset-[19px] flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 shadow-inner'>
              <div className='h-1.5 w-1.5 rounded-full bg-neutral-600' />
            </div>
          </div>

          {/* Interactive Play/Pause Overlay */}
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-300 group-hover/vinyl:opacity-100'>
            {isPlaying ? (
              <Pause className='h-4.5 w-4.5 animate-pulse fill-white text-white' />
            ) : (
              <Play className='ml-0.5 h-4.5 w-4.5 fill-white text-white' />
            )}
          </div>
        </div>

        {/* Sliding Metadata Text Panel */}
        <div className='flex select-none items-center gap-2 overflow-hidden'>
          {/* Metadata Block */}
          <div className='flex w-20 flex-col overflow-hidden transition-all duration-500 ease-out group-hover:w-36'>
            {metadata?.spotifyUrl ? (
              <a
                className='cursor-pointer truncate font-bold text-white text-xs leading-tight transition-colors hover:text-primary'
                href={metadata.spotifyUrl}
                rel='noopener noreferrer'
                target='_blank'
              >
                {songTitle}
              </a>
            ) : (
              <span className='truncate font-bold text-white text-xs leading-tight'>{songTitle}</span>
            )}
            <span className='mt-0.5 truncate text-[10px] text-neutral-400 leading-none'>{artistName}</span>
          </div>

          {/* Small Equalizer Visualizer */}
          <div className='flex h-4 w-4 shrink-0 items-end justify-center gap-[2px]'>
            <span
              className='w-[2.5px] rounded-xs bg-primary transition-all duration-300'
              style={{
                animation: isPlaying ? "equalizer-bar-1 0.8s ease-in-out infinite alternate" : "none",
                height: isPlaying ? "auto" : "3px"
              }}
            />
            <span
              className='w-[2.5px] rounded-xs bg-primary transition-all duration-300'
              style={{
                animation: isPlaying ? "equalizer-bar-2 0.6s ease-in-out infinite alternate 0.15s" : "none",
                height: isPlaying ? "auto" : "5px"
              }}
            />
            <span
              className='w-[2.5px] rounded-xs bg-primary transition-all duration-300'
              style={{
                animation: isPlaying ? "equalizer-bar-3 0.7s ease-in-out infinite alternate 0.3s" : "none",
                height: isPlaying ? "auto" : "2px"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
