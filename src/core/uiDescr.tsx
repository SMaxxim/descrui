import React, { ReactElement, ElementType, ReactNode } from "react";
import { mergeStyle } from "./styleUtils";

export interface StyleProps extends React.CSSProperties {
};

export class DataProps {
};

export class EventProps {
    onClick?: React.MouseEventHandler;
}

export type StyleType<T extends UIDescr> = T[keyof {__styleType: any}];
export type DataType<T extends UIDescr> = T[keyof {__dataType: any}];
export type EventsType<T extends UIDescr> = T[keyof {__eventsType: any}];
export type DsImplArgs<T extends UIDescr> = {
    style: StyleType<T>, 
    data: DataType<T>, 
    events: EventsType<T>,
    childrenImplArgs: DsImplArgsMap 
} 

export type UIImplArgs<S extends StyleProps = StyleProps, D extends DataProps = DataProps, E extends EventProps = EventProps> = DsImplArgs<UIDescr<S, D, E>>;

export type SimpleDsImplArgs<T extends UIDescr = any> = Omit<DsImplArgs<T>, 'childrenImplArgs'>;

export const emptyImplArgs = (): SimpleDsImplArgs => {
    return {
        style: {},
        data: {},
        events: {}
    }
}

export class DsImplArgsMap {

    private map?: Map<UIDescr, SimpleDsImplArgs>;

    getImpArgs(descr: UIDescr, extraStyle?: StyleProps): DsImplArgs<any> {
        const args = this.map ? this.map.get(descr) : emptyImplArgs();
        return { 
            ...mergeStyle(
                args? args : emptyImplArgs(),
                extraStyle), 
            childrenImplArgs: this
        };
    }

    add(descr: UIDescr, implArgs: SimpleDsImplArgs) {
        if (!this.map) {
            this.map = new Map<UIDescr, SimpleDsImplArgs>();
        }
        this.map.set(descr, implArgs);
    }

    resolveDescr(descr: UIDescr, extraStyle?: StyleProps): ReactElement {
        return descr.resolve(this.getImpArgs(descr, extraStyle));
    }

}

export const createDsImplArgsMap = (): DsImplArgsMap => {
    return new DsImplArgsMap();
}

type DescrArgs<T> = {[index in keyof T]?: T[index]};

const uiImplArgs = (args: DsImplArgs<any>) => {
    return { style: args.style,  }

}

export function implArgs2props<T extends UIDescr>(args: DsImplArgs<T>): any {
    if (args)
        return {
            ...args.style,
            ...args.data,
            ...args.events,
            style: args.style}
    else return {
    }
}

export type TDefImplFunc<
    S extends StyleProps = StyleProps,
    D extends DataProps = DataProps, 
    E extends EventProps = EventProps 
> = (implArgs: UIImplArgs<S, D, E>) => ReactElement;


export const makeDefImplFunc = (type: ElementType, childrenFunc: (implArgs: DsImplArgs<any>) => any[] = () => []): TDefImplFunc => {
    return (implArgs: UIImplArgs): ReactElement => {
        return React.createElement(type, implArgs2props(implArgs), ...childrenFunc(implArgs))
    }
}

export type TResolveFunc<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    >  
> = (descr: T, args: DsImplArgs<T>) => ReactElement | null 

export interface IUIDescrToImplRule<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    >
> {
    _descrType: {new ():T};
    resolve: (descr: T, args: DsImplArgs<T>) => ReactElement | null;
}

export interface IUIDescrToImplRules {
    add: <T extends UIDescr>(rule: IUIDescrToImplRule<T>) => IUIDescrToImplRules;
    resolve: <
        T extends UIDescr<
            StyleType<T>, 
            DataType<T>, 
            EventsType<T>
        >  
    >(descr: T, args: DsImplArgs<T>) => ReactElement | null;
}


export class UIDescr<
    S extends StyleProps = StyleProps,
    D extends DataProps = DataProps, 
    E extends EventProps = EventProps> {
    
    public static globalDescrToImplRules: IUIDescrToImplRules;

    readonly __styleType!: S;
    readonly __dataType!: D;
    readonly __eventsType!: E;

    protected defImplFunc?: TDefImplFunc;

    public parent?: GroupDescr<any, any, any>;

    defaultImpl(implArgs: UIImplArgs<S, D, E>): ReactElement {
        if (this.defImplFunc)
            return this.defImplFunc(implArgs)
        else 
            return <div {...implArgs2props(implArgs)}></div> 
    }

    public resolve(
        args: DsImplArgs<UIDescr<S, D, E>>, 
        rules: IUIDescrToImplRules = UIDescr.globalDescrToImplRules): ReactElement {

        let res = rules.resolve(this, args);
        if (!res) {
            res = this.defaultImpl(args)
        }
        return res;
    }
}

/**
 * Description of layout all the sub elements of ILayoutDescr.descr
 *
 * @export
 * @interface ILayoutDescr
 */
export interface ILayoutDescr {
    /**
     *  All the sub elements which will be layouted here
     *
     * @returns {GroupItem[]}
     * @memberof ILayoutDescr
     */
    items():  GroupItems;
}

export type TResolveLayoutDescrFunc<T extends ILayoutDescr> = 
    (items: GroupItems, 
        implArgsMap: DsImplArgsMap,
        layoutDescr: T, 
        rules?: IUIDescrToImplRules
    ) => ReactElement;

export type TLayoutImpl<T extends ILayoutDescr> = 
    { resolve: TResolveLayoutDescrFunc<T> } | 
    TResolveLayoutDescrFunc<T>;

export interface ILayoutDescrToImplRule<T extends ILayoutDescr, IT extends TLayoutImpl<T>> {
    _descrType: {new (descr: UIDescr):T};
    _impl: IT;

    resolve: (layoutDescr: T)  => IT;
}

export interface ILayoutDescrToImplRules {
    add: (rule: ILayoutDescrToImplRule<any, any>) => ILayoutDescrToImplRules;
    resolve: <T extends ILayoutDescr>(
        layoutDescr: T
    ) => TLayoutImpl<T>;
}

export const resolveLayoutDescr = <T extends ILayoutDescr>(
    layoutDescr: T, 
    items: GroupItems,
    implArgsMap: DsImplArgsMap,
    rules: ILayoutDescrToImplRules = GroupDescr.globalLayoutRules): ReactElement => {

    let impl: TLayoutImpl<T> = rules.resolve(layoutDescr);
    if (impl instanceof Function) {
        return impl(items, implArgsMap, layoutDescr);
    }
    else 
        return impl.resolve(items, implArgsMap, layoutDescr);
}

export type GroupItems = UIDescr[] | ReactNode;

export class GroupDescr<
    S extends StyleProps = StyleProps,
    D extends DataProps = DataProps, 
    E extends EventProps = EventProps> extends UIDescr<S, D, E> {

    public static globalLayoutRules: ILayoutDescrToImplRules;
    public static defaultLayoutDescr: new (items: GroupItems) => ILayoutDescr;
        
    public readonly children: GroupItems;
    public layoutDescr?: ILayoutDescr;
    public rules: ILayoutDescrToImplRules;

    constructor(
        children: GroupItems | ILayoutDescr, 
        rules: ILayoutDescrToImplRules = GroupDescr.globalLayoutRules) {

        super();
        if (children instanceof Array) {
            this.children = children;
        } else if ((children as ILayoutDescr).items) {
            this.layoutDescr = children as ILayoutDescr;
            this.children = (children as ILayoutDescr).items();
        }
        this.rules = rules;
        if (children && this.children instanceof Array) {
            for (const item of this.children) {
                if (item instanceof UIDescr) {
                    item.parent = this;
                }
            }
        }
    }

    resolveGroupLayout = (childrenImplArgs: DsImplArgsMap): ReactElement => {
        let ldescr = this.layoutDescr!;
        if (!this.layoutDescr) {
            ldescr = new GroupDescr.defaultLayoutDescr(this.children);
        }
        return resolveLayoutDescr(ldescr, this.children, childrenImplArgs, this.rules);
    }

    defaultImpl(implArgs: UIImplArgs<S, D, E>): ReactElement { 
        return this.resolveGroupLayout(implArgs.childrenImplArgs);
    }
}

export function descr<T extends UIDescr>(_constr: new () => T, args?: { [key in keyof T]?: T[key]}): T {
    let res = new _constr();
    if (args)
        Object.assign(res, args);
    return res;
}

export type TDescrCreateFunc<T extends UIDescr> = (args?: { [key in keyof T]?: T[key]}) => T;

export function makeCreateDescrFunc<T extends UIDescr>(_constr: new () => T): TDescrCreateFunc<T> {
    return (args?: { [key in keyof T]?: T[key]}) => {
        return descr(_constr, args)
    }
}

type DescrProps<T> = {
    [key in keyof T]?: T[key];
}


export function makeDescrFC<T extends UIDescr>(_constr: new () => T):
    (props: DescrProps<T> & Partial<SimpleDsImplArgs<T>>) => ReactElement {
    return (props: DescrProps<T> & Partial<SimpleDsImplArgs<T>>): ReactElement => {
        let res = descr(_constr, props);
        return res.resolve(props as any);
    }
};

export function groupDescr<T extends GroupDescr>(
    _constr: new (children: GroupItems | ILayoutDescr, rules: ILayoutDescrToImplRules) => T, 
    children: GroupItems | ILayoutDescr,
    args?: { [key in keyof T]?: T[key]}, 
    rules: ILayoutDescrToImplRules = GroupDescr.globalLayoutRules): T {
    let res = new _constr(children, rules);
    if (args)
        Object.assign(res, args);
    return res;
}

export function group(
    children: GroupItems | ILayoutDescr,
    args?: { [key in keyof GroupDescr]?: GroupDescr[key]}, 
    rules: ILayoutDescrToImplRules = GroupDescr.globalLayoutRules): GroupDescr {
    let res = new GroupDescr(children, rules);
    if (args)
        Object.assign(res, args);
    return res;
}

export type TGroupDescrCreateFunc<T extends GroupDescr> = (
    children: GroupItems | ILayoutDescr,
    args?: { [key in keyof T]?: T[key]}, 
    rules?: ILayoutDescrToImplRules) => T;

export function makeCreateGroupDescrFunc<T extends GroupDescr>(
    _constr: new (
        children: GroupItems | ILayoutDescr, 
        rules?: ILayoutDescrToImplRules) => T): TGroupDescrCreateFunc<T> {

    return (
        children: GroupItems | ILayoutDescr,
        args?: { [key in keyof T]?: T[key]}, 
        rules?: ILayoutDescrToImplRules) => {
        return groupDescr(_constr, children, args)
    }
}

type GroupDescrProps<T> = {
    [key in Exclude<keyof T, 'children'>]?: T[key];
}

export function makeGroupDescrFC<T extends GroupDescr>(_constr: new (children: GroupItems | ILayoutDescr) => T):
    (props: GroupDescrProps<T> & Partial<SimpleDsImplArgs<T>> & { children: ReactNode }) => ReactElement {
    return (props: GroupDescrProps<T> & Partial<SimpleDsImplArgs<T>> & { children: ReactNode }): ReactElement => {
        let res = groupDescr(_constr, props.children, props as any);
        return res.resolve(props as any);
    }
};
