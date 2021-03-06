function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key.replace(/longitude/gi,'long').replace(/latitude/gi,'lat')] = value;
  });
  return vars;
}

var getNames = new Promise(function (resolve, reject) {
	var urlVars = getUrlVars()
	console.log(urlVars)

	var guestReq = new XMLHttpRequest()
	//guestReq.open('GET','https://content.dropboxapi.com/s/01ql8geudqbe847/guest_list.csv')
	guestReq.open('GET','https://content.dropboxapi.com/s/x06kfyrs7r32fzo/zola_guest_list_template.csv')

	guestReq.onloadend = function () {
	  var resArr = CSVToArray(guestReq.response,',')
	  //console.log('resArr',resArr)
	  var thisLine = resArr.find(function (item) {
		return item[0].toLowerCase().match(urlVars.guest.toLowerCase())
	  })
	  
	  if (thisLine == null) {
		  return reject('womp')
	  } else {
	  
	  var nameString = thisLine[1]
	  
	  var guestNames = {
		primary: thisLine[1],//.slice(3, 6).join(' '),
		secondary: null,//.slice(6, 10).join(' '),
	  }
	  
	  if (thisLine[2].match(/NO\s+GUEST/ig)) {
		  console.log('no guest')
	  } else {
		  if (thisLine[2].trim().length > 0) {
			guestNames.secondary = thisLine[2]
			nameString += '\n&\n' + thisLine[2]
		  }
		  else if (thisLine[11].match(/Y/i)) {
			guestNames.secondary = 'Guest'
			nameString += '\n&\nGuest'
		  } else {
			guestNames.secondary = null
		  }
	  }
	  
	  return resolve(nameString)
	  }
	}

	guestReq.onerror = function () {
	  console.error('error',guestReq.error)
	  reject(guestReq.error)
	}

	guestReq.send()
})






function getViewport() {
	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		x = window.innerWidth || e.clientWidth || g.clientWidth,
		y = window.innerHeight|| e.clientHeight|| g.clientHeight;
		
	var viewport = {
		height:  w.innerHeight|| e.clientHeight|| g.clientHeight,
		width: w.innerWidth || e.clientWidth || g.clientWidth
	}
	
	//console.log('viewport',viewport)
	return viewport
}

var viewport = getViewport()
//console.log('viewport',viewport)
//alert(JSON.stringify(viewport))
document.getElementById('thisMess').innerHTML = 'viewport: ' + JSON.stringify(viewport)


if (viewport.height > viewport.width) {
	var aspect = 't'
} else {
	var aspect = 'w'
}

var stageHeight = viewport.height * 0.95
var stageWidth = viewport.width * 0.95

const app = new PIXI.Application({
	height: stageHeight,
	width: stageWidth,
	//width: 750,//1500, 
	//height: 750,
	//width: window.innerWidth * 0.9,
	//height: window.innerHeight * 0.9,
	//backgroundColor: 0xa55e06, //orange
	backgroundColor: 0x000000, //black
	//backgroundColor: 0xFFFFFF, //black
	transparent: true,
	resolution: 1//window.devicePixelRatio|| 1,
});
document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;
//loader.add('insideURL','./img/Inside.jpg')
loader.add('insideURL','./img/InsideBlank.jpg')
loader.add('envBack','./img/envBack.jpg')
loader.add('envFront','./img/envFront.jpg');
loader.add('cardBack','./img/cardBack.jpg');
loader.add('cursor','./img/cursor.png');

const envContainer = new PIXI.Container();
envContainer.alpha = 0.025;
const cardBackContainer = new PIXI.Container();
cardBackContainer.alpha = 0

const cTopCont = new PIXI.Container();
const cBotCont = new PIXI.Container();


getNames.catch(function (error) {
	const errContainer = new PIXI.Container();
	app.stage.addChild(errContainer);
	
	//errContainer.anchor.set(0.5)
	//errContainer.x = app.screen.width / 2;
	//errContainer.y = app.screen.height / 2;
	
	const errorMessage = new PIXI.Text('You have yet to\nunlock this side quest',{fontFamily : 'morris_romanbold', fontSize: paperSize.width/10, fill : 0xb20000, align : 'center'});
	
	errorMessage.anchor.set(0.5)
	errorMessage.y = app.screen.height / 2;
	errorMessage.x = app.screen.width / 2;
	
	console.log('error',errorMessage)
	errContainer.addChild(errorMessage)
})


function makeCursor (loader, resources) {
	//console.log('makeCursor')
	const thisCursor = new PIXI.Sprite(resources.cursor.texture);
	thisCursor.interactive = true;
	thisCursor.cursor = 'default'
	
	app.stage.defaultCursor =  'crosshair'//"url(./img/cursor.png) 3 2, auto";

}

if (stageWidth * 0.85 * 384/500 > stageHeight * 0.85) {
	var envelopeSize = {
		height: stageHeight  * 0.75,
		width: stageHeight * 0.75 * 500/384
	}
} else {
	var envelopeSize = {
		height: stageWidth * 0.85 * 384/500,
		width: stageWidth * 0.85
	}
}

if (envelopeSize.height * 2 >= stageHeight ) {
	var paperSize = {
		height: stageHeight / 2 ,
		width: stageHeight / 2  * 500/384
	}
} else {
	var paperSize = {
		height: stageWidth * 0.85 * 384/500,
		width: stageWidth * 0.85
	}
}

var envelopeSides
function makeEnvelope(loader, resources) {
	app.stage.addChild(envContainer);
	var backTex = resources.envBack.texture
	var frontTex = resources.envFront.texture
	
	const backSprite = new PIXI.Sprite(backTex)
	backSprite.height = envelopeSize.height
	backSprite.width = envelopeSize.width
	envContainer.addChild(backSprite)
	
	const frontSprite = new PIXI.Sprite(frontTex)
	frontSprite.height = envelopeSize.height
	frontSprite.width = envelopeSize.width
	
	envContainer.pivot.x = envContainer.width / 2
	envContainer.pivot.y = envContainer.height / 2;
	envContainer.x = app.screen.width / 2;
	envContainer.y = app.screen.height / 2;
	
	envelopeSides = {front: frontSprite, back: backSprite}
}

function addCard(loader, resources) {
	app.stage.addChild(cTopCont);
	app.stage.addChild(cBotCont);
	app.stage.addChild(cardBackContainer);

	var iURL = resources.insideURL.texture
	const topTex = iURL.clone()
	topTex.frame = new PIXI.Rectangle(0, 0, iURL.width, iURL.height/2)
	const botTex = iURL.clone()
	botTex.frame = new PIXI.Rectangle(0, iURL.height/2, iURL.width, iURL.height/2)
	
	const topSprite = new PIXI.Sprite(topTex)
	topSprite.height = 1
	topSprite.width = paperSize.width
	
	const botSprite = new PIXI.Sprite(botTex)
	botSprite.height = paperSize.height
	botSprite.width = paperSize.width


	const url = new PIXI.Text('www.zola.com/wedding/juanandjosh',{fontFamily : 'morris_romanbold', fontSize: paperSize.width/20, fill : 0x005df4, align : 'center'});
	
	url.interactive = true
	url.on('pointertap',zolaLink)

	cBotCont.addChild(botSprite)
	cBotCont.addChild(url)
	
	url.anchor.set(0.5)
	url.y = botSprite.y + paperSize.height * 3/7
	url.x = paperSize.width / 2
	
	cTopCont.addChild(topSprite)
	
	cBotCont.x = app.screen.width / 2;
	cBotCont.y = app.screen.height / 2;

	cTopCont.x = app.screen.width / 2;
	cTopCont.y = app.screen.height / 2;

	// Center invitation sprite in local container coordinates
	cBotCont.pivot.x = cBotCont.width / 2;
	cBotCont.pivot.y = 0;

	cTopCont.pivot.x = cTopCont.width / 2;
	cTopCont.pivot.y = cTopCont.height;
}


var cardAspect = 500/384

var nameText 
//after loading the images, do stuff:
loader.load(function (loader, resources) {
	console.log('loaderizing')
	makeCursor(loader, resources)
	app.stage.addChild(cardBackContainer);
	makeEnvelope(loader, resources)
	
	
	var cBackTex = resources.cardBack.texture
	
	const cBackSprite = new PIXI.Sprite(cBackTex)
	cBackSprite.height = envelopeSize.height
	cBackSprite.width = envelopeSize.width
	cardBackContainer.addChild(cBackSprite)
	
	
	cardBackContainer.pivot.x = cardBackContainer.width / 2
	cardBackContainer.pivot.y = cardBackContainer.height / 2;
	cardBackContainer.x = app.screen.width / 2;
	cardBackContainer.y = app.screen.height / 2;
		
	
	getNames.then(function (nameString) {
		nameText = new PIXI.Text(nameString,{fontFamily : 'morris_romanbold', fontSize: envelopeSize.width/15, fill : 0xa56c1d, align : 'center'});
		
		nameText.alpha = 0
		
		nameText.x = envelopeSize.width / 2;
		nameText.y = envelopeSize.height / 2;
		nameText.anchor.set(0.5)
		envContainer.addChild(nameText)
	})
	
	delTicker(function () {
		if (envContainer.alpha <= 0.05) {
			envContainer.alpha += 0.0005
		}
	},250)
	
	
	// display the envelope
	Promise.all([getNames, delay(2000)]).then(function () {
		envContainer.interactive = true
		envContainer.on('pointertap',flipEnvelope)
		app.ticker.add(function (delta) {
			if (envContainer.alpha <= 1) {
				envContainer.alpha += 0.005
			}
			if (envContainer.alpha >= 0.5 && nameText.alpha < 0.75) {
				nameText.alpha += 0.01
			}
		})
	})
	
	var flipped = false
	function flipEnvelope() {
		console.log('flipEnvelope')
		//envContainer.on('pointertap',openEnvelope)
		envContainer.on('pointertap',dropEnvelope)
		//envContainer.interactive = false;
		delTicker(function () {
			if (envContainer.width >= 5 && !flipped) {
				envContainer.width = envContainer.width * 2/3
			} else if (envContainer.width < 5 && !flipped) {
				envContainer.removeChild(envelopeSides.back)
				envContainer.removeChild(nameText)
				envContainer.addChild(envelopeSides.front)
				flipped = true
				envContainer.width = 6
			} else if (flipped && envContainer.width < envelopeSize.width) {
				envContainer.width += envelopeSize.width / 10
			}
		})
		//delay(1000).then(dropEnvelope)
	}
	
	var dropped = false
	function dropEnvelope() {
		console.log('dropEnvelope')
		if (!dropped) {
			dropped = true
			cardBackContainer.alpha = 1
			delTicker(function () {
				if (envContainer.y < 4 * app.screen.height) {
					envContainer.y += 5
				} 
				if (envContainer.y <  2 * app.screen.height) {
					envContainer.alpha -= 0.025
				}
			})
			delay(1000).then(scaleCard)
		}
	}

	var scaled = false
	function scaleCard() {
		console.log('scaleCard')
		delTicker(function flerg () {
			if (cardBackContainer.width > paperSize.width && !scaled) {
				cardBackContainer.width -= paperSize.width / 50
				cardBackContainer.height = cardBackContainer.width * 384/500
			}
			if (!scaled && (cardBackContainer.width < paperSize.width || cardBackContainer.height < paperSize.height)) {
				cardBackContainer.width = paperSize.width
				cardBackContainer.height = cardBackContainer.width * 384/500
				scaled = true
			}
			if (cardBackContainer.pivot.y > 0) {
				cardBackContainer.pivot.y -= paperSize.height / 45
			} else if (cardBackContainer.pivot.y  < 0) {
				cardBackContainer.pivot.y = 0
			}
		})
		delay(1500).then(openCard)
	}
	
	var opened = false
	function openCard() {
		console.log('openCard')
		cTopCont.alpha = 0
		addCard(loader, resources)
		
		//cardBackContainer.y -= 2
		//cardBackContainer.y = stageHeight / 2
		//cTopCont.height -= 5
		//cardBackContainer.width = paperSize.width
		//cardBackContainer.height = paperSize.height
		
		
		delTicker(function() {
			if (!opened && cardBackContainer.height > 0) {
				cardBackContainer.height -= paperSize.height/30
			} else if (cardBackContainer.height <= 0) {
				opened = true
				cardBackContainer.alpha = 0
			}
			if (opened && cTopCont.height < paperSize.height) {
				cTopCont.alpha = 1
				cTopCont.height += paperSize.height/30
			}
			if (opened && cTopCont.height > paperSize.height) {
				cTopCont.height = paperSize.height
			}
		})
		
		//cBotCont.interactive = true;
	}
	
	
	
})

function zolaLink() {
	window.open('http://zola.com/wedding/juanandjosh', '_blank')
}

function delTicker(func, t) {
	delay(t).then(function() {
		app.ticker.add(function (delta) {
			func()
		})
	})
}

function delay(t, v) {
   return new Promise(function(resolve) { 
       setTimeout(resolve.bind(null, v), t)
   });
}

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