import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const accent = z.enum(['mustard', 'coral', 'ochre', 'cream']);
const os = z.enum(['windows', 'macos', 'linux', 'android', 'ios', 'web']);
const category = z.enum(['photography', 'files', 'productivity', 'creative', 'utilities', 'experimental']);
const url = z.string().url();

/** Translatable copy. English is required; de/ua may be partial (falls back to English). */
const toolCopy = z.object({
  name: z.string().optional(), // defaults to the language-neutral `name`
  tagline: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  privacy: z.string().optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
});

/**
 * One JSON file per tool in src/content/tools/. The filename (without .json) is the URL slug.
 * Anything not provided is simply not rendered. Never fill fields with guesses.
 */
const tools = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tools' }),
  schema: z.object({
    draft: z.boolean().default(false), // draft entries are hidden in production builds
    name: z.string(),
    order: z.number().default(100),
    accent: accent.default('mustard'),
    category: category.optional(),
    status: z.enum(['released', 'beta', 'coming-soon']).optional(),
    version: z.string().optional(),
    icon: z.string().optional(), // path under /public, e.g. /tools/slug/icon.svg
    artSize: z.number().optional(), // width of the poster art in % of its column (default 66, or 56 without panels)
    panels: z.boolean().default(true), // false: no big coloured sheets behind the poster art
    art: z.string().optional(), // key of an interactive illustration (src/lib/art.ts); the picture is /public/tools/<slug>/art.webp
    languages: z.array(z.enum(['en', 'de', 'ua'])).default([]), // UI languages of the app itself
    platforms: z
      .array(z.object({ os, downloadUrl: url.optional(), size: z.string().optional(), checksum: z.string().optional() }))
      .default([]),
    homepage: url.optional(),
    docs: url.optional(),
    repo: url.optional(),
    screenshots: z
      .array(z.object({ src: z.string(), alt: z.object({ en: z.string() }).catchall(z.string()) }))
      .default([]),
    changelog: z
      .array(z.object({ version: z.string(), date: z.string(), notes: z.object({ en: z.array(z.string()) }).catchall(z.array(z.string())) }))
      .default([]),
    related: z.array(z.string()).default([]), // slugs of other tools
    featuresPage: z.boolean().default(false), // true: /tools/<slug>/features/ exists (text in src/data/<slug>-features.ts)
    i18n: z.object({ en: toolCopy, de: toolCopy.partial().optional(), ua: toolCopy.partial().optional() }),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    draft: z.boolean().default(false),
    name: z.string(),
    order: z.number().default(100),
    accent: accent.default('coral'),
    kind: z.enum(['game', 'experiment', 'design', 'prototype', 'research', 'other']).default('other'),
    url: url.optional(),
    i18n: z.object({
      en: z.object({ tagline: z.string(), description: z.string().optional() }),
      de: z.object({ tagline: z.string(), description: z.string().optional() }).partial().optional(),
      ua: z.object({ tagline: z.string(), description: z.string().optional() }).partial().optional(),
    }),
  }),
});

/** Lab: schema is ready, section is hidden until site.features.lab = true. */
const lab = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/lab' }),
  schema: z.object({
    draft: z.boolean().default(false),
    name: z.string(),
    order: z.number().default(100),
    accent: accent.default('coral'),
    status: z.enum(['live', 'prototype', 'archived']),
    kind: z.enum(['web-app', 'demo', 'experiment']).default('experiment'),
    entryUrl: z.string(), // /lab/<slug>/ (built into /public/lab/<slug>/) or external URL
    embed: z.enum(['link', 'iframe']).default('link'),
    repo: url.optional(),
    tags: z.array(z.string()).default([]),
    i18n: z.object({
      en: z.object({ tagline: z.string(), description: z.string().optional() }),
      de: z.object({ tagline: z.string(), description: z.string().optional() }).partial().optional(),
      ua: z.object({ tagline: z.string(), description: z.string().optional() }).partial().optional(),
    }),
  }),
});

export const collections = { tools, projects, lab };
