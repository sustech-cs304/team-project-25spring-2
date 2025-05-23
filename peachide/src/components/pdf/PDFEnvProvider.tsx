import { useUserContext } from '@/app/UserEnvProvider';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export type BookmarkType = {
    list_id: string;
    material_id: string;
    user_id: string;
    page: number;
    bookmark_list: number[];
};

type PDFContextType = {
    pageNumber: number;
    setPageNumber: (pageNumber: number) => void;
    numPages: number;
    setNumPages: (numPages: number) => void;
    currentSnippet: SnippetInfo;
    setCurrentSnippet: (currentSnippet: SnippetInfo) => void;
    snippets: SnippetsData;
    setSnippets: (snippets: SnippetsData) => void;
    usersInfo: any[];
    setUsersInfo: (usersInfo: any[]) => void;
    materialId: string;
    setMaterialId: (materialId: string) => void;
    bookmarks: BookmarkType[];
    setBookmarks: (bookmarks: BookmarkType[]) => void;
    addBookmark: (page: number) => Promise<void>;
    removeBookmark: (page: number) => Promise<void>;
    fetchBookmarks: () => Promise<void>;
};

const PDFContext = createContext<PDFContextType>({
    pageNumber: 1,
    setPageNumber: () => { },
    numPages: 1,
    setNumPages: () => { },
    currentSnippet: { text: '', position: { x: 0, y: 0 }, page: 0, id: '', lang: '' },
    setCurrentSnippet: () => { },
    snippets: [],
    setSnippets: () => { },
    usersInfo: [],
    setUsersInfo: () => { },
    materialId: '',
    setMaterialId: () => { },
    bookmarks: [],
    setBookmarks: () => { },
    addBookmark: async () => { },
    removeBookmark: async () => { },
    fetchBookmarks: async () => { }
});

export const usePDFContext = () => useContext(PDFContext);

export const PDFProvider = ({ children }: { children: React.ReactNode }) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [currentSnippet, setCurrentSnippet] = useState({
        text: '',
        position: { x: 0, y: 0 },
        page: 0,
        id: '',
        lang: ''
    });
    const [snippets, setSnippets] = useState<SnippetsData>([]);
    const [usersInfo, setUsersInfo] = useState<any[]>([]);
    const [materialId, setMaterialId] = useState('');
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
    const { token } = useUserContext();

    const fetchBookmarks = async () => {
        if (!materialId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marklist/${materialId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBookmarks(data.marklists);
            } else {
                toast.error("Failed to fetch bookmarks");
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            toast.error("Error fetching bookmarks");
        }
    };

    const addBookmark = async (page: number) => {
        if (!materialId) return;

        try {
            // First, try to find an existing bookmark list for this material
            const existingBookmark = bookmarks.find(b => b.material_id === materialId);

            if (existingBookmark) {
                // If exists, update the bookmark list
                const updatedBookmarkList = [...existingBookmark.bookmark_list, page];
                const formData = new FormData();
                formData.append('list_id', existingBookmark.list_id);
                formData.append('material_id', materialId);
                formData.append('bookmark_list', JSON.stringify(updatedBookmarkList));

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/marklist/${existingBookmark.list_id}/page/${page}`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                );

                if (response.ok) {
                    toast.success("Bookmark added");
                    await fetchBookmarks();
                } else {
                    toast.error("Failed to add bookmark");
                }
            } else {
                // If no existing bookmark list, create a new one
                const formData = new FormData();
                formData.append('list_id', uuidv4());
                formData.append('material_id', materialId);
                formData.append('bookmark_list', JSON.stringify([page]));

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/marklist/${materialId}/page/${page}`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                );

                if (response.ok) {
                    toast.success("Bookmark added");
                    await fetchBookmarks();
                } else {
                    toast.error("Failed to add bookmark");
                }
            }
        } catch (error) {
            console.error("Error adding bookmark:", error);
            toast.error("Error adding bookmark");
        }
    };

    const removeBookmark = async (page: number) => {
        try {
            const existingBookmark = bookmarks.find(b => b.material_id === materialId);
            if (!existingBookmark) return;
            const updatedBookmarkList = existingBookmark.bookmark_list.filter(p => p !== page);
            const formData = new FormData();
            formData.append('list_id', existingBookmark.list_id);
            formData.append('material_id', materialId);
            formData.append('bookmark_list', JSON.stringify(updatedBookmarkList));

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/marklist/${existingBookmark.list_id}/page/${page}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
            );

            if (response.ok) {
                toast.success("Bookmark removed");
                await fetchBookmarks();
            } else {
                toast.error("Failed to remove bookmark");
            }
        } catch (error) {
            console.error("Error removing bookmark:", error);
            toast.error("Error removing bookmark");
        }
    };

    // Fetch bookmarks when materialId changes
    useEffect(() => {
        if (materialId) {
            fetchBookmarks();
        }
    }, [materialId]);

    return (
        <PDFContext.Provider
            value={{
                pageNumber,
                setPageNumber,
                numPages,
                setNumPages,
                currentSnippet,
                setCurrentSnippet,
                snippets,
                setSnippets,
                usersInfo,
                setUsersInfo,
                materialId,
                setMaterialId,
                bookmarks,
                setBookmarks,
                addBookmark,
                removeBookmark,
                fetchBookmarks,
            }}>
            {children}
        </PDFContext.Provider>
    );
};