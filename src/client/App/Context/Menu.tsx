import { createContext, useContext } from "react";
import { MenuItem } from "../../../types";
import { useMutableState } from "../../utils/useMutableState";

type MenuContextApi = {
  items: MenuItem[];
};

const context = createContext<MenuContextApi | null>(null);

export function useMenu() {
  const ctx = useContext(context);
  if (ctx === null) {
    throw new Error("Menu context not found");
  }
  return ctx;
}

export function Provider({
  children,
  value,
}: {
  children: JSX.Element | JSX.Element[];
  value: MenuItem[];
}) {
  const [state, setState] = useMutableState({
    items: value,
  });

  const api: MenuContextApi = {
    ...state,
  };

  return <context.Provider value={api}>{children}</context.Provider>;
}
