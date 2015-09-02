import React from 'react';
import _ from 'lodash';
import {Component, PropTypes} from 'react';
import mixins from 'es6-react-mixins'
import ListenerMixin from 'alt/mixins/ListenerMixin';
import PersonStore from '../stores/person';
import PersonActions from '../actions/person';
import PersonList from '../components/person-list';

const ComponentBase = mixins(ListenerMixin);

class PeopleSuggest extends ComponentBase {
    static propTypes = {
        mode: PropTypes.oneOf([
            'full',
            'short'
        ]),
        onClose: PropTypes.func,
        onSelect: PropTypes.func
    };

    static defaultProps = { mode: 'short' };

    state = { persons: {} };

    componentDidMount() {
        this.listenTo(PersonStore, ({persons}) => {
            this.setState({persons});
        });
        PersonActions.fetch();
    }

    render() {
        const {persons} = this.state;
        const count = _.keys(persons).length;

        const list = count
            ? <PersonList persons={_.values(persons)}/>
            : 'Loading...';

        return (
            <div className='people-suggest'>
                {list}
            </div>
        )
    }
}

export default PeopleSuggest;
