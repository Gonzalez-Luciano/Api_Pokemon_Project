// src/App.jsx
import React, { Suspense, useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { filterWeight, filterHeight } from "./filterInfo";
import { fetchData, getSuspender, fetchPokemonDetails } from "./fetchData";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Llamada a la API y uso de Suspense
const apiData = getSuspender(
  fetchData("https://pokeapi.co/api/v2/pokemon?limit=25&offset=0")
);

function App() {
  const data = apiData.read();
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSpicie, setSearchSpicie] = useState([]);
  const [speciesDescription, setSpeciesDescription] = useState("");
  const [animatedPokemonId, setAnimatedPokemonId] = useState(null);

  useEffect(() => {
    const fetchPokemons = async () => {
      setPokemons(data);
      setFilteredPokemons(data);
    };
    fetchPokemons();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  useEffect(() => {
    const fetchSearchedPokemon = async () => {
      if (searchTerm) {
        try {
          const searchPokemon = await fetchPokemonDetails(
            `https://pokeapi.co/api/v2/pokemon/${searchTerm}`
          );
          setFilteredPokemons([searchPokemon]);
        } catch (error) {
          console.error("Error al obtener al pokemon ", error);
          setFilteredPokemons([]);
        }
      }
    };

    fetchSearchedPokemon();
  }, [searchTerm, pokemons]);

  const playSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.play();
  };

  useEffect(() => {
    if (filteredPokemons.length === 1) {
      const fetchSearchedSpicie = async (url) => {
        try {
          const searchSpeciePokemonFetch = await fetchPokemonDetails(`${url}`);
          setSearchSpicie([searchSpeciePokemonFetch]);
        } catch (error) {
          console.error("Error al obtener la descripción", error);
        }
      };
      fetchSearchedSpicie(filteredPokemons[0].species.url);
    }
  }, [filteredPokemons]);

  const cleanDescription = (text) => {
    return text.replace(/[\f\n\r]/g, " ").trim();
  };

  useEffect(() => {
    if (searchSpicie.length > 0) {
      const englishEntry = searchSpicie[0].flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );

      if (englishEntry) {
        const rawDescription = englishEntry.flavor_text;
        const cleanedDescription = cleanDescription(rawDescription);
        setSpeciesDescription(cleanedDescription);
      } else {
        console.error("No se encontró una descripción en inglés.");
      }
    }
  }, [searchSpicie]);

  const handleImageClick = (id, soundUrl) => {
    playSound(soundUrl);
    setAnimatedPokemonId(id);
    setTimeout(() => setAnimatedPokemonId(null), 2000); 
  };

  return (
    <div className="App bg-dark rounded pb-3">
      <div className="py-2">
        <img src="/Pokedex_logo.webp" alt="Logo" className="img-fluid" />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="container">
          <SearchBar onSearch={handleSearch} />
          <div
            className={`row justify-content-center gap-3 gap-md-5 ${
              filteredPokemons.length === 1
                ? "row-cols-1" // Una sola columna ocupa todo el ancho
                : "row-cols-1 row-cols-sm-1 row-cols-md-4 row-cols-xl-5"
            }`}
          >
            {filteredPokemons.length > 0 ? (
              //Se encrontro un solo Pokemon
              filteredPokemons.length === 1 ? (
                filteredPokemons.map((pokemon) => {
                  const soundUrl = `${pokemon.cries.latest}`;
                  const { filteredWeight, unitWeight } = filterWeight(
                    pokemon.weight
                  );
                  const { filteredHeight, unitHeight } = filterHeight(
                    pokemon.height
                  );

                  return (
                    <div
                      key={pokemon.id}
                      className="d-flex justify-content-between bg-dark text-light rounded p-2 w-50"
                    >
                      <div className="p-4 border border-warning rounded">
                        <h2>{pokemon.name}</h2>
                        <div
                          className={`sprite ${
                            animatedPokemonId === pokemon.id
                              ? "sprite-animate"
                              : ""
                          }`}
                          onClick={() => handleImageClick(pokemon.id, soundUrl)}
                        >
                          <img
                            className={
                              pokemon.sprites.front_default ? "" : "sprite-img"
                            }
                            src={
                              pokemon.sprites.front_default
                                ? pokemon.sprites.front_default
                                : "/Pokemon_image_not_found.png"
                            }
                            alt={pokemon.name}
                          />
                        </div>
                        <p>
                          Height: {filteredHeight} {unitHeight}
                        </p>
                        <p>
                          Weight: {filteredWeight} {unitWeight}
                        </p>
                        <p>
                          Types:{" "}
                          {pokemon.types
                            .map((type) => type.type.name)
                            .join(", ")}
                        </p>
                      </div>
                      <div className="description">
                        <h3 className="">Description</h3>
                        {speciesDescription}
                      </div>
                    </div>
                  );
                })
              ) : (
                //Se encontraron mas de un Pokemones
                filteredPokemons.map((pokemon) => {
                  const soundUrl = `${pokemon.cries.latest}`;
                  const { filteredWeight, unitWeight } = filterWeight(
                    pokemon.weight
                  );
                  const { filteredHeight, unitHeight } = filterHeight(
                    pokemon.height
                  );
                  return (
                    <div
                      key={pokemon.id}
                      className="col pokemon-container bg-dark text-light border-bottom border-top border-warning rounded p-2 w-auto"
                    >
                      <div>
                        <button
                          className="fs-2 fw-semibold pokemon-name"
                          onClick={() => handleSearch(pokemon.name)}
                        >
                          {pokemon.name}
                        </button>
                      </div>

                      <div
                        className={`sprite ${
                          animatedPokemonId === pokemon.id
                            ? "sprite-animate"
                            : ""
                        }`}
                        onClick={() => handleImageClick(pokemon.id, soundUrl)}
                      >
                        <img
                          src={pokemon.sprites.front_default}
                          alt={pokemon.name}
                        />
                      </div>
                      <p>
                        Height: {filteredHeight} {unitHeight}
                      </p>
                      <p>
                        Weight: {filteredWeight} {unitWeight}
                      </p>
                      <p>
                        Types:{" "}
                        {pokemon.types.map((type) => type.type.name).join(", ")}
                      </p>
                    </div>
                  );
                })
              )
            ) : (
              // No se encontraron Pokemones
              <div className="text-light text-center pb-3">
                <h4 className="pb-5">Pokémon not found</h4>
                Go Back to{" "}
                <button
                  className="link-primary fw-bold"
                  onClick={() => window.location.reload()}
                >
                  Home
                </button>
              </div>
            )}
            {filteredPokemons.length === 1 ? (
              <div className="text-light text-center pb-3">
                Go Back to{" "}
                <button
                  className="link-primary fw-bold"
                  onClick={() => window.location.reload()}
                >
                  Home
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </Suspense>
    </div>
  );
}

export default App;
