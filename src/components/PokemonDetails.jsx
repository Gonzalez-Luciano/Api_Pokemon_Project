import React, { useState, useEffect, useRef } from "react";
import { filterWeight, filterHeight } from "../filterInfo";
import getTypeClass from "../getTypeClass";
import formatName from "../formatName";
import { fetchPokemonDetails } from "../fetchData";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

const PokemonDetail = ({
  pokemonSpecie,
  animatedPokemonId,
  handleImageClick,
  handleSearchName,
  handleSearchSpicie,
  speciesCharacteristic,
  isMultiple = false, // Por defecto, se asume que es un solo Pokémon
}) => {
  const [defaultPokemon, setDefaultPokemon] = useState(null);
  const [varieties, setVarieties] = useState([]);
  const [evolutions, setEvolutions] = useState([]);
  const [lastPokemonNumber, setLastPokemonNumber] = useState(0);
  const tabRefs = useRef([]);
  const tabListRef = useRef(null);

  const handleScrollLeft = () => {
    if (tabListRef.current) {
      tabListRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (tabListRef.current) {
      tabListRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  }; // Refs para cada tab

  const handleScrollClick = (index) => {
    if (tabListRef.current && tabRefs.current[index]) {
      const tabOffsetLeft = tabRefs.current[index].offsetLeft;
      const tabOffsetWidth = tabRefs.current[index].offsetWidth;

      // Ajusta el scroll para que el tab esté en el centro del contenedor
      tabListRef.current.scrollTo({
        left:
          tabOffsetLeft -
          tabListRef.current.clientWidth / 2 +
          tabOffsetWidth / 2,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        // Buscar el Pokémon por defecto (is_default = true)
        const varieties = pokemonSpecie.varieties;

        const detailedVarietiesPromises = varieties.map((pokemonVariety) =>
          fetchPokemonDetails(pokemonVariety.pokemon.url)
        );

        const detailedVarieties = await Promise.all(detailedVarietiesPromises);

        setVarieties(detailedVarieties);
      } catch (error) {
        console.error("Error fetching varieties:", error);
      }
    };

    fetchVarieties();
  }, [pokemonSpecie]);

  useEffect(() => {
    const fetchDefaultPokemon = async () => {
      try {
        // Buscar el Pokémon por defecto (is_default = true)
        const defaultVariety = pokemonSpecie.varieties.find(
          (variety) => variety.is_default
        );

        if (defaultVariety) {
          const defaultPokemonData = await fetchPokemonDetails(
            defaultVariety.pokemon.url
          );
          setDefaultPokemon(defaultPokemonData);
        }
      } catch (error) {
        console.error("Error fetching default pokemon:", error);
      }
    };

    fetchDefaultPokemon();
  }, [pokemonSpecie]);

  useEffect(() => {
    const fetchEvolutionChain = async () => {
      try {
        const evolutionChainUrl = pokemonSpecie.evolution_chain.url;
        const evolutionResponse = await fetchPokemonDetails(evolutionChainUrl);
        const evolutionChain = evolutionResponse.chain;

        const getEvolutions = (chain) => {
          let evolutionsList = [];
          evolutionsList.push(chain.species);
          chain.evolves_to.forEach((evolution) => {
            evolutionsList = evolutionsList.concat(getEvolutions(evolution));
          });
          return evolutionsList;
        };

        const allEvolutions = getEvolutions(evolutionChain);
        setEvolutions(allEvolutions);
      } catch (error) {
        console.error("Error fetching evolution chain:", error);
      }
    };

    fetchEvolutionChain();
  }, [pokemonSpecie]);

  useEffect(() => {
    const fetchMaxPokemonNumber = async () => {
      try {
        const searchPokemon = await fetchPokemonDetails(
          "https://pokeapi.co/api/v2/pokemon-species/"
        );
        const number = searchPokemon.count;
        setLastPokemonNumber(number);
      } catch (error) {
        console.error("Error fetching last pokemon number:", error);
      }
    };

    fetchMaxPokemonNumber();
  }, []);

  if (!defaultPokemon) {
    return <div>Loading...</div>; // Muestra un mensaje de carga mientras se obtiene el Pokémon por defecto
  }

  const { filteredWeight, unitWeight } = filterWeight(defaultPokemon.weight);
  const { filteredHeight, unitHeight } = filterHeight(defaultPokemon.height);
  const soundUrl = `${defaultPokemon.cries?.latest}`;

  if (isMultiple) {
    return (
      <div
        key={defaultPokemon.id}
        className="col pokemon-container bg-dark text-light border-bottom border-top border-warning rounded p-2 w-auto"
      >
        <div>
          <button
            className="fs-2 fw-semibold pokemon-name"
            onClick={() => handleSearchName(defaultPokemon.id)}
          >
            {defaultPokemon.name}
          </button>
        </div>

        <div
          className={`sprite ${
            animatedPokemonId === defaultPokemon.id ? "sprite-animate" : ""
          }`}
          onClick={() => handleImageClick(defaultPokemon.id, soundUrl)}
        >
          <img
            src={defaultPokemon.sprites.front_default}
            alt={defaultPokemon.name}
          />
        </div>
        <p>
          Height: {filteredHeight} {unitHeight}
        </p>
        <p>
          Weight: {filteredWeight} {unitWeight}
        </p>
        <div>
          <p>Types:</p>
          <div
            className={`row justify-content-center gap-2 ${
              defaultPokemon.types.length > 1 ? "row-cols-3" : "row-cols-2"
            }`}
          >
            {defaultPokemon.types.map((type) => (
              <span
                className={`col p-1 t-type ${getTypeClass(type.type.name)}`}
                key={type.type.name}
              >
                {type.type.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="d-flex flex-column flex-lg-row justify-content-between bg-dark text-light rounded p-2 w-50">
        <TabGroup>
          <div className="position-relative d-flex justify-content-center">
            <TabList className="tab-list overflow-auto mx-2" ref={tabListRef}>
              <button className="scroll-button-left" onClick={handleScrollLeft}>
                {"<"}
              </button>
              {varieties.map((variety, index) => {
                // Determinar clases para el tab
                const tabClassName = `btn btn-link ${
                  index === 0
                    ? "mr-2"
                    : index === varieties.length - 1
                    ? "ml-2"
                    : "mx-2"
                }`;

                return (
                  <Tab
                    key={variety.name}
                    className={tabClassName}
                    ref={(el) => (tabRefs.current[index] = el)}
                    onClick={() => handleScrollClick(index)}
                  >
                    {formatName(variety.name)}
                  </Tab>
                );
              })}
              <button
                className="scroll-button-right"
                onClick={handleScrollRight}
              >
                {">"}
              </button>
            </TabList>
          </div>
          <TabPanels className="tab-panels px-sm-3">
            {varieties.map((variety) => {
              const { filteredWeight, unitWeight } = filterWeight(
                variety.weight
              );
              const { filteredHeight, unitHeight } = filterHeight(
                variety.height
              );
              const soundUrl = `${variety.cries?.latest}`;
              return (
                <TabPanel key={variety.name}>
                  <div className="d-flex flex-row align-self-center">
                    <h2 className="d-inline pokemon-title lh-lg">
                      {formatName(variety.name)}
                    </h2>
                    <div
                      className={`sprite ${
                        animatedPokemonId === variety.id ? "sprite-animate" : ""
                      }`}
                      onClick={() => handleImageClick(variety.id, soundUrl)}
                    >
                      <img
                        className={
                          variety.sprites.versions["generation-viii"].icons
                            .front_default
                            ? ""
                            : "sprite-img"
                        }
                        src={
                          variety.sprites.versions["generation-viii"].icons
                            .front_default
                            ? variety.sprites.versions["generation-viii"].icons
                                .front_default
                            : "/Pokemon_image_not_found.png"
                        }
                        alt={variety.name}
                      />
                    </div>
                  </div>
                  <div className="d-flex flex-column flex-lg-row ">
                    <div className=" d-flex flex-column">
                      <img
                        className={`img-fluid ${
                          variety.sprites.other["official-artwork"]
                            .front_default
                            ? ""
                            : "sprite-img"
                        }`}
                        src={
                          variety.sprites.other["official-artwork"]
                            .front_default
                            ? variety.sprites.other["official-artwork"]
                                .front_default
                            : "/Pokemon_image_not_found.png"
                        }
                        alt={variety.name}
                      />
                      <div>
                        <p>
                          Height: {filteredHeight} {unitHeight}
                        </p>
                        <p>
                          Weight: {filteredWeight} {unitWeight}
                        </p>
                      </div>
                      <div>
                        <p>Types:</p>
                        <div
                          className={`row justify-content-center gap-2 ${
                            defaultPokemon.types.length > 1
                              ? "row-cols-3"
                              : "row-cols-2"
                          }`}
                        >
                          {defaultPokemon.types.map((type) => (
                            <span
                              className={`col p-1 t-type ${getTypeClass(
                                type.type.name
                              )}`}
                              key={type.type.name}
                            >
                              {type.type.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-self-center description mt-5 mt-lg-0">
                      <h3 className="">Characteristics</h3>
                      {speciesCharacteristic}
                      <h3 className="mt-4">Evolutions</h3>
                      <div className="row justify-content-center gap-2 row-cols-1">
                        {evolutions.length == 1 ? (
                          <div>No evolutions</div>
                        ) : (
                          evolutions.map((evolution) => (
                            <button
                              key={evolution.name}
                              className={`col btn btn-link text-light ${
                                evolution.name == defaultPokemon.name
                                  ? "d-none"
                                  : ""
                              }`}
                              onClick={() => handleSearchName(evolution.name)}
                            >
                              {evolution.name}
                            </button>
                          ))
                        )}
                      </div>
                      <div className="mt-3">
                        <h3>Abilities</h3>
                        <div className="d-flex flex-column justify-content-center">
                          {variety.abilities.map((ability) => (
                            <div className="pb-2" key={ability.ability.name}>
                              <span className="fw-bold">
                                {ability.is_hidden ? "Hidden" : "Regular"}:
                              </span>{" "}
                              {formatName(ability.ability.name)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row flex-column flex-md-row  gap-3 gap-md-0 justify-content-center mt-5">
                    {/* me-5 me-lg-3 me-xl-5 */}
                    <div className="text-wrap">
                      Previous Pokemon
                      <button
                        className={`btn btn-link  ${
                          defaultPokemon.id - 1 < 1 ? "d-none" : ""
                        }`}
                        onClick={() =>
                          handleSearchSpicie(defaultPokemon.id - 1)
                        }
                      >
                        {defaultPokemon.id - 1}
                      </button>
                    </div>
                    {/* ms-5 ms-lg-3 ms-xl-5 */}
                    <div className="text-wrap">
                      Next Pokemon
                      <button
                        className={`btn btn-link  ${
                          defaultPokemon.id + 1 > lastPokemonNumber
                            ? "d-none"
                            : ""
                        }`}
                        onClick={() =>
                          handleSearchSpicie(defaultPokemon.id + 1)
                        }
                      >
                        {defaultPokemon.id + 1}
                      </button>
                    </div>
                  </div>
                </TabPanel>
              );
            })}
          </TabPanels>
        </TabGroup>
      </div>
    );
    // return varieties.map((variety) => console.log(variety.forms[0].name));
    // <div className="d-flex flex-column flex-lg-row justify-content-between bg-dark text-light rounded p-2 w-50">
    //   <TabGroup>
    //     <TabList className="p-lg-4 border border-warning rounded">
    //       {varieties.map(({ pokemon  }) => (
    //         <Tab key={pokemon.name}>{pokemon.name}</Tab>
    //       ))}
    //     </TabList>
    //   </TabGroup>
    // </div>
    //   <div
    //     key={defaultPokemon.id}
    //     className="d-flex flex-column flex-lg-row justify-content-between bg-dark text-light rounded p-2 w-50"
    //   >
    //     <div className="p-lg-4 border border-warning rounded">
    //       <h2>{defaultPokemon.name}</h2>
    //       <div
    //         className={`sprite ${
    //           animatedPokemonId === defaultPokemon.id ? "sprite-animate" : ""
    //         }`}
    //         onClick={() => handleImageClick(defaultPokemon.id, soundUrl)}
    //       >
    //         <img
    //           className={defaultPokemon.sprites.front_default ? "" : "sprite-img"}
    //           src={
    //             defaultPokemon.sprites.front_default
    //               ? defaultPokemon.sprites.front_default
    //               : "/Pokemon_image_not_found.png"
    //           }
    //           alt={defaultPokemon.name}
    //         />
    //       </div>
    //       <p>
    //         Height: {filteredHeight} {unitHeight}
    //       </p>
    //       <p>
    //         Weight: {filteredWeight} {unitWeight}
    //       </p>
    //       <div>
    //         <p>Types:</p>
    //         <div
    //           className={`row justify-content-center gap-2 ${
    //             defaultPokemon.types.length > 1 ? "row-cols-3" : "row-cols-2"
    //           }`}
    //         >
    //           {defaultPokemon.types.map((type) => (
    //             <span
    //               className={`col p-1 t-type ${getTypeClass(type.type.name)}`}
    //               key={type.type.name}
    //             >
    //               {type.type.name}
    //             </span>
    //           ))}
    //         </div>
    //       </div>
    //       <div className="mt-3">
    //         <p>Abilities:</p>
    //         <div className="d-flex flex-column justify-content-center">
    //           {defaultPokemon.abilities.map((ability) => (
    //             <div className="pb-2" key={ability.ability.name}>
    //               <span className="fw-bold">
    //                 {ability.is_hidden ? "Hidden" : "Regular"}:
    //               </span>{" "}
    //               {formatAbilityName(ability.ability.name)}
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     </div>
    //     <div className="d-flex flex-column description mx-auto mt-5 mt-lg-0">
    //       <h3 className="">Characteristics</h3>
    //       {speciesCharacteristic}
    //       <h3 className="mt-4">Evolutions</h3>
    //       <div className="row justify-content-center gap-2 row-cols-1">
    //         {evolutions.map((evolution) => (
    //           <button
    //             key={evolution.name}
    //             className={`col btn btn-link text-light ${
    //               evolution.name == defaultPokemon.name ? "d-none" : ""
    //             }`}
    //             onClick={() => handleSearch(evolution.name)}
    //           >
    //             {evolution.name}
    //           </button>
    //         ))}
    //       </div>
    //       <div className="d-flex flex-row mt-5 mt-lg-auto">
    //         <div className="me-5 me-lg-3 me-xl-5">
    //           Previous Pokemon
    //           <button
    //             className={`btn btn-link  ${
    //               defaultPokemon.id - 1 < 1 ? "d-none" : ""
    //             }`}
    //             onClick={() => handleSearch(defaultPokemon.id - 1)}
    //           >
    //             {defaultPokemon.id - 1}
    //           </button>
    //         </div>

    //         <div className="ms-5 ms-lg-3 ms-xl-5">
    //           Next Pokemon
    //           <button
    //             className={`btn btn-link  ${
    //               defaultPokemon.id + 1 > lastPokemonNumber ? "d-none" : ""
    //             }`}
    //             onClick={() => handleSearch(defaultPokemon.id + 1)}
    //           >
    //             {defaultPokemon.id + 1}
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
  }
};

export default PokemonDetail;
