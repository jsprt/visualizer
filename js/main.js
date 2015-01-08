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
var height = 600, width = 1000, devices,connection, force, curr_location = 0, loc_node_count =0;
var container = d3.select("body")
                            .append("svg")
                            .attr("height",height)
                            .attr("width",width);

container.attr("opacity", 1e-6)
    .transition()
    .duration(2000)
    .attr("opacity", 1);
var color = d3.scale.category20();
d3.json("json/miserables.json", function(json){
data = json;
    init(data);
} );



function init(data){


    force = d3.layout.force()
        .nodes(data.nodes)
        .links(data.links)
        .size([width,height])
        .charge(-100000)
        .gravity(1)
        .chargeDistance(100)
        .linkDistance(233);


    devices = container.selectAll('.device')
        .data(data.nodes)
        .enter()
        .append('g')
        .call(force.drag)
        .append('rect')
        .attr("class",'device')
        .attr("width", 50)
        .attr("rx",5)
        .attr("ry",5)
        .attr("height",50)
        .style("fill", function(d) { return color(d.group); })

    devices.append("text")
        .text(function(d) { return d.name })


     connection = container.selectAll(".link")
         .data(data.links)
         .enter().append("line")
         .attr("class", "link")
         .style("stroke-width", 5);

     labels = container.selectAll("text1")                                      //***NEW
        .data(data.nodes)
        .enter()
        .append("text")
         .attr("class", "text1")
        .attr({"x":function(d){return d.x;},
            "y":function(d){return d.y;}})
        .text(function(d){return d.name;})
        .call(force.drag);


    force.on("tick" ,function(){
        connection.attr("x1", function(d) { return d.source.x + 25; })
            .attr("y1", function(d) { return d.source.y + 25; })
            .attr("x2", function(d) { return d.target.x + 25; })
            .attr("y2", function(d) { return d.target.y + 25; })
            .attr("class" , function(d){
                if(d.value ===6){
                    return "link_backup";
                }else
                return "link";
            })

        devices.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
        labels.attr("x", function(d) { return d.x; })        // **NEW**
            .attr("y", function(d) { return d.y; });

    });


    force.start();
}



