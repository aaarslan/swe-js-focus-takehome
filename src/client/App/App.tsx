import { MenuItem, Shop } from "../../types";
import { ShopBookingPage } from "../Pages/ShopBookingPage/ShopBookingPage";
import { Providers } from "./Providers";

type Props = {
  store: {
    shop: Shop;
    menu: MenuItem[];
  };
};

export function App({ store }: Props): JSX.Element {
  return (
    <Providers store={store}>
      <ShopBookingPage />
    </Providers>
  );
}
