import { PartySize } from "../Pages/ShopBookingPage/PartySize";
import PartySizeForm from "./PartySizeForm";

type Props = {
  partySize: PartySize;
};

export const PartySizeList = ({ partySize }: Props): JSX.Element => {
  return (
    <div>
      <PartySizeForm partySize={partySize} />
    </div>
  );
};
