import { createMuiTheme } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import altinnTheme from '../theme/altinnStudioTheme';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import AltinnIcon from './AltinnIcon';

export interface IAltinnInformationComponentProvidedProps {
  classes: any;
  header?: string;
  information?: string;
  link?: string;
  imageSource?: string;
}

export interface IAltinnInformationComponentState {
}

const theme = createMuiTheme(altinnTheme);

const styles = {
  root: {
    flexGrow: 1,
  },
  paper: {
    paddingleft: 50,
    paddingbottom: 100,
    margin: 150,
    maxWidth: 1088,
  },
};

// tslint:disable-next-line:max-line-length
class AltinnInformation extends React.Component<IAltinnInformationComponentProvidedProps, IAltinnInformationComponentState> {
  public render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Grid container spacing={16}>
            <Grid item xs={12} sm container>
              <Grid item xs container direction="column" spacing={16}>
                <Grid item xs>
                  <Typography variant="h1">
                    Her kommer det noe...
                </Typography>
                  <Typography variant="body1" >
                    Det er ikke alle deler av Altinn Studio som er klart enda. Her vil det komme en ny side.
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>Vil du følge med på hva vi jobber med. du kan følge oss på github og få oversikt over alt som er på vei inn i løsningen.</Typography>
                </Grid>
                <Grid item>
                  <a href='#'>
                    Gå til Altinn Studio github
                    <AltinnIcon
                      isActive={true}
                      iconClass='ai ai-arrowrightup'
                      iconColor={altinnTheme.altinnPalette.primary.black}
                    />
                  </a>
                </Grid>
              </Grid>
              <Grid item>
                <img className={classes.img} alt="complex" src="./images/Illustration-help-circle.svg" />
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(AltinnInformation);
