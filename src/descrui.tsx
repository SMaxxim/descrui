import React, { PureComponent, ReactElement } from "react";

export interface StyleProps extends React.CSSProperties {
};

export class DataProps {
};

export class EventProps {
    onClick?: React.MouseEventHandler;
}

type StyleType<T extends any> = T[keyof {__styleType: any}];
type DataType<T extends any> = T[keyof {__dataType: any}];
type EventsType<T extends any> = T[keyof {__eventsType: any}];
type DescrType<T extends any> = T[keyof {descr: any}];
type DescrProperty = {descr: UIDescr};
type UIImplArgs<S extends StyleProps, D extends DataProps, E extends EventProps, T extends UIDescr<S, D, E> = UIDescr<S, D, E>> = {
    descr: T, 
    style?: S, 
    data?: D, 
    events?: E} 
type DescrArgs<T> = {[index in keyof T]?: T[index]};

const uiImplArgs = (args: UIImplArgs<any, any, any>) => {
    return { style: args.style,  }

}

export class UIDescr<
    S extends StyleProps = StyleProps,
    D extends DataProps = DataProps, 
    E extends EventProps = EventProps> {
    
    protected readonly __styleType!: S;
    protected readonly __dataType!: D;
    protected readonly __eventsType!: E;

    public parent?: any;

    public implStruct: any;


    defaultImpl = (style?: S, data?: D, events?: E): ReactElement => {
        if (this.implStruct) 
            return <UIImpl descr={this} style={style} data={data} events={events}/>
        else
            return <div {...style} {...data} {...events} style={style}></div> 
    }

    public resolve: (args?: UIImplArgs<S ,D ,E>, rules?: IUIDescrToImplRules) => ReactElement = (args: UIImplArgs<S ,D ,E> = { descr: this }, rules: IUIDescrToImplRules = globalDescrToImplRules): ReactElement => {
        let res = rules.resolve({descr: this, style: args.style, data: args.data, events: args.events});
        if (!res) {
            res = this.defaultImpl(args.style, args.data, args.events)
        }
        return res;
    }
    
}

export class GroupDescr<
    S extends StyleProps = StyleProps,
    D extends DataProps = DataProps, 
    E extends EventProps = EventProps> extends UIDescr<S, D, E> {

    public readonly children: UIDescr[];
    public layoutDescr?: ILayoutDescr;
    public rules: ILayoutDescrToImplRules;

    public childrenImplArgs?: Map<UIDescr, UIImplArgs<any, any, any>>;

    constructor(
        children: UIDescr[] | ILayoutDescr, 
        rules: ILayoutDescrToImplRules = globalLayoutRules) {

        super();
        if (children instanceof Array) {
            this.children = children;
        } else {
            this.layoutDescr = children;
            this.children = children.items();
        }
        this.rules = rules;
        if (children) {
            for (const item of this.children) {
                item.parent = this;
            }
        }
    }

    resolveGroupLayout = (): ReactElement => {
        let ldescr = this.layoutDescr!;
        if (!this.layoutDescr) {
            ldescr = new BaseLayoutDescr(this.children)
        }
        let childrenImplArgs = this.childrenImplArgs;
        if (!childrenImplArgs) {
            childrenImplArgs =  new Map<UIDescr, any>();
            for (const item of this.children) {
                childrenImplArgs.set(item, { descr: item});
            }
        }
        ldescr.parent = this;
        return resolveLayoutDescr(ldescr, childrenImplArgs, this.rules);
    }

    defaultImpl = (style?: S, data?: D, events?: E): ReactElement => { 
        return this.resolveGroupLayout();
    }
}

type TResolveFunc = <T extends any, FT extends UIDescr<StyleType<T>, DataType<T>, EventsType<T>> = UIDescr<StyleType<T>, DataType<T>, EventsType<T>>>(args: UIImplArgs<StyleType<FT>, DataType<FT>, EventsType<FT>, FT>) => ReactElement | null

class UIDescrToImplRule<T extends UIDescr, FT extends UIDescr<StyleType<T>, DataType<T>, EventsType<T>> = UIDescr<StyleType<T>, DataType<T>, EventsType<T>>> {
    _descrType: {new ():FT};
    
    private _func: (args: UIImplArgs<StyleType<T>, DataType<T>, EventsType<T>, T>) => ReactElement | null;

    constructor(descrType:{new ():FT}, func: (args: UIImplArgs<StyleType<T>, DataType<T>, EventsType<T>, T>) => ReactElement | null) {
        this._descrType = descrType;
        this._func = func;
    }

    resolve = (args: UIImplArgs<StyleType<T>, DataType<T>, EventsType<T>, T>): ReactElement | null => {
        return this._func(args);
    }

;
}

interface IUIDescrToImplRules {
    add: <T extends UIDescr>(rule: UIDescrToImplRule<T>) => IUIDescrToImplRules;
    resolve: TResolveFunc;
}

class UIDescrToImplRules implements IUIDescrToImplRules {

    rules: UIDescrToImplRule<any>[] = [];

    add = <T extends UIDescr>(rule: UIDescrToImplRule<T>): UIDescrToImplRules => {
        this.rules.push(rule);
        return this;
    }

    resolve = <T extends UIDescr>(args: UIImplArgs<StyleType<T>, DataType<T>, EventsType<T>, T>): ReactElement | null => {
        for (const rule of this.rules) {
            if (args.descr instanceof rule._descrType) {
                let res = rule.resolve(args);
                if (res) 
                    return res;
            }
        }
        return null;
    }

}

let globalDescrToImplRules = new UIDescrToImplRules();

type TImplFunc = <T extends UIDescr, FT extends UIDescr<StyleType<T>, DataType<T>, EventsType<T>> = UIDescr<StyleType<T>, DataType<T>, EventsType<T>>>(args: UIImplArgs<StyleType<T>, DataType<T>, EventsType<T>, T>) => ReactElement | null;

export function addImplRule<
    T extends any, 
    ST extends UIImplStruct<FT>, 
    I extends UIImpl<ST> | React.Component, 
    FT extends UIDescr<StyleType<T>, DataType<T>, EventsType<T>> = UIDescr<StyleType<T>, DataType<T>, EventsType<T>>>(descrConstr: {new ():FT}, implConstr: {new (...args: any):I} | TImplFunc, rules: IUIDescrToImplRules = globalDescrToImplRules) {
    if (implConstr instanceof Function) {
        rules.add(
            new UIDescrToImplRule<FT>(descrConstr, implConstr as any)
        );    
    }
    else
        rules.add(
            new UIDescrToImplRule<FT>(descrConstr, 
                (args: UIImplArgs<StyleType<FT>, DataType<FT>, EventsType<FT>, FT>): ReactElement => {
                    return React.createElement(implConstr, args as any)
                }
        ));    
}


type Style<T> = {
    [index in Exclude<keyof T, keyof DescrProperty>]?: StyleType<T[index]>;
}

type Data<T> = {
    [index in Exclude<keyof T, keyof DescrProperty>]?: DataType<T[index]>;
}

type Events<T> = {
    [index in Exclude<keyof T, keyof DescrProperty>]?: EventsType<T[index]>;
}

interface IUIImplStruct {
    [key: string]: UIDescr;
}

export class UIImplStruct<T extends any, S extends StyleType<T> = StyleType<T>, D extends DataType<T> = DataType<T>, E extends EventsType<T> = EventsType<T>> {
    descr: T;

    constructor(descr: T) {
        this.descr = descr;
        this.descr.implStruct = this;
    }

    //resolve = (style?: S, data?: D, events?: E): ReactElement => {
    //    return this.descr.resolve(style, data, events);
    //}
}

export type UIFullStructDescr = Map<UIDescr, UIImplArgs<any, any, any>>;

export interface ILayoutDescr {

    parent?: any;

    items():  UIDescr[];
    
    setImplArgs(implArgs: UIFullStructDescr): void;

}

type TResolveLayoutDescrFunc<T extends ILayoutDescr> = (layoutDescr: T, rules?: IUIDescrToImplRules) => ReactElement;

type TLayoutImpl<T extends ILayoutDescr> = { resolve: TResolveLayoutDescrFunc<T> } | TResolveLayoutDescrFunc<T>;

class LayoutDescrToImplRule<T extends ILayoutDescr, IT extends TLayoutImpl<T>> {
    _descrType: {new ():T};
    _impl: IT;

    constructor(descrType: {new ():T}, _impl: IT) {
        this._descrType = descrType;
        this._impl = _impl;
    }

    resolve = (layout: T): IT => {
        return this._impl;
    }
}

export interface ILayoutDescrToImplRules {
    add: (rule: LayoutDescrToImplRule<any, any>) => ILayoutDescrToImplRules;
    resolve: <T extends ILayoutDescr>(layoutDescr: T) => TLayoutImpl<T>;
}

class LayoutDescrToImplRules implements ILayoutDescrToImplRules {

    rules: LayoutDescrToImplRule<any, any>[] = [];

    add = (rule: LayoutDescrToImplRule<any, any>): ILayoutDescrToImplRules => {
        this.rules.push(rule);
        return this;
    }

    resolve = <T extends ILayoutDescr>(layoutDescr: T): TLayoutImpl<T> => {
        for (const rule of this.rules) {
            if (layoutDescr instanceof rule._descrType) {
                let res = rule.resolve(layoutDescr);
                if (res) 
                    return res;
            }
        }
        if (layoutDescr instanceof BaseLayoutDescr) {
            return baseLayoutImpl as any;
        } else 
            throw new Error("cannot find layout implementation");
    }

}

export const globalLayoutRules = new LayoutDescrToImplRules();

export function addLayoutImplRule<
    T extends ILayoutDescr, IT extends TLayoutImpl<T>>
    (descrConstr: {new ():T}, 
    impl: IT, rules: ILayoutDescrToImplRules = globalLayoutRules) {

    rules.add(
        new LayoutDescrToImplRule<T, IT>(descrConstr, impl)
    );    
}

let resolveLayoutDescr = <T extends ILayoutDescr>(
    layoutDescr: T, 
    uiFullStructDescr: UIFullStructDescr,
    rules: ILayoutDescrToImplRules = globalLayoutRules): ReactElement => {

    layoutDescr.setImplArgs(uiFullStructDescr);
    let impl: TLayoutImpl<T> = rules.resolve(layoutDescr);
    if (impl instanceof Function) 
        return impl(layoutDescr);
    else 
        return impl.resolve(layoutDescr);
}

class BaseLayoutDescr implements ILayoutDescr {

    struct: UIDescr[] | object;
    parent?: any

    implArgs?: UIFullStructDescr;

    constructor(struct: UIDescr[] | any, parent?: any) {

        this.struct = struct;
        this.parent = parent;

    }

    setImplArgs(implArgs: UIFullStructDescr): void {
        this.implArgs = implArgs;
    }

    items(): UIDescr[] {
        if (this.struct instanceof Array) {

            return this.struct;

        } else {
            return Object.values(this.struct);

        }
    }
}

const baseLayoutImpl: TLayoutImpl<BaseLayoutDescr> = <T extends BaseLayoutDescr = BaseLayoutDescr>(layoutDescr: T, rules: IUIDescrToImplRules = globalDescrToImplRules): ReactElement => {
    let elements = [];
    for (const item of layoutDescr.implArgs!.values()) {
        if (!item.descr.parent || (layoutDescr.parent && layoutDescr.parent === item.descr.parent)) {
            elements.push(item.descr.resolve(item, rules));
        }
    }
    return <>
        {elements}
    </>;
}


export class UIImpl<ST extends any> extends PureComponent<UIImplArgs<StyleType<DescrType<ST>>, DataType<DescrType<ST>>, EventsType<DescrType<ST>>, DescrType<ST>>> {
    
    struct!: ST;

    constructor(args: UIImplArgs<StyleType<DescrType<ST>>, DataType<DescrType<ST>>, EventsType<DescrType<ST>>, DescrType<ST>>) {
        super(args); 
        this.struct = args.descr.implStruct;

    }

    protected descrLayout = (): ILayoutDescr => new BaseLayoutDescr(this.struct);


    protected descrStyle = (): Style<ST> => ({})

    protected descrData = (): Data<ST> => ({})

    protected descrEvents = (): Events<ST> => ({})

    private _fullDescr = (): UIFullStructDescr => {
        let style = this.descrStyle();
        let data = this.descrData();
        let events = this.descrEvents();
        let res = new Map<any, any>();
        for (const key of Object.keys(this.struct)) {
            let val = this.struct[key];
            if (key != 'descr'&& val instanceof UIDescr) {
                 let implArgs = {
                    descr: val,
                    style: style[key],
                    data: data[key],
                    events: events[key]
                };
                res.set(val, implArgs);

                if (val.parent) {
                    val.parent.childrenImplArgs[this.struct[key]] = implArgs;
                }
            }
        }
        return res;
    }

    render() {
        let layoutDescr = this.descrLayout();
        return resolveLayoutDescr(layoutDescr, this._fullDescr());
    }

}


interface TestStyle extends StyleProps {
    f3?: number;
}
 
class TestElement extends UIDescr<TestStyle> {
    gg?: {};
}

interface InputStyle extends StyleProps {
    inputColor?: number;
}

class Input extends UIDescr<InputStyle> {
}

export interface ButtonStyle extends StyleProps {
    buttonColor?: number;
}

export class Button extends UIDescr<ButtonStyle> {
    text?: string;

    defaultImpl = (): ReactElement => {
        return <button>{this.text}</button>;
    }
}

interface GroupBoxStyle extends StyleProps {
    buttonColor?: number;
}

class GroupBox extends GroupDescr<GroupBoxStyle> {
    title?: string;
}

export function descr<T extends UIDescr>(_constr: new () => T, args?: { [key in keyof T]?: T[key]}): T {
    let res = new _constr();
    if (args)
        Object.assign(res, args);
    return res;
}

export function groupDescr<T extends GroupDescr>(
    _constr: new (children: UIDescr[] | ILayoutDescr, rules: ILayoutDescrToImplRules) => T, 
    children: UIDescr[] | ILayoutDescr,
    args?: { [key in keyof T]?: T[key]}, 
    rules: ILayoutDescrToImplRules = globalLayoutRules): T {
    let res = new _constr(children, rules);
    if (args)
        Object.assign(res, args);
    return res;
}

//class HorizontalLayout implements ILayoutDescr {

//}

interface PersonInputStyle extends StyleProps {
    titleFontSize: number;
}

class PersonInputEvents extends EventProps {
    onSubmit?: (surname: string, name: string, patronymic: string) => void;
}

class PersonInputData extends DataProps {
    surname?: string;
    name?: string;
    patronymic?: string;
}

class PersonInputDescr extends UIDescr<PersonInputStyle, PersonInputData, PersonInputEvents> {
    title?: string;
}

class PersonInputStruct extends UIImplStruct<PersonInputDescr> {
    surname = descr(Input);
    name = descr(Input);
    patronymic = descr(Input);
    group = groupDescr(
        GroupBox, 
        [this.surname, this.name, this.patronymic], 
        { title: this.descr.title});
    t = descr(TestElement);
}

class PersonInputImpl extends UIImpl<PersonInputStruct> {

    descrStyle = (): Style<PersonInputStruct> => (
        { 
            name: { inputColor: 1},
            surname: { inputColor: 0 },
            t: { f3: 9 }
        }
    )

}

addImplRule(PersonInputDescr, PersonInputImpl);


