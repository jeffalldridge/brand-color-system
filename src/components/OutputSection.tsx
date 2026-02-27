"use client";

import { useState } from "react";
import type { GamutTarget, ShadeFamily } from "@/lib/types";
import { generateAseFile } from "@/lib/export-ase";
import { generateAcoFile } from "@/lib/export-aco";
import { generateDesignTokens } from "@/lib/export-tokens";

interface OutputSectionProps {
  families: ShadeFamily[];
  bgIsLight: boolean;
  gamutTarget: GamutTarget;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function generateCssCustomProperties(families: ShadeFamily[]): string {
  const lines: string[] = [":root {"];
  for (const family of families) {
    const slug = slugify(family.brand.name);
    for (const shade of family.shades) {
      lines.push(`  --${slug}-${shade.step}: ${shade.hex};`);
    }
    lines.push("");
  }
  lines.push("}");
  return lines.join("\n");
}

function generateTailwindTheme(families: ShadeFamily[]): string {
  const lines: string[] = ["@theme {"];
  for (const family of families) {
    const slug = slugify(family.brand.name);
    for (const shade of family.shades) {
      lines.push(`  --color-${slug}-${shade.step}: ${shade.oklchCss};`);
    }
    lines.push("");
  }
  lines.push("}");
  return lines.join("\n");
}

export default function OutputSection({
  families,
  bgIsLight,
  gamutTarget,
}: OutputSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);

  const txt = bgIsLight ? "text-black/80" : "text-white/80";
  const txtMuted = bgIsLight ? "text-black/60" : "text-white/60";
  const txtDim = bgIsLight ? "text-black/50" : "text-white/50";
  const txtRow = bgIsLight ? "text-black/80" : "text-white/80";
  const btnBorder = bgIsLight
    ? "border-black/25 text-black/70 hover:text-black hover:bg-black/10"
    : "border-white/30 text-white/80 hover:text-white hover:bg-white/15";
  const hoverRow = bgIsLight
    ? "hover:text-black hover:bg-black/5"
    : "hover:text-white hover:bg-white/10";
  const hoverCell = bgIsLight ? "hover:text-black" : "hover:text-white";
  const expandBg = bgIsLight ? "hover:bg-black/5" : "hover:bg-white/10";

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const downloadFile = (
    data: BlobPart,
    filename: string,
    mime = "application/octet-stream",
  ) => {
    try {
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to generate ${filename}:`, error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-xs font-semibold uppercase tracking-widest ${bgIsLight ? "text-black/60" : "text-white/60"}`}>Output Values</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() =>
              copyToClipboard(generateCssCustomProperties(families), "css")
            }
            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${btnBorder}`}
            title="Copy CSS custom properties"
          >
            {copiedKey === "css" ? "Copied!" : "CSS"}
          </button>
          <button
            onClick={() =>
              copyToClipboard(generateTailwindTheme(families), "tw")
            }
            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${btnBorder}`}
            title="Copy Tailwind @theme"
          >
            {copiedKey === "tw" ? "Copied!" : "Tailwind"}
          </button>
          <button
            onClick={() =>
              downloadFile(
                generateDesignTokens(families),
                "brand-colors.tokens.json",
                "application/json",
              )
            }
            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${btnBorder}`}
            title="W3C Design Tokens (DTCG) — Figma, Tokens Studio, Style Dictionary"
          >
            Tokens
          </button>
          <span className={`self-center text-[9px] ${txtDim}`}>|</span>
          <button
            onClick={() =>
              downloadFile(generateAseFile(families), "brand-colors.ase")
            }
            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${btnBorder}`}
            title="Adobe Swatch Exchange — Illustrator, Photoshop, InDesign"
          >
            .ase
          </button>
          <button
            onClick={() =>
              downloadFile(generateAcoFile(families), "brand-colors.aco")
            }
            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${btnBorder}`}
            title="Adobe Color Swatch — Photoshop"
          >
            .aco
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {families.map((family) => {
          const isExpanded = expandedFamily === family.brand.id;
          return (
            <div key={family.brand.id}>
              <button
                onClick={() =>
                  setExpandedFamily(isExpanded ? null : family.brand.id)
                }
                className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded transition-colors ${expandBg}`}
                aria-expanded={isExpanded}
              >
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: family.adjustedHex }}
                />
                <span className={`text-xs font-medium ${txt}`}>
                  {family.brand.name}
                </span>
                <span className={`text-[10px] font-mono ${txtMuted}`}>
                  {family.adjustedHex}
                </span>
                <span className={`ml-auto text-[10px] ${txtDim}`}>
                  {isExpanded ? "collapse" : "expand"}
                </span>
              </button>

              {isExpanded && (
                <div className="ml-5 mb-3 overflow-x-auto">
                  <table className="w-full text-[10px] font-mono border-collapse">
                    <thead>
                      <tr
                        className={`${txtMuted} border-b ${bgIsLight ? "border-black/5" : "border-white/5"}`}
                      >
                        <th className="text-left font-semibold py-1.5 pr-3">
                          Step
                        </th>
                        <th className="text-left font-semibold py-1.5 pr-3">
                          Hex
                        </th>
                        <th className="text-left font-semibold py-1.5 pr-3">
                          RGB
                        </th>
                        <th className="text-left font-semibold py-1.5 pr-3">
                          HSL
                        </th>
                        <th className="text-left font-semibold py-1.5 pr-3">
                          OKLCH
                        </th>
                        <th className="text-left font-semibold py-1.5">
                          Gamut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {family.shades.map((shade) => (
                        <tr
                          key={shade.step}
                          className={`${txtRow} ${hoverRow} border-b border-transparent ${bgIsLight ? "hover:border-black/5" : "hover:border-white/5"}`}
                        >
                          <td className="py-1 pr-3 font-bold">{shade.step}</td>
                          <td
                            className={`py-1 pr-3 cursor-pointer ${hoverCell}`}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              copyToClipboard(
                                shade.hex,
                                `${family.brand.name}-${shade.step}-hex`,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                copyToClipboard(
                                  shade.hex,
                                  `${family.brand.name}-${shade.step}-hex`,
                                );
                              }
                            }}
                          >
                            {shade.hex}
                            {copiedKey ===
                              `${family.brand.name}-${shade.step}-hex` && (
                              <span className="ml-1 text-green-500" aria-live="polite">ok</span>
                            )}
                          </td>
                          <td
                            className={`py-1 pr-3 cursor-pointer ${hoverCell}`}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              copyToClipboard(
                                shade.rgb,
                                `${family.brand.name}-${shade.step}-rgb`,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                copyToClipboard(
                                  shade.rgb,
                                  `${family.brand.name}-${shade.step}-rgb`,
                                );
                              }
                            }}
                          >
                            {shade.rgb}
                            {copiedKey ===
                              `${family.brand.name}-${shade.step}-rgb` && (
                              <span className="ml-1 text-green-500" aria-live="polite">ok</span>
                            )}
                          </td>
                          <td
                            className={`py-1 pr-3 cursor-pointer ${hoverCell}`}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              copyToClipboard(
                                shade.hsl,
                                `${family.brand.name}-${shade.step}-hsl`,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                copyToClipboard(
                                  shade.hsl,
                                  `${family.brand.name}-${shade.step}-hsl`,
                                );
                              }
                            }}
                          >
                            {shade.hsl}
                            {copiedKey ===
                              `${family.brand.name}-${shade.step}-hsl` && (
                              <span className="ml-1 text-green-500" aria-live="polite">ok</span>
                            )}
                          </td>
                          <td
                            className={`py-1 pr-3 cursor-pointer ${hoverCell}`}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              copyToClipboard(
                                shade.oklchCss,
                                `${family.brand.name}-${shade.step}-oklch`,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                copyToClipboard(
                                  shade.oklchCss,
                                  `${family.brand.name}-${shade.step}-oklch`,
                                );
                              }
                            }}
                          >
                            {shade.oklchCss}
                            {copiedKey ===
                              `${family.brand.name}-${shade.step}-oklch` && (
                              <span className="ml-1 text-green-500" aria-live="polite">ok</span>
                            )}
                          </td>
                          <td className="py-1">
                            {shade.inGamut ? (
                              <span className="text-green-500/60">
                                {gamutTarget === "p3" ? "P3" : "sRGB"}
                              </span>
                            ) : (
                              <span
                                className={`${bgIsLight ? "text-black/40" : "text-white/40"}`}
                                title={`Color was outside ${gamutTarget === "p3" ? "P3" : "sRGB"} and has been gamut-mapped`}
                              >
                                mapped
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <HowItWorks bgIsLight={bgIsLight} />
    </div>
  );
}

// -----------------------------------------------------------
// Inline explainer — collapsible
// -----------------------------------------------------------
function HowItWorks({ bgIsLight }: { bgIsLight: boolean }) {
  const [open, setOpen] = useState(false);

  const txt = bgIsLight ? "text-black/80" : "text-white/80";
  const txtMuted = bgIsLight ? "text-black/50" : "text-white/50";
  const border = bgIsLight ? "border-black/10" : "border-white/10";
  const codeBg = bgIsLight ? "bg-black/5" : "bg-white/10";
  const headingColor = bgIsLight ? "text-black/70" : "text-white/70";
  const linkColor = bgIsLight
    ? "text-blue-600 hover:text-blue-800"
    : "text-blue-400 hover:text-blue-300";

  return (
    <div className={`border-t pt-3 ${border}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`text-xs uppercase tracking-widest font-semibold ${txtMuted} ${bgIsLight ? "hover:text-black/80" : "hover:text-white/80"} transition-colors`}
      >
        {open ? "Hide" : "About this tool"}
      </button>

      {open && (
        <div
          className={`mt-3 space-y-5 text-xs leading-relaxed ${txt} max-w-3xl`}
        >
          <Section title="What is this?" headingColor={headingColor}>
            Brand Color Explorer is a free tool by{" "}
            <Link href="https://tentstudios.com" className={linkColor}>
              Tent Studios
            </Link>{" "}
            that generates complete shade families from any set of brand colors.
            Paste your hex codes, adjust hue, chroma, and lightness, then export
            production-ready color scales for your design system. Everything runs
            in your browser — no data is sent anywhere.
          </Section>

          <Section title="Quick start" headingColor={headingColor}>
            <strong>1.</strong> Enter or paste your brand colors in the Source
            Colors section (or click <strong>Import</strong> to paste CSS
            variables, Tailwind themes, or design tokens).{" "}
            <strong>2.</strong> Each color automatically fans out into a full
            shade ramp — dark on the left, light on the right.{" "}
            <strong>3.</strong> Fine-tune any color with the H/C/L sliders.{" "}
            <strong>4.</strong> Copy the output as CSS, Tailwind, or download as
            design tokens, ASE, or ACO. Drag to reorder. Toggle gamut, gap
            sizes, and overlays from the header.
          </Section>

          <Section title="Why OKLCH?" headingColor={headingColor}>
            In{" "}
            <Link
              href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl"
              className={linkColor}
            >
              HSL
            </Link>
            , a &ldquo;50% lightness&rdquo; yellow looks noticeably brighter
            than a &ldquo;50% lightness&rdquo; blue — the numbers match but your
            eyes disagree.{" "}
            <Link href="https://oklch.com" className={linkColor}>
              OKLCH
            </Link>{" "}
            is a{" "}
            <Link
              href="https://bottosson.github.io/posts/oklab/"
              className={linkColor}
            >
              perceptually uniform
            </Link>{" "}
            color space where equal values produce equal visual weight.{" "}
            <Code bg={codeBg}>L</Code> is lightness (0–1),{" "}
            <Code bg={codeBg}>C</Code> is chroma (vividness),{" "}
            <Code bg={codeBg}>H</Code> is hue (0–360°). Every swatch in the
            same column shares identical perceived brightness regardless of hue,
            which means your palette looks balanced without manual tweaking.
          </Section>

          <Section title="How shades are generated" headingColor={headingColor}>
            Each source color is converted to OKLCH. The hue and chroma stay
            fixed while lightness is replaced by each column&apos;s target L
            value, producing a dark-to-light ramp that preserves the
            color&apos;s character. Columns use the{" "}
            <Link
              href="https://tailwindcss.com/docs/colors"
              className={linkColor}
            >
              standard Tailwind shade numbers
            </Link>{" "}
            (50, 100, 200 … 900, 950) mapped to OKLCH lightness, so the output
            plugs directly into a{" "}
            <Link
              href="https://tailwindcss.com/docs/theme"
              className={linkColor}
            >
              Tailwind v4 @theme
            </Link>{" "}
            block.
          </Section>

          <Section title="Gamut mapping" headingColor={headingColor}>
            Toggle between <strong>sRGB</strong> and <strong>P3</strong> in the
            header. sRGB is the safe default — every display supports it.{" "}
            <Link
              href="https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/"
              className={linkColor}
            >
              Display P3
            </Link>{" "}
            is a wider gamut available on modern Apple and some Android screens.
            When a shade falls outside the chosen gamut it is compressed using
            the{" "}
            <Link
              href="https://www.w3.org/TR/css-color-4/#gamut-mapping"
              className={linkColor}
            >
              CSS Color Level 4 algorithm
            </Link>
            , preserving hue and lightness while reducing chroma just enough to
            fit — no harsh clipping.
          </Section>

          <Section title="Accessibility & contrast" headingColor={headingColor}>
            Each swatch shows{" "}
            <Link
              href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
              className={linkColor}
            >
              WCAG 2.x contrast ratios
            </Link>{" "}
            against white and black text. <strong>4.5 : 1</strong> passes AA for
            body text; <strong>3 : 1</strong> passes AA for large text (18 px+
            bold or 24 px+ regular). Use the text overlay toggle to preview both
            simultaneously.
          </Section>

          <Section title="Adjustments (H / C / L)" headingColor={headingColor}>
            Click the slider icon on any source card to reveal per-color
            adjustments. <strong>H</strong> rotates the hue (nudge a blue toward
            teal, for instance). <strong>C</strong> scales chroma for more vivid
            or more muted shades. <strong>L</strong> shifts base lightness
            before the ramp is applied. The tick mark on each slider shows the
            original value. The top bar of the card shows a before/after split
            when adjustments are active.
          </Section>

          <Section title="Export formats" headingColor={headingColor}>
            <strong>CSS</strong> — hex{" "}
            <Link
              href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*"
              className={linkColor}
            >
              custom properties
            </Link>{" "}
            for any stylesheet.{" "}
            <strong>Tailwind</strong> — an{" "}
            <Link
              href="https://tailwindcss.com/docs/theme"
              className={linkColor}
            >
              @theme
            </Link>{" "}
            block with OKLCH values for Tailwind CSS v4.{" "}
            <strong>Tokens</strong> —{" "}
            <Link
              href="https://tr.designtokens.org/format/"
              className={linkColor}
            >
              W3C Design Tokens (DTCG)
            </Link>{" "}
            JSON compatible with{" "}
            <Link
              href="https://tokens.studio"
              className={linkColor}
            >
              Tokens Studio
            </Link>
            ,{" "}
            <Link
              href="https://amzn.github.io/style-dictionary/"
              className={linkColor}
            >
              Style Dictionary
            </Link>
            , and Figma.{" "}
            <strong>.ase</strong> (Adobe Swatch Exchange) — Illustrator,
            Photoshop, InDesign.{" "}
            <strong>.aco</strong> (Adobe Color Swatch) — Photoshop.
          </Section>

          <Section title="Drag & drop" headingColor={headingColor}>
            Source color cards can be dragged to reorder. Shade grid rows can
            also be reordered by dragging the name column. Reordering
            automatically disables &ldquo;Sort by Hue&rdquo; so your custom
            order is preserved. Click &ldquo;Sort by Hue&rdquo; in the header to
            re-sort alphabetically by hue at any time.
          </Section>

          <Section title="Learn more" headingColor={headingColor}>
            <Link
              href="https://oklch.com"
              className={linkColor}
            >
              oklch.com
            </Link>{" "}
            — interactive OKLCH color picker.{" "}
            <Link
              href="https://bottosson.github.io/posts/oklab/"
              className={linkColor}
            >
              A perceptual color space for image processing
            </Link>{" "}
            — Bj&ouml;rn Ottosson&apos;s original paper.{" "}
            <Link
              href="https://www.w3.org/TR/css-color-4/"
              className={linkColor}
            >
              CSS Color Level 4
            </Link>{" "}
            — W3C specification.{" "}
            <Link
              href="https://tailwindcss.com/docs/colors"
              className={linkColor}
            >
              Tailwind CSS Colors
            </Link>{" "}
            — default shade scale reference.{" "}
            <Link
              href="https://culorijs.org"
              className={linkColor}
            >
              culori
            </Link>{" "}
            — the color library powering conversions under the hood.
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  headingColor,
  children,
}: {
  title: string;
  headingColor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className={`text-[11px] uppercase tracking-widest font-semibold mb-1 ${headingColor}`}
      >
        {title}
      </h3>
      <p>{children}</p>
    </div>
  );
}

function Link({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`no-underline hover:underline underline-offset-2 ${className}`}
    >
      {children}
    </a>
  );
}

function Code({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <code className={`${bg} px-1 py-0.5 rounded text-[11px] font-mono`}>
      {children}
    </code>
  );
}
