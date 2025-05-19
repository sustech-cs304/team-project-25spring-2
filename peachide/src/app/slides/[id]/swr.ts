import useSWR from "swr";
import { useUserContext } from "@/app/UserEnvProvider";

const fetcher = (url: string, token: string | null) => {
    return fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then((res) => res.json());
};

export function useMaterial(id: string, token: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + `/material/${id}`,
        (url) => fetcher(url, token)
    );

    return {
        material: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useComment(id: string, token: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + `/comment/${id}`,
        (url) => fetcher(url, token)
    );

    return {
        comment: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useNote(id: string, token: string | null) {
    const shouldFetch = id !== undefined && id !== '';
    const { data, error, isLoading } = useSWR(
        shouldFetch ? process.env.NEXT_PUBLIC_API_URL + `/note/${id}` : null,
        (url) => fetcher(url, token)
    );

    return {
        note: data,
        isLoading,
        isError: error,
    };
}

export function useSnippets(id: string, token: string | null) {
    const { data, error, isLoading } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + `/snippet/${id}`,
        (url) => fetcher(url, token)
    );

    return {
        snippets: data?.code_snippets || [],
        isLoading,
        isError: error,
    };
}