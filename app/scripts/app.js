'use strict';

import React from 'react';
import Suggest from './components/suggest';

const App = React.createClass({
  getInitialState: function() {
    return {title: 'People suggest'};
  },
  render: function() {
    return (
      <Suggest className='suggest1'/>
    );
  }
});


React.render(<App />, document.getElementById('app'));

