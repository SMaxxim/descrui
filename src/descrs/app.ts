import { GroupDescr, ILayoutDescr, UIDescr, globalLayoutRules, ILayoutDescrToImplRules } from "../descrui";

export class AppDescr extends GroupDescr {

}

export const treksApp = (
    children: UIDescr[] | ILayoutDescr, 
    rules: ILayoutDescrToImplRules = globalLayoutRules): React.FC => {
    return () => { 
        return new AppDescr(children, rules).resolve()
    };
}
