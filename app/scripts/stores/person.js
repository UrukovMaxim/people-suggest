import alt from '../alt';

import PersonActions from '../actions/person';
import {indexBy} from 'lodash';

class PersonStore {
    constructor() {
        this.bindActions(PersonActions);

        this.persons = {};
    }
    onFetch() {
        // reset the array while we're fetching new locations so React can
        // be smart and render a spinner for us since the data is empty.
        this.setState({persons: {}});
    }
    onUpdatePersons(persons) {
        this.setState({persons: indexBy(persons, 'id')});
    }
}

export default alt.createStore(PersonStore);
