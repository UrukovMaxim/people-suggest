import alt from '../alt';
import personData from '../data/persons';

class PersonActions {
    fetch() {
        this.dispatch();

        loadPersons()
            .then(this.actions.updatePersons.bind(this))
            .catch(this.actions.fetchFailed.bind(this));
    }
    updatePersons(persons) {
        this.dispatch(persons);
    }
    fetchFailed(err) {
        this.dispatch(err);
    }
}

function loadPersons() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(personData);
        }, 300);
    });
}

module.exports = alt.createActions(PersonActions);
