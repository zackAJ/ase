import validator from "validator";

let keyword = `wwe belt champion 'zack' "jibrish"`;
keyword = encodeURIComponent(keyword);
keyword = sanitize(keyword);


  
  
  
  
  
  function sanitize(word) {
    let input = decodeURIComponent(word);
    input = encodeURIComponent(input);
    input = input.trim().replaceAll("%20", "+").replaceAll("'", "%27");
    
	return input;
};

// console.log(keyword);

//wwe+belt%2C+%27zack%27+champion+"of+the+world"