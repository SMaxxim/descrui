import { ILayoutDescr, UIDescr, UIFullStructDescr } from '../../descrui';

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

export class GridLayout implements ILayoutDescr {
    rows: Row[] = [];
    
    implArgs!: UIFullStructDescr;

    parent?: any;

    static isColProps(col: ColType): col is ColProps {
        return !(col.hasOwnProperty('__styleType'));
    }

    static descr(): GridLayout {
        return new GridLayout();
    }

    items():  UIDescr[] {
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
        return res as UIDescr[];
    }
    
    setImplArgs(implArgs: UIFullStructDescr): void {
        this.implArgs = implArgs;
    }


    public cols(...cols: ColType[]): GridLayout {
        this.rows[this.rows.length-1].cols = cols;
        return this;
    }

    public row(as?: React.ElementType, noGutters?: boolean): GridLayout {
        this.rows.push({ cols: [], as, noGutters });
        return this;
    }


}