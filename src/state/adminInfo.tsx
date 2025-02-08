import { atom, selector } from "recoil";
import { v1 } from "uuid";

export const adminInfoState = atom<any>({
  key: `adminInfoState/${v1()}`, // Atom의 고유 키
  default: null, // 기본값
});

export const adminInfoSelector = selector({
  key: `adminInfoSelector/${v1()}`,
  get: ({ get }) => {
    return get(adminInfoState);
  },
  set: ({ set }, adminInfo) => {
    set(adminInfoState, adminInfo);
  },
});
