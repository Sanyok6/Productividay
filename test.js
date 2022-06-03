var term = require( 'terminal-kit' ).terminal ;

var items = [ 'File' , 'Edit' , 'View' , 'History' , 'Bookmarks' , 'Tools' , 'Help' ] ;

var options = {
	y: 1 ,	// the menu will be on the top of the terminal
	style: term.inverse ,
	selectedStyle: term.dim.blue.bgCyan
} ;

term.clear() ;
term.fullscreen()


term.singleLineMenu( items , options , function( error , response ) {
    term.moveTo.bold(0, term.height, "Task name: ")
    term.inputField(
	    function( error , input ) {
		    term.green( "\nYour name is '%s'\n" , input ) ;
	    }
    );
}) ;




function terminate() {
	term.grabInput( false ) ;
    term.clear();
	setTimeout( function() { process.exit() } , 100 ) ;
}

term.bold.cyan( 'Type anything on the keyboard...\n' ) ;
term.green( 'Hit CTRL-C to quit.\n\n' ) ;

term.on( 'key' , function( name , matches , data ) {
	if ( name === 'CTRL_C' ) { terminate() ; }
} ) ;

term.table( [
        ["^g1^", 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, "^C13^", 14]
	] , {
		hasBorder: true ,
        contentHasMarkup: true ,
		borderAttr: { color: 'blue' } ,
		width: 60 ,
	}
);
