import React from 'react';
import {Component, PropTypes} from 'react';
import PersonItem from '../components/person';

export default class PersonList extends Component {
    static propTypes = {
        persons: PropTypes.array.isRequired
    };

    render() {
        const {persons} = this.props;

        const items = persons.map((p)=> {
            return <PersonItem person={p}/>
        });

        return (
            <div className='person-list'>
                {items}
            </div>
        )
    }
}
