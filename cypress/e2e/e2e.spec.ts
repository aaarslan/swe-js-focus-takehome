import { cy, describe, it } from "local-cypress";
import { client } from "../support/client.generated";

const ids = {
  ROOT: "Party Size List",
  CTA: "Party Size CTA",
  MODAL: "Party Size Modal",
  ADULTS: "Party Size List Adults Counter",
  CHILDREN: "Party Size List Children Counter",
  BABIES: "Party Size List Babies Counter",
  SENIORS: "Party Size List Seniors Counter",
  COUNTER: {
    ADD: "Counter Add Button",
    SUBTRACT: "Counter Subtract Button",
    SELECT: "Counter Select",
  },
};

describe("page load", () => {
  it("should display welcome to {{shop}} message", () => {
    cy.visit("/test/book");
    cy.getByTestId("Shop Title").should("contain", "welcome to test");
  });
});

describe("reservation: party size", () => {
  it("should respect min and max totals across all age groups", () => {
    cy.mock("get /shops/:id 200", (draft) => {
      draft.minNumPeople = 3;
      draft.maxNumPeople = 6;
      draft.showBaby = true;
      draft.showChild = true;
      draft.showSenior = true;
    });

    cy.mock("get /shops/:id/menu 200", (draft) => {
      draft.splice(0, draft.length);
    });

    cy.visit("/test/book");

    cy.getByTestId(ids.CTA).click();

    [ids.CHILDREN, ids.BABIES, ids.SENIORS].forEach((testid) => {
      cy.get(`[data-testid="${testid}"] select`).should("have.value", "0");
    });

    [ids.ADULTS, ids.CHILDREN, ids.BABIES, ids.SENIORS].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.SUBTRACT).should("be.disabled");
    });

    [ids.ADULTS, ids.CHILDREN, ids.BABIES, ids.SENIORS].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.ADD).should("not.be.disabled");
    });

    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).click();
    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).should("not.be.disabled");
    cy.getByTestId(ids.ADULTS, ids.COUNTER.SUBTRACT).should("not.be.disabled");
    [ids.CHILDREN, ids.BABIES, ids.SENIORS].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.SUBTRACT).should("be.disabled");
    });

    cy.getByTestId(ids.SENIORS, ids.COUNTER.ADD).click();
    cy.getByTestId(ids.SENIORS, ids.COUNTER.ADD).should("not.be.disabled");
    cy.getByTestId(ids.SENIORS, ids.COUNTER.SUBTRACT).should("not.be.disabled");
    [ids.BABIES, ids.CHILDREN].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.SUBTRACT).should("be.disabled");
    });

    cy.getByTestId(ids.ADULTS, ids.COUNTER.SUBTRACT).click();
    cy.getByTestId(ids.ADULTS, ids.COUNTER.SUBTRACT).click();
    [ids.ADULTS, ids.CHILDREN, ids.BABIES, ids.SENIORS].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.SUBTRACT).should("be.disabled");
    });

    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).click();
    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).click();
    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).click();
    [ids.ADULTS, ids.CHILDREN, ids.BABIES, ids.SENIORS].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.ADD).should("be.disabled");
    });

    [ids.CHILDREN, ids.BABIES].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.SUBTRACT).should("be.disabled");
    });
  });

  it("should respect min max order qty for group orders", () => {
    cy.mock("get /shops/:id 200", (draft) => {
      draft.minNumPeople = 3;
      draft.maxNumPeople = 6;
      draft.showBaby = true;
      draft.showChild = true;
      draft.showSenior = true;
    });

    cy.mock("get /shops/:id/menu 200", (draft) => {
      draft.splice(0, draft.length);
      draft.push(
        client["get /shops/:shop/menu 200"]((item) => {
          item.isGroupOrder = true;
          item.minOrderQty = 2;
        }),
        client["get /shops/:shop/menu 200"]((item) => {
          item.isGroupOrder = true;
          item.maxOrderQty = 5;
        })
      );
    });

    cy.visit("/test/book");

    cy.getByTestId(ids.CTA).click();

    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).click();
    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).click();
    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).click();
    [ids.ADULTS, ids.CHILDREN, ids.BABIES, ids.SENIORS].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.ADD).should("be.disabled");
    });

    cy.getByTestId(ids.ADULTS, ids.COUNTER.SUBTRACT).click();
    cy.getByTestId(ids.ADULTS, ids.COUNTER.ADD).should("not.be.disabled");

    cy.getByTestId(ids.SENIORS, ids.COUNTER.ADD).click();
    [ids.ADULTS, ids.SENIORS].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.SUBTRACT).should("not.be.disabled");
    });
    [ids.CHILDREN, ids.BABIES].forEach((testid) => {
      cy.getByTestId(testid, ids.COUNTER.SUBTRACT).should("be.disabled");
      cy.getByTestId(testid, ids.COUNTER.ADD).should("be.disabled");
    });
  });
});
