const formatName = (text) => {
    return text.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  export default formatName;
