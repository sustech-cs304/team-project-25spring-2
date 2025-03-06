import React from "react";

export default function Slides() {
    return (
            <div className="p-5 rounded-[var(--radius)] border-1 grid grid-cols-3 gap-4 h-full">
                <div className="col-span-2">
                    <div className="h-fit rounded-[var(--radius)] border-1">
                        <div className="h-[600px] bg-sky-900"></div>
                    </div>
                </div>
                <div className="">Right</div>
            </div>
    );
}
