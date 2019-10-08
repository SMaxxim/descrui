import React, { ReactElement, ElementType, ReactNode } from "react";
import { mergeStyle } from "./styleUtils";


/**
 * style properties of ui element
 *
 * @export
 * @interface StyleProps
 * @extends {React.CSSProperties}
 */
export interface StyleProps extends React.CSSProperties {
    cssClassName?: string;
};

/**
 * data properties of ui element: like text in the button, list of values in the select element
 *
 * @export
 * @class DataProps
 */
export class DataProps {
};

/**
 * events of element, #TODO there is a question whether it needs to inherit it from DOMAttributes
 *
 * @export
 * @interface EventProps
 * @extends {React.DOMAttributes<T>}
 * @template T
 */
export interface EventProps<T = Element> extends React.DOMAttributes<T> {
}

// type for extracting type of __styleType property from UIDescr
// that trick is basic feature of descrui, it helps to separate style properties of element from other properties 
// like this: function<T extends UIDescr>(): StyleType<T> { ... }
export type StyleType<T extends UIDescr> = T[keyof {__styleType: any}];

// type for extracting type of __dataType property from UIDescr
export type DataType<T extends UIDescr> = T[keyof {__dataType: any}];

// type for extracting type of __eventsType property from UIDescr
export type EventsType<T extends UIDescr> = T[keyof {__eventsType: any}];

// implementation details of ui element 
// #TODO there is a question whether it needed to have childrenImplArgs property, 
// now it needed because GroupDescr is inheritor of UIDescr and their both have resolve method with DsImplArgs as argument
export type DsImplArgs<T extends UIDescr> = {
    style: StyleType<T>, 
    data: DataType<T>, 
    events: EventsType<T>,
    childrenImplArgs: DsImplArgsMap 
} 

// implementation details of ui element, that type is used in methods of UIDescr
// because i don't find how to use DsImplArgs in that methods
export type UIImplArgs<
    S extends StyleProps = StyleProps, 
    D extends DataProps = DataProps, 
    E extends EventProps = EventProps> = 
        DsImplArgs<UIDescr<S, D, E>>;

// implementation details of ui elements for simple element
export type SimpleDsImplArgs<T extends UIDescr = any> = Omit<DsImplArgs<T>, 'childrenImplArgs'>;

// create empty implementation details of ui elements
export const emptyImplArgs = (): SimpleDsImplArgs => {
    return {
        style: {},
        data: {},
        events: {}
    }
}


/**
 * map of implementation details of ui elements, key: UIDescr, value: SimpleDsImplArgs
 *
 * @export
 * @class DsImplArgsMap
 */
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

    /**
     * add implementation details of ui element
     *
     * @param {UIDescr} descr ui element description
     * @param {SimpleDsImplArgs} implArgs implementation details of ui element
     * @memberof DsImplArgsMap
     */
    add(descr: UIDescr, implArgs: SimpleDsImplArgs) {
        if (!this.map) {
            this.map = new Map<UIDescr, SimpleDsImplArgs>();
        }
        this.map.set(descr, implArgs);
    }

    /**
     *  resolve ui element description to real react element
     *
     * @param {UIDescr} descr ui element description 
     * @param {StyleProps} [extraStyle] extra style properties which will be added to react element
     * @param {IUIDescrToImplRules} [rules=UIDescr.globalDescrToImplRules] rules of resolving UIDescr ro real react element
     * @returns {ReactElement}
     * @memberof DsImplArgsMap
     */
    resolveDescr(
        descr: UIDescr, 
        extraStyle?: StyleProps, 
        rules: IUIDescrToImplRules = UIDescr.globalDescrToImplRules): ReactElement {

        return descr.resolve(this.getImpArgs(descr, extraStyle), rules);
    }

}

/**
 * create empty DsImplArgsMap
 *
 * @returns {DsImplArgsMap}
 */
export const createDsImplArgsMap = (): DsImplArgsMap => {
    return new DsImplArgsMap();
}


/**
 * get props for react element from ui descr implementation details
 *
 * @export
 * @template T
 * @param {DsImplArgs<T>} args
 * @returns {*}
 */
export function implArgs2props<T extends UIDescr, P = any>(args: DsImplArgs<T>): P {
    if (args)
        return {
            ...args.style,
            ...args.data,
            ...args.events,
            style: args.style} as any
    else return {
    } as any
}

// function of default implementation ui element
export type TDefImplFunc<
    S extends StyleProps = StyleProps,
    D extends DataProps = DataProps, 
    E extends EventProps = EventProps 
> = (implArgs: UIImplArgs<S, D, E>) => ReactElement;


/**
 * function for creating a function of default implementation ui element
 *
 * @param {ElementType} type type of react element 'button' or 'input' etc.
 * @param {(implArgs: DsImplArgs<any>) => any[]} [childrenFunc=() => []] function of getting of children of react element
 * @returns {TDefImplFunc}
 */
export const makeDefImplFunc = (
    type: ElementType, 
    childrenFunc: (implArgs: DsImplArgs<any>) => any[] = () => []
    ): TDefImplFunc => {

    return (implArgs: UIImplArgs): ReactElement => {
        return React.createElement(
            type, 
            implArgs2props(implArgs), 
            ...childrenFunc(implArgs))
    }
}

// resolve of ui descr to react element
export type TResolveFunc<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    >  
> = (descr: T, args: DsImplArgs<T>) => ReactElement

/**
 *  rule of resolving UIDescr with type _descrType to react element
 *
 * @export
 * @interface IUIDescrToImplRule
 * @template T
 */
export interface IUIDescrToImplRule<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    >
> {
    /**
     * constructor of UIDescr, this is needed because there is now way to somehow save T from generic arguments
     *
     * @type {{new ():T}}
     * @memberof IUIDescrToImplRule
     */
    _descrType: {new ():T};
    /**
     * build react element by UIDescr and UIDescr implementation details 
     *
     * @memberof IUIDescrToImplRule
     */
    resolve: (descr: T, args: DsImplArgs<T>) => ReactElement | null;
}

/**
 * set of descr to react element rules
 *
 * @export
 * @interface IUIDescrToImplRules
 */
export interface IUIDescrToImplRules {

    /**
     * add rule to set
     *
     * @memberof IUIDescrToImplRules
     */
    add: <T extends UIDescr>(rule: IUIDescrToImplRule<T>) => IUIDescrToImplRules;

    /**
     * search the rule for descr and apply 
     *
     * @memberof IUIDescrToImplRules
     */
    resolve: <
        T extends UIDescr<
            StyleType<T>, 
            DataType<T>, 
            EventsType<T>
        >  
    >(descr: T, args: DsImplArgs<T>) => ReactElement | null;
}


/**
 * Basic building block of descrui 
 * UIDescr it's a description of ui element, not a real element
 * there is no visual details like color and shape of element, 
 * main idea is that when you build you interface, you can think like this: 
 * "ok, there is a primary button with text of "OK", there is a cancel button, there is a input" etc.
 * and later (may be some other programmer) can decide and write some rules module: 
 * "ok primary buttons in our site must look like this, cancel button must look like this, and inputs in our site must look like this, etc"
 * 
 * @export
 * @class UIDescr
 * @template S style properties of ui element
 * @template D data properties of ui element
 * @template E events of element
 */
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
 * Description of the layout all the sub elements of ILayoutDescr.descr
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


// function for resolve layout description to react element 
export type TResolveLayoutDescrFunc<T extends ILayoutDescr> = 
    (items: GroupItems, 
        implArgsMap: DsImplArgsMap,
        layoutDescr: T, 
        rules?: IUIDescrToImplRules
    ) => ReactElement;


// layout implementation, it's can some object with resolve method or just a function 
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
