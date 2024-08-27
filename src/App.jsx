// src/App.jsx
import React, { Suspense, useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import PokemonDetail from "./components/PokemonDetails";
import getTypeClass from "./getTypeClass";
import { filterWeight, filterHeight } from "./filterInfo";
import { fetchData, getSuspender, fetchPokemonDetails } from "./fetchData";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Llamada a la API y uso de Suspense
const apiData = getSuspender(
  fetchData("https://pokeapi.co/api/v2/pokemon-species?limit=25&offset=0")
);

function App() {
  const data = apiData.read();
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [searchPokemonName, setSearchPokemonName] = useState("");
  const [searchPokemonSpicie, setSearchPokemonSpicie] = useState("");
  const [speciesCharacteristic, setSpeciesCharacteristic] = useState("");
  const [animatedPokemonId, setAnimatedPokemonId] = useState(null);

  useEffect(() => {
    const fetchPokemons = async () => {
      setPokemons(data);
      setFilteredPokemons(data);
    };
    fetchPokemons();
  }, []);

  const handleSearchSpicie = (term) => {
    setSearchPokemonSpicie(term);
  };

  const handleSearchName = (term) => {
    Number.isInteger(term)
      ? setSearchPokemonName(term)
      : setSearchPokemonName(term.toLowerCase());
  };

  useEffect(() => {
    const fetchSearchedPokemon = async () => {
      if (searchPokemonName) {
        try {
          const searchPokemon = await fetchPokemonDetails(
            `https://pokeapi.co/api/v2/pokemon/${searchPokemonName}`
          );
          const searchSpicie = await fetchPokemonDetails(
            searchPokemon.species.url
          );
          setFilteredPokemons([searchSpicie]);
        } catch (error) {
          console.error("Error al obtener al pokemon ", error);
          setFilteredPokemons([]);
        }
      }
    };

    fetchSearchedPokemon();
  }, [searchPokemonName, pokemons]);

  useEffect(() => {
    const fetchSearchedPokemonSpicie = async () => {
      if (searchPokemonSpicie) {
        try {
          const searchSpicie = await fetchPokemonDetails(
            `https://pokeapi.co/api/v2/pokemon-species/${searchPokemonSpicie}`
          );
          setFilteredPokemons([searchSpicie]);
        } catch (error) {
          console.error("Error al obtener al pokemon ", error);
          setFilteredPokemons([]);
        }
      }
    };

    fetchSearchedPokemonSpicie();
  }, [searchPokemonSpicie, pokemons]);

  const playSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.play();
  };

  useEffect(() => {
    if (filteredPokemons.length === 1) {
      const fetchSearchedSpicie = () => {
        try {
          // Fetch the species data
          const speciesData = filteredPokemons[0];

          // Find the English flavor text entry
          const englishEntry = speciesData.flavor_text_entries.find(
            (entry) => entry.language.name === "en"
          );

          if (englishEntry) {
            // Clean the raw description text
            const rawDescription = englishEntry.flavor_text;
            const cleanedDescription = cleanDescription(rawDescription);

            // Update the species characteristic with the cleaned description
            setSpeciesCharacteristic(cleanedDescription);
          } else {
            console.error("No se encontró una descripción en inglés.");
          }
        } catch (error) {
          console.error("Error al obtener la descripción", error);
        }
      };

      // Call the function with the species URL
      fetchSearchedSpicie();
    }
  }, [filteredPokemons]);

  const cleanDescription = (text) => {
    return text.replace(/[\f\n\r]/g, " ").trim();
  };

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
          <SearchBar onSearch={handleSearchName} />
          <div
            className={`row justify-content-center gap-3 gap-md-5 ${
              filteredPokemons.length === 1
                ? "row-cols-1"
                : "row-cols-1 row-cols-sm-1 row-cols-md-4 row-cols-xl-5"
            }`}
          >
            {filteredPokemons.length > 0 ? (
              filteredPokemons.map((pokemonSpecie) => (
                <PokemonDetail
                  key={pokemonSpecie.id}
                  pokemonSpecie={pokemonSpecie}
                  animatedPokemonId={animatedPokemonId}
                  handleImageClick={handleImageClick}
                  handleSearchName={handleSearchName}
                  handleSearchSpicie={handleSearchSpicie}
                  speciesCharacteristic={speciesCharacteristic}
                  isMultiple={filteredPokemons.length > 1}
                />
              ))
            ) : (
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
