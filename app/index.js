import React from 'react';

import StartMenu from './start-menu';
import Taskbar from './taskbar';
import Time from './time';

class Panel extends React.Component {
    render() {
        return <div className='panel'>
            <StartMenu />
            <Taskbar />
            <Time />
        </div>;
    }
}

React.render(<Panel />, document.body);
