"use client";

import dayjs from "dayjs";
import { atom, DefaultValue, selector } from "recoil";
import { IErrorModal, IModal, IToast } from "../../type/common";
import { ModalStateType } from "../../type/enum/common";

// Toast
export const toastAtom = atom<IToast[] | []>({
  key: "toastAtom",
  default: [],
});

export const toastSelector = selector<Omit<IToast, "arrayKey">>({
  key: "toastSelector",
  //GET이 없으면 오류가 발생해서 임의로 만들었습니다. 사용은 안합니다.
  get: ({ get }) => {
    return get(toastAtom)[0];
  },
  set: ({ get, set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      return;
    }
    let copyToast = [...get(toastAtom)];
    copyToast.push({
      ...newValue,
      arrayKey: dayjs().valueOf(),
    });
    set(toastAtom, copyToast);
  },
});

// Modal
export const modalAtom = atom<IModal>({
  key: "modalAtom",
  default: {
    show: false,
    modalState: ModalStateType.NONE,
  },
});

export const errorModalSelector = selector<
  Omit<IErrorModal, "modalState" | "show"> | string
>({
  key: "errorModalSelector",
  get: () => {
    return "";
  },
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      return;
    }

    if (typeof newValue === "string") {
      return;
    }

    set(modalAtom, {
      show: true,
      modalState: ModalStateType.ERROR,
      message: newValue.message,
      openEventHandler: newValue?.openEventHandler,
      closeEventHandler: newValue?.closeEventHandler,
    });
  },
});

//Loading
export const loadingAtom = atom<boolean>({
  key: "loadingAtom",
  default: false,
});
