import React from 'react';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

import RootLabel from '../RootLabel';

import './styles.css';

const Tooltip = ({
  children,
  flagsList = [],
  onUserClick,
  userId,
}) => {
  const myResults = flagsList.filter(flag => flag.userId === userId);
  const otherResults = flagsList.filter(flag => flag.userId !== userId);

  return (
    <Tippy
      content={(
        <div
          className="tooltip-content_container"
        >
          <div className="my-results">
            <div className="label">My results</div>
            {myResults.length > 0 ? (
              <>
                {myResults.map(flag => (
                  <div className="result">
                    <span className="time">{flag.wasteTime}</span>
                    { flag.flagType === '1' && <RootLabel /> }
                  </div>
                ))}
              </>
            ) : <div>empty</div>}
          </div>
          <div className="other-results">
            <div className="label">Other results</div>
            {otherResults.length > 0 ? (
              <>
                {otherResults.map(flag => (
                  <div className="result" onClick={() => {onUserClick(flag.userId, flag.tryId)}}>
                    <span className="username">{flag.userName}</span>
                    <span className="time">{flag.wasteTime}</span>
                    { flag.flagType === '1' && <RootLabel /> }
                  </div>
                ))}
              </>
            ) : <div>empty</div>}

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
