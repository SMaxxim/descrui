import { ImplArgs, UIDescr, DataType } from "./uiDescr";

export const dataPropOrDefault = <T extends UIDescr = any>(
    descr: T, 
    args: ImplArgs<T>, 
    propName: keyof T & keyof DataType<T>) => {

    return args.data && args.data[propName]? args.data[propName]: descr[propName];
}