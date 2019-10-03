import { UIDescr, ILayoutDescr, GroupItems } from "../../core/uiDescr";

type NumberAttr =
  | number
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';
type ColSize = true | 'auto' | NumberAttr;
type ColSpec =
  | ColSize
  | { span?: ColSize; offset?: NumberAttr; order?: NumberAttr };

type ColProps = {
    descr: UIDescr;
    colAs?: React.ElementType;
    xs?: ColSpec;
    sm?: ColSpec;
    md?: ColSpec;
    lg?: ColSpec;
    xl?: ColSpec;
}
type Row = {
    cols: ColType[];
    as?: React.ElementType;
    noGutters?: boolean;
  }
  
type ColType = UIDescr | ColProps;

export function col<T extends UIDescr>(descr: T, props?: Omit<ColProps, "descr">): ColType  {
    return {descr, ...props}
}

export class GridLayout implements ILayoutDescr {

    rows: Row[] = [];
    fluid?: boolean;
    
    static isColProps(col: ColType): col is ColProps {
        return !(col.hasOwnProperty('__styleType'));
    }

    static descr(props?: {fluid?: boolean}): GridLayout {
        const res = new GridLayout();
        res.fluid = props ? props.fluid: undefined;
        return res;
    }

    items():  GroupItems {
        if (!this.rows)
            return [];
        let res = [];
        for (const row of this.rows) {
            for (const col of row.cols) {
                if (GridLayout.isColProps(col))
                    res.push(col.descr);
                else      
                    res.push(col);
            }
        }
        return res;
    }
    
    public cols(...cols: ColType[]): GridLayout {
        this.rows[this.rows.length-1].cols = cols;
        return this;
    }

    public row(as?: React.ElementType, noGutters?: boolean): GridLayout {
        this.rows.push({ cols: [], as, noGutters });
        return this;
    }

    public rowCols(...cols: ColType[]): GridLayout {
        return this.row().cols(...cols);
    }

}