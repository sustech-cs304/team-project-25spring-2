import React, {createContext, useContext, useState} from 'react';

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
};

const PDFContext = createContext<PDFContextType>({
    pageNumber: 1,
    setPageNumber: () => {
    },
    numPages: 1,
    setNumPages: () => {
    },
    currentSnippet: {text: '', position: {x: 0, y: 0}, page: 0, id: '', lang: ''},
    setCurrentSnippet: () => {
    },
    snippets: [],
    setSnippets: () => {
    },
    usersInfo: [],
    setUsersInfo: () => {
    }
});

export const usePDFContext = () => useContext(PDFContext);

export const PDFProvider = ({children}: { children: React.ReactNode }) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [currentSnippet, setCurrentSnippet] = useState({
        text: '',
        position: {x: 0, y: 0},
        page: 0,
        id: '',
        lang: ''
    });
    const [snippets, setSnippets] = useState<SnippetsData>([]);
    const [usersInfo, setUsersInfo] = useState<any[]>([]);

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
                        setUsersInfo
                    }}>
                {children}
            </PDFContext.Provider>
    );
};