const inputs = {
    roads: [
        {
            id: 4,
            start: 0,
            end: 1
        },
        {
            id: 5,
            start: 1,
            end: 2
        },
        {
            id: 6,
            start: 2,
            end: 0
        },
        {
            id: 7,
            start: 2,
            end: 3
        }
    ],
    roadNodes: [
        {
            id: 0,
            geoPoint: {
                latitude: 100,
                longitude: 100
            }
        },
        {
            id: 1,
            geoPoint: {
                latitude: 100,
                longitude: 400
            }
        },
        {
            id: 2,
            geoPoint: {
                latitude: 100,
                longitude: 200
            }
        },
    ],
    buildings: [
        {
            id: 3,
            number: 1,
            geoPoint: {
                latitude: 110,
                longitude: 200
            }
        },
    ]
}
class View {
    constructor(width, height) {
        this.body = d3.select('svg');
        this.setSize(width, height);
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.body
            .attr('width', width)
            .attr('height', height)
    }

    update(data, selected = false) {
        let subclass = selected ? '-selected': '';
        this.data = data;
        this.updateRoads(selected ? (this.data.selectedRoads ? this.data.selectedRoads: []): this.data.roads, subclass);
        this.updateBuildings(selected ? (this.data.selectedBuildings ? this.data.selectedBuildings: []) :this.data.buildings, subclass);
        // this.updateStations(data.stations)
    }

    updateRoads(roads, subclass = '') {
        this.body.append("g")
            .attr("class", "roads"+subclass)
            .selectAll("line")
            .data(roads)
            .enter()
            .append("line")
            .attr("stroke-width", function() { return 4 })
            .attr("x1", (road) => this.getElementById(road.start).geoPoint.latitude)
            .attr("y1", (road) => this.getElementById(road.start).geoPoint.longitude)
            .attr("x2", (road) => this.getElementById(road.end).geoPoint.latitude)
            .attr("y2", (road) => this.getElementById(road.end).geoPoint.longitude);
    }

    updateBuildings(buildings, subclass = '') {
        this.body.append("g")
            .attr("class", "buildings" + subclass)
            .selectAll("polygon")
            .data(buildings)
            .enter()
            .append("polygon")
            .attr("stroke-width", function() { return 2 })
            .attr("points", (building) => {
                const top = building.geoPoint.longitude - 10;
                const bottom = building.geoPoint.longitude + 10;
                const left = building.geoPoint.latitude;
                const right = building.geoPoint.latitude + 20;
                return `${left},${top} ${left},${bottom} ${right},${bottom} ${right},${top}`
            })

        this.body.append("g")
            .attr("class", "buildings-text" + subclass)
            .selectAll("text")
            .data(buildings)
            .enter()
            .append("text")
            .text(function(building){
                return building.number;
            })
            .attr("x", function(building) { return building.geoPoint.latitude; })
            .attr("y", function(building) { return building.geoPoint.longitude; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "red");
    }

    getRoadById(id) {
        for (let r of this.data.roads) {
            if (r.id.high === id.high && r.id.low === id.low) {
                return r;
            }
        }
        return undefined;
    }
    getElementById(id) {
        for (let name in this.data) {
            if (name !== 'roads') {
                for (let element of this.data[name]) {
                    if (element.id.high === id.high && element.id.low === id.low) {
                        return element;
                    }
                }
            }
        }
        return undefined;
    }

    renderPath(path) {
        const roadsList = []
        for (let i of path) {
            roadsList.push(this.getRoadById(i.id))
        }
        this.body.append("g")
            .attr("class", "path")
            .selectAll("line")
            .data(roadsList)
            .enter()
            .append("line")
            .attr("stroke-width", function() { return 5 })
            .attr("x1", (road) => this.getElementById(road.start).geoPoint.latitude)
            .attr("y1", (road) => this.getElementById(road.start).geoPoint.longitude)
            .attr("x2", (road) => this.getElementById(road.end).geoPoint.latitude)
            .attr("y2", (road) => this.getElementById(road.end).geoPoint.longitude);
    }

    updateStations(stations) {
        this.body.append("g")
            .attr("class", "station-text")
            .selectAll("text")
            .data(stations)
            .enter()
            .append("text")
            .text(function(building){
                return building.name;
            })
            .attr("x", function(building) { return building.geoPoint.latitude; })
            .attr("y", function(building) { return building.geoPoint.longitude; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "red");
    }

    findObject(street, building) {
        d3.json('api/search?street='+street + (building ? ('&building=' + building): ''), (error, input) => {
            if (error) throw error;
            this.update(input, true);
        });
    }

    findPath(s1, b1, s2, b2) {
        d3.json(`api/path?s1=${s1}&b1=${b1}&s2=${s2}&b2=${b2}`, (error, path) => {
            if (error) throw error;
            this.renderPath(path)
        });
    }
}

const gis = new View(window.innerWidth, window.innerHeight);
d3.json('api/get-all', function(error, input) {
    if (error) throw error;
    gis.update(input);
});
const controls = d3.select('.controls');
const search = d3.select('#search-line');
const path = {
    from: d3.select('#path-line-from'),
    to: d3.select('#path-line-to'),
    type: d3.select('input[name="type-path"]')
}
let isSearch = true;
d3.select('.change').on('click', () => {
    controls.classed('path', isSearch);
    isSearch = !isSearch;
});
d3.select('#find-object').on('click', () => {
    let data = search.node().value.split(',');
    trimArray(data);
    if (data.length === 0) {
        alert('Заполнитк строку поиска!');
    } else if (data.length > 2) {
        alert('Не верный формат ввода');
    } else {
        gis.findObject(data[0], data[1]);
    }
    console.log(data)
});
d3.select('#find-path').on('click', () => {
    let from = path.from.node().value.split(',');
    let to = path.to.node().value.split(',');
    trimArray(from);
    trimArray(to);
    if (from.length === 0) {
        alert('Не указано начало пути');
    } else if (to.length === 0) {
        alert('Не указан конец пути');
    } else if (from.length > 2 || to.length > 2) {
        alert('Не верный формат ввода');
    } else {
        gis.findPath(from[0], from[1], to[0], to[1]);
    }
});

function lol() {
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json("map.json", function(error, graph) {
        if (error) throw error;
        console.log(graph);
        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", function(d) { return color(d.group); })

        node.append("title")
            .text(function(d) { return d.id; });

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);
        //
        // simulation.force("link")
        //     .links(graph.links);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
    });
}

function trimArray(data) {
    for (let i in data) {
        data[i] = data[i].trim();
    }
}
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}