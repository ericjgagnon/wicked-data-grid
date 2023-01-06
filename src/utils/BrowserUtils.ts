/**
 * @format
 */
const languages = new Set<string>();
function getUserLocales() {
  const { navigator } = window;
  if (navigator.languages) {
    navigator.languages.forEach((language) => {
      if (language) {
        languages.add(language);
      }
    });
  }
  if (navigator.language) {
    languages.add(navigator.language);
  }
  return Array.from(languages);
}

export { getUserLocales };
