import React from 'react';
import mixins from 'es6-react-mixins';
import Avatar from '../components/avatar';

const {Component, PropTypes, addons} = React;
const ComponentBase = mixins(addons.PureRenderMixin);

const b = 'person-list';
const noop = () => {};

export default class Person extends ComponentBase {

    static propTypes = {
        person: PropTypes.object.isRequired
    };

    render() {
        const {
            person,
            hover,
            ...other
        } = this.props;

        let groupParticipantIcon = person.isGroupParticipant
            ? (
                <div className={`${b}__person-icon ${b}__person-icon_is-team-participant_true`}>
                    <div className={'b-icon-sc b-icon-sc_img_person'}></div>
                </div>
            )
            : '';

        let groupMemberIcon = person.isGroupMember
            ? (
                <div className={`${b}__person-icon ${b}__person-icon_is-team-member_true`}>
                    <div className={'b-icon-sc b-icon-sc_img_person'}></div>
                </div>
            )
            : '';

        return (
            <div {...other} className={`${b}__employee ${b}__employee_hover_${person.isHover}  ${b}__employee_selected_${person.isSelected} ${b}__employee_id_${person.id}`} onClick={this.props.onClick || noop} >
                <div className={`${b}__avatar`}>
                    <Avatar
                        ref='avatar'
                        employee = {person}
                        className={`${b}__avatar-img`}/>
                    <div className={`${b}__selected-avatar-img b-avatar b-avatar_size_m b-avatar_empty_true`}>
                        <div className={`${b}__selected-avatar-icon`}>
                            <div className={'b-icon-sc b-icon-sc_img_check'}></div>
                        </div>
                    </div>
                </div>
                    <div className={`${b}__info-wrap`}>
                        <div className={`${b}__employee-name`}>{person.fullName}</div>
                        <div className={`${b}__employee-info`}>{person.position}</div>
                    </div>
                {groupParticipantIcon}
                {groupMemberIcon}
            </div>
        )
    }
}
