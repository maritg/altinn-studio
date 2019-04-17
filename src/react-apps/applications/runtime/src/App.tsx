import * as React from 'react';
import { connect } from 'react-redux';
import PageRenderer from './containers/PageRenderer';
import FormDataActions from './features/form/data/actions';
import FormDataModelActions from './features/form/datamodell/actions';
import FormLayoutActions from './features/form/layout/actions';
import FormWorkflowActions from './features/form/workflow/actions';
import LanguageActions from './features/languages/actions';

import './app.css';

export interface IAppProps {
  layout: any;
}
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
    LanguageActions.fetchLanguage(
      `${window.location.origin}/runtime/api/Language/GetLanguageAsJSON`, 'nb');

    LanguageActions.loadTextResources(
      `${window.location.origin}/runtime/api/textresources/${service}`);
  }

  public renderContent = (ref?: any): JSX.Element => {
    console.log('#### renderContent:');
    console.log('this.props.layout: ', this.props.layout);
    return (
      <div>
        {!this.props.layout ?
          <h1>empty</h1>
          : this.props.layout.map((page: any, index: number) => (
            index < 1 ?
              <div key={page.pageId}>
                <PageRenderer key={index} page={page} />
              </div>
              : ''
          )
        }
      </div>
    );


    // if (this.props.layout) {
    //   console.log('this.props.layout: ', this.props.layout[0]);
    //   this.props.layout.map((el: any, index: number) => {
    //     console.log(index, ' - index el: ', el);
    //     return (
    //       <div key={index}>TATATA {index} </div>
    //     );
    //   });
    // }




    // if (this.props.order) {
    //   const baseContainerId = Object.keys(this.props.order)[0];
    //   const layoutOrder = this.props.order[Object.keys(this.props.order)[0]];
    //   console.log('layoutOrder: ', layoutOrder);
    //   console.log('baseContainerId', baseContainerId);

    //   layoutOrder.map((id: string, index: number) => {
    //     const component = this.props.components[id];

    //     console.log('component: ', component);
    //     console.log('component type: ', component.component)

    //     return (
    //       <div key={id}>{component.component}</div>
    //     )
    //   });


    // }



  }

  public render(): JSX.Element {
    return (
      <div>
        <h1>Hello world</h1>
        {this.renderContent()}
      </div >
    )
  }
}

const mapStateToProps = (
  state: any,
) => {
  return (
    {
      layout: state.formLayout.layout,
    }
  )
}

export default connect(mapStateToProps)(App);
