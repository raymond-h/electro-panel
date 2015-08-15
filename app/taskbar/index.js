import React from 'react';
import Q from 'q';

import * as windows from './windows';

import nativeImage from 'native-image';

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

    async componentDidMount() {
        const icon = await windows.icon(this.props.window.id);

        this.setState({ imageUri: nativeImage.createFromBuffer(icon).toDataUrl() });
    }

    render() {
        const { window } = this.props;

        return <p className='window-icon'>
            <img className='icon' src={this.state.imageUri} /> {window.title}
        </p>;
    }
}
