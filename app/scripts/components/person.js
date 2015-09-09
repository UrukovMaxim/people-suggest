import React from 'react';
import mixins from 'es6-react-mixins'

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
            ...other
        } = this.props;

        return (
            <div {...other} className={`${b}__employee ${b}__employee_selected_${person.isSelected} ${b}__employee_id_${person.id}`} onClick={this.props.onClick || noop} >

                <div className={`${b}__avatar`}>
                    <img
                        src={person.avatarUrl}
                        title={person.fullName} className={`b-avatar ${b}__avatar-img b-avatar_size_m`}/>
                    <div className={`${b}__selected-avatar-img b-avatar b-avatar_size_m b-avatar_empty_yes`}>
                        <div className={`${b}__selected-avatar-icon`}>
                            <div className={'b-icon-sc b-icon-sc_img_check'}></div>
                        </div>
                    </div>
                </div>
                    <div className={`${b}__info-wrap`}>
                        <div className={`${b}__employee-name`}>{person.fullName}</div>
                        <div className={`${b}__employee-info`}>{person.position}</div>
                    </div>
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-member_true`}>
                        <div className={'b-icon-sc b-icon-sc_img_person'}></div>
                    </div>
                    <div className={`${b}__person-icon ${b}__person-icon_is-team-participant_true`}>
                        <div className={'b-icon-sc b-icon-sc_img_person'}></div>
                    </div>
            </div>
        )
    }
}
