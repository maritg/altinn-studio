import { SagaIterator } from 'redux-saga';
import { call, takeLatest } from 'redux-saga/effects';

import * as ActionTypes from '../../actions/types';
import { ICheckIfRuleShouldRun } from '../../actions/rule';

function* checkIfRuleShouldRunSaga({
  lastUpdatedComponentId,
  lastUpdatedDataBinding,
  lastUpdatedDataValue,
  repeatingContainerId,
}: ICheckIfRuleShouldRun): SagaIterator {
  try {
    yield call(
      console.log,
      'Check if Rule should run',
      lastUpdatedComponentId,
      lastUpdatedDataBinding,
      lastUpdatedDataValue,
      repeatingContainerId,
    )
  } catch (err) {
    yield call(
      console.error,
      'Oh noes',
      err,
    )
  }
}

export function* watchCheckIfRuleShouldRunSaga(): SagaIterator {
  yield takeLatest(ActionTypes.CHECK_IF_RULE_SHOULD_RUN, checkIfRuleShouldRunSaga);
}
