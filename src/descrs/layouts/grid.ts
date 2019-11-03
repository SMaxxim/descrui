import { UIDescr, ILayoutDescr, GroupItems } from "../../core/uiDescr";
import { CSSProperties } from "react";
import { mergeStyle } from "../../core/styleUtils";

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

type RowSpacingType = CSSProperties["marginTop"];

type Row = {
    cols: ColType[];
    as?: React.ElementType;
    noGutters?: boolean;
    style?: CSSProperties;
}
  
type ColType = UIDescr | ColProps;

export function col<T extends UIDescr>(descr: T, props?: Omit<ColProps, "descr">): ColType  {
    return {descr, ...props}
}

export class GridLayout implements ILayoutDescr {

    rows: Row[] = [];
    fluid?: boolean;
    rowSpacingValue?: RowSpacingType;
    
    static isColProps(col: ColType): col is ColProps {
        if (!col) 
            return false
        else
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
    
    public rowSpacing(val: RowSpacingType): GridLayout {
        this.rowSpacingValue = val;
        return this;
    }

    public cols(...cols: (ColType | undefined)[]): GridLayout {
        this.rows[this.rows.length-1].cols = cols.filter(item => Boolean(item)) as any;
        return this;
    }

    public style(v: CSSProperties): GridLayout {
        const row = this.rows[this.rows.length-1];
        if (row.style) {
            Object.assign(row.style, v)
        } else {
            row.style = v;
        }
        return this;
    }

    public row(as?: React.ElementType, noGutters?: boolean): GridLayout {
        this.rows.push({ 
            cols: [], 
            as, 
            noGutters, 
            style: this.rowSpacingValue && this.rows.length > 0? { 
                marginTop: this.rowSpacingValue 
            }: undefined 
        });
        return this;
    }

    public rowCols(...cols: (ColType | undefined)[]): GridLayout {
        return this.row().cols(...cols);
    }

}