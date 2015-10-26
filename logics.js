/**
 * Created by hristo on 21/10/15.
 */

var input = document.getElementById('input1');
var deleteButton = document.getElementById('delete1');

input.value = "0";

var operator_added = false;
var dot_added = false;
var operators = ["+","-","×","÷","%","^","!"];

// Used for the fitts law to calculate log to the base 2
function getBaseLog(x, y)
{
    return Math.log(y) / Math.log(x);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
// add value to the input screen when the user presses a button
function add(x){
    if(deleteButton.value == "AC")    deleteButton.value = "CE";


    if(operators.indexOf(x) < 0)
    {
        operator_added = false;
        if(input.value == "0")  input.value = "";
    }

    if(x == ".")
    {
        if(dot_added == false)  dot_added = true;
        else x = "";
    }
    else if(operators.indexOf(x) > -1)
    {
        var last_char = input.value.charAt(input.value.length-1);
        if(operator_added == false)
        {
            if(last_char == ".") x = "";
            else {
                operator_added = true;
                dot_added = false;
            }
        }
        else x = "";
    }
    input.value += x;
}

// deletes a character from the screen when the user presses the delete button
function del(){
    if(deleteButton.value == "AC")
    {
        input.value = "0";
        dot_added = false;
        operator_added = false;
        deleteButton.value = "CE";
    }
    else
    {
        // increment the errors when we press the CE button
        // but only when we actually have something to delete
        if(input.value != "0")
        {
            incrementErrors();
        }

        var last_char = input.value.charAt(input.value.length-1);
        if(last_char == ".") dot_added = false;
        else if(operators.indexOf(last_char) > -1) operator_added = false;

        input.value = input.value.substr(0, input.value.length-1);
        last_char = input.value.charAt(input.value.length-1);

        if(last_char == ".") dot_added = true;
        else if(operators.indexOf(last_char) > -1) operator_added = true;

        if(input.value.length == 0) input.value = "0";
    }
}

// displays the result on the screen when the user presses "="
function answer(){
    try{
        // remove the last character if it is an operator... just ignore it
        var last_char = input.value.charAt(input.value.length-1);
        if(operators.indexOf(last_char) > -1 && last_char != "!")  input.value = input.value.substr(0, input.value.length-1);

        if(input.value.indexOf("÷") > -1) input.value = input.value.split("÷").join("/");
        if(input.value.indexOf("×") > -1) input.value = input.value.split("×").join("*");
        if(input.value.indexOf("π") > -1) input.value = input.value.split("π").join("PI");
        if(input.value.indexOf("log(") > -1) input.value = input.value.split("log(").join("log10(");
        if(input.value.indexOf("ln(") > -1) input.value = input.value.split("ln(").join("log(");
        if(input.value.indexOf("√(") > -1) input.value = input.value.split("√(").join("sqrt(");

        input.value = math.eval(input.value);

        if(input.value.indexOf(".") > -1) dot_added = true
        else dot_added = false;

        operator_added = false;
    }
    catch(err)
    {
        input.value = "Error";
        dot_added = false;
        operator_added = false;
    }

    deleteButton.value = "AC";
}

// takes data from the array and draws the fitts law diagram for the 3 different designs
function drawFittsDiagram(data)
{
    var margin = {top: 20, right: 15, bottom: 60, left: 60}
        , width = 800 - margin.left - margin.right
        , height = 400 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.ID; })])
        .range([ 0, width - 100]);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.time; })])
        .range([ height, 0 ]);

    var chart = d3.select('#graph')
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'chart')

    var main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main')

    // draw the x axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .innerTickSize(-height)
        .outerTickSize(0)
        .tickPadding(10);

    main.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'main axis date')
        .call(xAxis);

    // draw the y axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .innerTickSize(-width + 100)
        .outerTickSize(0)
        .tickPadding(10);

    main.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'main axis date')
        .call(yAxis);

    var g = main.append("svg:g");

    g.selectAll("scatter-dots")
        .data(data)
        .enter().append("svg:circle")
        .attr("cx", function (d,i) { return x(d.ID); } )
        .attr("cy", function (d) { return y(d.time); } )
        .style("fill", function(d){ return d.color; })
        .attr("r", 4);


    //Create X axis label
    main.append("text")
        .attr("x", width / 2 )
        .attr("y",  height + 40)
        .style("font-size","15px")
        .style("text-anchor", "middle")
        .text("Index of Difficulty");

    //Create Y axis label
    main.append("text")
        .attr("transform", "rotate(-90)")
        .style("font-size","15px")
        .attr("y", 0 - 60)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Time(s)");

    var legend = g.selectAll("#legend")
        .data([{design:"Design 1", color: colors.design1}, {design:"Design 2", color: colors.design2}, {design:"Design 3", color: colors.design3}])
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 30 + ")"; });

    g.append("rect")
        .attr("x", width - 90)
        .attr("y", -10)
        .attr("width", 100)
        .attr("height", 100)
        .style("fill", "transparent")
        .style("stroke", "black");


    legend.append("circle")
        .attr("cx", width - 10)
        .attr("cy", 10)
        .attr("r", 10)
        .style("fill", function(d){ return d.color; });

    legend.append("text")
        .attr("x", width - 30)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("font-size","12px")
        .style("text-anchor", "end")
        .text(function(d) { return d.design; });
}


function drawErrorsDiagram(data)
{
    var margin = {top: 20, right: 15, bottom: 60, left: 60}
        width = 400 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .outerTickSize(0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .outerTickSize(0)
        .tickFormat(d3.format("d"));

    var svg = d3.select("#errors-graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    x.domain(data.map(function(d) { return d.design; }));
    y.domain([0, d3.max(data, function(d) { return d.errors; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    //Create Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .style("font-size","15px")
        .attr("y", 0 - 40)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Errors");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.design); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.errors); })
        .attr("height", function(d) { return height - y(d.errors); })
        .style("fill", function(d){ return d.color; });

}
var colors = {design1:"red", design2: "blue", design3: "green"};
var color = colors.design1;

var click_queue = [];
var fitts = [];

var errors = {design1: 0, design2: 0, design3: 0};

$(document).ready(function(e){
    $("#calculator2").hide();
    $("#calculator3").hide();

    // on design change, show the active calculator and hide the others
    // also set all the necessary variables to the appropriate values
    $("#design1").click(function() {
        input = document.getElementById('input1');
        input.value = "0";
        operator_added = false;
        dot_added = false;
        deleteButton = document.getElementById('delete1');
        color = colors.design1;
        $("#calculator1").show();
        $("#calculator2").hide();
        $("#calculator3").hide();
        $("#design1-li").attr("class","active");
        $("#design2-li").attr("class","");
        $("#design3-li").attr("class","");
    });

    $("#design2").click(function() {
        input = document.getElementById('input2');
        input.value = "0";
        operator_added = false;
        dot_added = false;
        deleteButton = document.getElementById('delete2');
        color = colors.design2;
        $("#calculator1").hide();
        $("#calculator2").show();
        $("#calculator3").hide();
        $("#design1-li").attr("class","");
        $("#design2-li").attr("class","active");
        $("#design3-li").attr("class","");

    });

    $("#design3").click(function() {
        input = document.getElementById('input3');
        input.value = "0";
        operator_added = false;
        dot_added = false;
        deleteButton = document.getElementById('delete3');
        color = colors.design3;
        $("#calculator1").hide();
        $("#calculator2").hide();
        $("#calculator3").show();
        $("#design1-li").attr("class","");
        $("#design2-li").attr("class","");
        $("#design3-li").attr("class","active");
    });


    // randomly generate the tasks
    tasks = ["(2 ^ 3) × (ln(3π)) + √(5)",
        "((4π ) ^ 3 - log(12.5)) ÷ 4!  ",
        "√(16.9) + 5 × ((5!)^4) ",
        "(π % 1.3) × (tan(1) + e^4) ",
        "((sin(2) × cos (3))^2) ÷ 5 × e",
        "2 × 3"
    ];

    for(var i = 0; i < 5; i++)
    {
        var index = getRandomInt(0,tasks.length);
        document.getElementById('task' + (i+1).toString() ).innerHTML += " " + tasks[index];
        tasks.splice(index,1);
    }

    // on button click record the coordinates and the timestamp of a click
    // also measure the distance and time between two clicks
    // to calculate the index of difficulty for each movement
    // to later on plot the data on a graph
    $(".frame").click(function(e){
        var button = document.elementFromPoint(e.clientX, e.clientY);
        console.log(button.value);
        // if we didnt click on a button increment the mistakes
        if(button.value === undefined || button.value === null)
        {
            incrementErrors();
        }

        else // otherwise perform the fitts law calculations for this button click
        {
            var d = new Date();

            // get the current click on the button
            var current_click = {x:e.clientX, y:e.clientY , time: d.getTime()};

            // add it to the queue of click events
            click_queue.push(current_click);

            // if the queue has 2 click events then we can measure the time and distance between them
            // to add it to the fitts law array
            if(click_queue.length == 2)
            {
                previous_click = click_queue.shift();

                var x1 = previous_click.x;
                var y1 = previous_click.y;

                var x2 = current_click.x;
                var y2 = current_click.y;

                var distance = math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                var time = (current_click.time - previous_click.time) / 1000.0;

                var ID = getBaseLog(2, distance/ button.offsetWidth + 1);

                fitts_entry = {time:time, ID:ID, color: color};
                fitts.push(fitts_entry);
            }

            if(button.value == "=")
            {
                // delete the old diagram and update it with the new
                d3.select("svg").remove();
                d3.select("svg").remove();

                click_queue = [];
                drawFittsDiagram(fitts);

                error_data = [{design: "Design 1" , errors: errors.design1, color: colors.design1},
                    {design: "Design 2" , errors: errors.design2, color: colors.design2},
                    {design: "Design 3" , errors: errors.design3, color: colors.design3}];

                drawErrorsDiagram(error_data);
            }
        }
    });
});


function change_design(url)
{
    var stylesheet = document.getElementById("design-sheet");
    stylesheet.setAttribute('href', url);
}

function incrementErrors(){
    if(color == colors.design1) errors.design1 += 1;
    else if(color == colors.design2) errors.design2 += 1;
    else if(color == colors.design3) errors.design3 += 1;
}