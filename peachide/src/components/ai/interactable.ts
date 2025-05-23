import React, { Component, cloneElement, ReactElement, RefObject } from "react";
import PropTypes from "prop-types";
import interact from "interact.js";

interface InteractableProps {
    children: ReactElement;
    draggable?: boolean;
    draggableOptions?: object;
    dropzone?: boolean;
    dropzoneOptions?: object;
    resizable?: boolean;
    resizableOptions?: object;
}

export default class Interactable extends Component<InteractableProps> {
    static defaultProps = {
        draggable: false,
        dropzone: false,
        resizable: false,
        draggableOptions: {},
        dropzoneOptions: {},
        resizableOptions: {}
    };

    node: HTMLElement | null = null;
    interactable: any;

    render() {
        const { children } = this.props;
        if (React.isValidElement(children)) {
            if (typeof children.type === 'string') {
                return cloneElement(children as React.ReactElement<any>, {
                    ref: (node: HTMLElement | null) => {
                        this.node = node;
                    },
                    draggable: false
                });
            } else {
                console.warn("Interactable child is not a DOM element; ref and draggable not attached.");
                return children;
            }
        } else {
            console.warn("Interactable child is not a valid React element and cannot accept a ref.");
            return children;
        }
    }

    componentDidMount() {
        if (this.node) {
            this.interactable = interact(this.node);
            this.setInteractions();
        }
    }

    componentWillUnmount() {
        if (this.interactable) {
            this.interactable.unset();
        }
    }

    setInteractions() {
        if (this.props.draggable) {
            this.interactable.draggable(this.props.draggableOptions);
        }
    }
}

Interactable.propTypes = {
    children: PropTypes.node.isRequired,
    draggable: PropTypes.bool,
    draggableOptions: PropTypes.object,
    dropzone: PropTypes.bool,
    dropzoneOptions: PropTypes.object,
    resizable: PropTypes.bool,
    resizableOptions: PropTypes.object
};

export function dragMoveListener(event: any) {
    // the element we are moving
    const target = event.target;
    // Add the relative position to current position of the div
    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // translate the element to new position
    target.style.webkitTransform = target.style.transform =
        "translate(" + x + "px, " + y + "px)";

    // update the posiion attributes
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);

    // These two lines is very important for the next section
    event.stopImmediatePropagation();
    return [x, y];
}