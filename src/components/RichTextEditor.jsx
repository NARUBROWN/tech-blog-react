import { useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import { X, Check, Network } from 'lucide-react';
import { uploadImage } from '../api/image';
import { decodeMermaidSource, renderMermaidSvg } from '../lib/mermaid';
import 'react-quill-new/dist/quill.snow.css';
import './QuillContent.css';
import './RichTextEditor.css';

const BlockEmbed = Quill.import('blots/block/embed');
class MermaidBlock extends BlockEmbed {
    static blotName = 'mermaid';
    static tagName = 'div';
    static className = 'ql-mermaid-block';

    static create(source) {
        const node = super.create();
        node.setAttribute('data-mermaid', encodeURIComponent(source));
        node.setAttribute('contenteditable', 'false');
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        node.setAttribute('aria-label', 'Mermaid 다이어그램 수정');
        const code = document.createElement('pre');
        code.textContent = source;
        node.appendChild(code);
        return node;
    }

    static value(node) { return decodeMermaidSource(node); }
}
Quill.register(MermaidBlock, true);
const icons = Quill.import('ui/icons');
icons.mermaid = '<svg viewBox="0 0 18 18"><rect class="ql-stroke" fill="none" x="6" y="1" width="6" height="4" rx="1"/><rect class="ql-stroke" fill="none" x="1" y="13" width="6" height="4" rx="1"/><rect class="ql-stroke" fill="none" x="11" y="13" width="6" height="4" rx="1"/><path class="ql-stroke" fill="none" d="M9 5v4M4 13V9h10v4"/></svg>';
icons.undo = '<svg viewBox="0 0 18 18"><path class="ql-stroke" fill="none" d="M5 4L2 7l3 3M2 7h8a4 4 0 010 8H7"/></svg>';
icons.redo = '<svg viewBox="0 0 18 18"><path class="ql-stroke" fill="none" d="M13 4l3 3-3 3M16 7H8a4 4 0 000 8h3"/></svg>';

const formats = ['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'script', 'color', 'background', 'blockquote', 'code-block', 'list', 'indent', 'align', 'direction', 'link', 'image', 'mermaid'];
const sample = 'flowchart TD\n    A[문제 정의] --> B[해결 방법 설계]\n    B --> C[구현과 검증]';
const labels = { undo: '실행 취소', redo: '다시 실행', bold: '굵게', italic: '기울임', underline: '밑줄', strike: '취소선', blockquote: '인용', 'code-block': '코드 블록', link: '링크', image: '이미지 업로드', mermaid: 'Mermaid 다이어그램', clean: '서식 지우기', header: '제목 수준', font: '글꼴', size: '글자 크기', color: '글자색', background: '배경색', align: '정렬', list: '목록', indent: '들여쓰기', script: '위 첨자와 아래 첨자', direction: '텍스트 방향' };

function MermaidDialog({ initialSource, onClose, onApply }) {
    const [source, setSource] = useState(initialSource);
    const [result, setResult] = useState(null);
    const dialogRef = useRef(null);
    const inputRef = useRef(null);
    const pending = result?.source !== source;

    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            try {
                const svg = await renderMermaidSvg(source);
                if (active) setResult({ source, svg });
            } catch (error) {
                if (active) setResult({ source, error: String(error.message || error).split('\n').slice(0, 5).join('\n') });
            }
        }, 250);
        return () => { active = false; clearTimeout(timer); };
    }, [source]);

    useEffect(() => {
        inputRef.current?.focus();
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, []);

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
        if (event.key !== 'Tab') return;
        const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), textarea')];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    return (
        <div className="mermaid-modal-overlay" onKeyDown={handleKeyDown}>
            <section className="mermaid-modal" role="dialog" aria-modal="true" aria-labelledby="mermaid-dialog-title" ref={dialogRef}>
                <header className="mermaid-modal-header">
                    <h2 id="mermaid-dialog-title"><Network size={18} /> Mermaid 다이어그램</h2>
                    <button type="button" onClick={onClose} aria-label="다이어그램 편집 닫기"><X size={20} /></button>
                </header>
                <div className="mermaid-modal-body">
                    <label className="mermaid-source-label">다이어그램 코드
                        <textarea ref={inputRef} value={source} onChange={event => setSource(event.target.value)} spellCheck={false} />
                        <span>코드를 수정하면 미리보기에 반영됩니다.</span>
                    </label>
                    <div className="mermaid-live-preview">
                        <h3>미리보기</h3>
                        {pending ? <p role="status">다이어그램을 그리는 중...</p> : result.error ? (
                            <div className="mermaid-validation-error" role="alert"><p>문법을 확인해 주세요.</p><pre>{result.error}</pre></div>
                        ) : <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: result.svg }} />}
                    </div>
                </div>
                <footer className="mermaid-modal-footer">
                    <button type="button" onClick={onClose}>취소</button>
                    <button type="button" className="mermaid-apply" disabled={pending || !!result?.error} onClick={() => onApply(source)}><Check size={16} /> 다이어그램 적용</button>
                </footer>
            </section>
        </div>
    );
}

export default function RichTextEditor({ value, onChange }) {
    const quillRef = useRef(null);
    const wrapperRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [diagram, setDiagram] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const modules = useMemo(() => ({
        ...(ready && Quill.imports['modules/blotFormatter'] ? { blotFormatter: {} } : {}),
        history: { delay: 800, maxStack: 100, userOnly: true },
        toolbar: {
            container: [
                ['undo', 'redo'],
                [{ header: [false, 1, 2, 3, 4, 5, 6] }],
                [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ script: 'sub' }, { script: 'super' }],
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
                [{ indent: '-1' }, { indent: '+1' }, { align: [] }],
                ['link', 'image', 'mermaid'],
                ['clean'],
            ],
            handlers: {
                undo() { this.quill.history.undo(); },
                redo() { this.quill.history.redo(); },
                mermaid() {
                    const range = this.quill.getSelection(true) || { index: this.quill.getLength() - 1, length: 0 };
                    setDiagram({ source: sample, index: range.index, replace: false });
                },
                image() {
                    const quill = this.quill;
                    const range = quill.getSelection(true) || { index: quill.getLength() - 1, length: 0 };
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        setUploadError('');
                        try {
                            const { url } = await uploadImage(file);
                            quill.insertEmbed(Math.min(range.index, quill.getLength() - 1), 'image', url, 'user');
                        } catch { setUploadError('이미지를 업로드하지 못했습니다. 다시 시도해 주세요.'); }
                        finally { setUploading(false); }
                    };
                    input.click();
                },
            },
        },
    }), [ready]);

    useEffect(() => {
        let active = true;
        window.Quill = Quill;
        import('quill-blot-formatter').then(({ default: BlotFormatter }) => {
            if (!Quill.imports['modules/blotFormatter']) Quill.register('modules/blotFormatter', BlotFormatter);
        }).catch(error => console.error('이미지 크기 조절 도구 로드 실패', error)).finally(() => { if (active) setReady(true); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!ready) return;
        const wrapper = wrapperRef.current;
        const labelControls = () => {
            const body = wrapper.querySelector('.ql-editor');
            body?.setAttribute('aria-label', '글 본문');
            body?.setAttribute('role', 'textbox');
            body?.setAttribute('aria-multiline', 'true');
            const toolbar = wrapper.querySelector('.ql-toolbar');
            if (!toolbar) return;
            toolbar.setAttribute('aria-label', '본문 서식 도구');
            toolbar.querySelectorAll('button, .ql-picker-label').forEach(control => {
                const format = [...control.classList].find(name => labels[name.replace('ql-', '')]);
                const picker = control.closest('.ql-picker');
                const pickerFormat = picker && [...picker.classList].find(name => labels[name.replace('ql-', '')]);
                const label = labels[(format || pickerFormat || '').replace('ql-', '')];
                if (label) { control.setAttribute('title', label); control.setAttribute('aria-label', label); }
            });
        };
        labelControls();
        const observer = new MutationObserver(labelControls);
        observer.observe(wrapper, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [ready]);

    const editDiagram = (event) => {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        const node = event.target.closest('.ql-mermaid-block');
        if (!node) return;
        event.preventDefault();
        const editor = quillRef.current.getEditor();
        const blot = Quill.find(node);
        setDiagram({ source: decodeMermaidSource(node), index: editor.getIndex(blot), replace: true });
    };

    const closeDiagram = () => {
        setDiagram(null);
        quillRef.current?.getEditor().focus();
    };
    const applyDiagram = (source) => {
        const editor = quillRef.current.getEditor();
        const Delta = Quill.import('delta');
        const index = Math.min(diagram.index, editor.getLength() - 1);
        editor.history.cutoff();
        editor.updateContents(new Delta().retain(index).delete(diagram.replace ? 1 : 0).insert({ mermaid: source }), 'user');
        editor.history.cutoff();
        setDiagram(null);
        editor.setSelection(index + 1, 0, 'silent');
        editor.focus();
    };

    return (
        <div className="rich-text-editor" ref={wrapperRef} onClick={editDiagram} onKeyDown={editDiagram}>
            {ready ? <ReactQuill ref={quillRef} theme="snow" value={value} onChange={onChange} className="content-editor-quill" modules={modules} formats={formats} placeholder="글 내용을 작성하세요" /> : <div className="editor-loading">편집기를 불러오는 중...</div>}
            {uploading && <p className="editor-feedback" role="status">이미지를 업로드하는 중...</p>}
            {uploadError && <p className="editor-feedback editor-feedback-error" role="alert">{uploadError}</p>}
            {diagram && <MermaidDialog initialSource={diagram.source} onClose={closeDiagram} onApply={applyDiagram} />}
        </div>
    );
}
