import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import { descruiApp } from './descrs/app';
import { addBootstrapRules } from './impls/bootstrap/bsrules';
import { GridLayout, col } from './descrs/layouts/grid';
import { H1, h1 } from './descrs/h1';
import { delay } from 'q';
import { StyleProps, UIDescr, ILayoutDescr, group, descr, DsImplArgs, ImplArgs } from './core/uiDescr';
import { UIImplStruct, UIImpl, Data, Style, Elements, Events } from './core/uiImpl';
import { button, Button, ButtonDescr } from './descrs/button';
import { CustomLayout } from './core/layoutDescr';
import { HeaderDescr } from './descrs/header';
import { withStyle, stylePropOrDefault } from './core/styleUtils';
import { BackgroundColorProperty } from 'csstype';
import { DemoDescr, DemoDescrKind } from './demoDescr';
import { addImplComponent } from './core/uiImplRules';
import { DemoDescrImpl, addDemoDescrImplComponent } from './demoDescrImpl';

addBootstrapRules();
// and we connect description and implementation
addDemoDescrImplComponent();

interface DemoAppStyle extends StyleProps {
    headerBackgroundColor?: BackgroundColorProperty;
}

class DemoAppDescr extends UIDescr<DemoAppStyle> {
    title?: string;

    defaultImpl(args: ImplArgs<DemoAppDescr>): ReactElement {
        return <DemoAppImpl 
            descr={this} 
            {...args}
        />
    }
 
}

class DemoAppStruct extends UIImplStruct<DemoAppDescr> {
    header = h1({text: "Test Grid layout"});
    test1 = button();
    test2 = button();
    test3 = button();
    test4 = button();
    demoDescr = descr(DemoDescr, { kind: [DemoDescrKind.withBirthday]});
    demoDescrResult = h1({text: "ttt"});
}

interface DemoAppImplState {
    demoDescrResult: string;
}

class DemoAppImpl extends UIImpl<DemoAppStruct, DemoAppImplState> {
    struct = new DemoAppStruct(this.props.descr);
    state = {
        demoDescrResult: ""
    };

    descrData = (): Data<DemoAppStruct> => (
        { 
            test1: { text: "text1"},
            test2: { text: "text2"},
            test3: { text: "text3"}, 
            test4: { text: "text4"},
            demoDescrResult: { text: this.state.demoDescrResult }
        }
    )

    descrStyle = (): Style<DemoAppStruct> => (
        { 
            header: { 
                backgroundColor: stylePropOrDefault(this.props, 'headerBackgroundColor', 'red')
            },
            test1: { color: 'black'},
            test2: { }
        }
    )

    descrEvents = (): Events<DemoAppStruct> => {
        return {
            demoDescr: { onSubmitData: (data) => {
                 this.setState({demoDescrResult: data.name + " "+ data.surname})
                } 
            }
        }
    }

/*
    descrLayout = (): ILayoutDescr => {
        return new CustomLayout(
            this.struct,
            (elems: Elements<DemoAppStruct>) => 
                <>
                <HeaderDescr><button>fffffssxxx</button>test <ButtonDescr text="fsssff"/></HeaderDescr>
                <ButtonDescr text="fff" style={{width: '100%'}}/>
                    {withStyle(elems.header, { color: "yellow"})}
                    {elems.test1}
                </>
        )
    }
*/

    descrLayout = (): ILayoutDescr => {
        return GridLayout.descr({fluid: true})
            .rowSpacing(10)
            .rowCols(
                col(this.struct.header, {xs: true}))
            .rowCols(
                col(this.struct.test1, {xs: true}),
                col(this.struct.test2, {xs: true}),
                col(this.struct.test3, {xs: true}),
                col(this.struct.test4, {xs: true}),
            )
            .rowCols(this.struct.demoDescr)
            .rowCols(this.struct.demoDescrResult)
    }

}

const Root: React.FC = descruiApp(descr(DemoAppDescr), { headerBackgroundColor: "blue"});

export default Root;
