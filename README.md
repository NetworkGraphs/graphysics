# graphysics
Graph with Physics, No nodes overlap, morph nodes to properties and groups

# Live demo
https://networkgraphs.github.io/graphysics/

# Features
What is already available
* Layout
  * stochastic cost driven centrality placement
  * Nodes physical collisions, no overlap
  * Neighborhood interaction forces
* SVG
  * shadows and light filters
  * inline html and css with classes
* Mouse and Touch
  * Drag Node position with touch
  * Context menu (touch empty area, then second touch on Node)
  * Hover states with touch Node then touch empty area

## Features Details
* Node
  * hover : highlight neighbors
  * drag node
* Node context menu
  * pin / unpin
  * re-layout pinning current node
* edges
  * labels on path

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
  * Drag and drop .graphml .Graphson
  * Query Gremlin server
* Global hierarchical context menu
* Mouse actions
  * bring neighbors closer
  * reference node / edge Gremlin query
* Performance
  * Analysis
  * Acceleration (wasm)

## Plan Details
* configure sampling number
* notify edges crossing cost failure
* edges with polylines and arrows
* multi-edges
* graph direction placement left to right for edge labels read
* collect muliple css rules in one litteral string


# Development
* Physics engine : Matter.js
* SVG : Raw, no libraries, only trensparent utils

## Limitations and issues
* centrality algo does not necessarily match neighborhood propagation which could result in cross edges cost inconsistencies

# References
Follow project up from [NetworkGraphs/graph2d](https://github.com/NetworkGraphs/graph2d)
## SVG CSS
* http://tinkerpop.apache.org/docs/3.4.4/dev/io/#graphson
* [SVG w3.org](https://www.w3.org/TR/SVG/Overview.html)
* [SVG Filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)
* [SVG Animations](https://svgwg.org/specs/animations/)
* [CSS Filters](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)

## Graph tools and libraries
### Javascript
* [Cytoscape](https://js.cytoscape.org/) : Graph theory (network) library for visualisation and analysis
* [Sigma.js](http://sigmajs.org/) : Sigma is a JavaScript library dedicated to graph drawing. It makes easy to publish networks on Web pages, and allows developers to integrate network exploration in rich Web applications.
### Java
* [Gephi](https://gephi.org/) : State of the art graph editing and analysis, focus on big graphs

