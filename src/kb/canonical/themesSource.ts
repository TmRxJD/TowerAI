import {
  THEME_CATEGORY_DEFINITIONS,
  THEME_MENU_SECTION_FACTS,
  THEME_OVERVIEW_FACTS,
  THEME_PASSIVE_FORMULA,
  THEME_PASSIVE_FORMULA_FACTS,
  THEME_PASSIVE_FORMULA_TERMS,
  THEME_RELIC_MENU_FACTS,
  THEME_SONG_FACTS,
  type ThemeCategoryDefinition,
  type ThemeMenuSectionFact,
  type ThemePassiveFormulaTerm,
} from '@tmrxjd/platform/tools'

export interface ThemesSourceDocument {
  overviewFacts: string[]
  categories: readonly ThemeCategoryDefinition[]
  passiveFormula: string
  passiveFormulaFacts: string[]
  passiveFormulaTerms: readonly ThemePassiveFormulaTerm[]
  songFacts: string[]
  relicMenuFacts: string[]
  menuSections: readonly ThemeMenuSectionFact[]
}

export function loadThemesSourceDocument(): ThemesSourceDocument {
  return {
    overviewFacts: [...THEME_OVERVIEW_FACTS],
    categories: THEME_CATEGORY_DEFINITIONS,
    passiveFormula: THEME_PASSIVE_FORMULA,
    passiveFormulaFacts: [...THEME_PASSIVE_FORMULA_FACTS],
    passiveFormulaTerms: THEME_PASSIVE_FORMULA_TERMS,
    songFacts: [...THEME_SONG_FACTS],
    relicMenuFacts: [...THEME_RELIC_MENU_FACTS],
    menuSections: THEME_MENU_SECTION_FACTS,
  }
}
