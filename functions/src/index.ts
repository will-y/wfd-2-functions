/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {HttpsError, onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {scrapeHtmlWeb} from "scrape-html-web";
import {Ingredient} from "./recipe";
import {HttpIngredient, HttpStep} from "./scraped-models";
import {convertUnits, replaceChar} from "./util";

const fractionConverter = new Map(Object.entries({
  "½": ".5",
  "¼": ".25",
  "¾": ".75",
  "⅓": ".333",
  "⅔": ".667",
  "⅛": ".125",
  "⅜": ".375",
  "⅝": ".625",
  "⅞": ".875",
}));

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const parseRecipe = onCall((request) => {
  if (!request.auth) return;

  const url = request.data.url;

  if (!url) {
    throw new HttpsError("invalid-argument", "Invalid URL");
  }

  logger.info("Getting Recipe for URL: ", url);

  const ingredientOptions = {
    url: `https://cooked.wiki/new?url=${url}`,
    list: true,
    bypassCors: true, // avoids running errors in esm
    mainSelector: ".shopping-list",
    childrenSelector: [
      {key: "ingredient", selector: ".ingredient", type: "text"},
    ],
  };

  const stepOptions = {
    url: `https://cooked.wiki/new?url=${url}`,
    list: true,
    bypassCors: true, // avoids running errors in esm
    mainSelector: ".steps",
    childrenSelector: [
      {key: "step", selector: "p", type: "text"},
    ],
  };

  // response.send("Hello from Firebase!");

  const ingredientPromise: Promise<HttpIngredient[]> = scrapeHtmlWeb(ingredientOptions);
  const stepPromise: Promise<HttpStep[]> = scrapeHtmlWeb(stepOptions);

  // TODO: Maybe 3rd call (would just get title)
  return Promise.all([ingredientPromise, stepPromise])
    .then(([ingredients, steps])=> {
      ingredients.pop();
      return {
        ingredients: parseIngredients(ingredients),
        steps: parseSteps(steps),
        source: url,
      };
    });
});

const parseIngredients = (ingredients: HttpIngredient[]): Ingredient[] => {
  return ingredients.map((i) => parseIngredient(i.ingredient));
};

const parseIngredient = (input: string): Ingredient => {
  const noFractions = replaceChar(input, fractionConverter);
  const fixNumbers = noFractions.replace(" .", ".");
  const split = fixNumbers.split(" ");
  const quantity = split[0];
  const unit = split[1];
  const convertedUnit = convertUnits(unit);
  const name = (convertedUnit == "#" ? split.slice(1) : split.splice(2)).join(" ");

  return {
    name: name,
    quantity: Number(quantity) ? Number(quantity) : 0,
    unit: convertedUnit,
  };
};

const parseSteps = (steps: HttpStep[]): string[] => {
  return steps.map((step) => step["step"]);
};
