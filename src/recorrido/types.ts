import { RecorridoCreationAttributes } from "./model";
export type CreateRecorridoDto = RecorridoCreationAttributes;

export type UpdateRecorridoDto = Partial<CreateRecorridoDto>;