var height = 600
    , width = 2000
    ,rect_height = 70
    ,rect_width = 70
    , primarygroups
    , secondarygroups
    , devices
    ,connection
    , force
    , padding=30  //padding to avoid collision
    , off = 15    // cluster hull offset
    , hull
    , hullg
    //, hulls = {}
    //, hullset = []
    , linkdiff = 20

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

hullg = container.append("g");

/*container.attr("opacity", 1e-6)
 .transition()
 .duration(2000)
 .attr("opacity", 1);*/

var color = d3.scale.category20();  // .domain(d3.range(m)); where m is the number of groups

d3.json("json/network.json", function(json){
    data = json;
    init(data);
} );


function drawCluster(d) {
    return curve(d.path); // 0.8
}

var curve = d3.svg.line()
    .interpolate("cardinal-closed")
    .tension(.85);

function init(data){

    primarygroups = data.primarygroups;
    secondarygroups = data.secondarygroups;

    var primarylocationPoints = d3.scale.ordinal().domain(d3.range(primarygroups)).rangePoints([0,width],1);
    var secondarylocationPoints = d3.scale.ordinal().domain(d3.range(secondarygroups)).rangePoints([0,width],1);

    force = d3.layout.force()
        .nodes(data.nodes)
        .links(data.links)
        .size([width,height])
        .charge(-1500)
        .gravity(0.1)
        .friction(0.9)
        .linkStrength(function(d) {
            return (d.value === 12  || d.value === 21) ? 0 : 1;
        })
        .start()
    //default settings: size 1×1, link strength 1, friction 0.9, distance 20, charge strength -30, gravity strength 0.1, and theta parameter 0.8


    var drag = force.drag()
        .on("dragstart", dragstart);

    function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
    }
    devices = container.selectAll('.device')
        .data(data.nodes)
        .enter()
        .append('g')
        .call(force.drag)
        .append('rect')
        .classed("device" , function(d){return true;})
        .classed("faultydevice" , function(d){if(d.alarmstatus != undefined && d.alarmstatus === "critical"){
            return true;
        }})
        .attr("width", rect_width)
        .attr("rx",5)
        .attr("fill-opacity",0)
        .attr("ry",5)
        .attr("height",rect_height)
        .style("fill", function(d){if(d.alarmstatus != undefined && d.alarmstatus === "critical"){
            return "red";
        }})

    d3.selectAll(".faultydevice").transition()
        .delay(100)
        .duration(4000)
        .attr("fill" ,"#FF0000")
        .attr('fill-opacity', 1);


    devices.append("text")
        .text(function(d) { return d.name })

    images = container.selectAll(".devtypeimage")
        .data(data.nodes)
        .enter()
        .append("image")
        .attr("class", "devtypeimage")
        .attr("height" ,"60")
        .attr("width" ,"60")
        .attr({"x":function(d){return d.x;},
            "y":function(d){return d.y;}})
        .attr("xlink:href", function (d){
            if(d.devtype ==="switch"){
                return "assets/img/Switch.svg";
            }
            else{
                return "assets/img/Router.svg";
            }
        })
        .on("contextmenu" ,function(d,i){
            contextMenu(this,d,i)
            d3.event.preventDefault();
            console.log(d);
            console.log(i);
        })
        .call(force.drag)

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

    hullg.selectAll("path.hull").remove();
    hull = hullg.selectAll("path.hull")
        .data(convexHulls(data.nodes))
        .enter().append("path")
        .attr("class", "hull")
        .attr("d", drawCluster)
        .style("fill", function(d) { return color(d.group); })

    // Resolve collisions between nodes.


    // Move nodes toward cluster focus.
    function gravity(alpha) {
        return function(d) {
            if (d.type == "primary"){
                d.y += (height/4 - (d.y)) * alpha;
                d.x += (primarylocationPoints(d.group -1) - d.x) * alpha;
            }else{
                d.y += (height*3/4 - (d.y)) * alpha;
                d.x += (secondarylocationPoints(d.group -1 -primarygroups ) - d.x) * alpha;

            }

        };
    }
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(data.nodes);
        return function(d) {
            nx1 = d.x - padding;
            nx2 = d.x + rect_width + padding;
            ny1 = d.y - padding;
            ny2 = d.y + rect_height + padding;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                var dx, dy;
                if (quad.point && (quad.point !== d)) {
                    if (overlap(d, quad.point)) {
                        dx = Math.min((d.x + rect_width) - quad.point.x, (quad.point.x + rect_width) - d.x) / 5;
                        d.x -= dx;
                        quad.point.x += dx;
                        dy = Math.min((d.y +rect_height) - quad.point.y, (quad.point.y + rect_height) - d.y) / 5;
                        d.y -= dy;
                        quad.point.y += dy;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

    function convexHullPoints(node){
        offset = off;
        var n = node;
        l = hulls[n.group] || (hulls[n.group] = []);
        l.push([n.x-offset, n.y-offset]);
        l.push([n.x-offset, n.y+ rect_height + offset]);
        l.push([n.x+ rect_width + offset, n.y-offset]);
        l.push([n.x+ rect_width + offset, n.y+ rect_height + offset]);
    }

    function convexHullPointSets() {
        // create convex hulls
        for (i in hulls) {
            hullset.push({group: i, path: d3.geom.hull(hulls[i])});
        }
        return hullset;
    }

    function convexHulls(nodes) {
        hulls = {};
        hullset = [];
        // create point sets
        for (var k=0; k<nodes.length; ++k) {
            convexHullPoints(nodes[k]);
        }

        return convexHullPointSets();

    }


    force.on("tick" ,function(e){


        //hull.datum(d3.geom.hull([[10,10],[10,200],[200,200],[200,10]])).attr("d", function(d) { return "M" + d.join("L") + "Z"; });
        if (!hull.empty()) {
            hull.data(convexHulls(data.nodes))
                .attr("d", drawCluster);
        }
        connection
            .attr("x1", function(d) {
                if(d.value === 1 || d.value === 2  || d.value === 33 || d.value === 12  || d.value === 21) {
                    return d.source.x + rect_width / 2;
                }else if (d.value === 11){
                    return d.source.x + rect_width / 2 + linkdiff;
                }
            })

            .attr("x2", function(d) {
                if(d.value === 1 || d.value === 2 || d.value === 33 || d.value === 12  || d.value === 21) {
                    return d.target.x + rect_width / 2;
                }else if (d.value === 11){
                    return d.target.x + rect_width / 2 + linkdiff;
                }
            })

            .attr("y1", function(d) {
                if(d.value === 1 || d.value === 2 || d.value === 33 || d.value === 12  || d.value === 21) {
                    return d.source.y + rect_width / 2;
                }else if (d.value === 11){
                    return d.source.y + rect_width / 2 + linkdiff;
                }
            })

            .attr("y2", function(d) {
                if(d.value === 1 || d.value === 2 || d.value === 33 || d.value === 12  || d.value === 21) {
                    return d.target.y + rect_width / 2;
                }else if (d.value === 11){
                    return d.target.y + rect_width / 2 + linkdiff;
                }
            })
            .classed("crosspath" , function(d){     return (d.value === 12  || d.value === 21)})
            .classed("faulytlink" , function(d){     return (d.value ===33)})
            .classed("linkbackup" , function(d){     return (d.value ===2)})
            .classed("prallelpath" , function(d){     return (d.value ===11)})
            .classed("link" , function(d){     return (d.value !=2)})
            .classed("weaklink" , function(d){     return (d.source.group !== d.target.group)})
            .classed("stronglink" , function(d){     return (d.source.group === d.target.group)});

        devices.each(gravity( 0.2 * e.alpha));

        devices.each(gravity( 0.2 * e.alpha));


        //devices.each(collide(0.5));
        /*   while (++i < n) {
         q.visit(collide(devices[0][i]));
         }*/

        devices.attr("x", function (d) {
            return d.x;
        });
        devices.attr("y", function (d) {
            return d.y;
        });

        labels.attr("x", function(d) {
            return d.x;
        })
            .attr("y", function(d) {
                return d.y;
            });


        images.attr("x", function(d) {
            return d.x;
        })
            .attr("y", function(d) {
                return d.y;
            });


    });

    force.linkStrength(function(connection){
        if (connection.source.group === connection.target.group){
            return 0.1;
        }else{
            return 1;
        }
    });

    /*   force.linkDistance(function(connection){
     if (connection.source.group != connection.target.group){ return 1000;}

     });
     */
    // copied from http://bl.ocks.org/dobbs/1d353282475013f5c156
    function overlap(a,b)
    {
        var   ax1 = a.x, ax2 = a.x+ rect_width
            , ay1 = a.y, ay2 = a.y + rect_height
            , bx1 = b.x, bx2 = b.x+ rect_width
            , by1 = b.y, by2 = b.y + rect_height;

        return   (( bx1 >= ax1 && bx1 <= ax2 ) && ( by1 >= ay1 && by1<ay2 ) //check b top left corner
        || ( bx1 >= ax1 && bx1 <= ax2 ) && ( by2 >= ay1 && by2 <= ay2) //check b bottom left corner
        || ( bx2 >= ax1 && bx2 <= ax2 ) && ( by2 >= ay1 && by2 <= ay2 )//check b bottom right corner
        || ( bx2 >= ax1 && bx2 <= ax2 ) && ( by1 >= ay1 && by1<ay2 ));//check b top right corner
    }

    //starts the force calculations to layout nodes
    // force.start();
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
