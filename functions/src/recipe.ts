export interface Recipe {
    name?: string;
    servings?: number;
    type?: string;
    source?: string;
    ingredients: Ingredient[];
    steps: string[];
    notes?: string;
    keywords?: string[];
}

export interface Ingredient {
    name: string;
    quantity: number;
    unit: string;
}
