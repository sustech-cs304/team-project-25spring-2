import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Check, ChevronDown, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { chatPresets } from './presets';
import { useUserContext } from '@/app/UserEnvProvider';
import MarkdownRenderer from '@/components/ai/MarkdownRenderer';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Chat {
    chat_id: string;
    user_id: string;
    title: string;
    material_id: string | null;
    messages: Message[];
}

interface AIChatButtonProps {
    materialId?: string;
    className?: string;
}

export function AIChatButton({ materialId, className = '' }: AIChatButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMaterialSelected, setIsMaterialSelected] = useState(false);
    const [showMaterialPrompt, setShowMaterialPrompt] = useState(true);
    const [showPresetDialog, setShowPresetDialog] = useState(false);
    const [showChatList, setShowChatList] = useState(false);
    const { token } = useUserContext();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>('');

    // Fetch chat list when component mounts
    useEffect(() => {
        if (isOpen) {
            fetchChats();
        }
    }, [isOpen]);

    // Fetch messages when current chat changes
    useEffect(() => {
        if (currentChatId) {
            fetchMessages(currentChatId);
        }
    }, [currentChatId]);

    const fetchChats = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setChats(data);
        } catch (error) {
            console.error('Error fetching chats:', error);
            toast.error('Failed to load chat history');
        }
    };

    const fetchMessages = async (chatId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(Array.isArray(data.messages) ? data.messages : []);
            for (const message of data.messages) {
                if (message.content.startsWith("fileid:/")) {
                    setIsMaterialSelected(true);
                    setShowMaterialPrompt(false);
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
            setMessages([]);
        }
    };

    const createNewChat = async (includeMaterial: boolean = false) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to create chat');
            const data = await response.json();
            setCurrentChatId(data.chat_id);
            setMessages([]);
            if (includeMaterial) {
                setIsMaterialSelected(true);
                setShowMaterialPrompt(false);
            } else {
                setIsMaterialSelected(false);
                setShowMaterialPrompt(true);
            }
            await fetchChats();
        } catch (error) {
            console.error('Error creating chat:', error);
            toast.error('Failed to create new chat');
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !currentChatId) return;
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', userMessage);
            if (materialId && isMaterialSelected) {
                formData.append('material_id', materialId);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${currentChatId}/message`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const reader = response.body?.getReader();
            if (reader) {
                let assistantMessage = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = new TextDecoder().decode(value);
                    assistantMessage += chunk;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage?.role === 'assistant') {
                            lastMessage.content = assistantMessage;
                        } else {
                            newMessages.push({ role: 'assistant', content: assistantMessage });
                        }
                        return newMessages;
                    });
                }
                // await fetchMessages(currentChatId);
            } else {
                toast.error('Failed to send message');
                setMessages(prev => prev.filter(m => m.role !== 'user'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m.role !== 'user'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleMaterialSelection = () => {
        setIsMaterialSelected(true);
        setShowMaterialPrompt(false);
    };

    const handlePresetSelect = (preset: string) => {
        setInput(preset);
    };

    // Delete chat handler
    const handleDeleteChat = async (chatId: string) => {
        if (!window.confirm('Are you sure you want to delete this chat?')) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.message === "Chat not found") {
                toast.error('Chat not found');
            } else if (!response.ok) {
                throw new Error('Failed to delete chat');
            } else {
                toast.success(data.message);
                // Remove from local state
                setChats(prev => prev.filter(chat => chat.chat_id !== chatId));
                if (currentChatId === chatId) {
                    setCurrentChatId(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            toast.error('Failed to delete chat');
        }
    };

    // Edit chat title
    const handleEditChatTitle = (chat: Chat) => {
        setEditingChatId(chat.chat_id);
        setEditingTitle(chat.title);
    };
    const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingTitle(e.target.value);
    };
    const handleEditTitleSave = async (chat: Chat) => {
        if (!editingTitle.trim() || editingTitle === chat.title) {
            setEditingChatId(null);
            return;
        }
        try {
            const formData = new FormData();
            formData.append('title', editingTitle);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${chat.chat_id}/name`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to update chat name');
            // Update local chats
            setChats(prev => prev.map(c => c.chat_id === chat.chat_id ? { ...c, title: editingTitle } : c));
            if (currentChatId === chat.chat_id) {
                // If current chat also needs to sync title
                setCurrentChatId(chat.chat_id); // Trigger useEffect if needed
            }
            toast.success('Chat name updated');
        } catch (error) {
            toast.error('Failed to update chat name');
        } finally {
            setEditingChatId(null);
        }
    };
    const handleEditTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, chat: Chat) => {
        if (e.key === 'Enter') {
            handleEditTitleSave(chat);
        } else if (e.key === 'Escape') {
            setEditingChatId(null);
        }
    };

    return (
        <div className={`fixed bottom-8 right-8 z-[5000] ${className}`}>
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-background rounded-lg shadow-lg w-96 h-[600px] flex flex-col border"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold">AI Assistant</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => setShowChatList(!showChatList)}
                                >
                                    {currentChatId ? 'Switch Chat' : 'Select Chat'}
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {showChatList && (
                            <div className="border-b p-2">
                                <div className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            setShowPresetDialog(true);
                                            setShowChatList(false);
                                        }}
                                    >
                                        New Chat
                                    </Button>
                                    {chats.map((chat) => (
                                        <div key={chat.chat_id} className="flex items-center group">
                                            {editingChatId === chat.chat_id ? (
                                                <input
                                                    className="flex-1 border rounded px-2 py-1 text-sm mr-1"
                                                    value={editingTitle}
                                                    autoFocus
                                                    onChange={handleEditTitleChange}
                                                    onBlur={() => handleEditTitleSave(chat)}
                                                    onKeyDown={e => handleEditTitleKeyDown(e, chat)}
                                                    placeholder="Edit chat name"
                                                    aria-label="Edit chat name"
                                                />
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    className="flex-1 justify-start"
                                                    onClick={() => {
                                                        setCurrentChatId(chat.chat_id);
                                                        setShowChatList(false);
                                                    }}
                                                >
                                                    <span className="truncate max-w-[120px]">{chat.title}</span>
                                                </Button>
                                            )}
                                            <button
                                                className="ml-1 p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition"
                                                title="Edit chat name"
                                                onClick={() => handleEditChatTitle(chat)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="ml-1 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                                                title="Delete chat"
                                                onClick={() => handleDeleteChat(chat.chat_id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
                            <DialogTrigger asChild>{/* No trigger here, we open via state */}</DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] z-[6000]">
                                <DialogHeader>
                                    <DialogTitle>Start a New Chat</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            createNewChat();
                                            setShowPresetDialog(false);
                                        }}
                                    >
                                        Empty Chat
                                    </Button>
                                    {chatPresets.map((preset, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                createNewChat(true);
                                                handlePresetSelect(preset.prompt);
                                                setShowPresetDialog(false);
                                            }}
                                        >
                                            {preset.title}
                                        </Button>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <div className="flex-1 p-4 w-full overflow-y-scroll">
                            <div className="space-y-4 w-full">
                                {!currentChatId && (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Chat Selected</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Start a new chat or select an existing one to continue.
                                        </p>
                                        <Button onClick={() => setShowPresetDialog(true)}>
                                            Start New Chat
                                        </Button>
                                    </div>
                                )}
                                {currentChatId && showMaterialPrompt && materialId && (
                                    <div className="border-muted border rounded-lg p-2 mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <Checkbox
                                                id="material-selection"
                                                checked={isMaterialSelected}
                                                onCheckedChange={handleMaterialSelection}
                                                className="h-3 w-3"
                                            />
                                            <label htmlFor="material-selection" className="text-xs">
                                                Include current material
                                            </label>
                                        </div>
                                    </div>
                                )}
                                {currentChatId && Array.isArray(messages) && messages.map((message, index) => (
                                    message.content.startsWith("fileid:/") ? ('') : (
                                        <div
                                            key={index}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] text-sm rounded-lg p-2 ${message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                    }`}
                                            >
                                                <MarkdownRenderer>
                                                    {message.content}
                                                </MarkdownRenderer>
                                            </div>
                                        </div>
                                    )))}
                            </div>
                        </div>

                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={currentChatId ? "Type your message..." : "Select or create a chat to start messaging"}
                                    className="flex-1"
                                    disabled={!currentChatId}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <Button onClick={handleSendMessage} disabled={isLoading || !currentChatId}>
                                    Send
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Button
                            size="icon"
                            className="rounded-full w-10 h-10 shadow-lg"
                            onClick={() => setIsOpen(true)}
                        >
                            <MessageSquare className="h-6 w-6" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 