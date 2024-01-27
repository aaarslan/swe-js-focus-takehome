import { Cypress, cy } from "local-cypress";

declare global {
  declare namespace Cypress {
    interface Chainable {
      getByTestId(...testids): Chainable;
    }
  }
}

Cypress.Commands.add("getByTestId", (...testids) => {
  const selector = testids
    .map((testid) => `[data-testid="${testid}"]`)
    .join(" ");

  return cy.get(selector);
});
