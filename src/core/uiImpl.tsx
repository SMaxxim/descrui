import { DataType, StyleType, EventsType, UIDescr, DsImplArgs, ILayoutDescr, DsImplArgsMap, createDsImplArgsMap, resolveLayoutDescr } from "./uiDescr";
import { PureComponent, ReactElement } from "react";
import React from "react";
import { BaseLayoutDescr } from "./layoutDescr";

export type DescrType<T extends {descr: UIDescr}> = T[keyof {descr: any}];

export type Style<T extends any> = {
    [index in Exclude<keyof T, keyof UIImplStructNonDescrProperties>]?: StyleType<T[index]>;
}

export type Data<T extends any> = {
    [index in Exclude<keyof T, keyof UIImplStructNonDescrProperties>]?: DataType<T[index]>;
}

export type Events<T extends any> = {
    [index in Exclude<keyof T, keyof UIImplStructNonDescrProperties>]?: EventsType<T[index]>;
}

export type Elements<T extends any> = {
    [index in Exclude<keyof T, keyof UIImplStructNonDescrProperties>]: ReactElement;
}

export type UIImplStructNonDescrProperties = {
    descr: UIDescr;
    items: any;
};

export class UIImplStruct<T extends UIDescr<StyleType<T>, DataType<T>, EventsType<T>>> {
    descr: T;

    constructor(descr: T) {
        this.descr = descr;
    }

    items(filterFunc?: (item: UIDescr) => boolean): Map<string, UIDescr> {
        var res = new Map<string, UIDescr>();
        for (const [key, val] of Object.entries(this)) {
            if (key != 'descr' && val instanceof UIDescr) {
                if (!filterFunc || filterFunc(val)) 
                    res.set(key, val);
            }
        }
        return res;
    }

}

export type UIImplPropsType<
    ST extends UIImplStruct<T>, 
    T extends UIDescr = DescrType<ST>> = Partial<DsImplArgs<DescrType<ST>>> & { descr: T, struct: ST};


export class UIImpl<
    ST extends UIImplStruct<T>, 
    T extends UIDescr = DescrType<ST>,
    P extends UIImplPropsType<ST> = UIImplPropsType<ST>
> extends PureComponent<P> {
    
    struct!: ST;

    constructor(args: P) {
        super(args); 
        this.struct = args.struct;
    }

    protected descrLayout = (): ILayoutDescr => 
        new BaseLayoutDescr(this.struct);

    protected descrStyle = (): Style<ST> => ({})

    protected descrData = (): Data<ST> => ({})

    protected descrEvents = (): Events<ST> => ({})

    private _implArgsMap = (): DsImplArgsMap => {
        let style = this.descrStyle();
        let data = this.descrData();
        let events = this.descrEvents();
        let res = createDsImplArgsMap();
        for (const [key, val] of this.struct.items().entries()) {
            let implArgs = {
                style: style[key as keyof Style<ST>],
                data: data[key as keyof Data<ST>],
                events: events[key as keyof Events<ST>] 
            };
            res.add(val, implArgs);
        }
        return res;
    }

    render() {
        let layoutDescr = this.descrLayout();
        return resolveLayoutDescr(layoutDescr, [...this.struct.items().values()], this._implArgsMap());
    }

}
