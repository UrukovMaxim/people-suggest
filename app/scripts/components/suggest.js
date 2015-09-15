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
const DEFAULT_HOVER_PERSON = 0;
const DEFAULT_HOVER_GROUP = -1;
const DEFAULT_FOCUS_COLUMN = 'right';

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

        team.persons = team.persons.map((id) => {
            let person = allPersons[id];

            person.isGroupParticipant = !!participantsGroup && !!_.intersection([person], participantsGroup.persons).length;
            person.isGroupMember = !!membersGroup && !!_.intersection([person], membersGroup.persons).length;

            return person;
        });

        return team;
    });

    function prepareGroupsAndTeams(list) {
        _.map(list, ((item) => {
            const participantsGroup = groups['project_participants'] || groups['team_participants'];
            const membersGroup = groups['project_members'] || groups['team_members'];

            item.hasParticipants = !!participantsGroup && _.intersection(participantsGroup.persons, item.persons);
            item.hasMembers = !!membersGroup && _.intersection(membersGroup.persons, item.persons);

            return item;
        }));
    }

    prepareGroupsAndTeams(groups);
    prepareGroupsAndTeams(teams);

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
        indexHoverPerson: DEFAULT_HOVER_PERSON,
        indexHoverGroup: DEFAULT_HOVER_GROUP,
        focusColumn: DEFAULT_FOCUS_COLUMN,
        mode: 'full',
        selected: [],
        searchBy: ''
    });

    componentDidMount() {
        this.persons = {};

        this.listenTo(PersonStore, getState);
        this.listenTo(SuggestStore, getState);
    }

    _handleKeyDown = (key) => {
        switch (key) {
            case 'ArrowLeft':
                this.setState({focusColumn: 'left', indexHoverPerson: -1, indexHoverGroup: 0});
                break;
            case 'ArrowRight':
                this.setState({focusColumn: 'right', indexHoverGroup: -1, indexHoverPerson: 0});
                break;
            case 'ArrowUp':
                this._moveIndexByOne(-1);
                break;
            case 'ArrowDown':
                this._moveIndexByOne(1);
                break;
            case 'Escape':
                console.log(key);
                break;
            case 'Enter':
                this._handleEnterPress();
                break;
        }
    };

    _handleEnterPress = () => {
        if (this.state.focusColumn === 'left') {
            const selectGroup = this.leftColumnItems[this.state.indexHoverGroup];
            const id = selectGroup.id;

            this['_handle' + (id ? 'Team': 'Group') + 'Select'](id || selectGroup.kind);
        } else {
            const selectEmp = this.rightColumnItems[this.state.indexHoverPerson];
            const empElem = React.findDOMNode(this.refs['person-list'].refs['item' + selectEmp.id]);

            this[empElem.classList.contains('person-list__employee_selected_true')
                ? '_handleRemoveSelected'
                : 'handleSelect'
                ](selectEmp);
        }
    };

    _moveIndexByOne = (index) => {
        let {
            focusColumn,
            indexHoverPerson,
            indexHoverGroup
        } = this.state;

        const listLength = this[focusColumn + 'ColumnItems'].length;
        const $list = $(React.findDOMNode(this.refs['person-list']));
        const $listElemHeight = $list.find('.person-list__employee').eq(0).height();
        const prevScroll = $list.scrollTop();
        let scrollTop;

        if (!listLength) return;

        const prevIndex = focusColumn === 'left' ? indexHoverGroup : indexHoverPerson;
        let newIndex = prevIndex + index;

        if (listLength === newIndex) {
            scrollTop = 0;
            newIndex = 0;
        } else if (newIndex < 0) {
            scrollTop = 100000;
            newIndex = listLength - 1;
        } else {
            scrollTop = prevScroll + (index === 1 ? $listElemHeight : -$listElemHeight);
        }

        let newState = {};
        newState[focusColumn === 'left' ? 'indexHoverGroup' : 'indexHoverPerson'] = newIndex;

        focusColumn === 'right' && $list.scrollTop(scrollTop);

        this.setState(newState);
    };

    _handleChangeMode = () => {
        const mode = this.state.mode == 'short' ? 'full' : 'short';

        this.setState({mode});
    };

    _handleGroupSelect = (kind) => {
        this.setState({selectedGroup: {kind}, indexHoverPerson: 0, indexHoverGroup: -1, focusColumn: 'right'});
    };

    _handleTeamSelect = (id) => {
        this.setState({selectedGroup: {kind: 'team', id}, indexHoverPerson: 0, indexHoverGroup: -1, focusColumn: 'right'});
    };

    _handleSearch = (text) => {
        const {multiSelect} = this.props;
        let {selected, searchBy} = this.state;

        if (text === searchBy) return;

        if (!multiSelect && selected) {
            selected = null;
        }

        this.setState({searchBy: text, selected, indexHoverPerson: 0});
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
            selected,
            indexHoverPerson,
            indexHoverGroup
        } = this.state;

        this.leftColumnItems = _.flatten([_.values(groups), teams]);

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
                persons: grp.persons.filter((p) => memberIds.indexOf(p.id) !== -1)
            }, {
                title: 'Non-members',
                kind: 'non_members',
                persons: grp.persons.filter((p) => memberIds.indexOf(p.id) === -1)
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

        personGroups = personGroups.filter((group) => group.persons.length);
        this.rightColumnItems = _.flatten(_.pluck(personGroups, 'persons'), true);

        personGroups = personGroups.map((group) => {
            let selectedEmp = _.isArray(selected) ? selected : [selected];

            group.persons = group.persons.map((emp) => {
                emp.isSelected = !!_.intersection([emp], selectedEmp).length;
                emp.isHover = emp === this.rightColumnItems[indexHoverPerson];
                return emp;
            });

            return group;
        });

        const groupItems = _.pairs(groups).map(([kind, group]) => {
            let title = titleByGroupKind(kind);
            let icon = getIconByGroupKind(kind);
            let htmlIconForGroup = icon
                ? (
                    <div className={`${b}__group-item-icon`}>
                        <div className={`b-icon-sc b-icon-sc_img_${icon} ${b}__${kind}-icon`}></div>
                    </div>
                )
                : '';

            return (
                <div ref={kind}
                     className={cx(`${b}__group-item ${b}_group-item_id_frequent ${b}__group-item_hover_${group === this.leftColumnItems[indexHoverGroup]} ${b}__group-item_selected_${selectedGroup && selectedGroup.kind==kind}`)}
                     onClick={this._handleGroupSelect.bind(this, kind)}>
                    {htmlIconForGroup}
                    <div className={`${b}__group-info`}>{title} · {group.persons.length}</div>
                    {getIconForParticipantsGroup(group)}
                    {getIconForMembersGroup(group)}
                </div>
            )
        });

        const teamItems = teams.map((team) => {
            const title = team.personal ? 'Personal contacts' : team.name;
            const abbr = title.split(/\s+/).map((s)=>s[0].toUpperCase()).join('');

            return (
                <div ref='team'
                     className={`${b}__group-item ${b}__group-item_id_${team.id} ${b}__group-item_hover_${team === this.leftColumnItems[indexHoverGroup]} ${b}__group-item_selected_${selectedGroup && selectedGroup.kind=='team' && selectedGroup.id == team.id}`}
                     onClick={this._handleTeamSelect.bind(this, team.id)}>
                    <div style={{backgroundColor: team.avatar.color}} data-abbr={abbr}
                         className={`${b}__group-item-avatar b-avatar b-avatar_size_m b-avatar_empty_yes`}></div>
                    <div className={`${b}__group-info`}>{title} · {team.persons.length}</div>
                    {getIconForParticipantsGroup(team)}
                    {getIconForMembersGroup(team)}
                </div>
            )
        });

        return (
            <div>
                <div>
                    <SuggestInput ref='input'
                                  onChange={this._handleSearch}
                                  onKeyDown={this._handleKeyDown}
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
                            <PersonList
                                ref='person-list'
                                persons={personGroups}
                                onSelect={this.handleSelect}/>
                        </div>
                    </div>

                    <div className={`${b}__toggle-button`} onClick={this._handleChangeMode}>
                        <div className="b-icon-sc b-icon-sc_img_minimize"></div>

                    </div>
                </div>
            </div>
        );

        function getIconByGroupKind(kind) {
            let icons = {frequent: 'frequent', project_participants: 'person', project_members: 'person'};

            return icons[kind] || '';
        }

        function getIconForParticipantsGroup(group) {
            return (group.hasParticipants && group.hasParticipants.length)
                ? (
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-participant_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                )
                : '';
        }

        function getIconForMembersGroup(group) {
            return (group.hasMembers && group.hasMembers.length)
                ? (
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-member_true`}>
                        <div className="b-icon-sc b-icon-sc_img_person"></div>
                    </div>
                )
                : '';
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
