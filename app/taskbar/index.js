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
        const wins = await windows.listIds();

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

        this.state = { imageUri: '', title: '' };
    }

    componentDidMount() {
        windows.icon(this.props.window)
        .then((icon) => {
            this.setState({ imageUri: nativeImage.createFromBuffer(icon).toDataUrl() });
        });

        windows.title(this.props.window)
        .then((title) => this.setState({ title }));
    }

    render() {
        const { window } = this.props;

        return <p className='window-icon'>
            <img className='icon' src={this.state.imageUri} /> {this.state.title}
        </p>;
    }
}
