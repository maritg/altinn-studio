import {
  createStyles,
  Grid,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import * as React from 'react';
import { useSelector } from 'react-redux';
import AltinnInput from 'Shared/components/AltinnInput';
import AltinnAppTheme from 'Shared/theme/altinnAppTheme';
import { IRuntimeState } from 'src/types';

const styles = createStyles({
  partySearchContainer: {
    width: '50%',
    border: `2px solid ${AltinnAppTheme.altinnPalette.primary.blue}`,
  },
});

export interface IAltinnPartySearchProps extends WithStyles<typeof styles> {
  onSearchUpdated: (searchString: string) => void;
}

function AltinnPartySearch(props: IAltinnPartySearchProps) {
  const language = useSelector((state: IRuntimeState) => state.language.language);

  const [ searchString, setSearchString ] = React.useState('');
  const { classes, onSearchUpdated } = props;

  React.useEffect(() => {
    onSearchUpdated(searchString);
  }, [searchString]);

  function onChangeSearchString(e: any) {
    setSearchString(e.target.value);
  }

  return (
    <Grid container={true} className={classes.partySearchContainer}>
      <AltinnInput
        id={'altinn-party-search'}
        onChangeFunction={onChangeSearchString}
        placeholder={
          !language.party_selection ?
            'party_selection.search_placeholder' :
            language.party_selection.search_placeholder
        }
        iconString={'fa fa-others'}
      />
    </Grid>
  );
}

export default withStyles(styles)(AltinnPartySearch);
