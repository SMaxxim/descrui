import { StyleProps, UIDescr, makeDefImplFunc, makeCreateDescrFunc } from "../core/uiDescr";

export interface H1Style extends StyleProps {
}

export class H1 extends UIDescr<H1Style> {
    text?: String;

    defImplFunc = makeDefImplFunc('h1', () => [this.text]);

}

export const h1 = makeCreateDescrFunc(H1);
