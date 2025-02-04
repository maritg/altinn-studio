import { createMuiTheme, createStyles, IconButton, Modal, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import * as React from 'react';
import altinnTheme from '../theme/altinnStudioTheme';

export interface IAltinnModalComponentProvidedProps {
  /** @ignore */
  classes: any;
  /** Text or react element shown in the header */
  headerText?: any;
  /** Boolean value of the modal being open or not */
  isOpen: boolean;
  /** Callback function for when the modal is closed */
  onClose: any;
  /** Boolean value for hiding the background shower */
  hideBackdrop?: boolean;
  /** Boolean value for hiding the X button in the header */
  hideCloseIcon?: boolean;
  /** Boolean value for allowing modal to close on backdrop click */
  allowCloseOnBackdropClick?: boolean;
}

export interface IAltinnModalComponentState {
  isOpen: boolean;
}

const theme = createMuiTheme(altinnTheme);

const styles = createStyles({
  modal: {
    [theme.breakpoints.down('sm')]: {
      width: '95%',
    },
    [theme.breakpoints.up('md')]: {
      width: '80%',
    },
    maxWidth: '875px',
    backgroundColor: theme.altinnPalette.primary.white,
    boxShadow: theme.shadows[5],
    outline: 'none',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: '10%',
    marginBottom: '10%',
  },
  header: {
    backgroundColor: altinnTheme.altinnPalette.primary.blueDarker,
    // height: '96px',
    paddingLeft: 48,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: '1.75rem',
    color: altinnTheme.altinnPalette.primary.white,
  },
  body: {
    paddingLeft: 90,
    paddingRight: 243,
    paddingTop: 45,
    paddingBottom: 34,
  },
  iconBtn: {
    float: 'right' as 'right',
    paddingRight: 20,
    marginTop: '-27px',
  },
  iconStyling: {
    color: altinnTheme.altinnPalette.primary.white,
    fontSize: 38,
  },
  scroll: {
    overflow: 'overlay',
  },
});

export class AltinnModal extends React.Component<IAltinnModalComponentProvidedProps, IAltinnModalComponentState> {
  public render() {
    const { classes } = this.props;
    return (
      <Modal
        open={this.props.isOpen}
        className={this.props.classes.scroll}
        hideBackdrop={this.props.hideBackdrop}
        onBackdropClick={this.props.allowCloseOnBackdropClick === false ? null : this.props.onClose}
      >
        <div className={classes.modal}>
          <div className={classes.header}>
            {this.props.hideCloseIcon && this.props.hideCloseIcon === true ? null :
              <IconButton className={classes.iconBtn} onClick={this.props.onClose}>
                <i className={classNames('ai ai-exit-test', classes.iconStyling)} />
              </IconButton>
            }
            <Typography className={classes.headerText}>
              {this.props.headerText}
            </Typography>
          </div>
          <div className={classes.body}>
            {this.props.children}
          </div>
        </div>
      </Modal>
    );
  }
}

export default withStyles(styles)(AltinnModal);
