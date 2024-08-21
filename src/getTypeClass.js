const typeClasses = {
  normal: "type-normal",
  fire: "type-fire",
  water: "type-water",
  electric: "type-electric",
  grass: "type-grass",
  ice: "type-ice",
  fighting: "type-fighting",
  poison: "type-poison",
  ground: "type-ground",
  flying: "type-flying",
  psychic: "type-psychic",
  bug: "type-bug",
  rock: "type-rock",
  ghost: "type-ghost",
  dragon: "type-dragon",
  dark: "type-dark",
  steel: "type-steel",
  fairy: "type-fairy",
};

function getTypeClass(pokemonType) {
  return typeClasses[pokemonType] || "";
}

export default  getTypeClass;
