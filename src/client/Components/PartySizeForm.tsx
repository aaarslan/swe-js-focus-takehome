import React, { useState, useCallback } from "react";
import { Store, MenuItem } from "../../types";

type FormValidation = "valid" | "invalid" | "pending";

const PartySizeForm = ({ partySize }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [groupSize, setGroupSize] = useState({
    adults: 1,
    children: 0,
    babies: 0,
    seniors: 0,
  });
  const [isValid, setIsValid] = useState<FormValidation>("pending");
  const shop: Store["shop"] = partySize.getShop();
  const menuItems: Store["menu"] = partySize.getMenu();

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = parseInt(e.target.value, 10);
      const newSelectedItem = menuItems.find((item) => item.id === selectedId);
      setSelectedItem(newSelectedItem || null);
    },
    [menuItems]
  );

  const handleIncrement = useCallback((ageGroup: keyof typeof groupSize) => {
    setGroupSize((prev) => ({ ...prev, [ageGroup]: prev[ageGroup] + 1 }));
  }, []);

  const handleDecrement = useCallback((ageGroup: keyof typeof groupSize) => {
    setGroupSize((prev) => ({
      ...prev,
      [ageGroup]: Math.max(0, prev[ageGroup] - 1),
    }));
  }, []);

  const getTotalPartySize = useCallback(() => {
    return Object.values(groupSize).reduce((sum, value) => sum + value, 0);
  }, [groupSize]);

  const getMinMaxLimits = useCallback(() => {
    const groupOrderItem = selectedItem && selectedItem.isGroupOrder;
    const minSize = groupOrderItem
      ? selectedItem.minOrderQty
      : shop.minNumPeople || 0;
    const maxSize = groupOrderItem
      ? selectedItem.maxOrderQty
      : shop.maxNumPeople || 10;
    return { minSize, maxSize };
  }, [selectedItem, shop]);

  const canIncrement = useCallback(() => {
    const { maxSize } = getMinMaxLimits();
    const futureTotal = getTotalPartySize() + 1;
    return futureTotal <= maxSize;
  }, [getTotalPartySize, getMinMaxLimits]);

  const canDecrement = useCallback(
    (ageGroup: keyof typeof groupSize) => {
      const { minSize } = getMinMaxLimits();
      const futureTotal = getTotalPartySize() - 1;
      return groupSize[ageGroup] > 0 && futureTotal >= minSize;
    },
    [getTotalPartySize, getMinMaxLimits, groupSize]
  );

  const renderCounter = (label: string, ageGroup: keyof typeof groupSize) => {
    const ageGroupTestId = `Party Size List ${label} Counter`;
    return (
      <div>
        <span>{label}</span>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <button
            type="button"
            data-testid={`${ageGroupTestId}Counter Subtract Button`}
            onClick={() => handleDecrement(ageGroup)}
            disabled={!canDecrement(ageGroup)}
          >
            -
          </button>
          <option data-testid={ageGroupTestId} value={groupSize[ageGroup]}>
            {groupSize[ageGroup]}
          </option>
          <button
            type="button"
            data-testid={`${ageGroupTestId}Counter Add Button`}
            onClick={() => handleIncrement(ageGroup)}
            disabled={!canIncrement()}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  const validatePartySize = useCallback(() => {
    const totalSize = getTotalPartySize();
    const { minSize, maxSize } = getMinMaxLimits();
    return totalSize >= minSize && totalSize <= maxSize;
  }, [getTotalPartySize, getMinMaxLimits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValid(validatePartySize() ? "valid" : "invalid");
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setGroupSize({ adults: 1, children: 0, babies: 0, seniors: 0 });
    setIsValid("pending");
  };

  return (
    <div data-testid="Party Size List">
      <h1>{shop.slug}</h1>
      <br />
      <hr />
      <br />
      <h2>Menu Items</h2>
      <select onChange={handleSelectChange} data-testid="Counter Select">
        <option value="">Select an item</option>
        {menuItems.map((item, index) => (
          <option key={item.id + index} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
      <br />
      <hr />
      <br />
      <h2>Party Size</h2>
      {selectedItem && (
        <div>
          <h3>{selectedItem.title}</h3>
          <p>{selectedItem.description}</p>
          {selectedItem.isGroupOrder ? (
            <>
              <p>Min Order Qty: {selectedItem.minOrderQty}</p>
              <p>Max Order Qty: {selectedItem.maxOrderQty}</p>
            </>
          ) : (
            <>
              <p>Min Num People: {shop.minNumPeople}</p>
              <p>Max Num People: {shop.maxNumPeople}</p>
            </>
          )}
          <span>
            {isValid !== "pending"
              ? isValid === "valid"
                ? `Submission successful \u2705`
                : `Submission is invalid \u274C`
              : ""}
          </span>
          <form onSubmit={handleSubmit} onReset={handleReset}>
            {renderCounter("Adults", "adults")}
            {shop.showChild && renderCounter("Children", "children")}
            {shop.showBaby && renderCounter("Babies", "babies")}
            {shop.showSenior && renderCounter("Seniors", "seniors")}
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PartySizeForm;
