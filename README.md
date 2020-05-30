# graphysics
Graph with collision Physics, using SVG with style, Interactive Nodes mutations and cost based partial layouting

# Live demo
https://networkgraphs.github.io/graphysics/

# Concept
This project focus on small graphs, which node labels keep readable at all times within the viewport and which export can be integrated in high resolution readable documents.

Its main goal is to provide a fully autonomous front end webapp and webcomponent that requires minimal configuration before usage.

A pure javascript approach is taken, no transpilers, no React, yet powerful litteral strings allow parametric html, css and svg integration in javascript.

Graphics rely on the SVG standard, which is fully interactive through live parameters updates, SVG filters and SVG animation, and allows standard styling techniques with classes and CSS rules.

Deep interactivity is provided by not only moving nodes, but also partial layouting, focused force attractions, and nodes mutation (through groups and properties)

Graph exploration is planned to allow Gremlin query based graph expansion and filtering.

# Features
What is already available
* Layout
  * stochastic cost driven centrality placement
  * Nodes physical collisions, no overlap
  * Neighborhood interaction forces
  * step by step demo layout with colred cost samples
* SVG
  * shadows and light filters
  * inline html and css with classes
* Mouse and Touch
  * Drag Node position with touch
  * Context menu (touch empty area, then second touch on Node)
  * Hover states with touch Node then touch empty area
* Update Graph
  * Drag and drop .graphml and .json in Graphson Format

## Features Details
* Node
  * hover : highlight neighbors
  * drag node
* Node context menu
  * pin / unpin
  * re-layout pinning current node
* edges
  * layout with distance to edges cost
  * labels on path
  * edges arrows (on box-line intersection)
  * labels text path adapts to keep text upwards
  * multi edges support
* Layout Forces
  * Keep Nodes horizontal
  * bring neighbors closer

# Plan
What is planned to be implemented in the Future
* Grouping
  * Hierarchical
  * cross Grouping
* Swap between :
  * proprties
  * nodes
  * groups
* Properties visualisation
  * shape
  * color
  * light
  * filter effect
* Update Graph
  * Query Gremlin server
* Global hierarchical context menu
  * text input for queries
* Update Graph
  * reference node / edge Gremlin query
* Mouse and Touch
  * Pan zoom whole graph
  * Zoom vertices labels
* Performance
  * Analysis
  * Acceleration (wasm)

## Plan Details
* configure sampling number (in config file)
* polyline edges (complex concept, unclear and improvement might not be noticable)
Style in js :
* collect muliple css rules in one litteral string


# Development
* Physics engine : Matter.js (looking for wasm accelerated replacement)
* SVG : No cluttering libraries (SVG.js), no alien syntax (d3.js), parametric litteral strings

## Limitations and issues
* centrality algo and neighborhood propagation algo might need better optimization and rules

# References
Follow project up from [NetworkGraphs/graph2d](https://github.com/NetworkGraphs/graph2d)
## SVG CSS
* http://tinkerpop.apache.org/docs/3.4.4/dev/io/#graphson
* [SVG w3.org](https://www.w3.org/TR/SVG/Overview.html)
* [SVG Filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)
* [SVG Animations](https://svgwg.org/specs/animations/)
* [CSS Filters](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)

## Graph tools and libraries
### web libraries
* [Graphviz](http://www.graphviz.org/) : SVG, dot language, Layout, Static, Community

dot language interpreter (powering plantUML), split in algo modules (dot, neato,...), community forum, wasm port, SVG export, but static layout, no interactivity concept.
* [Vis.js](https://visjs.org/) : Canvas, Layout, interactive

Network module, canvas rendering, physics included, modular. limited interactivity (no context menu,no editing of view characteristics). User cannot fix nodes position. Library requires app dev for integration.
* [Cytoscape](https://js.cytoscape.org/) : Canvas, Viewer only, interactive

Graph theory (network) library for visualisation and analysis. Canvas based, js is rendering only, layouting to be provided by a backend java framework.
* [Sigma.js](http://sigmajs.org/) : WebGL or Canvas, json gexf import, pan zoom highlight

Facilitates web integration by importing standard graph formats (json, gefx), rendering based (webGL or Canvas). Interactivity limited to pan zoom and highlight of neighbor clusters, the user cannot move the nodes.
* [yFiles for html](https://www.yworks.com/products/yfiles-for-html): Commercial, Complex licensing, Html5 and svg, Fully configurable, interactive

Advanced layout algos configuration, Hierarchical grouping, multiple sorts of diagrams and routing techniques. No neighborhood based interactivity (e.g. highlight neighbors). Prohibitively Complex licensing unusual for for Front end js webapps.

### Java application
* [Gephi](https://gephi.org/) : State of the art graph editing and analysis, focus on big graphs

## Graph Databases
Although this project focus is small graphs limited to a number of nodes with viewable labels, the exploration part could be performed on a huge graph that is filtered and partially displayed through user exploration.
* [Tinkerpop](http://tinkerpop.apache.org) Apache project, Reference Graph database server, Gremlin traversal language.

* Graph Database list : OrientDB, ArangoDB, JanusGraph, Neo4j, Microsoft Azure Cosmos, Amazone Neptune
