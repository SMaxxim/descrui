import { StyleProps, ImplArgs } from "./uiDescr";
import { ReactElement } from "react";

export const mergeStyle = (implArgs: ImplArgs, style?: StyleProps): ImplArgs => {
    if (implArgs && style) {
        if (implArgs.style) {
            Object.assign(implArgs.style, style);
        }
        else {
            implArgs.style = style;
        }
    }
    return implArgs;
}

export const withStyle = (el: ReactElement, style?: StyleProps): ReactElement => {
    if (!el.props.style) {
        el.props.style = style;
    } else {
        Object.assign(el.props.style, style);
    }
    return el;
}
