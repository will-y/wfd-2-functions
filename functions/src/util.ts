export function replaceChar(input: string, map: Map<string, string>) {
  const resultArray = [];

  for (const c of input) {
    const mapped = map.get(c);
    resultArray.push(mapped? mapped : c);
  }

  return resultArray.join("");
}

// TODO: Eventually move to db
const unitAliases = {
  "cups": ["cup"],
  "grams": ["gram"],
  "ounces": ["ounce", "oz"],
  "fl ounces": ["floz"],
  "tsp": ["teaspoon", "teaspoons"],
  "tbsp": ["tablespoon", "tablespoons"],
  "lbs": ["pound", "pounds"],
  "quarts": ["quart"],
};

const createUnitMap = () => {
  const result = new Map<string, string>();

  for (const entry of Object.entries(unitAliases)) {
    for (const alias of entry[1]) {
      result.set(alias, entry[0]);
    }
    result.set(entry[0], entry[0]);
  }

  return result;
};

const unitMap = createUnitMap();

export function convertUnits(input: string): string {
  const unit = unitMap.get(input);

  return unit ? unit : "#";
}
