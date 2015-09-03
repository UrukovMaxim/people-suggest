import React from 'react';
import {Component, PropTypes} from 'react';

export default class Person extends Component {

    static propTypes = {
        person: PropTypes.object.isRequired
    };

    render() {
        const {person} = this.props;

        return (
            <div className='person'>
                <div className="person__name">{person.name}</div>
            </div>
        )
    }
}
