/* tslint:disable:jsx-wrap-multiline */
import { mount, shallow } from 'enzyme';
import 'jest';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { AddressComponent } from '../../../src/components/advanced/AddressComponent';

export interface ITextResourceBindings {
  [id: string]: string;
}
export enum AddressKeys {
  address = 'address',
  zipCode = 'zipCode',
  postPlace = 'postPlace',
  careOf = 'careOf',
  houseNumber = 'houseNumber',
}

describe('>>> components/advanced/AddressComponent.tsx snapshot', () => {
  let mockId: string;
  let mockFormData: { [id: string]: string };
  let mockHandleDataChange: (value: any, key: string) => void;
  let mockGetTextResource: (key: string) => string;
  let mockIsValid: boolean;
  let mockSimplified: boolean;
  let mockValidationMessages: any;
  let mockDataBinding: any;
  let mockReadOnly: boolean;
  let mockLanguage: any;
  let mocktextResourceBindings: any;

  mockId = 'mock-id';
  mockFormData = { address: 'adresse 1' };
  mockHandleDataChange = (data: any) => null;
  mockGetTextResource = (resourceKey: string) => 'test';
  mockIsValid = true;
  mockSimplified = true;
  mockReadOnly = false;
  mockDataBinding = {};
  mockValidationMessages = {
    zipCode: null,
    houseNumber: null,
  };
  mocktextResourceBindings = {};
  mockLanguage = {
    ux_editor: {
      modal_configure_address_component_address: 'Adresse',
      modal_configure_address_component_title_text_binding: 'Søk etter ledetekst for Adresse-komponenten',
      modal_configure_address_component_care_of: 'C/O eller annen tilleggsadresse',
      modal_configure_address_component_house_number: 'Bolignummer',
      modal_configure_address_component_house_number_helper: 'Om addressen er felles for flere boenhenter må du oppgi' +
      ' bolignummer. Den består av en bokstav og fire tall og skal være ført opp ved/på inngangsdøren din.',
      modal_configure_address_component_post_place: 'Poststed',
      modal_configure_address_component_simplified: 'Enkel',
      modal_configure_address_component_zip_code: 'Postnr',
    },
  };

  it('>>> Capture snapshot of AddressComponent', () => {
    const rendered = renderer.create(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    expect(rendered).toMatchSnapshot();
  });
  it('+++ should have correct state', () => {
    const shallowAddressComponent = shallow(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    const instance = shallowAddressComponent.instance() as AddressComponent;
    expect(instance.state.address).toEqual('adresse 1');
    expect(instance.state.zipCode).toEqual('');
  });
  it('+++ should return simplified version when simplified', () => {
    const shallowAddressComponent = shallow(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    expect(shallowAddressComponent.find('input').length).toBe(3);
  });
  it('+++ should return advanced version when not simplified', () => {
    const mountedAddressComponent = mount(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={false}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    const instance = mountedAddressComponent.instance() as AddressComponent;
    instance.setState({ ...mockValidationMessages });
    const spy = jest.spyOn(instance, 'joinValidationMessages');
    instance.render();

    expect(spy).toHaveBeenCalled();
    expect(mountedAddressComponent.find('input').length).toBe(5);
  });
  it('+++ should render editable component when readOnly is false', () => {
    const shallowAddressComponent = shallow(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    expect(shallowAddressComponent.find('.address-component-small-inputs').hasClass('disabled')).toBe(false);
  });
  it('+++ should render disabled component when readOnly is true', () => {
    const shallowAddressComponent = shallow(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={true}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    shallowAddressComponent.find('input').forEach((node: any) => {
      expect(node.hasClass('disabled')).toBe(true);
    });
  });
  it('+++ should return advanced version and disabled when not simplified and readOnly is true', () => {
    const shallowAddressComponent = shallow(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={false}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={true}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    shallowAddressComponent.find('input').forEach((node: any) => {
      expect(node.hasClass('disabled')).toBe(true);
    });
    expect(shallowAddressComponent.find('input').length).toBe(5);
  });
  it('+++ should run onBlurField on blur + fetch Post place zipCode blur', () => {
    const mountedAddressComponent = mount(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    const instance = mountedAddressComponent.instance() as AddressComponent;
    const spyOnBlurField = jest.spyOn(instance, 'onBlurField');
    const spyFetchPostPlace = jest.spyOn(instance, 'fetchPostPlace');
    instance.forceUpdate();

    const inputFields = mountedAddressComponent.find('input');
    inputFields.forEach((input) => {
      input.simulate('blur');
      expect(spyOnBlurField).toHaveBeenCalled();
    });
    mountedAddressComponent.find('.address-component-zipCode').find('input').simulate('blur');
    expect(spyFetchPostPlace).toHaveBeenCalled();
    expect(instance.state.postPlace).toEqual('');
  });
  it('+++ should trigger updateField onChange', () => {
    const mountedAddressComponent = mount(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    const instance = mountedAddressComponent.instance() as AddressComponent;
    const spyUpdateField = jest.spyOn(instance, 'updateField');
    instance.forceUpdate();

    const inputField = mountedAddressComponent.find('input').first();
    inputField.simulate('change');
    expect(spyUpdateField).toHaveBeenCalled();
  });
  it('+++ joinValidationMessages should return all validations in correct format', () => {
    const mockResult = {
      address: {
        errors: [],
        warnings: [],
      },
      careOf: {
        errors: [],
        warnings: [],
      },
      houseNumber: {
        errors: ['some other error'],
        warnings: [],
      },
      postPlace: {
        errors: [],
        warnings: [],
      },
      zipCode: {
        errors: ['some error'],
        warnings: [],
      },
    };
    const mountedAddressComponent = mount(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    const instance = mountedAddressComponent.instance() as AddressComponent;
    instance.setState({
      validations: {
        zipCode: 'some error',
        houseNumber: 'some other error',
      },
    });
    const result = instance.joinValidationMessages();
    expect(result).toEqual(mockResult);
  });

  it('+++ It should *not* show a component title if title is not set', () => {
    const mountedAddressComponent = mount(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    expect(mountedAddressComponent.find('h4').length).toBe(0);
  });

  it('+++ It should show a component title if title is set', () => {
    mocktextResourceBindings.title = 'test';
    const mountedAddressComponent = mount(
      <AddressComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        getTextResource={mockGetTextResource}
        isValid={mockIsValid}
        simplified={mockSimplified}
        dataModelBindings={mockDataBinding}
        validationMessages={mockValidationMessages}
        readOnly={mockReadOnly}
        language={mockLanguage}
        textResourceBindings={mocktextResourceBindings}
      />,
    );
    expect(mountedAddressComponent.find('h4').length).toBe(1);
    expect(mountedAddressComponent.contains(<h4 className='mt-2'>test</h4>)).toBe(true);
  });

});
