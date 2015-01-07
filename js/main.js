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
var height = 600, width = 900, devices, force;
var container = d3.select("body")
                            .append("svg")
                            .attr("height",height)
                            .attr("width",width);
d3.json("json/miserables.json", function(json){
data = json;

    init();
    force.start();

} );



function init(){
    devices = container.selectAll('rect')
        .data(data.nodes)
        .enter()
        .append('rect')
        .attr("width", 500)
        .attr("height",500)

    force = d3.layout.force()
        .nodes(devices)
        .links([])
        .gravity(0.3)
        .charge(-1000)
        .size([width,height]);

}


