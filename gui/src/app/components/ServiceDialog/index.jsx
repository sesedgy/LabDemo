import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import RootLabel from '../RootLabel';

import './styles.css';

const ServiceDialog = ({
  open,
  flagsList = [],
  onClose,
  onUserClick,
  userId,
}) => {
  const myResults = flagsList.filter(flag => flag.userId === userId);
  const otherResults = flagsList.filter(flag => flag.userId !== userId);

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      PaperProps={{
        style: {
          borderRadius: 0,
        },
      }}
    >
      <div className="service_dialog">
        <div className="my-results">
          <div className="label">My results</div>
          {myResults.length > 0 ? (
            <>
              {myResults.map(flag => (
                <div className="result" key={flag.tryId + flag.flagType}>
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
                <div
                  className="result"
                  onClick={() => {
                    onUserClick(flag.userId, flag.tryId, flag.userName);
                    onClose();
                  }}
                  key={flag.tryId + flag.flagType}
                >
                  <span className="username">{flag.userName}</span>
                  <span className="time">{flag.wasteTime}</span>
                  { flag.flagType === '1' && <RootLabel /> }
                </div>
              ))}
            </>
          ) : <div>empty</div>}

        </div>
      </div>
    </Dialog>
  );
};

export default ServiceDialog;
