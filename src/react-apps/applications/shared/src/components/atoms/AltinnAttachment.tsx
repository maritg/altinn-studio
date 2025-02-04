import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import * as React from 'react';
import { IAttachment } from '../../types/index.d';
import { AltinnIcon } from '../AltinnIcon';

const styles = createStyles({
  a: {
    '&:hover': {
      borderBottom: '0px',
    },
    '&:focus': {
      borderBottom: '0px',
    },
    '&:active': {
      borderBottom: '0px',
    },
    '&:after': {
      display: 'none !important',
    },
  },
  listItemPadding: {
    paddingLeft: '2.0rem',
  },
  listItemPaddingNone: {
    paddingLeft: '0rem',
  },
  listItemTextPadding: {
    paddingLeft: '0',
  },
  inline: {
    display: 'inline',
  },
  primaryText: {
    fontWeight: 600,
  },
});

interface IAltinnAttachmentProps extends WithStyles<typeof styles> {
  attachments?: IAttachment[];
  listDisableVerticalPadding?: boolean;
  nested?: boolean;
}

function ListItemLink(props: any) {
  return (
    <ListItem
      button={true}
      component='a'
      {...props}
    />
    );
}

export function AltinnAttachment(props: IAltinnAttachmentProps) {
  return(
    <>
      <List disablePadding={Boolean(props.listDisableVerticalPadding)}>
        {props.attachments && props.attachments.map((attachment, index) => (
          <ListItemLink
            className={classNames(
              {
                [props.classes.listItemPadding]: props.nested === true,
                [props.classes.listItemPaddingNone]: props.nested !== true,
              },
              props.classes.a,
              )}
            href={attachment.url}
            key={index}
          >
            <ListItemIcon>
              <AltinnIcon
                iconClass={attachment.iconClass}
                iconColor='#000000'
                iconSize='5rem'
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  <Typography
                    variant='body1'
                    className={classNames(
                    props.classes.inline,
                    props.classes.primaryText,
                    )}
                  >
                    {attachment.name}
                  </Typography>
                  <Typography
                    variant='body1'
                    className={props.classes.inline}
                  >
                    &nbsp;(last ned)
                  </Typography>
                </>
              }
              classes={{
                root: classNames(props.classes.listItemTextPadding),
              }}
            />
          </ListItemLink>
        ))}
      </List>
    </>
  );

}

export default withStyles(styles)(AltinnAttachment);
