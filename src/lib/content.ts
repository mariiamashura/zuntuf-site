import { getCollection } from 'astro:content';
import { site } from '../config/site';
import { pick, type Lang } from '../i18n';

const visible = (e: { data: { draft: boolean } }) => site.showDrafts || !e.data.draft;
const byOrder = (a: any, b: any) => a.data.order - b.data.order || a.id.localeCompare(b.id);

export async function getTools() {
  return (await getCollection('tools')).filter(visible).sort(byOrder);
}
export async function getProjects() {
  return (await getCollection('projects')).filter(visible).sort(byOrder);
}
export async function getLab() {
  return site.features.lab ? (await getCollection('lab')).filter(visible).sort(byOrder) : [];
}

/** Localized view of a tool (name + copy merged over English). */
export function localizeTool(entry: Awaited<ReturnType<typeof getTools>>[number], lang: Lang) {
  const copy = pick(entry.data.i18n as any, lang) as any;
  return { slug: entry.id, ...entry.data, copy, name: copy.name ?? entry.data.name };
}
