import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function extractFirst6(str: string) {
    try {
        return str.slice(0, 6);
    } catch (e) {
        return String(str);
    }
}