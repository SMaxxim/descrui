import { ILayoutDescr, UIDescr, GroupDescr, GroupItems } from "./uiDescr";
import { UIImplStruct, Elements } from "./uiImpl";
import { ReactElement } from "react";

export class BaseLayoutDescr implements ILayoutDescr {

    struct: GroupItems | UIImplStruct<any>;

    constructor(struct: GroupItems | UIImplStruct<any>) {
        this.struct = struct;
    }

    items(): GroupItems {
        if (this.struct instanceof Array) {
            return this.struct;
        } else if ((this.struct as UIImplStruct<any>).items) {
            return Array.from((this.struct as UIImplStruct<any>).items(
            // we must avoid of placing the elements who belong to another group
                (item) => (
                    !item.parent || (item.parent === (this.struct as UIImplStruct<any>).descr)
                ))
                .values());
        } else 
            return this.struct;
    }
}

export class LayoutDescrArray implements ILayoutDescr {

    layouts: ILayoutDescr[];

    constructor(layouts: ILayoutDescr[]) {
        this.layouts = layouts;
    }

    static descr(layouts: ILayoutDescr[]): LayoutDescrArray {
        return new LayoutDescrArray(layouts);
    }

    items(): GroupItems {
        const res: any = [];
        for (const item of this.layouts) {
            res.push(item.items());
        }
        return res;
    }

}

export class CustomLayout<T extends UIImplStruct<any> = UIImplStruct<any>> implements ILayoutDescr {
    
    struct: T;
    renderFunc: (elems: Elements<T>) => ReactElement;

    constructor(struct: T, renderFunc: (elems: Elements<T>) => ReactElement) {
        this.struct = struct;
        this.renderFunc = renderFunc;
    }

    items(): GroupItems {
        return [];
    }

}