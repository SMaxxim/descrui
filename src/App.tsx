import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import { UIDescr, StyleProps, Button, UIImpl, GroupDescr, descr } from './descrui';
import { AppDescr, treksApp } from './descrs/app';
import { addBootstrapRules } from './impls/bootstrap/bsrules';
import { GridLayout } from './descrs/layouts/grid';

addBootstrapRules();

const Root: React.FC = treksApp(
    GridLayout.descr()
        .row().cols({descr: descr(Button, {text: "test"}), xs: true},
            {descr: descr(Button, {text: "test2"}), xs: true})
        .row().cols({descr: descr(Button, {text: "test"}), xs: true},
            {descr: descr(Button, {text: "test2"}), xs: true})

);

export default Root;
