import { useEffect, useRef, useState } from 'react';
import { turnstileSiteKey } from '../lib/intake';

type Turnstile = { render: (element: HTMLElement, options: { sitekey: string }) => string; remove: (id: string) => void; reset: () => void };
let scriptReady: Promise<Turnstile> | undefined;
function load(): Promise<Turnstile> {
  scriptReady ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve((window as unknown as { turnstile: Turnstile }).turnstile);
    script.onerror = () => { scriptReady = undefined; reject(new Error('verification_unavailable')); };
    document.head.appendChild(script);
  });
  return scriptReady;
}

export default function SecurityCheck() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!turnstileSiteKey) return;
    let active = true;
    let widget: string | undefined;
    let api: Turnstile | undefined;
    load().then((loaded) => {
      api = loaded;
      if (active && container.current) widget = api.render(container.current, { sitekey: turnstileSiteKey });
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (widget !== undefined) api?.remove(widget); };
  }, []);
  return turnstileSiteKey ? <><div ref={container} />{failed && <p role="alert">The security check could not load. Refresh the page or call (208) 608-4439.</p>}</> : null;
}
