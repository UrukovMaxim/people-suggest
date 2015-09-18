import React from 'react/addons';
import _ from 'lodash';
import mixins from 'es6-react-mixins';
import Avatar from '../components/avatar';

const {Component, PropTypes, addons} = React;
const ComponentBase = mixins(addons.PureRenderMixin);
const b = 'suggest-input';
const cx = React.addons.classSet;

export default class SuggestInput extends ComponentBase {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func,
        onRemoveSelected: PropTypes.func,
        selectedPersons: PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.array
        ])
    };

    static defaultProps = {
        selectedPersons: []
    };

    state = {
        focused: null
    };

    _handleRemove = (p) => {
        if (this.props.onRemoveSelected) {
            this.props.onRemoveSelected(p)
        }
    };

    _handleKeyDown = ({key}) => {
        this.props.onKeyDown && this.props.onKeyDown(key);
        //if (key == 'ArrowLeft') {
        //    //this.refs.input.getDOMNode().blur();
        //    this._items.length && _.last(this._items).getDOMNode().focus();
        //}
    };

    _handleItemFocus = (p) => {
        this.setState({focused: p})
    };

    _handleItemBlur = (p) => {
        this.setState({focused: null})
    };

    render() {
        const {focused} = this.state;
        const {selectedPersons} = this.props;

        console.warn('render input', this.props);
        let selectedItems = [];

        this._items = [];

        if (selectedPersons) {
            const multiSelect = _.isArray(selectedPersons);

            selectedItems = (multiSelect ? selectedPersons : [selectedPersons]).map((person, index, list) => (
                <div className={cx(`${b}__item`,`${b}__item_focused_${person == focused}`, `${b}__item_type_${multiSelect ? 'multi' : 'single'}`)}>
                    <Avatar
                        ref='avatar'
                        employee = {person}
                        className={`${b}__item-avatar`}/>
                    <span className = {`${b}__item-emp-name`}>{person.fullName}</span>
                    {this.getInputItem(!multiSelect)}
                    <span className = {`${b}__item-emp-team`}>, {person.position}</span>
                    <div className={cx(`${b}__item-remove-icon`, 'b-icon-sc b-icon-sc_img_remove')}
                         onClick={this._handleRemove.bind(this, person)}>
                    </div>
                    <input className={`${b}__item-input`} tabIndex='-1' ref={(e) => e && this._items.push(e)}
                           onFocus={this._handleItemFocus.bind(this, person)}
                           onBlur={this._handleItemBlur.bind(this, person)}/>
                    {this.getInputItem(multiSelect)}
                </div>
            ));
        }

        return (
            <div className = {`${b}__items-wrap`}>
                {selectedItems}
                {this.getInputItem(!selectedItems.length)}
                {this.updateInputFocus()}
            </div>
        );
    }

    getInputItem = (isMulti) => {
        const {value} = this.props;

        return (isMulti
            ? (
                <input
                    className = {`${b}__input`}
                    ref = {(input) => {this._input = input}}
                    type = 'text'
                    value = {value}
                    onKeyDown = {this._handleKeyDown}
                    onChange = {this.onChange}/>)
            : ''
        );
    };

    updateInputFocus = () => {
        setTimeout(() => {
            const $inputEl = $(React.findDOMNode(this._input));

            if (!$inputEl) return;

            const inputVal = $inputEl.val();

            $inputEl.attr('size', inputVal.length)
                .val('')
                .focus()
                .val(inputVal);
        }, 0);

        return '';
    };

    onChange = (e) => {
        this.props.onChange && this.props.onChange(e.target.value);
    }
}
