import React from 'react';
import moment from 'moment';

export default class Time extends React.Component {
    constructor() {
        super();

        this.state = { currentTime: moment() };
    }

    componentDidMount() {
        this.intervalId = setInterval(() => {
            this.setState({ currentTime: moment() });
        }, 1000);
    }

    componentDidUnmount() {
        clearInterval(this.intervalId);
    }

    render() {
        return <div className='time'>
            { this.state.currentTime.format('HH:mm:ss') }
        </div>;
    }
}
