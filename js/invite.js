function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key.replace(/longitude/gi,'long').replace(/latitude/gi,'lat')] = value;
  });
  return vars;
}
var urlVars = getUrlVars()
console.log(urlVars)

var guestReq = new XMLHttpRequest()
//guestReq.open('GET','https://content.dropboxapi.com/s/01ql8geudqbe847/guest_list.csv')
guestReq.open('POST','https://content.dropboxapi.com/s/x06kfyrs7r32fzo/zola_guest_list_template.csv')

guestReq.onloadend = function () {
  var resArr = CSVToArray(guestReq.response,',')
  console.log('resArr',resArr)
  var thisLine = resArr.find(function (item) {
    return item[0].match(urlVars.guest)
  })
  
  var guestNames = {
    primary: thisLine.slice(3, 6).join(' '),
    secondary: thisLine.slice(6, 9).join(' '),
    plusOne: thisLine[9]
  }
  
  console.log('guestNames',guestNames)
}

guestReq.onerror = function (err) {
  console.error('error',err)
}

guestReq.send()

const app = new PIXI.Application({
  width: 750,//1500, 
  height: 750,
  //width: window.innerWidth * 0.9,
  //height: window.innerHeight * 0.9,
  backgroundColor: 0x1099bb, resolution: window.devicePixelRatio|| 1,
});

document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;
loader.add('insideURL','./img/Inside.jpg')
//loader.add('insideURL','https://i.imgur.com/lKZIHQY.jpg')
//loader.add('envBack','./invitation/envBack.jpg')
//loader.add('envFront','./invitation/envFront.jpg');
//loader.add('cardBack','./invitation/cardBack.jpg');

const envContainer = new PIXI.Container();
const cardBackContainer = new PIXI.Container();

const cTopCont = new PIXI.Container();
app.stage.addChild(cTopCont);
const cBotCont = new PIXI.Container();
app.stage.addChild(cBotCont);

app.stage.addChild(envContainer);
app.stage.addChild(cardBackContainer);

//after loading the images, do stuff:
loader.load(function (loader, resources) {
  var iURL = resources.insideURL.texture
  
  const topTex = iURL.clone()
  topTex.frame = new PIXI.Rectangle(0, 0, iURL.width, iURL.height/2)
  const botTex = iURL.clone()
  botTex.frame = new PIXI.Rectangle(0, iURL.height/2, iURL.width, iURL.height/2)
  
  
  //const inside = new PIXI.Sprite(resources.insideURL.texture)
  const topSprite = new PIXI.Sprite(topTex)
  topSprite.height = 1
  topSprite.width = 500
  //inside.anchor.set(0.5)
  const botSprite = new PIXI.Sprite(botTex)
  botSprite.height = 384
  botSprite.width = 500
  
  cBotCont.addChild(botSprite)
  cTopCont.addChild(topSprite)
  
  
  //envContainer.addChild(inside)

  // Move container to the center
  cBotCont.x = app.screen.width / 2;
  cBotCont.y = app.screen.height / 2;
  
  cTopCont.x = app.screen.width / 2;
  cTopCont.y = app.screen.height / 2;

  // Center invitation sprite in local container coordinates
  cBotCont.pivot.x = cBotCont.width / 2;
  cBotCont.pivot.y = 0;
  
  cTopCont.pivot.x = cTopCont.width / 2;
  cTopCont.pivot.y = cTopCont.height;
  
console.log('hh',cTopCont.height)
  //envContainer.addChild(croppedTexture)

  // Listen for animate update
  app.ticker.add((delta) => {
    if (cTopCont.height < 384) {
      cTopCont.height += 2
      //envContainer.y -= 0.5
    }
    // rotate the container!
    // use delta to create frame-independent transform
    //envContainer.rotation -= 0.001 * delta;
  });
})


function CSVToArray( strData, strDelimiter ){
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ",");

		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp(
			(
				// Delimiters.
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

				// Standard fields.
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
			);

		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];

		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;


		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec( strData )){

			// Get the delimiter that was found.
			var strMatchedDelimiter = arrMatches[ 1 ];

			// Check to see if the given delimiter has a length
			// (is not the start of string) and if it matches
			// field delimiter. If id does not, then we know
			// that this delimiter is a row delimiter.
			if (
				strMatchedDelimiter.length &&
				(strMatchedDelimiter != strDelimiter)
				){

				// Since we have reached a new row of data,
				// add an empty row to our data array.
				arrData.push( [] );

			}


			// Now that we have our delimiter out of the way,
			// let's check to see which kind of value we
			// captured (quoted or unquoted).
			if (arrMatches[ 2 ]){

				// We found a quoted value. When we capture
				// this value, unescape any double quotes.
				var strMatchedValue = arrMatches[ 2 ].replace(
					new RegExp( "\"\"", "g" ),
					"\""
					);

			} else {

				// We found a non-quoted value.
				var strMatchedValue = arrMatches[ 3 ];

			}

			// Now that we have our value string, let's add
			// it to the data array.
			arrData[ arrData.length - 1 ].push( strMatchedValue );
		}

		// Return the parsed data.
		return( arrData );
	}