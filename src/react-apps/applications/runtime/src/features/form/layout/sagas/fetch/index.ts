import { SagaIterator } from 'redux-saga';
import { call, takeLatest } from 'redux-saga/effects';

import Actions from '../../actions';
import * as ActionTypes from '../../actions/types';
import { IFetchFormLayout } from '../../actions/fetch';

// import { get } from 'Shared/utils/networking';
import { testData } from './testData';

function* fetchFormLayoutSaga({ }: IFetchFormLayout): SagaIterator {
  try {
    // const formLayout = yield call(get, url);
    const { layout } = testData.data;
    yield call(Actions.fetchFormLayoutFulfilled, layout);
  } catch (err) {
    yield call(Actions.fetchFormLayoutRejected, err);
  }
}

export function* watchFetchFormLayoutSaga(): SagaIterator {
  yield takeLatest(ActionTypes.FETCH_FORM_LAYOUT, fetchFormLayoutSaga);
}
