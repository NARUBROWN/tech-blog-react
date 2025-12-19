import { useEffect, memo } from 'react';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import 'react-quill-new/dist/quill.snow.css';
import '../pages/PostDetail.css';
import './Skeleton.css';

// Configure DOMPurify to allow SVG elements for Mermaid diagrams
DOMPurify.setConfig({
    ADD_TAGS: ['svg', 'path', 'g', 'defs', 'marker', 'style', 'title', 'desc', 'ellipse', 'line', 'polygon', 'polyline', 'rect', 'text', 'tspan', 'use', 'symbol', 'foreignObject', 'circle'],
    ADD_ATTR: ['class', 'style', 'stroke', 'stroke-width', 'fill', 'd', 'viewBox', 'xmlns', 'x', 'y', 'width', 'height', 'transform', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'alignment-baseline', 'preserveAspectRatio', 'xmlns:xlink', 'xlink:href']
});

const PostContent = memo(({ content }) => {
    useEffect(() => {
        if (!content) return;

        // Initialize Mermaid without auto-start
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
        });

        const renderMermaid = async () => {
            const isMermaidDefinition = (text) =>
                text.match(/^(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline)/);

            let renderIndex = 0;

            const renderAndReplace = async (textChunk, nodesToReplace) => {
                const id = `mermaid-${renderIndex++}-${Date.now()}`;
                try {
                    const { svg } = await mermaid.render(id, textChunk);
                    const div = document.createElement('div');
                    div.className = 'mermaid-diagram';
                    div.innerHTML = svg;

                    const firstNode = nodesToReplace[0];
                    const parent = firstNode?.parentNode;
                    if (parent) {
                        parent.insertBefore(div, firstNode);
                        nodesToReplace.forEach(node => parent.removeChild(node));
                    }
                } catch (error) {
                    console.error('Mermaid rendering error for block:', renderIndex - 1, error);
                    nodesToReplace.forEach(node => node.classList?.add('mermaid-error'));
                }
            };

            // Standard <pre> blocks
            const preBlocks = document.querySelectorAll('.post-body-text pre');
            for (const block of preBlocks) {
                const blockContent = block.textContent.trim();
                if (isMermaidDefinition(blockContent)) {
                    await renderAndReplace(blockContent, [block]);
                }
            }

            // Quill code blocks
            const quillBlocks = document.querySelectorAll('.post-body-text .ql-code-block');
            const visited = new Set();
            for (const block of quillBlocks) {
                if (visited.has(block)) continue;

                const nodesToReplace = [];
                let current = block;
                while (current && current.classList.contains('ql-code-block')) {
                    visited.add(current);
                    nodesToReplace.push(current);
                    current = current.nextElementSibling;
                }

                const blockContent = nodesToReplace.map(node => node.textContent).join('\n').trim();
                if (isMermaidDefinition(blockContent)) {
                    await renderAndReplace(blockContent, nodesToReplace);
                }
            }

            // Plain paragraphs
            const container = document.querySelector('.post-body-text');
            if (container) {
                const children = Array.from(container.children);
                for (let i = 0; i < children.length; i++) {
                    const node = children[i];
                    if (!(node.tagName === 'P')) continue;

                    const firstLine = node.textContent.trim();
                    if (!isMermaidDefinition(firstLine)) continue;

                    const nodesToReplace = [node];
                    const contentLines = [firstLine];

                    let j = i + 1;
                    while (j < children.length) {
                        const next = children[j];
                        if (!(next.tagName === 'P')) break;

                        const text = next.textContent;
                        if (!text || text.trim() === '') {
                            nodesToReplace.push(next);
                            j++;
                            break;
                        }

                        contentLines.push(text);
                        nodesToReplace.push(next);
                        j++;
                    }

                    const blockContent = contentLines.join('\n').trim();
                    if (isMermaidDefinition(blockContent)) {
                        await renderAndReplace(blockContent, nodesToReplace);
                        i = j - 1;
                    }
                }
            }
        };

        // Small delay to ensure DOM is ready
        setTimeout(renderMermaid, 100);

        // Helper to wrap element
        const wrapElement = (el, wrapper) => {
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
        };

        // Handle Image Skeleton Loading
        const handleImageSkeleton = () => {
            const images = document.querySelectorAll('.post-body-text img');

            images.forEach(img => {
                if (img.complete && img.naturalHeight !== 0) return;

                // Check if already wrapped or processed to avoid duplicates if effect runs again
                if (img.parentElement.classList.contains('image-skeleton-wrapper')) return;

                // Create wrapper
                const wrapper = document.createElement('span');
                wrapper.className = 'image-skeleton-wrapper skeleton';
                wrapper.style.display = 'inline-block';
                // We try to approximate size if width/height attributes exist, otherwise block
                // But often responsive images don't have fixed sizes.
                // Let's set some reasonable defaults or just block for better visuals
                wrapper.style.minHeight = '300px';
                wrapper.style.minWidth = '100%';
                wrapper.style.maxWidth = '100%';
                wrapper.style.borderRadius = '8px';

                // Hide image initially
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease-in-out';

                // Wrap image
                wrapElement(img, wrapper);

                const onLoad = () => {
                    img.style.opacity = '1';
                    wrapper.classList.remove('skeleton');
                    wrapper.style.minHeight = 'auto'; // Reset min-height to let content flow
                    wrapper.style.background = 'none'; // Remove skeleton shimmer background
                };

                const onError = () => {
                    // Even on error, show the broken image icon or handle gracefully
                    img.style.opacity = '1';
                    wrapper.classList.remove('skeleton');
                    wrapper.style.minHeight = 'auto';
                    wrapper.style.background = 'none';
                };

                img.addEventListener('load', onLoad, { once: true });
                img.addEventListener('error', onError, { once: true });
            });
        };

        // Run after a slight delay to allow DOM to settle, similar to Mermaid
        setTimeout(() => {
            handleImageSkeleton();
        }, 50);

    }, [content]);

    return (
        <div className="post-content-wrapper ql-snow">
            <div
                className="post-body-text ql-editor"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
        </div>
    );
});

PostContent.displayName = 'PostContent';

export default PostContent;
