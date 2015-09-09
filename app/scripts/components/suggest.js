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
import Immutable, {List, Map} from 'immutable';

const cx = React.addons.classSet;
const ComponentBase = mixins(ListenerMixin);
const b = 'people-suggest';
const DEFAULT_GROUP = 'frequent';

function getState() {
    const allGroups = SuggestStore.getState().groups.map(_.clone);
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
        onSelect: PropTypes.func,
        multiSelect: PropTypes.bool
    };

    static defaultProps = {
        multiSelect: false
    };

    state = _.assign(getState(), {
        selectedGroup: {kind: DEFAULT_GROUP},
        mode: 'full',
        selected: [],
        searchBy: ''
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
        const {multiSelect} = this.props;
        let {selected, searchBy} = this.state;

        if (text === searchBy) return;

        if (!multiSelect && selected) {
            selected = null;
        }

        this.setState({searchBy: text, selected});
    };

    handleSelect = (person) => {
        const {multiSelect} = this.props;
        let {selected} = this.state;
        let searchBy;

        console.warn('selected', person);
        if (multiSelect) {
            if (!_.find(selected, {id: person.id})) {
                selected = selected.concat(person);
            }
        } else {
            selected = person;
            const inputEl = React.findDOMNode(this.refs.input.refs.input);
            inputEl.focus();
            setTimeout(function () {
                inputEl.setSelectionRange(0, person.fullName.length);
            }, 20);
            searchBy = person.fullName;
        }

        this.setState({selected, searchBy});
    };

    _handleRemoveSelected = (p) => {
        let {selected} = this.state;

        if (_.isArray(selected) && selected.indexOf(p) !== -1) {
            selected = _.without(selected, p);
        } else if (selected == p) {
            selected = null;
        }

        this.setState({selected});
    };

    render() {
        const {
            mode,
            groups,
            teams,
            selectedGroup,
            searchBy,
            selected
        } = this.state;

        console.warn('render suggest', this.state);
        const {className} = this.props;

        let personGroups = [];

        if (mode == 'full') {
            if (searchBy) {
                // ищем по всем группам как в кратком режиме
                if (selectedGroup.kind === 'frequent') {
                    personGroupsForAll();
                } else {
                    personGroupForTeam();
                }
            } else {
                const grp = selectedGroup.kind == 'team' ? _.find(teams, {id: selectedGroup.id}) : groups[selectedGroup.kind];
                if (grp.kind == 'team') {
                    personGroupForTeam();
                } else {
                    personGroups = [{
                        title: grp.kind == 'team' ? grp.name : titleByGroupKind(grp.kind),
                        kind: grp.kind,
                        persons: grp.persons
                    }];
                }
            }
        } else {
            if (searchBy) {
                personGroupsForAll();
            } else {
                personGroups = [{title: titleByGroupKind('frequent'), kind: 'frequent', persons: groups.frequent.persons}];
            }
        }

        function personGroupForTeam() {
            const grp = selectedGroup.kind == 'team' ? _.find(teams, {id: selectedGroup.id}) : groups[selectedGroup.kind];
            const memberIds = _.values(groups).reduce((ids, {persons}) => {
                persons.forEach((p)=> ids.push(p.id));
                return ids;
            }, []);

            personGroups = [{
                title: 'Members',
                kind: 'members',
                persons: grp.persons.filter((p)=>memberIds.indexOf(p.id) !== -1)
            }, {
                title: 'Non-members',
                kind: 'non_members',
                persons: grp.persons.filter((p)=>memberIds.indexOf(p.id) === -1)
            }]
        }

        function personGroupsForAll() {
            personGroups = _.values(groups)
                .filter((g) => g.kind !== 'frequent')
                .map((group) => ({title: titleByGroupKind(group.kind), kind: group.kind, persons: group.persons}));

            const teamPersons = _.values(_.indexBy(_.flatten(_.pluck(teams, 'persons')), 'id'));
            const participantPersonsIds =  _.pluck(_.flatten(_.pluck(personGroups, 'persons')), 'id');

            personGroups.push({
                title: 'Members of teams',
                persons: teamPersons.filter((p) => participantPersonsIds.indexOf(p.id) !== -1)
            });

            personGroups.push({
                title: 'Other',
                persons: teamPersons.filter((p) => participantPersonsIds.indexOf(p.id) === -1)
            });
        }

        if (searchBy) {
            const re = new RegExp(searchBy, 'i');

            personGroups = personGroups
                .map((group) => {
                    group.persons = group.persons.filter(({fullName}) => {
                        return re.exec(fullName)
                    });
                    return group;
                });
        }

        personGroups = personGroups
            .filter((group) => group.persons.length)
            .map((group) => {
                let selectedEmp = _.isArray(selected) ? selected : [selected];

                group.persons = group.persons.map((emp) => {
                    emp.isSelected = !!_.intersection([emp], selectedEmp).length;

                    return emp;
                });

                return group;
        });

        const groupItems = _.pairs(groups).map(([kind, group]) => {
            let title = titleByGroupKind(kind);
            let icon = getIconByGroup(kind);
            let htmlIconForGroup = icon
                ? <div className={`${b}__group-item-icon`}>
                    <div className={`b-icon-sc b-icon-sc_img_${icon} ${b}__${kind}-icon`}></div>
                </div>
                : '';

            return (
                <div ref={kind}
                     className={cx(`${b}__group-item ${b}_group-item_id_frequent ${b}__group-item_selected_${selectedGroup && selectedGroup.kind==kind}`)}
                     onClick={this._handleGroupSelect.bind(this, kind)}>
                    {htmlIconForGroup}
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
            const hasParticipants = team.hasParticipants
                ? (
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-participant_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                )
                : '';
            const hasMembers = team.hasMembers
                ? (
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-member_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                )
                : '';

            return (
                <div ref='team'
                     className={`${b}__group-item ${b}__group-item_id_${team.id} ${b}__group-item_selected_${selectedGroup && selectedGroup.kind=='team' && selectedGroup.id == team.id}`}
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
                    <SuggestInput ref='input'
                                  onChange={this._handleSearch}
                                  onRemoveSelected={this._handleRemoveSelected}
                                  value={searchBy}
                                  selectedPersons={selected}/>
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
                            <PersonList persons={personGroups} onSelect={this.handleSelect}/>
                        </div>
                    </div>

                    <div className={`${b}__toggle-button`} onClick={this._handleChangeMode}>
                        <div className="b-icon-sc b-icon-sc_img_minimize"></div>

                    </div>
                </div>
            </div>
        );

        function getIconByGroup(kind) {
            let icons = {frequent: 'frequent', project_participants: 'person', project_members: 'person'};

            return icons[kind] || '';
        }
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
