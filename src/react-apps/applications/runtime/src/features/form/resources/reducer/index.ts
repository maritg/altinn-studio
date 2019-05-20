import update from 'immutability-helper';
import { Action, Reducer } from 'redux';
import {
  IFetchFormResourceFulfilled,
  IFetchFormResourceRejected,
} from '../actions/fetch';
import * as ActionTypes from '../actions/types';

export interface IResourceState {
  languageResource: any;
  error: Error;
}

const initialState: IResourceState = {
  languageResource: null,
  error: null,
};

const ResourceReducer: Reducer<IResourceState> = (
  state: IResourceState = initialState,
  action?: Action,
): IResourceState => {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case ActionTypes.FETCH_FORM_RESOURCES_FULFILLED: {
      const { resource } = action as IFetchFormResourceFulfilled;
      return update<IResourceState>(state, {
        languageResource: {
          $set: resource,
        },
      });
    }
    case ActionTypes.FETCH_FORM_RESOURCES_REJECTED: {
      const { error } = action as IFetchFormResourceRejected;
      return update<IResourceState>(state, {
        error: {
          $set: error,
        },
      });
    }
    default: {
      return state;
    }
  }
};

export default ResourceReducer;
