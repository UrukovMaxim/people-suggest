import React from 'react';
import {Component, PropTypes} from 'react';
import _ from 'lodash';

const b = 'suggest-input';

export default class SuggestInput extends Component {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func,
        selectedPersons: PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.array
        ])
    };

    static defaultProps = {
        selectedPersons: []
    };

    shouldComponentUpdate({value}) {
        return value !== this.props.value;
    }

    handleFocus = () => {
      React.findDOMNode(this.refs.input).focus();
    };

    render() {
        const {value, selectedPersons} = this.props;

        let selectedItems;

        if (selectedPersons) {
            const multiSelect = _.isArray(selectedPersons);
            selectedItems = (multiSelect ? selectedPersons : [selectedPersons]).map((p) => (<div>{p.fullName}</div>));
        }

        return (
            <div className={b} onFocus={this.handleFocus}>
                {selectedItems}
                <input
                    ref='input'
                    type='text'
                    value={value}
                    onChange={this.onChange} />
            </div>
        );
    }

    onChange = (e) => {
        //this.setState({ value: e.target.value });
        this.props.onChange && this.props.onChange(e.target.value);
    }
}
