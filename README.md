# descrui
React-based web framework

status: *in development* 

features:
* easy switching from one css toolkit to another (bootstrap, material ui, ..)
* better separation of: 
  * view of visual elements: size, font, color, etc.
  * mapping data to elements
  * behaviour logic: event handlers
  * layout logic
* different wrappers over layouts that make it easier to deal with simple cases 
* building web-interface using desktop-like primitives and layouts

Еhe main idea is to describe the ui component like this: 
```typescript

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
```
