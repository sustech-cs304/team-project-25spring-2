import React, {createContext, useContext, useState} from 'react';

const PDFContext = createContext<{
    pageNumber: number;
    setPageNumber: (pageNumber: number) => void;
    numPages: number;
    setNumPages: (numPages: number) => void;
    currentSnippet: SnippetInfo;
    setCurrentSnippet: (currentSnippet: SnippetInfo) => void;
}>({
    pageNumber: 1,
    setPageNumber: () => {
    },
    numPages: 1,
    setNumPages: () => {
    },
    currentSnippet: {text: '', position: {x: 0, y: 0}, page: 0, id: '', lang: ''},
    setCurrentSnippet: () => {
    },
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

    return (
            <PDFContext.Provider
                    value={{pageNumber, setPageNumber, numPages, setNumPages, currentSnippet, setCurrentSnippet}}>
                {children}
            </PDFContext.Provider>
    );
};