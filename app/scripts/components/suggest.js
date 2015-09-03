import React from 'react/addons';
import _ from 'lodash';
import {Component, PropTypes} from 'react';
import mixins from 'es6-react-mixins'
import ListenerMixin from 'alt/mixins/ListenerMixin';
import PersonStore from '../stores/person';
import SuggestStore from '../stores/suggest';
import PersonActions from '../actions/person';
import PersonList from '../components/person-list';
import SuggestInput from '../components/suggest-input';

const cx = React.addons.classSet;
const ComponentBase = mixins(ListenerMixin);
const b = 'people-suggest';

function getState() {
    const allGroups = SuggestStore.getState().groups;
    const allPersons = PersonStore.getState().persons;

    const groups = ['frequent', 'project_participants', 'project_members', 'team_members', 'team_participants', 'task_members']
        .reduce((dic, kind) => {
            const group = _.find(allGroups, {kind});

            if (group) {
                dic[kind] = processGroup(group);
            }
            return dic;
        }, {});

    const teams = _.where(allGroups, {kind: 'team'}).map((team) => {
        const participantsGroup = groups['project_participants'] || groups['team_participants'];
        const membersGroup = groups['project_members'] || groups['team_members'];
        team.hasParticipants = !!participantsGroup && _.intersection(participantsGroup.persons, team.persons);
        team.hasMembers = !!membersGroup && _.intersection(membersGroup.persons, team.persons);
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
        mode: 'full',
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

    _handleSearch = (text) => {
        this.setState({searchBy: text});
    };

    render() {
        const {mode, groups, teams, selectedGroup, searchBy} = this.state;
        const {className} = this.props;

        let personGroups = [];

        if (mode == 'full') {
            if (searchBy) {
            } else {
                const grp = selectedGroup.kind == 'team' ? _.find(teams, {id: selectedGroup.id}) : groups[selectedGroup.kind];
                personGroups = [{title: grp.kind == 'team' ? grp.name : titleByGroupKind(grp.kind), persons: grp.persons}];
            }
        } else {
            if (searchBy) {

            } else {
                personGroups = [{title: titleByGroupKind('frequent'), persons: groups.frequent.persons}];
            }
        }

        const groupItems = _.pairs(groups).map(([kind, group]) => {
            let title = titleByGroupKind(kind);

            return (
                <div ref={kind}
                     className={cx(`${b}__group-item ${b}_group-item_id_frequent ${b}__group-item_selected_${selectedGroup.kind==kind}`)}
                     onClick={this._handleGroupSelect.bind(this, kind)}>
                    <div className={`${b}__group-item-icon`}>
                        <div className={`b-icon-sc b-icon-sc_img_crown-on ${b}__${kind}-members-icon`}></div>
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
            const hasParticipants = team.hasParticipants ? (
                <div className={`${b}__person-icon ${b}__person-icon_is-team-participant_true`}>
                    <div className="b-icon-sc b-icon-sc_img_person"></div>
                </div>
            )
                : '';
            const hasMembers = team.hasMembers.length ? (
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
                    {hasParticipants}
                    {hasMembers}
                </div>
            )
        });

        return (
            <div>
                <div>
                    <SuggestInput onChange={this._handleSearch}/>
                </div>
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
                            <PersonList persons={personGroups}/>
                        </div>
                    </div>

                    <div className={`${b}__toggle-button`} onClick={this._handleChangeMode}>
                        <div className="b-icon-sc b-icon-sc_img_close-box"></div>
                    </div>
                </div>
            </div>
        )
    }
}

function titleByGroupKind(kind) {
    switch (kind) {
        case 'frequent':
            return 'Frequent contacts';
        case 'project_participants':
            return 'Project participants';
        case 'project_members':
            return 'Project members';
        case 'team_members':
            return 'Team members';
        case 'team_participants':
            return 'Team participants';
        case 'task_members':
            return 'Task members';
    }
}

export default PeopleSuggest;
