import { UIDescr, StyleType, EventsType, DataType, IUIDescrToImplRule, DsImplArgs, TResolveFunc, IUIDescrToImplRules } from "./uiDescr";
import { UIImplStruct, UIImpl, UIImplPropsType } from "./uiImpl";
import { ReactElement, Component } from "react";
import React from "react";

export class UIDescrToImplRule<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    > 
> implements IUIDescrToImplRule<T> {
    _descrType: {new ():T};
    
    private _func: (descr: T, args: DsImplArgs<T>) => ReactElement | null;

    constructor(
        descrType: {new (): T}, 
        func: TResolveFunc<T>) {

        this._descrType = descrType;
        this._func = func;
    }

    resolve = (descr: T, args: DsImplArgs<T>): ReactElement | null => {
        return this._func(descr, args);
    }

}

export class UIDescrToImplRules implements IUIDescrToImplRules {

    rules: IUIDescrToImplRule<any>[] = [];

    add = <T extends UIDescr>(rule: IUIDescrToImplRule<T>): UIDescrToImplRules => {
        this.rules.push(rule);
        return this;
    }

    resolve = <T extends UIDescr>(descr: T, args: DsImplArgs<T>): ReactElement | null => {
        for (const rule of this.rules) {
            if (descr instanceof rule._descrType) {
                let res = rule.resolve(descr, args);
                if (res) 
                    return res;
            }
        }
        return null;
    }

}

export function addImplComponent<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    >,
    ST extends UIImplStruct<T>, 
    I extends UIImpl<ST> | React.Component 
> (
    descrConstr: {new ():T}, 
    implConstr: new (args: UIImplPropsType<ST>) => I, 
    rules: IUIDescrToImplRules = UIDescr.globalDescrToImplRules) {

    rules.add(
        new UIDescrToImplRule<T>(descrConstr, 
            (descr: T, args: DsImplArgs<T>): ReactElement => {
                return React.createElement(
                    implConstr as any, 
                    { 
                        descr, 
                        ...args
                    }
                )
            }
    ));
}

export function addImplFunc<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    >,
    ST extends UIImplStruct<T> 
> (
    descrConstr: {new ():T}, 
    implConstr: TResolveFunc<T>, 
    rules: IUIDescrToImplRules = UIDescr.globalDescrToImplRules) {

    rules.add(
        new UIDescrToImplRule<T>(descrConstr, implConstr as TResolveFunc<T>)
    );    
}

