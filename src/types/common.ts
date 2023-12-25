import { ModalStateType, ToastState } from "./enum/common";

export interface IToast {
  state: ToastState;
  message: string;
  arrayKey: number;
  delay?: number;
}

type IModalAbstract<T> = {
  show: boolean;
  modalState: T;
  openEventHandler?: VoidFunction;
  closeEventHandler?: VoidFunction;
};
export type IDefaultModal = IModalAbstract<ModalStateType.NONE>;
export type IErrorModal = IModalAbstract<ModalStateType.ERROR> & {
  message: string;
};
export type IModal = IDefaultModal | IErrorModal;

export type Provider = {
  id: string;
  name: string;
  nameKr: string;
  driver: string;
  deletedAt: number;
};

export interface IProviderOutput {
  providers: Provider[];
}

export interface ProviderResponse {
  id: string;
  name: string;
  nameKr: string;
  count: number;
}

export interface IQueryByKeywordVariables {
  keyword: string;
}

export interface IQueryByIDVariables {
  id: number;
}
