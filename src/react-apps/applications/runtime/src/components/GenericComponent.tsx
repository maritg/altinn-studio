import * as React from 'react';
import { connect } from 'react-redux';
// import { thirdPartyComponentWithElementHandler } from '../../srcOld/containers/thirdPartyComponentWithDataHandler';
import { formComponentWithHandlers } from '../containers/withFormElementHandlers';
import components from './';

export interface IGenericComponentProps {
  id: string;
  component: any;
  isValid: boolean;
  title: string;
  dataBinding: string;
  // formData: any;
  // validationMessages?: IComponentValidations;
  // handleDataChange: (callbackValue: any) => void;
  // getTextResource: (key: string) => string;
  thirdPartyComponents?: any;
  language?: any;
  attachments?: IAttachments;
}

class GenericComponent extends React.Component<IGenericComponentProps> {
  public getTextResource = (resourceKey: string): string => {
    // const textResource = this.props.textResources.find((resource) => resource.id === resourceKey);
    // return textResource ? textResource.value : resourceKey;
    return 'test: ' + resourceKey;
  }

  public render() {

    const TagName = formComponentWithHandlers(components.find((c: any) => c.name ===
      this.props.component).Tag);

    console.log('Tagname: ', TagName, this.props.id);
    return (
      <div>
        id: {this.props.id}<br />
        component: {this.props.component}<br />
        title: {this.props.title}<br />
        dataBinding: {this.props.dataBinding}<br />
        getTextResource: {this.getTextResource(this.props.title)}<br />
        <hr />
      </div>
    );

    // return (
    //   <TagName
    //     id={this.props.id}
    //     component={this.props.component}
    //     isValid={this.props.isValid}
    //     formData={this.props.formData}
    //     getTextResource={this.props.getTextResource}
    //     handleDataChange={this.props.handleDataChange}
    //     validationMessages={this.props.validationMessages}
    //     language={this.props.language}
    //   />
    // );
  }

}

export const GenericComponentWrapper = GenericComponent;
