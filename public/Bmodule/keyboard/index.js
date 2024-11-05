// document.addEventListener("keydown", function(event){
//     if (event.code === "KeyA"){
            // console.log("A")
//     }
// })


// function textInput(a,b){
//     document.getElementById(a).addEventListener("click", function(){
//         document.getElementById("textarea").value = b;
//     })
// }

function textInput(a, b) {
    if (document.getElementById(a)) {
        document.getElementById(a).addEventListener("click", function() {
            document.getElementById("textarea").value += b;
        });
    }
}

textInput("one", "1");
textInput("two", "2");
textInput("three", "3");
textInput("four", "4");
textInput("five", "5");
textInput("six", "6");
textInput("seven", "7");
textInput("eight", "8");
textInput("nine", "9");
textInput("zero", "0");
textInput("-", "-");
textInput("=", "=");
textInput("Q", "Q");
textInput("W", "W");
textInput("E", "E");
textInput("R", "R");
textInput("T", "T");
textInput("Y", "Y");
textInput("U", "U");
textInput("I", "I");
textInput("O", "O");
textInput("P", "P");
textInput("[", "[");
textInput("]", "]");
textInput("|", "|");
textInput("A", "A");
textInput("S", "S");
textInput("D", "D");
textInput("F", "F");
textInput("G", "G");
textInput("H", "H");
textInput("J", "J");
textInput("K", "K");
textInput("L", "L");
textInput(";", ";");
textInput("'", "'");
textInput("Z", "Z");
textInput("X", "X");
textInput("C", "C");
textInput("V", "V");
textInput("B", "B");
textInput("N", "N");
textInput("M", "M");
textInput(",", ",");
textInput(".", ".");
textInput("/", "/");
textInput("Space", " ");


