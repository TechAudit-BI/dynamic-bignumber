/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import moment from 'moment';
import {
  DataRecordValue,
  getTimeFormatter,
  getTimeFormatterForGranularity,
  SMART_DATE_ID,
  TimeGranularity,
} from '@superset-ui/core';
import { ColorSchemeRange, ComparatorNumber, ConditionalFormattingRangeConfig } from './types';


export const parseMetricValue = (metricValue: number | string | null) => {
  if (typeof metricValue === 'string') {
    const dateObject = moment.utc(metricValue, moment.ISO_8601, true);
    if (dateObject.isValid()) {
      return dateObject.valueOf();
    }
    return null;
  }
  return metricValue;
};

export const getDateFormatter = (
  timeFormat: string,
  granularity?: TimeGranularity,
  fallbackFormat?: string | null,
) =>
  timeFormat === SMART_DATE_ID
    ? getTimeFormatterForGranularity(granularity)
    : getTimeFormatter(timeFormat ?? fallbackFormat);

export const IsValInCondition = (
  condition: ConditionalFormattingRangeConfig,
  val: DataRecordValue,
) => {
  if (val === null) return false; // in condtional formatting we don't have IS NULL condition.

  if (condition?.targetValue !== undefined)
    // eslint-disable-next-line default-case
    switch (condition.operator) {
      case ComparatorNumber.None:
        return false;
      case ComparatorNumber.GreaterThan:
        return val > condition?.targetValue;
      case ComparatorNumber.LessThan:
        return val < condition?.targetValue;
      case ComparatorNumber.GreaterOrEqual:
        return val >= condition?.targetValue;
      case ComparatorNumber.LessOrEqual:
        return val <= condition?.targetValue;
      case ComparatorNumber.Equal:
        return val === condition?.targetValue;
      case ComparatorNumber.NotEqual:
        return val !== condition?.targetValue;
    }
  if (
    condition.targetValueLeft === undefined ||
    condition.targetValueRight === undefined
  ) {
    return false;
  }
  // eslint-disable-next-line default-case
  switch (condition.operator) {
    case ComparatorNumber.Between:
      return (
        condition.targetValueLeft < val && val < condition.targetValueRight
      );
    case ComparatorNumber.BetweenOrEqual:
      return (
        condition.targetValueLeft <= val && val <= condition.targetValueRight
      );
    case ComparatorNumber.BetweenOrLeftEqual:
      return (
        condition.targetValueLeft <= val && val < condition.targetValueRight
      );
    case ComparatorNumber.BetweenOrRightEqual:
      return (
        condition.targetValueLeft < val && val <= condition.targetValueRight
      );
  }
  return false;
};

export function colorSchemeToString(colorScheme: ColorSchemeRange) {
  const { r, g, b, a } = colorScheme;
  return `rgba(${r}, ${g}, ${b}, ${a}`;
}
