import { Action } from 'redux';
import * as ActionTypes from '../types';

export interface IFetchLanguage extends Action {
  url: string;
  languageCode: string;
}
export interface IFetchLanguageFulfilled extends Action {
  language: any;
}
export interface IFetchLanguageRejected extends Action {
  error: Error;
}

export interface ILoadTextResourcesAction extends Action {
  url: string;
}
export interface ILoadTextResourcesFulfilled extends Action {
  textResources: any;
}
export interface ILoadTextResourcesRejected extends Action {
  error: Error;
}

export function fetchLanguage(url: string, languageCode: string): IFetchLanguage {
  return {
    type: ActionTypes.FETCH_LANGUAGE,
    url,
    languageCode,
  };
}

export function fetchLanguageFulfilled(
  language: any,
): IFetchLanguageFulfilled {
  return {
    type: ActionTypes.FETCH_LANGUAGE_FULFILLED,
    language,
  };
}

export function fetchLanguageRejected(
  error: Error,
): IFetchLanguageRejected {
  return {
    type: ActionTypes.FETCH_LANGUAGE_REJECTED,
    error,
  };
}

export function loadTextResourcesAction(url: string): ILoadTextResourcesAction {
  return {
    type: ActionTypes.LOAD_TEXT_RESOURCES,
    url,
  };
}

export function loadTextResourcesFulfilledAction(
  textResources: any,
): ILoadTextResourcesFulfilled {
  return {
    type: ActionTypes.LOAD_TEXT_RESOURCES_FULFILLED,
    textResources,
  };
}

export function loadTextResourcesRejectedAction(
  error: Error,
): ILoadTextResourcesRejected {
  return {
    type: ActionTypes.LOAD_TEXT_RESOURCES_REJECTED,
    error,
  };
}
