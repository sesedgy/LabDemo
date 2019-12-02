import React from 'react';
import Tippy from '@tippy.js/react';

import 'tippy.js/dist/tippy.css';
import RootLabel from '../RootLabel';

const Tooltip = ({
  children,
  flagsList = [],
  onUserClick,
  userId,
}) => {
  const myResults = flagsList.filter(flag => flag.userId === userId);
  const otherResults = flagsList.filter(flag => flag.userId !== userId);

  console.log(flagsList)
    console.log(myResults)
  console.log(otherResults)
  return (
    <Tippy
      content={(
        <div
          className="tooltip-content_container"
        >
          <div className="my-results">
            {myResults.map(flag => (
              <div className="result">
                <span className="time">{flag.wasteTime}</span>
                { flag.flagType === '1' && <RootLabel /> }
              </div>
            ))}
          </div>
          <div className="other-results">
            {otherResults.map(flag => (
              <div className="result">
                <span className="username">{flag.userName}</span>
                <span className="time">{flag.wasteTime}</span>
                { flag.flagType === '1' && <RootLabel /> }
              </div>
            ))}
          </div>
        </div>
    )}
      distance={7}
      touch
      interactive
      placement="right"
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;
