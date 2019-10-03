import { ILayoutDescr, TLayoutImpl, ILayoutDescrToImplRule, ILayoutDescrToImplRules, GroupDescr, UIDescr } from "./uiDescr";
import { BaseLayoutDescr, LayoutDescrArray, CustomLayout } from "./layoutDescr";
import { baseLayoutImpl, layoutArrayImpl, customLayoutImpl } from "./layoutImpl";

class LayoutDescrToImplRule<
    T extends ILayoutDescr, 
    IT extends TLayoutImpl<T>
> implements ILayoutDescrToImplRule<T, IT> {
    _descrType: {new (descr: UIDescr):T};
    _impl: IT;

    constructor(descrType: {new (descr: UIDescr):T}, _impl: IT) {
        this._descrType = descrType;
        this._impl = _impl;
    }

    resolve = (layoutDescr: T): IT => {
        return this._impl;
    }
}

export class LayoutDescrToImplRules implements ILayoutDescrToImplRules {

    rules: ILayoutDescrToImplRule<any, any>[] = [];

    add = (rule: ILayoutDescrToImplRule<any, any>): ILayoutDescrToImplRules => {
        this.rules.push(rule);
        return this;
    }

    resolve = <T extends ILayoutDescr>(
        layoutDescr: T
    ): TLayoutImpl<T> => {

        for (const rule of this.rules) {
            if (layoutDescr instanceof rule._descrType) {
                let res = rule.resolve(layoutDescr);
                if (res) 
                    return res;
            }
        }
        if (layoutDescr instanceof BaseLayoutDescr) {
            return baseLayoutImpl as TLayoutImpl<T>;
        } else if (layoutDescr instanceof LayoutDescrArray) {
            return layoutArrayImpl as TLayoutImpl<T>;
        } else if (layoutDescr instanceof CustomLayout) {
            return customLayoutImpl as TLayoutImpl<T>;
        } else 
            throw new Error(`cannot find layout implementation for ${layoutDescr.constructor.name}`);
    }

}

export function addLayoutImplRule<
    T extends ILayoutDescr, IT extends TLayoutImpl<T>>
    (descrConstr: {new (descr: UIDescr):T}, 
    impl: IT, rules: ILayoutDescrToImplRules = GroupDescr.globalLayoutRules) {

    rules.add(
        new LayoutDescrToImplRule<T, IT>(descrConstr, impl)
    );    
}


