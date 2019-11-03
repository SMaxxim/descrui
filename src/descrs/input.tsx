import { StyleProps, DataProps, UIDescr, makeDefImplFunc, DsImplArgs, makeCreateDescrFunc, StyleType, ImplArgs, makeDescrFC } from "../core/uiDescr";
import { ReactElement } from "react";
import React from "react";
import { Style } from "../core/uiImpl";

export interface InputStyle extends StyleProps {
}

export interface InputData extends DataProps {
    value?: string;
}

export class Input extends UIDescr<InputStyle, InputData> {
    label?: string;
    placeholder?: string;

    defImplFunc = makeDefImplFunc('input');
}

export const input = makeCreateDescrFunc(Input);
export const InputDescr = makeDescrFC(Input);
