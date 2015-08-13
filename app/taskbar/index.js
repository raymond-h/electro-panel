import React from 'react';
import Q from 'q';

import * as windows from './windows';

import { encodeNativeImage } from '../../util/image-encode';

export default class Taskbar extends React.Component {
    constructor() {
        super();

        this.state = { windows: [] };
    }

    async componentDidMount() {
        const wins = await windows.list();

        this.setState({ windows: wins });
    }

    render() {
        return <span className='window-list'>
        {
            this.state.windows.map((win) =>
                <TaskbarIcon window={win} />
            )
        }
        </span>;
    }
}

export class TaskbarIcon extends React.Component {
    constructor() {
        super();

        this.state = { imageUri: '' };
    }

    render() {
        const { window } = this.props;

        return <p className='window-icon'>
            {window.title}
        </p>;
    }
}
