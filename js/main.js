
var height = 600, width = 900;
var container = d3.select("body")
                            .append("svg")
                            .attr("height",height)
                            .attr("width",width);
d3.json("json/miserables.json", function(json){
data = json;
   console.log(data.links.length);
} )

var circle = svg.selectAll("circle")