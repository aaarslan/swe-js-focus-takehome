import { useController } from "./useController";

export function ShopBookingPage(): JSX.Element {
  const { title, openCTA, renderModal } = useController();

  return (
    <div>
      <h1 data-testid="Shop Title">{title}</h1>
      <button data-testid="Party Size CTA" onClick={openCTA}>
        click here to set party size
      </button>
      {renderModal()}
    </div>
  );
}
