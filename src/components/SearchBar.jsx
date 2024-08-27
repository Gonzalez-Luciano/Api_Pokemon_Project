// src/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from "@headlessui/react";

async function getAllPokemonNames() {
  const url = "https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0";
  const response = await fetch(url);
  const data = await response.json();

  // Extraer solo los nombres de los Pokémon
  const pokemonNames = data.results.map((pokemon) => pokemon.name);

  return pokemonNames;
}

function SearchBar({ onSearch }) {
  const [pokemonsNames, setPokemonsNames] = useState([]);
  const [query, setQuery] = useState("");
  const [topPosition, setTopPosition] = useState(0);
  const [leftPosition, setLeftPosition] = useState(0);
  const [widthOptions, setWidthOptions] = useState(0);
  const inputRef = useRef(null);

  const updatePosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setTopPosition(rect.bottom);
      setLeftPosition(rect.left);
      setWidthOptions(rect.width);
    }
  };

  useEffect(() => {
    updatePosition();
  }, [query]);

  useEffect(() => {
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const names = await getAllPokemonNames();
      setPokemonsNames(names);
    };

    fetchData();
  }, []);

  const filteredPokemons = query
    ? pokemonsNames
        .filter((pokemonName) =>
          pokemonName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 250)
    : // Filtrar y limitar a los primeros 250 resultados
      [];

  const handleSearch = () => {
    onSearch(query);
    setQuery("");
  };

  const handleChange = (name) => {
    setQuery(name);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
      if (event.key === "Tab") {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [query]);

  return (
    <Combobox
      as="div"
      className="d-flex flex-column flex-md-row justify-content-center align-items-center w-100 pb-5"
      value={query}
      onChange={handleChange}
    >
      <div></div>
      <ComboboxInput
        aria-label="Pokemon"
        className="mb-3 mb-md-0 me-md-3"
        displayValue={(name) => name}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        placeholder="Search a Pokémon"
        ref={inputRef}
      />
      <ComboboxOptions
        portal={false}
        className="list-group combobox-options position-absolute border border-secondary rounded bg-light mt-1"
        style={{
          maxHeight: "50vh",
          width: `${widthOptions}px`,
          overflowY: "auto",
          zIndex: 10,
          top: `${topPosition}px`,
          left: `${leftPosition}px`,
        }}
      >
        {filteredPokemons.length > 0
          ? filteredPokemons.map((name) => (
              <ComboboxOption
                key={name}
                value={name}
                className={({ focus }) =>
                  `list-group-item list-group-item-action ${
                    focus ? "bg-primary text-light" : ""
                  }`
                }
              >
                {name}
              </ComboboxOption>
            ))
          : null}
      </ComboboxOptions>
      <ComboboxButton className="btn btn-primary" onClick={handleSearch}>
        Search
      </ComboboxButton>
    </Combobox>
  );
}

export default SearchBar;
