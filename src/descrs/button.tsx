import { StyleProps, DataProps, UIDescr, makeDefImplFunc, DsImplArgs, makeCreateDescrFunc, StyleType, ImplArgs, makeDescrFC } from "../core/uiDescr";
import { ReactElement } from "react";
import React from "react";
import { Style } from "../core/uiImpl";
import { dataPropOrDefault } from "../core/dataUtils";

export interface ButtonStyle extends StyleProps {
    buttonColor?: number;
}

export interface ButtonData extends DataProps {
    text?: string;
}


export class Button extends UIDescr<ButtonStyle, ButtonData> {
    text?: string;


    defImplFunc = makeDefImplFunc('button', (implArgs: DsImplArgs<Button>) => [dataPropOrDefault(this, implArgs, 'text')]);
}

export const button = makeCreateDescrFunc(Button);
export const ButtonDescr = makeDescrFC(Button);

