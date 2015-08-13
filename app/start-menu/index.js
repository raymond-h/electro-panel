import React from 'react';
import Q from 'q';

export default class StartMenu extends React.Component {
    constructor() {
        super();

        this.state = { opened: false };
    }

    render() {
        return <div className='start-menu-icon'>START</div>;
    }
}
