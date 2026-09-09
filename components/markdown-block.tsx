"use client";

import { marked } from "marked";
import mediumZoom from "medium-zoom";
import { useEffect, useMemo, useRef } from "react";
import { getProjectDetail } from "@/app/_actions/main";
import { sanitizeHtml } from "@/utils/sanitize-html";

const PROJECT_LINK_REGEX = /(?:^|\/)(?:[a-z]{2}\/)?projects\/([a-zA-Z0-9_-]+)(?:\?|#|$)/;

function highlightCode(code: string, lang = ""): string {
  const cleanLang = (lang || "").toLowerCase();

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const escapedCode = escapeHtml(code);

  if (cleanLang === "json") {
    return escapedCode
      .replace(/(&quot;[^&]+&quot;)(?=\s*:)/g, '<span class="text-sky-400">$1</span>')
      .replace(/(:\s*)(&quot;[^&]*&quot;)/g, '$1<span class="text-emerald-400">$2</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="text-amber-500 font-bold">$1</span>')
      .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="text-amber-400">$1</span>');
  }

  if (["javascript", "typescript", "js", "ts", "jsx", "tsx"].includes(cleanLang)) {
    const keywords =
      /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|let|package|private|protected|public|static|any|string|number|boolean|unknown|never|void|type|interface|as|from|async|await|of)\b/g;
    let html = escapedCode;
    const placeholders: string[] = [];

    html = html.replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, (match) => {
      placeholders.push(`<span class="text-zinc-500 italic">${match}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    html = html.replace(/(&quot;[\s\S]*?&quot;|&#039;[\s\S]*?&#039;|`[\s\S]*?`)/g, (match) => {
      placeholders.push(`<span class="text-emerald-400">${match}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // Numbers
    html = html.replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="text-amber-400">$1</span>');

    // Keywords
    html = html.replace(keywords, '<span class="text-sky-400 font-medium">$1</span>');

    // Function calls
    html = html.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, '<span class="text-blue-400">$1</span>');

    // Restore
    for (let i = placeholders.length - 1; i >= 0; i--) {
      html = html.replace(`___PLACEHOLDER_${i}___`, placeholders[i]);
    }
    return html;
  }

  if (["html", "xml", "svg"].includes(cleanLang)) {
    let html = escapedCode;
    const placeholders: string[] = [];

    // Comments
    html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (match) => {
      placeholders.push(`<span class="text-zinc-500 italic">${match}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // Tags
    html = html.replace(/(&lt;\/?[a-zA-Z0-9:-]+)(\s+[^&>]*?)?(\/?&gt;)/g, (_match, openTag, attrs, closeTag) => {
      let formattedAttrs = attrs || "";
      if (attrs) {
        formattedAttrs = attrs.replace(
          /([a-zA-Z0-9:-]+)\s*=\s*(&quot;.*?&quot;|&#039;.*?&#039;)/g,
          '<span class="text-amber-400">$1</span>=<span class="text-emerald-400">$2</span>'
        );
      }
      return `<span class="text-sky-400">${openTag}</span>${formattedAttrs}<span class="text-sky-400">${closeTag}</span>`;
    });

    for (let i = placeholders.length - 1; i >= 0; i--) {
      html = html.replace(`___PLACEHOLDER_${i}___`, placeholders[i]);
    }
    return html;
  }

  if (["css", "scss"].includes(cleanLang)) {
    let html = escapedCode;
    const placeholders: string[] = [];

    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
      placeholders.push(`<span class="text-zinc-500 italic">${match}</span>`);
      return `___PLACEHOLDER_${placeholders.length - 1}___`;
    });

    html = html.replace(
      /([a-zA-Z-]+)\s*:\s*([^;]+);/g,
      '<span class="text-sky-400">$1</span>: <span class="text-emerald-400">$2</span>;'
    );

    html = html.replace(/([^{}\n]+)(?=\s*\{)/g, '<span class="text-amber-400 font-bold">$1</span>');

    for (let i = placeholders.length - 1; i >= 0; i--) {
      html = html.replace(`___PLACEHOLDER_${i}___`, placeholders[i]);
    }
    return html;
  }

  return escapedCode;
}

// Configure custom marked renderer
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const highlighted = highlightCode(text, lang || "");
  const langLabel = (lang || "code").toUpperCase();

  const lines = highlighted.split("\n");
  if (lines.length > 1 && lines.at(-1) === "") {
    lines.pop();
  }
  const isCollapsible = lines.length > 50;

  const lineHtml = lines
    .map((line, index) => {
      return (
        `<div class="flex items-stretch min-w-fit line-row hover:bg-zinc-900/40">` +
        `<span class="line-number sticky left-0 flex items-center justify-end select-none text-right text-zinc-500 font-mono text-xs w-9 pr-3 mr-3 bg-zinc-950 border-r border-zinc-800/80">${index + 1}</span>` +
        `<span class="line-content whitespace-pre font-mono text-[13px] py-0.5 pr-4 text-zinc-100 flex-1">${line || " "}</span>` +
        "</div>"
      );
    })
    .join("");

  return `<div class="relative group my-6 overflow-hidden rounded-xl border border-border bg-zinc-950 font-mono text-sm leading-relaxed shadow-lg code-block-container ${isCollapsible ? "collapsed" : ""}">
    <div class="flex items-center justify-between border-b border-border bg-zinc-900/80 px-4 py-1.5 text-xs text-muted-foreground select-none">
      <span>${langLabel}</span>
      <button class="copy-code-btn font-medium transition-colors hover:text-foreground cursor-pointer" data-code="${encodeURIComponent(text)}">Copy</button>
    </div>
    <div class="code-content-wrapper overflow-x-auto transition-all duration-300 ${isCollapsible ? "max-h-[350px]" : ""}">
      <pre class="py-3 text-zinc-100 bg-transparent m-0 font-mono text-xs leading-normal">${lineHtml}</pre>
    </div>
    ${
      isCollapsible
        ? `<div class="expand-fade-overlay absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex items-end justify-center pb-4 transition-all duration-300 pointer-events-none">
            <button class="expand-code-btn pointer-events-auto h-8 px-4 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-lg shadow-md transition-all cursor-pointer" data-line-count="${lines.length}">
              Xem thêm (${lines.length - 50} dòng)
            </button>
          </div>`
        : ""
    }
  </div>`;
};

renderer.link = ({ href, text }: { href: string; text: string }) => {
  const projectMatch = href.match(PROJECT_LINK_REGEX);
  if (projectMatch) {
    const slug = projectMatch[1];
    return `<div class="project-embed-placeholder my-6" data-slug="${slug}" data-href="${href}">${text}</div>`;
  }
  return `<a href="${href}" class="font-bold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">${text}</a>`;
};

marked.use({
  gfm: true,
  breaks: true,
  renderer
});

type ProjectEmbedData = {
  title: string;
  description?: string;
  thumbnail?: string;
  technologies?: string[];
};

function renderProjectEmbedHtml(project: ProjectEmbedData, href: string): string {
  const techBadges =
    project.technologies && project.technologies.length > 0
      ? `<div class="flex flex-wrap gap-1 mt-3.5">
        ${project.technologies
          .slice(0, 3)
          .map(
            (tech) => `
          <span class="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">${tech}</span>
        `
          )
          .join("")}
        ${project.technologies.length > 3 ? `<span class="text-[9px] text-muted-foreground self-center ml-1">+${project.technologies.length - 3}</span>` : ""}
       </div>`
      : "";

  const imgHtml = project.thumbnail
    ? `<div class="relative w-full sm:w-48 h-32 sm:h-auto shrink-0 overflow-hidden bg-muted">
        <img src="${project.thumbnail}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 m-0 rounded-none border-0 shadow-none" />
       </div>`
    : "";

  return `
    <a href="${href}" class="not-prose flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs hover:shadow-md transition-all duration-300 my-6 max-w-2xl mx-auto group">
      ${imgHtml}
      <div class="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">Dự án</span>
          </div>
          <h4 class="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors leading-snug m-0">${project.title}</h4>
          <p class="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed m-0">${project.description || ""}</p>
        </div>
        ${techBadges}
      </div>
    </a>
  `;
}

type MarkdownBlockProps = {
  content: string;
  className?: string;
};

/**
 * Full block-level markdown renderer for posts and articles.
 * Renders headings, lists, tables, code blocks, images, blockquotes,
 * task lists, alignment divs, etc. Width-constrained via prose.
 * Supports image zoom on click.
 */
export function MarkdownBlock({ content, className = "" }: MarkdownBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    if (!content) {
      return "";
    }
    try {
      const rawHtml = marked.parse(content);
      const htmlString = typeof rawHtml === "string" ? rawHtml : "";
      return sanitizeHtml(htmlString);
    } catch {
      return "";
    }
  }, [content]);

  // Image zoom + disable checkboxes + code copy + expand/collapse handlers
  useEffect(() => {
    if (!(htmlContent && containerRef.current)) {
      return;
    }

    // Zoom
    const images = containerRef.current.querySelectorAll("img");
    const zoom = mediumZoom(images, {
      margin: 24,
      background: "rgba(0,0,0,0.85)"
    });

    let captionEl: HTMLDivElement | null = null;

    zoom.on("open", (event) => {
      const img = event.target as HTMLImageElement;
      const title = img.getAttribute("title") || img.getAttribute("alt") || "";
      if (title) {
        captionEl = document.createElement("div");
        captionEl.className =
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] bg-black/75 backdrop-blur-[2px] px-4 py-2 rounded-lg text-white text-sm font-semibold max-w-[80vw] text-center shadow-lg pointer-events-none transition-all duration-300 opacity-0 select-none";
        captionEl.textContent = title;
        document.body.appendChild(captionEl);
        requestAnimationFrame(() => {
          if (captionEl) {
            captionEl.style.opacity = "1";
          }
        });
      }
    });

    zoom.on("close", () => {
      if (captionEl) {
        captionEl.style.opacity = "0";
        const el = captionEl;
        captionEl = null;
        setTimeout(() => {
          el.remove();
        }, 300);
      }
    });

    // Disable task-list checkboxes (visual only)
    const checkboxes = containerRef.current.querySelectorAll('input[type="checkbox"]');
    for (const cb of checkboxes) {
      cb.setAttribute("disabled", "true");
    }

    // Set up copy handlers
    const copyButtons = containerRef.current.querySelectorAll(".copy-code-btn");
    const copyHandlers = new Map<Element, () => void>();
    for (const btn of copyButtons) {
      const handler = () => {
        const encodedCode = btn.getAttribute("data-code");
        if (encodedCode) {
          const codeText = decodeURIComponent(encodedCode);
          navigator.clipboard.writeText(codeText).then(() => {
            btn.textContent = "Copied!";
            setTimeout(() => {
              btn.textContent = "Copy";
            }, 2000);
          });
        }
      };
      btn.addEventListener("click", handler);
      copyHandlers.set(btn, handler);
    }

    // Set up expand/collapse handlers
    const expandButtons = containerRef.current.querySelectorAll(".expand-code-btn");
    const expandHandlers = new Map<Element, () => void>();
    for (const btn of expandButtons) {
      const container = btn.closest(".code-block-container");
      const wrapper = container?.querySelector(".code-content-wrapper");
      const fadeOverlay = container?.querySelector(".expand-fade-overlay");
      if (container && wrapper && fadeOverlay) {
        const handler = () => {
          const isCollapsed = container.classList.contains("collapsed");
          if (isCollapsed) {
            container.classList.remove("collapsed");
            container.classList.add("expanded");
            wrapper.classList.remove("max-h-[350px]");
            wrapper.classList.add("max-h-none");
            fadeOverlay.classList.remove(
              "bg-gradient-to-t",
              "from-zinc-950",
              "via-zinc-950/80",
              "to-transparent",
              "h-24"
            );
            fadeOverlay.classList.add("h-12", "bg-transparent");
            btn.textContent = "Thu gọn";
          } else {
            container.classList.remove("expanded");
            container.classList.add("collapsed");
            wrapper.classList.remove("max-h-none");
            wrapper.classList.add("max-h-[350px]");
            fadeOverlay.classList.remove("h-12", "bg-transparent");
            fadeOverlay.classList.add("bg-gradient-to-t", "from-zinc-950", "via-zinc-950/80", "to-transparent", "h-24");
            const lineCount = btn.getAttribute("data-line-count") || "";
            btn.textContent = `Xem thêm (${Number(lineCount) - 50} dòng)`;
            container.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        };
        btn.addEventListener("click", handler);
        expandHandlers.set(btn, handler);
      }
    }

    // Load project embeds
    const projectPlaceholders = containerRef.current.querySelectorAll(".project-embed-placeholder");
    for (const el of projectPlaceholders) {
      const slug = el.getAttribute("data-slug");
      const href = el.getAttribute("data-href") || "";
      const text = el.textContent || "";
      if (slug) {
        // Render loading skeleton
        el.innerHTML = `
          <div class="animate-pulse flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-border bg-card shadow-xs my-6 max-w-2xl mx-auto h-32 sm:h-40">
            <div class="w-full sm:w-48 bg-muted shrink-0"></div>
            <div class="flex-1 p-5 flex flex-col justify-between">
              <div class="space-y-2">
                <div class="h-4 bg-muted rounded w-1/4"></div>
                <div class="h-4 bg-muted rounded w-3/4"></div>
                <div class="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div class="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        `;

        getProjectDetail(slug)
          .then((res) => {
            const payload = res.data?.payload as {
              project?: {
                title: string;
                description?: string;
                thumbnail?: string;
                technologies?: string[];
              };
            } | null;
            const project = payload?.project;
            if (project) {
              el.innerHTML = renderProjectEmbedHtml(project, href);
            } else {
              el.innerHTML = `<a href="${href}" class="font-bold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">${text}</a>`;
            }
          })
          .catch(() => {
            el.innerHTML = `<a href="${href}" class="font-bold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">${text}</a>`;
          });
      }
    }

    return () => {
      zoom.detach();
      if (captionEl) {
        captionEl.remove();
      }
      for (const [btn, handler] of copyHandlers.entries()) {
        btn.removeEventListener("click", handler);
      }
      for (const [btn, handler] of expandHandlers.entries()) {
        btn.removeEventListener("click", handler);
      }
    };
  }, [htmlContent]);

  if (!htmlContent) {
    return null;
  }

  return (
    <div
      className={`prose prose-neutral dark:prose-invert prose-hr:my-8 prose-li:my-1 prose-ol:my-4 prose-p:my-4 prose-ul:my-4 prose-h1:mt-12 prose-h2:mt-10 prose-h3:mt-8 prose-h4:mt-6 prose-h1:mb-6 prose-h2:mb-4 prose-h3:mb-3 prose-h4:mb-2 prose-table:w-full max-w-none prose-table:border-collapse prose-ol:list-decimal prose-ul:list-disc prose-code:rounded prose-pre:rounded-xl prose-td:border prose-th:border prose-hr:border-border prose-td:border-border prose-th:border-border prose-blockquote:border-l-primary/50 prose-code:bg-muted prose-th:bg-muted/50 prose-pre:p-0 prose-code:px-1.5 prose-td:px-3 prose-th:px-3 prose-code:py-0.5 prose-td:py-2 prose-th:py-2 prose-blockquote:pl-4 prose-th:text-left prose-a:font-bold prose-headings:font-bold prose-th:font-semibold prose-a:text-primary prose-blockquote:text-muted-foreground prose-code:text-sm prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-base prose-td:text-sm prose-th:text-sm prose-blockquote:italic prose-p:leading-relaxed prose-headings:tracking-tight prose-a:underline prose-a:underline-offset-4 prose-a:transition-colors prose-code:before:content-none prose-code:after:content-none hover:prose-a:text-primary/80 [&_.task-list-item]:list-none [&_.task-list-item]:pl-0 [&_iframe]:mx-auto [&_iframe]:my-8 [&_iframe]:block [&_iframe]:max-w-full [&_iframe]:rounded-2xl md:[&_iframe]:max-w-[80%] [&_img]:mx-auto [&_img]:mt-8 [&_img]:mb-12 [&_img]:block [&_img]:max-w-full [&_img]:cursor-zoom-in [&_img]:rounded-2xl [&_img]:border [&_img]:border-border [&_img]:shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:[&_img]:max-w-[75%] lg:[&_img]:max-w-[65%] [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:align-middle [&_ol]:pl-6 [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:pl-6 [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square] ${className}
      `}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      ref={containerRef}
    />
  );
}
