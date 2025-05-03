import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

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
    removeBookmark: (listId: string) => Promise<void>;
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

    const fetchBookmarks = async () => {
        if (!materialId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marklist/${materialId}`);
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
            // First, try to find an existing bookmark list for this page
            const existingBookmark = bookmarks.find(b => b.page === page);

            if (existingBookmark) {
                // If exists, update the bookmark list
                const updatedBookmarkList = [...existingBookmark.bookmark_list, page];
                const formData = new FormData();
                formData.append('list_id', existingBookmark.list_id);
                formData.append('bookmark_list', JSON.stringify(updatedBookmarkList));

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/marklist/${existingBookmark.list_id}/page/${page}`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (response.ok) {
                    const updatedBookmark = await response.json();
                    setBookmarks(bookmarks.map(b =>
                        b.list_id === existingBookmark.list_id ? updatedBookmark : b
                    ));
                    toast.success("Bookmark added");
                } else {
                    toast.error("Failed to add bookmark");
                }
            } else {
                // If no existing bookmark list, create a new one
                const formData = new FormData();
                formData.append('bookmark_list', JSON.stringify([page]));

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/marklist/${materialId}/page/${page}`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (response.ok) {
                    const newBookmark = await response.json();
                    setBookmarks([...bookmarks, newBookmark]);
                    toast.success("Bookmark added");
                } else {
                    toast.error("Failed to add bookmark");
                }
            }
        } catch (error) {
            console.error("Error adding bookmark:", error);
            toast.error("Error adding bookmark");
        }
    };

    const removeBookmark = async (listId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/marklist/${listId}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                setBookmarks(bookmarks.filter(b => b.list_id !== listId));
                toast.success("Bookmark removed");
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