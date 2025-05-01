"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

import { Toggle } from "./ui/toggle"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Separator } from "./ui/separator"

import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    CheckSquare,
    Image as ImageIcon,
    Link as LinkIcon,
    Code,
    Quote,
    Undo,
    Redo,
    Upload,
    ChevronDown,
    ChevronUp,
    Menu
} from "lucide-react"

interface RichTextEditorProps {
    content: string
    onChange: (html: string) => void
    placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
    const [imageUrl, setImageUrl] = useState('')
    const [linkUrl, setLinkUrl] = useState('')
    const [linkOpen, setLinkOpen] = useState(false)
    const [showFullToolbar, setShowFullToolbar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image,
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[300px] max-w-full px-4 py-2',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    const addImage = useCallback(() => {
        if (imageUrl && editor) {
            editor.chain().focus().setImage({ src: imageUrl }).run()
            setImageUrl('')
        }
    }, [editor, imageUrl])

    const setLink = useCallback(() => {
        if (linkUrl && editor) {
            editor.chain().focus().setLink({ href: linkUrl }).run()
            setLinkUrl('')
            setLinkOpen(false)
        }
    }, [editor, linkUrl])

    const uploadImage = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && editor) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                if (result) {
                    editor.chain().focus().setImage({ src: result }).run()
                }
            }
            reader.readAsDataURL(file)
            // Reset input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }, [editor])

    if (!editor) {
        return null
    }

    const toggleToolbar = () => {
        setShowFullToolbar(!showFullToolbar)
    }

    return (
        <div className="border rounded-md relative flex flex-col">
            {/* Minimal Toolbar - Always Visible */}
            <div className="flex items-center justify-between bg-slate-50 p-2 border-b">
                <div className="flex items-center gap-2">
                    <Toggle
                        pressed={editor.isActive('bold')}
                        onPressedChange={() => editor.chain().focus().toggleBold().run()}
                        size="sm"
                        aria-label="Toggle bold"
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        pressed={editor.isActive('italic')}
                        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                        size="sm"
                        aria-label="Toggle italic"
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        pressed={editor.isActive('bulletList')}
                        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                        size="sm"
                        aria-label="Toggle bullet list"
                    >
                        <List className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        pressed={editor.isActive('taskList')}
                        onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
                        size="sm"
                        aria-label="Toggle task list"
                    >
                        <CheckSquare className="h-4 w-4" />
                    </Toggle>

                    <Button size="sm" onClick={uploadImage} type="button" variant="ghost" className="h-8" title="Upload image">
                        <Upload className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleToolbar}
                        className="text-xs flex items-center gap-1"
                    >
                        {showFullToolbar ?
                            <><ChevronUp className="h-3 w-3" /> Less</> :
                            <><ChevronDown className="h-3 w-3" /> More</>
                        }
                    </Button>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="h-8 w-8"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="h-8 w-8"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {/* Expanded Toolbar - Conditionally Visible */}
            {showFullToolbar && (
                <div className="bg-slate-50/70 p-2 border-b gap-1 flex flex-wrap">
                    <div className="flex items-center gap-1">
                        <Toggle
                            pressed={editor.isActive('heading', { level: 1 })}
                            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            size="sm"
                            aria-label="Toggle heading 1"
                        >
                            <Heading1 className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            pressed={editor.isActive('heading', { level: 2 })}
                            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            size="sm"
                            aria-label="Toggle heading 2"
                        >
                            <Heading2 className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            pressed={editor.isActive('heading', { level: 3 })}
                            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            size="sm"
                            aria-label="Toggle heading 3"
                        >
                            <Heading3 className="h-4 w-4" />
                        </Toggle>
                    </div>

                    <Separator orientation="vertical" className="h-8 mx-1" />

                    <div className="flex items-center gap-1">
                        <Toggle
                            pressed={editor.isActive('orderedList')}
                            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                            size="sm"
                            aria-label="Toggle ordered list"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            pressed={editor.isActive('blockquote')}
                            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                            size="sm"
                            aria-label="Toggle quote"
                        >
                            <Quote className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            pressed={editor.isActive('codeBlock')}
                            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                            size="sm"
                            aria-label="Toggle code block"
                        >
                            <Code className="h-4 w-4" />
                        </Toggle>
                    </div>

                    <Separator orientation="vertical" className="h-8 mx-1" />

                    <div className="flex items-center gap-1">
                        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
                            <PopoverTrigger asChild>
                                <Toggle
                                    pressed={editor.isActive('link')}
                                    size="sm"
                                    aria-label="Toggle link"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </Toggle>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="flex flex-col space-y-2">
                                    <Input
                                        type="url"
                                        placeholder="Enter URL"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button size="sm" onClick={setLink}>
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center space-x-1">
                            <Input
                                type="text"
                                placeholder="Image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="h-8 w-40 text-xs"
                            />
                            <Button size="sm" onClick={addImage} type="button" variant="outline" className="h-8">
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="flex-grow min-h-[400px] max-h-[60vh] overflow-y-auto"
            />

            {/* Bubble Menu */}
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="bg-white shadow-lg rounded-md border flex p-1 items-center">
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('bold')}
                            onPressedChange={() => editor.chain().focus().toggleBold().run()}
                        >
                            <Bold className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('italic')}
                            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <Italic className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('link')}
                            onPressedChange={() => setLinkOpen(true)}
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive('heading', { level: 2 })}
                            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        >
                            <Heading2 className="h-4 w-4" />
                        </Toggle>
                    </div>
                </BubbleMenu>
            )}

            {/* Character Count */}
            <div className="p-2 border-t text-xs text-muted-foreground text-right">
                {editor.storage.characterCount?.characters() || 0} characters
            </div>
        </div>
    )
} 