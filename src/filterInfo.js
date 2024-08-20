function filterWeight(weight) {
  let filteredWeight;
  let unitWeight;
  filteredWeight = weight / 10;
  unitWeight = "kg";

  return { filteredWeight, unitWeight };
}

function filterHeight(height) {
    let filteredHeight;
    let unitHeight;
    if(height >= 10){
        filteredHeight = height / 10;
        unitHeight = "m";
    }
    else{
        filteredHeight = height * 10;
        unitHeight = "cm";
    }
  
    return { filteredHeight, unitHeight };
  }

export { filterWeight, filterHeight};
