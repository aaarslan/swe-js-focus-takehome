// This file was part of my first actual commit
import { Store } from "../../types";
import { Provider as MenuProvider } from "./Context/Menu";
import { Provider as ShopProvider } from "./Context/Shop";

export function Providers({
  children,
  store,
}: {
  children: JSX.Element | JSX.Element[];
  store: Store;
}) {
  return (
    <ShopProvider value={store.shop}>
      <MenuProvider value={store.menu}>{children}</MenuProvider>
    </ShopProvider>
  );
}
