import alt from '../alt';
import suggestData from '../data/suggest';

//import PersonActions from '../actions/person';
import {indexBy} from 'lodash';

class SuggestStore {
    constructor() {
        //this.bindActions(PersonActions);

        this.groups = suggestData.groups;
    }
}

export default alt.createStore(SuggestStore);
