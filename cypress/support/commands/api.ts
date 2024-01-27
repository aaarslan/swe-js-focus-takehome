import ax from "axios";
import { cy, Cypress } from "local-cypress";
import { client } from "../client.generated";

const axios = ax.create({
  baseURL: "http://localhost:9001",
});

declare global {
  namespace Cypress {
    interface Chainable {
      mock: (match: string, producer: any, key?: string) => Chainable;
      unmock: (key: string) => Chainable;
    }
  }
}

Cypress.Commands.add("mock", (match, producer, key) =>
  cy.then(async () => {
    const [method, path, statusCode] = match.split(" ");
    const response = client[match](producer);

    await axios.post("/mock", {
      match: { method, path, statusCode },
      response,
      key,
    });
  })
);

Cypress.Commands.add("unmock", (key) =>
  cy.then(async () => {
    await axios.post("/unmock", { key });
  })
);
