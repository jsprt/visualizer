var palette = {
    "lightgray": "#819090",
    "gray": "#708284",
    "mediumgray": "#536870",
    "darkgray": "#475B62",

    "darkblue": "#0A2933",
    "darkerblue": "#042029",

    "paleryellow": "#FCF4DC",
    "paleyellow": "#EAE3CB",
    "yellow": "#A57706",
    "orange": "#BD3613",
    "red": "#D11C24",
    "pink": "#C61C6F",
    "purple": "#595AB7",
    "blue": "#2176C7",
    "green": "#259286",
    "yellowgreen": "#738A05"
}
var height = 6000, width = 3000, devices,connection, force, curr_location = 0, loc_node_count =0;
var container = d3.select("body")
                            .append("svg")
                            .attr("height",height)
                            .attr("width",width);

container.attr("opacity", 1e-6)
    .transition()
    .duration(2000)
    .attr("opacity", 1);

d3.json("json/miserables.json", function(json){
data = json;
    init(data);
} );



function init(data){



/*    devices = container.selectAll('rect')
        .data(data.nodes)
        .enter()
        .append('rect')
        .attr("width", 50)
        .attr("height",50)*/

/*     connection = container.selectAll(".link")
         .data(data.links)
         .enter().append("line")
         .attr("class", "link")
         .style("stroke-width", function(d) { return Math.sqrt(d.value); });*/

    force = d3.layout.force()
        .nodes(data.nodes)
        .links(data.links)
        .size([width,height]);


/*    force.on("tick" ,function(){
        devices.attr("x", function(d){
            if(curr_location != d.location){
                curr_location = d.location;
                loc_node_count =1;
            }
            else {
                loc_node_count++;
            }
            return 400 * d.location + (loc_node_count)*100 ;
        });

        devices.attr("y", function(d){
            return 400;
        });

    });*/


    force.start();
}



