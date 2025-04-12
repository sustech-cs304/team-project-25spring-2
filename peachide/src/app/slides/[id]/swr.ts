import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMaterial(id: string) {
    const {data, error, isLoading} = useSWR(process.env.NEXT_PUBLIC_API_URL + `/material/${id}`, fetcher);

    return {
        material: data,
        isLoading,
        isError: error,
    };
}

export function useComment(id: string) {
    const {data, error, isLoading} = useSWR(process.env.NEXT_PUBLIC_API_URL + `/comment/${id}`, fetcher);

    return {
        comment: data,
        isLoading,
        isError: error,
    };
}