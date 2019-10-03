import { UIDescr, DsImplArgsMap, IUIDescrToImplRules, GroupDescr, resolveLayoutDescr, GroupItems } from "./uiDescr";
import { ReactElement } from "react";
import  React from "react";
import { BaseLayoutDescr, LayoutDescrArray, CustomLayout } from "./layoutDescr";

export const baseLayoutImpl = <T extends BaseLayoutDescr = BaseLayoutDescr>(
    items: GroupItems,
    implArgsMap: DsImplArgsMap,
    layoutDescr: T, 
    rules: IUIDescrToImplRules = UIDescr.globalDescrToImplRules): ReactElement => {

    let elements = [];
    items = layoutDescr.items();
    if (items instanceof Array) {
        for (const item of items) {
            if (item instanceof UIDescr) {
                elements.push(
                    item.resolve(
                        implArgsMap.getImpArgs(item), 
                        rules))
            } else {
                elements.push(item);
            }
        }
    } else {
        elements.push(items);
    }
    return <>{elements}</>;
}

export const layoutArrayImpl = <T extends LayoutDescrArray = LayoutDescrArray>(
    items: GroupItems,
    implArgsMap: DsImplArgsMap,
    layoutDescr: T, rules: IUIDescrToImplRules = UIDescr.globalDescrToImplRules
): ReactElement => {

    let elements = [];
    for (const item of layoutDescr.layouts) {
        elements.push(
            resolveLayoutDescr(item, layoutDescr.items(), implArgsMap));
    }
    return <>
        {elements}
    </>;
}

export const customLayoutImpl = <T extends CustomLayout = CustomLayout>(
    items: GroupItems,
    implArgsMap: DsImplArgsMap,
    layoutDescr: T, rules: IUIDescrToImplRules = UIDescr.globalDescrToImplRules
): ReactElement => {

    let elems: any = {};
    for (const [key, descr] of layoutDescr.struct.items().entries()) {
        elems[key] = descr.resolve(
            implArgsMap.getImpArgs(descr), 
            rules)
    };
    return layoutDescr.renderFunc(elems);
}
