import React from 'react/addons';
import _ from 'lodash';
import mixins from 'es6-react-mixins'

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
        if (key == 'ArrowLeft') {
            //this.refs.input.getDOMNode().blur();
            this._items.length && _.last(this._items).getDOMNode().focus();
        }
    };

    _handleItemFocus = (p) => {
        this.setState({focused: p})
    };

    _handleItemBlur = (p) => {
        this.setState({focused: null})
    };

    render() {
        const {focused} = this.state;
        const {value, selectedPersons} = this.props;

        console.warn('render input', this.props);
        let selectedItems;

        this._items = [];
        if (selectedPersons) {
            const multiSelect = _.isArray(selectedPersons);
            selectedItems = (multiSelect ? selectedPersons : [selectedPersons]).map((p, index, list) => (
                <div className={cx(`${b}__item`, p == focused && `${b}__item_focused_true`)}>
                    {p.fullName}
                    <span onClick={this._handleRemove.bind(this, p)}>X</span>
                    <input className={`${b}__item-input`} tabIndex='-1' ref={(e) => e && this._items.push(e)}
                           onFocus={this._handleItemFocus.bind(this, p)}
                           onBlur={this._handleItemBlur.bind(this, p)}
                        />
                </div>
            ));
        }

        return (
            <div className={b}>
                {selectedItems}
                <input
                    ref='input'
                    type='text'
                    value={value}
                    onKeyDown={this._handleKeyDown}
                    onChange={this.onChange} />
            </div>
        );
    }

    onChange = (e) => {
        //this.setState({ value: e.target.value });
        this.props.onChange && this.props.onChange(e.target.value);
    }
}
