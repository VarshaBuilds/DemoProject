import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content...",
  className = "",
}) => {
  const quillRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !quillRef.current) {
      import('quill').then(({ default: Quill }) => {
        // Register emoji module if available
        try {
          import('quill-emoji').then((emojiModule) => {
            Quill.register('modules/emoji', emojiModule.default);
          }).catch(() => {
            console.log('Emoji module not available');
          });
        } catch (error) {
          console.log('Emoji module not available');
        }

        const toolbarOptions = [
          [{ 'font': [] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'align': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'color': [] }, { 'background': [] }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean']
        ];

        quillRef.current = new Quill(containerRef.current, {
          theme: 'snow',
          placeholder: placeholder,
          modules: {
            toolbar: {
              container: toolbarOptions,
              handlers: {
                image: function() {
                  const input = document.createElement('input');
                  input.setAttribute('type', 'file');
                  input.setAttribute('accept', 'image/*');
                  input.click();

                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const range = quillRef.current.getSelection();
                        quillRef.current.insertEmbed(range.index, 'image', e.target?.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                }
              }
            }
          }
        });

        // Set initial content
        if (value) {
          quillRef.current.root.innerHTML = value;
        }

        // Listen for text changes
        quillRef.current.on('text-change', () => {
          const html = quillRef.current.root.innerHTML;
          onChange(html);
        });
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={`bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}>
      <div ref={containerRef} className="min-h-[200px]" />
    </div>
  );
};