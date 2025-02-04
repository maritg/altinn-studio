import { SagaIterator } from 'redux-saga';
import { call, takeLatest } from 'redux-saga/effects';

import DataModelActions from '../../actions';
import { IFetchDataModel } from '../../actions/fetch';
import * as ActionTypes from '../../actions/types';

import ConfigActions from '../../../config/actions';

import { get } from '../../../../../utils/networking';

// import { testData } from './testData';

function* fetchFormDataModelSaga({ url }: IFetchDataModel): SagaIterator {
  try {
    const dataModel = yield call(get, url);
    // const dataModel: any = testData;
    const {
      Org,
      ServiceName,
      RepositoryName,
      ServiceId,
    } = dataModel;
    const dataModelFields: any[] = [];
    for (const dataModelField in dataModel.Elements) {
      if (!dataModelField) {
        continue;
      }
      dataModelFields.push(dataModel.Elements[dataModelField]);
    }
    yield call(DataModelActions.fetchDataModelFulfilled, dataModelFields);
    yield call(ConfigActions.fetchFormConfigFulfilled, Org, ServiceName, RepositoryName, ServiceId);
  } catch (err) {
    yield call(DataModelActions.fetchDataModelRejected, err);
  }
}

export function* watchFetchFormDataModelSaga(): SagaIterator {
  yield takeLatest(ActionTypes.FETCH_DATA_MODEL, fetchFormDataModelSaga);
}
