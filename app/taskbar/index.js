import React from 'react';
import Q from 'q';

import * as windows from './windows';

import { encodeNativeImage } from '../../util/image-encode';

export class TaskbarIcon extends React.Component {
	constructor() {
		super();

		this.state = { imageUri: '' };
	}

	async componentDidMount() {
		try {
			// console.log(this.props.window.title, this.props.window.id);

			// const icon = await windows.icon(this.props.window.id);

			// console.log(this.props.window.title, icon);


			const icon = this.props.window.icon;
			if(!icon) return;

			const img = await encodeNativeImage(icon, icon.data);

			this.setState({ imageUri: img.toDataUrl() });
		}
		catch(e) { console.error(e); }
	}

	render() {
		const { window } = this.props;

		return <p className='window-icon'>
			<img src={this.state.imageUri} /> {window.title}
		</p>;
	}
}

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
        return <span>
        {
        	this.state.windows.map((win) =>
        		<TaskbarIcon window={win} />
        	)
        }
        </span>;
    }
}
