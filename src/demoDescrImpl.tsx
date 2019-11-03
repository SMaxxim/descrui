import { UIImplStruct, UIImpl, Data, Style, Events } from "./core/uiImpl";
import { DemoDescr, DemoDescrData, DemoDescrKind } from "./demoDescr";
import { h1 } from "./descrs/h1";
import { input } from "./descrs/input";
import { button } from "./descrs/button";
import { ILayoutDescr } from "./core/uiDescr";
import { GridLayout, col } from "./descrs/layouts/grid";
import { addImplComponent } from "./core/uiImplRules";

/**
 *  here we describing structure of component 
 *
 * @class DemoDescrStruct
 * @extends {UIImplStruct<DemoDescr>}
 */
class DemoDescrStruct extends UIImplStruct<DemoDescr> {
    header = h1({
        text: "Input your data"
    });
    surname = input({
        placeholder: "Surname"
    });
    name = input({
        placeholder: "Name"
    });
    birthday = input({
        placeholder: 'Birthday'
    });
    patronymic = input({
        placeholder: 'Patronymic'
    });
    submit = button({text: "Submit"});
}

/**
 *  DemoDescr implementation, react component 
 *
 * @export
 * @class DemoDescrImpl
 * @extends {UIImpl<DemoDescrStruct, DemoDescrData>}
 */
export class DemoDescrImpl extends UIImpl<DemoDescrStruct, DemoDescrData> {
    struct = new DemoDescrStruct(this.props.descr);

    state = { ...this.props.data }

    /**
     *  here we map data to elements 
     *
     * @memberof DemoDescrImpl
     */
    descrData = (): Data<DemoDescrStruct> => (
        {
            surname: { value: this.state.surname },
            name: { value: this.state.name },
            birthday: { value: this.state.birthday },
            patronymic: { value: this.state.patronymic }
        }
    )

    /**
     *  here we describing style of sub elements of component
     *
     * @memberof DemoDescrImpl
     */
    descrStyle = (): Style<DemoDescrStruct> => (
        { 
            header: { 
                color: this.props.style.headerColor 
            }
        }
    )

    /**
     * here we describing behavior of sub elements of component
     *
     * @memberof DemoDescrImpl
     */
    descrEvents = (): Events<DemoDescrStruct> => {
        return {
            submit: { onClick: () => {
                this.props.events.onSubmitData(this.state) 
            }
            },
            surname: { onChange: (event: any) => 
                this.setState({surname: event.target.value})
            },
            name: { onChange: (event: any) => 
                this.setState({name: event.target.value})
            }
        }
    }

    /**
     *  here we describing layout of sub elements
     *
     * @memberof DemoDescrImpl
     */
    descrLayout = (): ILayoutDescr => {
        return GridLayout.descr({fluid: true})
            .rowSpacing(10)
            .rowCols(this.struct.header)
            .rowCols(
                this.struct.surname, 
                this.struct.name, 
                this.props.descr.kind.includes(DemoDescrKind.withBirthday)? this.struct.birthday: undefined,
                this.props.descr.kind.includes(DemoDescrKind.withPatronymic)? this.struct.patronymic: undefined
            )
            .rowCols(this.struct.submit);
    }
}


// and we connect description and implementation
export const addDemoDescrImplComponent = () => {
    addImplComponent(DemoDescr, DemoDescrImpl);
}
