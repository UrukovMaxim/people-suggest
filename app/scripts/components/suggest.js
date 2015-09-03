import React from 'react/addons';
import _ from 'lodash';
import {Component, PropTypes} from 'react';
import mixins from 'es6-react-mixins'
import ListenerMixin from 'alt/mixins/ListenerMixin';
import PersonStore from '../stores/person';
import SuggestStore from '../stores/suggest';
import PersonActions from '../actions/person';
import PersonList from '../components/person-list';

const cx = React.addons.classSet;
const ComponentBase = mixins(ListenerMixin);
const b = 'people-suggest';

function getState() {
    const allGroups = SuggestStore.getState().groups;
    const allPersons = PersonStore.getState().persons;

    const groups = {
        frequent: processGroup(_.find(allGroups, {kind: 'frequent'})),
        projectParticipants: processGroup(_.find(allGroups, {kind: 'project_participants'})),
        projectMembers: processGroup(_.find(allGroups, {kind: 'project_members'}))
    };

    const teams = _.where(allGroups, {kind: 'team'}).map((team) => {
        team.hasProjectParticipants = _.intersection(groups.projectParticipants.persons, team.persons);
        team.hasProjectMembers = _.intersection(groups.projectMembers.persons, team.persons);
        team.persons = team.persons.map((id) => allPersons[id]);
        return team;
    });

    return _.assign({
        groups,
        teams
    });

    function processGroup(group) {
        group.persons = group.persons.map((id) => allPersons[id]);
        return group;
    }
}

class PeopleSuggest extends ComponentBase {
    static propTypes = {
        onClose: PropTypes.func,
        onSelect: PropTypes.func
    };

    state = _.assign(getState(), {
        selectedGroup: {kind: 'frequent'},
        mode: 'full'
    });

    componentDidMount() {
        this.persons = {};

        this.listenTo(PersonStore, getState);
        this.listenTo(SuggestStore, getState);
    }

    _handleChangeMode = () => {
        const mode = this.state.mode == 'short' ? 'full' : 'short';

        this.setState({mode});
    };

    _handleGroupSelect = (kind) => {
        this.setState({selectedGroup: {kind}})
    };

    _handleTeamSelect = (id) => {
        this.setState({selectedGroup: {kind: 'team', id}})
    };

    render() {
        const {mode, groups, teams, selectedGroup} = this.state;
        const {className} = this.props;

        const {persons} = selectedGroup.kind == 'team' ? _.find(teams, {id: selectedGroup.id}) : groups[selectedGroup.kind];

        const groupItems = _.pairs(groups).map(([groupName, group]) => {
            let title = '';

            switch (groupName) {
                case 'frequent':
                    title = 'Frequent contacts';
                    break;
                case 'projectParticipants':
                    title = 'Project participants';
                    break;
                case 'projectMembers':
                    title = 'Project members';
                    break;
            }

            return (
                <div ref={groupName} className={cx(`${b}__group-item ${b}_group-item_id_frequent ${b}__group-item_selected_${selectedGroup.kind==groupName}`)} onClick={this._handleGroupSelect.bind(this, groupName)}>
                    <div className={`${b}__group-item-icon`}>
                        <div className={`b-icon-sc b-icon-sc_img_crown-on ${b}__${groupName}-members-icon`}></div>
                    </div>
                    <div className={`${b}__group-info`}>{title} · {group.persons.length}</div>
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-participant_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-member_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                </div>
            )
        });


        const teamItems = teams.map((team) => {
            const title = team.personal ? 'Personal contacts' : team.name;
            const abbr = title.split(/\s+/).map((s)=>s[0].toUpperCase()).join('');
            const hasProjectParticipants = team.hasProjectParticipants ? (
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-participant_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                )
                : '';
            const hasProjectMembers = team.hasProjectMembers.length ? (
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-member_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                )
                : '';

            return (
                <div ref='team'
                     className={`${b}__group-item ${b}__group-item_id_${team.id} ${b}__group-item_selected_${selectedGroup.kind=='team' && selectedGroup.id == team.id}`}
                     onClick={this._handleTeamSelect.bind(this, team.id)}>
                    <div style={{backgroundColor: team.avatar.color}} data-abbr={abbr}
                         className={`${b}__group-item-avatar b-avatar b-avatar_size_m b-avatar_empty_yes`}></div>
                    <div className={`${b}__group-info`}>{title} · {team.persons.length}</div>
                    {hasProjectParticipants}
                    {hasProjectMembers}
                </div>
            )
        });

        return (
            <div className={cx(className, b, `${b}_mode_${mode}`)}>
                <div className={`${b}__content`}>
                    <div className={`${b}__left-column`}>
                        {groupItems}
                        <div className={`${b}__group`}>
                            My teams
                            <div className={`${b}__group-icon`}>
                                <div className="b-icon-sc b-icon-sc_img_person"></div>
                            </div>
                        </div>
                        {teamItems}
                    </div>
                    <div className={`${b}__right-column`}>
                        <PersonList persons={persons}/>
                    </div>
                </div>

                <div className={`${b}__toggle-button`} onClick={this._handleChangeMode}>
                    <div className="b-icon-sc b-icon-sc_img_close-box"></div>
                </div>
            </div>
        )
    }
}

export default PeopleSuggest;
