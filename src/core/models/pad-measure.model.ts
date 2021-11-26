import { FootEnum } from '../enums/foot.enum';

export interface PadMeasureModel {
  id: number;
  foot: FootEnum;
  topLeftMeasure: number;
  topRightMeasure: number;
  bottomLeftMeasure: number;
  bottomRightMeasure: number;
}
