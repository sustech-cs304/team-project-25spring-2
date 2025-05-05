import useSWR from "swr";

export type AppSidebarItem = {
    title: string;
    url: string;
    type: "coding" | "slides" | "classes" | "home";
}

const fetcher = (url: string, token: string | null) => {
    return fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then((res) => res.json());
};

export const getAppSidebarItems = (token: string | null) => {
    const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + "/sidebar",
        (url) => fetcher(url, token));
    return {
        data: data as AppSidebarItem[],
        error,
        isLoading
    };
}