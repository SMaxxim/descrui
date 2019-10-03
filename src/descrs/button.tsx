import { StyleProps, DataProps, UIDescr, makeDefImplFunc, DsImplArgs, makeCreateDescrFunc, StyleType, SimpleDsImplArgs, makeDescrFC } from "../core/uiDescr";
import { ReactElement } from "react";
import React from "react";
import { Style } from "../core/uiImpl";

export interface ButtonStyle extends StyleProps {
    buttonColor?: number;
}

export interface ButtonData extends DataProps {
    text?: string;
}


export class Button extends UIDescr<ButtonStyle, ButtonData> {
    text?: string;


    defImplFunc = makeDefImplFunc('button', (implArgs: DsImplArgs<Button>) => [implArgs.data && implArgs.data.text ? implArgs.data.text : this.text]);
}

export const button = makeCreateDescrFunc(Button);
export const ButtonDescr = makeDescrFC(Button);

