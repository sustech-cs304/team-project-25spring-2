import React, {createContext, useContext, useState} from 'react';

const PDFContext = createContext<{
    pageNumber: number;
    setPageNumber: (pageNumber: number) => void;
    numPages: number;
    setNumPages: (numPages: number) => void;
}>({
    pageNumber: 1,
    setPageNumber: () => {
    },
    numPages: 1,
    setNumPages: () => {
    },
});

export const usePDFContext = () => useContext(PDFContext);

export const PDFProvider = ({children}: { children: React.ReactNode }) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(1);

    return (
            <PDFContext.Provider value={{pageNumber, setPageNumber, numPages, setNumPages}}>
                {children}
            </PDFContext.Provider>
    );
};