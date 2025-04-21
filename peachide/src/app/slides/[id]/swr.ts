import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMaterial(id: string) {
    const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + `/material/${id}`, fetcher);

    return {
        material: data,
        isLoading,
        isError: error,
    };
}

export function useComment(id: string) {
    const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + `/comment/${id}`, fetcher);

    return {
        comment: data,
        isLoading,
        isError: error,
    };
}

export function useNote(id: string) {
    const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + `/note/${id}`, fetcher);

    return {
        note: data,
        isLoading,
        isError: error,
    };
}

export function useSnippets(id: string) {
    const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + `/snippet/${id}`, fetcher);

    return {
        snippets: data?.code_snippets || [],
        isLoading,
        isError: error,
    };
}