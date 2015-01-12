var height = 600
    , width = 2500
    ,rect_height = 50
    ,rect_width = 50
    , totallocs
    , devices
    ,connection
    , force
    , padding=30  //padding to avoid collision
    , foci =[]
    , fociFactor = 100

    ,palette = {
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
    };

var container = d3.select("body")
    .append("svg")
    .attr("height",height)
    .attr("width",width);

/*container.attr("opacity", 1e-6)
 .transition()
 .duration(2000)
 .attr("opacity", 1);*/

var color = d3.scale.category20();  // .domain(d3.range(m)); where m is the number of groups



d3.json("json/network.json", function(json){
    data = json;
    init(data);
} );

function init(data){

    totallocs = data.totallocs;
    var locationPoints = d3.scale.ordinal().domain(d3.range(totallocs)).rangePoints([0,width],1);

    force = d3.layout.force()
        .nodes(data.nodes)
        .links(data.links)
        .size([width,height])
        .charge(0)
        .gravity(0.05);





    devices = container.selectAll('.device')
        .data(data.nodes)
        .enter()
        .append('g')
        .call(force.drag)
        .append('rect')
        .attr("class",'device')
        .attr("width", rect_width)
        .attr("rx",5)
        .attr("ry",5)
        .attr("height",rect_height)
        .style("fill", function(d) { return color(d.group); })
        .on("contextmenu" ,function(d,i){
            contextMenu(this,d,i)
            d3.event.preventDefault();
            console.log(d);
            console.log(i);
        })

    devices.append("text")
     .text(function(d) { return d.name })


    connection = container.selectAll(".link")
        .data(data.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", 5);

    labels = container.selectAll("textlabel")
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("class", "textlabel")
        .attr({"x":function(d){return d.x;},
            "y":function(d){return d.y;}})
        .text(function(d){return d.name;})
        .call(force.drag);



    // Resolve collisions between nodes.


    // Move nodes toward cluster focus.
    function gravity(alpha) {
        return function(d) {
            d.y += (height/2 - (d.y)) * alpha;
            d.x += (locationPoints(d.group -1) - d.x) * alpha;
        };
    }
    function collide(d) {
        var quadtree = d3.geom.quadtree(devices);
        return function(d) {
            nx1 = d.x - padding;
            nx2 = d.x + rect_width + padding;
            ny1 = d.y - padding;
            ny2 = d.y + rect_height + padding;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                var dx, dy;
                if (quad.point && (quad.point !== d)) {
                    if (overlap(d, quad.point)) {
                        dx = Math.min(d.x2 - quad.point.x, quad.point.x2 - d.x) / 2;
                        d.x -= dx;
                        quad.point.x -= dx;
                        dy = Math.min(d.y2 - quad.point.y, quad.point.y2 - d.y) / 2;
                        d.y -= dy;
                        quad.point.y += dy;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

    force.on("tick" ,function(e){

        connection.attr("x1", function(d) { return d.source.x + 25; })
            .attr("y1", function(d) { return d.source.y + 25; })
            .attr("x2", function(d) { return d.target.x + 25; })
            .attr("y2", function(d) { return d.target.y + 25; })
            .classed("linkbackup" , function(d){     return (d.value ===6)})
            .classed("link" , function(d){     return (d.value !=6)})
            .classed("weaklink" , function(d){     return (d.source.group !== d.target.group)})
            .classed("stronglink" , function(d){     return (d.source.group === d.target.group)});

        devices.each(gravity( 0.2 * e.alpha));
       // devices.each(collide(0.5));
        /*   while (++i < n) {
         q.visit(collide(devices[0][i]));
         }*/
        try {
            devices.attr("x", function (d) {
                return d.x;
            });
            devices.attr("y", function (d) {
                return d.y;
            });
        }catch(err)
        {
            console.log(err);
        }
        labels.attr("x", function(d) {
            return d.x;
        })
            .attr("y", function(d) {
                return d.y;
            });

    });

    force.linkStrength(function(connection){
     if (connection.source.group === connection.target.group) return 1;
     return 0.1;
     });
     force.linkDistance(function(connection){
     if (connection.source.group === connection.target.group) return 75;
     return 250;
     });

    // copied from http://bl.ocks.org/dobbs/1d353282475013f5c156
    function overlap(a,b){
        (a.x < b.x < a.x2() &&  a.y < b.y < a.y2()) ||   (a.x < b.x2() < a.x2() && a.y < b.y2() < a.y2())
    }
    force.start();
}


var contextMenu = function(context, dataum , index) {


    d3.event.preventDefault();

    var position = d3.mouse(context);
    d3.select('#context-menu')
        .style('position', 'absolute')
        .style('left', 10 +position[0] + "px")
        .style('top', position[1] + "px")
        .style('display', 'inline-block')
        .on("mouseleave", function() {
         d3.select('#context-menu').style('display', 'none');
          context = null;
        });
    d3.select('#context-menu').attr('class', 'menu ' + context);
}
