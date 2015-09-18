import React from 'react';
import mixins from 'es6-react-mixins';

const {Component, PropTypes, addons} = React;
const ComponentBase = mixins(addons.PureRenderMixin);
const cx = React.addons.classSet;

const DEFAULT_COLOR = '#4db6ac';
const DEFAULT_SIZE = 'm';
const b = 'b-avatar';

export default class Avatar extends ComponentBase {

    static defaultProps = {
        size: DEFAULT_SIZE
    };

    static propTypes = {
        size: PropTypes.string,
        employee: PropTypes.object.isRequired
    };

    render() {
        const {
            employee,
            size,
            className} = this.props;

        const {
            avatarUrl,
            fullName,
            name,
            surname,
            email,
            id,
            isExternal,
            color} = employee;

        const title = fullName || name + ' ' + surname || email;
        const abbr = (name && surname) ? name[0].toUpperCase() + surname[0].toUpperCase() : fullName ? fullName.split(/\s+/).slice(0, 2).map((s)=>{return s[0]}).join('') : '';
        const isEmptyAvatar = !avatarUrl && (id && !isExternal || abbr);
        const isAnimalAvatar = !isEmptyAvatar && email;
        const isEmailAvatar = !isAnimalAvatar && !id;

        const avatar = avatarUrl
            ? (
                <img
                    src={avatarUrl}
                    title={title}
                    className={cx(`
                        ${b}
                        ${className}
                        ${b}_size_${size}`)}
                />)
            : (
                <i
                    title={title}
                    className={cx(`
                        ${b}
                        ${className}
                        ${b}_size_${size}
                        ${b}_empty_${isEmptyAvatar}
                        ${b}_animal_${isAnimalAvatar}
                        ${b}_email_${isEmailAvatar}
                        ${isAnimalAvatar ? 'b-icon-sc b-icon-sc_img_animal-' + (id % 22 + 1) : ''}`)}
                    style={{
                        'background-color': color || DEFAULT_COLOR
                    }}
                    data-abbr={abbr}>
                </i>);

        return avatar;
    }
}
