'use strict';

import React from 'react';
import Suggest from './components/suggest';

const App = React.createClass({
  getInitialState: function() {
    return {title: 'People suggest'};
  },
  render: function() {
    return (
        <div>
            <h1>Single</h1>
            <Suggest key='single' className='suggest1'/>
            <h1>Multi</h1>
            <Suggest key='multi' className='suggest1' multiSelect={true}/>
        </div>
    );
  }
});


React.render(<App />, document.getElementById('app'));
