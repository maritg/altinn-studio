import { Action } from 'redux';
import * as actionTypes from '../types';

export interface IFetchFormData extends Action {
  url: string;
}

export function fetchFormData(url: string): IFetchFormData {
  return {
    type: actionTypes.FETCH_FORM_DATA,
    url,
  };
}

export interface IFetchFormDataFulfilled extends Action {
  formData: any;
}

export function fetchFormDataFulfilled(formData: any): IFetchFormDataFulfilled {
  return {
    type: actionTypes.FETCH_FORM_DATA_FULFILLED,
    formData,
  };
}

export interface IFetchFormDataRejected extends Action {
  error: Error;
}

export function fetchFormDataRejected(error: Error): IFetchFormDataRejected {
  return {
    type: actionTypes.FETCH_FORM_DATA_REJECTED,
    error,
  };
}
