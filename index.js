const winkNLP = require( 'wink-nlp' );
const model = require( 'wink-eng-lite-web-model' );
const nlp = winkNLP( model )
const Sugar = require('sugar');
const chrono = require('chrono-node')
// Acquire "its" and "as" helpers from nlp.
const its = nlp.its;
const as = nlp.as;

const text1 = `Create a work order for Richard Mathew at dec 13 22:12hrs to dec 14 09:00hrs `;
const text2 = `Create a work order for Richard Mathew at dec 13 11 AM to dec 14 8 AM `;
const text3 = `Create a job for Richard Peters this friday`;
const text4 = `Create a job for Richard next thursday`;
const text5 = `add a job to Richard Mathew tomorrow`;
const text6 = 'Sushil Sreekumar needs a quote on thursday evening 5pm'
const text7 = 'Add an invoice to Sushil Sreekumar after 3 month';
const text8 = 'Richard mathew needs a work order to be done by today 2pm'

const patterns = [
  { name: 'action', patterns: ['VERB']},
  { name: 'name', patterns: [ 'PROPN PROPN' ] },
  { name: 'connectors', patterns: ['ADP'] },
  { name: 'module', patterns: ['NOUN']}
];

const originalSentence = text7
const allCapitalSentence = originalSentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

nlp.learnCustomEntities(patterns);
const doc = nlp.readDoc( originalSentence );
const doc2 = nlp.readDoc( allCapitalSentence )

doc.entities().each((e) => e.markup());
const originalResults = doc.entities().out( its.detail )
console.log( originalResults );


//Filter dates
/**
 * Note: Sugar and Chrono used to test which is best in nlp.
 * 
 * Observation: 
 * Sugar works well for dates parsing
 * Chrono works well for time parsing
 */
for(let i = 0; i < originalResults.length; i++){
  //Implemented using Sugar

  if(originalResults[i]['type'] === 'DURATION'){
    console.log("Date/Time: ", Sugar.Date.create(originalResults[i]['value'].split(" ").join('')+' from now'));
  }else{
    console.log("Date/Time: ", Sugar.Date.create(originalResults[i]['value'].split(" ").join('')));
  }

  //Implemented using Chrono
  // console.log("Date/Time", chrono.parseDate(originalResults[i]['value']));
}


const customResults = {
  'lowercase': doc.customEntities().out(its.detail),
  'uppercase': doc2.customEntities().out(its.detail)
}

//Filter Customer Name
if(customResults?.uppercase?.length){

  const customerNameArray = customResults.uppercase?.filter( ele => ele.type === 'name' )
  customerNameArray.forEach((element, index) => {
    const word1 = element.value.split(' ')[0].toUpperCase()
    customResults.lowercase.forEach(word => {
      if((word1 === word.value.toUpperCase()) && word.type === 'module'){
        customerNameArray.splice(index,1)
      }
    })
  });
  const customerName = (customerNameArray?.length > 0) ? customerNameArray[0] : ''
  console.log("Customer Name: ", customerName);
}

//Filter Action
if(customResults?.uppercase?.length){

  const actionArray = customResults.uppercase?.filter( ele => ele.type === 'action' )
  
  const actionName = (actionArray?.length > 0) ? actionArray[0] : ''
  console.log("Action : ", actionName);
}

/**
 * Idea for filter modules
 * ------------------------------------------------------------------------------
 * For filtering modules we can maintain a master collection of each available modules and all possible synonyms of each module 
 * 
 */


document.getElementById("result").innerHTML = doc.out(its.markedUpText);
