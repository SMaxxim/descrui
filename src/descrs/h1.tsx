import { StyleProps, UIDescr, makeDefImplFunc, makeCreateDescrFunc, DataProps } from "../core/uiDescr";
import { dataPropOrDefault } from "../core/dataUtils";

export interface H1Style extends StyleProps {
}

export interface H1Data extends DataProps {
    text?: String;
}

export class H1 extends UIDescr<H1Style, H1Data> {
    text?: String;

    defImplFunc = makeDefImplFunc('h1', (args) => [dataPropOrDefault(this, args, 'text')]);

}

export const h1 = makeCreateDescrFunc(H1);
