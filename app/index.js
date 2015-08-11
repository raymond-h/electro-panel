import React from 'react';

import Taskbar from './taskbar';

class Panel extends React.Component {
    render() {
        return <Taskbar />;
    }
}

React.render(<Panel />, document.body);
