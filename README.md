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

Main idea is to describe the ui component like this: 

* first we describe presentation properties of component like
  color, font, size, etc., if such properties is exists, example:
```typescript
export interface DemoDescrStyle extends StyleProps {
    headerColor?: ColorProperty;
}
```  

* then we describe data of component, example: 
```typescript
export interface DemoDescrData extends DataProps {
    surname?: string;
    name?: string;
    patronymic?: string;
    birthday?: string
}
```  

* then we describe events of component, if component has events, example:
```typescript
export interface DemoDescrEvents extends EventProps {
    onSubmitData: (data: DemoDescrData) => void;
}
```

* and then we describe component itself, 
  but we create a class which is only a description ui component, 
  without implementation, implementation for this description we will create later, and 
  we can even choose between different implementations

```typescript
export enum DemoDescrKind {
    withBirthday,
    withPatronymic
}

export class DemoDescr extends UIDescr<DemoDescrStyle, DemoDescrData, DemoDescrEvents> {
    kind: Array<DemoDescrKind> = [];
}
```

* and now we can create implementation of component (maybe even in another module).

  First we describe structure our component: 

```typescript
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
    submit = button({
        text: "Submit"
    });
}
```
and again: here, functons like h1, button, input, it's not a real elements, it's just a description of what we want to have 
in our component, real implementation will be determined by special rules, and we can choose beetwen different css-toolkits,
or write our own implementation.
  
* and finally we can write implementation: special react component:  
```typescript

/*
 *  here we inherited DemoDescrImpl from UIImpl, which is inherited from react component.
 *  As a state type we use DemoDescrData, and as a props type we will have object like this: 
    { descr: DemoDescr, data: DemoDescrData, events: DemoDescrEvents, style: DemoDescrStyle }
 */
export class DemoDescrImpl extends UIImpl<DemoDescrStruct, DemoDescrData> {
    struct = new DemoDescrStruct(this.props.descr);

    state = { ...this.props.data }


    /**
     *  here we map data to elements 
     *
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
     */
    descrEvents = (): Events<DemoDescrStruct> => (
        {
            submit: { onClick: () => {
                this.props.events.onSubmitData(this.state) 
            }},
            surname: { onChange: (event: any) => 
                this.setState({surname: event.target.value})
            },
            name: { onChange: (event: any) => 
                this.setState({name: event.target.value})
            },
            birthday: { onChange: (event: any) => 
                this.setState({birthday: event.target.value})
            },
            patronymic: { onChange: (event: any) => 
                this.setState({patronymic: event.target.value})
            }
        }
    )


    /**
     *  here we describing layout of sub elements
     *
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
```

* and then we must connect description and implementation
```typescript
addImplComponent(DemoDescr, DemoDescrImpl);
```

* and finally we can use it somewhere:
```typescript

// we use bootstrap for our elements implementation
addBootstrapRules();


class DemoAppDescr extends UIDescr {

    defaultImpl(args: ImplArgs<DemoAppDescr>): ReactElement {
        return <DemoAppImpl 
            descr={this} 
            {...args}
        />
    }

}

// here we include our DemoDescr in application
class DemoAppStruct extends UIImplStruct<DemoAppDescr> {
    header = h1({text: "Test App"});
    demoDescr = descr(DemoDescr, { kind: [DemoDescrKind.withBirthday]});
    demoDescrResult = h1();
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
            demoDescrResult: { text: this.state.demoDescrResult }
        }
    )

    descrEvents = (): Events<DemoAppStruct> => {
        return {
            demoDescr: { onSubmitData: (data) => {
                this.setState({ 
                     demoDescrResult: `${data.name} ${data.surname}, ${data.birthday}`
                })} 
            }
        }
    }


    descrLayout = (): ILayoutDescr => {
        return GridLayout.descr({fluid: true})
            .rowSpacing(10)
            .rowCols(
                col(this.struct.header, {xs: true}))
            .rowCols(this.struct.demoDescr)
            .rowCols(this.struct.demoDescrResult)
    }

}

const Root: React.FC = descruiApp(descr(DemoAppDescr));

export default Root;
```

