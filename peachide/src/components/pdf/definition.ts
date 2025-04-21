type SnippetInfo = {
    text: string;
    position: {
        x: number;
        y: number;
    },
    page: number;
    id: string;
    lang: string;
};
type SnippetsData = SnippetInfo[];

interface PDFPartProps {
    props: {
        url: string;
        pageNumber: number;
        numPages?: number;
        width?: number;
        currentSnippet?: string;
    },
    onFeedbackAction: (feedback: any) => void;
}