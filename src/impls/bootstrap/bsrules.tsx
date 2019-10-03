import React from 'react';
import { Button as BootstrapButton, Container, Row, Col } from  'react-bootstrap' 
import 'bootstrap/dist/css/bootstrap.css';
import { addImplRule } from '../../core/uiImplRules';
import { Button, ButtonStyle, ButtonData } from '../../descrs/button';
import { EventProps, UIDescr, DsImplArgsMap, GroupItems } from '../../core/uiDescr';
import { GridLayout } from '../../descrs/layouts/grid';
import { addLayoutImplRule } from '../../core/layoutImplRules';

export function addBootstrapRules() {
    addImplRule(Button, 
        (descr: Button, 
        args: {
            style?: ButtonStyle, 
            data?: ButtonData, 
            events?: EventProps
        }) => 
            <BootstrapButton  style={args.style}>
            {args.data && args.data.text ? 
                args.data.text : 
                descr.text}
            </BootstrapButton>
    )

    addLayoutImplRule(GridLayout, (
        items: GroupItems, 
        implArgsMap: DsImplArgsMap, 
        layoutDescr: GridLayout) => {
        return (
            <Container fluid={layoutDescr.fluid}>
                {layoutDescr.rows.map(
                    row => 
                        (<Row as={row.as} noGutters={row.noGutters}>
                            {row.cols.map(
                                col => 
                                    GridLayout.isColProps(col)?
                                        <Col as={col.colAs} xs={col.xs} sm={col.sm} md={col.md} lg={col.lg} xl={col.xl}>
                                            {implArgsMap.resolveDescr(col.descr, {width: '100%'})}
                                        </Col>:
                                        <Col>
                                            {implArgsMap.resolveDescr(col, {width: '100%'})}
                                        </Col>

                            )}
                        </Row>))}
            </Container>
        )
    })
}