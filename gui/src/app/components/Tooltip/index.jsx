import React from 'react';
import Tippy from '@tippy.js/react';

const Tooltip = ({
  children,
  successTries = [],

}) => (
  <Tippy
    content={(
      <div
        className="tooltip-content_container"
      >GOVNYASHKA</div>
    )}
    distance={7}
    touch
    interactive
    placement='right'
  >
    {children}
  </Tippy>
);

export default Tooltip;
