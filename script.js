//Please notice that I am native German speaker and the comments may not be perfect. Sorry.
// 2014, Stefan Blamberg, No rights reserved

var sources = { //stores file locations for pictures
    blanc: 'src/blanc.png', //empty field
    fire: 'src/fire.png',
    water: 'src/water.png',
    earth: 'src/earth.png',
    wind: 'src/wind.png',
    background: 'src/background.png'    
};

var images = {}; //Array for loaded pictures
var display = {}; //Array that stores what is shown on the fields of the game (0-8)
var possible = false; //Is it possible that two elements can fight against each other
var score = 0; //Stores the current score
var highscore = 0; //Stores the high score (is reseted when refreshing the page)
var lastMove;
var lastMoveTxt = ""; //Which move was done when game over?
var lastElement = ""; //Which element was killed

function start () //beginning of the game, called from index.html file
{  
    document.getElementById("highscore").innerHTML = "Highscore: " + highscore; //update the displayed highscore
    score = 0; //Reset the current score
    imageLoader(); //load the images
}

function move(dir) //react to moving (triggered when user pesses buttons in the index.html file)
{
    switch(dir) //0 = left; 1 = right; 2 = up; 3 = down 
    {
        case 0: //if left
            lastMoveTxt = "left";
            for(var i = 0; i <= 8; i++) //do it for every tile starting with the top left one
            {
                if(i%3!=0 && display[i]!=images.blanc) //if not most left (0, 3, 6) and not empty
                {
                    var win = match(i, i-1); //check for winning conditions (this tile, tile left to the first one)
                    if(possible) //If the elements can fight against each other (set by match())
                    {
                        if(win) //If the attacking element wins
                        {
                            display[i-1] = display[i]; //defending element becomes attacking element
                        }
                        display[i] = images.blanc; //in every case: clear the attacking field
                    }
                }
            }
        break;

        case 1: //if right
            lastMoveTxt = "right";
            for(var i = 8; i >= 0; i--) //do it for every tile starting with the bottom right one in order not to move some tiles twice because of double-checking
            {
                if((i-2)%3!=0 && display[i]!=images.blanc) //If not most right (2, 5, 8) and not empty
                {
                    var win = match(i, i+1); //See case:0 for comments
                    if(possible)
                    {
                        if(win)
                        {
                            display[i+1] = display[i]; //change the tile right to the attacking one
                        }
                        display[i] = images.blanc;
                    }
                }
            }
        break;

        case 2: //up
            lastMoveTxt = "up";
            for(var i = 0; i <= 8; i++) //do it for every tile starting with the top left one
            {
                if(i>2 && display[i]!=images.blanc) //If not most top (0, 1, 2) and not empty
                {
                    var win = match(i, i-3); //See case:0 for comments
                    if(possible)
                    {
                        if(win)
                        {
                            display[i-3] = display[i]; //change the tile in top of the attacking one
                        }
                        display[i] = images.blanc;
                    }
                }
            }
        break;

        case 3: //down
            lastMoveTxt = "down";
            for(var i = 8; i >= 0; i--) //do it for every tile starting with the bottom right one in order not to move some tiles twice because of double-checking
            {
                if(i<6 && display[i]!=images.blanc) //If not most bottom (6, 7, 8) and not empty
                {
                    var win = match(i, i+3); //See case:0 for comments
                    if(possible)
                    {
                        if(win)
                        {
                            display[i+3] = display[i]; //change the tile below the attacking one
                        }
                        display[i] = images.blanc;
                    }
                }
            }
        break;
    }
    if(checkWin()) //If not game over (all elements are still in the game)
    {
        prepare(); //start next round
    }
    else
    {
        setScore(); //gameover
    }
}

function imageLoader () //load the images
{

    var itemsToLoad = 0; //how many images must be loaded?
    var loadedItems = 0; //how many images are already loaded
    
    for(var i in sources) //for every image to load
    {
        itemsToLoad++; //increase number of items to load
    }
    
    for(var i in sources) //for every image
    {
        images[i] = new Image(); //create a new Image object
        images[i].onload = function() { //If the Image is loaded
        if(++loadedItems >= itemsToLoad) { //If all images are now loaded
            for(var j = 1; j <= 8; j+=2) //Set every second tile as blanc
            {
               display[j] = images.blanc;
            }
            display[0] = images.fire; //Set the top left image to fire
            display[2] = images.water; //Set the top right image to water
            display[4] = images.blanc; //Set the middle image as blanc
            display[6] = images.earth; //Set the bottom left image as earth
            display[8] = images.wind; //Set the bottom right image as wind
            prepare(); //Start first round
        }
        };
        images[i].src = sources[i]; //Set the source of the image
    }
}

function prepare () //start a new round
{
    var next = Math.floor(Math.random()*4)+1; //Get a random element 
    var nextImg; //stores the next image to show

    switch(next)
    {
        case 1:
            nextImg = images.fire; //show fire next
        break;
            
        case 2:
            nextImg = images.earth; //show earth next
        break;
            
        case 3:
            nextImg = images.water; //show water next
        break;
            
        case 4:
            nextImg = images.wind; //show wind next
        break;
    }
    var freespace = 0; //how many tiles are still free
    for(var i = 0; i<=8; i++) //check every tile
    {
        if(display[i] == images.blanc) //if the tile is empty
        {
            freespace++; //increase the number of free tiles by one
        }
    }
    if(freespace > 0) //if there are free tiles left in the game
    {
        do
        {
            var nextPos = Math.floor(Math.random()*9); //Get a random position
        }
        while(display[nextPos] != images.blanc) //repeat this until this position is empty
        display[nextPos]=nextImg; //spawn the new element on this position
        updateCanvas(); //Update the content of the canvas
    }
    else //if there is no more free space avaiable
    {
        lastElement = "free space";
        setScore(); //game Over
    }
}

function match(choice1, choice2) //Battle!!! Yeah.
{
    var win = false; //Has the attacking element won the battle?
    
        if(display[choice1]==images.blanc) //if the first tile is empty
        {
            possible = false; //no battle :(
            return;
        }
        else if(display[choice2]==images.blanc) //if the second tile is empty 
        {
            win = true; //win, just move
        }
        else if(display[choice1]==display[choice2]) //If both elements are the same
        {
            possible = false; //no battle again :((
            return;
        }
        
        else if (display[choice1]==images.fire)
        {
            if(display[choice2]==images.earth)// || display[choice2]==images.water)
            {
                win = true; //first element wins
                score += 1; //Player gets a score point
            }
            
            else if(display[choice2]==images.wind)
            {
                win = false; //player looses, no point
            }
            else //Just in case :)
            {
                possible = false; 
                return;
            }
        }
        
        else if (display[choice1]==images.water) //See first battle comments
        {
            if(display[choice2]==images.wind)
            {
                win = true;
                score += 1;
            }

            else if(display[choice2]==images.earth)
            {
                win = false;
            }
            else
            {
                possible = false;
                return;
            }
        }
        
        else if (display[choice1]==images.wind) //See first battle comments
        {
            if(display[choice2]==images.fire)
            {
                win = true;
                score += 1;
            }

            else if(display[choice2]==images.water)
            {
                win = false;
            }
            else
            {
                possible = false;
                return;
            }
        }
        
        else if (display[choice1]==images.earth) //See first battle comments
        {
            if(display[choice2]==images.water)
            {
                win = true;
                score += 1;
            }

            else if(display[choice2]==images.fire)
            {
                win = false;
            }
            else
            {
                possible = false;
                return;
            }
        }
        
        possible = true; //If function is still running, a fight is definitly possible
        return win;          
}

function updateCanvas () //Refresh the canvas
{
    document.getElementById("score").innerHTML = "Score: " + score; //Set the new score

    var game = document.getElementById("game"); //Get the canvas
    var ctx = game.getContext("2d"); //get the context of the canvas

    ctx.clearRect(0, 0, game.width, game.height); //Reset the canvas first
    ctx.drawImage(images.background, 0, 0); //Draw the background Image
    ctx.drawImage(display[0], 50, 50); //draw every tile
    ctx.drawImage(display[1], 200, 50);
    ctx.drawImage(display[2], 350, 50);
    ctx.drawImage(display[3], 50, 200);
    ctx.drawImage(display[4], 200, 200);
    ctx.drawImage(display[5], 350, 200);
    ctx.drawImage(display[6], 50, 350);
    ctx.drawImage(display[7], 200, 350);
    ctx.drawImage(display[8], 350, 350);

}

function checkWin () //check if game over
{
    for(var i = 0; i<=8; i++) //check each tile
    {
        if(display[i]==images.fire)
        {
            var fireCheck = true; //there is at least one fire element
        }
        
        if(display[i]==images.water)
        {
            var waterCheck = true; //there is at least one water element
        }
        
        if(display[i]==images.wind)
        {
            var windCheck = true; //there is at least one wind element
        }

        if(display[i]==images.earth)
        {
            var earthCheck = true; //there is at least one earth element
        }
    }
    if(!(fireCheck&&waterCheck&&windCheck&&earthCheck)) //If there is not at least one of each kind
    {
        if(!fireCheck) //look which element was defeated
        {
            lastElement = "fire";
        }
        else if(!waterCheck)
        {
            lastElement = "water";
        }
        else if(!earthCheck)
        {
            lastElement = "earth";
        }
        else if(!windCheck)
        {
            lastElement = "wind";
        }

        return false; //tell other functions that it is game over
    }
    else
    {
        return true; //it is not game over. Yeah.
    }
}

function setScore()
{
	if(score > highscore) //If the new score is higher than old highscore
	{
		highscoreTxt = "Congratulations! You beat the highscore!"; //Tell the player that he/she is awesome
		highscore = score; //set new highscore
	}
	else
	{
		highscoreTxt = "Highscore: " + highscore; //Tell the player how close it was
	}
	changeUI(6); //Show gameover Screen
}

function changeUI (id)
{
	var ui; //user interface

	switch(id)
	{
		case 0: //Main Menu
			ui = "<div style=' padding: 200px;'><p style='border: 1px solid black;' onclick='changeUI(1)'>Play</p><p style='border: 1px solid black; margin-top: 30px;' onclick='changeUI(2)'>Instructions</p><p style='border: 1px solid black; margin-top: 30px;' onclick='changeUI(5)'>About</p></div>";
		break;

		case 1: //Play Area
			ui = "<p><span id='score' width='250px'>Score: 0</span> | <span id='highscore' width='250px'>Highscore: " + highscore + "</span></p><canvas id='game' width='500' height='500'style='border:1px solid #000000;'></canvas><table id='buttons'><tr><td onclick='move(0)'>Left</td><td onclick='move(1)'>Right</td><td onclick='move(2)'>Up</td><td onclick='move(3)'>Down</td></tr></table><p><br/><b>Hint:</b> Fire > Earth > Water > Wind > Fire<br/><br/></p>";
			document.getElementById("content").innerHTML = ui;
			start();
		break;

		case 2: //Rules Page 1
			ui = "<div style='padding-top: 200px;'><p><b>Rules/Instructions</b><br><br>Goal<br><br>1. Keep at least one of each kind of element in the game<br>2. You get one score point for each battle you win (see rules below)</p><p style='margin-top: 30px;' onclick='changeUI(3)'><a>Next: How to play</a></p><p style='margin-top: 30px;' onclick='changeUI(0)'><a>Back</a></p></div>";
		break;

		case 3: //Rules Page 2
			ui = "<div style='padding-top: 200px;'><p><b>Rules/Instructions</b><br><br>How to play:<br><br> 1. Click one of the buttons. All elements will now move by one step in this direction<br>2. The furthest elements in the respective direction will start. If an element cannot move any further because there is a wall or another element which cannot be batteled (see rules below) it will stop and be caught up by the next one behind it<br>3. After each move, a new element will spawn at a random position</p><p style='margin-top: 30px;' onclick='changeUI(2)'><a>Previous: Goal</a></p><p style='margin-top: 30px;' onclick='changeUI(4)'><a>Next: Rules</a></p><p style='margin-top: 30px;' onclick='changeUI(0)'><a>Back</a></p></div>";
		break;

		case 4: //Rules Page 3
			ui = "<div style='padding-top: 200px;'><p><b>Rules/Instructions</b><br>Rules<br><br>1. Fire burns Earth<br>2. Earth fills in Water<br>3. Water gets even stronger through Wind<br>4. Wind blows out Fire<br>5. Same elements; Fire and Water; Earth and Wind cannot fight against each other!<br>6. You only get score points when the attacking element (the moving one) wins the fight over the defending element (the one caught up)!</p><p style='margin-top: 30px;' onclick='changeUI(3)'><a>Previous: How to play</a></p><p style='margin-top: 30px;' onclick='changeUI(0)'><a>Back</a></p></div>";
		break;

		case 5: //About
			ui = "<div style='padding-top: 200px;'><p>Developed by Stefan Blamberg<br><br>This is my first game written in pure JavaScript without an engine.<br>Circle of Elements was created for the js13kGames Competition, which goal it is to create a game smaller than 13 kb.<br><br>The game works a bit like TicTacToe and is quiet puzzling.</p><p style='margin-top: 30px;' onclick='changeUI(0)'><a>Back</a></p></div>";
		break;

		case 6: //Game Over
			ui = "<div style='padding-top: 200px;'><p>Game over!<br><br>Your Score: "+ score + "<br><br>" + highscoreTxt + "</p><p style='margin-top: 30px;' onclick='changeUI(7)'><a>See your mistake</a></p><p style='margin-top: 30px;' onclick='changeUI(1)'><a>Play again!</a></p><p style='margin-top: 30px;' onclick='changeUI(0)'><a>Menu</a></p></div>";
		break;

        case 7: //Show last move
            ui = "<p><span id='score' width='250px'>Score: 0</span> | <span id='highscore' width='250px'>Highscore: " + highscore + "</span></p><canvas id='game' width='500' height='500'style='border:1px solid #000000;'></canvas><p>You lost the last <b>" + lastElement + "</b> element by moving <b>" + lastMoveTxt + "</b>!</p><p style='margin-top: 30px;' onclick='changeUI(6)'><a>Back</a></p>";
            document.getElementById("content").innerHTML = ui;
            updateCanvas(); //Show mistake
            return;
        break;
	}

	document.getElementById("content").innerHTML = ui; //Update the HTML document
}
