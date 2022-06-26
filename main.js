const Layout = require('terminal-kit/lib/document/Layout');
const fs = require('fs');

var term = require( 'terminal-kit' ).terminal ;

var items = [ 'Dashboard' , 'Tasks' , 'Settings', 'Help', 'Exit' ] ;

var tab = 0

var tbSelected = true;

var working = false;

var path = require("path").join(__dirname, 'data.json')
var data = JSON.parse(fs.readFileSync(path, 'utf8'));

var tasks = data.tasks
var hist = data.hist

if (data.last != new Date().getDate()) {
    for (i = 0; i < tasks.length; i++) {
        tasks[i][2] = "-"
    }
}

term.clear() ;
term.fullscreen()
term.windowTitle("Productividay")

topBar()

generateTable()

function terminate() {
    saveData()
    term.hideCursor(false)
	term.grabInput( false ) ;
    term.clear();
	setTimeout( function() { term.clear(); process.exit() } , 100 ) ;
}

term.on( 'key' , function( name , matches , data ) {
	if ( name === 'CTRL_C' ) { terminate() ; }
    //if ( name === ":" ) { tbSelected = true; topBar()}
} ) ;


function saveData() {
    // a =[]
    // for (i = 0; i < 28; i++) {
    //     current = new Date()
    //     current.setDate(current.getDate() + 7 - current.getDay()  - 28 + i)
    //     a.push(current.getDate())
    // }
    d = {
        "tasks": tasks,
        "hist": hist,
        "last": new Date().getDate(), 
    }

    json = JSON.stringify(d)

    fs.writeFile(path, json, function (err) {});
}

function topBar(i=0) {

var options = {
	y: 1,
    align: 'left',
	style: term.inverse ,
	selectedStyle: term.dim.blue.bgCyan,
    continueOnSubmit: true,
    selectedIndex: i,
    fillIn: true,
} ;

term.singleLineMenu( items , options , function( error , response ) {
    if (!tbSelected) {return}
    tab = response.selectedIndex
    if (response.selectedIndex == 0) {
        term.clear()
        term.fullscreen()

        topBar()

        generateTable()

        incomplete = 0
        for (i = 0; i < tasks.length; i++) {
            if (tasks[i][2] == "-") {
                incomplete++
            }
        }
        
        term.moveTo.bold.cyan(term.width/2-18, term.height, "You currently have "+incomplete+" incomplete tasks")
    } else if (response.selectedIndex == 1) {
        term.clear()
        term.fullscreen()

        topBar(1, false)

        tasksTable()
    
    } else if (response.selectedIndex == 2) {
        term.clear()
        term.fullscreen()

        topBar(2, false)

        term.moveTo(0, 3, "Settings")
    } else if (response.selectedIndex == 3) {
        term.clear()
        term.fullscreen()

        topBar(3, false)

        term.moveTo(0, 3, "Help")

    } else if (response.selectedIndex == 4) {
        terminate()
    }
}) ;

}

function generateTable() {
    today = new Date()

    current = new Date()
    current.setDate(current.getDate() + 7 - current.getDay()  - 28)

    let x = 0
    let y = 0

    passed = false

    term.moveTo.bold(term.width/2-4, 4, "Calendar")


    let pr = hist.length-1
    let st;
    if (hist[pr] == today.getDate()) {st = 1} else {st = 0}
    if (hist[pr]-1 == new Date().getDate()-1) {
        while (true) {
            if (pr > 0 && hist[pr] == hist[pr-1]+1) {
                st++
                pr--
            } else {
                break
            }
        }
    }

    term.moveTo(term.width/2-9, 15, "Current streak: ", st)

    for (let w = 0; w < 5; w++) {
        offset = term.width/2-18
        for (let d = 0; d < 8; d++) {

            const opts = ['┌', '┬', '┐', '├', '┼', '┤', '└', '┴', '┘']

            let ch = "_";


            switch (x) {
                case 0: {
                    ch = opts[3]
                    if (y == 0) {ch = opts[0]}
                    if (y == 4) {ch = opts[6]}
                }
                break;
                
                case 7: {
                    ch = opts[5]
                    if (y == 0) {ch = opts[2]}
                    if (y == 4) {ch = opts[8]}
                }
                break;

                default: {
                    ch = opts[4]
                    if (y == 0) {ch = opts[1]}
                    if (y == 4) {ch = opts[7]}
                }
            }
            
            term.moveTo(5*x+offset, 2*y+5, ch)
            
            if (x != 7) {for (let z = 1; z < 5; z++) {term.moveTo(5*x+offset-z+5, 2*y+5, "─")}}
            if (y != 4) {for (let z = 1; z < 2; z++) {term.moveTo(5*x+offset, 2*y+5+1, "│")}}

            if (x != 7 && y != 4) {
                if (hist.indexOf(current.getDate()) != -1) {
                    if (passed) {
                        term.dim.moveTo(5*x+offset+2, 2*y+6, current.getDate())
                        hist.splice(hist.indexOf(current.getDate()), 1)
                    } else {
                        term.moveTo.brightGreen(5*x+offset+2, 2*y+6, current.getDate())
                    }
                    if (current.getDate() == today.getDate()) {
                        term.moveTo.inverse.brightGreen(5*x+offset+2, 2*y+6, current.getDate())
                        passed = true
                    }
                } else {
                    term.dim.moveTo(5*x+offset+2, 2*y+6, current.getDate())
                    if (current.getDate() == today.getDate()) {
                        term.moveTo.dim.inverse(5*x+offset+2, 2*y+6, current.getDate())
                        passed = true
                    }
                }
                current.setDate(current.getDate() + 1)
            }
                
            x++
        }
        y++
        x=0
    }
}

function tasksTable() {
    var taskIndex = 0;
    var editing = false;

    tbSelected = false;

    function renderTable(ind=0) {
        var t = JSON.parse(JSON.stringify(tasks));

        t[0].pop()

        for (let i=1; i<t.length; i++) {
            t[i][0] = "^"+t[i][3]+t[i][0] //•
            t[i][1] += " minutes"
            t[i].pop()
        }
 
        try {
            t[ind+1][0] = "^c^_"+t[ind+1][0]+"^"
            t[i][1] += " minutes"
        } catch {}

        term.moveTo(0, 3)
        term.table( t, {
                hasBorder: true,
                contentHasMarkup: true ,
                borderChars: 'lightRounded' ,
                borderAttr: { color: 'blue' } ,
                textAttr: { bgColor: 'default'} ,
                firstCellTextAttr: { bgColor: 'blue' } ,
                firstRowTextAttr: { bgColor: 'yellow' } ,
                width: 60 ,
                fit: true
            }
        );    
        term.hideCursor()
    }
    function erase(l=line, n=7) {
        term.moveTo(0, l)
        term.deleteLine(n)
        term.insertLine(n)
        editing=false
        tbSelected=true;
        topBar();

        renderTable(taskIndex)

    }

    term.on( 'key' , function( name , matches , data ) {
        if ( name === "LEFT" || name === "RIGHT" && !tbSelected && !editing) {
            tbSelected = true; 
            term.moveTo(0, 0); 
            //topBar(); 
            return 
        }
        if (tab != 1 || editing || tasks.length <= 1) {return}
        if ( name === 'UP' && taskIndex > 0) { 
            tbSelected = false;
            taskIndex--
            renderTable(taskIndex)
        } else if (name === "DOWN" && taskIndex < tasks.length-2) {
            tbSelected=false;
            taskIndex++
            renderTable(taskIndex)
        } else if (name === "ENTER") {
            if (tbSelected == true) {return}
            //tbSelected = false;
            editing = true

            line = tasks.length*2+4

            term.bold.moveTo(0, line, tasks[taskIndex+1][0]+":")


            var items = [
                'Begin Task' ,
                'Edit Name' ,
                'Edit Duration' ,
                'Mark Incomplete' ,
                'Delete Task' ,
                'Cancel'
            ] ;

            term.singleColumnMenu( items , function( error , response ) {

                switch (response.selectedIndex) {
                    case 0: {
                        erase()
                        if (!working) {
                            term( '\n' ).eraseLineAfter.green.moveTo(0, line, "Began task ^_" + tasks[taskIndex+1][0]) ;
                            progressBar(tasks[taskIndex+1], erase)
                        } else {
                            term.yellow.moveTo(0, line, "You are already working on a task!")
                        }
                        return
                    } 
                    case 1: {
                        term.bold("Enter new name: ")
                        term.hideCursor(false)
                        term.inputField(
                            function( error , input ) {
                                erase()
                                tasks[taskIndex+1][0] = input
                                renderTable(taskIndex)
                            }
                        )
                        return
                    }
                    case 2: {
                        term.bold("Enter new duration: ")
                        term.hideCursor(false)
                        term.inputField(
                            function( error , input ) {
                                input = parseInt(input)
                                if (!isNaN(input)) {
                                    erase()
                                    tasks[taskIndex+1][1] = parseInt(input)
                                    renderTable(taskIndex)
                                } else {
                                    term.eraseLine()
                                    term.red("Invalid input")
                                    editing = false
                                }
                            }
                        )
                        return
                    }
                    case 3: {
                        tasks[taskIndex+1][2] = "-"
                        erase()
                        renderTable(0)
                        return
                    }
                    case 4: {
                        tasks.splice(taskIndex+1, 1)
                        renderTable(0)
                        erase()
                        return
                    }
                    case 5: {
                        erase()
                        return
                    }
                }
            } ) ;
        } else if (name === "n") {
            if (tbSelected == true) {return}
            editing = true;

            let name = "";
            let duration = "";

            line = tasks.length*3+1

            term.bold.moveTo(0, line, "Create new task: ")

            term.moveTo(2, line+1, "Task Name: ")
            term.hideCursor(false)
            term.inputField(
                function( error , input ) {
                    if (input != "") {
                        term.eraseLine()
                        name = input

                        term.moveTo(2, line+1, "Duration (minutes): ")
                        term.inputField(
                            function( error , input ) {
                                input = parseInt(input)
                                if (!isNaN(input)) {
                                    term.eraseLine()
                                    duration = input

                                    term.hideCursor(false)

                                    var autoComplete = [
                                        'white', 
                                        'red' ,
                                        'green' ,
                                        'yellow' ,
                                        'blue' ,
                                        'magenta' ,
                                        'cyan'
                                    ] ;
                                    
                                    term.inputField(
                                        {
                                            autoComplete: autoComplete ,
                                            autoCompleteHint: true ,
                                            autoCompleteMenu: true ,
                                            tokenHook: function( token , isEndOfInput , previousTokens , term , config ) {
                                                var previousText = previousTokens.join( ' ' ) ;

                                                var fn = input.toString().trim();

                                                
                                                if (autoComplete.includes(token)) {
                                                        return previousTokens.length ? null : term.yellow[token] ;
                                                }

                                            }
                                        } ,
                                        function( error , input ) {
                                            if (autoComplete.includes(input)) {
                                                erase()
                                                
                                                color = input

                                                tasks.push([name, duration, "-", color[0]])
                                                renderTable()                                            
                                            } else {
                                                term.eraseLine()
                                                term.red("Unknown color, options are: "+autoComplete.join(", "))
                                                editing = false
                                            }
                                        }
                                    ) ;


                                } else {
                                    term.eraseLine()
                                    term.red("Invalid input")
                                    editing = false
                                }
                            }
                        )
                    } else {
                        term.eraseLine()
                        term.red("Input must not be blank.")
                        editing = false
                    }
                }
            )


        }
    } ) ;

    renderTable()
}


function progressBar(task, erase) {
    working = true;

    var duration = task[1]*60;
    var progressBar , progress = 0 ;

    var paused = false

    term.on( 'key' , function( name , matches , data ) {
        if (name == "p") {
            paused = !paused
        }
    })

    function doProgress()
    {
        if (paused) {
            term.dim.moveTo(0, term.height, "Paused - ", task[0])
            setTimeout( doProgress, 1)
            return
        }

        progress += 0.001;
        progressBar.update( progress ) ;
        
        if ( progress >= 1 )
        {   
            task[2] = "✅"

            if (hist.indexOf(new Date().getDate()) == -1) {
                t = true;
                for (i=1; i < tasks.length; i++) {
                    if (tasks[i][2] == "-") {
                        t = false
                    }
                }
                if (t) {
                    hist.push(new Date().getDate())
                }
            }

            working = false;
            erase()
        }
        else
        {
            setTimeout( doProgress , duration) ;
        }
    }


    progressBar = term.progressBar( {
        y: term.height,
        width: term.width,
        title: 'Work on ^_'+task[0]+"^::" ,
        eta: true ,
        percent: true,
    } ) ;

    doProgress() ;
}



