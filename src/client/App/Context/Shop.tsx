import { createContext, useContext } from "react";
import { Shop } from "../../../types";
import { useMutableState } from "../../utils/useMutableState";

type ShopContextApi = {
  config: Shop;
};

const context = createContext<ShopContextApi | null>(null);

export function useShop() {
  const ctx = useContext(context);
  if (ctx === null) {
    throw new Error("Shop context not found");
  }
  return ctx;
}

export function Provider({
  children,
  value,
}: {
  children: JSX.Element | JSX.Element[];
  value: Shop;
}) {
  const [state] = useMutableState({
    config: value,
  });

  const api: ShopContextApi = {
    ...state,
  };

  return <context.Provider value={api}>{children}</context.Provider>;
}
