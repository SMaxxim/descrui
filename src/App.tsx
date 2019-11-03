import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import { descruiApp } from './descrs/app';
import { addBootstrapRules } from './impls/bootstrap/bsrules';
import { GridLayout, col } from './descrs/layouts/grid';
import { H1, h1 } from './descrs/h1';
import { delay } from 'q';
import { StyleProps, UIDescr, ILayoutDescr, group, descr, DsImplArgs, ImplArgs } from './core/uiDescr';
import { UIImplStruct, UIImpl, Data, Style, Elements } from './core/uiImpl';
import { button, Button, ButtonDescr } from './descrs/button';
import { CustomLayout } from './core/layoutDescr';
import { HeaderDescr } from './descrs/header';
import { withStyle } from './core/styleUtils';
import { BackgroundColorProperty } from 'csstype';

addBootstrapRules();

interface DemoAppStyle extends StyleProps {
    headerBackgroundColor?: BackgroundColorProperty;
}

class DemoAppDescr extends UIDescr<DemoAppStyle> {
    title?: string;

    defaultImpl(args: ImplArgs<DemoAppDescr>): ReactElement {
        return <DemoAppImpl 
            descr={this} 
            struct={new DemoAppStruct(this)} 
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
}

class DemoAppImpl extends UIImpl<DemoAppStruct> {

    descrData = (): Data<DemoAppStruct> => (
        { 
            test1: { text: "text1"},
            test2: { text: "text2"},
            test3: { text: "text3"}, 
            test4: { text: "text4"} 
        }
    )

    descrStyle = (): Style<DemoAppStruct> => (
        { 
            header: { 
                backgroundColor: 
                    this.props.style && 
                    this.props.style.headerBackgroundColor?  this.props.style.headerBackgroundColor: 'red' 
            },
            test1: { color: 'black'},
            test2: { }
        }
    )
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
            .rowCols(
                col(this.struct.header, {xs: true}))
            .rowCols(
                col(this.struct.test1, {xs: true}),
                col(this.struct.test2, {xs: true}),
                col(this.struct.test3, {xs: true}),
                col(this.struct.test4, {xs: true}),
            )
    }

}

const Root: React.FC = descruiApp(descr(DemoAppDescr), { headerBackgroundColor: "blue"});

export default Root;
