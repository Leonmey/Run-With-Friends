/* Run With Friends
*  Team - Leon Meyer, Michael, Karina
*  Developed for Western Hackathon 2
*  Runs on CloudPebble or Pebble smartwatch
*/

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');
//========== V A R I A B L E S ==========//
var speed = 0;
var friend_speed = 0;
var distance =0;
var friend_distance=0;
var time = 0;
var running = false;
var easter = 0;
var godmode = 0;
var leg;

//========== F U N C T I O N S ==========//
function updateSpeed(new_speed) {
  speed = aiSpeed(speed);
  friend_speed = aiSpeed(friend_speed);
}

 function aiSpeed(speed2){
   var rand = Math.floor(Math.random() * (7)) -1;
   
   easter = Math.floor(Math.random() * (35001)) - 0;
   if(easter === 0){
     godmode = 1;
   }
   else if(easter == 1 || easter == 2)
     {
       leg = 1;
     }
   if(godmode){
     speed2 = speed2*1.8;
   }
   else if(leg)
     {
       speed2 = speed2*0.3 -0.5;
     }
   else if(speed2>15){
     speed2 = speed2 + Math.random() - Math.random()*2;
   }
   else if(speed2 > 10 && time < 3500){
     speed2 = speed2 + Math.random() - Math.random();
   }
   else if( time > 3500){
     speed2 = speed2*0.95;
   }
   else{
     if(rand < 0){
       speed2 = speed2 - speed*0.2 + -0.2; 
     }
     else if(rand > 0){ 
       speed2 = speed2 + speed*0.22 + 0.5;
     }
     else{
       speed2 = speed2 + 0.5;
     }
     if(speed2 <0)
       speed2 = 0.8;
    }
   return speed2;
 }

function updateDistance(speed, time, friend) {
  var mps = speed / 3.6;
  if (friend) {
    friend_distance += mps;
  } else {
    distance += mps;
  }
}

//=========== S T O P W A T C H   C L A S S ==========//
var StopWatch = function() {
  this.startTime = 0;
  this.stopTime = 0;
  this.running = false;
};
StopWatch.prototype.start = function () {
  this.startTime = new Date().getTime();
  this.running = true;
};
StopWatch.prototype.stop = function () {
  this.stopTime = new Date().getTime();
  this.running = false;
};
StopWatch.prototype.getElapsedMilliseconds = function () {
  if (this.running) {
    this.stopTime = new Date().getTime();
  }
  return this.stopTime - this.startTime;
};
StopWatch.prototype.getElapsedSeconds = function () {
  return this.getElapsedMilliseconds() / 1000;
};
//========== S P L A S H   S C R E E N ==========//
// Create splash screen
var splashWindow = new UI.Window();
var logo_image = new UI.Image({
  position: new Vector2(0,0),
  size: new Vector2(144,144),
  backgroundColor: 'black',
  image: 'images/runblack.png',
});
// Text element to populate splash screen
var text = new UI.Text({
  position: new Vector2(0, 10),
  size: new Vector2(144, 168),
  text:'RunTogether',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'clear',
});
// Add to splashWindow and show
splashWindow.add(logo_image);
splashWindow.add(text);
splashWindow.show();
//========== M E N U ==========//
// Create the app menu items
var appMenuItems = [
  {
    title:"Solo Run",
    subtitle: "Run vs. Yourself"
  },
  {
    title: "Group Run",
    subtitle: "Run vs. Friends"
  },
  {
    title: "App Info",
    subtitle: "Instructions"
  }
];
// Create the app menu
var appMenu = new UI.Menu({
  sections: [{
    title: 'Select Workout',
    items: appMenuItems
  }]
});
// Hide the splash screen and show the app menu
setTimeout(function(){
  splashWindow.hide();
  appMenu.show();
}, 1000);
// Interact with the menu
appMenu.on('select', function(event) {
  
  var optionTitle = appMenuItems[event.itemIndex].title;
  var optionBody = "";
  
  if (optionTitle == "Solo Run") {
    optionBody = speed.toFixed(0) + " km/h\n"+ distance.toFixed(1) + " m \n" + time + " s ";
  } else if (optionTitle == "Group Run") {
    if (distance > friend_distance){optionBody = "You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m \nWINNING";}  
    else if (friend_distance > distance){optionBody = "You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m \nLOSING";}    
    else if (friend_distance == distance){optionBody = "You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m \nTIE";}  
  } else if (optionTitle == "App Info") {
    optionBody = "RunTogether® is a crappy app designed to let you run against yourself or against friends in different locations.";
  }
  
  var optionCard = new UI.Card({
    title:optionTitle,
    body:optionBody,
  });
  
  optionCard.show();
  
  // Handle the running portions
  if (optionTitle == "Solo Run" || optionTitle == "Group Run") {
    // Create the stopwatch and show the card
    var stopwatch = new StopWatch();
    
    optionCard.on('longClick', 'select', function() {
      Vibe.vibrate('short');
      if (running) {
        stopwatch.stop();
        running = false;
        if (optionTitle == "Group Run") {
          if (distance > friend_distance) {
            optionCard.body("You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m");
            optionCard.subtitle("YOU WIN!");
          } else if (distance < friend_distance) {
            optionCard.body("You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m");
            optionCard.subtitle("YOU LOSE!");
          } else {
            optionCard.body("You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m");
            optionCard.subtitle("YOU TIED!");
          }
        } else if (optionTitle == "Solo Run") {
          optionCard.subtitle("Run Complete!");
          optionCard.body(speed.toFixed(2) + " km/h\n" +distance.toFixed(2)+" m \n" + time + " s");
        }
        speed = 0;
        time = 0;
        distance = 0;
        friend_speed = 0;
        friend_distance = 0;
        leg = 0;
        godmode = 0;
      } 
      else if (!running) { 
        if (optionCard.title == "Solo Run") {
          optionCard.body("Speed: 0 km/h\nDistance: 0:00 m\nTime: 0 s");
        } else if (optionCard.title == "Group Run") {
          optionCard.body("You:\n 0:00 km/h, 0.00m\nThem:\n 0:00 km/h, 0.00m");
        }
        stopwatch.start();
        running = true;
        optionCard.subtitle("");
      }
    });
       
    setInterval(function() {
      if (godmode == 1 || leg == 1) {
        Vibe.vibrate('long');
      }
      // Update the visuals on the card
      if (running === true) {
      
        // Update the speed, distance, time
        updateSpeed(speed + 0.1);
        updateDistance(speed, 1, false);
        updateDistance(friend_speed, 1, true);
        time = stopwatch.getElapsedSeconds().toFixed(0);
        
        if (optionTitle == "Solo Run") {
          optionCard.body(speed.toFixed(2) + " km/h\n"+distance.toFixed(2)+"m \n" + time +  " s "); 
        } else if (optionTitle == "Group Run") {
          if (distance > friend_distance){optionBody = "You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m \nWINNING";}  
          else if (friend_distance > distance){optionBody = "You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m \nLOSING";}
          else if (friend_distance == distance){optionBody = "You:\n " + speed.toFixed(2) + " km/h, " +distance.toFixed(1)+" m\nThem:\n " + friend_speed.toFixed(2) + " km/h, "+friend_distance.toFixed(2)+" m \nTIE";}
          optionCard.body(optionBody);
        }
      }
    }, 1000);  
  }
  
  else if (optionTitle == "App Info") {
    optionCard.on('click', 'down', function() {
      var instructions = new UI.Card({
        title:"Instructions",
        body:"To begin or end a run, long press the 'select' button. Compete for the best time!",
      });
      instructions.show();
      instructions.on('click', 'up', function(){
        optionCard.show();
      });
      instructions.on('click', 'back', function() {
        appMenu.show();
        instructions.hide();
      });
      instructions.on('longClick', 'select', function() {
        var troll = new UI.Card({
          title:"",
          subtitle:"",
        });
        troll.show();
        setTimeout(function(){
          troll.hide();
          instructions.show();
        }, 1000);        
      });
    });
  }
});
