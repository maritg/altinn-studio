import {
  combineReducers,
  Reducer,
  ReducersMapObject,
} from 'redux';
import FormConfigState, { IFormConfigState } from '../features/form/config/reducer';
import FormDataReducer, { IFormDataState } from '../features/form/data/reducer';
import FormDataModel, { IDataModelState } from '../features/form/datamodell/reducer';
import FormDynamics, { IFormDynamicState } from '../features/form/dynamics/reducer';
import FormFileUploadReducer, { IFormFileUploadState } from '../features/form/fileUpload/reducer';
import FormLayoutReducer, { ILayoutState } from '../features/form/layout/reducer';
import FormResourceReducer, { IResourceState } from '../features/form/resources/reducer';
import FormWorkflowReducer, { IWorkflowState } from '../features/form/workflow/reducer';
import LanguageReducer, { ILanguageState } from '../features/languages/reducer';

export interface IReducers<T1, T2, T3, T4, T5, T6, T7, T8, T9> {
  formLayout: T1;
  formData: T2;
  formConfig: T3;
  formWorkflow: T4;
  formDataModel: T5;
  formAttachements: T6;
  formDynamics: T7;
  language: T8;
  formResources: T9;
}

export interface IRuntimeState extends IReducers<
  Reducer<ILayoutState>,
  Reducer<IFormDataState>,
  Reducer<IFormConfigState>,
  Reducer<IWorkflowState>,
  Reducer<IDataModelState>,
  Reducer<IFormFileUploadState>,
  Reducer<IFormDynamicState>,
  Reducer<ILanguageState>,
  Reducer<IResourceState>
  >,
  ReducersMapObject {
}

const reducers: IRuntimeState = {
  formLayout: FormLayoutReducer,
  formData: FormDataReducer,
  formConfig: FormConfigState,
  formWorkflow: FormWorkflowReducer,
  formDataModel: FormDataModel,
  formAttachements: FormFileUploadReducer,
  formDynamics: FormDynamics,
  language: LanguageReducer,
  formResources: FormResourceReducer,
};

export default combineReducers(reducers);
