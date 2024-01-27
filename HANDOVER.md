# TableCheck Handover

## Notes:

- missing .nvmrc file, `nvm use` fails to run due to missing file.

---

## Task one

- Visiting localhost:3000/:shop/book OR localhost:3000/test/book fails to load page
- Throttling page allows me to see initial "welcome to test", which only leads me to assume that something is out of sync between the server and client
- Pulling up Chrome dev tools, I notice that there is a div with preloaded data in an input tag with what seems to be a random ID associated with it. The console also displays errors pointing to useController.tsx and ShopBookingPage.tsx
- Upon inspecting both ShopBookingPage.tsx which consumes useController.tsx and useController.tsx, I moreso lean towards there being an issue in useController, and since `shop.config.slug` is returning undefined, the state / store might be out of sync.
- Adding a console.log in the useController, I find that the state contains an instance of partySize, but it remains undefined.
- My next step is to check the provider to see if the store contains any data, throwing a console.log in there returns an empty object.
- What stands out to me is the hydration.ts file now. I can see where the preloaded data is being chunked into the input tag, I also see `this.id`. The context is being exported as a new instance of the PreloadedDataHydrator by with a random id being passed in to the constructor, could this be the culprit? console.log("this.id", this.id);
- Well, well, well... the generated html has a different ID from the ID in the console.log in hydration.ts, since TableCheck is big on SSR, I can only assume that this is a SSR issue, so I must check the server.tsx file.
- console.log('server store', store) in server.tsx, and I get data back in my terminal... so the ID mismatch is definitely causing an issue. Interestingly enough I have access to the context from the client app, which is the exported instance of the PreloadedDataHydrator class which contains the randomizing ID that needs to stop being randomized.
- The pivotal discovery was the mismatch between the id in the hydration.ts file and the ID generated in the HTML. This discrepancy was critical because it directly affected the data synchronization between the server and the client, leading to the failure of the "page load" test.
- Recognizing the root of the problem, I turned my attention to the constructor in the PreloadedDataHydrator class within the hydration.ts file. Initially, this constructor accepted an id parameter but also had a fallback to generate a random ID if none was provided. This approach was problematic because it resulted in inconsistent IDs between the server-side rendering (SSR) and client-side hydration.
- To ensure consistency, I modified the constructor to always use a provided id, eliminating the randomness. If no id is provided, it now defaults to Math.random().toString(). This change ensured that the same ID used during server-side rendering is also utilized for client-side hydration.
- Next, I addressed the server.tsx file. The server generates the initial HTML, including the preloaded data. Here, I added a new parameter preloadedId to the interpolate method. This preloadedId is the consistent ID required for data synchronization.
- In the bookingHandler method, I retrieved the preloadedId from the context (which is an instance of PreloadedDataHydrator) and passed it to the interpolate method. This ensured that the same ID is used throughout the entire rendering and hydration process.
- Additionally, I included a script tag in the returned HTML that sets window.preloadedDataId to the preloadedId. This integration allows the client-side JavaScript to access the same ID that was used server-side, ensuring a seamless transition between server-rendered content and client-side hydration.
- These changes collectively resolved the ID mismatch issue. With a consistent ID used across both server and client, the application could properly synchronize its state, allowing the console.log to return data in the useController but the page is still not loading, an issue still remains in useController.
- After ensuring consistent ID synchronization between the server and the client, the "page load" test still failed. This led me back to the useController.tsx file, as the console continued to show an undefined error for shop.config.slug.
- It became apparent that the issue was with the useController itself. The key was in the destructuring of shop and menu from the context and their subsequent usage in initializing the partySize state. The shop.config.slug was sometimes returning undefined, likely due to asynchronous data fetching or state initialization issues.
- I replaced this.isCTAOpen and this.partySize with state.isCTAOpen and state.partySize, respectively. This adjustment ensures that the modal dialog uses the current state values, which are more reliable than this references in functional components using hooks.
- These changes in useController.tsx were the final piece of the puzzle. By ensuring the safe handling of potentially undefined properties and correctly referencing state in the functional component, the application was able to render the page correctly, and the "page load" test finally passed.
- In conclusion, the issue was a combination of inconsistent ID synchronization between server and client, and a minor but significant oversight in the handling of potentially undefined properties in the useController.tsx. Correcting these ensured that the application could correctly render the "welcome to {{test}}" message and pass the e2e test without modifying the test itself.

---