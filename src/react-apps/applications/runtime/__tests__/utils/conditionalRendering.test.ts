import 'jest';
import { runConditionalRenderingRules } from '../../src/utils/conditionalRendering';

describe('>>> utils/conditionalRendering.ts', () => {

  let mockValidFormData;
  let mockInvalidFormData;
  let mockShowRules;
  let mockHideRules;
  let mockLayout;
  let mockRuleHandlerHelper;
  let mockRuleHandler;

  beforeAll(() => {
    mockRuleHandlerHelper = {
      biggerThan10: () => {
        return {
          number: 'number',
        };
      },
      lengthBiggerThan4: () => {
        return {
          value: 'value',
        };
      },

    };
    mockRuleHandler = {
      biggerThan10: (obj) => {
        obj.number = +obj.number;
        return obj.number > 10;
      },
      lengthBiggerThan4: (obj) => {
        if (obj.value == null) {
          return false;
        }
        return obj.value.length >= 4;
      },
    };
    mockShowRules = {
      ruleId: {
        selectedFunction: 'biggerThan10',
        inputParams: {
          number: 'mockField',
        },
        selectedAction: 'Show',
        selectedFields: {
          selectedField_1: 'layoutElement_1',
        },
      },
    };

    mockHideRules = {
      ruleId: {
        selectedFunction: 'biggerThan10',
        inputParams: {
          number: 'mockField',
        },
        selectedAction: 'Hide',
        selectedFields: {
          selectedField_1: 'layoutElement_2',
          selectedField_2: 'layoutElement_3',
        },
      },
    };

    mockLayout = [
      {
        type: 'Input',
        id: 'layoutElement_1',
        hidden: false,
      },
      {
        type: 'Input',
        id: 'layoutElement_2',
        hidden: false,
      },
      {
        type: 'Input',
        id: 'layoutElement_3',
        hidden: false,
      },
    ];

    mockValidFormData = {
      mockField: '11',
    };

    mockInvalidFormData = {
      mockField: '4',
    };

    (window as any).conditionalRuleHandlerHelper = mockRuleHandlerHelper;
    (window as any).conditionalRuleHandlerObject = mockRuleHandler;
  });

  it('+++ should HIDE element when rule is set to HIDE and condition is TRUE', () => {
    const result = runConditionalRenderingRules(mockHideRules, mockValidFormData, mockLayout);
    expect(result[0].hidden).toBe(true);
  });

  it('+++ should SHOW element when rule is set to HIDE and condition is FALSE', () => {
    const result = runConditionalRenderingRules(mockHideRules, mockInvalidFormData, mockLayout);
    expect(result[0].hidden).toBe(false);
  });

  it('+++ should SHOW element when rule is set to SHOW and condition is TRUE', () => {
    const result = runConditionalRenderingRules(mockShowRules, mockValidFormData, mockLayout);
    expect(result[0].hidden).toBe(false);
  });

  it('+++ should HIDE element when rule is set to SHOW and condition is FALSE', () => {
    const result = runConditionalRenderingRules(mockShowRules, mockInvalidFormData, mockLayout);
    expect(result[0].hidden).toBe(true);
  });

  it('+++ conditional rendering rules should only be applied to connected elements', () => {
    const result = runConditionalRenderingRules(mockShowRules, mockValidFormData, mockLayout);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('layoutElement_1');
  });

  it('+++ conditional rendering rules with several targets should be applied to all connected elements', () => {
    const result = runConditionalRenderingRules(mockHideRules, mockValidFormData, mockLayout);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('layoutElement_2');
    expect(result[1].id).toBe('layoutElement_3');
  });

  it('+++ should run and return empty result array on null values', () => {
    const result = runConditionalRenderingRules(null, null, null);
    expect(result.length).toBe(0);
  });

});
