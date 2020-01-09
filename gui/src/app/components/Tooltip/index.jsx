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
  openModal,

}) => {
  flagsList = flagsList.sort((a, b) => (a.wasteTime > b.wasteTime ? 1 : a.wasteTime === b.wasteTime ? 0 : -1));
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
                {myResults.slice(0, 4).map(flag => (
                  <div className="result" key={flag.tryId + flag.flagType}>
                    <span className="time">{flag.wasteTime}</span>
                    { flag.flagType === '1' && <RootLabel /> }
                  </div>
                ))}
              </>
            ) : <div>empty</div>}
            {myResults.length > 5 && <div className="show-more" onClick={openModal}>Show more...</div>}
          </div>
          <div className="other-results">
            <div className="label">Other results</div>
            {otherResults.length > 0 ? (
              <>
                {otherResults.slice(0, 4).map(flag => (
                  <div className="result" onClick={() => { onUserClick(flag.userId, flag.tryId, flag.userName); }} key={flag.tryId + flag.flagType}>
                    <span className="username">{flag.userName}</span>
                    <span className="time">{flag.wasteTime}</span>
                    { flag.flagType === '1' && <RootLabel /> }
                  </div>
                ))}
              </>
            ) : <div>empty</div>}
            {otherResults.length > 5 && <div className="show-more" onClick={openModal}>Show more...</div>}

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
