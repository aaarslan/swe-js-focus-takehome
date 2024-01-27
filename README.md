# TableCheck SWE (js focus) takehome

## Intro

At TableCheck we believe that the essence of a great software engineer lies in a solid grasp of fundamentals and a well-rounded skill set. This take-home assignment is designed to not only assess your proficiency in JavaScript, but also to gauge the depth and breadth of your understanding in some key areas of software engineering, particularly testing.

One of the most challenging and yet most crucial aspects of software development is the ability to read and maintain code written by others. In the real world, writing code from scratch is a rarity compared to the frequency of interacting with existing codebases. In this assignment, you'll be tasked with understanding, critiquing, and improving a pre-existing codebase mostly copied/modified from our existing projects. This will test your ability to quickly adapt to different coding styles and architectures, and to apply best practices in making the code more readable, maintainable, and efficient.

We're excited to see how you approach these challenges and demonstrate the skills that make a truly exceptional software engineer at TableCheck. Good luck!

## Other Constraints

We're not concerned with your level of typescript skill. Typescript usually very "trivia"-ish, meaning you know it or you don't. This is ok, it can be learned. So don't get worried about having 100% correct types. It's ok to submit this exercise with red squiggles everywhere.

We're also not concerned with styling/css in this exercise. Our design team and devs coordinate closely so that our UI toolkits let us create pixel-perfect pages with minimal effort. So don't worry about styling. In fact you don't even need to write a single line of css for this exercise.

No additional assistance will be provided for the duration of the takehome. You may use any resources you wish (including LLMs), but you must complete the assignment on your own. No additional questions will be answered about the assignment, including how to run the code, how to interpret the requirements, or how to complete the tasks.

This take-home assignment is given to developers of many varying skill levels, depending on your experience, you may not be able to finish all of the tasks in the given time and that's okay! You can still submit the partially complete assignment without being penalized, though we will require you write some documentation outlined in the submission section, testing your asynchronus communication skills and ability to hand over work with minimal friction to other developers.

## Submission

Please _Clone_ (not Fork) this repository into your own personal public repository. Each task should be completed in its own commit. Please do not squash commits. Merge all commits into `main`.

Write down relevant commit/pr title/descriptions in whatever style/detail you think makes sense. There is no need to follow commitlint or anything like that.

If there are any incomplete tasks, please write down in a new `HANDOVER.md` file as many of the following points as possible:

- Your understanding of the task.
- Your process of working on the task and what you've completed.
- Problems you faced stopping you from completing the task.
- What is remaining/missing in order to complete the task.

When submitting the take-home assignment, simply share the URL to your cloned repo (and ensure that it is set to be publicly accessible).

## Setup

```bash
# install
$ nvm use && npm i
# generate the openapi client
$ npm run generate
# webpack
$ npm run client:dev
# ssr
$ npm run server:dev
# open api
$ npm run openapi:dev
# browser e2e tests
$ npm run cy:open
```

You will need to run webpack, ssr, and the mock openapi server to begin debugging.

## Tasks

(1) The "page load" test in `e2e.spec.ts` is not passing. When you visit `/:shop/book` nothing is displayed. You should see "welcome to {{test}}" displayed. Fix the necessary application-level errors to get the test to pass **WITHOUT MODIFYING THE TEST**.

---

(2) This task is dependent upon the completion of Task (1). The "party size" test in `e2e.spec.ts` is not passing. When you visit `/:shop/book` and click on the button that says "click here to set party size", nothing is displayed. Your task is to implement the functionality to make this test pass **WITHOUT MODIFYING THE TEST**. Note that the required UI implementation must go inside the modal that is displayed when you click the button.

Most of the spec for this feature can be infered from the openapi spec, here are some examples of a valid party size based on the party configuration

```js
// min=3, max=10, showBaby=true, showChild=true, showSenior=true
{ children: 1, senior: 1, baby: 1, adult: 0 }
// all fields are respected
```

```js
// min=3, max=10, showChild=true
{ children: 0, senior: 0, baby: 0, adult: 3 }
// all fields are respected
```

These would be invalid

```js
// min=3, max=10, showBaby=true, showChild=true, showSenior=true
{ children: 4, senior: 1, baby: 1, adult: 1 }
// 7 is greater than max of 3
```

```js
// min=3, max=10, showBaby=true, showChild=true, showSenior=true
{ children: 1, senior: 0, baby: 0, adult: 1 }
// 2 is less than min of 3
```

Furthermore, min max party size of any given reservation must respect `isGroupOrder`, `minOrderQty` and `maxOrderQty` from the menu context. If the reservation contains a group order menu item, then the party size must be at least `minOrderQty` of said menu item and at most `maxOrderQty` of that menu item. If the reservation does _not_ contain a group order, then the party size respects the shop configuration. In short, group order min/max qty takes precedence over shop configuration.

For the UI you will need to dynamically render the party size selector based on the party configuration. The party configuration is defined in the openapi spec. It is up to you if you want to make this an incremental +1/-1 counter, a number input, a select, etc.

other spec notes:

- adult selector is always shown by default, hence there is no `showAdults` property in the openapi spec
- min can never be greater than max
- min can never be 0 or -infinity and defaults to 1
- max can never be +infinity and defaults to 10

---

(3) As you can see in the e2e tests, mocking an endpoint requires you to pass in a 2nd parameter callback which can modify the response. This is a bit cumbersome and not great DX; the 2nd parameter should be optional. Your task is to refactor the `OasClientFromSpec` class such that the `producer` callback argument (as shown below) is optional.

```ts
export const client = {
  "get /shops/:shop 200": function (producer) { // make this optional
    const faked = jsf.generate({
      required: [
```

---

(4) No code is perfect, and this project isn't an exception. Based on your own personal perspective, identify how and why the project can be improved from a technical standpoint, and refactor the project accordingly. Include in the commit description your reasons behind the changes and how it improves the project.
