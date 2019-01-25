import { createMuiTheme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { createStyles } from '@material-ui/core/styles';
import * as React from 'react';
import altinnTheme from '../theme/altinnStudioTheme';
// import fetchLanguageDispatcher from '../../../service-development/src/utils/fetchLanguage/fetchLanguageDispatcher';
import { getLanguageFromKey } from '../utils/language';
import AltinnIcon from './AltinnIcon';

export interface IAltinnInformationComponentProvidedProps {
  classes: any;
  header?: string;
  information?: string;
  link?: string;
  imageSource?: string;
  language: any;
}

export interface IAltinnInformationComponentState {
}

const theme = createMuiTheme(altinnTheme);

const styles = () => createStyles({
  root: {
    flexGrow: 1,
  },
  paper: {
    paddingLeft: '5%',
    paddingTop: 100,
    paddingBottom: 100,
    margin: 150,
    maxWidth: '75%',
    height: 446,
    background: theme.altinnPalette.primary.white,
    boxShadow: '0px 4px 7px rgba(0, 0, 0, 0.14)',
  },
  header: {
    fontSize: 36,
  },
  subText1: {
    paddingTop: 15,
    fontSize: 16,
  },
  subText2: {
    paddingBottom: 39,
  },
  link: {
    fontSize: 16,
  }
});

class AltinnInformation extends
  React.Component<IAltinnInformationComponentProvidedProps, IAltinnInformationComponentState> {

  // public componentDidMount() {
  //   const altinnWindow: Window = window;
  //   fetchLanguageDispatcher.fetchLanguage(
  //     `${altinnWindow.location.origin}/designerapi/Language/GetLanguageAsJSON`, 'nb');
  // }

  public render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid className={classes.paper} container={true} item={true}>
          <Grid container={true} item={true}>
            <Grid xs={6} item={true} container={true} direction='column' >
              <Grid item={true}>
                <h1 className={classes.header}>
                  Her kommer det noe...
                </h1>
                <p className={classes.subText1}>
                  {getLanguageFromKey('shared.wip_title', 'nb')}
                </p>
                <p className={classes.subText2}>
                  Vil du følge med på hva vi jobber med. du kan følge oss på github og få oversikt over alt som er på vei inn i løsningen.
                </p>
                <a href='#' className={classes.link}>
                  Gå til Altinn Studio github
                    <AltinnIcon
                    isActive={true}
                    iconClass='ai ai-arrowrightup'
                    iconColor={theme.altinnPalette.primary.black}
                  />
                </a>
              </Grid>
            </Grid>
            <Grid container={true} xs={3} item={true} spacing={0} justify={'center'} alignContent={'center'}>
              <img alt='complex' src='../../designer/img/illustration-help-circle.svg' />
            </Grid>
          </Grid>
        </Grid>
      </div >
    );
  }
}

export default withStyles(styles)(AltinnInformation);
