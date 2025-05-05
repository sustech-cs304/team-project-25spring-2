'use client';

import React, { Suspense, use, useEffect, useState } from "react";
import { Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { PDFPart } from "@/components/pdf/PDFPart";
import { PDFProvider, usePDFContext } from "@/components/pdf/PDFEnvProvider";
import MonacoEditorComponent from "@/components/coding/MonacoEditor";
import { motion } from "framer-motion";
import { random } from "lodash";
import { useMaterial, useNote, useSnippets } from "@/app/slides/[id]/swr";
import { CommentsSection } from "@/app/slides/[id]/Comments";
import { toast } from "sonner";
import { useUserContext } from "@/app/UserEnvProvider";
import { v4 as uuidv4 } from 'uuid';
import { AIChatButton } from '@/components/ai/AIChatButton';

const EditorComp = dynamic(() =>
    import('../../../components/editors/markdown-editor'), { ssr: false });

function PDFSection({ url, materialId }: { url: string, materialId: string }) {
    const {
        pageNumber,
        setPageNumber,
        numPages,
        setNumPages,
        setCurrentSnippet,
        snippets,
        setSnippets
    } = usePDFContext();
    const [width, setWidth] = useState<number>(200);
    const containerRef = React.createRef<HTMLDivElement>();
    const [isAddingSnippet, setIsAddingSnippet] = useState<boolean>(false);
    const { isTeacher } = useUserContext();
    const { token } = useUserContext();

    const handleFeedback = async (feedback: any) => {
        if (feedback.pageNumber) {
            setPageNumber(feedback.pageNumber);
            if (feedback.numPages)
                setNumPages(feedback.numPages);
        }
        if (feedback.snippets) {
            setSnippets(feedback.snippets);
        }
        if (feedback.currentSnippet) {
            setCurrentSnippet(feedback.currentSnippet);
        }
        if (feedback.clickPosition) {
            if (isAddingSnippet) {
                const newSnippet = {
                    text: 'console.log(\'Hello\')',
                    position: feedback.clickPosition,
                    page: feedback.pageNumber,
                    id: uuidv4(),
                    lang: 'javascript'
                };

                setSnippets([...snippets, newSnippet]);
                setIsAddingSnippet(false);

                // Save the new snippet to backend
                const formData = new FormData();
                formData.append('content', newSnippet.text);
                formData.append('lang', newSnippet.lang);
                formData.append('position_x', String(newSnippet.position.x));
                formData.append('position_y', String(newSnippet.position.y));

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/snippet/${materialId}/page/${newSnippet.page}`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        toast.success("Snippet added");
                    } else {
                        toast.error("Failed to add snippet");
                        console.error("Error adding snippet:", response);
                        setSnippets(snippets.filter(s => s.id !== newSnippet.id));
                    }
                } catch (error) {
                    console.error("Error adding snippet:", error);
                    toast.error("Error adding snippet");
                    setSnippets(snippets.filter(s => s.id !== newSnippet.id));
                }
            }
        }

        // Handle snippet deletion
        if (feedback.deleteSnippet && feedback.deleteSnippet.id) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${feedback.deleteSnippet.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // Update local state
                    setSnippets(snippets.filter(s => s.id !== feedback.deleteSnippet.id));
                    toast.success("Snippet deleted successfully");
                } else {
                    toast.error("Failed to delete snippet");
                }
            } catch (error) {
                console.error("Error deleting snippet:", error);
                toast.error("Error deleting snippet");
            }
        }
    };
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const newWidth = entry.contentRect.width;
                setWidth(newWidth);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);
    return (<div className="h-2/3 flex flex-col" ref={containerRef}>
        <PDFPart props={{ url: url, pageNumber: pageNumber, width: width }}
            onFeedbackAction={handleFeedback} />
        <div className="pl-0.5 mt-2 grid grid-cols-3">
            <div className="col-span-2">
                Page {pageNumber} / {numPages}
            </div>
            <div className="text-right">
                <Button className={`${isTeacher ? 'h-6 text-xs' : 'hidden'}`} onClick={() => {
                    setIsAddingSnippet(!isAddingSnippet);
                    toast.info("Click on the PDF to add a snippet");
                }}>
                    Add Snippet
                </Button>
            </div>
        </div>
    </div>);
}

function CodeSnippetEditor({ materialId }: { materialId: string }) {
    const { currentSnippet, setCurrentSnippet, snippets, setSnippets } = usePDFContext();
    const { isTeacher } = useUserContext();
    const [title, setTitle] = useState<string>('');
    const [editor, setEditor] = useState<any>(null);
    const [snippetContent, setSnippetContent] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
    const { token } = useUserContext();
    const { note } = useNote(materialId, token);
    const [executionResult, setExecutionResult] = useState<{ result: string; error: string | null }>({ result: '', error: null });
    const [showResults, setShowResults] = useState<boolean>(false);

    useEffect(() => {
        if (currentSnippet.page === 0 || currentSnippet.id === '') {
            setTitle('Please select a snippet to edit');
            return;
        } else {
            setTitle(`Snippet on page ${currentSnippet.page}`);
            setSnippetContent(note?.content || currentSnippet.text);
            setSelectedLanguage(currentSnippet.lang || 'javascript');
        }
        updateEditor();
    }, [currentSnippet, note]);

    const updateEditor = () => {
        setEditor(<MonacoEditorComponent
            initialData={currentSnippet.text}
            language={selectedLanguage}
            onSave={(value) => setSnippetContent(value)}
        />);
    };

    useEffect(() => {
        if (currentSnippet.id) {
            updateEditor();
        }
    }, [selectedLanguage]);

    const saveSnippet = async () => {
        if (!currentSnippet.id) return;

        try {
            // Update local state first
            const updatedSnippet = {
                ...currentSnippet,
                text: snippetContent,
                lang: selectedLanguage
            };

            const updatedSnippets = snippets.map(s =>
                s.id === currentSnippet.id ? updatedSnippet : s
            );

            setSnippets(updatedSnippets);
            setCurrentSnippet(updatedSnippet);

            // Prepare form data
            const formData = new FormData();
            formData.append('content', snippetContent);
            formData.append('lang', selectedLanguage);
            formData.append('snippet_id', currentSnippet.id);
            formData.append('position_x', String(currentSnippet.position.x));
            formData.append('position_y', String(currentSnippet.position.y));

            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/snippet/${materialId}/page/${currentSnippet.page}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success("Snippet saved successfully");
            } else {
                toast.error("Failed to save snippet");
            }
        } catch (error) {
            console.error("Error saving snippet:", error);
            toast.error("Error saving snippet");
        }
    };

    const executeSnippet = async () => {
        if (!currentSnippet.id) return;

        try {
            setShowResults(true);
            setExecutionResult({ result: 'Executing...', error: null });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/execute/snippet/${currentSnippet.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.error) {
                    toast.error(`Execution Error`);
                    setExecutionResult({ result: data.result || '', error: data.error });
                } else {
                    setExecutionResult({ result: data.result, error: null });
                }
            } else if (response.status === 404) {
                toast.error("No code snippet record found for current user");
                setExecutionResult({ result: '', error: 'No code snippet record found for current user' });
            } else {
                toast.error("Failed to execute code snippet");
                setExecutionResult({ result: '', error: 'Failed to execute code snippet' });
            }
        } catch (error) {
            console.error("Error executing snippet:", error);
            toast.error("Error executing snippet");
            setExecutionResult({ result: '', error: 'Error executing snippet' });
        }
    };

    const languages = [
        "python", "java", "c", "cpp", "javascript", "typescript",
    ];

    return (
        <div className={"h-full flex flex-col w-full"}>
            <div className="text-sm mb-3 grid grid-cols-4 w-full items-center">
                <div className={`${currentSnippet.id ? 'col-span-2' : 'col-span-3'}`}>{title}</div>
                <div className={`${currentSnippet.id ? 'col-span-1' : 'hidden'}`}>
                    {currentSnippet.id && (
                        <select
                            className="w-full h-6 px-2 rounded border border-gray-300 bg-background text-xs"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            aria-label="Programming language"
                            id="snippet-language-selector"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className={"text-right"}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 size-4"
                        disabled={editor == null || !currentSnippet.id}
                        onClick={saveSnippet}
                    >
                        <Save />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 size-4"
                        disabled={editor == null || !currentSnippet.id}
                        onClick={executeSnippet}
                    >
                        <Play />
                    </Button>
                </div>
            </div>
            <div className="flex flex-col h-full">
                <div className={`${showResults ? 'h-3/4' : 'h-full'}`}>
                    {editor}
                </div>
                {showResults && (
                    <div className="h-1/4 mt-3 overflow-auto">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">Execution Results</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResults(false)}
                                className="h-6 text-xs"
                            >
                                Close
                            </Button>
                        </div>
                        <div className="border rounded-md p-3 bg-muted/50 h-[calc(100%-30px)] overflow-auto">
                            {executionResult.error ? (
                                <div className="text-red-500 whitespace-pre-wrap overflow-auto">
                                    <div className="font-medium mb-1">Error:</div>
                                    <div className="text-xs">{executionResult.error}</div>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap overflow-auto">
                                    <div className="font-medium mb-1">Result:</div>
                                    <div className="text-xs">{executionResult.result}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function Slides({ params }: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = use(params);
    const { token } = useUserContext();
    const { material } = useMaterial(resolvedParams.id, token);
    const { note } = useNote(resolvedParams.id, token);
    const { snippets: fetchedSnippets } = useSnippets(resolvedParams.id, token);
    const [noteId, setNoteId] = useState<string>('');
    const [mdNote, setMdNote] = useState<string>(`Hello **world**!`);
    const { snippets, setSnippets } = usePDFContext();

    useEffect(() => {
        if (note) {
            setMdNote(note.content);
            setNoteId(note.id);
        }
    }, [note]);

    useEffect(() => {
        if (fetchedSnippets && fetchedSnippets.length > 0) {
            const formattedSnippets = fetchedSnippets.map((snippet: {
                content: string;
                position: { x: number; y: number };
                page: number;
                snippet_id: string;
                lang: string;
            }) => ({
                text: snippet.content,
                position: snippet.position,
                page: snippet.page,
                id: snippet.snippet_id,
                lang: snippet.lang
            }));
            setSnippets(formattedSnippets);
        }
    }, [fetchedSnippets, setSnippets]);

    async function saveMdNote(markdown: string) {
        const { token } = useUserContext();

        setMdNote(markdown);

        const formData = new FormData();
        formData.append('content', markdown);
        formData.append('material_id', material.material_id);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note/${noteId}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            console.log("Note saved!");
        } else {
            toast("Failed to save note.");
        }
    }

    const handleAIMessage = async (message: string) => {
        const { token } = useUserContext();

        try {
            const formData = new FormData();
            formData.append('message', message);
            if (material?.material_id) {
                formData.append('material_id', material.material_id);
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error in AI chat:', error);
            throw error;
        }
    };

    return (
        <motion.div className="p-5 rounded-[var(--radius)] border-1 h-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={70} className="col-span-2 h-full flex flex-col pr-5">
                    <PDFSection url={material?.data} materialId={material?.material_id || ''} />
                    <CommentsSection id={resolvedParams.id} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={30} className="pl-5 h-full">
                    <Tabs defaultValue="snippets" className="w-full h-full">
                        <TabsList>
                            <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>
                        <TabsContent value="snippets" className="h-full">
                            <CodeSnippetEditor materialId={material?.material_id || ''} />
                        </TabsContent>
                        <TabsContent value="notes" className="h-full">
                            <Suspense fallback={null}>
                                <EditorComp heightMode="auto" markdown={mdNote === undefined ? '' : mdNote} onChange={saveMdNote} />
                            </Suspense>
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
            <AIChatButton materialId={material?.material_id} />
        </motion.div>
    );
}
