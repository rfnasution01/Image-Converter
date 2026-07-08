import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TiptapEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  className?: string;
};

export function TiptapEditor({ value = '', onChange, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: { class: 'min-h-40 prose prose-sm dark:prose-invert max-w-none p-3 focus:outline-none' },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  return (
    <div className={cn('overflow-hidden rounded-md border bg-background', className)}>
      <div className="flex flex-wrap gap-2 border-b p-2">
        <Button type="button" size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor?.chain().focus().toggleBulletList().run()}>List</Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
