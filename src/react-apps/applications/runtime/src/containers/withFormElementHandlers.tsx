import * as React from 'react';
import { connect } from 'react-redux';
import { getLanguageFromKey } from '../../../shared/src/utils/language';
import { IRuntimeState } from '../types';

export interface IProvidedProps {
  id: string;
  handleDataUpdate: (data: any) => void;
  dataBinding: string;
  description: string;
  required: boolean;
  title: string;
  type: string;
}

export interface IProps extends IProvidedProps {
  language: any;
  textResources: any[];
}

export const formComponentWithHandlers = (WrappedComponent: React.ComponentType<any>): React.ComponentClass<any> => {
  class FormComponentWithHandlers extends React.Component<IProps> {

    public renderLabel = (): JSX.Element => {
      if (this.props.type === 'Header' ||
        this.props.type === 'Paragraph' ||
        this.props.type === 'Submit' ||
        this.props.type === 'ThirdParty' ||
        this.props.type === 'AddressComponent') {
        return null;
      }
      if (!this.props.title) {
        return null;
      }
      if (this.props.title) {
        const label: string = this.getTextResource(this.props.title);
        return (
          <label className='a-form-label title-label' htmlFor={this.props.id}>
            {label}
            {this.props.required ? null :
              <span className='label-optional'>({getLanguageFromKey('general.optional', this.props.language)})</span>
            }
          </label>
        );
      }

      return null;
    }
    public renderDescription = (): JSX.Element => {
      if (!this.props.title) {
        return null;
      }
      if (this.props.description) {
        const description: string = this.getTextResource(this.props.description);
        return (
          <span className='a-form-label description-label'>{description}</span>
        );
      }

      return null;
    }

    public handleDataUpdate = (data: any) => this.props.handleDataUpdate(data);

    public getTextResource = (resourceKey: string): string => {
      const textResource = this.props.textResources.find((resource) => resource.id === resourceKey);
      return textResource ? textResource.value : resourceKey;
    }

    public render(): JSX.Element {
      const { id, ...passThroughProps } = this.props;
      const text = this.getTextResource(this.props.title);

      return (
        <>
          {this.renderLabel()}
          {this.renderDescription()}
          <WrappedComponent
            id={id}
            text={text}
            handleDataChange={this.handleDataUpdate}
            {...passThroughProps}
          />
        </>
      );
    }
  }

  const mapStateToProps = (state: IRuntimeState, props: IProvidedProps): IProps => ({
    language: state.language.language,
    textResources: state.formResources.languageResource.resources,
    ...props,
  });

  return connect(mapStateToProps)(FormComponentWithHandlers);
};
