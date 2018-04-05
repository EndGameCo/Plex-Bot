const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
const otherplexdata = require('./buildingdata.json'); 
const fs = require('fs');
const https = require('https');
const apiboard = 'https://pixelplexgame.com/api/leaderboards';
const circlejson = require('circular-json');
const cheerio = require('cheerio');
const $ = cheerio.load('https://pixelplexgame.com/api/leaderboards');


client.on('ready', () => {
  console.log('I am ready!');
  client.user.setActivity('type "plex help" for help | pixelplexgame.com | on ' + client.guilds.size + ' servers');
  client.user.setUsername('Plex Bot', function(error){
      throw error;
  })
});

client.on('message', message => {
  if (!message.content.startsWith(config.prefixplex)) return;
  const args = message.content.slice(config.prefixplex.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "help"){
      message.channel.send("`plex help` shows commands \n" +
     "`plex top` shows information about using the leaderboard");
  }
  if (command === "top"){
      //thing = $('body').contents();
      //console.log(thing);
      //message.channel.send(thing)
      //fs.writeFile('pixelleaderboard.json', thing, function (err) {
	  //  if (err) return console.log(err);
	  //});
	  
	  
	  
      const leaderboard = require('./pixelleaderboard.json');
      if (args.length <= 0){
          message.channel.send(
          "arguments: \n" +
          "argument 1: player | players | city |cities, asks whether or not you want to see a top city or player, plural versions are for the entire leaderboard \n" +
          "argument 2: if you used the singular form of the words above, the place of the top 15 people/cities on the leaderboard, if left blank, will display the top player/city"
          );
      }else if (args[0] === "city"){
        //if (args[2] === undefined || args[2] === NaN){
        //    message.channel.send("you need to define a place in the leaderboard");
        //}
        

        place = (parseInt(args[1]) - 1);
        
        if(place === undefined){
            place = 0;
        }
        
        if (place >= leaderboard.topCities.length - 1){
            message.channel.send("this city is not on the leaderboard currently");
            return;
        }
        
        message.channel.send(
        "name: " + leaderboard.topCities[place].Name + "\n" +
        "score: " + leaderboard.topCities[place].Score + "\n" +
        "completed projects:" + parseprojects(leaderboard.topCities[place].Projects)
        );
              
            
      }else if (args[0] === "player"){
          place = (parseInt(args[1]) - 1);
        
        if(place === undefined){
            place = 0;
        }
        
        if (place >= leaderboard.topCities.length - 1){
            message.channel.send("this player is not on the leaderboard currently");
            return;
        }
          
          message.channel.send(
          "username: " + leaderboard.topResidents[place].Username + "\n" +
          "score: " + leaderboard.topResidents[place].Score
          );
      }else if (args[0] === "cities"){
          
          message.channel.send(getTopCities(leaderboard.topCities));
      }else if (args[0] === "players"){
          message.channel.send(getTopPlayers(leaderboard.topResidents))
      }
  }else if (command === "info"){
              if (args[0] === "building"){
                  tofind = args.slice(2).join(" ");
                	message.channel.send(findBuilding(tofind));
              }
      }
});

function parseprojects(projects){
    out = [];
    for (i = 0; i < projects.length; i++){
        if (projects[i] === 0){
            out.push(" Airport");
        }else if(projects[i] === 1){
            out.push(" Stadium");
        }else if(projects[i] === 2){
            out.push(" Mall");
        }else if(projects[i] === 3){
            out.push(" University");
        }else if(projects[i] === 4){
            out.push(" Power Grid");
        }else if(projects[i] === 5){
            out.push(" Space Port");
        }else if(projects[i] === 6){
            out.push(" City Hall");
        }
    }
    return (out)
}
function getTopCities(topCities){
    tosend = {embed:{
    color: 3447003,
    author: {
      name: "Cities",
      icon_url: client.user.avatarURL
    },
    title: "City Leaderboard",
    fields: [
    	
    ] 
    }
    };
    cityLength = topCities.length;
    for (var i = 0; i < cityLength; i++){
        tosend.embed.fields.push({
        	name: "name: " + topCities[i].Name + ", place: **" + (i + 1) + "**",
        	value: "projects:" + parseprojects(topCities[i].Projects)
        })
        
    }
    return(tosend);
}
function getTopPlayers(topPlayers){
    tosend = {embed:{
    	color: 3447003,
    	author: {
    		name: "Players",
    		icon_url: client.user.avatarURL
    	},
    	title: "Player Leaderboard",
    	fields: [] 
    }};
    playerLength = topPlayers.length;
    for (var x = 0; x < playerLength; x++){
        tosend.fields.push({
        	name: "place: **" + (x + 1) + "**",
        	value: "name: " + topPlayers[x].Username + "\n" +
        "score: " + topPlayers[x].Score + "\n" +
        "number of blocks owned: " + topPlayers[x].Blocks.length + "\n"
        })
    }
    return(tosend);
}
function findBuilding(searchfor){
    var out = [];
    var yes = otherplexdata.basedata.BuildingTypes.length;
    var bTypes = otherplexdata.basedata.BuildingTypes;
    for (var u = 0; u < yes; u++){
    	console.log("mum gay")
        if(otherplexdata.basedata.BuildingTypes[u].Name.toLowerCase() === searchfor.toLowerCase()){
        	console.log("no")
            out.push("Name: " + otherplexdata.basedata.BuildingTypes[u].Name);
            out.push("Description: " + otherplexdata.basedata.BuildingTypes[u].Description);
            out.push("Costs:");
            var ye = otherplexdata.basedata.BuildingTypes[u].BuildCosts.length;
            for (var l = 0; l < ye; l++){
            	console.log("u")
                out.push("Level " + (l + 1));
                out.push("Money: " + otherplexdata.basedata.BuildingTypes[u].BuildCosts[l].Money);
                out.push("Wood: " + otherplexdata.basedata.BuildingTypes[u].BuildCosts[l].Wood);
                out.push("Cement: " + otherplexdata.basedata.BuildingTypes[u].BuildCosts[l].Cement);
                out.push("Steel: " + otherplexdata.basedata.BuildingTypes[u].BuildCosts[l].Steel);
                out.push("Time: " + (otherplexdata.basedata.BuildingTypes[u].BuildCosts[l].Seconds / 60)  + " minutes");
                
            }
        }
    }
    console.log("oof")
    return(out);
}
//function formatBuildingInfo(index){
//    out = {embed: {
//        color: 3447003,
//        title: otherplexdata.basedata.BuildingTypes[index].Name,
//        author: {
//          name: otherplexdata.basedata.BuildingTypes[index].Name,
//          icon_url: client.user.avatarURL
//        },
//        description: otherplexdata.basedata.BuildingTypes[index].Description
//        fields: []
//       }};
//    for (var e = 0; e < otherplexdata.basedata.BuildingTypes[index].BuildCosts.length){
//        out.embed.fields.push(
//            {
//                name: "Level",
//                value: (e + 1) 
//            },
//            {
//                name: "Money",
//                value: otherplexdata.basedata.BuildingTypes[index].BuildCosts[e].Money
//            },
//            {
//                name: "Wood",
//                value: otherplexdata.basedata.BuildingTypes[index].BuildCosts[e].Wood
//            },
//            {
//                name: "Cement",
//                value: otherplexdata.basedata.BuildingTypes[index].BuildCosts[e].Cement
//            },
//            {
//                name: "Steel",
//                value: otherplexdata.basedata.BuildingTypes[index].BuildCosts[e].Steel
//            },
//            {
//                name: "Time",
//                value: otherplexdata.basedata.BuildingTypes[index].BuildCosts[e].Seconds + " seconds"
//            }
//        )
//    }
//} 
client.login(config.plextoken);