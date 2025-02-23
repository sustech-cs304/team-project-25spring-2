import React from "react";

function BodyHome() {
    return "Home";
}

function BodyClasses() {
    return "Classes";
}

function BodyCoding() {
    return "Coding";
}

function BodyGroups() {
    return "Groups";
}

export function SidebarContentBody(props: React.ComponentProps<any>) {
    let content;

    switch (props.pathname) {
        case "/":
            content = <BodyHome />;
            break;
        case "/classes":
            content = <BodyClasses />;
            break;
        case "/coding":
            content = <BodyCoding />;
            break;
        case "/groups":
            content = <BodyGroups />;
            break;
        default:
            content = <div>Not Found</div>;
            break;
    }

    return (
            <div className="mx-4 my-2">
                {content}
            </div>
    );
}