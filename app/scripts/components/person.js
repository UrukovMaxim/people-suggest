import React from 'react';
import {Component, PropTypes} from 'react';

const b = 'people-suggest';

export default class Person extends Component {

    static propTypes = {
        person: PropTypes.object.isRequired
    };

    render() {

        const {person} = this.props;

        return (
            <div className={`${b}__employee ${b}__employee_id_${person.id}`}>

                <div className={`${b}__avatar`}>
                    <img
                    src={'//static.synccloud.com/avatars/m/49f0bbd5_1c22_4f37_813c_c2da33d195e6.jpg'}
                    title={person.fullName} className={`b-avatar ${b}__avatar-img b-avatar_size_m`}/>
                    <div className={`${b}__selected-avatar-img b-avatar b-avatar_size_m b-avatar_empty_yes`}>
                        <div className={`${b}__selected-avatar-icon`}>
                            <div className={'b-icon-sc b-icon-sc_img_person'}></div>


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
