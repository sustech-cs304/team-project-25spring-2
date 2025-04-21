import useSWR from "swr";

export type AppSidebarItem = {
    title: string;
    url: string;
    type: "coding" | "slides" | "classes" | "home";
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const getAppSidebarItems = () => {
    const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + "/sidebar", fetcher);
    return {
        data: data as AppSidebarItem[],
        error,
        isLoading
    };
}