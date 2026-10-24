type ExportSource = { title?: string; link?: string };

export type ExportQuery = {
  prompt?: string | null;
  response?: string | null;
  timestamp?: string | null;
  sources?: ExportSource[] | null;
  attachments?: { fileName?: string }[] | null;
};

export function conversationToMarkdown(
  title: string,
  queries: ExportQuery[],
): string {
  const lines: string[] = [`# ${title.trim() || 'Conversation'}`, ''];

  queries.forEach((query) => {
    lines.push('## User', '');
    if (query.timestamp) lines.push(`_${query.timestamp}_`, '');
    lines.push(query.prompt?.trim() || '', '');

    const attachments = (query.attachments ?? []).filter((a) => a?.fileName);
    if (attachments.length) {
      lines.push(
        `Attachments: ${attachments.map((a) => a.fileName).join(', ')}`,
        '',
      );
    }

    lines.push('## Assistant', '');
    lines.push(query.response?.trim() || '_No response_', '');

    const sources = (query.sources ?? []).filter((s) => s?.title || s?.link);
    if (sources.length) {
      lines.push('**Sources:**', '');
      sources.forEach((source, index) => {
        const label = source.title || source.link;
        const isUrl = source.link && /^https?:\/\//i.test(source.link);
        lines.push(
          isUrl
            ? `${index + 1}. [${label}](${source.link})`
            : `${index + 1}. ${label}`,
        );
      });
      lines.push('');
    }

    lines.push('---', '');
  });

  return lines.join('\n').trimEnd() + '\n';
}

export function toExportFilename(title: string, extension: string): string {
  const base = title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);
  return `${base || 'conversation'}.${extension}`;
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
