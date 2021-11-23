import { PadMeasureModel } from './pad-measure.model';

export interface OrderInsoleModel {
  id: number;
  coreMaterials: string;
  cover: string;
  padTypeLeft: string;
  padTypeRight: string;
  padThicknessLeft: string;
  padThicknessRight: string;
  sink: boolean;
  fillSinkWithPPT: boolean;
  padMeasures: PadMeasureModel[];
}
