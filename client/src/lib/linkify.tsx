import type { ReactNode } from "react";

const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

const BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "vbscript:", "file:", "blob:"]);

export function isSafeHttpUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    if (parsed.username || parsed.password) return false;
    if (BLOCKED_PROTOCOLS.has(parsed.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

function trimTrailingPunctuation(url: string): { href: string; trailing: string } {
  let href = url;
  let trailing = "";
  while (/[.,!?;:)\]]$/.test(href)) {
    trailing = href.slice(-1) + trailing;
    href = href.slice(0, -1);
  }
  return { href, trailing };
}

export function linkifyText(text: string, linkClassName?: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(URL_PATTERN.source, "gi");

  while ((match = pattern.exec(text)) !== null) {
    const rawUrl = match[0];
    const start = match.index;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    const { href, trailing } = trimTrailingPunctuation(rawUrl);
    if (isSafeHttpUrl(href)) {
      parts.push(
        <a
          key={`${start}-${href}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={linkClassName ?? "underline underline-offset-2 hover:opacity-80"}
        >
          {href}
        </a>
      );
      if (trailing) parts.push(trailing);
    } else {
      parts.push(rawUrl);
    }

    lastIndex = start + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
