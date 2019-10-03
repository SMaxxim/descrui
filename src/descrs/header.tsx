import { StyleProps, GroupDescr, makeDefImplFunc, DsImplArgs, makeCreateDescrFunc, makeCreateGroupDescrFunc, makeGroupDescrFC } from "../core/uiDescr";


export interface HeaderStyle extends StyleProps {
}

export class Header extends GroupDescr<HeaderStyle> {

    defImplFunc = makeDefImplFunc('header', (implArgs: DsImplArgs<Header>) => [
        this.resolveGroupLayout(implArgs.childrenImplArgs)
    ]);
}

export const header = makeCreateGroupDescrFunc(Header);
export const HeaderDescr = makeGroupDescrFC(Header);
