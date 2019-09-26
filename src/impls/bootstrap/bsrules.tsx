import React from 'react';
import { addImplRule, Button, ButtonStyle, DataProps, EventProps, addLayoutImplRule } from "../../descrui";
import { Button as BootstrapButton, Container, Row, Col } from  'react-bootstrap' 
import { GridLayout } from '../../descrs/layouts/grid';
import 'bootstrap/dist/css/bootstrap.css';

export function addBootstrapRules() {
    addImplRule(Button, (args: {
        descr: Button, 
        style?: ButtonStyle, 
        data?: DataProps, 
        events?: EventProps}) => 
            <BootstrapButton  style={args.style}>
            {args.descr.text}
            </BootstrapButton>)

    addLayoutImplRule(GridLayout, (layoutDescr: GridLayout) => {
        return (
            <Container fluid>
                {layoutDescr.rows.map(
                    row => 
                        (<Row as={row.as} noGutters={row.noGutters}>
                            {row.cols.map(
                                col => 
                                    GridLayout.isColProps(col)?
                                        <Col as={col.colAs} xs={col.xs} sm={col.sm} md={col.md} lg={col.lg} xl={col.xl}>
                                            {col.descr.resolve({style: {width: '100%'}, ...layoutDescr.implArgs.get(col.descr)!})}
                                        </Col>:
                                        <Col>
                                            {col.resolve({style: {width: '100%'}, ...layoutDescr.implArgs.get(col)!})}
                                        </Col>

                            )}
                        </Row>))}
            </Container>
        )
    })
}