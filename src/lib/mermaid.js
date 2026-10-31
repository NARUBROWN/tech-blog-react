import DOMPurify from 'dompurify';

let enginePromise;
let renderId = 0;

export const isMermaidSource = (source) => /^(?:%%[^\n]*\n\s*)*(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|sankey-beta|xychart-beta|block-beta|packet-beta|architecture-beta|kanban)\b/.test(source.trim());

export function decodeMermaidSource(node) {
    const encoded = node.getAttribute('data-mermaid');
    if (!encoded) return node.textContent.trim();
    try { return decodeURIComponent(encoded); } catch { return node.textContent.trim(); }
}

export async function renderMermaidSvg(source) {
    enginePromise ??= import('mermaid').then(({ default: engine }) => {
        engine.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: 'neutral',
            htmlLabels: false,
            suppressErrorRendering: true,
            flowchart: { htmlLabels: false, useMaxWidth: true },
            themeVariables: { fontFamily: 'system-ui, sans-serif', primaryColor: '#f5f8fb', primaryTextColor: '#172536', primaryBorderColor: '#8ca5bd', lineColor: '#596879' },
        });
        return engine;
    });
    const engine = await enginePromise;
    await engine.parse(source);
    const id = `diagram-${++renderId}`;
    try {
        const { svg } = await engine.render(id, source);
        return DOMPurify.sanitize(svg, {
            USE_PROFILES: { html: true, svg: true, svgFilters: true },
            ADD_TAGS: ['foreignObject', 'div', 'span', 'p', 'br'],
            ADD_ATTR: ['xmlns', 'xmlns:xlink', 'dominant-baseline'],
        });
    } finally {
        document.getElementById(`d${id}`)?.remove();
    }
}
