"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_ID = "cf-turnstile-script";

type TurnstileTheme = "light" | "dark" | "auto";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: TurnstileTheme;
      size?: "normal" | "flexible" | "compact";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      "timeout-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __cfTurnstileLoader?: Promise<TurnstileApi>;
  }
}

function loadScript(): Promise<TurnstileApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile requires a browser"));
  }
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (window.__cfTurnstileLoader) return window.__cfTurnstileLoader;

  window.__cfTurnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const settle = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile failed to load"));
    };
    script.addEventListener("load", settle, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Turnstile script error")),
      { once: true },
    );
    if (window.turnstile) resolve(window.turnstile);
  });
  return window.__cfTurnstileLoader;
}

export interface TurnstileProps {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: TurnstileTheme;
  className?: string;
}

export function Turnstile({
  siteKey,
  onToken,
  onExpire,
  onError,
  theme = "auto",
  className,
}: TurnstileProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTokenRef.current = onToken;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onToken, onExpire, onError]);

  useEffect(() => {
    let cancelled = false;
    if (!ref.current) return;
    loadScript()
      .then((api) => {
        if (cancelled || !ref.current) return;
        widgetIdRef.current = api.render(ref.current, {
          sitekey: siteKey,
          theme,
          size: "flexible",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => {
            onTokenRef.current("");
            onExpireRef.current?.();
          },
          "error-callback": () => {
            onTokenRef.current("");
            onErrorRef.current?.();
          },
          "timeout-callback": () => {
            onTokenRef.current("");
            onExpireRef.current?.();
          },
        });
      })
      .catch(() => {
        onErrorRef.current?.();
      });
    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          // widget may already be gone
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, theme]);

  function reset() {
    const id = widgetIdRef.current;
    if (id && window.turnstile) window.turnstile.reset(id);
  }
  // expose reset via imperative ref if needed in future
  void reset;

  return <div ref={ref} className={className} />;
}
