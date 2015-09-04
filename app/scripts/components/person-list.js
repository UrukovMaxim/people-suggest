import React from 'react/addons';
import {Component, PropTypes} from 'react';
import PersonItem from '../components/person';

const cx = React.addons.classSet;
const b = 'person-list';

export default class PersonList extends Component {
    static propTypes = {
        persons: PropTypes.array.isRequired,
        onSelect: PropTypes.func
    };

    _handlePersonSelect = (person) => {
        if (this.props.onSelect) {
            this.props.onSelect(person);
        }
    };


    render() {
        const {persons, className} = this.props;

        const items = persons.map((personGroup) => (
            <div>
                <div className={`${b}__group-title`}>{personGroup.title}</div>
                {personGroup.persons.map((p) => <PersonItem key={p.id} person={p}
                                                            onClick={this._handlePersonSelect.bind(this, p)}/>)}
            </div>
        ));

        return (
            <div className={cx(b, className)}>
                {items}
            </div>
        )
    }
}
