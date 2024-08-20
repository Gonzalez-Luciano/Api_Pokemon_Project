
async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
  

  function getSuspender(promise) {
    let status = "pending";
    let response;
  
    const suspender = promise.then(
      (res) => {
        status = "success";
        response = res;
      },
      (err) => {
        status = "error";
        response = err;
      }
    );
  
    const read = () => {
      switch (status) {
        case "pending":
          throw suspender;
        case "error":
          throw response;
        default:
          return response;
      }
    };
  
    return { read };
  }
  
  //fetchDataArray Proxima Funcion


  async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
  
   
    const detailedPokemonPromises = data.results.map((pokemon) =>
      fetchPokemonDetails(pokemon.url)
    );
  

    const detailedPokemons = await Promise.all(detailedPokemonPromises);
  
    return detailedPokemons;
  }
  
  export { fetchData, getSuspender, fetchPokemonDetails};
  