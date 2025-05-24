"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SmartAvatarProps {
    photo?: string;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

// Convert base64 to data URL if needed
const convertPhotoFormat = (photo?: string): string => {
    if (!photo) return '';

    // If already a data URL or regular URL, return as is
    if (photo.startsWith('data:') || photo.startsWith('http')) {
        return photo;
    }

    // Backend returns pure base64, convert to data URL
    // Detect PNG if it starts with PNG signature, otherwise assume JPEG
    const isPNG = photo.startsWith('iVBORw0KGgo'); // PNG base64 signature
    const mimeType = isPNG ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${photo}`;
};

// Generate initials from name
const getInitials = (name: string): string => {
    return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const SmartAvatar: React.FC<SmartAvatarProps> = ({
    photo,
    name,
    className = "h-10 w-10",
    fallbackClassName = ""
}) => {
    const processedPhoto = convertPhotoFormat(photo);
    const initials = getInitials(name);

    return (
        <Avatar className={className}>
            <AvatarImage src={processedPhoto} alt={name} />
            <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
        </Avatar>
    );
};

export default SmartAvatar; 