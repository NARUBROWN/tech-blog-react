import { useEffect, useMemo, useRef, memo } from 'react';
import DOMPurify from 'dompurify';
import { decodeMermaidSource, isMermaidSource, renderMermaidSvg } from '../lib/mermaid';
import 'react-quill-new/dist/quill.snow.css';
import './QuillContent.css';
import '../pages/PostDetail.css';
import './Skeleton.css';

const stripFence = source => source.trim().replace(/^```mermaid\s*\n?/i, '').replace(/\n?```\s*$/, '').trim();
const codeText = node => node.querySelector('.ql-code-block')
    ? [...node.querySelectorAll('.ql-code-block')].map(line => line.textContent).join('\n')
    : node.innerText || node.textContent;

const PostContent = memo(({ content }) => {
    const rootRef = useRef(null);
    const html = useMemo(() => DOMPurify.sanitize(content || '', { ADD_ATTR: ['target'] }), [content]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        let cancelled = false;
        const cleanups = [];
        root.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.setAttribute('rel', 'noopener noreferrer');
        });

        const renderBlock = async (source, nodes) => {
            try {
                const svg = await renderMermaidSvg(source);
                if (cancelled || !nodes.every(node => root.contains(node))) return;
                const diagram = document.createElement('div');
                diagram.className = 'mermaid-diagram';
                diagram.setAttribute('role', 'img');
                diagram.setAttribute('aria-label', 'Mermaid 다이어그램');
                diagram.innerHTML = svg;
                nodes[0].before(diagram);
                nodes.forEach(node => node.remove());
            } catch {
                if (cancelled || !root.contains(nodes[0])) return;
                const error = document.createElement('div');
                error.className = 'mermaid-render-error';
                const message = document.createElement('p');
                message.textContent = '다이어그램을 표시하지 못했습니다. 원본 코드를 확인해 주세요.';
                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.textContent = 'Mermaid 원본 코드';
                const pre = document.createElement('pre');
                pre.textContent = source;
                details.append(summary, pre);
                error.append(message, details);
                nodes[0].before(error);
                nodes.forEach(node => node.remove());
            }
        };

        const renderDiagrams = async () => {
            // 저장된 전용 블록은 원문 속성으로 읽어 Quill의 HTML 변환을 피합니다.
            for (const block of root.querySelectorAll('.ql-mermaid-block')) {
                if (cancelled) return;
                await renderBlock(decodeMermaidSource(block), [block]);
            }
            // Quill 1/2와 기존 pre 코드 블록을 함께 지원합니다.
            for (const block of root.querySelectorAll('.ql-code-block-container, pre, .mermaid')) {
                if (cancelled) return;
                if (!root.contains(block) || block.closest('.mermaid-diagram, .mermaid-render-error, .ql-mermaid-block')) continue;
                const source = stripFence(codeText(block));
                if (isMermaidSource(source) || /^```mermaid/i.test(block.textContent.trim())) await renderBlock(source, [block]);
            }
            // 이전 편집기가 일반 문단으로 저장했던 다이어그램을 복원합니다.
            const paragraphs = [...root.children];
            for (let index = 0; index < paragraphs.length; index++) {
                if (cancelled) return;
                const first = paragraphs[index];
                if (first.tagName !== 'P' || !root.contains(first) || !isMermaidSource(first.innerText)) continue;
                const nodes = [first];
                let source = first.innerText;
                for (let next = index + 1; next < paragraphs.length; next++) {
                    const line = paragraphs[next];
                    const text = line.innerText?.trim();
                    if (line.tagName !== 'P' || !text) break;
                    // 도표 뒤의 일반 문장까지 합치지 않습니다.
                    if (!/^(?:%%|subgraph\b|end\b|direction\b|classDef\b|class\b|style\b|linkStyle\b|participant\b|actor\b|Note\b|note\b|loop\b|alt\b|else\b|opt\b|par\b|and\b|rect\b|activate\b|deactivate\b|autonumber\b|[A-Za-z_][\w-]*\s*(?:[-<>=:[({]|$))/.test(text)) break;
                    nodes.push(line);
                    source += `\n${line.innerText}`;
                }
                await renderBlock(source.trim(), nodes);
                index += nodes.length - 1;
            }
        };
        renderDiagrams();

        root.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                img.style.opacity = '1';
                if (img.parentElement.classList.contains('image-skeleton-wrapper')) {
                    img.parentElement.classList.remove('skeleton');
                    img.parentElement.style.minHeight = 'auto';
                }
                return;
            }
            let wrapper = img.parentElement;
            if (!wrapper.classList.contains('image-skeleton-wrapper')) {
                wrapper = document.createElement('span');
                wrapper.className = 'image-skeleton-wrapper skeleton';
                Object.assign(wrapper.style, { display: 'inline-block', minHeight: '200px', width: '100%', maxWidth: '100%', borderRadius: '6px' });
                img.before(wrapper);
                wrapper.appendChild(img);
            }
            img.style.opacity = '0';
            const finish = () => {
                img.style.opacity = '1';
                wrapper.classList.remove('skeleton');
                wrapper.style.minHeight = 'auto';
            };
            img.addEventListener('load', finish, { once: true });
            img.addEventListener('error', finish, { once: true });
            cleanups.push(() => { img.removeEventListener('load', finish); img.removeEventListener('error', finish); });
        });
        return () => { cancelled = true; cleanups.forEach(cleanup => cleanup()); };
    }, [html]);

    return <div className="post-content-wrapper ql-snow"><div ref={rootRef} className="post-body-text ql-editor" dangerouslySetInnerHTML={{ __html: html }} /></div>;
});
PostContent.displayName = 'PostContent';
export default PostContent;
