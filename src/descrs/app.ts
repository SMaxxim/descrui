import { UIDescr, StyleType, EventsType, DataType, createDsImplArgsMap, GroupDescr } from "../core/uiDescr"
import { LayoutDescrToImplRules } from "../core/layoutImplRules";
import { BaseLayoutDescr } from "../core/layoutDescr";
import { UIDescrToImplRules } from "../core/uiImplRules";

GroupDescr.defaultLayoutDescr = BaseLayoutDescr;
GroupDescr.globalLayoutRules = new LayoutDescrToImplRules();
UIDescr.globalDescrToImplRules = new UIDescrToImplRules();

export function descruiApp<
    T extends UIDescr<
        StyleType<T>, 
        DataType<T>, 
        EventsType<T>
    >
>(appDescr: T, style?: StyleType<T>, data?: DataType<T>, events?: EventsType<T>): React.FC {
        return () => {return appDescr.resolve(
            {style, data, events, childrenImplArgs: createDsImplArgsMap()})
        }
}
