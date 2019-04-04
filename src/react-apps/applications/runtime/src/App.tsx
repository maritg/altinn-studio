import * as React from 'react';
import { connect } from 'react-redux';
import FormDataActions from './features/form/data/actions';
import FormDataModelActions from './features/form/datamodell/actions';
import FormLayoutActions from './features/form/layout/actions';
import FormWorkflowActions from './features/form/workflow/actions';

import './app.css';

export interface IAppProps { }
export interface IAppState { }

interface IAltinnWindow extends Window {
  org: string;
  service: string;
  instanceId: string;
  reportee: string;
}

class App extends React.Component<IAppProps, IAppState> {
  public componentDidMount() {
    const { org, service, instanceId, reportee } = window as IAltinnWindow;
    FormDataModelActions.fetchDataModel(
      `${window.location.origin}/runtime/api/metadata/${org}/${service}/ServiceMetaData`,
    );
    FormLayoutActions.fetchFormLayout(
      `${window.location.origin}/runtime/api/resource/${org}/${service}/FormLayout.json`,
    );
    FormDataActions.fetchFormData(
      `${window.location.origin}/runtime/api/${reportee}/${org}/${service}/Index/${instanceId}`,
    );
    FormWorkflowActions.getCurrentState(
      `${window.location.origin}/runtime/${org}/${service}/${instanceId}/GetCurrentState?reporteeId=${reportee}`,
    );
  }

  public render(): JSX.Element {
    console.log('#### props: ', this.props);
    console.log('#### components: ', this.props.components);
    console.log('#### containers: ', this.props.containers);
    console.log('#### order: ', this.props.order);

    return (
      <div>
        <h1>Hello world</h1>
      </div>
    )
  }
}

const mapStateToProps = (
  state: any,
) => {
  return (
    {
      components: state.formLayout.components,
      containers: state.formLayout.containers,
      order: state.formLayout.order,
    }
  )
}

export default connect(mapStateToProps)(App);
