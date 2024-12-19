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

import { ECharts, EChartsCoreOption } from 'echarts';
import {
  BinaryOperator,
  ChartDataResponseResult,
  ChartMetadata,
  ChartPlugin,
  ChartProps,
  DataMask,
  DataRecordValue,
  NumberFormatter,
  PlainObject,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
  SqlaFormData,
  TimeFormatter,
  TimeGranularity,
} from '@superset-ui/core';
import { ColorFormatters } from '@superset-ui/chart-controls';
import { Ref, RefObject } from 'react';

export interface EchartsHandler {
  getEchartInstance: () => ECharts | undefined;
}

export type Refs = {
  echartRef?: Ref<EchartsHandler>;
  divRef?: RefObject<HTMLDivElement>;
};

export interface BigNumberDatum {
  [key: string]: number | null;
}

export type BigNumberTotalFormData = QueryFormData & {
  metric?: QueryFormMetric;
  yAxisFormat?: string;
  forceTimestampFormatting?: boolean;
};

interface CurrencyFormatter {
  (value: number | null | undefined): string;
}

export type ValueFormatter = NumberFormatter | CurrencyFormatter;

export type BigNumberWithTrendlineFormData = BigNumberTotalFormData & {
  colorPicker: {
    r: number;
    g: number;
    b: number;
  };
  compareLag?: string | number;
};

export interface BigNumberTotalChartDataResponseResult
  extends ChartDataResponseResult {
  data: BigNumberDatum[];
}

export type BigNumberTotalChartProps =
  BaseChartProps<BigNumberTotalFormData> & {
    formData: BigNumberTotalFormData;
    queriesData: BigNumberTotalChartDataResponseResult[];
  };

export type BigNumberWithTrendlineChartProps =
  BaseChartProps<BigNumberWithTrendlineFormData> & {
    formData: BigNumberWithTrendlineFormData;
  };

export type TimeSeriesDatum = [number, number | null];

export type BaseQueryObjectFilterClause = {
  col: QueryFormColumn;
  grain?: TimeGranularity;
  isExtra?: boolean;
  override?: boolean;
};


export type BinaryQueryObjectFilterClause = BaseQueryObjectFilterClause & {
  op: BinaryOperator;
  val: string | number | boolean;
  formattedVal?: string;
};

export interface ContextMenuFilters {
  crossFilter?: {
    dataMask: DataMask;
    isCurrentValueSelected?: boolean;
  };
  drillToDetail?: BinaryQueryObjectFilterClause[];
  drillBy?: {
    filters: BinaryQueryObjectFilterClause[];
    groupbyFieldName: string;
    adhocFilterFieldName?: string;
  };
}

export type BigNumberVizProps = {
  className?: string;
  width: number;
  height: number;
  bigNumber?: DataRecordValue;
  bigNumberFallback?: TimeSeriesDatum;
  headerFormatter: ValueFormatter | TimeFormatter;
  formatTime?: TimeFormatter;
  headerFontSize: number;
  kickerFontSize?: number;
  subheader: string;
  subheaderFontSize: number;
  timeLagNumber?: number;
  showTimestamp?: boolean;
  showTrendLine?: boolean;
  startYAxisAtZero?: boolean;
  timeRangeFixed?: boolean;
  timestamp?: DataRecordValue;
  trendLineData?: TimeSeriesDatum[];
  mainColor?: string;
  echartOptions?: EChartsCoreOption;
  subheaderFromCondition?: string;
  onContextMenu?: (
    clientX: number,
    clientY: number,
    filters?: ContextMenuFilters,
  ) => void;
  xValueFormatter?: TimeFormatter;
  formData?: BigNumberWithTrendlineFormData;
  refs: Refs;
  colorThresholdFormatters?: ColorFormatters;
};

export class EchartsChartPlugin<
  T extends SqlaFormData = SqlaFormData,
  P extends ChartProps = ChartProps,
> extends ChartPlugin<T, P> {
  constructor(props: any) {
    const { metadata, ...restProps } = props;
    super({
      ...restProps,
      metadata: new ChartMetadata({
        parseMethod: 'json',
        ...metadata,
      }),
    });
  }
}

export enum Behavior {
  InteractiveChart = 'INTERACTIVE_CHART',
  NativeFilter = 'NATIVE_FILTER',
  DisableContextMenu = 'DISABLE_CONTEXT_MENU', // disabling context menu on right-click at chart

  /**
   * Include `DRILL_TO_DETAIL` behavior if plugin handles `contextmenu` event
   * when dimensions are right-clicked on.
   */
  DrillToDetail = 'DRILL_TO_DETAIL',
  DrillBy = 'DRILL_BY',
}

export interface BaseChartProps<T extends PlainObject> extends ChartProps<T> {
  queriesData: ChartDataResponseResult[];
}

export type EventHandlers = Record<string, { (props: any): void }>;

export interface EchartsProps {
  height: number;
  width: number;
  echartOptions: EChartsCoreOption;
  eventHandlers?: EventHandlers;
  zrEventHandlers?: EventHandlers;
  selectedValues?: Record<number, string>;
  forceClear?: boolean;
  refs: Refs;
}

export const SMART_DATE_VERBOSE_ID = 'smart_date_verbose';

export type EchartsStylesProps = {
  height: number;
  width: number;
};

export enum ComparatorNumber {
  None = 'None',
  GreaterThan = '>',
  LessThan = '<',
  GreaterOrEqual = '≥',
  LessOrEqual = '≤',
  Equal = '=',
  NotEqual = '≠',
  Between = '< x <',
  BetweenOrEqual = '≤ x ≤',
  BetweenOrLeftEqual = '≤ x <',
  BetweenOrRightEqual = '< x ≤',
}

export type ColorSchemeRange = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type ConditionalFormattingRangeConfig = {
  operator: ComparatorNumber;
  targetValue?: number;
  targetValueLeft?: number;
  targetValueRight?: number;
  column: string;
  customLabel?: string;
  colorScheme: ColorSchemeRange;
};

export interface Currency {
  symbol: string;
  symbolPosition: string;
}