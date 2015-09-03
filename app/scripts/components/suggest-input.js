import React from 'react';
import {Component, PropTypes} from 'react';

export default class SuggestInput extends Component {
    static propTypes = {
        onChange: PropTypes.func
    };

    state = {value: ''};

    render() {
        const {value} = this.state;

        return (
            <input
                type='text'
                value={value}
                onChange={this.onChange} />
        );
    }

    onChange = (e) => {
        this.setState({ value: e.target.value });
        this.props.onChange && this.props.onChange(e.target.value);
    }
}
