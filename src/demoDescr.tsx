import { StyleProps, UIDescr, DataProps, EventProps } from "./core/uiDescr";
import { ColorProperty } from "csstype";


// in that module is only description of ui component, implementation of that component, 
// real react component see in the module demoDescrImpl.tsx

/**
 * this is only presentation properties like color, font, size, etc.
 *
 * @interface DemoDescrStyle
 * @extends {StyleProps}
 */
export interface DemoDescrStyle extends StyleProps {
    headerColor?: ColorProperty;
}

/**
 *  this is is only data 
 *
 * @interface DemoDescrData
 * @extends {DataProps}
 */
export interface DemoDescrData extends DataProps {
    surname?: string;
    name?: string;
    patronymic?: string;
    birthday?: string
}

/**
 *  this is only events of DemoDescr 
 *
 * @interface DemoDescrEvents
 * @extends {EventProps}
 */
export interface DemoDescrEvents extends EventProps {
    onSubmitData: (data: DemoDescrData) => void;
}

export enum DemoDescrKind {
    withBirthday,
    withPatronymic
}

/**
 * DemoDescr it's a description of ui component, not a real component, 
 * and there are no visual details like color and shape of elements, there are no behavior and layout logic, no data 
 *
 * 
 * @export
 * @class DemoDescr
 * @extends {UIDescr<DemoDescrStyle, DemoDescrData, DemoDescrEvents>}
 */
export class DemoDescr extends UIDescr<DemoDescrStyle, DemoDescrData, DemoDescrEvents> {
    kind: Array<DemoDescrKind> = [];
}
